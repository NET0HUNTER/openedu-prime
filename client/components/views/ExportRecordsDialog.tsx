import React, { useEffect, useState } from 'react';
import type { ModelDef } from '../../../shared/meta/dsl';
import { generateCsv, downloadBlob } from '../../lib/export';
import { Download, X, Search, ArrowUp, ArrowDown } from 'lucide-react';

interface ExportRecordsDialogProps {
  modelDef: ModelDef;
  records: Record<string, any>[];
  selectedIds?: number[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportRecordsDialog: React.FC<ExportRecordsDialogProps> = ({
  modelDef,
  records,
  selectedIds = [],
  isOpen,
  onClose,
}) => {
  const effectiveRecords = selectedIds.length > 0
    ? records.filter((r) => selectedIds.includes(r.id))
    : records;
  const allFieldList = Object.entries(modelDef.fields)
    .filter(([_, f]) => f.type !== 'one2many')
    .map(([k, f]) => ({ name: k, label: f.string, type: f.type }));

  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [importCompatible, setImportCompatible] = useState(false);
  const [template, setTemplate] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState<{ name: string; label: string; type: string }[]>(() =>
    allFieldList.slice(0, Math.min(6, allFieldList.length)),
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredAvailable = allFieldList.filter(
    (f) =>
      !selectedFields.some((s) => s.name === f.name) &&
      (f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const addField = (f: { name: string; label: string; type: string }) => {
    setSelectedFields((prev) => [...prev, f]);
  };

  const removeField = (name: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.name !== name));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= selectedFields.length) return;
    setSelectedFields((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(nxt, 0, item);
      return arr;
    });
  };

  const addAllFields = () => {
    setSelectedFields([...allFieldList]);
  };

  const removeAllFields = () => {
    setSelectedFields([]);
  };

  const applyTemplate = (tpl: string) => {
    setTemplate(tpl);
    if (tpl === 'minimal') setSelectedFields(allFieldList.slice(0, Math.min(3, allFieldList.length)));
    else setSelectedFields(allFieldList.slice(0, Math.min(6, allFieldList.length)));
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const ids = effectiveRecords.map((r) => r.id).filter(Boolean);
    const endpoint = format === 'xlsx' ? '/api/v1/export/xlsx' : '/api/v1/export/csv';
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelDef.name,
          fields: selectedFields.map((f) => ({ name: f.name, label: f.label })),
          ids: ids.length > 0 ? ids : undefined,
        }),
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelDef.name.replace(/\./g, '_')}_export_${dateStr}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      const csvData = generateCsv(effectiveRecords, selectedFields);
      downloadBlob(csvData, `${modelDef.name.replace(/\./g, '_')}_export_${dateStr}.csv`, 'text/csv;charset=utf-8;');
      onClose();
    }
  };

  const recWord = effectiveRecords.length === 1 ? '1 record' : `${effectiveRecords.length} records`;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded shadow-2xl max-w-[780px] w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[15px] text-slate-900">Export Data</h3>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
              {recWord}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        {/* Options strip matching Real OpenEduCat: import-compatible on left, Format on right */}
        <div className="px-5 py-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={importCompatible}
              onChange={(e) => setImportCompatible(e.target.checked)}
              className="rounded accent-[var(--oe-brand-primary)]"
            />
            <span className="font-medium text-slate-700">I want to update data (import-compatible export)</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Export Format</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="accent-[var(--oe-brand-primary)]"
              />
              <span>CSV</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
                className="accent-[var(--oe-brand-primary)]"
              />
              <span>XLSX</span>
            </label>
          </div>
        </div>

        {/* Two-Column Selector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[340px] overflow-hidden">
          {/* Left Column: Available fields */}
          <div className="flex flex-col p-4">
            <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>Available fields</span>
              <button
                type="button"
                onClick={addAllFields}
                className="text-[11px] text-[var(--oe-brand-primary)] hover:underline"
              >
                Add all
              </button>
            </div>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[var(--oe-brand-primary)]"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 border border-slate-200 rounded p-1 bg-white">
              {filteredAvailable.map((f) => (
                <button
                  key={f.name}
                  onClick={() => addField(f)}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="truncate">{f.label}</span>
                  <span className="text-[11px] text-[var(--oe-brand-primary)] font-semibold">+</span>
                </button>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="text-center py-8 text-slate-400">All matching fields added</div>
              )}
            </div>
          </div>

          {/* Right Column: Fields to Export */}
          <div className="flex flex-col p-4 bg-white">
            <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between gap-2">
              <span>Fields to export</span>
              <select
                value={template}
                onChange={(e) => applyTemplate(e.target.value)}
                className="px-2 py-0.5 border border-slate-300 rounded bg-white text-[11px] text-slate-700"
              >
                <option value="default">Template: Default</option>
                <option value="minimal">Template: Minimal (3 cols)</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 border border-slate-200 rounded p-1.5 bg-white">
              {selectedFields.map((f, idx) => (
                <div
                  key={f.name}
                  className="px-2.5 py-1.5 rounded bg-[#f8f9fa] border border-slate-200 flex items-center justify-between text-slate-800"
                >
                  <span className="font-medium truncate">{f.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveField(idx, -1)} className="p-0.5 text-slate-400 hover:text-slate-700" title="Move up">
                      <ArrowUp size={11} />
                    </button>
                    <button type="button" onClick={() => moveField(idx, 1)} className="p-0.5 text-slate-400 hover:text-slate-700" title="Move down">
                      <ArrowDown size={11} />
                    </button>
                    <button
                      onClick={() => removeField(f.name)}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600"
                      title="Remove field"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {selectedFields.length === 0 && (
                <div className="text-center py-12 text-slate-400">Select fields from the left to include in export</div>
              )}
            </div>
            <div className="mt-1.5 text-right">
              <button type="button" onClick={removeAllFields} className="text-[11px] text-slate-500 hover:text-rose-600 hover:underline">
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Left-Aligned Odoo Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={selectedFields.length === 0}
              onClick={handleExport}
              className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={12} />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium"
            >
              Close
            </button>
          </div>
          <div className="text-slate-500 text-[11px]">
            {recWord} · {selectedFields.length} {selectedFields.length === 1 ? 'column' : 'columns'}
          </div>
        </div>
      </div>
    </div>
  );
};
