import React, { useCallback, useEffect, useState } from 'react';
import { Undo2, Redo2, Plus, Monitor, Folder, ChevronDown, Kanban, List } from 'lucide-react';
import type { ViewType } from '@shared/meta/index';
import { useErp } from '../../context/ErpContext';
import { callKw, apiFetch } from '../../lib/api';
import type { Rec } from '../../lib/types';
import { ControlPanel } from './ControlPanel';
import { KanbanView } from './KanbanView';
import { ListView } from './ListView';
import { FormView } from './FormView';
import { CalendarView, PivotGraphView } from './CalendarPivotGraph';

const HIDE_DEFAULT_PANEL_MODELS = new Set(['op.student', 'op.course']);

export const UniversalModuleWorkspace: React.FC = () => {
  const { models, route, navigate, selectedCompanyIds, currencyCode, viewEditorOpen, setViewEditorOpen, showToast, openModel } = useErp();
  const modelName = route.model || 'op.student';
  const modelDef = models[modelName];
  const activeView: ViewType = route.view ?? modelDef?.views[0] ?? 'list';

  const [records, setRecords] = useState<Rec[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<string | undefined>(undefined);
  const [panelFilter, setPanelFilter] = useState<Record<string, unknown>>({});
  const [showSearchPanel, setShowSearchPanel] = useState(
    Boolean(modelDef?.search.panel && !HIDE_DEFAULT_PANEL_MODELS.has(modelName)),
  );
  const [quickFilter, setQuickFilter] = useState<{ label: string; domain: Record<string, unknown> } | null>(null);
  const [panelItems, setPanelItems] = useState<{ id: unknown; label: string; count?: number }[]>([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [smartButtons, setSmartButtons] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saveSignal, setSaveSignal] = useState(0);
  const [discardSignal, setDiscardSignal] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [studioTab, setStudioTab] = useState<'add' | 'view'>('view');
  const [studioCanCreate, setStudioCanCreate] = useState(true);
  const [studioQuickCreate, setStudioQuickCreate] = useState(true);
  const [studioShowInvisible, setStudioShowInvisible] = useState(false);

  const loadData = useCallback(async () => {
    if (!modelDef) return;
    const domain = { ...(route.domain ?? {}), ...panelFilter, ...(quickFilter?.domain ?? {}) };
    const res = await callKw(modelDef.name, 'search_read', { domain, search });
    setRecords(res.records ?? []);
    setTotal(res.total ?? 0);
  }, [modelDef, route.domain, panelFilter, quickFilter, search, selectedCompanyIds]);

  useEffect(() => {
    setRecords([]);
    setTotal(0);
    setCreatingNew(false);
    setIsFormDirty(false);
    setPanelFilter({});
    setQuickFilter(null);
    setSmartButtons([]);
    setSelectedIds([]);
    setShowSearchPanel(Boolean(modelDef?.search.panel && !HIDE_DEFAULT_PANEL_MODELS.has(modelName)));
  }, [modelName, modelDef]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!modelDef?.search.panel) {
      setPanelItems([]);
      return;
    }
    const panelKey = modelDef.search.panel;
    const pf = modelDef.fields[panelKey];
    callKw(modelDef.name, 'search_read', { domain: route.domain ?? {}, limit: 250 })
      .then(async (baseRes) => {
        const allRecs: Rec[] = baseRes.records ?? [];
        const counts = new Map<string, number>();
        for (const r of allRecs) {
          const val = r[panelKey];
          if (val !== undefined && val !== null && val !== '') {
            counts.set(String(val), (counts.get(String(val)) ?? 0) + 1);
          }
        }
        if (pf?.type === 'selection' && pf.selection) {
          setPanelItems(pf.selection.map(([k, l]) => ({ id: k, label: l, count: counts.get(String(k)) ?? 0 })));
        } else if (pf?.relation) {
          const rel = await callKw(pf.relation, 'name_search', { search: '' }).catch(() => ({ options: [] }));
          setPanelItems((rel.options ?? []).map((o: any) => ({ id: o.id, label: o.label, count: counts.get(String(o.id)) ?? 0 })));
        } else {
          const distinct = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          setPanelItems(distinct.map(([k, cnt]) => ({ id: k, label: k, count: cnt })));
        }
      })
      .catch(() => setPanelItems([]));
  }, [modelDef, route.domain]);

  if (!modelDef) {
    return <div className="p-8 text-sm text-slate-500">Loading model metadata ({modelName})...</div>;
  }

  const showForm = creatingNew || Boolean(route.recordId) || activeView === 'form';
  const currentRecordTitle = creatingNew
    ? 'New'
    : route.recordId
    ? (records.find((r) => r.id === route.recordId)?.display_name || `#${route.recordId}`)
    : undefined;

  const currentIdx = route.recordId
    ? Math.max(0, records.findIndex((r) => r.id === route.recordId))
    : 0;

  const exportCsv = () => {
    const cols = modelDef.list;
    const header = cols.join(',');
    const lines = records.map((r) => cols.map((c) => `"${String(r[`${c}__label`] ?? r[c] ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${modelDef.name}.csv`;
    a.click();
  };

  const handleDuplicate = async () => {
    if (!route.recordId) return;
    try {
      const res = await apiFetch<{ record: any }>(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${route.recordId}/copy`, { method: 'POST' });
      showToast(`Record duplicated as #${res.record.id}`);
      navigate({ recordId: res.record.id, view: 'form' });
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to duplicate', 'error');
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const sid of selectedIds) {
        await apiFetch(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${sid}/copy`, { method: 'POST' });
      }
      showToast(`Duplicated ${selectedIds.length} record(s)`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to duplicate', 'error');
    }
  };

  const handleDelete = () => {
    if (!route.recordId) return;
    setBulkDeleteMode(false);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteMode(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      if (bulkDeleteMode) {
        for (const sid of selectedIds) {
          await apiFetch(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${sid}`, { method: 'DELETE' });
        }
        showToast(`Deleted ${selectedIds.length} record(s)`);
        setSelectedIds([]);
        loadData();
        return;
      }
      if (!route.recordId) return;
      await apiFetch(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${route.recordId}`, { method: 'DELETE' });
      showToast('Record deleted');
      navigate({ recordId: undefined, view: modelDef.views[0] });
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete', 'error');
    }
  };

  const handleArchive = async () => {
    if (!route.recordId) return;
    try {
      const current = records.find((r) => r.id === route.recordId);
      const active = current?.active === false ? true : false;
      await apiFetch(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${route.recordId}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      showToast(active ? 'Record unarchived' : 'Record archived');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to toggle archive', 'error');
    }
  };

  const handleBulkArchive = async (archive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      for (const sid of selectedIds) {
        await apiFetch(`/api/v1/models/${modelDef.name.replace(/\./g, '-')}/${sid}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: !archive }),
        });
      }
      showToast(`${archive ? 'Archived' : 'Unarchived'} ${selectedIds.length} record(s)`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update records', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-2.875rem)] flex flex-col">
      {!viewEditorOpen ? (
        <ControlPanel
          modelDef={modelDef}
          view={showForm ? 'form' : activeView}
          onViewChange={(v) => {
            setCreatingNew(false);
            setIsFormDirty(false);
            navigate({ view: v, recordId: v === 'form' ? (route.recordId ?? records[0]?.id) : undefined });
          }}
          total={total}
          search={search}
          onSearchChange={setSearch}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          onNew={() => { setCreatingNew(true); setIsFormDirty(true); setSmartButtons([]); navigate({ recordId: undefined, view: 'form' }); }}
          onExportCsv={exportCsv}
          breadcrumbTitle={currentRecordTitle}
          onBackToList={() => { setCreatingNew(false); setIsFormDirty(false); navigate({ recordId: undefined, view: modelDef.views[0] }); }}
          smartButtons={showForm && !creatingNew ? smartButtons : []}
          onSmartDrill={(targetModel, field) => {
            const rid = route.recordId;
            const matched = smartButtons.find((b) => b.model === targetModel && (b.field === field || b.field));
            const domain = matched?.domain ?? (rid && !field.startsWith('#') ? { [field]: rid } : undefined);
            navigate({ model: targetModel, recordId: undefined, view: 'list', domain });
          }}
          records={records}
          recordId={route.recordId}
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onSaveForm={showForm ? () => setSaveSignal((s) => s + 1) : undefined}
          onDiscardForm={showForm ? () => {
            if (creatingNew) {
              setCreatingNew(false);
              setIsFormDirty(false);
              navigate({ recordId: undefined, view: modelDef.views[0] });
            } else {
              setDiscardSignal((s) => s + 1);
            }
          } : undefined}
          isDirty={isFormDirty}
          isCreating={creatingNew}
          currentIndex={currentIdx}
          onPrevRecord={showForm && records.length > 1 ? () => {
            const prev = records[(currentIdx - 1 + records.length) % records.length];
            if (prev) navigate({ recordId: prev.id, view: 'form' });
          } : undefined}
          onNextRecord={showForm && records.length > 1 ? () => {
            const nxt = records[(currentIdx + 1) % records.length];
            if (nxt) navigate({ recordId: nxt.id, view: 'form' });
          } : undefined}
          onDuplicate={showForm && route.recordId ? handleDuplicate : undefined}
          onDelete={showForm && route.recordId ? handleDelete : undefined}
          onArchive={showForm && route.recordId ? handleArchive : undefined}
          onBulkDuplicate={handleBulkDuplicate}
          onBulkArchive={handleBulkArchive}
          onBulkDelete={handleBulkDelete}
        />
      ) : (
        /* Authentic Odoo 19 Studio / View Editor Sub-Bar matching step_18_shot_1_01d_view_editor_1440 */
        <div className="bg-white border-b border-[#dee2e6] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs min-h-[46px]">
          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" onClick={() => showToast('Nothing to undo')} className="flex items-center gap-1 hover:text-slate-700">
              <Undo2 size={13} /> <span>UNDO</span>
            </button>
            <button type="button" onClick={() => showToast('Nothing to redo')} className="flex items-center gap-1 hover:text-slate-700">
              <Redo2 size={13} /> <span>REDO</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500 border-l border-slate-200 pl-3">{modelDef.name}</span>
          </div>
          <div className="flex items-center gap-4 text-[var(--oe-brand-primary)] font-medium">
            <button type="button" onClick={() => setViewEditorOpen(false)} className="hover:underline">Reports</button>
            <button type="button" onClick={() => navigate({ model: 'ir.cron', view: 'list', recordId: undefined })} className="hover:underline">Automations</button>
            <button type="button" onClick={() => navigate({ model: 'res.users', view: 'list', recordId: undefined })} className="hover:underline">Access Control</button>
            <div className="flex items-center border-l border-slate-200 pl-3 gap-1.5 text-slate-600">
              <button onClick={() => navigate({ view: 'kanban', recordId: undefined })} className="p-1 hover:bg-slate-100 rounded"><Kanban size={13} /></button>
              <button onClick={() => navigate({ view: 'list', recordId: undefined })} className="p-1 hover:bg-slate-100 rounded"><List size={13} /></button>
            </div>
            <button
              type="button"
              onClick={() => setViewEditorOpen(false)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-stretch">
        {!showForm && showSearchPanel && panelItems.length > 0 && modelDef.search.panel && (
          <aside className="hidden lg:block w-[220px] shrink-0 bg-white border-r border-slate-200 p-3 text-xs">
            <div className="mb-2 flex items-center gap-1.5 px-2 py-1 text-slate-800 font-bold text-[11.5px] uppercase tracking-wide">
              <Folder size={13} className="text-[var(--oe-brand-primary)] shrink-0" />
              <span className="truncate">{modelDef.fields[modelDef.search.panel]?.string || modelDef.search.panel}</span>
            </div>
            <button
              onClick={() => setPanelFilter({})}
              className={`w-full text-left px-2.5 py-1.5 rounded mb-0.5 flex items-center justify-between ${Object.keys(panelFilter).length === 0 ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <span>All</span>
            </button>
            <div className="space-y-0.5 max-h-[65vh] overflow-y-auto">
              {panelItems.map((pi) => {
                const active = panelFilter[modelDef.search.panel!] === pi.id;
                return (
                  <button
                    key={String(pi.id)}
                    onClick={() => setPanelFilter({ [modelDef.search.panel!]: pi.id })}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between gap-2 ${active ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className="truncate">{pi.label}</span>
                    {pi.count !== undefined && (
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">{pi.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          {showForm ? (
            <FormView
              modelDef={modelDef}
              recordId={creatingNew ? undefined : route.recordId}
              saveSignal={saveSignal}
              discardSignal={discardSignal}
              onDirtyChange={setIsFormDirty}
              onSaved={(rec) => {
                setCreatingNew(false);
                setIsFormDirty(false);
                navigate({ recordId: rec.id, view: 'form' });
                loadData();
              }}
              onDeleted={() => {
                setCreatingNew(false);
                setIsFormDirty(false);
                navigate({ recordId: undefined, view: modelDef.views[0] });
                loadData();
              }}
              onSmartDrill={(targetModel, field, id) => {
                const domain = field && !field.startsWith('#') ? { [field]: id } : undefined;
                openModel(targetModel, { domain, view: 'list' });
              }}
              onSmartCounts={setSmartButtons}
            />
          ) : activeView === 'kanban' ? (
            <KanbanView
              modelDef={modelDef}
              records={records}
              currency={currencyCode}
              groupBy={groupBy}
              onOpenRecord={(id) => navigate({ recordId: id, view: 'form' })}
              onSmartDrill={(targetModel, field, id) => {
                const domain = field && !field.startsWith('#') ? { [field]: id } : undefined;
                openModel(targetModel, { domain, view: 'list' });
              }}
            />
          ) : activeView === 'calendar' ? (
            <CalendarView modelDef={modelDef} records={records} onOpenRecord={(id) => navigate({ recordId: id, view: 'form' })} />
          ) : activeView === 'pivot' || activeView === 'graph' ? (
            <PivotGraphView mode={activeView} modelDef={modelDef} records={records} groupBy={groupBy} />
          ) : (
            <ListView
              modelDef={modelDef}
              records={records}
              currency={currencyCode}
              onOpenRecord={(id) => navigate({ recordId: id, view: 'form' })}
              selectedIds={selectedIds}
              onToggleSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
              onToggleSelectAll={(all) => setSelectedIds((prev) => prev.length === all.length ? [] : all)}
            />
          )}
        </main>

        {/* Right Odoo 19 Studio Inspector Sidebar when viewEditorOpen is active */}
        {viewEditorOpen && (
          <aside className="hidden md:flex flex-col w-[270px] shrink-0 bg-[#edf0f5] border-l border-[#dee2e6] text-xs">
            <div className="flex border-b border-[#dee2e6] bg-[#e2e6ed]">
              <button
                type="button"
                onClick={() => setStudioTab('add')}
                className={`flex-1 py-2.5 px-3 font-medium flex items-center justify-center gap-1.5 ${
                  studioTab === 'add' ? 'bg-[#edf0f5] text-slate-900 border-b-2 border-[var(--oe-brand-primary)]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus size={13} /> <span>Add</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioTab('view')}
                className={`flex-1 py-2.5 px-3 font-medium flex items-center justify-center gap-1.5 ${
                  studioTab === 'view' ? 'bg-[#edf0f5] text-slate-900 border-b-2 border-[var(--oe-brand-primary)]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor size={13} /> <span>View</span>
              </button>
            </div>

            {studioTab === 'view' ? (
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={studioCanCreate} onChange={(e) => setStudioCanCreate(e.target.checked)} className="accent-[var(--oe-brand-primary)] rounded" />
                  <span>Can Create</span>
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={studioQuickCreate} onChange={(e) => setStudioQuickCreate(e.target.checked)} className="accent-[var(--oe-brand-primary)] rounded" />
                  <span>Quick Create</span>
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={studioShowInvisible} onChange={(e) => setStudioShowInvisible(e.target.checked)} className="accent-[var(--oe-brand-primary)] rounded" />
                  <span>Show Invisible Elements</span>
                </label>

                <div className="pt-2 space-y-1">
                  <div className="font-semibold text-slate-800">Default Group By</div>
                  <select
                    value={groupBy ?? ''}
                    onChange={(e) => setGroupBy(e.target.value || undefined)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    <option value="">None</option>
                    {modelDef.search.groupBy.map((g) => (
                      <option key={g} value={g}>{modelDef.fields[g]?.string || g}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-300/70 space-y-1 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-700">View Types Enabled</div>
                  <div>{modelDef.views.join(', ')}</div>
                  <div>Stage Field: <code className="text-slate-800">{modelDef.stageField || 'none'}</code></div>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-1.5 overflow-y-auto max-h-[75vh]">
                <div className="text-[11px] font-bold uppercase text-slate-500 px-1 mb-1">Model Fields ({Object.keys(modelDef.fields).length})</div>
                {Object.values(modelDef.fields).map((f) => (
                  <div key={f.name} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-slate-800 truncate">{f.string}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">{f.type}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Exact Odoo 19 Delete Confirmation Modal matching step_32_shot_3_06c_delete_confirmation_modal_1440 */}
      {showDeleteModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[540px] border border-slate-200 overflow-hidden text-[13px]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-[15px] text-slate-900">Bye-bye, {bulkDeleteMode ? `${selectedIds.length} records` : 'record'}!</h4>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">×</button>
            </div>
            <div className="px-5 py-5 text-slate-700 leading-relaxed">
              Ready to make your {bulkDeleteMode ? 'selected records' : 'record'} disappear into thin air? Are you sure?
              It will be gone forever! Think twice before you click that &apos;Delete&apos; button!
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-300/80 text-slate-800 font-medium text-xs"
              >
                No, keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
