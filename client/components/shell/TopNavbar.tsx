import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutGrid, MessageSquare, Clock, Wrench, Settings, Check,
  LogOut, Globe, FileCode2, RefreshCw, UserCheck, HelpCircle, Keyboard, UserCog,
  AlertTriangle, Hash,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { apiFetch, callKw } from '../../lib/api';
import { formatShortDate } from '../../lib/format';
import { AppTileIcon } from '../AppSvgIcons';

const FRIENDLY_MODEL_LABELS: Record<string, string> = {
  'op.admission': 'Admission Application',
  'op.student': 'Student Profile',
  'op.exam': 'Exam Schedule',
  'account.move': 'Student Invoice',
  'helpdesk.ticket': 'Helpdesk Ticket',
  'crm.lead': 'Admissions Lead',
  'op.attendance.sheet': 'Attendance Sheet',
};

export const TopNavbar: React.FC = () => {
  const {
    user, companies, selectedCompanyIds, activeCompany, systray, apps, route,
    viewEditorOpen, setViewEditorOpen, themeDrawerOpen, setThemeDrawerOpen,
    navigate, openApp, openModel, toggleCompany, selectAllCompanies, logout, refreshSession, showToast, seedProfile,
  } = useErp();

  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [msgTab, setMsgTab] = useState<'all' | 'chats' | 'channels'>('all');
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentChannels, setRecentChannels] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('English (US)');
  const [headerWidth, setHeaderWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setHeaderWidth(entry.contentRect.width);
      }
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  const maxInlineGroups = headerWidth < 820 ? 1 : headerWidth < 1040 ? 3 : headerWidth < 1240 ? 4 : 6;
  const LANGUAGES = [
    'Arabic / الْعَرَبيّة',
    'Chinese, Simplified / 简体中文',
    'Dutch / Nederlands',
    'English (US)',
    'French / Français',
    'German / Deutsch',
    'Indonesian / Bahasa Indonesia',
    'Italian / Italiano',
    'Portuguese / Português',
    'Russian / русский язык',
    'Spanish / Español',
    'Vietnamese / Tiếng Việt',
  ];
  const isAppsScreen = route.area === 'apps';
  const currentApp = route.area === 'module' ? apps.find((a) => a.id === route.appId) : undefined;

  const menuGroups = currentApp
    ? Array.from(new Set(currentApp.menus.map((m) => m.group || currentApp.label)))
    : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDrop(null);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDrop(null);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (openDrop === 'messages') {
      Promise.all([
        callKw('mail.message', 'search_read', { limit: 15 }).catch(() => ({ records: [] })),
        callKw('discuss.channel', 'search_read', { limit: 10 }).catch(() => ({ records: [] })),
      ]).then(([mRes, cRes]) => {
        setRecentMessages(mRes.records ?? []);
        setRecentChannels(cRes.records ?? []);
      });
    } else if (openDrop === 'activities') {
      callKw('mail.activity', 'search_read', { limit: 40 })
        .then((res) => setRecentActivities(res.records ?? []))
        .catch(() => setRecentActivities([]));
    }
  }, [openDrop]);

  const handleSeedSwitch = async (profile: 'oshwal' | 'default') => {
    await apiFetch('/api/v1/admin/switch-seed', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
    await refreshSession();
    setOpenDrop(null);
    showToast(`Switched active database seed to ${profile === 'oshwal' ? 'Oshwal Academy (OERB)' : 'Standard OpenEduCat'}`);
    navigate({ area: 'apps' });
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  type ActivityGroup = { model: string; label: string; late: number; today: number; future: number };
  const groupedActivities: ActivityGroup[] = Array.from(
    recentActivities.reduce<Map<string, ActivityGroup>>((acc, act) => {
      const m = String(act.res_model || 'mail.activity');
      if (act.state === 'done') return acc;
      const cur = acc.get(m) ?? { model: m, label: FRIENDLY_MODEL_LABELS[m] || m, late: 0, today: 0, future: 0 };
      const dl = String(act.date_deadline || todayIso).slice(0, 10);
      if (dl < todayIso) cur.late += 1;
      else if (dl === todayIso) cur.today += 1;
      else cur.future += 1;
      acc.set(m, cur);
      return acc;
    }, new Map()).values(),
  );

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 h-[46px] px-3 flex items-center justify-between gap-2 text-[13px] select-none ${
        isAppsScreen ? 'bg-[var(--oe-bg-apps)]' : 'bg-white border-b border-slate-200/90'
      }`}
    >
      {/* Left: App Icon + Module Name + Flat Horizontal Menus */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {!isAppsScreen && (
          <>
            <button
              onClick={() => { setOpenDrop(null); navigate({ area: 'apps' }); }}
              title="App Switcher"
              className="p-1 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"
            >
              {currentApp ? (
                <AppTileIcon id={currentApp.id} color={currentApp.color} size={22} />
              ) : (
                <LayoutGrid size={17} />
              )}
            </button>

            {currentApp && (
              <>
                <button
                  onClick={() => openApp(currentApp.id)}
                  className="px-1.5 py-1 rounded hover:bg-slate-100 text-[15px] font-medium text-slate-800 shrink-0 truncate max-w-[105px] sm:max-w-[130px]"
                >
                  {currentApp.label}
                </button>

                <nav className="flex items-center gap-0.5 ml-1 min-w-0 overflow-visible">
                  {menuGroups.slice(0, maxInlineGroups).map((grp) => {
                    const items = currentApp.menus.filter((m) => (m.group || currentApp.label) === grp);
                    if (items.length === 1) {
                      const item = items[0];
                      const shortLabel = item.label.length > 18 ? grp : item.label;
                      return (
                        <button
                          key={grp}
                          onClick={() => {
                            setOpenDrop(null);
                            if (item.action) navigate({ area: 'module', appId: currentApp.id, action: item.action, model: undefined, recordId: undefined });
                            else if (item.model) navigate({ area: 'module', appId: currentApp.id, model: item.model, action: undefined, recordId: undefined, domain: item.domain, view: item.defaultView });
                          }}
                          className="px-2 py-1 rounded hover:bg-slate-100 text-[13px] text-slate-700 font-normal whitespace-nowrap shrink-0 max-w-[110px] truncate"
                        >
                          {shortLabel}
                        </button>
                      );
                    }
                    return (
                      <div key={grp} className="relative shrink-0">
                        <button
                          onClick={() => setOpenDrop(openDrop === `grp:${grp}` ? null : `grp:${grp}`)}
                          className={`px-2 py-1 rounded hover:bg-slate-100 text-[13px] font-normal whitespace-nowrap max-w-[110px] truncate ${
                            openDrop === `grp:${grp}` ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {grp}
                        </button>
                        {openDrop === `grp:${grp}` && (
                          <div className="absolute left-0 mt-1 w-60 max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded shadow-lg py-1 z-50">
                            {items.map((item) => (
                              <button
                                key={item.label}
                                onClick={() => {
                                  setOpenDrop(null);
                                  if (item.action) navigate({ area: 'module', appId: currentApp.id, action: item.action, model: undefined, recordId: undefined });
                                  else if (item.model) navigate({ area: 'module', appId: currentApp.id, model: item.model, action: undefined, recordId: undefined, domain: item.domain, view: item.defaultView });
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 text-[13px] text-slate-700 flex items-center justify-between"
                              >
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {menuGroups.length > maxInlineGroups && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenDrop(openDrop === 'grp:__more__' ? null : 'grp:__more__')}
                        className={`px-2 py-1 rounded hover:bg-slate-100 text-[13px] font-normal whitespace-nowrap ${
                          openDrop === 'grp:__more__' ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        More ▾
                      </button>
                      {openDrop === 'grp:__more__' && (
                        <div className="absolute right-0 sm:left-0 sm:right-auto mt-1 w-64 max-w-[calc(100vw-24px)] max-h-[75vh] overflow-y-auto bg-white border border-slate-200 rounded shadow-xl py-1.5 z-50">
                          {menuGroups.slice(maxInlineGroups).map((grp) => {
                            const items = currentApp.menus.filter((m) => (m.group || currentApp.label) === grp);
                            return (
                              <div key={grp} className="border-b border-slate-100 last:border-b-0 py-1">
                                <div className="px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                                  {grp}
                                </div>
                                {items.map((item) => (
                                  <button
                                    key={item.label}
                                    onClick={() => {
                                      setOpenDrop(null);
                                      if (item.action) navigate({ area: 'module', appId: currentApp.id, action: item.action, model: undefined, recordId: undefined });
                                      else if (item.model) navigate({ area: 'module', appId: currentApp.id, model: item.model, action: undefined, recordId: undefined, domain: item.domain, view: item.defaultView });
                                    }}
                                    className="w-full text-left px-4 py-1 hover:bg-slate-100 text-[12.5px] text-slate-700"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </nav>
              </>
            )}
          </>
        )}
      </div>

      {/* Right Systray matching Real OpenEduCat step_133_shot_2 & step_133_shot_3 */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Messages Popover */}
        <div className="relative">
          <button
            onClick={() => setOpenDrop(openDrop === 'messages' ? null : 'messages')}
            className={`relative p-1.5 rounded hover:bg-black/5 text-slate-700 ${openDrop === 'messages' ? 'bg-slate-100' : ''}`}
            title="Messages"
          >
            <MessageSquare size={17} />
            {systray.messages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#198754] text-white text-[10px] font-bold px-1 rounded-full leading-tight">
                {systray.messages}
              </span>
            )}
          </button>

          {openDrop === 'messages' && (
            <div className="absolute right-0 mt-1.5 w-[440px] max-w-[92vw] bg-white border border-slate-200 rounded shadow-xl z-50 overflow-hidden text-[12.5px]">
              <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1">
                  {([
                    ['all', 'All'],
                    ['chats', 'Chats'],
                    ['channels', 'Channels'],
                  ] as const).map(([k, lbl]) => (
                    <button
                      key={k}
                      onClick={() => setMsgTab(k)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        msgTab === k
                          ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold border border-[var(--oe-brand-primary)]/30'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setOpenDrop(null); openModel('discuss.channel', { appId: 'discuss' }); }}
                  className="text-[var(--oe-brand-primary)] hover:underline text-xs font-medium"
                >
                  New Message
                </button>
              </div>
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {msgTab === 'channels' ? (
                  recentChannels.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No channels configured.</div>
                  ) : recentChannels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => { setOpenDrop(null); openModel('discuss.channel', { recordId: ch.id, appId: 'discuss' }); }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Hash size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{ch.name}</div>
                        <div className="text-[11.5px] text-slate-500 truncate">{ch.description || `${ch.members_count || 0} members`}</div>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-[#198754] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    </button>
                  ))
                ) : recentMessages.filter((m) => msgTab === 'all' || m.message_type === 'comment').length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No unread messages.</div>
                ) : (
                  recentMessages
                    .filter((m) => msgTab === 'all' || m.message_type === 'comment')
                    .slice(0, 8)
                    .map((m, idx) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setOpenDrop(null);
                          if (m.res_model && m.res_id) openModel(m.res_model, { recordId: m.res_id });
                          else navigate({ area: 'module', appId: 'discuss', model: 'mail.message' });
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start gap-3"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                          m.message_type === 'notification' ? 'bg-amber-500' : idx % 2 === 0 ? 'bg-[var(--oe-brand-primary)]' : 'bg-purple-600'
                        }`}>
                          {m.message_type === 'notification' ? <AlertTriangle size={15} /> : (m.author_id__label || 'OE').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 truncate">
                              {FRIENDLY_MODEL_LABELS[m.res_model] || m.author_id__label || m.res_model || 'System'}
                            </span>
                            <span className="text-[11px] text-slate-400 shrink-0">{formatShortDate(m.date)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-[11.5px] text-slate-600 truncate">{m.body}</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#198754] shrink-0" />
                          </div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activities Popover */}
        <div className="relative">
          <button
            onClick={() => setOpenDrop(openDrop === 'activities' ? null : 'activities')}
            className={`relative p-1.5 rounded hover:bg-black/5 text-slate-700 ${openDrop === 'activities' ? 'bg-slate-100' : ''}`}
            title="Activities"
          >
            <Clock size={17} />
            {systray.activities > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#198754] text-white text-[10px] font-bold px-1 rounded-full leading-tight">
                {systray.activities}
              </span>
            )}
          </button>

          {openDrop === 'activities' && (
            <div className="absolute right-0 mt-1.5 w-[360px] max-w-[92vw] bg-white border border-slate-200 rounded shadow-xl z-50 overflow-hidden text-[12.5px]">
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                {groupedActivities.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    Congratulations, you&apos;re done with your activities!
                  </div>
                ) : (
                  groupedActivities.map((g) => (
                    <button
                      key={g.model}
                      onClick={() => { setOpenDrop(null); openModel(g.model); }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] flex items-center justify-center shrink-0">
                        <Clock size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{g.label}</div>
                        <div className="text-[11.5px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <span className={g.late > 0 ? 'text-rose-600 font-semibold' : ''}>{g.late} Late</span>
                          <span>{g.today} Today</span>
                          <span>{g.future} Future</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => { setOpenDrop(null); navigate({ area: 'module', appId: 'calendar', model: 'mail.activity', action: undefined, view: 'list' }); }}
                className="w-full px-3.5 py-2 border-t border-slate-200 bg-slate-50 hover:bg-slate-100 text-center text-[var(--oe-brand-primary)] font-semibold text-xs"
              >
                View all activities
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setViewEditorOpen(!viewEditorOpen)}
          className={`p-1.5 rounded hover:bg-black/5 text-[var(--oe-brand-primary)] ${viewEditorOpen ? 'bg-black/10' : ''}`}
          title="View Editor"
        >
          <Wrench size={15} />
        </button>

        <button
          onClick={() => setThemeDrawerOpen(!themeDrawerOpen)}
          className={`p-1.5 rounded hover:bg-black/5 text-[var(--oe-brand-primary)] ${themeDrawerOpen ? 'bg-black/10' : ''}`}
          title="Theme Customizer"
        >
          <Settings size={16} />
        </button>

        {/* Company / Campus Switcher */}
        <div className="relative">
          <button
            onClick={() => setOpenDrop(openDrop === 'company' ? null : 'company')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 text-slate-800 font-normal text-[13px] max-w-[170px]"
          >
            <span className="truncate">{activeCompany?.code || activeCompany?.name || 'OpenEduCat'}</span>
          </button>

          {openDrop === 'company' && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50">
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Campuses / Companies</span>
                <button onClick={selectAllCompanies} className="text-xs text-[var(--oe-brand-primary)] font-medium hover:underline">
                  Select All
                </button>
              </div>
              {companies.map((c) => {
                const checked = selectedCompanyIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCompany(c.id)}
                    className={`w-full text-left px-2.5 py-2 rounded flex items-start gap-2.5 text-xs hover:bg-slate-50 ${checked ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-600'}`}
                  >
                    <input type="checkbox" readOnly checked={checked} className="mt-0.5 accent-[var(--oe-brand-primary)]" />
                    <div className="min-w-0">
                      <div className="truncate">{c.name}</div>
                      <div className="text-[10.5px] text-slate-400 truncate">{c.code} · {c.city}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Square User Avatar with Green Online Dot */}
        <div className="relative">
          <button
            onClick={() => setOpenDrop(openDrop === 'user' ? null : 'user')}
            className="relative flex items-center"
          >
            <div className="w-7 h-7 rounded bg-[var(--oe-brand-primary)] text-white flex items-center justify-center font-bold text-xs">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#198754] border-2 border-white" />
          </button>

          {openDrop === 'user' && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-[12.5px] max-h-[82vh] overflow-y-auto">
              <div className="px-3.5 py-1.5 border-b border-slate-100">
                <div className="font-semibold text-slate-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.login} · <span className="uppercase font-semibold">{user?.role}</span></div>
              </div>

              <div className="py-1 border-b border-slate-100">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setSelectedLang(lang); setOpenDrop(null); showToast(`Language set to ${lang}`); }}
                    className="w-full text-left px-3.5 py-1 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <span className="truncate">{lang}</span>
                    {selectedLang === lang && <Check size={13} className="text-slate-900 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="py-1 border-b border-slate-100">
                <a
                  href="https://www.openeducat.org/documentation"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpenDrop(null)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <HelpCircle size={13} /> Help
                </a>
                <button
                  onClick={() => { setOpenDrop(null); showToast('Type on Apps screen to filter or use Alt+K'); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span className="flex items-center gap-2"><Keyboard size={13} /> Shortcuts</span>
                  <span className="text-[11px] font-mono text-slate-400">CTRL+K</span>
                </button>
              </div>

              <div className="py-1 border-b border-slate-100">
                <div className="px-3.5 py-1.5 flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#198754] inline-block" />
                    <span>Online</span>
                  </span>
                </div>
                <button
                  onClick={() => { setOpenDrop(null); navigate({ area: 'module', appId: 'settings', action: 'settings_panel', model: undefined, recordId: undefined }); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <UserCog size={13} /> My Preferences
                </button>
                <button
                  onClick={() => { setOpenDrop(null); navigate({ area: 'public', publicPath: '/' }); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Globe size={13} /> Public Website
                </button>
                <button
                  onClick={() => { setOpenDrop(null); navigate({ area: 'portal' }); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <UserCheck size={13} /> Student / Parent Portal (/my)
                </button>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <FileCode2 size={13} /> OpenAPI 3.1 Docs
                </a>
              </div>

              <div className="py-1 border-b border-slate-100">
                <div className="px-3.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase">Seed Profile</div>
                <button
                  onClick={() => handleSeedSwitch('oshwal')}
                  className={`w-full text-left px-3.5 py-1 hover:bg-slate-50 flex items-center justify-between text-xs ${seedProfile === 'oshwal' ? 'text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-1.5"><RefreshCw size={12} /> Oshwal Academy</span>
                  {seedProfile === 'oshwal' && <Check size={12} />}
                </button>
                <button
                  onClick={() => handleSeedSwitch('default')}
                  className={`w-full text-left px-3.5 py-1 hover:bg-slate-50 flex items-center justify-between text-xs ${seedProfile === 'default' ? 'text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-1.5"><RefreshCw size={12} /> Standard OpenEduCat</span>
                  {seedProfile === 'default' && <Check size={12} />}
                </button>
              </div>

              <button
                onClick={() => { setOpenDrop(null); logout(); }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-medium"
              >
                <LogOut size={13} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
