import React, { useState } from 'react';
import { X, Check, Camera, Trash2, Pencil } from 'lucide-react';
import { useErp, applyThemeCss } from '../../context/ErpContext';
import { callKw } from '../../lib/api';

const PRESETS = [
  {
    name: 'OpenEduCat Classic Blue',
    theme_primary: '#1565C0',
    theme_primary_dark: '#0D47A1',
    theme_accent: '#714B67',
    theme_gold: '#F59E0B',
    theme_card_1: '#FCE4EC',
    theme_card_2: '#E8EAF6',
    theme_surface_1: '#FFFFFF',
    theme_surface_2: '#E3F2FD',
    theme_bg: '#f9fbfc',
  },
  {
    name: 'Oshwal Academy (Nairobi & Mombasa)',
    theme_primary: '#1e3f7c',
    theme_primary_dark: '#21407a',
    theme_accent: '#ec1c24',
    theme_gold: '#f4cb00',
    theme_card_1: '#f68b92',
    theme_card_2: '#91a3c7',
    theme_surface_1: '#fcf5ea',
    theme_surface_2: '#cfdfff',
    theme_bg: '#f9fbfc',
  },
];

const FONTS = ['Rubik', 'sans-serif', 'Poppins', 'Lato', 'Merriweather', 'Montserrat', 'OpenSans', 'PlayfairDisplay'];

export const ThemeCustomizerDrawer: React.FC = () => {
  const { activeCompany, themeDrawerOpen, setThemeDrawerOpen, refreshSession, showToast } = useErp();
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  if (!themeDrawerOpen || !activeCompany) return null;

  const updateTheme = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      applyThemeCss({ ...activeCompany, ...patch });
      await callKw('res.company', 'write', { id: activeCompany.id, vals: patch });
      await refreshSession();
      showToast('Theme Customizer updated');
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[395px] max-w-[92vw] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col text-[13px] text-[#212529]">
      {/* Exact clean white header matching step_14_shot_3_top_navbar_theme_customizer_1440 */}
      <div className="h-[52px] px-5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="w-5" />
        <div className="font-bold text-[15px] text-slate-900">Theme Customizer</div>
        <button onClick={() => setThemeDrawerOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Global Settings */}
        <section className="space-y-3">
          <h4 className="font-bold text-[13.5px] text-slate-900 border-b border-slate-100 pb-2">Global Settings</h4>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Menu Style</span>
            <select
              value={activeCompany.menu_style || 'apps'}
              onChange={(e) => updateTheme({ menu_style: e.target.value })}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs w-36"
            >
              <option value="apps">Apps</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Font Type</span>
            <select
              value={activeCompany.theme_font || 'Rubik'}
              onChange={(e) => updateTheme({ theme_font: e.target.value })}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs w-36"
            >
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </section>

        {/* Theme Colors */}
        <section className="space-y-3">
          <h4 className="font-bold text-[13.5px] text-slate-900 border-b border-slate-100 pb-2">Theme Colors</h4>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Brand Color</span>
            <div className="flex items-center gap-2">
              <label className="w-7 h-7 rounded-full border border-slate-300 overflow-hidden cursor-pointer shrink-0" style={{ backgroundColor: activeCompany.theme_primary || '#1565C0' }}>
                <input
                  type="color"
                  value={activeCompany.theme_primary || '#1565C0'}
                  onChange={(e) => updateTheme({ theme_primary: e.target.value })}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <input
                value={activeCompany.theme_primary || '#1565C0'}
                onChange={(e) => updateTheme({ theme_primary: e.target.value })}
                className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Background Color</span>
            <div className="flex items-center gap-2">
              <label className="w-7 h-7 rounded-full border border-slate-300 overflow-hidden cursor-pointer shrink-0" style={{ backgroundColor: activeCompany.theme_bg || '#f9fbfc' }}>
                <input
                  type="color"
                  value={activeCompany.theme_bg || '#f9fbfc'}
                  onChange={(e) => updateTheme({ theme_bg: e.target.value })}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <input
                value={activeCompany.theme_bg || '#f9fbfc'}
                onChange={(e) => updateTheme({ theme_bg: e.target.value })}
                className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Dark Mode</span>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${darkMode ? 'bg-[var(--oe-brand-primary)] justify-end' : 'bg-slate-400 justify-start'}`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700">Chatter Position</span>
            <select
              value={activeCompany.chatter_position || 'sided'}
              onChange={(e) => updateTheme({ chatter_position: e.target.value })}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs w-36"
            >
              <option value="sided">Sided</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </section>

        {/* Apps Menu */}
        <section className="space-y-3">
          <h4 className="font-bold text-[13.5px] text-slate-900 border-b border-slate-100 pb-2">Apps Menu</h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">Apps Background</span>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                <Camera size={28} />
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" className="px-2.5 py-1 rounded bg-[var(--oe-brand-primary)] text-white text-xs"><Pencil size={11} /></button>
                <button type="button" className="px-2.5 py-1 rounded bg-[#dc3545] text-white text-xs"><Trash2 size={11} /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Campus Presets ({activeCompany.name})</div>
          {PRESETS.map((p) => {
            const isCurrent = activeCompany.theme_primary?.toLowerCase() === p.theme_primary.toLowerCase();
            return (
              <button
                key={p.name}
                disabled={saving}
                onClick={() => updateTheme(p)}
                className={`w-full text-left p-2 rounded border transition-all flex items-center justify-between text-xs ${isCurrent ? 'border-[var(--oe-brand-primary)] bg-blue-50/50 font-semibold' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <span>{p.name}</span>
                {isCurrent && <Check size={14} className="text-[var(--oe-brand-primary)]" />}
              </button>
            );
          })}
        </section>
      </div>

      {/* Footer matching step_14_shot_3_top_navbar_theme_customizer_1440 */}
      <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <button
          onClick={() => setThemeDrawerOpen(false)}
          className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
        >
          Save
        </button>
        <button
          onClick={() => updateTheme(PRESETS[0])}
          className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
        >
          Reset To Default
        </button>
      </div>
    </aside>
  );
};
