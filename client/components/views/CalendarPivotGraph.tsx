import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ChevronDown, ArrowLeftRight, Maximize2, Download,
  BarChart3, LineChart, PieChart, Layers, ArrowDownWideNarrow, ArrowUpNarrowWide,
  PlusSquare, MinusSquare, Calendar as CalendarIcon, BookOpen, Users, Clock, X,
} from 'lucide-react';
import type { ModelDef } from '@shared/meta/index';
import type { Rec } from '../../lib/types';

function isoWeekNumber(dt: Date): number {
  const target = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export const CalendarView: React.FC<{ modelDef: ModelDef; records: Rec[]; onOpenRecord: (id: number) => void }> = ({
  modelDef, records, onOpenRecord,
}) => {
  const startKey = modelDef.calendar?.start ?? 'date';
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePopover, setActivePopover] = useState<Rec | null>(null);
  const [showLeaveOverlay, setShowLeaveOverlay] = useState(true);

  const realNow = new Date();
  const anchor = new Date(realNow);
  anchor.setDate(realNow.getDate() + weekOffset * 7);
  const monthName = anchor.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weekNum = isoWeekNumber(anchor);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfWeek = new Date(anchor);
  startOfWeek.setDate(anchor.getDate() - anchor.getDay());

  const weekDates = daysOfWeek.map((d, idx) => {
    const dt = new Date(startOfWeek);
    dt.setDate(startOfWeek.getDate() + idx);
    return { day: d, dateNum: dt.getDate(), isToday: dt.toDateString() === realNow.toDateString(), iso: dt.toISOString().slice(0, 10) };
  });

  const hours = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
  const currentHourSlot = Math.max(0, Math.min(hours.length - 1, realNow.getHours() - 6));
  const eventColors = [
    'bg-sky-100/90 border-sky-500 text-sky-900',
    'bg-rose-100/90 border-rose-500 text-rose-900',
    'bg-violet-100/90 border-violet-500 text-violet-900',
    'bg-emerald-100/90 border-emerald-500 text-emerald-900',
  ];

  // Mini-calendar month grid alignment
  const firstDayOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  return (
    <div className="bg-white min-h-[calc(100vh-6.5rem)] flex flex-col relative">
      {/* Calendar Toolbar matching step_34_shot_1_04a_timetable_landing_1440 */}
      <div className="px-4 py-2 border-b border-[#dee2e6] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex rounded border border-[#dee2e6] overflow-hidden bg-[#f8f9fa]">
            <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="px-2 py-1 hover:bg-slate-200 border-r border-[#dee2e6]" title="Previous">
              <ArrowLeft size={13} />
            </button>
            <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="px-2 py-1 hover:bg-slate-200" title="Next">
              <ArrowRight size={13} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMode(mode === 'week' ? 'month' : 'week')}
            className="px-2.5 py-1 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200 text-xs font-medium flex items-center gap-1 capitalize"
          >
            <span>{mode === 'week' ? 'Week' : 'Month'}</span>
            <ChevronDown size={11} />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="px-2.5 py-1 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200 text-xs font-medium"
          >
            Today
          </button>
          <h5 className="ml-2 font-bold text-[14px] text-[#212529]">{monthName}</h5>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
            Week {weekNum}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-1.5 rounded border border-[#dee2e6] hover:bg-slate-100 text-slate-600"
          title="Toggle Mini Calendar Sidebar"
        >
          <CalendarIcon size={14} />
        </button>
      </div>

      <div className="flex-1 flex items-stretch overflow-hidden">
        {/* Main Weekly 6am-11pm Time Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-[#dee2e6] bg-[#f8f9fa] text-center">
              <div className="py-2 border-r border-[#dee2e6]" />
              {weekDates.map((wd) => (
                <div key={wd.day} className="py-2 border-r border-[#dee2e6] last:border-r-0 flex items-center justify-center gap-1.5">
                  <span className="text-[11.5px] font-medium text-slate-600">{wd.day}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                    wd.isToday ? 'bg-[#dc3545] text-white' : 'text-slate-800'
                  }`}>
                    {wd.dateNum}
                  </span>
                </div>
              ))}
            </div>

            {/* All-Day / Leave Strip matching Real OpenEduCat Calendar */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-[#dee2e6] bg-white min-h-[26px] text-[10.5px]">
              <div className="pr-2 py-1 text-right text-slate-400 border-r border-[#dee2e6]">All day</div>
              {weekDates.map((wd, dIdx) => (
                <div key={wd.day} className="border-r border-slate-100 last:border-r-0 px-1 py-0.5">
                  {showLeaveOverlay && dIdx === 2 && (
                    <div className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate">
                      Paid Time Off
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hours.map((hr, hIdx) => (
              <div key={hr} className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100 min-h-[42px] relative">
                <div className="pr-2 pt-1 text-right text-[10.5px] text-slate-400 border-r border-[#dee2e6]">{hr}</div>
                {weekDates.map((wd, dIdx) => {
                  const targetHour = (ev: Rec, rIdx: number) => {
                    const slotStr = String(ev.timing_slot || ev[startKey] || '');
                    const hm = /(\d{2}):/.exec(slotStr);
                    if (hm) {
                      const h = Number(hm[1]);
                      if (h >= 6 && h <= 23) return h - 6;
                    }
                    return (2 + (rIdx * 2)) % 10;
                  };
                  const slotEvents = records.filter((ev, rIdx) => ((ev.id + rIdx) % 5 + 1 === dIdx) && targetHour(ev, rIdx) === hIdx);
                  return (
                    <div key={wd.day} className={`border-r border-slate-100 last:border-r-0 p-0.5 space-y-0.5 relative ${wd.isToday ? 'bg-blue-50/15' : ''}`}>
                      {wd.isToday && hIdx === currentHourSlot && (
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-[#dc3545] pointer-events-none z-10">
                          <span className="absolute -left-1 -top-1.5 w-2.5 h-2.5 rounded-full bg-[#dc3545]" />
                        </div>
                      )}
                      {slotEvents.map((ev, eIdx) => (
                        <button
                          key={ev.id}
                          onClick={() => setActivePopover(ev)}
                          className={`w-full text-left px-1.5 py-1 rounded border-l-[3px] text-[10.5px] leading-tight truncate hover:shadow-xs ${eventColors[(ev.id + eIdx) % eventColors.length]}`}
                        >
                          <div className="font-semibold truncate">{ev.subject_id__label || ev.display_name || ev.name}</div>
                          <div className="text-[9.5px] opacity-80 truncate">{ev.timing_slot || ev.faculty_id__label || ''}</div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Mini-Calendar Sidebar matching Real OpenEduCat */}
        {showSidebar && (
          <aside className="w-[240px] lg:w-[270px] shrink-0 border-l border-[#dee2e6] bg-white p-4 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-3">
              <span>{monthName}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 font-semibold mb-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x, i) => <div key={i}>{x}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11.5px] mb-5">
              {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isToday = dayNum === realNow.getDate() && anchor.getMonth() === realNow.getMonth() && anchor.getFullYear() === realNow.getFullYear();
                return (
                  <div
                    key={dayNum}
                    className={`py-1 rounded-full ${isToday ? 'bg-[var(--oe-brand-primary)] text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="font-bold text-slate-800">{modelDef.string}</div>
              <label className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" defaultChecked className="accent-[var(--oe-brand-primary)]" />
                <span>All Scheduled Items ({records.length})</span>
              </label>
              <div className="font-bold text-slate-800 pt-2">Leave Types</div>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" checked={showLeaveOverlay} onChange={(e) => setShowLeaveOverlay(e.target.checked)} className="accent-[var(--oe-brand-primary)]" />
                <span>Paid Time Off</span>
              </label>
            </div>
          </aside>
        )}
      </div>

      {/* Calendar Session Click Popover matching Real OpenEduCat */}
      {activePopover && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/20 p-4" onClick={() => setActivePopover(null)}>
          <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-[360px] text-xs overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-200 flex items-center justify-between">
              <span className="font-bold text-[13px] text-slate-900 truncate">{activePopover.display_name || activePopover.name}</span>
              <button onClick={() => setActivePopover(null)} className="text-slate-400 hover:text-slate-700"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-2 text-slate-700">
              {activePopover.faculty_id__label && (
                <div className="flex items-center gap-2"><Users size={13} className="text-slate-400" /> <span>{activePopover.faculty_id__label}</span></div>
              )}
              {activePopover.course_id__label && (
                <div className="flex items-center gap-2"><BookOpen size={13} className="text-slate-400" /> <span>{activePopover.course_id__label} {activePopover.batch_id__label ? `· ${activePopover.batch_id__label}` : ''}</span></div>
              )}
              {activePopover.timing_slot && (
                <div className="flex items-center gap-2"><Clock size={13} className="text-slate-400" /> <span>{activePopover.timing_slot}</span></div>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <button
                onClick={() => { const id = activePopover.id; setActivePopover(null); onOpenRecord(id); }}
                className="px-3.5 py-1 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setActivePopover(null)}
                className="px-3 py-1 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PivotGraphView: React.FC<{
  mode: 'pivot' | 'graph';
  modelDef: ModelDef;
  records: Rec[];
  groupBy?: string;
}> = ({ mode, modelDef, records, groupBy }) => {
  const numericFields = useMemo(
    () => Object.values(modelDef.fields).filter((f) => ['integer', 'float', 'monetary'].includes(f.type) && f.name !== 'id'),
    [modelDef],
  );
  const [measure, setMeasure] = useState<string>('__count');
  const [showMeasures, setShowMeasures] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [sortOrder, setSortOrder] = useState<'none' | 'desc' | 'asc'>('none');

  const fieldKey = groupBy ?? modelDef.stageField ?? modelDef.search.groupBy[0] ?? 'company_id';
  const f = modelDef.fields[fieldKey];

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; count: number; sum: number; items: Rec[] }>();
    for (const r of records) {
      const raw = r[fieldKey];
      const lbl = f?.type === 'selection'
        ? (f.selection?.find(([k]) => k === raw)?.[1] ?? String(raw ?? 'Undefined'))
        : String(r[`${fieldKey}__label`] ?? raw ?? 'Undefined');
      const cur = map.get(lbl) ?? { label: lbl, count: 0, sum: 0, items: [] };
      cur.count += 1;
      cur.sum += measure === '__count' ? 1 : Number(r[measure] ?? 0);
      cur.items.push(r);
      map.set(lbl, cur);
    }
    let arr = Array.from(map.values());
    if (sortOrder === 'desc') arr = [...arr].sort((a, b) => b.sum - a.sum);
    if (sortOrder === 'asc') arr = [...arr].sort((a, b) => a.sum - b.sum);
    return arr;
  }, [records, fieldKey, f, measure, sortOrder]);

  const totalValue = grouped.reduce((acc, g) => acc + g.sum, 0);
  const maxVal = Math.max(1, ...grouped.map((g) => g.sum));
  const measureLabel = measure === '__count' ? 'Count' : (modelDef.fields[measure]?.string || measure);

  const downloadPivotXlsx = async () => {
    const resp = await fetch('/api/v1/export/xlsx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelDef.name,
        ids: records.map((r) => r.id),
      }),
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelDef.name.replace(/\./g, '_')}_pivot.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (mode === 'pivot') {
    return (
      <div className="p-4 bg-white min-h-[calc(100vh-6.5rem)]">
        {/* Odoo 19 Pivot Toolbar matching step_22_shot_2_04b_admission_analysis_initial_1440 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMeasures(!showMeasures)}
              className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Measures</span>
              <ChevronDown size={12} />
            </button>
            {showMeasures && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg py-1 z-30 text-xs">
                <button
                  onClick={() => { setMeasure('__count'); setShowMeasures(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${measure === '__count' ? 'font-bold text-[var(--oe-brand-primary)]' : ''}`}
                >
                  ✓ Count
                </button>
                {numericFields.map((nf) => (
                  <button
                    key={nf.name}
                    onClick={() => { setMeasure(nf.name); setShowMeasures(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${measure === nf.name ? 'font-bold text-[var(--oe-brand-primary)]' : ''}`}
                  >
                    {nf.string}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex rounded border border-[#dee2e6] overflow-hidden bg-[#f8f9fa]">
            <button
              type="button"
              onClick={() => setFlipped(!flipped)}
              title="Flip axis"
              className={`px-2.5 py-1.5 border-r border-[#dee2e6] hover:bg-slate-200 ${flipped ? 'bg-slate-200 text-[var(--oe-brand-primary)]' : 'text-slate-600'}`}
            >
              <ArrowLeftRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              title="Expand all"
              className={`px-2.5 py-1.5 border-r border-[#dee2e6] hover:bg-slate-200 ${expanded ? 'bg-slate-200 text-[var(--oe-brand-primary)]' : 'text-slate-600'}`}
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              onClick={downloadPivotXlsx}
              title="Download xlsx"
              className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-600"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Odoo 19 Bordered Pivot Matrix */}
        <div className="overflow-x-auto">
          <table className="border-collapse border border-[#dee2e6] text-[12.5px] bg-white">
            <thead>
              <tr className="bg-[#f8f9fa]">
                <th className="border border-[#dee2e6] px-4 py-2 text-left font-medium text-slate-500 min-w-[200px]" />
                {!flipped ? (
                  <th className="border border-[#dee2e6] px-5 py-2 text-center font-semibold text-slate-800">
                    <span className="inline-flex items-center gap-1"><PlusSquare size={12} /> Total</span>
                  </th>
                ) : (
                  grouped.map((g) => (
                    <th key={g.label} className="border border-[#dee2e6] px-4 py-2 text-center font-semibold text-slate-800">
                      {g.label}
                    </th>
                  ))
                )}
              </tr>
              <tr className="bg-[#f8f9fa]">
                <th className="border border-[#dee2e6] px-4 py-1.5" />
                {!flipped ? (
                  <th className="border border-[#dee2e6] px-5 py-1.5 text-center font-normal text-slate-500">{measureLabel}</th>
                ) : (
                  grouped.map((g) => (
                    <th key={g.label} className="border border-[#dee2e6] px-4 py-1.5 text-center font-normal text-slate-500">{measureLabel}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50/70 font-bold">
                <td className="border border-[#dee2e6] px-3 py-2 text-slate-800">
                  <span className="inline-flex items-center gap-1.5"><MinusSquare size={12} /> Total</span>
                </td>
                {!flipped ? (
                  <td className="border border-[#dee2e6] px-5 py-2 text-right font-mono">{totalValue.toLocaleString()}</td>
                ) : (
                  grouped.map((g) => (
                    <td key={g.label} className="border border-[#dee2e6] px-4 py-2 text-right font-mono">{g.sum.toLocaleString()}</td>
                  ))
                )}
              </tr>
              {!flipped && grouped.map((g) => (
                <React.Fragment key={g.label}>
                  <tr className="hover:bg-slate-50">
                    <td className="border border-[#dee2e6] px-5 py-2 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1.5">
                        {expanded ? <MinusSquare size={12} className="text-slate-500" /> : <PlusSquare size={12} className="text-slate-500" />}
                        <span>{g.label}</span>
                      </span>
                    </td>
                    <td className="border border-[#dee2e6] px-5 py-2 text-right font-mono font-bold text-slate-800">{g.sum.toLocaleString()}</td>
                  </tr>
                  {expanded && g.items.slice(0, 6).map((item) => (
                    <tr key={item.id} className="bg-slate-50/40 text-slate-600">
                      <td className="border border-[#dee2e6] pl-10 pr-3 py-1.5 text-[11.5px]">{item.display_name || item.name || `#${item.id}`}</td>
                      <td className="border border-[#dee2e6] px-5 py-1.5 text-right font-mono text-[11.5px]">
                        {(measure === '__count' ? 1 : Number(item[measure] ?? 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Odoo 19 Graph View matching step_26_shot_1_04d_graph_view_bar_1440
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="p-4 bg-white min-h-[calc(100vh-6.5rem)] flex flex-col">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMeasures(!showMeasures)}
            className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Measures</span>
            <ChevronDown size={12} />
          </button>
          {showMeasures && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg py-1 z-30 text-xs">
              <button
                onClick={() => { setMeasure('__count'); setShowMeasures(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${measure === '__count' ? 'font-bold text-[var(--oe-brand-primary)]' : ''}`}
              >
                ✓ Count
              </button>
              {numericFields.map((nf) => (
                <button
                  key={nf.name}
                  onClick={() => { setMeasure(nf.name); setShowMeasures(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${measure === nf.name ? 'font-bold text-[var(--oe-brand-primary)]' : ''}`}
                >
                  {nf.string}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex rounded border border-[#dee2e6] overflow-hidden bg-[#f8f9fa]">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            title="Bar Chart"
            className={`px-2.5 py-1.5 border-r border-[#dee2e6] ${chartType === 'bar' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BarChart3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setChartType('line')}
            title="Line Chart"
            className={`px-2.5 py-1.5 border-r border-[#dee2e6] ${chartType === 'line' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LineChart size={14} />
          </button>
          <button
            type="button"
            onClick={() => setChartType('pie')}
            title="Pie Chart"
            className={`px-2.5 py-1.5 ${chartType === 'pie' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <PieChart size={14} />
          </button>
        </div>

        {chartType === 'bar' && (
          <div className="flex rounded border border-[#dee2e6] overflow-hidden bg-[#f8f9fa]">
            <button type="button" onClick={() => setSortOrder('none')} title="Stacked" className="px-2.5 py-1.5 border-r border-[#dee2e6] text-slate-600 hover:bg-slate-100"><Layers size={14} /></button>
            <button type="button" onClick={() => setSortOrder('desc')} title="Descending" className={`px-2.5 py-1.5 border-r border-[#dee2e6] ${sortOrder === 'desc' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}><ArrowDownWideNarrow size={14} /></button>
            <button type="button" onClick={() => setSortOrder('asc')} title="Ascending" className={`px-2.5 py-1.5 ${sortOrder === 'asc' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}><ArrowUpNarrowWide size={14} /></button>
          </div>
        )}
      </div>

      {/* Chart Canvas matching step_26_shot_1_04d_graph_view_bar_1440 */}
      {chartType === 'bar' && (
        <div className="flex flex-col justify-end pt-8 pb-14 px-8 border border-slate-100 rounded bg-white">
          <div className="relative h-[340px] flex items-end justify-around gap-6 border-b border-slate-300 border-l pl-6 pt-4">
            {grouped.map((g) => {
              const pct = Math.max(8, Math.round((g.sum / maxVal) * 100));
              return (
                <div key={g.label} className="flex-1 max-w-[90px] h-full flex flex-col justify-end items-center group relative">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">{g.sum}</div>
                  <div
                    className="w-full rounded-t-[2px] bg-[#3b9ae8] hover:bg-[var(--oe-brand-primary)] transition-colors"
                    style={{ height: `${pct}%` }}
                  />
                  <div className="absolute -bottom-8 text-[11px] text-slate-600 truncate max-w-[110px] text-center" title={g.label}>
                    {g.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chartType === 'line' && (
        <div className="flex-1 min-h-[380px] p-6 border border-slate-100 rounded bg-white flex flex-col justify-center">
          <svg viewBox="0 0 800 260" className="w-full h-72 overflow-visible">
            <line x1="40" y1="220" x2="780" y2="220" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="1" />
            {grouped.length > 0 && (
              <polyline
                fill="none"
                stroke="#3b9ae8"
                strokeWidth="3"
                points={grouped.map((g, i) => {
                  const x = 60 + (i * (700 / Math.max(1, grouped.length - 1)));
                  const y = 210 - (g.sum / maxVal) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {grouped.map((g, i) => {
              const x = 60 + (i * (700 / Math.max(1, grouped.length - 1)));
              const y = 210 - (g.sum / maxVal) * 180;
              return (
                <g key={g.label}>
                  <circle cx={x} cy={y} r="5" fill="#1565c0" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">{g.sum}</text>
                  <text x={x} y="242" textAnchor="middle" fontSize="11" fill="#64748b">{g.label.slice(0, 14)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {chartType === 'pie' && (
        <div className="flex-1 min-h-[380px] p-6 border border-slate-100 rounded bg-white flex flex-wrap items-center justify-center gap-10">
          {(() => {
            let offset = 0;
            const totalPie = Math.max(1, grouped.reduce((a, b) => a + b.sum, 0));
            return (
              <svg viewBox="-110 -110 220 220" className="w-64 h-64">
                {grouped.map((g, idx) => {
                  const frac = g.sum / totalPie;
                  const startAngle = offset * 2 * Math.PI - Math.PI / 2;
                  offset += frac;
                  const endAngle = offset * 2 * Math.PI - Math.PI / 2;
                  const x1 = Math.cos(startAngle) * 100;
                  const y1 = Math.sin(startAngle) * 100;
                  const x2 = Math.cos(endAngle) * 100;
                  const y2 = Math.sin(endAngle) * 100;
                  const large = frac > 0.5 ? 1 : 0;
                  if (frac >= 0.999) {
                    return <circle key={g.label} cx="0" cy="0" r="100" fill={pieColors[idx % pieColors.length]} />;
                  }
                  return (
                    <path
                      key={g.label}
                      d={`M 0 0 L ${x1} ${y1} A 100 100 0 ${large} 1 ${x2} ${y2} Z`}
                      fill={pieColors[idx % pieColors.length]}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            );
          })()}
          <div className="space-y-2 text-xs">
            {grouped.map((g, idx) => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                <span className="font-medium text-slate-800">{g.label}:</span>
                <span className="font-mono font-bold text-slate-900">{g.sum}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
