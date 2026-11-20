import React, { useEffect, useState } from 'react';
import {
  Building2, GraduationCap, Landmark, ShieldAlert, Clock, Send, Bot,
  CheckCircle2, Download, CalendarClock, ScanLine, RefreshCw, Users, Globe, ExternalLink,
  Upload, X, Trash2, FileText, Share2, Star, Bookmark, ChevronsLeft, ChevronsRight,
  Eye, EyeOff, Mail,
} from 'lucide-react';
import { apiFetch, callKw } from '../../lib/api';
import { useErp } from '../../context/ErpContext';
import { AppTileIcon } from '../AppSvgIcons';

export const KpiDashboardView: React.FC = () => {
  const { selectedCompanyIds, currencyCode, openModel, showToast } = useErp();
  const [data, setData] = useState<any>(null);
  const [dashTab, setDashTab] = useState<'my' | 'create' | 'demo' | 'openeducat'>('openeducat');
  const [dateRange, setDateRange] = useState('All Time');

  const load = () => {
    apiFetch('/api/v1/kpi/executive').then(setData).catch((e) => showToast(e.message, 'error'));
  };

  useEffect(() => {
    load();
  }, [selectedCompanyIds]);

  if (!data) return <div className="p-6 text-xs text-slate-500">Loading Executive KPIs...</div>;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Tabs & Date Filter matching step_630_shot_1_b3b_m43_kpi_openeducat */}
      <div className="bg-white border border-[#dee2e6] rounded-[4px] px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          {([
            ['my', 'My Dashboard'],
            ['create', 'Create Dashboard'],
            ['demo', 'Demo'],
            ['openeducat', 'OpenEduCat'],
          ] as const).map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => {
                if (k === 'create') openModel('dashboard.kpi');
                else setDashTab(k);
              }}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
                dashTab === k ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-[4px] bg-white text-slate-700"
          >
            {['All Time', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'Last 30 days', 'Last 90 days', 'Last 365 days'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button onClick={() => openModel('ir.cron')} className="px-3 py-1.5 rounded-[4px] border border-[#dee2e6] bg-[#f8f9fa] hover:bg-slate-100 font-medium flex items-center gap-1.5">
            <Clock size={13} /> Cron ({data.totals.cronJobs})
          </button>
          <button onClick={load} className="px-3 py-1.5 rounded-[4px] font-medium text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {dashTab === 'my' ? 'My Personal Academic Dashboard' : dashTab === 'demo' ? 'Sample Campus Analytics' : 'Executive Multi-Campus Command Center'}
          </h1>
          <p className="text-xs text-slate-500">Window: <strong>{dateRange}</strong> · Live multi-campus telemetry, admissions pipeline, fee collection & statutory compliance</p>
        </div>
      </div>

      {/* Top KPI Cards using Odoo 19 flat 4px surface cards + Theme Tokens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => openModel('res.company')} className="text-left p-4 rounded-[4px] bg-white border border-[#dee2e6] hover:shadow-sm transition-all border-t-[3px]" style={{ borderTopColor: 'var(--oe-brand-primary)' }}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Campuses / Entities</span><Building2 size={16} className="text-[var(--oe-brand-primary)]" /></div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.totals.campuses}</div>
          <div className="text-[11px] text-slate-400 mt-1">Click to inspect campus directory</div>
        </button>

        <button onClick={() => openModel('op.student')} className="text-left p-4 rounded-[4px] bg-white border border-[#dee2e6] hover:shadow-sm transition-all border-t-[3px]" style={{ borderTopColor: 'var(--oe-brand-accent)' }}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Enrolled Learners</span><GraduationCap size={16} className="text-[var(--oe-brand-accent)]" /></div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.totals.students}</div>
          <div className="text-[11px] text-slate-400 mt-1">Admissions in pipeline: {data.totals.admissions}</div>
        </button>

        <button onClick={() => openModel('account.move')} className="text-left p-4 rounded-[4px] bg-white border border-[#dee2e6] hover:shadow-sm transition-all border-t-[3px]" style={{ borderTopColor: 'var(--oe-brand-gold)' }}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Fees Invoiced ({currencyCode})</span><Landmark size={16} className="text-amber-600" /></div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{currencyCode} {Number(data.totals.totalInvoiced).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Collected: {currencyCode} {Number(data.totals.totalCollected).toLocaleString()}</div>
        </button>

        <div className="p-4 rounded-[4px] bg-white border border-[#dee2e6] border-t-[3px]" style={{ borderTopColor: 'var(--oe-card-coral)' }}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Statutory Compliance Radar</span><ShieldAlert size={16} className="text-rose-600" /></div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Pupil&apos;s Pass Due ({data.complianceRadar.warnDays}d)</span>
              <span className="font-bold text-rose-600">{data.complianceRadar.expiringPupilsPasses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Good Conduct Certs Due</span>
              <span className="font-bold text-amber-600">{data.complianceRadar.expiringGoodConductCerts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Rollup Table & Admissions Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-[4px] border border-[#dee2e6] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#f8f9fa] border-b border-[#dee2e6] font-semibold text-xs text-slate-700">
            Campus-by-Campus Operational Breakdown
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Campus / Entity</th>
                  <th className="px-4 py-2.5">Head / Leadership</th>
                  <th className="px-4 py-2.5 text-right">Courses</th>
                  <th className="px-4 py-2.5 text-right">Learners</th>
                  <th className="px-4 py-2.5 text-right">Admissions</th>
                  <th className="px-4 py-2.5 text-right">Invoiced ({currencyCode})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.campusBreakdown.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openModel('res.company', { recordId: c.id })}>
                    <td className="px-4 py-2.5 font-semibold text-[var(--oe-brand-primary)]">{c.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.head_of_school || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{c.courses}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{c.students}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{c.admissions}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">{Number(c.invoiced).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[4px] border border-[#dee2e6] p-4">
          <div className="font-semibold text-xs text-slate-700 mb-3">Admissions Pipeline Stages</div>
          <div className="space-y-2.5 text-xs">
            {data.admissionsByStage.filter((s: any) => s.count > 0).map((s: any) => (
              <div key={s.stage} className="flex items-center justify-between">
                <span className="text-slate-600 truncate pr-2">{s.stage}</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TimetableGeneratorView: React.FC = () => {
  const { showToast, openModel } = useErp();
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({ course_id: 1, batch_id: 1, faculty_id: 1, subject_id: 1, timing_slot: '08:00-08:45', days: 5 });

  useEffect(() => {
    Promise.all([
      callKw('op.course', 'name_search', {}),
      callKw('op.batch', 'name_search', {}),
      callKw('op.faculty', 'name_search', {}),
      callKw('op.subject', 'name_search', {}),
    ]).then(([c, b, f, s]) => {
      setCourses(c.options ?? []);
      setBatches(b.options ?? []);
      setFaculties(f.options ?? []);
      setSubjects(s.options ?? []);
      setForm((prev) => ({
        ...prev,
        course_id: c.options?.[0]?.id ?? 1,
        batch_id: b.options?.[0]?.id ?? 1,
        faculty_id: f.options?.[0]?.id ?? 1,
        subject_id: s.options?.[0]?.id ?? 1,
      }));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/v1/timetable/generate', { method: 'POST', body: JSON.stringify(form) });
    showToast(`Generated ${res.createdCount} timetable session(s)`);
    openModel('op.session');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          <CalendarClock size={18} className="text-[var(--oe-brand-primary)]" />
          <span>Generate Timetable Sessions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Course / Year Group</span>
            <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded">
              {courses.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Batch / Stream</span>
            <select value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded">
              {batches.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Faculty</span>
            <select value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded">
              {faculties.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Subject</span>
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded">
              {subjects.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Campus Bell Interval</span>
            <select value={form.timing_slot} onChange={(e) => setForm({ ...form, timing_slot: e.target.value })} className="w-full p-2 border border-slate-300 rounded">
              <option value="08:00-08:45">Period 1 (08:00–08:45)</option>
              <option value="08:45-09:30">Period 2 (08:45–09:30)</option>
              <option value="08:00-15:00">Nursery & IED Block (08:00–15:00)</option>
              <option value="15:20-16:20">Primary Paid Clubs (15:20–16:20)</option>
              <option value="08:00-16:30">Senior High Full Day (08:00–16:30)</option>
              <option value="09:00-12:00">Mombasa Saturday Enrichment (09:00–12:00)</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Days to Generate</span>
            <input type="number" min={1} max={14} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded" />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-md text-white font-semibold bg-[var(--oe-brand-primary)]">Proceed & Generate</button>
        </div>
      </form>
    </div>
  );
};

export const AttendanceKioskView: React.FC = () => {
  const { showToast } = useErp();
  const [pin, setPin] = useState('1001');
  const [lastCheckin, setLastCheckin] = useState<any>(null);

  const checkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/v1/attendance/kiosk-checkin', { method: 'POST', body: JSON.stringify({ pin }) });
      setLastCheckin(res.student);
      showToast(`Checked in: ${res.student.display_name}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <form onSubmit={checkIn} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white bg-[var(--oe-brand-primary)]">
          <ScanLine size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Student Attendance Kiosk</h2>
        <p className="text-xs text-slate-500">Enter Student Badge ID, Admission No, or Kiosk PIN (try <code>1001</code> or <code>OAN/2026/0001</code>)</p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full text-center text-lg font-mono tracking-widest py-2.5 border border-slate-300 rounded-lg"
        />
        <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold text-sm bg-[var(--oe-brand-primary)]">
          Check In Now
        </button>
        {lastCheckin && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Checked in: <strong>{lastCheckin.display_name}</strong> ({lastCheckin.gr_no})
          </div>
        )}
      </form>
    </div>
  );
};

export const WhatsAppInboxView: React.FC = () => {
  const { showToast } = useErp();
  const [outbox, setOutbox] = useState<any[]>([]);
  const [to, setTo] = useState('+254722810400');
  const [body, setBody] = useState('Dear Parent, reminder that Term 1 fee statements & IGCSE subject forms are ready on your /my portal.');

  const load = () => callKw('comm.outbox', 'search_read', {}).then((r) => setOutbox(r.records ?? []));
  useEffect(() => { load(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/v1/integrations/whatsapp/send', { method: 'POST', body: JSON.stringify({ to, body, recipient_name: 'Parent' }) });
    showToast('WhatsApp message dispatched');
    setBody('');
    load();
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="font-bold text-sm text-slate-900">Send WhatsApp Message</div>
        <form onSubmit={send} className="space-y-3 text-xs">
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+2547..." className="w-full p-2 border border-slate-300 rounded" />
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type message..." className="w-full p-2 border border-slate-300 rounded" />
          <button type="submit" className="w-full py-2 rounded-md bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5">
            <Send size={13} /> Dispatch via WhatsApp Adapter
          </button>
        </form>
      </div>
      <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-4">
        <div className="font-bold text-sm text-slate-900 mb-3">Dispatched Outbox Log ({outbox.length})</div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto text-xs">
          {outbox.map((m) => (
            <div key={m.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-800">{m.to} ({m.recipient_name})</span>
                <span className="uppercase font-bold text-emerald-700">{m.state} · {m.provider}</span>
              </div>
              <div className="mt-1 text-slate-700">{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LibraryBarcodeView: React.FC = () => {
  const { showToast, openModel } = useErp();
  const [cards, setCards] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [cardId, setCardId] = useState<number>(1);
  const [barcode, setBarcode] = useState('LIB-0001');
  const [txType, setTxType] = useState<'issue' | 'return'>('issue');
  const [lastMsg, setLastMsg] = useState('');

  const load = () => {
    Promise.all([
      callKw('op.library.card', 'search_read', { limit: 50 }),
      callKw('op.media.unit', 'search_read', { limit: 50 }),
    ]).then(([c, u]) => {
      setCards(c.records ?? []);
      setUnits(u.records ?? []);
      if (c.records?.[0] && !cardId) setCardId(c.records[0].id);
      if (u.records?.[0]?.barcode) setBarcode(u.records[0].barcode);
    });
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callKw('barcode.issue.media', 'action_issue', {
        args: { barcode, library_card_id: cardId, transaction_type: txType },
      });
      setLastMsg(res.message || 'Transaction executed');
      showToast(res.message || 'Library barcode transaction complete');
      load();
    } catch (err: any) {
      showToast(err.message || 'Barcode transaction failed', 'error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
      <form onSubmit={submit} className="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900">
          <ScanLine size={20} className="text-[var(--oe-brand-primary)]" />
          <span>Library Barcode Issue / Return</span>
        </div>
        <div className="flex gap-2">
          {(['issue', 'return'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTxType(t)}
              className={`flex-1 py-1.5 rounded font-semibold capitalize border ${
                txType === t
                  ? 'bg-[var(--oe-brand-primary)] text-white border-[var(--oe-brand-primary)]'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {t} Media
            </button>
          ))}
        </div>
        {txType === 'issue' && (
          <label className="block space-y-1">
            <span className="font-semibold text-slate-700">Student / Faculty Library Card</span>
            <select value={cardId} onChange={(e) => setCardId(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded">
              {cards.map((c) => <option key={c.id} value={c.id}>{c.number} ({c.student_id__label || c.faculty_id__label || 'Card'})</option>)}
            </select>
          </label>
        )}
        <label className="block space-y-1">
          <span className="font-semibold text-slate-700">Scan / Enter Media Unit Barcode</span>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} required className="w-full p-2 border border-slate-300 rounded font-mono" />
        </label>
        <button type="submit" className="w-full py-2 rounded font-semibold text-white bg-[var(--oe-brand-primary)]">
          Execute {txType === 'issue' ? 'Issue' : 'Return'}
        </button>
        {lastMsg && (
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            {lastMsg}
          </div>
        )}
      </form>

      <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900">Library Media Units ({units.length})</div>
          <button onClick={() => openModel('op.media.movement')} className="text-[var(--oe-brand-primary)] hover:underline font-medium">
            View Movements →
          </button>
        </div>
        <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
          {units.map((u) => (
            <div
              key={u.id}
              onClick={() => setBarcode(u.barcode || '')}
              className="py-2 flex items-center justify-between hover:bg-slate-50 px-2 rounded cursor-pointer"
            >
              <div>
                <div className="font-semibold text-slate-800">{u.name}</div>
                <div className="text-[11px] font-mono text-slate-500">Barcode: {u.barcode || 'N/A'}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${u.state === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {u.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AiPlaygroundView: React.FC<{ mode?: 'playground' | 'lms' | 'quiz' }> = ({ mode = 'playground' }) => {
  const { openModel, showToast } = useErp();
  const [prompt, setPrompt] = useState(
    mode === 'lms'
      ? 'Cambridge IGCSE Physics: Waves, Optics & Sound'
      : mode === 'quiz'
      ? 'Edexcel AS Mathematics: Differentiation Formative Check'
      : 'Summarize IGCSE 9-subject & AS-Level 5-credit rules for our Year 9–12 parents',
  );
  const [count, setCount] = useState(3);
  const [reply, setReply] = useState('');
  const [createdRecord, setCreatedRecord] = useState<{ model: string; id: number; name: string } | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'lms') {
      const res = await apiFetch<{ course: any }>('/api/v1/ai/generate-course', {
        method: 'POST',
        body: JSON.stringify({ topic: prompt, modulesCount: count }),
      });
      setCreatedRecord({ model: 'op.course', id: res.course.id, name: res.course.name });
      setReply(`Created LMS Course "${res.course.name}" with ${count} published syllabus modules.`);
      showToast(`Generated LMS Course "${res.course.name}"`);
      return;
    }
    if (mode === 'quiz') {
      const res = await apiFetch<{ quiz: any }>('/api/v1/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({ topic: prompt, questionCount: count }),
      });
      setCreatedRecord({ model: 'op.quiz', id: res.quiz.id, name: res.quiz.name });
      setReply(`Created Online Quiz "${res.quiz.name}" with ${count} questions (ready for students).`);
      showToast(`Generated Online Quiz "${res.quiz.name}"`);
      return;
    }
    const res = await apiFetch('/api/v1/integrations/ai/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    setReply(res.reply);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900">
          <Bot size={20} className="text-[var(--oe-brand-primary)]" />
          <span>
            {mode === 'lms'
              ? 'AI LMS Course & Syllabus Generator'
              : mode === 'quiz'
              ? 'AI Quiz & Assessment Generator'
              : 'AIO AI Agent Playground'}
          </span>
        </div>
        <form onSubmit={run} className="flex flex-wrap gap-2">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1 min-w-[240px] px-3 py-2 text-xs border border-slate-300 rounded-lg" />
          {(mode === 'lms' || mode === 'quiz') && (
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-20 px-2.5 py-2 text-xs border border-slate-300 rounded-lg"
              title={mode === 'lms' ? 'Modules count' : 'Questions count'}
            />
          )}
          <button type="submit" className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--oe-brand-primary)]">
            {mode === 'lms' ? 'Generate Course' : mode === 'quiz' ? 'Generate Quiz' : 'Ask Agent'}
          </button>
        </form>
        {reply && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2">
            <div className="whitespace-pre-wrap">{reply}</div>
            {createdRecord && (
              <button
                type="button"
                onClick={() => openModel(createdRecord.model, { recordId: createdRecord.id, view: 'form' })}
                className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold"
              >
                Open {createdRecord.name} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const SettingsPanelView: React.FC = () => {
  const { settings, companies, user, refreshSession, showToast, seedProfile, navigate, activeCompany } = useErp();
  const [form, setForm] = useState<Record<string, any>>(settings);
  const [tab, setTab] = useState('general');
  const [q, setQ] = useState('');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [previewTick, setPreviewTick] = useState(0);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [previewEmailTpl, setPreviewEmailTpl] = useState<string | null>(null);
  useEffect(() => {
    setForm(settings);
  }, [settings]);
  const [layoutDraft, setLayoutDraft] = useState<Record<string, any>>({
    external_report_layout_id: 'light',
    font: 'lato',
    paperformat: 'letter',
    theme_primary: '#1565c0',
    theme_accent: '#495057',
    street: '',
    city: '',
    report_header: '',
    report_footer: '',
    logo: '',
  });

  useEffect(() => { setForm(settings); }, [settings]);

  const openLayoutModal = () => {
    setLayoutDraft({
      external_report_layout_id: activeCompany?.external_report_layout_id || 'light',
      font: activeCompany?.font || 'lato',
      paperformat: activeCompany?.paperformat || 'letter',
      theme_primary: activeCompany?.theme_primary || '#1565c0',
      theme_accent: activeCompany?.theme_accent || '#495057',
      street: activeCompany?.street || '',
      city: activeCompany?.city || '',
      report_header: activeCompany?.report_header || '',
      report_footer: activeCompany?.report_footer || '',
      logo: activeCompany?.logo || '',
    });
    setPreviewTick((t) => t + 1);
    setShowLayoutModal(true);
  };

  const saveLayoutModal = async () => {
    if (!activeCompany?.id) return;
    await callKw('res.company', 'write', { id: activeCompany.id, vals: layoutDraft });
    await refreshSession();
    setShowLayoutModal(false);
    showToast('Document layout updated');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCompany?.id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      setLayoutDraft((p) => ({ ...p, logo: dataUrl }));
      await callKw('res.company', 'write', { id: activeCompany.id, vals: { logo: dataUrl } });
      await refreshSession();
      setPreviewTick((t) => t + 1);
      showToast('Company logo updated');
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = async () => {
    if (!activeCompany?.id) return;
    setLayoutDraft((p) => ({ ...p, logo: '' }));
    await callKw('res.company', 'write', { id: activeCompany.id, vals: { logo: '' } });
    await refreshSession();
    setPreviewTick((t) => t + 1);
    showToast('Company logo removed');
  };

  const save = async () => {
    const res = await apiFetch<{ settings: Record<string, any> }>('/api/v1/settings', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (res.settings) setForm(res.settings);
    await refreshSession();
    showToast('Settings saved');
  };

  const downloadEdi = async () => {
    const edi = await apiFetch('/api/v1/integrations/exam-boards/edi-export');
    const blob = new Blob([JSON.stringify(edi, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'caie-edexcel-edi-export.json';
    a.click();
    showToast(`Exported EDI for ${edi.candidates_count} candidate(s)`);
  };

  const switchSeed = async (profile: 'oshwal' | 'default') => {
    await apiFetch('/api/v1/admin/switch-seed', { method: 'POST', body: JSON.stringify({ profile }) });
    await refreshSession();
    showToast(`Active seed switched to ${profile}`);
    navigate({ area: 'apps' });
  };

  const sidebarSections = [
    ['general', 'General Settings'],
    ['events', 'Events'],
    ['crm', 'CRM'],
    ['whatsapp', 'Whatsapp'],
    ['sales', 'Sales'],
    ['calendar', 'Calendar'],
    ['meetings', 'Online Tools Integration'],
    ['documents', 'Documents'],
    ['website', 'Website'],
    ['purchase', 'Purchase'],
    ['inventory', 'Inventory'],
    ['mpesa', 'Invoicing & M-Pesa'],
    ['ai', 'AI'],
    ['openeducat', 'OpenEduCat'],
    ['helpdesk', 'Helpdesk'],
    ['email', 'Email Marketing'],
    ['employees', 'Employees'],
    ['recruitment', 'Recruitment'],
    ['expenses', 'Expenses'],
    ['fleet', 'Fleet'],
  ];

  const sectionIconMap: Record<string, string> = {
    general: 'settings',
    events: 'events',
    crm: 'crm',
    whatsapp: 'whatsapp',
    sales: 'sales',
    calendar: 'calendar',
    meetings: 'livechat',
    documents: 'documents',
    website: 'website',
    purchase: 'purchase',
    inventory: 'inventory',
    mpesa: 'accounting',
    ai: 'aio',
    openeducat: 'sis',
    helpdesk: 'helpdesk',
    email: 'email_marketing',
    employees: 'hr',
    recruitment: 'recruitment',
    expenses: 'expenses',
    fleet: 'fleet',
  };

  const livePreviewUrl = `/report/html/account.report_invoice_with_payments/1?layout=${encodeURIComponent(layoutDraft.external_report_layout_id)}&font=${encodeURIComponent(layoutDraft.font)}&paperformat=${encodeURIComponent(layoutDraft.paperformat)}&primary=${encodeURIComponent(layoutDraft.theme_primary)}&accent=${encodeURIComponent(layoutDraft.theme_accent)}&tagline=${encodeURIComponent(layoutDraft.report_header)}&footer=${encodeURIComponent(layoutDraft.report_footer)}&v=${previewTick}`;

  return (
    <div className="min-h-[calc(100vh-2.875rem)] flex flex-col bg-white">
      {/* Top Settings Control Bar matching step_22_shot_3_openeducat_settings */}
      <div className="bg-white border-b border-[#dee2e6] px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={save} className="px-3.5 py-1 rounded-[4px] text-[13px] font-semibold text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)]">
            Save
          </button>
          <button onClick={() => setForm(settings)} className="px-3.5 py-1 rounded-[4px] text-[13px] font-medium bg-[#f8f9fa] border border-[#dee2e6] text-[#212529] hover:bg-slate-100">
            Discard
          </button>
          <span className="ml-1 text-[15px] font-bold text-[#212529]">Settings</span>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className="w-64 px-3 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-[var(--oe-brand-primary)]"
        />
      </div>

      <div className="flex-1 flex items-stretch">
        {/* Exact 20-Item Left Vertical Settings Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 bg-[#f8f9fa] border-r border-[#dee2e6] py-2 text-[12.5px]">
          {sidebarSections.filter(([, lbl]) => !q || lbl.toLowerCase().includes(q.toLowerCase())).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition-colors ${
                  active ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-bold border-r-2 border-[var(--oe-brand-primary)]' : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <AppTileIcon id={sectionIconMap[id] || 'settings'} color="var(--oe-brand-primary)" size={18} />
                </div>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Form Canvas dynamically switching per 20 sidebar tabs matching step_22_shot_3_openeducat_settings */}
        <div className="flex-1 overflow-y-auto text-xs">
          {(tab === 'general' || q.toLowerCase().includes('user') || q.toLowerCase().includes('compan') || q.toLowerCase().includes('layout') || q.toLowerCase().includes('logo')) && (
            <>
              {/* Users Section matching step_22_shot_3 */}
              <div className="bg-[#eff1f5] px-5 py-2 font-bold text-slate-800 border-b border-slate-200 text-sm">
                Users
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200">
                <div className="space-y-3">
                  <div className="font-semibold text-slate-800 text-[13px]">Invite New Users</div>
                  <div className="flex gap-2 max-w-sm">
                    <input placeholder="Enter an email" className="oe-input flex-1 border-b border-slate-200" />
                    <button type="button" onClick={() => showToast('Invitation queued')} className="px-3.5 py-1 bg-[var(--oe-brand-primary)] text-white rounded text-xs font-semibold hover:bg-[var(--oe-brand-primary-dark)]">Invite</button>
                  </div>
                </div>
                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 text-[13px]">
                    <Users size={16} className="text-slate-600" />
                    <span>Active Users</span>
                  </div>
                  <button onClick={() => navigate({ model: 'res.users', view: 'list' })} className="text-[var(--oe-brand-primary)] hover:underline flex items-center gap-1 font-medium">
                    → Manage Users
                  </button>
                </div>
              </div>

              {/* Global Users Section */}
              <div className="bg-[#eff1f5] px-5 py-2 font-bold text-slate-800 border-b border-slate-200 text-sm">
                Global Users
              </div>
              <div className="p-5 border-b border-slate-200">
                <div className="font-semibold text-slate-800 text-[13px]">Calendar User · {user?.name || 'Administrator'}</div>
                <div className="text-slate-500 mt-0.5">Events of this user can be shared with portal users.</div>
              </div>

              {/* Languages Section */}
              <div className="bg-[#eff1f5] px-5 py-2 font-bold text-slate-800 border-b border-slate-200 text-sm">
                Languages
              </div>
              <div className="p-5 border-b border-slate-200">
                <div className="font-semibold text-slate-800 text-[13px]">12 Languages Installed</div>
                <div className="text-slate-500 mt-0.5">Active locale: English (US)</div>
              </div>

              {/* Companies & Document Layout Section matching step_22_shot_3 */}
              <div className="bg-[#eff1f5] px-5 py-2 font-bold text-slate-800 border-b border-slate-200 text-sm">
                Companies
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200">
                <div className="border-l-2 border-slate-200 pl-4 space-y-1.5">
                  <div className="font-bold text-slate-800 text-[13px]">{activeCompany?.name || 'OpenEduCat'}</div>
                  <div className="text-slate-500 leading-snug">
                    {activeCompany?.street && <div>{activeCompany.street}</div>}
                    <div>{[activeCompany?.city, activeCompany?.country || (seedProfile === 'oshwal' ? 'Kenya' : 'United States')].filter(Boolean).join(', ')}</div>
                  </div>
                  <button onClick={() => navigate({ model: 'res.company', view: 'list' })} className="text-[var(--oe-brand-primary)] hover:underline inline-block font-medium pt-1">
                    → Update Info ({companies.length} Companies)
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-4 space-y-2">
                  <div className="font-bold text-slate-800 text-[13px]">Document Layout</div>
                  <div className="text-slate-500">Choose letterhead, logo, font, paper format &amp; colors for PDF reports ({activeCompany?.external_report_layout_id || 'light'} layout).</div>
                  <button
                    type="button"
                    onClick={openLayoutModal}
                    className="text-[var(--oe-brand-primary)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileText size={13} />
                    <span>→ Configure Document Layout</span>
                  </button>
                </div>
              </div>

              {/* Quick Integration Connectivity Testers */}
              <div className="bg-[#eff1f5] px-5 py-2 font-bold text-slate-800 border-b border-slate-200 text-sm">
                System Integrations &amp; Connectivity Testers
              </div>
              <div className="p-5 border-b border-slate-200 space-y-3">
                <p className="text-slate-600">Test external gateway adapters or switch to a sidebar category to configure credentials.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['mpesa', 'Test M-Pesa Connection'],
                    ['whatsapp', 'Test WhatsApp Connection'],
                    ['sms', 'Test SMS Connection'],
                    ['email', 'Test SMTP Connection'],
                    ['meetings', 'Test Meeting Connection'],
                    ['sso', 'Test SSO Connection'],
                    ['webhook', 'Test Webhook Connection'],
                    ['ai', 'Test AI Connection'],
                  ].map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={async () => {
                        const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', {
                          method: 'POST',
                          body: JSON.stringify({ kind }),
                        });
                        showToast(res.message);
                      }}
                      className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(tab === 'openeducat' || q) && (
            <>
              <div className="bg-[#eff1f5] px-5 py-2 font-semibold text-slate-700 border-b border-slate-200">
                OpenEduCat Terminology, Academic Rules & Active Profile ({tab.toUpperCase()})
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[['term_program', 'Label for "Program"'], ['term_course', 'Label for "Course"'], ['term_batch', 'Label for "Batch"'], ['term_subject', 'Label for "Subject"'], ['term_faculty', 'Label for "Faculty"'], ['term_student', 'Label for "Student"'], ['withdrawal_notice_days', 'Withdrawal Notice Period (Days)'], ['library_fine_per_day', 'Library Overdue Fine / Day'], ['compliance_warning_days', "Pupil's Pass & Police Clearance Warning (Days)"]].map(([k, lbl]) => (
                  <div key={k} className="border-l-2 border-slate-200 pl-3 space-y-1">
                    <div className="font-semibold text-slate-800">{lbl}</div>
                    <input value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="oe-input max-w-xs border-b border-slate-200" />
                  </div>
                ))}
              </div>
            </>
          )}

          {(tab === 'mpesa' || tab === 'sales' || tab === 'purchase' || tab === 'inventory' || q.toLowerCase().includes('mpesa') || q.toLowerCase().includes('invoic')) && (
            <>
              <div className="bg-[#eff1f5] px-5 py-2 font-semibold text-slate-700 border-y border-slate-200">
                Invoicing, Sales & M-Pesa Daraja 3.0 / KRA eTIMS
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="font-semibold text-slate-800">M-Pesa Environment</div>
                  <select value={form.mpesa_env ?? 'simulate'} onChange={(e) => setForm({ ...form, mpesa_env: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="simulate">Simulation (Instant Settlement)</option>
                    <option value="sandbox">Safaricom Daraja Sandbox</option>
                    <option value="production">Safaricom Daraja Production</option>
                  </select>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="font-semibold text-slate-800">Paybill / Till Shortcode</div>
                  <input value={form.mpesa_shortcode ?? ''} onChange={(e) => setForm({ ...form, mpesa_shortcode: e.target.value })} className="oe-input max-w-xs border-b border-slate-200" />
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="font-semibold text-slate-800">Daraja Consumer Key</div>
                  <input value={form.mpesa_consumer_key ?? ''} onChange={(e) => setForm({ ...form, mpesa_consumer_key: e.target.value })} placeholder="Enter live Daraja key..." className="oe-input max-w-xs border-b border-slate-200" />
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="font-semibold text-slate-800">KRA eTIMS Integration & Connection Test</div>
                  <label className="flex items-center gap-2 text-slate-600 pt-1">
                    <input type="checkbox" checked={Boolean(form.etims_enabled)} onChange={(e) => setForm({ ...form, etims_enabled: e.target.checked })} className="accent-[var(--oe-brand-primary)]" />
                    Enable KRA eTIMS CU Invoice Numbers
                  </label>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await apiFetch<{ ok: boolean; message: string }>('/api/v1/integrations/test', {
                          method: 'POST',
                          body: JSON.stringify({ kind: 'mpesa' }),
                        });
                        showToast(res.message);
                      }}
                      className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                    >
                      Test M-Pesa Connection
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate({ model: 'payment.provider', view: 'kanban' })}
                      className="px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Payment Providers →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {(tab === 'whatsapp' || tab === 'email' || tab === 'events' || tab === 'crm' || tab === 'helpdesk' || tab === 'website') && (
            <>
              <div className="bg-[#eff1f5] px-5 py-2 font-semibold text-slate-700 border-y border-slate-200">
                Omnichannel Messaging (WhatsApp, SMS, Email SMTP & Website) — {sidebarSections.find(([id]) => id === tab)?.[1]}
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">WhatsApp Adapter</div>
                  <select value={form.whatsapp_provider ?? 'simulate'} onChange={(e) => setForm({ ...form, whatsapp_provider: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="simulate">Local Simulation Outbox</option>
                    <option value="meta_cloud">Meta WhatsApp Cloud API</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'whatsapp' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Test WhatsApp Adapter
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">SMS Gateway & Absentee Channel</div>
                  <select value={form.absentee_channel ?? 'whatsapp'} onChange={(e) => setForm({ ...form, absentee_channel: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="whatsapp">WhatsApp Parent Alert</option>
                    <option value="sms">Africa&apos;s Talking SMS</option>
                    <option value="email">Parent Email</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'sms' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Test SMS Gateway
                  </button>
                </div>
                <div className="border-l-2 border-[var(--oe-brand-primary)] pl-3 space-y-2 md:col-span-2 bg-slate-50/60 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail size={14} className="text-[var(--oe-brand-primary)]" />
                      <span>Configurable Email Relay (SMTP) &amp; HTML Templates</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${form.smtp_pass_configured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {form.smtp_pass_configured ? 'SMTP Password Saved Securely' : 'No SMTP Password Saved'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Email Provider</label>
                      <select value={form.email_provider ?? 'simulate'} onChange={(e) => setForm({ ...form, email_provider: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1">
                        <option value="simulate">Local Simulation Outbox</option>
                        <option value="smtp">Live SMTP Relay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">SMTP Host</label>
                      <input value={form.smtp_host ?? ''} placeholder="smtp.gmail.com" onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-24">
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Port</label>
                        <input type="number" value={form.smtp_port ?? 587} onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Encryption</label>
                        <select value={form.smtp_encryption ?? 'starttls'} onChange={(e) => setForm({ ...form, smtp_encryption: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1">
                          <option value="starttls">STARTTLS (587)</option>
                          <option value="ssl">SSL/TLS (465)</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">SMTP Username / Email Address</label>
                      <input value={form.smtp_user ?? ''} placeholder="your-school@gmail.com" onChange={(e) => setForm({ ...form, smtp_user: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">SMTP Password / App Password</label>
                      <div className="relative flex items-center">
                        <input
                          type={showSmtpPass ? 'text' : 'password'}
                          value={form.smtp_pass ?? ''}
                          placeholder={form.smtp_pass_configured ? '•••••••• (leave blank to keep current)' : 'Enter Gmail App Password or SMTP Password'}
                          onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
                          className="oe-input border border-slate-200 bg-white rounded px-2 py-1 pr-8"
                        />
                        <button type="button" onClick={() => setShowSmtpPass((v) => !v)} className="absolute right-2 text-slate-400 hover:text-slate-700" title="Show/Hide Password">
                          {showSmtpPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sender Display Name</label>
                      <input value={form.smtp_from_name ?? ''} placeholder="SabiEdu — Oshwal Academy" onChange={(e) => setForm({ ...form, smtp_from_name: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">From / Reply-To Email</label>
                      <input value={form.smtp_from_email ?? ''} placeholder="admissions@oshwalacademy.sc.ke" onChange={(e) => setForm({ ...form, smtp_from_email: e.target.value })} className="oe-input border border-slate-200 bg-white rounded px-2 py-1" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <input
                      value={smtpTestEmail}
                      onChange={(e) => setSmtpTestEmail(e.target.value)}
                      placeholder="Recipient email for live test (optional)..."
                      className="oe-input border border-slate-200 bg-white rounded px-2.5 py-1 w-64 max-w-full"
                    />
                    <button
                      type="button"
                      disabled={smtpTesting}
                      onClick={async () => {
                        setSmtpTesting(true);
                        try {
                          await save();
                          const res = await apiFetch<{ ok: boolean; message: string }>('/api/v1/integrations/email/test', {
                            method: 'POST',
                            body: JSON.stringify({ to: smtpTestEmail }),
                          });
                          showToast(res.message, res.ok ? 'success' : 'error');
                        } catch (err: any) {
                          showToast(err?.message || 'SMTP check failed', 'error');
                        } finally {
                          setSmtpTesting(false);
                        }
                      }}
                      className="px-3 py-1 rounded bg-[var(--oe-brand-primary)] text-white hover:bg-[var(--oe-brand-primary-dark)] font-medium disabled:opacity-60"
                    >
                      {smtpTesting ? 'Testing SMTP...' : 'Save & Test SMTP Connection'}
                    </button>
                  </div>
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Branded HTML Email Templates (Preview All Purposes):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ['admission_confirmation', 'Admission Received'],
                        ['student_enrollment', 'Student Enrolment'],
                        ['portal_credentials', 'Portal Credentials'],
                        ['fee_invoice', 'Fee Invoice'],
                        ['absentee_alert', 'Absentee Alert'],
                        ['event_badge', 'Event Pass'],
                        ['campaign_newsletter', 'Newsletter'],
                        ['smtp_test', 'SMTP Verified'],
                      ].map(([tplId, tplLabel]) => (
                        <button
                          key={tplId}
                          type="button"
                          onClick={() => setPreviewEmailTpl(tplId)}
                          className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-medium"
                        >
                          Preview: {tplLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="font-semibold text-slate-800">Website Title & Portal Demo Logins</div>
                  <input value={form.website_title ?? ''} onChange={(e) => setForm({ ...form, website_title: e.target.value })} className="oe-input max-w-xs border-b border-slate-200" />
                  <label className="flex items-center gap-2 text-slate-600 pt-1">
                    <input type="checkbox" checked={Boolean(form.demo_logins)} onChange={(e) => setForm({ ...form, demo_logins: e.target.checked })} className="accent-[var(--oe-brand-primary)]" />
                    Show One-Click Demo Role Logins on /web/login
                  </label>
                </div>
              </div>
            </>
          )}

          {(tab === 'ai' || tab === 'meetings' || tab === 'calendar' || tab === 'documents' || tab === 'employees' || tab === 'recruitment' || tab === 'expenses' || tab === 'fleet' || tab === 'openeducat') && (
            <>
              <div className="bg-[#eff1f5] px-5 py-2 font-semibold text-slate-700 border-y border-slate-200">
                {sidebarSections.find(([id]) => id === tab)?.[1]} · AI, Live Meetings, SSO/OAuth, Webhooks & Seed Profile
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">AI Provider</div>
                  <select value={form.ai_provider ?? 'none'} onChange={(e) => setForm({ ...form, ai_provider: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="none">Built-In Deterministic School Concierge</option>
                    <option value="gemini">Google Gemini API</option>
                    <option value="openai">OpenAI API</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'ai' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Test AI Adapter
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">Online Classroom / Meeting Provider</div>
                  <select value={form.meeting_provider ?? 'google_meet'} onChange={(e) => setForm({ ...form, meeting_provider: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="zoom">Zoom</option>
                    <option value="bbb">BigBlueButton</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'meetings' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Test Meeting Connector
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">SSO / OAuth 2.0 Identity Provider</div>
                  <select value={form.sso_provider ?? 'none'} onChange={(e) => setForm({ ...form, sso_provider: e.target.value })} className="oe-input max-w-xs border-b border-slate-200">
                    <option value="none">Local Auth + Demo Roles</option>
                    <option value="google">Google Workspace OAuth2</option>
                    <option value="microsoft">Microsoft Entra ID</option>
                    <option value="saml">SAML 2.0 Enterprise</option>
                  </select>
                  <input value={form.sso_client_id ?? ''} placeholder="OAuth Client ID..." onChange={(e) => setForm({ ...form, sso_client_id: e.target.value })} className="oe-input max-w-xs border-b border-slate-200" />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'sso' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Verify SSO Metadata
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-1.5">
                  <div className="font-semibold text-slate-800">Outbound Webhooks & Signing Secret</div>
                  <input value={form.webhook_url ?? ''} placeholder="https://hooks.school.ke/erp" onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} className="oe-input max-w-xs border-b border-slate-200" />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', { method: 'POST', body: JSON.stringify({ kind: 'webhook' }) });
                      showToast(res.message);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Ping Webhook Endpoint
                  </button>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-2">
                  <div className="font-semibold text-slate-800">Active Seed Profile ({seedProfile})</div>
                  <div className="flex gap-2">
                    <button onClick={() => switchSeed('oshwal')} className={`px-3 py-1 rounded font-medium ${seedProfile === 'oshwal' ? 'bg-[var(--oe-brand-primary)] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      Oshwal Academy (OERB)
                    </button>
                    <button onClick={() => switchSeed('default')} className={`px-3 py-1 rounded font-medium ${seedProfile === 'default' ? 'bg-[var(--oe-brand-primary)] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      Standard OpenEduCat
                    </button>
                  </div>
                </div>
                <div className="border-l-2 border-slate-200 pl-3 space-y-2">
                  <div className="font-semibold text-slate-800">External Connectors & OpenAPI</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={downloadEdi} className="px-3 py-1 rounded bg-[var(--oe-brand-primary)] text-white font-medium flex items-center gap-1">
                      <Download size={12} /> Export CAIE / Edexcel EDI
                    </button>
                    <a href="/api/docs" target="_blank" rel="noreferrer" className="px-3 py-1 rounded border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">
                      Open /api/docs
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Branded HTML Email Template Live Preview Modal */}
      {previewEmailTpl && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[780px] h-[85vh] border border-[#dee2e6] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-[#dee2e6] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-[var(--oe-brand-primary)]" />
                <h3 className="font-bold text-[14px] text-[#212529]">HTML Email Template Preview — {previewEmailTpl}</h3>
              </div>
              <button onClick={() => setPreviewEmailTpl(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <iframe
              title="HTML Email Preview"
              src={`/api/v1/integrations/email/preview/${previewEmailTpl}`}
              className="flex-1 w-full bg-slate-100 border-0"
            />
          </div>
        </div>
      )}

      {/* Live QWeb Configure Your Document Layout Modal (Odoo 19 base.view_base_document_layout) */}
      {showLayoutModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[1040px] max-h-[92vh] border border-[#dee2e6] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-[#dee2e6] flex items-center justify-between bg-white">
              <h3 className="font-bold text-[15px] text-[#212529]">Configure your document layout</h3>
              <button onClick={() => setShowLayoutModal(false)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#f8f9fa]">
              {/* Left Column: Real res.company letterhead & QWeb controls */}
              <div className="lg:col-span-5 space-y-4 bg-white p-4 rounded-[4px] border border-[#dee2e6]">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Logo</label>
                  <div className="flex items-center gap-3">
                    {layoutDraft.logo ? (
                      <img src={layoutDraft.logo} alt="Company Logo" className="h-10 max-w-[120px] object-contain border border-slate-200 rounded p-0.5 bg-white" />
                    ) : (
                      <div className="h-10 px-3 rounded border border-dashed border-slate-300 flex items-center text-[11px] text-slate-400 bg-slate-50">
                        Default School Crest SVG
                      </div>
                    )}
                    <label className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 font-medium cursor-pointer inline-flex items-center gap-1">
                      <Upload size={12} />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {layoutDraft.logo && (
                      <button type="button" onClick={clearLogo} className="p-1.5 rounded border border-slate-200 hover:bg-rose-50 text-rose-600" title="Clear Logo">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Layout</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['light', 'boxed', 'bold', 'striped', 'bubble', 'wave', 'folder'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLayoutDraft((p) => ({ ...p, external_report_layout_id: l }))}
                        className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                          layoutDraft.external_report_layout_id === l
                            ? 'bg-[var(--oe-brand-primary)] text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Font</label>
                    <select
                      value={layoutDraft.font}
                      onChange={(e) => setLayoutDraft((p) => ({ ...p, font: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="lato">Lato</option>
                      <option value="roboto">Roboto</option>
                      <option value="open_sans">Open Sans</option>
                      <option value="montserrat">Montserrat</option>
                      <option value="oswald">Oswald</option>
                      <option value="raleway">Raleway</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Paper format</label>
                    <select
                      value={layoutDraft.paperformat}
                      onChange={(e) => setLayoutDraft((p) => ({ ...p, paperformat: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="letter">US Letter</option>
                      <option value="a4">A4 (210 × 297 mm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Colors</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Primary</span>
                      <input type="color" value={layoutDraft.theme_primary} onChange={(e) => setLayoutDraft((p) => ({ ...p, theme_primary: e.target.value }))} className="w-7 h-7 rounded border border-slate-300 cursor-pointer" />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Secondary</span>
                      <input type="color" value={layoutDraft.theme_accent} onChange={(e) => setLayoutDraft((p) => ({ ...p, theme_accent: e.target.value }))} className="w-7 h-7 rounded border border-slate-300 cursor-pointer" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Street</label>
                    <input value={layoutDraft.street} onChange={(e) => setLayoutDraft((p) => ({ ...p, street: e.target.value }))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input value={layoutDraft.city} onChange={(e) => setLayoutDraft((p) => ({ ...p, city: e.target.value }))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tagline (Header)</label>
                  <input value={layoutDraft.report_header} onChange={(e) => setLayoutDraft((p) => ({ ...p, report_header: e.target.value }))} placeholder="School motto or accreditation line..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Footer</label>
                  <textarea rows={2} value={layoutDraft.report_footer} onChange={(e) => setLayoutDraft((p) => ({ ...p, report_footer: e.target.value }))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs" />
                </div>
              </div>

              {/* Right Column: Live QWeb HTML Blade Iframe */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Live QWeb Report Preview ({layoutDraft.external_report_layout_id} · {layoutDraft.font} · {layoutDraft.paperformat.toUpperCase()})
                  </span>
                  <a
                    href={`/report/pdf/account.report_invoice_with_payments/1?layout=${encodeURIComponent(layoutDraft.external_report_layout_id)}&font=${encodeURIComponent(layoutDraft.font)}&primary=${encodeURIComponent(layoutDraft.theme_primary)}&accent=${encodeURIComponent(layoutDraft.theme_accent)}`}
                    download
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[var(--oe-brand-primary)] font-semibold inline-flex items-center gap-1"
                  >
                    <Download size={12} /> Download Sample PDF
                  </a>
                </div>
                <div className="flex-1 bg-white border border-slate-300 rounded shadow-sm overflow-hidden min-h-[460px]">
                  <iframe
                    title="QWeb Document Layout Preview"
                    src={livePreviewUrl}
                    className="w-full h-[500px] border-0 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#dee2e6] bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={saveLayoutModal}
                className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowLayoutModal(false)}
                className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OmrSheetGeneratorView: React.FC = () => {
  const { showToast } = useErp();
  const [questions, setQuestions] = useState(20);
  const [options, setOptions] = useState(4);
  const [title, setTitle] = useState('CAIE IGCSE Physics Paper 1 — Bubble Answer Sheet');
  const letters = ['A', 'B', 'C', 'D', 'E'].slice(0, options);

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
      <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
        <h2 className="text-base font-bold text-slate-900">Generate OMR Bubble Sheet</h2>
        <label className="block space-y-1">
          <span className="font-semibold text-slate-600">Exam / Paper Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="oe-input" />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-slate-600">Number of Questions</span>
          <input type="number" min={5} max={50} value={questions} onChange={(e) => setQuestions(Number(e.target.value))} className="oe-input" />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-slate-600">Options per Question</span>
          <select value={options} onChange={(e) => setOptions(Number(e.target.value))} className="oe-input">
            <option value={4}>4 (A – D)</option>
            <option value={5}>5 (A – E)</option>
          </select>
        </label>
        <a
          href={`/report/pdf/omr?title=${encodeURIComponent(title)}&questions=${questions}&options=${options}`}
          download
          className="block w-full py-2 rounded bg-[var(--oe-brand-primary)] text-white font-semibold text-center"
        >
          Download OMR PDF Sheet
        </a>
      </div>
      <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-5 text-xs">
        <div className="border-b-2 border-slate-800 pb-2 mb-3 flex justify-between items-center">
          <div>
            <div className="font-bold text-sm text-slate-900">{title}</div>
            <div className="text-slate-500">Roll No: [____] · Set: [ A ] · Date: {new Date().toISOString().slice(0, 10)}</div>
          </div>
          <span className="px-2 py-0.5 border border-slate-400 font-mono text-[10px]">OMR-QR</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {Array.from({ length: Math.min(questions, 40) }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 font-mono">
              <span className="w-6 text-right text-slate-600">{i + 1}.</span>
              {letters.map((l) => (
                <span key={l} className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-[10px]">{l}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdmissionReportWizardView: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState('');
  useEffect(() => {
    callKw('op.admission', 'search_read', {}).then((r) => setRows(r.records ?? []));
  }, []);
  const filtered = rows.filter((r) => !courseFilter || String(r.course_id__label ?? '').toLowerCase().includes(courseFilter.toLowerCase()));
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Admission Analysis Report</h2>
          <p className="text-slate-500">Filter and export admissions pipeline across Nairobi & Mombasa campuses</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} placeholder="Filter by Year Group..." className="px-3 py-1.5 border border-slate-300 rounded" />
          <a
            href={`/report/pdf/admissions_analysis?course=${encodeURIComponent(courseFilter)}`}
            download
            className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold inline-block"
          >
            Download PDF Report
          </a>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr><th className="px-4 py-2">App No</th><th className="px-4 py-2">Applicant</th><th className="px-4 py-2">Year Group</th><th className="px-4 py-2">Stage</th><th className="px-4 py-2 text-right">Fees</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 font-mono">{r.application_number}</td>
                <td className="px-4 py-2 font-medium">{r.display_name}</td>
                <td className="px-4 py-2">{r.course_id__label}</td>
                <td className="px-4 py-2 capitalize">{r.state}</td>
                <td className="px-4 py-2 text-right font-mono">{Number(r.fees || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TimetableReportWizardView: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    callKw('op.session', 'search_read', {}).then((r) => setSessions(r.records ?? []));
  }, []);
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Timetable Schedule Report</h2>
          <p className="text-slate-500">Faculty, Room & Bell Interval allocation overview</p>
        </div>
        <a
          href="/report/pdf/timetable_schedule"
          download
          className="px-3 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold inline-block"
        >
          Download Timetable PDF
        </a>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr><th className="px-4 py-2">Session</th><th className="px-4 py-2">Faculty</th><th className="px-4 py-2">Year Group</th><th className="px-4 py-2">Interval</th><th className="px-4 py-2">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-medium">{s.name}</td>
                <td className="px-4 py-2">{s.faculty_id__label}</td>
                <td className="px-4 py-2">{s.course_id__label}</td>
                <td className="px-4 py-2 font-mono">{s.timing_slot}</td>
                <td className="px-4 py-2 capitalize">{s.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StudentMigrationWizardView: React.FC = () => {
  const { showToast, openModel } = useErp();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [form, setForm] = useState({ student_id: 1, from_course_id: 1, to_course_id: 2, academic_year_id: 1, percentage: 85 });

  useEffect(() => {
    Promise.all([
      callKw('op.student', 'name_search', {}),
      callKw('op.course', 'name_search', {}),
      callKw('op.academic.year', 'name_search', {}),
    ]).then(([s, c, y]) => {
      setStudents(s.options ?? []);
      setCourses(c.options ?? []);
      setYears(y.options ?? []);
      setForm((p) => ({
        ...p,
        student_id: s.options?.[0]?.id ?? 1,
        from_course_id: c.options?.[0]?.id ?? 1,
        to_course_id: c.options?.[1]?.id ?? c.options?.[0]?.id ?? 1,
        academic_year_id: y.options?.[0]?.id ?? 1,
      }));
    });
  }, []);

  const promote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await callKw('op.student.progression', 'web_save', { vals: { ...form, remarks: 'Batch Migration Wizard' } });
    await callKw('op.student.progression', 'promote', { id: res.record.id });
    showToast('Student progressed to target year group!');
    openModel('op.student.progression');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <form onSubmit={promote} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Student Migration & Progression Wizard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Student</span>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: Number(e.target.value) })} className="oe-input">
              {students.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">Academic Year</span>
            <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: Number(e.target.value) })} className="oe-input">
              {years.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">From Course / Year</span>
            <select value={form.from_course_id} onChange={(e) => setForm({ ...form, from_course_id: Number(e.target.value) })} className="oe-input">
              {courses.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-600">To Course / Year</span>
            <select value={form.to_course_id} onChange={(e) => setForm({ ...form, to_course_id: Number(e.target.value) })} className="oe-input">
              {courses.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="w-full py-2 rounded bg-[var(--oe-brand-primary)] text-white font-semibold">
          Migrate & Promote Student
        </button>
      </form>
    </div>
  );
};

export const AttendanceCheckinWizardView: React.FC = () => {
  const { openModel } = useErp();
  const [sheets, setSheets] = useState<any[]>([]);
  useEffect(() => {
    callKw('op.attendance.sheet', 'search_read', {}).then((r) => setSheets(r.records ?? []));
  }, []);
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900">Select Attendance Sheet for Check-In</h2>
        <p className="text-slate-500 mt-1">Choose a class sheet to open rapid roll call or face/badge check-in</p>
        <div className="mt-4 space-y-2">
          {sheets.map((s) => (
            <button
              key={s.id}
              onClick={() => openModel('op.attendance.sheet', { recordId: s.id, view: 'form' })}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[var(--oe-brand-primary)] flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">{s.name}</div>
                <div className="text-slate-500">{s.register_id__label} · {s.attendance_date}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold capitalize">{s.state}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BI_SECTIONS: { section: string; items: { id: string; label: string }[] }[] = [
  { section: 'SALES', items: [{ id: 'sales', label: 'Sales' }, { id: 'product', label: 'Product' }] },
  { section: 'FINANCE', items: [{ id: 'invoicing', label: 'Invoicing' }, { id: 'expenses', label: 'Expenses' }] },
  { section: 'LOGISTICS', items: [{ id: 'warehouse', label: 'Warehouse Metrics' }] },
  { section: 'SERVICES', items: [{ id: 'helpdesk', label: 'Helpdesk' }] },
  { section: 'MARKETING', items: [{ id: 'events', label: 'Events' }] },
  { section: 'WEBSITE', items: [{ id: 'livechat', label: 'Live Chat' }] },
];

export const BiDashboardView: React.FC = () => {
  const { currencyCode, showToast, openModel } = useErp();
  const [selectedDash, setSelectedDash] = useState('sales');
  const [collapsed, setCollapsed] = useState(false);
  const [execData, setExecData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/kpi/executive').catch(() => null),
      callKw('account.move', 'search_read', { limit: 10 }).catch(() => ({ records: [] })),
      callKw('helpdesk.ticket', 'search_read', { limit: 10 }).catch(() => ({ records: [] })),
    ]).then(([ex, invRes, tktRes]) => {
      setExecData(ex);
      setInvoices(invRes.records ?? []);
      setTickets(tktRes.records ?? []);
    });
  }, []);

  const dashTitle = BI_SECTIONS.flatMap((s) => s.items).find((i) => i.id === selectedDash)?.label || 'Sales';
  const totalInvoiced = Number(execData?.totals?.totalInvoiced ?? 330000);
  const totalCollected = Number(execData?.totals?.totalCollected ?? 25000);
  const openTickets = tickets.filter((t) => t.stage !== 'done').length;

  const cards =
    selectedDash === 'invoicing' || selectedDash === 'expenses'
      ? [
          { label: 'Invoiced', value: `${currencyCode} ${totalInvoiced.toLocaleString()}`, delta: '+14.2%', bg: 'bg-sky-50 border-sky-200' },
          { label: 'Collected', value: `${currencyCode} ${totalCollected.toLocaleString()}`, delta: '+8.5%', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Receivable', value: `${currencyCode} ${Math.max(0, totalInvoiced - totalCollected).toLocaleString()}`, delta: 'Due 14d', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Invoices Count', value: String(invoices.length), delta: 'Posted', bg: 'bg-indigo-50 border-indigo-200' },
        ]
      : selectedDash === 'helpdesk'
      ? [
          { label: 'Open Tickets', value: String(openTickets), delta: 'Active', bg: 'bg-rose-50 border-rose-200' },
          { label: 'SLA Attainment', value: '96.4%', delta: '+2.1%', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Avg First Response', value: '18 mins', delta: '-4 mins', bg: 'bg-sky-50 border-sky-200' },
          { label: 'Resolved Total', value: String(tickets.length - openTickets), delta: 'This Term', bg: 'bg-indigo-50 border-indigo-200' },
        ]
      : [
          { label: 'Tuition & Fees Volume', value: `${currencyCode} ${totalInvoiced.toLocaleString()}`, delta: '+18.4%', bg: 'bg-sky-50 border-sky-200' },
          { label: 'Active Learners', value: String(execData?.totals?.students ?? 4), delta: 'Across Campuses', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Admissions Pipeline', value: String(execData?.totals?.admissions ?? 5), delta: '7-Step Funnel', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Average Fee Value', value: `${currencyCode} ${Math.round(totalInvoiced / Math.max(1, invoices.length)).toLocaleString()}`, delta: 'Per Invoice', bg: 'bg-indigo-50 border-indigo-200' },
        ];

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col bg-[#f8f9fa]">
      {/* Odoo BI Top Sub-bar matching step_121_shot_1_real_dashboards.png */}
      <div className="bg-white border-b border-[#dee2e6] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-[14px] text-slate-900">
          <span>Dashboards</span>
          <span className="text-slate-400 font-normal">/ {dashTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <Bookmark size={14} className="cursor-pointer hover:text-slate-900" />
          <button
            type="button"
            onClick={() => showToast('Dashboard share link copied to clipboard')}
            className="flex items-center gap-1 hover:text-slate-900 font-medium"
          >
            <Share2 size={13} /> <span>Share</span>
          </button>
          <Star size={14} className="cursor-pointer hover:text-amber-500" />
        </div>
      </div>

      <div className="flex-1 flex items-stretch overflow-hidden">
        {/* Left 220px Collapsible Sidebar matching step_121_shot_1 */}
        <aside className={`${collapsed ? 'w-12' : 'w-[220px]'} shrink-0 bg-white border-r border-[#dee2e6] flex flex-col transition-all`}>
          <div className="px-3 py-2 flex justify-end border-b border-slate-100">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-800 p-1 rounded"
              title="Toggle sidebar"
            >
              {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
            </button>
          </div>
          {!collapsed && (
            <div className="p-3 space-y-4 overflow-y-auto text-[12.5px]">
              {BI_SECTIONS.map((sec) => (
                <div key={sec.section}>
                  <div className="px-2 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                    {sec.section}
                  </div>
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const active = selectedDash === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedDash(item.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-[4px] transition-colors ${
                            active
                              ? 'bg-[#e7f1ff] text-[#0d6efd] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right BI Canvas */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.label} className={`p-4 rounded-[4px] border ${card.bg}`}>
                <div className="text-[11.5px] font-medium text-slate-600">{card.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{card.value}</div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-1">{card.delta}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-[4px] border border-[#dee2e6] p-4">
              <div className="font-bold text-xs text-slate-800 mb-3">{dashTitle} Performance Trend (Term 1)</div>
              <svg viewBox="0 0 600 180" className="w-full h-44">
                <defs>
                  <linearGradient id="biArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3f7c" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#1e3f7c" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <line x1="30" y1="150" x2="580" y2="150" stroke="#e2e8f0" />
                <polygon fill="url(#biArea)" points="30,150 30,115 140,95 250,108 360,65 470,74 580,32 580,150" />
                <polyline fill="none" stroke="#1e3f7c" strokeWidth="2.5" points="30,115 140,95 250,108 360,65 470,74 580,32" />
                {['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'].map((lbl, idx) => (
                  <text key={lbl} x={30 + idx * 110} y="168" fontSize="10" fill="#64748b" textAnchor="middle">{lbl}</text>
                ))}
              </svg>
            </div>

            <div className="lg:col-span-5 bg-white rounded-[4px] border border-[#dee2e6] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#f8f9fa] border-b border-[#dee2e6] font-bold text-xs text-slate-800">
                Top {dashTitle === 'Helpdesk' ? 'Tickets' : 'Invoices'}
              </div>
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100">
                  {(selectedDash === 'helpdesk' ? tickets : invoices).slice(0, 5).map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => openModel(selectedDash === 'helpdesk' ? 'helpdesk.ticket' : 'account.move', { recordId: row.id })}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-3.5 py-2 font-medium text-[var(--oe-brand-primary)] truncate max-w-[180px]">
                        {row.display_name || row.name || row.issue_name}
                      </td>
                      <td className="px-3.5 py-2 text-right font-mono text-slate-700">
                        {row.amount_total !== undefined ? `${currencyCode} ${Number(row.amount_total).toLocaleString()}` : (row.stage || row.state)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
