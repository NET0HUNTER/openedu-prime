import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://21058239.o19.oeducat.org';
const DB = '21058239.o19.oeducat.org';

async function main() {
  const args = process.argv.slice(2);
  let moduleName = 'assignments';
  const models: string[] = [];
  for (const a of args) {
    if (a.startsWith('--dir=')) moduleName = a.slice(6);
    else models.push(a);
  }
  const targetDir = path.resolve(`docs/oec_spec/${moduleName}`);
  mkdirSync(targetDir, { recursive: true });

  console.log(`Authenticating with ${BASE_URL}...`);
  const authRes = await fetch(`${BASE_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { db: DB, login: 'admin', password: 'admin' },
    }),
  });

  const cookie = authRes.headers.get('set-cookie');
  const authData = await authRes.json() as any;
  if (!authData.result || !authData.result.uid) {
    console.error('Auth failed:', authData);
    process.exit(1);
  }
  console.log(`Authenticated as UID ${authData.result.uid}.`);

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie || '',
  };

  const viewTypes = ['list', 'form', 'kanban', 'search', 'pivot', 'graph'];

  for (const model of models) {
    console.log(`\nFetching specs for ${model}...`);
    const filePrefix = model.replace(/\./g, '_');

    for (const vType of viewTypes) {
      try {
        const vRes = await fetch(`${BASE_URL}/web/dataset/call_kw/${model}/get_views`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              model,
              method: 'get_views',
              args: [],
              kwargs: { views: [[false, vType]] },
            },
          }),
        });
        const vData = await vRes.json() as any;
        if (vData.result && vData.result.views && vData.result.views[vType]) {
          const arch = vData.result.views[vType].arch;
          writeFileSync(path.join(targetDir, `${filePrefix}.${vType}.xml`), arch);
          console.log(`  Saved ${filePrefix}.${vType}.xml`);
          if (vData.result.models && vData.result.models[model]) {
            writeFileSync(
              path.join(targetDir, `${filePrefix}.fields.json`),
              JSON.stringify(vData.result.models[model], null, 2)
            );
          }
          if (vData.result.views[vType].toolbar) {
            writeFileSync(
              path.join(targetDir, `${filePrefix}.toolbar.json`),
              JSON.stringify(vData.result.views[vType].toolbar, null, 2)
            );
          }
        }
      } catch (e: any) {
        // ignore
      }
    }

    // fields_get
    try {
      const fieldsRes = await fetch(`${BASE_URL}/web/dataset/call_kw/${model}/fields_get`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { model, method: 'fields_get', args: [], kwargs: {} },
        }),
      });
      const fieldsData = await fieldsRes.json() as any;
      if (fieldsData.result) {
        writeFileSync(
          path.join(targetDir, `${filePrefix}.fields_full.json`),
          JSON.stringify(fieldsData.result, null, 2)
        );
        console.log(`  Saved ${filePrefix}.fields_full.json`);
      }
    } catch (e: any) {
      console.error(`  Error fields_get for ${model}:`, e.message);
    }

    // sample data
    try {
      const sampleRes = await fetch(`${BASE_URL}/web/dataset/call_kw/${model}/web_search_read`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { model, method: 'web_search_read', args: [], kwargs: { limit: 5 } },
        }),
      });
      const sampleData = await sampleRes.json() as any;
      if (sampleData.result) {
        writeFileSync(
          path.join(targetDir, `${filePrefix}.sample.json`),
          JSON.stringify(sampleData.result, null, 2)
        );
        console.log(`  Saved ${filePrefix}.sample.json (${sampleData.result.records?.length || 0} records)`);
      }
    } catch (e: any) {
      console.error(`  Error web_search_read for ${model}:`, e.message);
    }
  }

  console.log('\nAll specs fetched successfully!');
}

main().catch(console.error);
