import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { AppTileIcon } from '../AppSvgIcons';

export const AppsMenuGrid: React.FC = () => {
  const { apps, openApp } = useErp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape') {
        setQuery('');
      } else if (e.key === 'Backspace' && query) {
        setQuery((q) => q.slice(0, -1));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setQuery((q) => q + e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query]);

  const filteredApps = query.trim()
    ? apps.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()))
    : apps;

  return (
    <div className="min-h-[calc(100vh-2.75rem)] px-6 py-3 bg-[var(--oe-bg-apps)]">
      {query && (
        <div className="max-w-[420px] mx-auto mb-3 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded shadow-xs text-xs">
          <Search size={13} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps..."
            className="flex-1 focus:outline-none text-slate-800"
          />
          <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700"><X size={13} /></button>
        </div>
      )}

      {/* Centered 6-column OpenEduCat App Switcher Grid matching Real ~63px top / ~126px row pitch */}
      <div className="max-w-[850px] mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-4 pt-1">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            onClick={() => openApp(app.id)}
            className="w-[125px] h-[108px] mx-auto group flex flex-col items-center justify-center text-center focus:outline-none"
          >
            <div className="w-[70px] h-[70px] rounded-[10px] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] border border-slate-100/80 flex items-center justify-center transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <AppTileIcon id={app.id} color={app.color} size={46} />
            </div>
            <span className="mt-2 text-[13px] font-normal text-[#374151] group-hover:text-[var(--oe-brand-primary)] leading-tight max-w-[105px] truncate">
              {app.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
