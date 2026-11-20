import React, { useState } from 'react';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Settings, Kanban, List,
  Calendar, Table2, BarChart3, Download, Bookmark, Printer, CloudUpload, RotateCcw,
  Copy, Trash2, Archive, Filter, Layers, Star, BookOpen, FileText, CreditCard,
  ClipboardCheck, Users, Award,
  type LucideIcon,
} from 'lucide-react';
import { getReportsForModel, checkModelAccess, type ReportDefinition, type ModelDef, type ViewType } from '@shared/meta/index';
import { useErp } from '../../context/ErpContext';
import { ExportRecordsDialog } from './ExportRecordsDialog';

function smartIconFor(label: string): LucideIcon {
  const s = label.toLowerCase();
  if (s.includes('invoice') || s.includes('fee') || s.includes('pay')) return CreditCard;
  if (s.includes('attend') || s.includes('calendar') || s.includes('session')) return Calendar;
  if (s.includes('assign') || s.includes('exam') || s.includes('grade')) return ClipboardCheck;
  if (s.includes('parent') || s.includes('student') || s.includes('faculty')) return Users;
  if (s.includes('achieve') || s.includes('place') || s.includes('alumni')) return Award;
  if (s.includes('admission') || s.includes('subject') || s.includes('course')) return BookOpen;
  return FileText;
}

interface ControlPanelProps {
  modelDef: ModelDef;
  view: ViewType;
  onViewChange: (v: ViewType) => void;
  total: number;
  search: string;
  onSearchChange: (s: string) => void;
  quickFilter?: { label: string; domain: Record<string, unknown> } | null;
  onQuickFilterChange?: (f: { label: string; domain: Record<string, unknown> } | null) => void;
  groupBy?: string;
  onGroupByChange: (g: string | undefined) => void;
  onNew: () => void;
  onExportCsv?: () => void;
  breadcrumbTitle?: string;
  onBackToList?: () => void;
  smartButtons?: { string: string; model: string; field: string; count: number; sum?: number }[];
  onSmartDrill?: (targetModel: string, field: string) => void;
  records?: Record<string, any>[];
  recordId?: number;
  selectedIds?: number[];
  onClearSelection?: () => void;
  onSaveForm?: () => void;
  onDiscardForm?: () => void;
  isDirty?: boolean;
  isCreating?: boolean;
  currentIndex?: number;
  onPrevRecord?: () => void;
  onNextRecord?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onBulkDuplicate?: () => void;
  onBulkArchive?: (archive: boolean) => void;
  onBulkDelete?: () => void;
}

const VIEW_ICONS: { type: ViewType; label: string; icon: LucideIcon }[] = [
  { type: 'kanban', label: 'Kanban', icon: Kanban },
  { type: 'list', label: 'List', icon: List },
  { type: 'calendar', label: 'Calendar', icon: Calendar },
  { type: 'pivot', label: 'Pivot', icon: Table2 },
  { type: 'graph', label: 'Graph', icon: BarChart3 },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  modelDef, view, onViewChange, total, search, onSearchChange,
  quickFilter, onQuickFilterChange,
  groupBy, onGroupByChange, onNew, onExportCsv, breadcrumbTitle, onBackToList,
  smartButtons = [], onSmartDrill,
  records = [], recordId, selectedIds = [], onClearSelection,
  onSaveForm, onDiscardForm, isDirty = false, isCreating = false,
  currentIndex = 0, onPrevRecord, onNextRecord,
  onDuplicate, onDelete, onArchive, onBulkDuplicate, onBulkArchive, onBulkDelete,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [customField, setCustomField] = useState(Object.keys(modelDef.fields)[0] || 'name');
  const [customVal, setCustomVal] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showMoreSmart, setShowMoreSmart] = useState(false);
  const [favorites, setFavorites] = useState<{ label: string; search: string; groupBy?: string }[]>([]);

  const { user } = useErp();
  const canCreate = checkModelAccess(modelDef.name, (user?.role || 'admin') as any, 'create').allowed;
  const isForm = view === 'form';
  const reports = getReportsForModel(modelDef.name);
  const visibleSmart = smartButtons.slice(0, 6);
  const overflowSmart = smartButtons.slice(6);
  const currentRecId = recordId ?? selectedIds[0] ?? records?.[0]?.id ?? 1;

  return (
    <div className="sticky top-[46px] z-30 bg-white border-b border-[#dee2e6] px-4 py-2 flex flex-wrap items-center justify-between gap-3 min-h-[48px]">
      {/* Left: New CTA + Breadcrumb/Title + Action gear icon */}
      <div className="flex items-center gap-2.5 min-w-0">
        {canCreate && (
          <button
            onClick={onNew}
            className={`px-3.5 py-1.5 h-[32px] inline-flex items-center rounded-[4px] text-[13px] font-semibold shrink-0 transition-colors ${
              isForm
                ? 'border border-[#dee2e6] bg-white text-[var(--oe-brand-primary)] hover:bg-slate-50'
                : 'text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)]'
            }`}
          >
            New
          </button>
        )}

        {breadcrumbTitle ? (
          <div className="leading-tight min-w-0 flex items-center gap-2">
            <div>
              <button onClick={onBackToList} className="block text-[11.5px] font-medium text-[var(--oe-brand-primary)] hover:underline truncate">
                {modelDef.string}
              </button>
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#212529] truncate">
                <span className="truncate max-w-[240px]">{breadcrumbTitle}</span>
              </div>
            </div>

            {/* Inline Actions gear cog + Save/Discard ONLY when dirty or creating (Odoo 19 standard) */}
            <div className="flex items-center gap-1 ml-1">
              {(isDirty || isCreating) && onSaveForm && (
                <button
                  type="button"
                  onClick={onSaveForm}
                  title="Save record"
                  className="px-2 py-1 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <CloudUpload size={13} />
                  <span>Save</span>
                </button>
              )}
              {(isDirty || isCreating) && onDiscardForm && (
                <button
                  type="button"
                  onClick={onDiscardForm}
                  title="Discard changes"
                  className="p-1 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200 text-slate-600 text-xs"
                >
                  <RotateCcw size={13} />
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 flex items-center gap-0.5 text-xs"
                  title="Actions"
                >
                  <Settings size={13} />
                </button>
                {showActions && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 z-40 text-xs">
                  {reports.length > 0 && (
                    <div className="border-b border-slate-100 pb-1 mb-1">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Print Reports</div>
                      {reports.map((rp) => {
                        const identifier = rp.actionName || rp.id;
                        return (
                          <a
                            key={rp.id}
                            href={`/report/pdf/${identifier}/${currentRecId}`}
                            download
                            onClick={() => setShowActions(false)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Printer size={12} className="text-[var(--oe-brand-primary)]" />
                              <span className="truncate">{rp.name}</span>
                            </span>
                            <Download size={11} className="text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => { setShowActions(false); setShowExportDialog(true); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Download size={13} /> Export Data
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={() => { setShowActions(false); onDuplicate(); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                  )}
                  {onArchive && (
                    <button
                      onClick={() => { setShowActions(false); onArchive(); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Archive size={13} /> Archive / Unarchive
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setShowActions(false); onDelete(); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 border-t border-slate-100"
                    >
                    <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#212529]">
            <span>{modelDef.string}</span>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 flex items-center gap-0.5 text-xs"
                title="Actions"
              >
                <Settings size={13} />
              </button>
              {showActions && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 z-40 text-xs">
                  {reports.length > 0 && (
                    <div className="border-b border-slate-100 pb-1 mb-1">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Print Reports</div>
                      {reports.map((rp) => {
                        const identifier = rp.actionName || rp.id;
                        return (
                          <a
                            key={rp.id}
                            href={`/report/pdf/${identifier}/${currentRecId}`}
                            download
                            onClick={() => setShowActions(false)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Printer size={12} className="text-[var(--oe-brand-primary)]" />
                              <span className="truncate">{rp.name}</span>
                            </span>
                            <Download size={11} className="text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => { setShowActions(false); setShowExportDialog(true); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Download size={13} /> Export Data
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Center: Selection Actions (List) / Search Bar (List/Kanban) OR Smart Buttons Box (Form View) */}
      {isForm ? (
        smartButtons.length > 0 && onSmartDrill && (
          <div className="flex flex-wrap items-center border border-[#dee2e6] rounded-[3px] bg-white overflow-visible">
            {visibleSmart.map((s) => {
              const Icon = smartIconFor(s.string);
              return (
                <button
                  key={s.string}
                  onClick={() => onSmartDrill(s.model, s.field)}
                  className="px-2.5 py-1 border-r border-[#dee2e6] last:border-r-0 hover:bg-slate-50 flex items-center gap-2 text-left h-[32px]"
                >
                  <Icon size={14} className="text-[var(--oe-brand-primary)] shrink-0" />
                  <div className="leading-none">
                    <div className="text-[11.5px] font-medium text-slate-700">{s.string}</div>
                    <div className="text-[11.5px] font-bold text-[var(--oe-brand-primary)] mt-0.5">
                      {s.sum !== undefined ? Number(s.sum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : s.count}
                    </div>
                  </div>
                </button>
              );
            })}
            {overflowSmart.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreSmart(!showMoreSmart)}
                  className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1 h-[32px]"
                >
                  <span>More</span>
                  <ChevronDown size={11} />
                </button>
                {showMoreSmart && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg py-1 z-30 text-xs">
                    {overflowSmart.map((s) => (
                      <button
                        key={s.string}
                        onClick={() => { setShowMoreSmart(false); onSmartDrill(s.model, s.field); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>{s.string}</span>
                        <span className="font-bold text-[var(--oe-brand-primary)]">{s.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : selectedIds.length > 0 ? (
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded bg-[var(--oe-surface-pale-blue)] border border-[var(--oe-brand-primary)]/30 text-[var(--oe-brand-primary)] text-xs font-semibold flex items-center gap-2">
            <span>{selectedIds.length} selected</span>
            {onClearSelection && (
              <button onClick={onClearSelection} className="hover:text-rose-700 font-bold">×</button>
            )}
          </div>
          {reports.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setShowPrintMenu(!showPrintMenu); setShowActions(false); setShowBulkActions(false); }}
                className="px-2.5 py-1 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>
              {showPrintMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 z-40 text-xs">
                  {reports.map((rp) => (
                    <a
                      key={rp.id}
                      href={`/report/pdf/${rp.actionName || rp.id}/${currentRecId}`}
                      download
                      onClick={() => setShowPrintMenu(false)}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span className="truncate">{rp.name}</span>
                      <Download size={11} className="text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => { setShowBulkActions(!showBulkActions); setShowPrintMenu(false); }}
              className="px-2.5 py-1 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5"
            >
              <Settings size={12} />
              <span>Actions</span>
            </button>
            {showBulkActions && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded shadow-xl py-1 z-40 text-xs">
                <button
                  onClick={() => { setShowBulkActions(false); setShowExportDialog(true); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Download size={13} /> Export
                </button>
                {onBulkDuplicate && (
                  <button
                    onClick={() => { setShowBulkActions(false); onBulkDuplicate(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                )}
                {onBulkArchive && (
                  <>
                    <button
                      onClick={() => { setShowBulkActions(false); onBulkArchive(true); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Archive size={13} /> Archive
                    </button>
                    <button
                      onClick={() => { setShowBulkActions(false); onBulkArchive(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Archive size={13} /> Unarchive
                    </button>
                  </>
                )}
                {onBulkDelete && (
                  <button
                    onClick={() => { setShowBulkActions(false); onBulkDelete(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 border-t border-slate-100"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex-1 max-w-[440px] min-w-[220px]">
          <div className="flex items-center border border-slate-300 rounded-[4px] bg-white h-[35px] focus-within:border-[var(--oe-brand-primary)]">
            <Search size={13} className="ml-2.5 text-slate-400 shrink-0" />
            {quickFilter && onQuickFilterChange && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-[var(--oe-brand-primary)] text-[11px] font-medium flex items-center gap-1 shrink-0">
                {quickFilter.label}
                <button onClick={() => onQuickFilterChange(null)} className="hover:text-rose-600">×</button>
              </span>
            )}
            {groupBy && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-medium flex items-center gap-1 shrink-0">
                {modelDef.fields[groupBy]?.string || groupBy}
                <button onClick={() => onGroupByChange(undefined)} className="hover:text-rose-600">×</button>
              </span>
            )}
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-[13px] bg-transparent focus:outline-none"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-2 py-1.5 border-l border-slate-200 text-slate-500 hover:bg-slate-50 h-full flex items-center"
              title="Toggle Filters, Group By & Favorites"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Authentic 3-Column Search Dropdown matching step_20_shot_1_openeducat_search_dropdown */}
          {showFilters && (
            <div className="absolute right-0 mt-1 w-[500px] max-w-[95vw] bg-white border border-slate-200 rounded shadow-xl p-3.5 z-40 text-xs grid grid-cols-3 gap-3">
              {/* Column 1: Filters */}
              <div className="border-r border-slate-100 pr-2.5">
                <div className="font-bold text-[var(--oe-brand-primary)] uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Filter size={12} className="text-[var(--oe-brand-primary)]" />
                  <span>Filters</span>
                </div>
                {onQuickFilterChange && (
                  <button
                    onClick={() => { onQuickFilterChange(null); setShowFilters(false); }}
                    className={`w-full text-left px-2 py-1 rounded text-[12px] ${!quickFilter ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}
                  >
                    All Records
                  </button>
                )}
                {modelDef.stageField && modelDef.fields[modelDef.stageField]?.selection?.slice(0, 6).map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => { onQuickFilterChange?.({ label: lbl, domain: { [modelDef.stageField!]: k } }); setShowFilters(false); }}
                    className={`w-full text-left px-2 py-1 rounded text-[12px] truncate ${quickFilter?.domain[modelDef.stageField!] === k ? 'bg-blue-50 text-[var(--oe-brand-primary)] font-semibold' : 'hover:bg-slate-50'}`}
                  >
                    {lbl}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onQuickFilterChange?.({ label: 'Archived', domain: { active: false } });
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-[12px] mt-1 ${
                    quickFilter?.label === 'Archived' ? 'bg-blue-50 text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Archived
                </button>
                <button
                  onClick={() => setShowCustomFilter(!showCustomFilter)}
                  className="w-full text-left px-2 py-1 rounded text-[12px] text-[var(--oe-brand-primary)] hover:bg-slate-50 mt-1 font-medium"
                >
                  Custom Filter...
                </button>
                {showCustomFilter && (
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                    <select
                      value={customField}
                      onChange={(e) => setCustomField(e.target.value)}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-[11px] bg-white"
                    >
                      {Object.values(modelDef.fields).slice(0, 14).map((cf) => (
                        <option key={cf.name} value={cf.name}>{cf.string}</option>
                      ))}
                    </select>
                    <input
                      value={customVal}
                      onChange={(e) => setCustomVal(e.target.value)}
                      placeholder="Value..."
                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customVal.trim()) return;
                        const fl = modelDef.fields[customField]?.string || customField;
                        const parsed = customVal === 'true' ? true : customVal === 'false' ? false : customVal;
                        onQuickFilterChange?.({ label: `${fl}: ${customVal}`, domain: { [customField]: parsed } });
                        setShowCustomFilter(false);
                        setShowFilters(false);
                      }}
                      className="w-full py-1 rounded bg-[var(--oe-brand-primary)] text-white text-[11px] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Column 2: Group By */}
              <div className="border-r border-slate-100 pr-2.5">
                <div className="font-bold text-purple-700 uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Layers size={12} className="text-purple-600" />
                  <span>Group By</span>
                </div>
                <button
                  onClick={() => { onGroupByChange(undefined); setShowFilters(false); }}
                  className={`w-full text-left px-2 py-1 rounded text-[12px] ${!groupBy ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}
                >
                  None
                </button>
                {modelDef.search.groupBy.map((g) => (
                  <button
                    key={g}
                    onClick={() => { onGroupByChange(g); setShowFilters(false); }}
                    className={`w-full text-left px-2 py-1 rounded text-[12px] truncate ${groupBy === g ? 'bg-purple-50 text-purple-700 font-semibold' : 'hover:bg-slate-50'}`}
                  >
                    {modelDef.fields[g]?.string || g}
                  </button>
                ))}
                <div className="mt-1.5">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onGroupByChange(e.target.value);
                        setShowFilters(false);
                      }
                    }}
                    value=""
                    className="w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded text-slate-700 bg-white"
                  >
                    <option value="" disabled>Custom Group ▼</option>
                    {Object.keys(modelDef.fields).slice(0, 10).map((k) => (
                      <option key={k} value={k}>{modelDef.fields[k]?.string || k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column 3: Favorites */}
              <div>
                <div className="font-bold text-amber-600 uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span>Favorites</span>
                </div>
                <button
                  onClick={() => {
                    const label = search || (groupBy ? `Grouped: ${modelDef.fields[groupBy]?.string || groupBy}` : `${modelDef.string} View`);
                    setFavorites((prev) => [...prev, { label, search, groupBy }]);
                  }}
                  className="w-full text-left px-2 py-1 rounded text-[12px] text-[var(--oe-brand-primary)] hover:bg-slate-50 font-medium"
                >
                  Save current search ▼
                </button>
                {favorites.map((fav, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSearchChange(fav.search);
                      onGroupByChange(fav.groupBy);
                      setShowFilters(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 truncate text-slate-700 text-[12px]"
                  >
                    ★ {fav.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right: Bookmark, Pager & Joined View Switchers */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Bookmark size={14} className="text-slate-400 hidden sm:block" />
        <div className="flex items-center gap-1 text-[12.5px] text-slate-600">
          <span>
            {total === 0
              ? '0 / 0'
              : isForm
              ? `${currentIndex + 1} / ${total}`
              : `1-${total} / ${total}`}
          </span>
          <button
            type="button"
            onClick={onPrevRecord}
            disabled={!onPrevRecord}
            className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={onNextRecord}
            disabled={!onNextRecord}
            className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {!isForm && (
          <div className="flex items-center rounded border border-[#dee2e6] overflow-hidden bg-white">
            {VIEW_ICONS.filter((vi) => modelDef.views.includes(vi.type)).map((vi) => {
              const Icon = vi.icon;
              const active = view === vi.type;
              return (
                <button
                  key={vi.type}
                  onClick={() => onViewChange(vi.type)}
                  title={`${vi.label} View`}
                  className={`p-1.5 border-r border-[#dee2e6] last:border-r-0 ${
                    active ? 'bg-slate-200/90 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showExportDialog && (
        <ExportRecordsDialog
          modelDef={modelDef}
          records={records ?? []}
          selectedIds={selectedIds}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
};
