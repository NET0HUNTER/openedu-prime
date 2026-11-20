import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AppDef, ModelDef, PortalCard, Role } from '@shared/meta/index';
import { apiFetch, setApiContext } from '../lib/api';

export interface RouteState {
  area: 'public' | 'login' | 'apps' | 'module' | 'portal';
  publicPath: string;
  appId?: string;
  model?: string;
  recordId?: number;
  action?: string;
  view?: 'kanban' | 'list' | 'form' | 'calendar' | 'pivot' | 'graph';
  domain?: Record<string, unknown>;
}

interface ErpSessionContextValue {
  loading: boolean;
  seedProfile: 'oshwal' | 'default';
  user: Record<string, any> | null;
  demoUsers: Record<string, any>[];
  companies: Record<string, any>[];
  selectedCompanyIds: number[];
  activeCompany: Record<string, any> | null;
  settings: Record<string, any>;
  systray: { messages: number; activities: number };
  apps: AppDef[];
  models: Record<string, ModelDef>;
  portalCards: PortalCard[];
  publicRoutes: { path: string; label: string; authRequired?: boolean }[];
  route: RouteState;
  viewEditorOpen: boolean;
  themeDrawerOpen: boolean;
  toast: { type: 'success' | 'error'; text: string } | null;
  setViewEditorOpen: (v: boolean) => void;
  setThemeDrawerOpen: (v: boolean) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
  navigate: (next: Partial<RouteState>) => void;
  openApp: (appId: string) => void;
  openModel: (model: string, opts?: { recordId?: number; view?: RouteState['view']; domain?: Record<string, unknown>; appId?: string }) => void;
  toggleCompany: (id: number) => void;
  selectAllCompanies: () => void;
  loginAsDemo: (role: Role) => Promise<void>;
  loginWithEmail: (login: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  term: (word: string) => string;
  currencyCode: string;
}

const ErpContext = createContext<ErpSessionContextValue | null>(null);

export function applyThemeCss(company: Record<string, any> | null | undefined) {
  if (!company) return;
  const root = document.documentElement.style;
  root.setProperty('--oe-brand-primary', company.theme_primary || '#1e3f7c');
  root.setProperty('--oe-brand-primary-dark', company.theme_primary_dark || '#21407a');
  root.setProperty('--oe-brand-accent', company.theme_accent || '#ec1c24');
  root.setProperty('--oe-brand-gold', company.theme_gold || '#f4cb00');
  root.setProperty('--oe-card-coral', company.theme_card_1 || '#f68b92');
  root.setProperty('--oe-card-periwinkle', company.theme_card_2 || '#91a3c7');
  root.setProperty('--oe-surface-cream', company.theme_surface_1 || '#fcf5ea');
  root.setProperty('--oe-surface-pale-blue', company.theme_surface_2 || '#cfdfff');
  root.setProperty('--oe-bg-workspace', company.dark_mode ? '#0f172a' : (company.theme_bg || '#f9fbfc'));
  if (company.theme_font) {
    root.setProperty('--oe-font-family', `'${company.theme_font}', system-ui, sans-serif`);
  }
}

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [seedProfile, setSeedProfile] = useState<'oshwal' | 'default'>('oshwal');
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [demoUsers, setDemoUsers] = useState<Record<string, any>[]>([]);
  const [companies, setCompanies] = useState<Record<string, any>[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [systray, setSystray] = useState({ messages: 0, activities: 0 });
  const [apps, setApps] = useState<AppDef[]>([]);
  const [models, setModels] = useState<Record<string, ModelDef>>({});
  const [portalCards, setPortalCards] = useState<PortalCard[]>([]);
  const [publicRoutes, setPublicRoutes] = useState<{ path: string; label: string; authRequired?: boolean }[]>([]);
  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const parseRouteFromLocation = (): RouteState => {
    const p = window.location.pathname;
    if (p === '/web/login') return { area: 'login', publicPath: '/' };
    if (p.startsWith('/my')) return { area: 'portal', publicPath: '/' };
    if (p.startsWith('/openeducat')) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryRecordId = searchParams.get('recordId') ? Number(searchParams.get('recordId')) : undefined;
      const queryView = (searchParams.get('view') as any) || (searchParams.get('view_type') as any);

      const parts = p.replace(/^\/openeducat\/?/, '').split('/').filter(Boolean);
      let appId: string | undefined = parts[0];
      let model: string | undefined = parts[1];
      let pathRecordId: number | undefined = parts[2] ? Number(parts[2]) : undefined;

      // Handle direct routes like /openeducat/student/1
      if (parts[1] && !isNaN(Number(parts[1])) && !pathRecordId) {
        pathRecordId = Number(parts[1]);
        model = undefined;
      }

      if (appId && appId !== 'apps_menu') {
        let action: any = undefined;
        if (!model) {
          if (appId === 'settings') action = 'settings_panel';
          else if (appId === 'whatsapp') action = 'whatsapp_inbox';
          else if (appId === 'dashboards') action = 'bi_dashboard';
          else if (appId === 'kpi_dashboard') action = 'kpi_dashboard';
          else if (appId === 'aio') action = 'ai_playground';
          else if (appId === 'courses' || appId === 'course') {
            appId = 'lms';
            model = 'op.course';
          } else if (appId === 'students' || appId === 'student') {
            appId = 'students';
            model = 'op.student';
          }
        } else {
          if (model === 'course' || model === 'courses') model = 'op.course';
          if (model === 'student' || model === 'students') model = 'op.student';
        }

        const effectiveRecordId = queryRecordId ?? pathRecordId;
        const effectiveView = queryView ?? (effectiveRecordId ? 'form' : (model === 'op.course' ? 'kanban' : 'list'));

        return {
          area: 'module',
          appId,
          action,
          model: model || undefined,
          recordId: isNaN(effectiveRecordId as number) ? undefined : effectiveRecordId,
          view: effectiveView,
          publicPath: '/',
        };
      }
      return { area: 'apps', publicPath: '/' };
    }
    return { area: 'public', publicPath: p || '/' };
  };

  const [route, setRoute] = useState<RouteState>(parseRouteFromLocation);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRouteFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast((cur) => (cur?.text === text ? null : cur)), 4200);
  }, []);

  const loadForUser = useCallback(async (uid?: number, compIds?: number[]) => {
    setApiContext({ userId: uid, companyIds: compIds });
    const [sess, menuData, modelData] = await Promise.all([
      apiFetch<any>('/api/v1/meta/session'),
      apiFetch<any>('/api/v1/meta/menus'),
      apiFetch<any>('/api/v1/meta/models'),
    ]);
    setSeedProfile(sess.seedProfile);
    setUser(sess.user);
    setDemoUsers(sess.demoUsers ?? []);
    setCompanies(sess.companies ?? []);
    setSettings(sess.settings ?? {});
    setSystray(sess.systray ?? { messages: 0, activities: 0 });
    setApps(menuData.apps ?? []);
    setPublicRoutes(menuData.publicRoutes ?? []);
    setPortalCards(menuData.portalCards ?? []);
    setModels(modelData.models ?? {});
    const allowed: number[] = compIds && compIds.length
      ? compIds
      : (sess.user?.company_ids?.length ? sess.user.company_ids : (sess.companies ?? []).map((c: any) => c.id));
    setSelectedCompanyIds(allowed);
    setApiContext({ userId: sess.user?.id, companyIds: allowed });
    const activeCo = (sess.companies ?? []).find((c: any) => c.id === allowed[0]) ?? sess.companies?.[0];
    applyThemeCss(activeCo);
    return sess.user;
  }, []);

  useEffect(() => {
    const savedUid = Number(localStorage.getItem('oe_uid') || 0) || undefined;
    loadForUser(savedUid).finally(() => setLoading(false));
  }, [loadForUser]);

  const activeCompany = companies.find((c) => c.id === selectedCompanyIds[0]) ?? companies[0] ?? null;

  useEffect(() => {
    applyThemeCss(activeCompany);
  }, [activeCompany]);

  const navigate = useCallback((next: Partial<RouteState>) => {
    setRoute((prev) => {
      const merged = { ...prev, ...next };
      let url = '/';
      if (merged.area === 'public') url = merged.publicPath || '/';
      else if (merged.area === 'login') url = '/web/login';
      else if (merged.area === 'portal') url = '/my';
      else if (merged.area === 'apps') url = '/openeducat/apps_menu';
      else if (merged.area === 'module') {
        const baseApp = merged.appId || 'app';
        const modelSegment = merged.model && merged.model !== baseApp ? `/${merged.model}` : '';
        const recSegment = merged.recordId ? `/${merged.recordId}` : '';
        const viewParam = merged.view && merged.view !== 'list' ? `?view=${merged.view}` : '';
        url = `/openeducat/${baseApp}${modelSegment}${recSegment}${viewParam}`;
      }
      window.history.pushState({}, '', url);
      return merged;
    });
  }, []);

  const openApp = useCallback((appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    if (app.defaultAction) {
      navigate({ area: 'module', appId: app.id, action: app.defaultAction, model: undefined, recordId: undefined });
      return;
    }
    const model = app.defaultModel || app.menus[0]?.model;
    const def = model ? models[model] : undefined;
    const firstMenuForModel = app.menus.find((m) => m.model === model) ?? app.menus[0];
    const view = firstMenuForModel?.defaultView ?? def?.views[0] ?? 'list';
    navigate({ area: 'module', appId: app.id, model, action: undefined, recordId: undefined, view, domain: firstMenuForModel?.domain });
  }, [apps, models, navigate]);

  useEffect(() => {
    if (apps.length === 0) return;
    if (route.area === 'module' && route.appId && !route.model && !route.action) {
      const app = apps.find((a) => a.id === route.appId);
      if (app) openApp(app.id);
    }
  }, [apps, route.area, route.appId, route.model, route.action, openApp]);

  const openModel = useCallback((model: string, opts: { recordId?: number; view?: RouteState['view']; domain?: Record<string, unknown>; appId?: string } = {}) => {
    const def = models[model];
    const ownerApp = opts.appId || apps.find((a) => a.defaultModel === model || a.menus.some((m) => m.model === model))?.id || 'sis';
    const view = opts.recordId ? 'form' : (opts.view ?? def?.views[0] ?? 'list');
    navigate({ area: 'module', appId: ownerApp, model, action: undefined, recordId: opts.recordId, view, domain: opts.domain });
  }, [apps, models, navigate]);

  const toggleCompany = useCallback((id: number) => {
    setSelectedCompanyIds((prev) => {
      const next = prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [id, ...prev];
      setApiContext({ userId: user?.id, companyIds: next });
      return next;
    });
  }, [user?.id]);

  const selectAllCompanies = useCallback(() => {
    const all = companies.map((c) => c.id);
    setSelectedCompanyIds(all);
    setApiContext({ userId: user?.id, companyIds: all });
  }, [companies, user?.id]);

  const loginAsDemo = useCallback(async (role: Role) => {
    const res = await apiFetch<{ user: Record<string, any>; redirect: string }>('/api/v1/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    localStorage.setItem('oe_uid', String(res.user.id));
    await loadForUser(res.user.id);
    showToast(`Logged in as ${res.user.name} (${res.user.role})`);
    if (res.redirect === '/my') navigate({ area: 'portal' });
    else navigate({ area: 'apps' });
  }, [loadForUser, navigate, showToast]);

  const loginWithEmail = useCallback(async (login: string) => {
    const res = await apiFetch<{ user: Record<string, any>; redirect: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login }),
    });
    localStorage.setItem('oe_uid', String(res.user.id));
    await loadForUser(res.user.id);
    showToast(`Welcome, ${res.user.name}`);
    if (res.redirect === '/my') navigate({ area: 'portal' });
    else navigate({ area: 'apps' });
  }, [loadForUser, navigate, showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('oe_uid');
    navigate({ area: 'login' });
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    await loadForUser(user?.id, selectedCompanyIds);
  }, [loadForUser, selectedCompanyIds, user?.id]);

  const term = useCallback((word: string) => {
    const map: Record<string, string | undefined> = {
      Program: settings.term_program,
      Course: settings.term_course,
      Batch: settings.term_batch,
      Subject: settings.term_subject,
      Faculty: settings.term_faculty,
      Student: settings.term_student,
    };
    return map[word] || word;
  }, [settings]);

  const currencyCode = activeCompany?.currency || 'KES';

  return (
    <ErpContext.Provider value={{
      loading, seedProfile, user, demoUsers, companies, selectedCompanyIds, activeCompany, settings, systray,
      apps, models, portalCards, publicRoutes, route, viewEditorOpen, themeDrawerOpen, toast,
      setViewEditorOpen, setThemeDrawerOpen, showToast, navigate, openApp, openModel,
      toggleCompany, selectAllCompanies, loginAsDemo, loginWithEmail, logout, refreshSession, term, currencyCode,
    }}>
      {children}
    </ErpContext.Provider>
  );
};

export function useErp() {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error('useErp must be used inside ErpProvider');
  return ctx;
}
