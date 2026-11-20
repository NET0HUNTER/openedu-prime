import fs from 'node:fs';

function inspect(model: string) {
  const filePrefix = model.replace(/\./g, '_');
  const fields = JSON.parse(fs.readFileSync(`docs/oec_spec/lms/${filePrefix}.fields_full.json`, 'utf8'));
  console.log(`\n=== ${model} (${Object.keys(fields).length} fields) ===`);
  for (const [name, f] of Object.entries<any>(fields)) {
    if (['id', 'create_uid', 'create_date', 'write_uid', 'write_date', '__last_update', 'message_ids', 'activity_ids'].includes(name)) continue;
    console.log(`  ${name}: ${f.type} (${f.string})${f.required ? ' [REQ]' : ''}${f.selection ? ' ' + JSON.stringify(f.selection) : ''}${f.relation ? ' -> ' + f.relation : ''}`);
  }
}

inspect('op.course');
inspect('op.course.module');
inspect('op.course.enrollment');
