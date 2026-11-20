import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Maximize2, Search } from 'lucide-react';
import { useErp } from '../../context/ErpContext';

/**
 * Exact replica of OpenEduCat's bottom-right floating action bar (step_20_shot_1, step_28_shot_1, step_51_shot_1).
 */
export const FloatingActionDock: React.FC = () => {
  const { apps, openApp } = useErp();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [q, setQ] = useState('');

  const matches = apps.filter((a) => a.label.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <div className="fixed right-0 bottom-6 z-40 flex flex-col items-end gap-1.5">
        {open && (
          <div className="flex flex-col gap-1.5 mr-2">
            <button
              onClick={() => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
                else document.exitFullscreen?.();
              }}
              title="Toggle Fullscreen"
              className="w-8 h-8 rounded bg-[var(--oe-brand-primary)] text-white shadow flex items-center justify-center hover:opacity-90"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              title="Quick App Search (Ctrl+K)"
              className="w-8 h-8 rounded bg-[var(--oe-brand-primary)] text-white shadow flex items-center justify-center hover:opacity-90"
            >
              <Search size={14} />
            </button>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-7 h-8 rounded-l bg-[var(--oe-brand-primary)] text-white shadow-md flex items-center justify-center hover:opacity-90"
          title="Quick Tools"
        >
          {open ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        </button>
      </div>

      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 p-4" onClick={() => setPaletteOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-3 border-b border-slate-200">
              <Search size={15} className="text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to module (Admissions, SIS, Exams, Settings)..."
                className="w-full px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {matches.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setPaletteOpen(false); setQ(''); openApp(a.id); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800">{a.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{a.xmlid}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
