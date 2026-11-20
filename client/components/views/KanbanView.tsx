import React from 'react';
import {
  Calendar, Mail, Phone, Star, Clock, BookOpen, Users, ExternalLink, Copy, Hash, Tag, Plus,
  CreditCard, Layers, GraduationCap, FileText, Briefcase, Truck, ShieldAlert, CheckCircle2,
  Bookmark, Library, BarChart3, User, Play, RotateCcw, Eye,
} from 'lucide-react';
import type { ModelDef } from '@shared/meta/index';
import type { Rec } from '../../lib/types';
import { formatDate, formatDateRange, formatMoney } from '../../lib/format';
import { AppTileIcon } from '../AppSvgIcons';

interface KanbanViewProps {
  modelDef: ModelDef;
  records: Rec[];
  currency?: string;
  groupBy?: string;
  onOpenRecord: (id: number) => void;
  onSmartDrill?: (targetModel: string, field: string, recordId: number) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  modelDef, records, currency = 'KES', groupBy, onOpenRecord, onSmartDrill,
}) => {
  const effectiveGroup = groupBy ?? modelDef.kanban.groupBy;
  const groupField = effectiveGroup ? modelDef.fields[effectiveGroup] : undefined;

  const renderDepartmentCard = (r: Rec) => {
    const stats = r._dept_stats || {};
    const tiles: { label: string; count: number; target: string; field: string; icon: React.ReactNode }[] = [
      { label: 'Programs', count: stats.programs ?? 0, target: 'op.program', field: 'department_id', icon: <Layers size={12} className="text-slate-600" /> },
      { label: 'Courses', count: stats.courses ?? 0, target: 'op.course', field: 'department_id', icon: <BookOpen size={12} className="text-slate-600" /> },
      { label: 'Faculties', count: stats.faculties ?? 0, target: 'op.faculty', field: 'main_department_id', icon: <Users size={12} className="text-slate-600" /> },
      { label: 'Students', count: stats.students ?? 0, target: 'op.student', field: '', icon: <GraduationCap size={12} className="text-slate-600" /> },
      { label: 'Subjects', count: stats.subjects ?? 0, target: 'op.subject', field: 'department_id', icon: <FileText size={12} className="text-slate-600" /> },
      { label: 'Batches', count: stats.batches ?? 0, target: 'op.batch', field: '', icon: <Briefcase size={12} className="text-slate-600" /> },
    ];
    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <h5 className="font-bold text-[14.5px] text-[var(--oe-brand-primary)] hover:underline truncate">
            {r.display_name || r.name}
          </h5>
          {r.code && <span className="text-[11px] font-mono text-slate-400 shrink-0">{r.code}</span>}
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-3 text-[11.5px]">
          {tiles.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSmartDrill && t.field) onSmartDrill(t.target, t.field, r.id);
                else if (onSmartDrill) onSmartDrill(t.target, '', r.id);
              }}
              className="px-2 py-1.5 rounded border border-slate-200/90 bg-[#f8f9fa] hover:bg-slate-100 flex items-center justify-between text-slate-700"
            >
              <span className="flex items-center gap-1.5 truncate">
                {t.icon}
                <span className="truncate">{t.label}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-800 text-[10.5px] font-bold shrink-0">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAttendanceRegisterCard = (r: Rec) => {
    const freq = String(r.auto_create_type || 'daily');
    const freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1);
    const badgeTone =
      freq === 'daily'
        ? 'bg-[#198754] text-white'
        : freq === 'weekly'
        ? 'bg-amber-500 text-white'
        : 'bg-slate-600 text-white';
    const sheetCount = r._register_sheet_count ?? r._smart_counts?.[0]?.count ?? 0;

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[156px]"
      >
        <div>
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="min-w-0">
              <h5 className="font-bold text-[14px] text-[var(--oe-brand-primary)] hover:underline truncate">
                {r.code || r.display_name || r.name}
              </h5>
              {r.code && r.name && (
                <div className="text-[12px] text-slate-500 truncate mt-0.5">{r.name}</div>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${badgeTone}`}>
              {freqLabel}
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-[12px] text-slate-600">
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
            {r.batch_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Users size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.batch_id__label}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSmartDrill?.('op.attendance.sheet', 'register_id', r.id);
          }}
          className="mt-3 w-full py-1.5 px-2.5 rounded-[4px] bg-[#f8f9fa] hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-[12px] font-medium flex items-center justify-center gap-2"
        >
          <Bookmark size={12} className="text-slate-500" />
          <span>Attendance Sheets</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10.5px] font-bold">{sheetCount}</span>
        </button>
      </div>
    );
  };

  const renderAttendanceSheetCard = (r: Rec) => {
    const state = String(r.state || 'draft');
    const ribbon = {
      draft: { text: 'Draft', cls: 'bg-[#0dcaf0] text-dark font-semibold' },
      start: { text: 'In Progress', cls: 'bg-[#ffc107] text-dark font-semibold' },
      done: { text: 'Done', cls: 'bg-[#198754] text-white font-semibold' },
      cancel: { text: 'Cancelled', cls: 'bg-[#dc3545] text-white font-semibold' },
    }[state] || { text: state.toUpperCase(), cls: 'bg-slate-500 text-white' };

    const dateStr = r.attendance_date ? String(r.attendance_date).slice(0, 10) : '';
    const presentCount = r.total_present ?? 0;
    const absentCount = r.total_absent ?? 0;

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[175px]"
      >
        <div className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10.5px] rounded-full ${ribbon.cls}`}>
          {ribbon.text}
        </div>

        <div>
          <div className="pr-20">
            <h5 className="font-bold text-[14px] text-[var(--oe-brand-primary)] hover:underline truncate" title={String(r.name || r.display_name)}>
              {r.name || r.display_name || `#${r.id}`}
            </h5>
          </div>

          <div className="mt-2.5 space-y-1 text-[12px] text-slate-600">
            {dateStr && (
              <div className="flex items-center gap-1.5 truncate">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{dateStr}</span>
              </div>
            )}
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
            {r.batch_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Users size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.batch_id__label}</span>
              </div>
            )}
            {r.faculty_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <User size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.faculty_id__label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              P: {presentCount}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              A: {absentCount}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecord(r.id);
            }}
            className="px-2.5 py-1 rounded bg-[#f8f9fa] hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11.5px] font-medium flex items-center gap-1"
          >
            <Eye size={11} />
            <span>View</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSessionCard = (r: Rec) => {
    const state = String(r.state || 'draft');
    const ribbon = {
      draft: { text: 'Draft', cls: 'bg-[#0dcaf0] text-dark font-semibold' },
      confirm: { text: 'Confirmed', cls: 'bg-[#0d6efd] text-white font-semibold' },
      done: { text: 'Done', cls: 'bg-[#198754] text-white font-semibold' },
      cancel: { text: 'Cancelled', cls: 'bg-[#dc3545] text-white font-semibold' },
    }[state] || { text: state.toUpperCase(), cls: 'bg-slate-500 text-white' };

    const timingStr = r.timing || (r.start_datetime ? `${String(r.start_datetime).slice(11, 16)} - ${String(r.end_datetime || '').slice(11, 16)}` : r.timing_slot || r.name);

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
      >
        <div className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10.5px] rounded-full ${ribbon.cls}`}>
          {ribbon.text}
        </div>

        <div>
          <div className="pr-20">
            <h5 className="font-bold text-[14px] text-[var(--oe-brand-primary)] hover:underline truncate" title={String(timingStr)}>
              {String(timingStr)}
            </h5>
            {r.subject_id__label && (
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-800 truncate mt-0.5">
                <BookOpen size={13} className="text-slate-500 shrink-0" />
                <span className="truncate">{r.subject_id__label}</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 space-y-1 text-[12px] text-slate-600">
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
            {r.batch_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Users size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.batch_id__label}</span>
              </div>
            )}
            {r.faculty_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <User size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.faculty_id__label}</span>
              </div>
            )}
            {r.classroom_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Layers size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.classroom_id__label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="capitalize">{r.type || 'Theory'}</span>
          <span className="capitalize font-medium text-slate-700">{r.days || ''}</span>
        </div>
      </div>
    );
  };

  const renderAssignmentCard = (r: Rec) => {
    const state = String(r.state || 'draft');
    const ribbon = {
      draft: { text: 'Draft', cls: 'bg-[#0dcaf0] text-dark font-semibold' },
      publish: { text: 'Published', cls: 'bg-[#0d6efd] text-white font-semibold' },
      finish: { text: 'Finished', cls: 'bg-[#198754] text-white font-semibold' },
      cancel: { text: 'Cancelled', cls: 'bg-[#dc3545] text-white font-semibold' },
    }[state] || { text: state.toUpperCase(), cls: 'bg-slate-500 text-white' };

    const subCount = Number(r.assignment_sub_line_count ?? 0);

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
      >
        <div className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10.5px] rounded-full ${ribbon.cls}`}>
          {ribbon.text}
        </div>

        <div>
          <div className="pr-20">
            {r.sequence && (
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {String(r.sequence)}
              </span>
            )}
            <h5 className="font-bold text-[14px] text-[var(--oe-brand-primary)] hover:underline truncate" title={String(r.name)}>
              {String(r.name || 'Untitled Assignment')}
            </h5>
            {r.subject_id__label && (
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-800 truncate mt-0.5">
                <BookOpen size={13} className="text-slate-500 shrink-0" />
                <span className="truncate">{r.subject_id__label}</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 space-y-1 text-[12px] text-slate-600">
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
            {r.batch_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Users size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.batch_id__label}</span>
              </div>
            )}
            {r.submission_date && (
              <div className="flex items-center gap-1.5 truncate text-slate-500">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span>Due: {String(r.submission_date).slice(0, 10)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            Submissions: {subCount}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecord(r.id);
            }}
            className="px-2.5 py-1 rounded bg-[#f8f9fa] hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11.5px] font-medium flex items-center gap-1"
          >
            <Eye size={11} />
            <span>View</span>
          </button>
        </div>
      </div>
    );
  };

  const renderJournalCard = (r: Rec) => {
    const js = r._journal_stats || {
      toValidate: 0, unpaidCount: 0, unpaidAmount: 0, lateCount: 0, lateAmount: 0, balance: 0, chartBars: [35, 62, 48, 76, 54, 88],
    };
    const isSale = r.type === 'sale';
    const isPurchase = r.type === 'purchase';
    const borderAccent = isSale ? 'border-l-emerald-600' : isPurchase ? 'border-l-amber-500' : 'border-l-[var(--oe-brand-primary)]';
    const bars: number[] = js.chartBars || [35, 62, 48, 76, 54, 88];
    const maxB = Math.max(1, ...bars);

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className={`bg-white rounded-[4px] border border-[#dee2e6] border-l-4 ${borderAccent} p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm cursor-pointer flex flex-col justify-between min-h-[190px]`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h5 className="font-bold text-[15px] text-[var(--oe-brand-primary)] hover:underline">
              {r.display_name || r.name}
            </h5>
            <div className="text-[11.5px] text-slate-500 mt-0.5">{r.default_account || r.code}</div>
          </div>
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">{r.type}</span>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center my-3">
          <div className="col-span-5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isSale || isPurchase) onSmartDrill?.('account.move', 'move_type', r.id);
                else onSmartDrill?.('payment.transaction', '', r.id);
              }}
              className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-xs font-semibold"
            >
              {isSale ? 'Invoices' : isPurchase ? 'Bills' : 'Transactions'}
            </button>
          </div>
          <div className="col-span-7 space-y-1 text-[12px]">
            {(isSale || isPurchase) ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>{js.toValidate} To Validate</span>
                  <span className="font-mono font-medium">{formatMoney(js.unpaidAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>{js.unpaidCount} Unpaid</span>
                  <span className="font-mono font-bold text-[var(--oe-brand-primary)]">{formatMoney(js.unpaidAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{js.lateCount} Late</span>
                  <span className="font-mono text-rose-600">{formatMoney(js.lateAmount, currency)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Balance in GL</span>
                <span className="font-mono font-bold text-slate-900">{formatMoney(js.balance, currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Embedded SVG Bar Sparkline matching Real Odoo Accounting Cards */}
        <div className="pt-2 border-t border-slate-100 flex items-end gap-2 h-14">
          {bars.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t-[2px] bg-[#7fb8e6] hover:bg-[var(--oe-brand-primary)] transition-colors"
                style={{ height: `${Math.max(15, Math.round((val / maxB) * 100))}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLibraryTypeCard = (r: Rec) => {
    const ls = r._library_stats || { issued: 0, available: 0, dueToday: 0, dueMonth: 0 };
    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 cursor-pointer flex flex-col justify-between min-h-[200px]"
      >
        <div>
          <div className="flex items-center gap-2 font-bold text-[15px] text-[#212529]">
            <Library size={16} className="text-slate-600 shrink-0" />
            <span className="truncate">{r.display_name || r.name}</span>
          </div>
          <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-slate-400 font-semibold flex items-center gap-1">
            <BarChart3 size={11} />
            <span>MEDIA USAGE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2.5 text-[12px]">
            <div className="px-2.5 py-1.5 rounded bg-[#f8f9fa] border border-slate-200/80 flex items-center justify-between text-slate-700">
              <span>Issued</span>
              <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">{ls.issued}</span>
            </div>
            <div className="px-2.5 py-1.5 rounded bg-[#f8f9fa] border border-slate-200/80 flex items-center justify-between text-slate-700">
              <span>Available</span>
              <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">{ls.available}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSmartDrill?.('op.media', 'media_type_id', r.id);
            }}
            className="mt-2.5 w-full py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-semibold flex items-center justify-center gap-1"
          >
            <Plus size={12} /> <span>New Media</span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-200 text-center">
          <div>
            <div className="text-[15px] font-bold text-slate-900">{ls.dueToday}</div>
            <div className="text-[10px] uppercase text-slate-500 font-medium">DUE TODAY</div>
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900">{ls.dueMonth}</div>
            <div className="text-[10px] uppercase text-slate-500 font-medium">DUE THIS MONTH</div>
          </div>
        </div>
      </div>
    );
  };

  const renderRouteRegisterCard = (r: Rec) => {
    const state = String(r.state || 'draft');
    const ribbonClass = state === 'gathering' ? '' : state === 'confirm' ? 'ribbon-primary' : 'ribbon-warning';
    const ribbonLabel = state === 'gathering' ? 'PUBLISHED' : state === 'confirm' ? 'CONFIRMED' : 'DRAFT';
    const agCount = r._agreement_count ?? r._smart_counts?.[0]?.count ?? 0;

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 cursor-pointer flex flex-col justify-between min-h-[195px]"
      >
        <div className={`ribbon ${ribbonClass}`}>
          <span>{ribbonLabel}</span>
        </div>

        <div>
          <div className="flex items-start gap-1.5 pr-12">
            <Star size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <h5 className="font-bold text-[14.5px] text-[var(--oe-brand-primary)] hover:underline leading-snug">
              {r.display_name || r.name}
            </h5>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[12px] text-slate-600">
            <div className="font-mono font-bold text-slate-800">{formatMoney(r.cost ?? 0, currency)}</div>
            {r.route_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <Truck size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.route_id__label}</span>
              </div>
            )}
            {(r.start_date || r.end_date) && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span>{formatDateRange(r.start_date, r.end_date)}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSmartDrill?.('op.transportation.agreement', 'route_register_id', r.id);
          }}
          className="mt-3 w-full py-1.5 px-3 rounded-[4px] bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5"
        >
          <Copy size={12} />
          <span>{agCount} Agreements</span>
        </button>
      </div>
    );
  };

  const renderHelpdeskTeamCard = (r: Rec) => {
    const ts = r._team_stats || { open: 0, slaPct: 100, closed: 0, newCount: 0, unassigned: 0, urgent: 0, overdue: 0 };
    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] border-l-4 border-l-[var(--oe-brand-primary)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm cursor-pointer flex flex-col justify-between min-h-[175px]"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className="font-bold text-[15px] text-slate-900">{r.display_name || r.name}</h5>
            <div className="text-[11.5px] text-slate-500 mt-0.5">{r.alias_email || r.leader_id__label || 'Support Team'}</div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSmartDrill?.('helpdesk.ticket', '', r.id);
            }}
            className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white text-xs font-semibold shrink-0"
          >
            Tickets ({ts.open})
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11.5px]">
          <div>
            <div className="font-bold text-slate-900">{ts.newCount}</div>
            <div className="text-slate-500">New</div>
          </div>
          <div>
            <div className="font-bold text-amber-600">{ts.urgent}</div>
            <div className="text-slate-500">High Priority</div>
          </div>
          <div>
            <div className="font-bold text-emerald-700">{ts.slaPct}%</div>
            <div className="text-slate-500">SLA Met</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFleetCard = (r: Rec) => {
    const contracts = r._contract_count ?? 1;
    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 cursor-pointer flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-bold text-[14px] text-slate-900 leading-snug">
              {r.license_plate ? `${r.license_plate}: ${r.model_name || r.name}` : (r.display_name || r.name)}
            </h5>
            {r.state === 'maintenance' ? (
              <ShieldAlert size={15} className="text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            )}
          </div>
          {r.category && (
            <div className="mt-1.5">
              <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                {r.category}
              </span>
            </div>
          )}
          <div className="mt-2 space-y-1 text-[12px] text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <Users size={12} className="text-slate-400 shrink-0" />
              <span>{r.driver_id__label || `${r.seats || 33} Seats`}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSmartDrill?.('fleet.vehicle.log.contract', 'vehicle_id', r.id);
            }}
            className="text-[var(--oe-brand-primary)] font-semibold hover:underline"
          >
            {contracts} Contract(s)
          </button>
          <Clock size={13} className="text-slate-400" />
        </div>
      </div>
    );
  };

  const renderCourseCard = (r: Rec) => {
    const title = r[modelDef.kanban.title] || r.display_name || `#${r.id}`;
    const code = r.code || (typeof title === 'string' ? title.toLowerCase().slice(0, 12).replace(/[^a-z0-9]/g, '') : `rec_${r.id}`);
    const tag = r.category_id__label || r.department_id__label || r.program_id__label || 'General';
    const enrolledCount = r.total_enrollment ?? (r._smart_counts?.find((s: any) => s.string.toLowerCase().includes('enroll') || s.string.toLowerCase().includes('student'))?.count ?? 0);
    const lessonCount = r.total_modules ?? (r._smart_counts?.find((s: any) => s.string.toLowerCase().includes('lesson') || s.string.toLowerCase().includes('lms'))?.count ?? 0);
    const duration = r.total_time ? `${r.total_time} hrs` : (r.duration || '4.00 hrs');
    const rating = r.rating_avg_stars ? Number(r.rating_avg_stars).toFixed(1) : (r.rating ? Number(r.rating).toFixed(1) : '5.0');
    const ratingCount = r.rating_count ?? 1;

    // OpenEduCat 19 State Ribbons
    const state = String(r.state || 'open');
    const ribbon = !r.active && r.active !== undefined
      ? { text: 'ARCHIVED', cls: 'ribbon-warning bg-amber-500' }
      : state === 'draft'
      ? { text: 'DRAFT', cls: 'ribbon-info bg-cyan-500' }
      : state === 'open' && !r.website_published && !r.is_lms_published
      ? { text: 'CONFIRMED', cls: 'ribbon-secondary bg-slate-500' }
      : state === 'open'
      ? { text: 'PUBLISHED', cls: 'ribbon-success bg-emerald-600' }
      : state === 'closed'
      ? { text: 'CLOSED', cls: 'ribbon-danger bg-rose-600' }
      : null;

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-shadow hover:shadow-sm cursor-pointer flex flex-col justify-between min-h-[185px]"
      >
        {ribbon && (
          <div className="ribbon">
            <span className={ribbon.cls}>{ribbon.text}</span>
          </div>
        )}

        <div>
          <div className="pr-12">
            <h5 className="font-bold text-[15px] text-[#212529] leading-snug line-clamp-2">
              {String(r.display_name || title)}
            </h5>
            <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <span className="text-slate-400">#</span>
              <span>{code}</span>
            </div>
          </div>

          <div className="mt-2.5">
            <span className="inline-block bg-[#f8f9fa] border border-[#e9ecef] text-[#495057] px-2.5 py-0.5 rounded-full text-[11px] font-medium truncate max-w-full">
              {String(tag)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-[11.5px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSmartDrill?.('op.course.enrollment', 'course_id', r.id);
              }}
              className="bg-[#f8f9fa] hover:bg-slate-200/80 border border-slate-200/90 rounded px-2.5 py-1.5 flex items-center justify-between text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={12} className="text-slate-500 shrink-0" />
                <span>Enrolled</span>
              </span>
              <span className="bg-slate-200/90 text-slate-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                {enrolledCount}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSmartDrill?.('op.course.module', 'course_id', r.id);
              }}
              className="bg-[#f8f9fa] hover:bg-slate-200/80 border border-slate-200/90 rounded px-2.5 py-1.5 flex items-center justify-between text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen size={12} className="text-slate-500 shrink-0" />
                <span>Lessons</span>
              </span>
              <span className="bg-slate-200/90 text-slate-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                {lessonCount}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <div className="flex items-center gap-1 text-[var(--oe-brand-primary)] font-medium">
            <Clock size={12} />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span>{rating} ( {ratingCount} )</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseModuleCard = (r: Rec) => {
    const title = r.name || r.display_name || `#${r.id}`;
    const cat = String(r.module_category || r.content_type || 'document');
    const isPub = r.is_published !== false;
    const dur = r.completion_time ? `${r.completion_time}h` : (r.duration_mins ? `${r.duration_mins}m` : '30m');

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[145px]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              {cat}
            </span>
            <h5 className="font-semibold text-[13.5px] text-slate-900 leading-snug line-clamp-2 mt-1">
              {String(title)}
            </h5>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isPub ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {isPub ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[160px]">{r.course_id__label || 'All Courses'}</span>
          <span className="flex items-center gap-1 text-slate-600 font-mono font-medium">
            <Clock size={11} />
            <span>{dur}</span>
          </span>
        </div>
      </div>
    );
  };

  const renderEnrollmentCard = (r: Rec) => {
    const prog = Number(r.progress ?? 0);
    const state = String(r.state || 'in_progress');
    const stBadge = state === 'done'
      ? { cls: 'bg-emerald-100 text-emerald-800', label: 'Done' }
      : state === 'draft'
      ? { cls: 'bg-slate-100 text-slate-700', label: 'Draft' }
      : { cls: 'bg-cyan-100 text-cyan-800', label: 'In Progress' };

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[145px]"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[13.5px] text-slate-900 truncate">
              {r.user_id__label || `Learner #${r.user_id || r.id}`}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stBadge.cls}`}>
              {stBadge.label}
            </span>
          </div>
          <div className="text-[12px] text-slate-600 mt-1 truncate">
            {r.course_id__label}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>Completion Progress</span>
            <span>{prog}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${prog >= 100 ? 'bg-emerald-500' : 'bg-[var(--oe-brand-primary)]'}`}
              style={{ width: `${Math.min(100, prog)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAdmissionRegisterCard = (r: Rec) => {
    const title = r[modelDef.kanban.title] || r.display_name || `#${r.id}`;
    const primarySmart = modelDef.smart[0];
    const smartInfo = r._smart_counts?.[0];
    const st = String(r.state || 'draft');
    const ribbonClass =
      st === 'draft'
        ? 'ribbon ribbon-info'
        : st === 'confirm'
        ? 'ribbon ribbon-primary'
        : st === 'application'
        ? 'ribbon ribbon-warning'
        : st === 'admission'
        ? 'ribbon ribbon-primary'
        : st === 'done'
        ? 'ribbon ribbon-success'
        : st === 'cancel'
        ? 'ribbon ribbon-danger'
        : '';
    const ribbonLabel =
      st === 'application'
        ? 'PUBLISHED'
        : st === 'admission'
        ? 'ADMISSION'
        : st.toUpperCase();

    const appCount = smartInfo?.count ?? r.application_count ?? ((r._register_stats?.draft ?? 0) + (r._register_stats?.confirm ?? 0) + (r._register_stats?.enroll ?? 0));

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between"
      >
        {ribbonClass && (
          <div className={ribbonClass}>
            <span>{ribbonLabel}</span>
          </div>
        )}
        <div>
          <div className="flex items-start gap-1.5 pr-10">
            <Star size={14} className="text-amber-400 fill-amber-400 mt-0.5 shrink-0" />
            <h5 className="font-semibold text-[15px] text-[var(--oe-brand-primary)] hover:underline leading-snug">
              {String(r.display_name || title)}
            </h5>
          </div>
          <div className="mt-1.5 space-y-1 text-[12px] text-slate-600">
            {(r.start_date || r.end_date) && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span>{formatDateRange(r.start_date, r.end_date)}</span>
              </div>
            )}
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11.5px]">
            <div className="bg-[#f8f9fa] border border-slate-200/80 rounded px-2 py-1 flex items-center justify-between text-slate-700">
              <span className="truncate">Draft</span>
              <span className="px-1.5 rounded-full bg-slate-200/80 text-[10.5px] font-bold shrink-0 ms-1">{r._register_stats?.draft ?? 0}</span>
            </div>
            <div className="bg-[#f8f9fa] border border-slate-200/80 rounded px-2 py-1 flex items-center justify-between text-slate-700">
              <span className="truncate">Confirm</span>
              <span className="px-1.5 rounded-full bg-slate-200/80 text-[10.5px] font-bold shrink-0 ms-1">{r._register_stats?.confirm ?? 0}</span>
            </div>
            <div className="bg-[#f8f9fa] border border-slate-200/80 rounded px-2 py-1 flex items-center justify-between text-slate-700">
              <span className="truncate">Enroll</span>
              <span className="px-1.5 rounded-full bg-slate-200/80 text-[10.5px] font-bold shrink-0 ms-1">{r._register_stats?.enroll ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-slate-500 capitalize font-medium">{r.state || 'Draft'}</span>
            <span className="text-[var(--oe-brand-primary)] inline-flex items-center gap-1 hover:underline"><ExternalLink size={11} /> Template</span>
          </div>
          {primarySmart && onSmartDrill && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSmartDrill(primarySmart.model, primarySmart.field, r.id);
              }}
              className="w-full py-1.5 px-3 rounded-[4px] text-[12.5px] font-semibold text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <FileText size={12} />
              <span>Applications ({appCount})</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderLeaveRequestCard = (r: Rec) => {
    const studentName = r.student_id__label || r.student_id || `#${r.id}`;
    const leaveType = r.leave_type__label || r.leave_type || '';
    const faculty = r.faculty_id__label || r.faculty_id;
    const startDate = r.start_date ? String(r.start_date).slice(0, 10) : '';
    const endDate = r.end_date ? String(r.end_date).slice(0, 10) : '';
    const duration = r.duration ? `${r.duration} Days` : '';
    const desc = r.description ? String(r.description) : '';
    const state = String(r.state || 'draft');

    const ribbonColor = {
      draft: 'bg-info text-white',
      confirm: 'bg-primary text-white',
      validate: 'bg-warning text-dark',
      approve: 'bg-success text-white',
      refuse: 'bg-danger text-white',
      cancel: 'bg-secondary text-white',
    }[state] || 'bg-secondary text-white';

    const ribbonText = {
      draft: 'Draft',
      confirm: 'Confirm',
      validate: 'Validate',
      approve: 'Approved',
      refuse: 'Refused',
      cancel: 'Cancelled',
    }[state] || state.toUpperCase();

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between p-3"
      >
        <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${ribbonColor}`}>
          {ribbonText}
        </div>
        <div className="flex items-center gap-2.5 mb-2 pe-14">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-[#e9ecef] flex items-center justify-center font-bold text-sm text-[var(--oe-brand-primary)] shrink-0">
            {String(studentName).slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-bold text-[14px] text-[var(--oe-brand-primary)] truncate" title={String(studentName)}>
              {String(studentName)}
            </h5>
            {leaveType && (
              <span className="text-[11.5px] text-slate-500 flex items-center gap-1">
                <Tag size={10} className="shrink-0" />
                <span className="truncate">{leaveType}</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1 text-[12px] text-slate-600 my-1">
          {faculty && (
            <div className="flex items-center gap-1.5 truncate">
              <Users size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{faculty}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-1.5 truncate">
              <Calendar size={12} className="text-slate-400 shrink-0" />
              <span>{startDate}{endDate && endDate !== startDate ? ` - ${endDate}` : ''}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1.5 truncate">
              <Clock size={12} className="text-slate-400 shrink-0" />
              <span>{duration}</span>
            </div>
          )}
          {desc && (
            <div className="text-[11.5px] text-slate-500 line-clamp-2 mt-1 italic">
              "{desc}"
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-[#dee2e6] flex items-center justify-end text-slate-400">
          <Clock size={12} />
        </div>
      </div>
    );
  };

  const renderPersonDirectoryCard = (r: Rec) => {
    const fullName = r.display_name || r.name || [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ') || `#${r.id}`;
    const avatarVal = r[modelDef.kanban.image || 'image_1920'] || r.image_1920 || r.image;
    const initials = fullName.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();
    const emailVal = r.email || r.work_email;
    const phoneVal = r.phone || r.mobile || r.work_phone;
    const isStudent = modelDef.name === 'op.student';

    const pillButtons = isStudent
      ? [
          { label: 'Courses', target: 'op.student.course', field: 'student_id', icon: <BookOpen size={11} className="text-slate-600" /> },
          { label: 'Fees Plans', target: 'op.fees.plan', field: 'student_id', icon: <CreditCard size={11} className="text-slate-600" /> },
        ]
      : modelDef.name === 'op.faculty'
      ? [
          { label: 'Courses', target: 'op.course', field: '', icon: <BookOpen size={11} className="text-slate-600" /> },
          { label: 'Subjects', target: 'op.subject', field: '', icon: <FileText size={11} className="text-slate-600" /> },
        ]
      : modelDef.smart.slice(0, 2).map((s) => ({
          label: s.string, target: s.model, field: s.field, icon: <BookOpen size={11} className="text-slate-600" />,
        }));

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[156px] overflow-hidden"
      >
        <div className="p-3.5 flex items-start gap-3">
          <div className={`${isStudent ? 'w-[85px] h-[85px] rounded-[6px]' : 'w-[76px] h-[76px] rounded-[6px]'} bg-slate-100 border border-[#e9ecef] flex items-center justify-center overflow-hidden shrink-0 shadow-sm`}>
            {typeof avatarVal === 'string' && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http')) ? (
              <img src={avatarVal} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--oe-brand-primary)] font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h5 className={`font-bold ${isStudent ? 'text-[16px]' : 'text-[15px]'} text-[#212529] truncate`}>{fullName}</h5>
            {r.job_title && (
              <div className="text-[12px] text-slate-600 truncate font-medium">{r.job_title}</div>
            )}
            {emailVal && (
              <div className="text-[12px] text-slate-600 flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-[#1565C0] shrink-0" />
                <span className="truncate">{emailVal}</span>
              </div>
            )}
            {phoneVal && (
              <div className="text-[12px] text-slate-600 flex items-center gap-1.5 truncate">
                <Phone size={12} className="text-[#469408] shrink-0" />
                <span className="truncate">{phoneVal}</span>
              </div>
            )}
            {r.gr_no && (
              <div className="text-[#1565C0] font-semibold text-[11px] bg-[rgba(21,101,192,0.08)] px-1.5 py-0.5 rounded w-fit mt-0.5">
                #{r.gr_no}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-[#e9ecef] px-3 py-2 flex items-center justify-between bg-white text-[11.5px]">
          <div className="flex items-center gap-1.5">
            {pillButtons.map((pb) => (
              <button
                key={pb.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSmartDrill?.(pb.target, pb.field, r.id);
                }}
                className="px-2 py-0.5 rounded border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-200/70 text-slate-700 font-medium inline-flex items-center gap-1"
              >
                {pb.icon}
                <span>{pb.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-500">
            <Clock size={12} />
          </div>
        </div>
      </div>
    );
  };

  const renderGenericGridCard = (r: Rec) => {
    const title = r[modelDef.kanban.title] || r.display_name || `#${r.id}`;
    const showRibbon = modelDef.ribbon && String(r[modelDef.ribbon.field]) === modelDef.ribbon.value;
    const primarySmart = modelDef.smart[0];
    const smartInfo = r._smart_counts?.[0];

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="relative overflow-hidden bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex flex-col justify-between min-h-[125px]"
      >
        {showRibbon && (
          <div className="ribbon">
            <span>{modelDef.ribbon!.label}</span>
          </div>
        )}

        <div>
          <h5 className="font-bold text-[14.5px] text-[#212529] leading-snug pr-8 line-clamp-2">
            {String(r.display_name || title)}
          </h5>
          <div className="mt-2 space-y-1 text-[12px] text-slate-600">
            {modelDef.kanban.sub.map((sf) => {
              const fd = modelDef.fields[sf];
              const rawVal = r[`${sf}__label`] ?? r[sf];
              if (!rawVal) return null;
              const disp = fd?.type === 'date' ? formatDate(rawVal) : fd?.type === 'monetary' ? formatMoney(rawVal, currency) : String(rawVal);
              return (
                <div key={sf} className="flex items-center gap-1.5 truncate">
                  {sf.includes('date') ? (
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                  ) : sf.includes('code') ? (
                    <Hash size={12} className="text-slate-400 shrink-0" />
                  ) : (
                    <Tag size={12} className="text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{disp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {(r.state || (primarySmart && smartInfo)) && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
            {r.state && (
              <span className="px-2 py-0.5 rounded bg-[#f8f9fa] border border-[#e9ecef] text-slate-700 capitalize font-medium">
                {String(r.state)}
              </span>
            )}
            {primarySmart && smartInfo && (
              <span className="text-[var(--oe-brand-primary)] font-semibold">
                {primarySmart.string} ({smartInfo.count})
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

const MODULE_ICON_META: Record<string, [string, string]> = {
  openeducat_core: ['sis', '#1E40AF'],
  openeducat_admission: ['admissions', '#E11D48'],
  openeducat_lms: ['lms', '#0F766E'],
  openeducat_timetable: ['timetable', '#D97706'],
  openeducat_attendance: ['attendance', '#EA580C'],
  openeducat_assignment: ['assignments', '#2563EB'],
  openeducat_exam: ['exams', '#059669'],
  openeducat_grading: ['gradebook', '#0EA5E9'],
  openeducat_quiz: ['quiz', '#F59E0B'],
  openeducat_thesis: ['thesis', '#047857'],
  openeducat_omr: ['omr', '#1D4ED8'],
  openeducat_campus_enterprise: ['campus', '#10B981'],
  openeducat_transportation_enterprise: ['transportation', '#D97706'],
  openeducat_library: ['library', '#2563EB'],
  openeducat_digital_library: ['digital_library', '#059669'],
  openeducat_placement_enterprise: ['placements', '#0284C7'],
  openeducat_alumni_enterprise: ['alumni', '#16A34A'],
  openeducat_notice_board_enterprise: ['notice_board', '#0F766E'],
  openeducat_multi_location_enterprise: ['multi_campus', '#2563EB'],
  openeducat_fees: ['accounting', '#0284C7'],
  openeducat_obe: ['gradebook', '#7C3AED'],
  openeducat_discipline: ['students', '#DC2626'],
  openeducat_health_enterprise: ['students', '#059669'],
  openeducat_hostel: ['campus', '#9333EA'],
  openeducat_biometric: ['attendance', '#0EA5E9'],
  openeducat_parent: ['students', '#0284C7'],
  openeducat_activity: ['events', '#EC4899'],
  openeducat_scholarship: ['approvals', '#16A34A'],
  openeducat_grievance: ['helpdesk', '#EF4444'],
  openeducat_convocation: ['alumni', '#047857'],
  account_accountant: ['accounting', '#0284C7'],
  account_mpesa_daraja: ['accounting', '#16A34A'],
  l10n_ke_etims: ['accounting', '#1E40AF'],
  sale_management: ['sales', '#F97316'],
  purchase: ['purchase', '#7C3AED'],
  stock: ['inventory', '#D97706'],
  crm: ['crm', '#0D9488'],
  website: ['website', '#0284C7'],
  website_sale: ['sales', '#0284C7'],
  event: ['events', '#EC4899'],
  mass_mailing: ['email_marketing', '#3B82F6'],
  automated_marketing: ['automated_marketing', '#0284C7'],
  whatsapp_core: ['whatsapp', '#16A34A'],
  im_livechat: ['livechat', '#E11D48'],
  survey: ['surveys', '#2563EB'],
  hr: ['hr', '#DC2626'],
  hr_recruitment: ['recruitment', '#0D9488'],
  hr_holidays: ['time_off', '#EA580C'],
  hr_expense: ['expenses', '#0284C7'],
  fleet: ['fleet', '#9333EA'],
  helpdesk_basic: ['helpdesk', '#EF4444'],
  dms: ['documents', '#F59E0B'],
  esign_intg: ['esign', '#0284C7'],
  calendar: ['calendar', '#DC2626'],
  mail: ['discuss', '#EA580C'],
  multi_approval: ['approvals', '#2563EB'],
  spreadsheet_dashboard: ['dashboards', '#7C3AED'],
  dashboard_kpi: ['kpi_dashboard', '#0284C7'],
  spreadsheet_base: ['spreadsheets', '#0284C7'],
  queue_job: ['queue_job', '#B91C1C'],
  aio_agents: ['aio', '#F59E0B'],
  openeducat_google_meet: ['calendar', '#059669'],
  openeducat_bigbluebutton: ['lms', '#1E40AF'],
  openeducat_microsoft_teams: ['discuss', '#6366F1'],
  openeducat_zoom: ['livechat', '#2563EB'],
};

  const renderModuleCard = (r: Rec) => {
    const title = r.shortdesc || r.display_name || r.name || `#${r.id}`;
    const installed = String(r.state) === 'installed';
    const [tileId, tileColor] = MODULE_ICON_META[String(r.name)] ?? [String(r.name || '').replace('openeducat_', ''), '#1E40AF'];
    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer flex items-start gap-3.5 min-h-[125px]"
      >
        <div className="w-[50px] h-[50px] rounded-[6px] bg-[#f8f9fa] border border-slate-200 flex items-center justify-center shrink-0">
          <AppTileIcon id={tileId} color={tileColor} size={32} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <div className="font-bold text-[14.5px] text-[#212529] truncate">{String(title)}</div>
            <div className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{r.summary || r.category || r.name}</div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[11.5px] font-semibold ${installed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[var(--oe-brand-primary)] text-white'}`}>
              {installed ? 'Installed' : 'Activate'}
            </span>
            <span className="px-2.5 py-1 rounded text-[11.5px] font-medium bg-[#f8f9fa] border border-[#dee2e6] text-slate-700">
              Learn More
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderGridCard = (r: Rec) => {
    if (modelDef.name === 'op.department') return renderDepartmentCard(r);
    if (modelDef.name === 'op.attendance.register') return renderAttendanceRegisterCard(r);
    if (modelDef.name === 'op.attendance.sheet') return renderAttendanceSheetCard(r);
    if (modelDef.name === 'op.session') return renderSessionCard(r);
    if (modelDef.name === 'op.assignment') return renderAssignmentCard(r);
    if (modelDef.name === 'account.journal') return renderJournalCard(r);
    if (modelDef.name === 'op.media.type') return renderLibraryTypeCard(r);
    if (modelDef.name === 'op.route.register') return renderRouteRegisterCard(r);
    if (modelDef.name === 'helpdesk.team') return renderHelpdeskTeamCard(r);
    if (modelDef.name === 'fleet.vehicle') return renderFleetCard(r);
    if (modelDef.name === 'op.course') return renderCourseCard(r);
    if (modelDef.name === 'op.course.module' || modelDef.name === 'op.lms.module') return renderCourseModuleCard(r);
    if (modelDef.name === 'op.course.enrollment') return renderEnrollmentCard(r);
    if (modelDef.name === 'op.admission.register') return renderAdmissionRegisterCard(r);
    if (modelDef.name === 'student.leave.request') return renderLeaveRequestCard(r);
    if (modelDef.name === 'ir.module.module') return renderModuleCard(r);
    if (modelDef.kanban.image || ['op.student', 'op.faculty', 'op.parent', 'hr.employee', 'res.partner'].includes(modelDef.name)) {
      return renderPersonDirectoryCard(r);
    }
    return renderGenericGridCard(r);
  };

  const renderPipelineCard = (r: Rec) => {
    if (modelDef.name === 'fleet.vehicle') return renderFleetCard(r);
    if (modelDef.name === 'student.leave.request') return renderLeaveRequestCard(r);
    if (modelDef.name === 'op.attendance.sheet') return renderAttendanceSheetCard(r);
    if (modelDef.name === 'op.session') return renderSessionCard(r);
    if (modelDef.name === 'op.assignment') return renderAssignmentCard(r);
    if (modelDef.name === 'op.course.enrollment') return renderEnrollmentCard(r);
    const title = r[modelDef.kanban.title] || r.display_name || `#${r.id}`;
    if (modelDef.name === 'crm.lead') {
      const stars = Number(r.priority ?? 1);
      const ownerInitial = String(r.contact_name || r.name || 'A').slice(0, 1).toUpperCase();
      return (
        <div
          key={r.id}
          onClick={() => onOpenRecord(r.id)}
          className="bg-white rounded-[4px] border border-[#dee2e6] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer space-y-1.5"
        >
          <div className="font-bold text-[13.5px] text-[#212529] leading-snug">{String(r.display_name || title)}</div>
          {r.expected_revenue !== undefined && (
            <div className="text-[12.5px] font-semibold text-slate-800 font-mono">
              {formatMoney(r.expected_revenue, currency)}
            </div>
          )}
          <div className="text-[12px] text-slate-600 truncate">{r.contact_name}</div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {r.target_course__label && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-semibold truncate max-w-[160px]">
                {r.target_course__label}
              </span>
            )}
            {r.target_campus__label && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10.5px] font-medium truncate max-w-[140px]">
                {r.target_campus__label}
              </span>
            )}
          </div>
          <div className="pt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((n) => (
                <Star key={n} size={13} className={stars >= n ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
              ))}
              <Clock size={12} className="text-slate-400 ml-1.5" />
            </div>
            <div className="w-6 h-6 rounded bg-[var(--oe-brand-primary)] text-white text-[10px] font-bold flex items-center justify-center">
              {ownerInitial}
            </div>
          </div>
        </div>
      );
    }

    if (modelDef.name === 'op.admission') {
      return (
        <div
          key={r.id}
          onClick={() => onOpenRecord(r.id)}
          className="bg-white rounded-[4px] border border-[#dee2e6] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer space-y-1.5"
        >
          <div className="pe-2">
            <h5 className="font-bold text-[14px] text-[#212529] leading-snug truncate" title={String(r.name || title)}>
              {String(r.name || title)}
            </h5>
            {r.application_number && (
              <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                {String(r.application_number)}
              </span>
            )}
          </div>
          <div className="space-y-1 text-[12px] text-slate-600 pt-0.5">
            {r.course_id__label && (
              <div className="flex items-center gap-1.5 truncate">
                <FileText size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{r.course_id__label}</span>
              </div>
            )}
            {r.email && (
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{String(r.email)}</span>
              </div>
            )}
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end text-slate-400">
            <Clock size={12} />
          </div>
        </div>
      );
    }

    return (
      <div
        key={r.id}
        onClick={() => onOpenRecord(r.id)}
        className="bg-white rounded-[4px] border border-[#dee2e6] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[var(--oe-brand-primary)]/60 transition-all cursor-pointer"
      >
        <div className="font-bold text-[13.5px] text-[#212529] leading-snug">
          {String(r.display_name || title)}
        </div>
        {modelDef.kanban.sub.map((sf) => {
          const val = r[`${sf}__label`] ?? r[sf];
          if (!val) return null;
          return (
            <div key={sf} className="text-[12px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
              {sf.includes('email') ? <Mail size={11} className="shrink-0" /> : sf.includes('course') ? <BookOpen size={11} className="shrink-0" /> : null}
              <span className="truncate">{String(val)}</span>
            </div>
          );
        })}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{r.application_number || r.code || ''}</span>
          <Clock size={13} />
        </div>
      </div>
    );
  };

  // Column / Stage Kanban (Pipelines)
  if (effectiveGroup && groupField) {
    const columns: { key: string; label: string; items: Rec[] }[] = [];
    if (groupField.type === 'selection' && groupField.selection) {
      for (const [k, label] of groupField.selection) {
        columns.push({ key: k, label, items: records.filter((r) => String(r[effectiveGroup]) === k) });
      }
    } else {
      const seen = new Map<string, { key: string; label: string; items: Rec[] }>();
      for (const r of records) {
        const k = String(r[effectiveGroup] ?? '__none__');
        const label = String(r[`${effectiveGroup}__label`] ?? r[effectiveGroup] ?? 'Other');
        if (!seen.has(k)) seen.set(k, { key: k, label, items: [] });
        seen.get(k)!.items.push(r);
      }
      columns.push(...seen.values());
    }

    return (
      <div className="p-4 overflow-x-auto bg-[var(--oe-bg-workspace)] min-h-[calc(100vh-7rem)]">
        <div className="flex gap-3.5 min-w-max items-start">
          {columns.map((col) => {
            const stageRevenue = col.items.reduce((s, item) => s + Number(item.expected_revenue ?? item.fees ?? 0), 0);
            return (
              <div key={col.key} className="w-[300px] shrink-0">
                <div className="px-1 py-1.5 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[14px] text-slate-900 truncate">
                      {col.label}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-[12px] font-bold text-slate-700">{col.items.length}</span>
                      <Plus size={14} />
                    </div>
                  </div>
                  {modelDef.name === 'crm.lead' && (
                    <div className="text-[12px] font-semibold text-slate-700 mb-1.5 font-mono">
                      {formatMoney(stageRevenue, currency)}
                    </div>
                  )}
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#198754]" style={{ width: col.items.length > 0 ? '60%' : '0%' }} />
                    <div className="h-full bg-amber-400" style={{ width: col.items.length > 0 ? '25%' : '0%' }} />
                  </div>
                </div>
                <div className="space-y-2.5">{col.items.map(renderPipelineCard)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const gridColsClass =
    modelDef.name === 'account.journal'
      ? 'grid-cols-1 lg:grid-cols-2'
      : ['op.media.type', 'op.route.register', 'helpdesk.team'].includes(modelDef.name)
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`p-4 grid ${gridColsClass} gap-4 bg-[var(--oe-bg-workspace)]`}>
      {records.length === 0 ? (
        <div className="col-span-full text-center py-14 text-sm text-slate-400 bg-white rounded border border-dashed border-slate-300">
          No records match the current filter. Click <strong>New</strong> to create one.
        </div>
      ) : (
        records.map(renderGridCard)
      )}
    </div>
  );
};
