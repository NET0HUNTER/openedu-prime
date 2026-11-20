import React, { useEffect, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { ModelDef } from '@shared/meta/index';
import type { Rec } from '../../lib/types';
import { formatDate, formatDateTime, formatMoney } from '../../lib/format';

interface ListViewProps {
  modelDef: ModelDef;
  records: Rec[];
  currency: string;
  onOpenRecord: (id: number) => void;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: (allIds: number[]) => void;
}

const PLAIN_STATE_MODELS = new Set(['op.assignment', 'op.exam.session', 'op.exam', 'op.admission', 'op.session']);

export const ListView: React.FC<ListViewProps> = ({
  modelDef, records, currency, onOpenRecord, selectedIds = [], onToggleSelect, onToggleSelectAll,
}) => {
  const defaultCols = modelDef.list.filter((c) => modelDef.fields[c]);
  const [visibleCols, setVisibleCols] = useState<string[]>(defaultCols);
  const [showColPicker, setShowColPicker] = useState(false);

  useEffect(() => {
    setVisibleCols(modelDef.list.filter((c) => modelDef.fields[c]));
    setShowColPicker(false);
  }, [modelDef.name]);

  const cols = visibleCols.filter((c) => modelDef.fields[c]);
  const allSelected = records.length > 0 && records.every((r) => selectedIds.includes(r.id));

  const formatCell = (r: Rec, col: string) => {
    const f = modelDef.fields[col];
    let v = r[col];
    if (col === 'name' && (v === undefined || v === null || v === '' || v === '—')) {
      v = r.display_name || [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ') || v;
    }
    if (v === undefined || v === null || v === '') return '—';
    if (f.type === 'many2one') return r[`${col}__label`] ?? String(v);
    if (f.type === 'many2many') {
      const labels: { id: number; label: string }[] = Array.isArray(r[`${col}__labels`]) ? r[`${col}__labels`] : [];
      if (labels.length === 0) return '—';
      const shown = labels.slice(0, 3);
      const rest = labels.length - shown.length;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {shown.map((lb) => (
            <span key={lb.id} className="px-2 py-0.5 rounded-full bg-[#e9ecef] text-slate-700 text-[11px] font-medium truncate max-w-[140px]">
              {lb.label}
            </span>
          ))}
          {rest > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10.5px] font-semibold">+{rest}</span>
          )}
        </div>
      );
    }
    if (f.type === 'boolean') {
      return (
        <input
          type="checkbox"
          readOnly
          checked={Boolean(v)}
          className="rounded border-slate-300 accent-[var(--oe-brand-primary)] pointer-events-none"
        />
      );
    }
    if (f.type === 'date') return formatDate(v) || '—';
    if (f.type === 'datetime') return formatDateTime(v) || '—';
    if (f.type === 'monetary') {
      return <span className="font-mono font-medium">{formatMoney(v, currency)}</span>;
    }
    if (f.type === 'selection') {
      const label = f.selection?.find(([k]) => k === v)?.[1] ?? String(v);
      if (!['state', 'stage', 'payment_state'].includes(col) || (col === 'state' && PLAIN_STATE_MODELS.has(modelDef.name))) {
        return <span>{label}</span>;
      }
      const tone =
        ['done', 'paid', 'in_payment', 'published', 'approved', 'active', 'deployed', 'signed', 'accept', 'validated', 'present'].includes(String(v))
          ? 'bg-emerald-100 text-emerald-800'
          : ['partial'].includes(String(v))
          ? 'bg-amber-100 text-amber-800'
          : ['cancel', 'cancelled', 'reject', 'rejected', 'refused', 'failed', 'absent'].includes(String(v))
          ? 'bg-rose-100 text-rose-800'
          : ['draft', 'new'].includes(String(v))
          ? 'bg-slate-100 text-slate-700'
          : 'bg-sky-100 text-sky-800';
      return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${tone}`}>{label}</span>;
    }
    return String(v);
  };

  return (
    <div className="w-full bg-white overflow-x-auto min-h-[calc(100vh-6.5rem)]">
      <table className="w-full text-left border-collapse text-[13px] table-auto">
        <thead>
          <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#212529] font-semibold h-[39px]">
            <th className="w-10 px-3.5 py-2 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll?.(records.map((r) => r.id))}
                className="rounded border-slate-300 accent-[var(--oe-brand-primary)]"
              />
            </th>
            {cols.map((c) => {
              const isNum = modelDef.fields[c]?.type === 'monetary';
              return (
                <th key={c} className={`px-3 py-2 whitespace-nowrap text-[13px] font-semibold text-slate-800 ${isNum ? 'text-right' : ''}`}>
                  {modelDef.fields[c]?.string || c}
                </th>
              );
            })}
            <th className="w-10 px-3 py-2 text-center text-slate-400 relative">
              <button
                type="button"
                onClick={() => setShowColPicker(!showColPicker)}
                title="Toggle columns"
                className="hover:text-slate-700 p-1 rounded"
              >
                <ArrowLeftRight size={13} />
              </button>
              {showColPicker && (
                <div className="absolute right-2 top-9 w-56 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded shadow-xl p-2 z-40 text-left font-normal text-xs">
                  <div className="px-1.5 pb-1.5 mb-1 border-b border-slate-100 text-[10.5px] font-bold uppercase text-slate-400">
                    Visible Columns
                  </div>
                  {Object.values(modelDef.fields)
                    .filter((f) => f.type !== 'one2many')
                    .slice(0, 20)
                    .map((f) => {
                      const checked = visibleCols.includes(f.name);
                      return (
                        <label key={f.name} className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-50 rounded cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) setVisibleCols((prev) => [...prev, f.name]);
                              else if (visibleCols.length > 1) setVisibleCols((prev) => prev.filter((x) => x !== f.name));
                            }}
                            className="accent-[var(--oe-brand-primary)]"
                          />
                          <span className="truncate">{f.string}</span>
                        </label>
                      );
                    })}
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.length === 0 ? (
            <tr>
              <td colSpan={cols.length + 2} className="px-4 py-16 text-center text-slate-400 text-sm">
                No records found. Click <strong>New</strong> to create a {modelDef.string}.
              </td>
            </tr>
          ) : (
            records.map((r, idx) => (
              <tr
                key={r.id}
                onClick={() => onOpenRecord(r.id)}
                className={`h-[44px] hover:bg-[#f1f5f9] cursor-pointer transition-colors ${
                  selectedIds.includes(r.id) ? 'bg-blue-50/70' : (idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white')
                }`}
              >
                <td className="w-10 px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => onToggleSelect?.(r.id)}
                    className="rounded border-slate-300 accent-[var(--oe-brand-primary)]"
                  />
                </td>
                {cols.map((c) => {
                  const isNum = modelDef.fields[c]?.type === 'monetary';
                  return (
                    <td key={c} className={`px-3 py-2 text-[#212529] max-w-[260px] truncate font-normal ${isNum ? 'text-right' : ''}`}>
                      {formatCell(r, c)}
                    </td>
                  );
                })}
                <td className="w-10 px-3 py-2 text-center text-slate-300"></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
