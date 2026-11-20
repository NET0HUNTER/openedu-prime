async function run() {
  const authRes = await fetch('https://21058239.o19.oeducat.org/web/session/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { db: '21058239.o19.oeducat.org', login: 'admin', password: 'admin' },
    }),
  });
  const cookie = authRes.headers.get('set-cookie');
  const res = await fetch('https://21058239.o19.oeducat.org/web/dataset/call_kw/ir.model/search_read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie || '' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model: 'ir.model',
        method: 'search_read',
        args: [[
          '|', '|', '|',
          ['model', 'like', 'op.material%'],
          ['model', 'like', '%slide%'],
          ['model', 'like', '%lesson%'],
          ['model', 'like', 'op.course%']
        ]],
        kwargs: { fields: ['model', 'name'] },
      },
    }),
  });
  const data = await res.json() as any;
  console.log('Result models:', data.result);
}

run().catch(console.error);
