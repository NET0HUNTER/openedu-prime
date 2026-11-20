export interface ExportFieldOption {
  name: string;
  label: string;
  type: string;
}

export function generateCsv(records: Record<string, any>[], fields: { name: string; label: string }[]): string {
  const header = fields.map((f) => `"${f.label.replace(/"/g, '""')}"`).join(',');
  const rows = records.map((r) =>
    fields
      .map((f) => {
        let val = r[f.name];
        if (val === undefined || val === null) return '""';
        if (typeof val === 'object') {
          val = r[`${f.name}__label`] || val.display_name || val.name || JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\r\n');
}

export function downloadBlob(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
