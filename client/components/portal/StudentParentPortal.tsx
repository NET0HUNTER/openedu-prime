import React, { useEffect, useState } from 'react';
import {
  Smartphone, Globe, CheckCircle2, MapPin, Mail, Edit3, Bell, Search,
  GraduationCap, FileEdit, FileText, ShoppingCart, Phone, ChevronDown, LogOut,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { apiFetch } from '../../lib/api';
import { DynamicIcon } from '../Icon';
import { UniversalModuleWorkspace } from '../views/UniversalModuleWorkspace';

export const StudentParentPortal: React.FC = () => {
  const { user, companies, route, navigate, openModel, logout, showToast, currencyCode } = useErp();
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [mpesaModal, setMpesaModal] = useState<any>(null);
  const [mpesaPhone, setMpesaPhone] = useState('+254722810400');
  const [paying, setPaying] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', email: '', street: '', city: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const load = () => apiFetch('/api/v1/portal/my').then(setData);
  useEffect(() => { load(); }, [user?.id]);

  const openEditProfile = () => {
    const st = data?.student;
    setProfileForm({
      phone: st?.phone || '',
      email: st?.email || user?.login || '',
      street: st?.street || '',
      city: st?.city || '',
    });
    setEditProfileModal(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiFetch('/api/v1/portal/profile', {
        method: 'POST',
        body: JSON.stringify(profileForm),
      });
      showToast('Contact profile updated!');
      setEditProfileModal(false);
      load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const payMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaModal) return;
    setPaying(true);
    try {
      const res = await apiFetch('/api/v1/integrations/mpesa/stk-push', {
        method: 'POST',
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: mpesaModal.amount_residual || mpesaModal.amount_total,
          move_id: mpesaModal.id,
          student_id: data?.student?.id,
        }),
      });
      showToast(`M-Pesa STK settled (${res.transaction.mpesa_receipt})`);
      setMpesaModal(null);
      load();
    } finally {
      setPaying(false);
    }
  };

  if (route.area === 'module' && route.model) {
    return (
      <div className="min-h-screen bg-[var(--oe-bg-workspace)]">
        <div className="sticky top-0 z-40 h-[40px] bg-[var(--oe-brand-primary)] text-white px-4 flex items-center justify-between text-xs shadow-xs">
          <button onClick={() => navigate({ area: 'portal', model: undefined, recordId: undefined })} className="font-semibold hover:underline">
            ← Back to {user?.role === 'parent' ? 'Parent' : 'Student'} Portal (/my)
          </button>
          <span>{user?.name}</span>
        </div>
        <UniversalModuleWorkspace />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-xs text-slate-500">Loading /my Portal...</div>;

  const hq = companies[0];
  const { kpis, attendanceBreakdown, attendanceTrend, cards, invoices, student } = data;
  const openInv = (invoices || []).find((i: any) => i.payment_state !== 'paid');
  const firstName = String(user?.name || 'Student').split(' ')[0];
  const totalAtt = attendanceBreakdown.present + attendanceBreakdown.absent + attendanceBreakdown.leave + attendanceBreakdown.late || 1;
  const attPct = Math.round((attendanceBreakdown.present / totalAtt) * 100);
  const filteredCards = (cards || []).filter((c: any) =>
    !search.trim() ||
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()),
  );

  // SVG Donut stroke calculation
  const r = 34;
  const circ = 2 * Math.PI * r;
  const presLen = (attendanceBreakdown.present / totalAtt) * circ;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      {/* Exact Odoo Website/Portal Top Bar matching step_670_shot_2 & step_676_shot_1 */}
      <header className="bg-white border-b border-slate-200 px-6 h-[56px] flex items-center justify-between text-[13px]">
        <button onClick={() => navigate({ area: 'public', publicPath: '/' })} className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="w-7 h-7 rounded bg-[var(--oe-brand-primary)] text-white flex items-center justify-center text-xs font-bold">
            {(hq?.code || 'OE').slice(0, 2)}
          </span>
          <span className="hidden sm:inline">{hq?.name || 'Your Logo'}</span>
        </button>

        <div className="flex items-center gap-4 text-slate-600">
          <button onClick={() => navigate({ area: 'public', publicPath: '/shop/cart' })} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200">
            <ShoppingCart size={14} />
          </button>
          <span className="hidden md:flex items-center gap-1 text-xs"><Phone size={12} /> {hq?.phone || '+254 725 529 622'}</span>
          <span className="hidden sm:inline text-xs">English (US) ▾</span>
          <span className="font-medium text-slate-800 flex items-center gap-1 text-xs">
            {user?.name} <ChevronDown size={13} />
          </span>
          <button onClick={logout} className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] flex items-center gap-1">
            <LogOut size={12} /> Log out
          </button>
        </div>
      </header>

      {/* Main 2-Column Portal Layout matching step_670_shot_2_b3b_role_student_landing */}
      <main className="max-w-[1220px] w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: Profile Card + Overview Bars + Mini Calendar + Quick Actions */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="h-16" style={{ background: 'linear-gradient(135deg, var(--oe-brand-primary) 0%, var(--oe-brand-primary-dark) 100%)' }} />
            <div className="px-4 pb-4 -mt-9 text-center">
              <div className="w-[72px] h-[72px] rounded-full mx-auto bg-white p-1 shadow">
                <div className="w-full h-full rounded-full bg-[var(--oe-brand-primary)] text-white font-bold text-xl flex items-center justify-center">
                  {String(user?.name || 'S').slice(0, 1)}
                </div>
              </div>
              <h2 className="mt-2 font-bold text-[15px] text-slate-900">{user?.name}</h2>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-medium text-slate-700">Term 1</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-medium text-slate-700">{student?.batch_id__label || 'Stream A'}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-medium text-slate-700">{student?.course_id__label || 'IGCSE'}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-left text-[11.5px] text-slate-500 space-y-1">
                <div className="flex items-start gap-1.5"><MapPin size={12} className="shrink-0 mt-0.5" /><span>{student?.street || 'Parklands'}, {student?.city || 'Nairobi'}</span></div>
                <div className="flex items-center gap-1.5 truncate"><Mail size={12} className="shrink-0" /><span className="truncate">{student?.email || user?.login}</span></div>
              </div>
              <button
                onClick={openEditProfile}
                className="mt-3 w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Edit3 size={12} /> Edit information
              </button>
            </div>
          </div>

          {/* OVERVIEW Progress Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overview</div>
            {[
              ['Attendance', `${attPct}%`, attPct, '#16a34a'],
              ['Term progress', '78%', 78, '#475569'],
              ['Subjects enrolled', '9 / 9', 100, 'var(--oe-brand-primary)'],
              ['Assignments', '4 / 5', 80, 'var(--oe-brand-accent)'],
            ].map(([lbl, val, pct, col]) => (
              <div key={String(lbl)} className="space-y-1">
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-slate-600">{lbl}</span>
                  <span className="font-bold text-slate-800">{val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: String(col) }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions 2x4 Grid matching step_676_shot_1 + LMS/Quiz Player links */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-xs font-bold text-slate-800 mb-3">Quick actions</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['My Timetable', 'op.session', 'CalendarClock', null],
                ['Attendance', 'op.attendance.line', 'UserCheck', null],
                ['Assignments', 'op.assignment.sub.line', 'ClipboardList', null],
                ['LMS Player', null, 'GraduationCap', '/courses'],
                ['Online Quizzes', null, 'CheckCircle2', '/online-exams'],
                ['Exams', 'op.exam', 'FileText', null],
                ['GradeBook', 'gradebook.gradebook', 'Award', null],
                ['Subjects', 'op.subject.registration', 'ListChecks', null],
              ].map(([lbl, mod, ic, pubPath]) => (
                <button
                  key={String(lbl)}
                  onClick={() => (pubPath ? navigate({ area: 'public', publicPath: String(pubPath) }) : openModel(String(mod)))}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-[var(--oe-brand-primary)]/40 hover:bg-slate-50 flex flex-col items-center gap-1.5 text-center"
                >
                  <span className="w-7 h-7 rounded bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] flex items-center justify-center">
                    <DynamicIcon name={String(ic)} size={14} />
                  </span>
                  <span className="font-medium text-slate-700 leading-tight">{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs text-[11px]">
            <div className="font-bold text-slate-800 mb-2">November 2026</div>
            <div className="grid grid-cols-7 gap-1 text-center text-slate-400 font-semibold mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-slate-700">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <div key={day} className={`py-1 rounded ${day === 18 ? 'bg-[var(--oe-brand-primary)] text-white font-bold' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <section className="lg:col-span-9 space-y-5">
          {/* Welcome Header + Search + Notification Bell */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Welcome {firstName}</h1>
              <p className="text-xs text-slate-500">
                {user?.role === 'parent'
                  ? "You're viewing your child's portal — quick access to all records and services."
                  : 'Everything for your studies in one place. Quick access to all your records and services.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search anything..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-52 focus:outline-none focus:border-[var(--oe-brand-primary)]"
                />
              </div>
              <button onClick={() => openModel('op.notice')} className="relative p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                <Bell size={15} />
                <span className="absolute -top-1 -right-1 bg-[var(--oe-brand-accent)] text-white text-[10px] font-bold px-1 rounded-full">
                  {kpis.notifications}
                </span>
              </button>
            </div>
          </div>

          {/* 3 Top Stat Cards matching step_670_shot_2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-900">{kpis.activeCourses}</div>
                <div className="text-xs text-slate-500">Active courses</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] flex items-center justify-center">
                <GraduationCap size={19} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-900">{kpis.pendingAssignments}</div>
                <div className="text-xs text-slate-500">Pending assignments</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileEdit size={19} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-900">{kpis.upcomingExams}</div>
                <div className="text-xs text-slate-500">Upcoming exams</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText size={19} />
              </div>
            </div>
          </div>

          {/* Analytics Row: Attendance Trend SVG Line Chart + Attendance Donut */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <div><span className="font-bold text-slate-800">Attendance trend</span> <span className="text-slate-400">last 6 months</span></div>
                <span className="text-emerald-600 font-semibold">+2% vs last month</span>
              </div>
              <svg viewBox="0 0 360 110" className="w-full h-28">
                <polyline fill="none" stroke="var(--oe-brand-primary)" strokeWidth="2.5" points="20,40 84,32 148,36 212,24 276,28 340,16" />
                <polygon fill="var(--oe-surface-pale-blue)" fillOpacity="0.45" points="20,95 20,40 84,32 148,36 212,24 276,28 340,16 340,95" />
                {attendanceTrend.map((m: any, idx: number) => (
                  <text key={m.month} x={20 + idx * 64} y="108" fontSize="10" fill="#64748b" textAnchor="middle">{m.month}</text>
                ))}
              </svg>
            </div>

            <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-slate-800 mb-2">Attendance</div>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
                    <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" />
                    <circle cx="44" cy="44" r={r} fill="none" stroke="#16a34a" strokeWidth="9" strokeDasharray={`${presLen} ${circ}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute font-bold text-sm text-slate-900">{attPct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px] flex-1">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" />Present</span><strong>{attendanceBreakdown.present}</strong></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600" />Absent</span><strong>{attendanceBreakdown.absent}</strong></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Leave</span><strong>{attendanceBreakdown.leave}</strong></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" />Late</span><strong>{attendanceBreakdown.late}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications + M-Pesa Express Action Strip */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
              <span className="w-7 h-7 rounded-full bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] flex items-center justify-center"><Bell size={14} /></span>
              <span>Notifications</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--oe-brand-accent)] text-white text-[10.5px] font-bold">{kpis.notifications}</span>
            </div>
            {openInv ? (
              <button
                onClick={() => setMpesaModal(openInv)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Smartphone size={14} /> Pay Fees ({currencyCode} {Number(openInv.amount_residual ?? openInv.amount_total ?? 0).toLocaleString()}) via M-Pesa
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><CheckCircle2 size={14} /> Fee Statements Settled</span>
            )}
          </div>

          {/* Categorized 3-Column Portal Cards (35 Cards) matching step_670_shot_2 & step_676_shot_1 */}
          {[
            {
              title: 'Academics & Assessments',
              ids: ['profile', 'exam_schedule', 'quiz_result', 'progression', 'assignments', 'courses', 'certificate', 'omr_exam', 'omr_result', 'attendance', 'admission', 'timetable', 'gradebook', 'course_change', 'subject_reg', 'academic_cal', 'thesis'],
            },
            {
              title: 'Library, Materials & Campus',
              ids: ['digital_library', 'library', 'study_material', 'asset_req', 'dms'],
            },
            {
              title: 'Finance, Fees & Payments',
              ids: ['fees', 'orders', 'payment_methods', 'rfqs', 'our_orders'],
            },
            {
              title: 'Communication, Leave & Account',
              ids: ['livechat', 'meetings', 'notice_board', 'grievances', 'time_off', 'addresses', 'security', 'online_meetings'],
            },
          ].map((sec) => {
            const groupCards = filteredCards.filter((c: any) => sec.ids.includes(c.id));
            if (groupCards.length === 0) return null;
            return (
              <div key={sec.title} className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--oe-brand-primary)]" />
                  <span>{sec.title}</span>
                  <span className="text-slate-400 font-normal">{groupCards.length} items</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {groupCards.map((card: any) => {
                    const cnt = data.cardCounts?.[card.id] ?? 0;
                    return (
                      <button
                        key={card.id}
                        onClick={() => card.model && openModel(card.model)}
                        className="relative text-left p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-[var(--oe-brand-primary)]/50 hover:shadow-sm transition-all flex items-start gap-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-[var(--oe-brand-primary)] flex items-center justify-center shrink-0">
                          <DynamicIcon name={card.icon} size={17} />
                        </div>
                        <div className="min-w-0 pr-5">
                          <div className="font-semibold text-[13px] text-slate-900 truncate">{card.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{card.description}</div>
                        </div>
                        <span
                          className={`absolute top-2.5 right-2.5 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            cnt > 0 ? 'bg-[var(--oe-brand-primary)] text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {mpesaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={payMpesa} className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 text-xs shadow-2xl">
            <div className="font-bold text-base text-slate-900">M-Pesa Express (STK Push)</div>
            <p className="text-slate-600">{mpesaModal.line_description} — <strong>{currencyCode} {Number(mpesaModal.amount_residual ?? mpesaModal.amount_total ?? 0).toLocaleString()}</strong></p>
            <input value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} required className="w-full p-2.5 border border-slate-300 rounded font-mono" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setMpesaModal(null)} className="px-3 py-1.5 rounded border border-slate-300">Cancel</button>
              <button disabled={paying} type="submit" className="px-4 py-1.5 rounded bg-emerald-600 text-white font-semibold">
                {paying ? 'Sending STK...' : 'Send M-Pesa Prompt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={saveProfile} className="bg-white rounded-xl max-w-md w-full p-5 space-y-3 text-xs shadow-2xl">
            <div className="font-bold text-base text-slate-900">Edit Contact Information</div>
            <p className="text-slate-500">Update guardian/student phone, email, and residential address.</p>
            <div className="space-y-2">
              <label className="block">
                <span className="font-semibold text-slate-700">Phone</span>
                <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+2547..." className="mt-1 w-full p-2 border border-slate-300 rounded" />
              </label>
              <label className="block">
                <span className="font-semibold text-slate-700">Email</span>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="mt-1 w-full p-2 border border-slate-300 rounded" />
              </label>
              <label className="block">
                <span className="font-semibold text-slate-700">Street / Estate</span>
                <input value={profileForm.street} onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })} className="mt-1 w-full p-2 border border-slate-300 rounded" />
              </label>
              <label className="block">
                <span className="font-semibold text-slate-700">City / Town</span>
                <input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="mt-1 w-full p-2 border border-slate-300 rounded" />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditProfileModal(false)} className="px-3 py-1.5 rounded border border-slate-300">Cancel</button>
              <button disabled={savingProfile} type="submit" className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
