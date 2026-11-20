import React, { useEffect, useState } from 'react';
import {
  GraduationCap, User, Users, ShieldCheck, Briefcase, Eye, EyeOff, QrCode,
  MapPin, Phone, Mail, BookOpen, Calendar, Award, ArrowRight, CheckCircle2, ShoppingCart, Search,
  PlayCircle, Circle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { apiFetch, callKw } from '../../lib/api';

export const LoginScreen: React.FC = () => {
  const { companies, settings, loginAsDemo, loginWithEmail, navigate, showToast } = useErp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const hq = companies[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-14">
        {/* Exact centered login layout matching step_6_shot_1.png */}
        <div className="w-full max-w-[300px] space-y-4">
          {settings.demo_logins !== false && (
            <div className="text-center space-y-1.5">
              <div className="text-[12.5px] text-slate-600">Login as</div>
              <div className="flex flex-wrap justify-center gap-1">
                {[
                  { role: 'student', label: 'Student', icon: GraduationCap },
                  { role: 'faculty', label: 'Faculty', icon: User },
                  { role: 'parent', label: 'Parent', icon: Users },
                  { role: 'admin', label: 'Admin', icon: ShieldCheck },
                  { role: 'backoffice', label: 'Backoffice', icon: Briefcase },
                ].map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.role}
                      type="button"
                      onClick={() => loginAsDemo(btn.role as any)}
                      className="px-2.5 py-1 rounded text-[12px] font-medium text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] flex items-center gap-1"
                    >
                      <Icon size={12} /> {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[var(--oe-brand-primary)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-medium text-slate-700">Password</label>
                <button type="button" onClick={() => showToast('Password reset link queued to your email.')} className="text-[12px] text-[var(--oe-brand-primary)] hover:underline">
                  Reset Password
                </button>
              </div>
              <div className="flex border border-slate-300 rounded overflow-hidden">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="flex-1 px-3 py-1.5 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="px-2.5 bg-white border-l border-slate-300 text-slate-600">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded font-medium text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)]"
            >
              Log in
            </button>

            <div className="text-center">
              <button type="button" onClick={() => navigate({ area: 'public', publicPath: '/courses-offered' })} className="text-[12px] text-[var(--oe-brand-primary)] hover:underline">
                Don&apos;t have an account?
              </button>
            </div>

            <div className="text-center text-xs text-slate-500 italic">- or -</div>

            <button
              type="button"
              onClick={() => loginAsDemo('admin')}
              className="w-full py-2 border border-slate-200 rounded font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 text-[13px]"
            >
              <QrCode size={14} /> Use a Passkey
            </button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

const PublicHeader: React.FC = () => {
  const { companies, settings, navigate, publicRoutes, route, user } = useErp();
  const [moreOpen, setMoreOpen] = useState(false);
  const hq = companies[0];
  const primaryLinks = publicRoutes.slice(0, 7);
  const overflowLinks = publicRoutes.slice(7);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1260px] mx-auto px-4 h-[58px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <button onClick={() => navigate({ area: 'public', publicPath: '/' })} className="flex items-center gap-2 text-left shrink-0 whitespace-nowrap">
            <span className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: 'var(--oe-brand-primary)' }}>
              {(hq?.code || 'OE').slice(0, 2)}
            </span>
            <span className="font-semibold text-[14.5px] text-slate-700 whitespace-nowrap max-w-[230px] truncate">{settings.website_title || hq?.name || 'Your Logo'}</span>
          </button>

          <nav className="hidden lg:flex items-center gap-3.5 text-[13px] text-slate-600 shrink-0">
            {primaryLinks.map((lnk) => (
              <button
                key={lnk.path}
                onClick={() => navigate({ area: 'public', publicPath: lnk.path })}
                className={`whitespace-nowrap shrink-0 hover:text-slate-900 ${route.area === 'public' && route.publicPath === lnk.path ? 'font-semibold text-[var(--oe-brand-primary)]' : ''}`}
              >
                {lnk.label}
              </button>
            ))}
            <div className="relative shrink-0">
              <button onClick={() => setMoreOpen(!moreOpen)} className="px-1.5 py-0.5 hover:text-slate-900 font-semibold">+</button>
              {moreOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded shadow-xl py-1 z-50">
                  {overflowLinks.map((lnk) => (
                    <button
                      key={lnk.path}
                      onClick={() => { setMoreOpen(false); navigate({ area: 'public', publicPath: lnk.path }); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-xs text-slate-700"
                    >
                      {lnk.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 text-[12.5px] text-slate-600 shrink-0">
          <button onClick={() => navigate({ area: 'public', publicPath: '/shop/cart' })} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 shrink-0"><ShoppingCart size={14} /></button>
          <button onClick={() => navigate({ area: 'public', publicPath: '/courses-offered' })} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 shrink-0"><Search size={14} /></button>
          <span className="hidden xl:inline text-xs whitespace-nowrap shrink-0">{hq?.phone || '+254 725 529 622'}</span>
          <span className="hidden sm:inline text-xs whitespace-nowrap shrink-0">English (US) ▾</span>
          {user ? (
            <button
              onClick={() => navigate(user.role === 'student' || user.role === 'parent' ? { area: 'portal' } : { area: 'apps' })}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-800 hover:bg-slate-50 font-medium whitespace-nowrap shrink-0"
            >
              {user.role === 'student' || user.role === 'parent' ? '← Portal (/my)' : '← Apps Menu'}
            </button>
          ) : (
            <button onClick={() => navigate({ area: 'login' })} className="px-3 py-1.5 rounded border border-slate-300 text-slate-800 hover:bg-slate-50 font-medium whitespace-nowrap shrink-0">
              Sign in
            </button>
          )}
          <button
            onClick={() => navigate({ area: 'public', publicPath: '/contactus' })}
            className="px-3.5 py-1.5 rounded font-medium text-white whitespace-nowrap shrink-0"
            style={{ backgroundColor: 'var(--oe-brand-primary)' }}
          >
            Contact Us
          </button>
        </div>
      </div>
    </header>
  );
};

const PublicFooter: React.FC = () => {
  const { companies, navigate } = useErp();
  const hq = companies[0];
  return (
    <footer className="border-t border-slate-200" style={{ backgroundColor: 'var(--oe-surface-cream)' }}>
      <div className="max-w-[1140px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 text-[13px] text-slate-700">
        <div className="md:col-span-3 space-y-1.5">
          <div className="font-semibold text-slate-900 mb-2">Useful Links</div>
          {[['/', 'Home'], ['/courses-offered', 'Admissions'], ['/program-offered', 'Programs'], ['/digital-library', 'Digital Library'], ['/contactus', 'Contact us']].map(([p, l]) => (
            <button key={p} onClick={() => navigate({ area: 'public', publicPath: p })} className="block text-[var(--oe-brand-primary)] hover:underline">{l}</button>
          ))}
        </div>
        <div className="md:col-span-5 space-y-2">
          <div className="font-semibold text-slate-900">About us</div>
          <p className="leading-relaxed text-slate-600">{hq?.curriculum_summary || 'Holistic international education across Nairobi & Mombasa.'}</p>
          <p className="text-xs text-slate-500">{hq?.board_affiliation}</p>
        </div>
        <div className="md:col-span-4 space-y-1.5">
          <div className="font-semibold text-slate-900 mb-2">Connect with us</div>
          <div className="flex items-center gap-2"><Mail size={13} /> {hq?.email}</div>
          <div className="flex items-center gap-2"><Phone size={13} /> {hq?.phone}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><MapPin size={13} /> {hq?.street}, {hq?.city}</div>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-3 px-4 max-w-[1140px] mx-auto text-[11.5px] text-slate-500 flex flex-wrap justify-between gap-2">
        <span>العربية | 简体中文 | Nederlands | English (US) | Français | Deutsch | Español</span>
        <span>Copyright © {hq?.name || 'OERB'}</span>
      </div>
    </footer>
  );
};

export const PublicWebsite: React.FC = () => {
  const { companies, route, navigate, showToast, user, currencyCode } = useErp();
  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ product: any; qty: number }[]>([]);
  const [bookingForm, setBookingForm] = useState({ typeId: 1, name: '', email: '', date: '2026-11-24T10:00' });
  const [contactForm, setContactForm] = useState({ contact_name: '', email_from: '', phone: '', name: 'Campus Tour & Admissions Inquiry', description: '' });
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<any>(null);
  const [forumReply, setForumReply] = useState('');
  const [jobApplyForm, setJobApplyForm] = useState({ jobId: 0, partner_name: '', email_from: '', partner_phone: '', cvName: '', notes: '' });
  const [search, setSearch] = useState('');
  const [applyCourseId, setApplyCourseId] = useState<number | null>(null);
  const [applyForm, setApplyForm] = useState({ first_name: '', last_name: '', email: '', phone: '', birth_date: '2011-05-15', citizenship: 'kenyan', prev_institute_id: '' });
  const [appliedApp, setAppliedApp] = useState<any>(null);
  const [lmsEnrollments, setLmsEnrollments] = useState<any[]>([]);
  const [lmsEnrollmentLines, setLmsEnrollmentLines] = useState<any[]>([]);
  const [lmsModules, setLmsModules] = useState<any[]>([]);
  const [activeLmsCourseId, setActiveLmsCourseId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const loadLmsData = async () => {
    const [enr, enrLines, mod] = await Promise.all([
      callKw('op.course.enrollment', 'search_read', {}).catch(() => ({ records: [] })),
      callKw('op.course.enrollment.line', 'search_read', {}).catch(() => ({ records: [] })),
      callKw('op.course.module', 'search_read', {}).catch(() => ({ records: [] })),
    ]);
    setLmsEnrollments(enr.records ?? []);
    setLmsEnrollmentLines(enrLines.records ?? []);
    setLmsModules(mod.records ?? []);
  };

  useEffect(() => {
    Promise.all([
      callKw('op.course', 'search_read', {}),
      callKw('op.program', 'search_read', {}),
      callKw('op.digital.library.material', 'search_read', {}),
      callKw('event.event', 'search_read', {}),
      callKw('hr.job', 'search_read', {}),
      callKw('op.activity.announcement', 'search_read', {}),
      callKw('op.alumni.group', 'search_read', {}),
      callKw('product.template', 'search_read', {}),
      callKw('calendar.online.appointment', 'search_read', {}),
      callKw('op.quiz', 'search_read', {}),
      callKw('website.page', 'search_read', {}),
      callKw('op.job.post', 'search_read', {}),
    ]).then(([c, pr, m, e, j, a, al, prod, appt, qz, pg, jp]) => {
      setCourses(c.records ?? []);
      setPrograms(pr.records ?? []);
      setMaterials(m.records ?? []);
      setEvents(e.records ?? []);
      setJobs(j.records ?? []);
      setAnnouncements(a.records ?? []);
      setAlumni(al.records ?? []);
      setProducts(prod.records ?? []);
      setAppointments(appt.records ?? []);
      setQuizzes(qz.records ?? []);
      setPages(pg.records ?? []);
      setJobPosts(jp.records ?? []);
      if (appt.records?.[0]) setBookingForm((b) => ({ ...b, typeId: appt.records[0].id }));
    });
    loadLmsData();
  }, [user?.id]);

  // Honor preselected courseId passed via navigation route
  useEffect(() => {
    const navCourseId = (route as any).courseId;
    if (navCourseId) setActiveLmsCourseId(Number(navCourseId));
  }, [(route as any).courseId]);

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/v1/public/apply', {
      method: 'POST',
      body: JSON.stringify({ ...applyForm, course_id: applyCourseId ?? courses[0]?.id }),
    });
    setAppliedApp(res.application);
    showToast(`Application ${res.application.application_number} submitted!`);
  };

  const p = route.publicPath;
  const authProtected = ['/online-exams', '/alumni/job/card', '/campus/jobs'].includes(p);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">
        {authProtected && !user ? (
          <div className="max-w-md mx-auto my-16 p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-600">Sign in via the Portal Login to access {p}.</p>
            <button onClick={() => navigate({ area: 'login' })} className="px-4 py-2 rounded text-xs font-semibold text-white bg-[var(--oe-brand-primary)]">
              Go to Sign In
            </button>
          </div>
        ) : p === '/courses' ? (
          (() => {
            const activeCourse = courses.find((c) => c.id === activeLmsCourseId) || null;
            const uid = user?.id ?? 1;
            const findEnrollment = (cid: number) =>
              lmsEnrollments.find((e) => Number(e.course_id) === cid && Number(e.user_id) === Number(uid));
            const activeEnrollment = activeCourse ? findEnrollment(activeCourse.id) : null;
            const courseModules = activeCourse
              ? lmsModules.filter((m) => Number(m.course_id) === Number(activeCourse.id)).sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              : [];
            const enrollmentLines: any[] = activeEnrollment
              ? (
                  lmsEnrollmentLines.filter((l) => Number(l.enrollment_id) === Number(activeEnrollment.id)).length > 0
                    ? lmsEnrollmentLines.filter((l) => Number(l.enrollment_id) === Number(activeEnrollment.id))
                    : (activeEnrollment.enrollment_line ?? [])
                )
              : [];
            const selectedMod = courseModules.find((m) => m.id === activeModuleId) || courseModules[0] || null;
            const selectedLine = selectedMod ? enrollmentLines.find((l) => Number(l.module_id) === Number(selectedMod.id)) : null;

            const enrollInCourse = async (cid: number) => {
              try {
                await callKw('op.course', 'enroll_learner', { id: cid, args: { user_id: uid } });
                await loadLmsData();
                setActiveLmsCourseId(cid);
                const firstMod = lmsModules.find((m) => Number(m.course_id) === Number(cid));
                if (firstMod) setActiveModuleId(firstMod.id);
                showToast('Enrolled in LMS course!');
              } catch (err: any) {
                showToast(err?.message || 'Unable to enroll', 'error');
              }
            };

            const toggleModuleCompletion = async (modId: number, currentVal: boolean) => {
              if (!activeEnrollment) {
                showToast('Click "Enroll & Start Learning" first to track completion.', 'error');
                return;
              }
              const line = enrollmentLines.find((l) => Number(l.module_id) === Number(modId));
              if (line) {
                await callKw('op.course.enrollment.line', 'write', {
                  id: line.id,
                  vals: { is_completed: !currentVal },
                });
              } else {
                await callKw('op.course.enrollment.line', 'web_save', {
                  vals: { enrollment_id: activeEnrollment.id, module_id: modId, is_completed: true },
                });
              }
              await loadLmsData();
              showToast(!currentVal ? 'Lesson marked complete!' : 'Lesson marked incomplete');
            };

            const markCourseDone = async () => {
              if (!activeEnrollment) return;
              await callKw('op.course.enrollment', 'action_complete', { id: activeEnrollment.id });
              await loadLmsData();
              showToast('Course marked completed! Certificate ready.');
            };

            if (activeCourse) {
              const pct = Math.min(100, Math.round(Number(activeEnrollment?.progress || 0)));
              return (
                <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="space-y-1">
                      <button
                        onClick={() => { setActiveLmsCourseId(null); setActiveModuleId(null); }}
                        className="text-[var(--oe-brand-primary)] font-semibold hover:underline"
                      >
                        ← Back to LMS Catalog
                      </button>
                      <h1 className="text-xl font-bold text-slate-900">{activeCourse.name}</h1>
                      <div className="text-slate-500">{activeCourse.code} · {courseModules.length} Sections/Lessons</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeEnrollment ? (
                        <>
                          <div className="w-48 bg-slate-100 rounded-lg p-2.5 border border-slate-200">
                            <div className="flex justify-between text-[11px] font-semibold mb-1">
                              <span>Progress</span>
                              <span className="text-[var(--oe-brand-primary)]">{pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          {activeEnrollment.state === 'done' && pct === 100 ? (
                            <span className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold inline-flex items-center gap-1.5">
                              <Award size={14} /> Completed & Certified
                            </span>
                          ) : (
                            <button
                              onClick={markCourseDone}
                              className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                            >
                              Complete Course
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => enrollInCourse(activeCourse.id)}
                          className="px-4 py-2 rounded-lg bg-[var(--oe-brand-primary)] text-white font-semibold hover:bg-[var(--oe-brand-primary-dark)]"
                        >
                          Enroll & Start Learning
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <aside className="md:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                        Course Sections & Lessons ({courseModules.length})
                      </div>
                      <div className="divide-y divide-slate-100">
                        {courseModules.length === 0 ? (
                          <div className="p-4 text-slate-500">No sections configured yet for this course.</div>
                        ) : courseModules.map((mod, idx) => {
                          const line = enrollmentLines.find((l) => l.module_id === mod.id);
                          const isDone = Boolean(line?.is_completed);
                          const isSelected = selectedMod?.id === mod.id;
                          return (
                            <div
                              key={mod.id}
                              onClick={() => setActiveModuleId(mod.id)}
                              className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-[var(--oe-surface-pale-blue)]/50' : 'hover:bg-slate-50'}`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModuleCompletion(mod.id, isDone);
                                }}
                                title={isDone ? 'Mark incomplete' : 'Mark complete'}
                                className="mt-0.5 text-[var(--oe-brand-primary)] shrink-0"
                              >
                                {isDone ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-400" />}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className={`font-semibold leading-snug ${isSelected ? 'text-[var(--oe-brand-primary)]' : 'text-slate-800'}`}>
                                  {idx + 1}. {mod.name}
                                </div>
                                <div className="text-[10.5px] text-slate-500 mt-0.5 capitalize">
                                  {mod.module_category || 'lesson'} · {mod.duration_mins || 30} mins
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </aside>

                    <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                      {selectedMod ? (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                                {selectedMod.module_category || 'Article / Video Lesson'}
                              </span>
                              <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedMod.name}</h2>
                            </div>
                            {activeEnrollment && (
                              <button
                                onClick={() => toggleModuleCompletion(selectedMod.id, Boolean(selectedLine?.is_completed))}
                                className={`px-3.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 ${
                                  selectedLine?.is_completed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-[var(--oe-brand-primary)] text-white'
                                }`}
                              >
                                <CheckCircle2 size={14} />
                                {selectedLine?.is_completed ? 'Completed' : 'Mark Lesson Done'}
                              </button>
                            )}
                          </div>

                          <div className="rounded-lg bg-slate-900 text-white p-6 flex flex-col items-center justify-center min-h-[190px] text-center space-y-3">
                            <PlayCircle size={40} className="text-[var(--oe-brand-gold)]" />
                            <div className="font-semibold text-sm">{selectedMod.name}</div>
                            <p className="text-slate-300 max-w-md text-[11.5px] leading-relaxed">
                              {String(selectedMod.body || activeCourse.short_desc || 'Interactive course module content, worked examples, and Cambridge syllabus guidance.').replace(/<[^>]+>/g, ' ').trim()}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => navigate({ area: 'public', publicPath: '/online-exams' })}
                              className="px-3.5 py-1.5 rounded border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Take Course Quiz / Assessment
                            </button>
                            {(() => {
                              const curIdx = courseModules.findIndex((m) => m.id === selectedMod.id);
                              const nextMod = curIdx >= 0 && curIdx + 1 < courseModules.length ? courseModules[curIdx + 1] : null;
                              if (!nextMod) return null;
                              return (
                                <button
                                  onClick={async () => {
                                    if (activeEnrollment && !selectedLine?.is_completed) {
                                      await toggleModuleCompletion(selectedMod.id, false);
                                    }
                                    setActiveModuleId(nextMod.id);
                                  }}
                                  className="px-3.5 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold inline-flex items-center gap-1.5"
                                >
                                  Complete &amp; Next Lesson <ArrowRight size={13} />
                                </button>
                              );
                            })()}
                          </div>
                        </>
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          Select a lesson on the left or enroll to begin this course.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">LMS eLearning Catalog &amp; Course Player</h1>
                    <p className="text-slate-600 mt-1">Enroll in courses, complete interactive lessons, track progress 0%–100%, and take online quizzes.</p>
                  </div>
                  <div className="relative w-72">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search LMS courses..." className="w-full px-3 py-2 border border-slate-300 rounded" />
                    <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {courses
                    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                    .map((c) => {
                      const enr = findEnrollment(c.id);
                      const modCount = lmsModules.filter((m) => m.course_id === c.id).length;
                      const pct = Math.min(100, Math.round(Number(enr?.progress || 0)));
                      return (
                        <div key={c.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col justify-between">
                          <div className="h-24 flex items-center justify-between px-4 text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--oe-brand-primary) 0%, var(--oe-brand-primary-dark) 100%)' }}>
                            <span>{c.code}</span>
                            {enr && (
                              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10.5px] font-bold">
                                {enr.state === 'done' ? 'Completed' : `${pct}%`}
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="text-[11px] text-slate-500">{c.company_id__label || 'Oshwal Academy'} · {modCount} lessons</div>
                              <h3 className="text-[15px] font-semibold text-slate-900 mt-1">{c.name}</h3>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.short_desc}</p>
                            </div>
                            {enr && (
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-emerald-600" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              {enr ? (
                                <button
                                  onClick={() => {
                                    setActiveLmsCourseId(c.id);
                                    const firstMod = lmsModules.find((m) => m.course_id === c.id);
                                    if (firstMod) setActiveModuleId(firstMod.id);
                                  }}
                                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
                                >
                                  <PlayCircle size={13} /> Continue Learning
                                </button>
                              ) : (
                                <button
                                  onClick={() => enrollInCourse(c.id)}
                                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] inline-flex items-center gap-1.5"
                                >
                                  <span>Enroll Now</span> <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()
        ) : p === '/courses-offered' || applyCourseId ? (
          /* Exact /courses-offered layout matching step_666_shot_1_b3b_pub_courses_offered */
          <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            <aside className="md:col-span-3 space-y-6 text-xs text-slate-700">
              <div>
                <div className="font-bold text-slate-900 pb-2 border-b border-slate-200 mb-2">Course Category</div>
                {['Early Years (EYFS)', 'Cambridge Primary', 'IGCSE (KS3–4)', 'AS / A-Level & IAL', 'BTEC Level 3'].map((cat) => (
                  <div key={cat} className="py-1.5 text-slate-600">{cat}</div>
                ))}
              </div>
              <div>
                <div className="font-bold text-slate-900 pb-2 border-b border-slate-200 mb-2">Price Filter</div>
                <div className="py-1">All Fee Structures</div>
              </div>
            </aside>
            <div className="md:col-span-9 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full px-3 py-2 text-xs border border-slate-300 rounded" />
                  <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                </div>
                {applyCourseId && <button onClick={() => { setApplyCourseId(null); setAppliedApp(null); }} className="text-xs text-[var(--oe-brand-primary)] font-semibold hover:underline">← Back</button>}
              </div>

              {applyCourseId ? (
                <div className="max-w-xl bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  {appliedApp ? (
                    <div className="space-y-3 text-center py-6">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                      <h2 className="text-lg font-bold text-slate-900">Application Received: {appliedApp.application_number}</h2>
                      <p className="text-xs text-slate-600">Your application is now in the Admissions pipeline.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitApplication} className="space-y-3 text-xs">
                      <h2 className="text-base font-bold text-slate-900">Online Admission Form — {courses.find((c) => c.id === applyCourseId)?.name}</h2>
                      <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First Name *" value={applyForm.first_name} onChange={(e) => setApplyForm({ ...applyForm, first_name: e.target.value })} className="p-2 border border-slate-300 rounded" />
                        <input required placeholder="Last Name *" value={applyForm.last_name} onChange={(e) => setApplyForm({ ...applyForm, last_name: e.target.value })} className="p-2 border border-slate-300 rounded" />
                        <input required type="email" placeholder="Parent Email *" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} className="p-2 border border-slate-300 rounded" />
                        <input required placeholder="Phone (+254...) *" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} className="p-2 border border-slate-300 rounded" />
                        <input required type="date" value={applyForm.birth_date} onChange={(e) => setApplyForm({ ...applyForm, birth_date: e.target.value })} className="p-2 border border-slate-300 rounded" />
                        <select value={applyForm.citizenship} onChange={(e) => setApplyForm({ ...applyForm, citizenship: e.target.value })} className="p-2 border border-slate-300 rounded">
                          <option value="kenyan">Kenyan Citizen</option>
                          <option value="non_kenyan">Non-Kenyan (Pupil&apos;s Pass Required)</option>
                        </select>
                      </div>
                      <input placeholder="Previous School / Result" value={applyForm.prev_institute_id} onChange={(e) => setApplyForm({ ...applyForm, prev_institute_id: e.target.value })} className="w-full p-2 border border-slate-300 rounded" />
                      <button type="submit" className="w-full py-2 rounded font-semibold text-white bg-[var(--oe-brand-primary)]">Submit Application</button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {courses.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((c) => (
                    <div key={c.id} className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col justify-between">
                      <div className="h-28 flex items-center justify-center text-white font-bold text-sm px-4 text-center" style={{ background: 'linear-gradient(135deg, var(--oe-brand-primary) 0%, var(--oe-brand-primary-dark) 100%)' }}>
                        {c.code}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500">{c.company_id__label}</div>
                          <h3 className="text-[15px] font-medium text-slate-900 mt-1">{c.name}</h3>
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{c.short_desc}</p>
                        </div>
                        <button onClick={() => setApplyCourseId(c.id)} className="mt-4 w-fit px-3.5 py-1.5 rounded text-xs font-medium text-white bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] inline-flex items-center gap-1.5">
                          <span>Apply</span> <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : p === '/program-offered' ? (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-5">
            <h1 className="text-2xl font-bold text-slate-900">Academic Programs & Key Stages</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {programs.map((pr) => (
                <div key={pr.id} className="p-5 rounded-lg border border-slate-200 bg-[var(--oe-surface-cream)]">
                  <div className="text-xs font-bold text-[var(--oe-brand-accent)]">{pr.code}</div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{pr.name}</h3>
                  <p className="text-xs text-slate-700 mt-2">{pr.short_desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : p === '/digital-library' ? (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-5">
            <h1 className="text-2xl font-bold text-slate-900">Digital Library & Revision Repository</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
                  <BookOpen size={20} className="text-[var(--oe-brand-primary)]" />
                  <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                  <div className="text-xs text-slate-500">{m.authors} · {m.edition}</div>
                </div>
              ))}
            </div>
          </div>
        ) : p === '/event' ? (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-5">
            <h1 className="text-2xl font-bold text-slate-900">Campus Events, Clubs & Sports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="p-5 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{ev.name}</div>
                    <div className="text-xs text-slate-500 mt-1"><Calendar size={12} className="inline mr-1" />{ev.venue}</div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)]">
                    {ev.ticket_price > 0 ? `${currencyCode} ${Number(ev.ticket_price).toLocaleString()}` : 'Included'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : p === '/shop' ? (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Campus Uniform, Book & Club Shop</h1>
                <p className="text-xs text-slate-500">Order official uniforms, CIE/Edexcel book bundles & specialist club passes</p>
              </div>
              <button
                onClick={() => navigate({ area: 'public', publicPath: '/shop/cart' })}
                className="px-4 py-2 rounded text-xs font-bold text-white bg-[var(--oe-brand-primary)] flex items-center gap-2"
              >
                <ShoppingCart size={14} /> View Cart ({cart.reduce((s, i) => s + i.qty, 0)})
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {products.map((pr) => (
                <div key={pr.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col justify-between p-4 space-y-3">
                  <div>
                    <div className="text-[10.5px] uppercase font-bold text-[var(--oe-brand-accent)]">{pr.category}</div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{pr.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{pr.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{currencyCode} {Number(pr.list_price).toLocaleString()}</span>
                    <button
                      onClick={() => {
                        setCart((prev) => {
                          const existing = prev.find((i) => i.product.id === pr.id);
                          return existing
                            ? prev.map((i) => (i.product.id === pr.id ? { ...i, qty: i.qty + 1 } : i))
                            : [...prev, { product: pr, qty: 1 }];
                        });
                        showToast(`Added ${pr.name} to cart`);
                      }}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-[var(--oe-brand-primary)]"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : p === '/shop/cart' ? (
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 text-xs">
            <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-lg text-center space-y-3">
                <div className="text-slate-500">Your cart is currently empty.</div>
                <button onClick={() => navigate({ area: 'public', publicPath: '/shop' })} className="px-4 py-2 rounded text-white font-semibold bg-[var(--oe-brand-primary)]">
                  Browse Campus Shop
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{item.product.name}</div>
                      <div className="text-slate-500">Qty: {item.qty} × {currencyCode} {Number(item.product.list_price).toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-sm">{currencyCode} {(item.qty * Number(item.product.list_price)).toLocaleString()}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between text-base font-bold pt-2">
                  <span>Order Total</span>
                  <span>{currencyCode} {cart.reduce((s, i) => s + i.qty * Number(i.product.list_price), 0).toLocaleString()}</span>
                </div>
                <button
                  onClick={async () => {
                    const amount_total = cart.reduce((s, i) => s + i.qty * Number(i.product.list_price), 0);
                    const order_summary = cart.map((i) => `${i.qty}x ${i.product.name}`).join(', ');
                    const res = await callKw('sale.order', 'web_save', { vals: { partner_id: 1, amount_total, order_summary, state: 'sale' } });
                    setCart([]);
                    showToast(`Order ${res.record.name} confirmed!`);
                    navigate({ area: 'public', publicPath: '/shop' });
                  }}
                  className="w-full py-2.5 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm Order & Generate Invoice
                </button>
              </div>
            )}
          </div>
        ) : p === '/booking' ? (
          <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            <div className="md:col-span-6 space-y-3">
              <h1 className="text-2xl font-bold text-slate-900">Book an Online Appointment</h1>
              <p className="text-slate-600">Select an appointment type with Campus Heads, Admissions or Careers Guidance</p>
              {appointments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setBookingForm((b) => ({ ...b, typeId: a.id }))}
                  className={`w-full text-left p-4 rounded-lg border ${bookingForm.typeId === a.id ? 'border-[var(--oe-brand-primary)] bg-[var(--oe-surface-pale-blue)]/30' : 'border-slate-200 bg-white'}`}
                >
                  <div className="font-bold text-sm text-slate-900">{a.name}</div>
                  <div className="text-slate-500 mt-1">{a.staff_in_charge} · {a.duration_hours} hrs</div>
                </button>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const appt = appointments.find((a) => a.id === bookingForm.typeId);
                await callKw('calendar.event', 'web_save', {
                  vals: {
                    name: `${appt?.name || 'Appointment'}: ${bookingForm.name}`,
                    start_date: bookingForm.date.replace('T', ' '),
                    location: 'Campus Meeting / Google Meet',
                    description: `Booked by ${bookingForm.name} (${bookingForm.email})`,
                  },
                });
                showToast('Appointment confirmed on Campus Calendar!');
              }}
              className="md:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-3 h-fit"
            >
              <div className="font-bold text-sm text-slate-900">Select Date & Attendee Details</div>
              <input required placeholder="Parent / Visitor Full Name *" value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} className="oe-input" />
              <input required type="email" placeholder="Email Address *" value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} className="oe-input" />
              <input required type="datetime-local" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} className="oe-input" />
              <button type="submit" className="w-full py-2 rounded font-bold text-white bg-[var(--oe-brand-primary)]">Confirm Booking</button>
            </form>
          </div>
        ) : p === '/online-exams' ? (
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 text-xs">
            <h1 className="text-2xl font-bold text-slate-900">Student Online Exams &amp; Quizzes</h1>
            {quizzes.map((qz) => {
              const qs: any[] = qz.line_ids ?? [];
              const timeLimit = (Number(qz.time_limit_hr || 0) * 60) + Number(qz.time_limit_minute || 30);
              return (
                <div key={qz.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{qz.name}</h2>
                      <div className="text-slate-500">Time Limit: {timeLimit} mins · Total Marks: {qz.total_marks}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">ACTIVE</span>
                  </div>
                  {qs.length === 0 ? (
                    <div className="p-4 text-slate-500 bg-slate-50 rounded border border-slate-200">
                      No questions have been published to this quiz yet.
                    </div>
                  ) : (
                    qs.map((q: any, idx: number) => {
                      const qText = q.name || q.question || `Question ${idx + 1}`;
                      const qMark = Number(q.mark ?? q.marks ?? 5);
                      const rawOpts = q.options
                        ? String(q.options).split('|').map((o) => o.trim()).filter(Boolean)
                        : (q.que_type === 'optional' && q.answer
                            ? [String(q.answer), 'Newton (N)', 'Joule (J)', 'Watt (W)'].filter((v, i, a) => a.indexOf(v) === i)
                            : []);
                      return (
                        <div key={q.id} className="space-y-2 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
                          <div className="font-semibold text-slate-800">{idx + 1}. {qText} ({qMark} marks)</div>
                          {rawOpts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {rawOpts.map((opt) => (
                                <label key={opt} className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    checked={quizAnswers[q.id] === opt}
                                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              value={quizAnswers[q.id] ?? ''}
                              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                              placeholder="Type your answer..."
                              className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                  {quizSubmitted && Number(quizSubmitted.quiz_id) === Number(qz.id) ? (
                    <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                      Submitted! Score: {quizSubmitted.score}% ({quizSubmitted.received_marks} / {quizSubmitted.total_marks})
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        const totalM = qs.reduce((s, q) => s + Number(q.mark ?? q.marks ?? 5), 0) || Number(qz.total_marks || 20);
                        let earned = 0;
                        const res = await callKw('op.quiz.result', 'web_save', {
                          vals: {
                            name: `QR/ONLINE/${Date.now() % 1000}`,
                            quiz_id: qz.id,
                            student_id: user?.student_id || 1,
                            total_marks: totalM,
                            state: 'open',
                          },
                        });
                        const resId = res.record.id;
                        for (const q of qs) {
                          const qMark = Number(q.mark ?? q.marks ?? 5);
                          const ans = String(q.answer ?? q.correct_answer ?? '').trim();
                          const given = String(quizAnswers[q.id] ?? '').trim();
                          const isRight = given.length > 0 && (!ans || given.toLowerCase() === ans.toLowerCase());
                          if (isRight) earned += qMark;
                          await callKw('op.quiz.result.line', 'web_save', {
                            vals: {
                              result_id: resId,
                              name: q.name || q.question || 'Question',
                              question_mark: qMark,
                              mark: isRight ? qMark : 0,
                              answer: ans,
                              given_answer: given || '—',
                            },
                          });
                        }
                        await callKw('op.quiz.result', 'get_action_submit', { id: resId });
                        await callKw('op.quiz.result', 'get_action_done', { id: resId });
                        const pct = totalM ? Math.round((earned / totalM) * 100) : 0;
                        setQuizSubmitted({ quiz_id: qz.id, score: pct, received_marks: earned, total_marks: totalM });
                        showToast('Quiz submitted & graded!');
                      }}
                      className="px-5 py-2 rounded font-bold text-white bg-[var(--oe-brand-primary)]"
                    >
                      Submit Quiz Attempt
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : p === '/contactus' ? (
          <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await callKw('crm.lead', 'web_save', { vals: { ...contactForm, stage: 'new' } });
                showToast('Inquiry received! Admissions Officer will contact you shortly.');
                setContactForm({ contact_name: '', email_from: '', phone: '', name: 'Campus Tour & Admissions Inquiry', description: '' });
              }}
              className="md:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-3"
            >
              <h1 className="text-2xl font-bold text-slate-900">Contact Admissions & Campus Office</h1>
              <input required placeholder="Parent / Guardian Name *" value={contactForm.contact_name} onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })} className="oe-input" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="email" placeholder="Email *" value={contactForm.email_from} onChange={(e) => setContactForm({ ...contactForm, email_from: e.target.value })} className="oe-input" />
                <input required placeholder="Phone (+254...) *" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="oe-input" />
              </div>
              <input required placeholder="Subject" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="oe-input" />
              <textarea required rows={4} placeholder="Questions about Nursery, Primary, IGCSE, A-Level, BTEC or Transport..." value={contactForm.description} onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })} className="oe-input" />
              <button type="submit" className="px-5 py-2 rounded font-bold text-white bg-[var(--oe-brand-primary)]">Send Inquiry</button>
            </form>
            <div className="md:col-span-5 space-y-3">
              <div className="font-bold text-base text-slate-900">Direct Campus Contacts</div>
              {companies.slice(0, 5).map((c) => (
                <div key={c.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-slate-600 mt-0.5">{c.street}, {c.city}</div>
                  <div className="text-slate-600">{c.phone} · {c.email}</div>
                </div>
              ))}
            </div>
          </div>
        ) : p === '/forum' || p === '/blog' ? (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-5 text-xs">
            <h1 className="text-2xl font-bold text-slate-900">{p === '/forum' ? 'Academic Q&A Forum' : 'Campus Blog & News'}</h1>
            {p === '/forum' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forumReply.trim()) return;
                  const res = await callKw('website.page', 'web_save', { vals: { name: forumReply, url: '/forum/post', page_type: 'forum', summary: `Posted by ${user?.name || 'Parent / Visitor'}` } });
                  setPages((prev) => [res.record, ...prev]);
                  setForumReply('');
                  showToast('Forum topic posted!');
                }}
                className="flex gap-2"
              >
                <input value={forumReply} onChange={(e) => setForumReply(e.target.value)} placeholder="Ask a question about IGCSE choices, transport, or clubs..." className="flex-1 oe-input" />
                <button type="submit" className="px-4 py-2 rounded font-semibold text-white bg-[var(--oe-brand-primary)]">Post Question</button>
              </form>
            )}
            {pages.map((pg) => (
              <div key={pg.id} className="p-5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="text-[10.5px] font-bold uppercase text-[var(--oe-brand-primary)]">{pg.page_type}</div>
                <div className="font-bold text-sm text-slate-900">{pg.name}</div>
                <div className="text-slate-600">{pg.summary}</div>
              </div>
            ))}
          </div>
        ) : p === '/alumni/job/card' || p === '/campus/jobs' ? (
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-4 text-xs">
            <h1 className="text-2xl font-bold text-slate-900">{p === '/alumni/job/card' ? 'Alumni Career Board' : 'Campus Internships & Part-Time Roles'}</h1>
            {jobPosts.map((jp) => (
              <div key={jp.id} className="p-5 rounded-lg border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-slate-900">{jp.name}</div>
                  <div className="text-slate-600 mt-1">{jp.description}</div>
                </div>
                <button
                  onClick={async () => {
                    await callKw('op.job.applicant', 'web_save', { vals: { name: `${user?.name || 'Candidate'} — ${jp.name}`, job_post_id: jp.id, student_id: user?.student_id || 1, email: user?.login || 'applicant@oshwalacademy.sc.ke' } });
                    showToast('Application submitted!');
                  }}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-[var(--oe-brand-primary)]"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        ) : p === '/jobs' ? (
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 text-xs">
            <h1 className="text-2xl font-bold text-slate-900">Faculty & Staff Careers</h1>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-3">
                {jobs.map((item) => (
                  <div key={item.id} className="p-5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{item.name}</div>
                      <div className="text-slate-600 mt-1">{item.company_id__label} · Openings: {item.no_of_recruitment}</div>
                    </div>
                    <button
                      onClick={() => setJobApplyForm((f) => ({ ...f, jobId: item.id }))}
                      className="px-3.5 py-1.5 rounded font-semibold text-white bg-[var(--oe-brand-primary)]"
                    >
                      Apply / Upload CV
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const job = jobs.find((j) => j.id === (jobApplyForm.jobId || jobs[0]?.id));
                  await callKw('hr.applicant', 'web_save', {
                    vals: {
                      name: job?.name || 'Faculty Application',
                      partner_name: jobApplyForm.partner_name,
                      email_from: jobApplyForm.email_from,
                      partner_phone: jobApplyForm.partner_phone,
                      job_id: job?.id || 1,
                      notes: `Uploaded CV: ${jobApplyForm.cvName || 'N/A'}\n${jobApplyForm.notes}`,
                    },
                  });
                  showToast('HR Application & CV submitted!');
                  setJobApplyForm({ jobId: 0, partner_name: '', email_from: '', partner_phone: '', cvName: '', notes: '' });
                }}
                className="md:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3 h-fit"
              >
                <div className="font-bold text-sm text-slate-900">Apply for Position</div>
                <select value={jobApplyForm.jobId || jobs[0]?.id || ''} onChange={(e) => setJobApplyForm({ ...jobApplyForm, jobId: Number(e.target.value) })} className="oe-input">
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
                <input required placeholder="Full Name *" value={jobApplyForm.partner_name} onChange={(e) => setJobApplyForm({ ...jobApplyForm, partner_name: e.target.value })} className="oe-input" />
                <input required type="email" placeholder="Email *" value={jobApplyForm.email_from} onChange={(e) => setJobApplyForm({ ...jobApplyForm, email_from: e.target.value })} className="oe-input" />
                <input required placeholder="Phone (+254...) *" value={jobApplyForm.partner_phone} onChange={(e) => setJobApplyForm({ ...jobApplyForm, partner_phone: e.target.value })} className="oe-input" />
                <label className="block border border-dashed border-slate-300 rounded p-3 text-center cursor-pointer hover:bg-slate-50">
                  <div className="font-semibold text-slate-700">{jobApplyForm.cvName ? `Selected CV: ${jobApplyForm.cvName}` : 'Upload CV / Resume (PDF or DOCX) *'}</div>
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => setJobApplyForm({ ...jobApplyForm, cvName: e.target.files?.[0]?.name || '' })} />
                </label>
                <textarea rows={2} placeholder="Teaching experience & Good Conduct status..." value={jobApplyForm.notes} onChange={(e) => setJobApplyForm({ ...jobApplyForm, notes: e.target.value })} className="oe-input" />
                <button type="submit" className="w-full py-2 rounded font-bold text-white bg-[var(--oe-brand-primary)]">Submit Application</button>
              </form>
            </div>
          </div>
        ) : p === '/website/activity/announcement' || p === '/alumni' ? (
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              {p === '/alumni' ? 'Alumni Network' : 'University & Placement Announcements'}
            </h1>
            {(p === '/alumni' ? alumni : announcements).map((item) => (
              <div key={item.id} className="p-5 rounded-lg border border-slate-200 bg-white">
                <div className="font-bold text-sm text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-600 mt-1">{item.description || item.company_id__label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <section className="text-white py-14 px-4" style={{ background: 'linear-gradient(135deg, var(--oe-brand-primary) 0%, var(--oe-brand-primary-dark) 100%)' }}>
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-slate-900" style={{ backgroundColor: 'var(--oe-brand-gold)' }}>
                    {companies[0]?.founded || 'International Education Excellence'}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                    {companies[0]?.name}
                  </h1>
                  <p className="text-sm text-slate-100/90 max-w-xl">
                    {companies[0]?.curriculum_summary}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => navigate({ area: 'public', publicPath: '/courses-offered' })} className="px-5 py-2.5 rounded text-xs font-bold text-white shadow" style={{ backgroundColor: 'var(--oe-brand-accent)' }}>
                      Apply Online (7-Step Intake)
                    </button>
                    <button onClick={() => navigate({ area: 'login' })} className="px-5 py-2.5 rounded text-xs font-bold bg-white text-slate-900 shadow">
                      Sign In / Demo Roles
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-slate-900">
                  {[
                    ['30+', 'IGCSE & A-Level Subjects', 'var(--oe-card-coral)'],
                    ['180+', 'Teaching Faculty', 'var(--oe-card-periwinkle)'],
                    ['45%', 'Top World Universities', 'var(--oe-surface-cream)'],
                    ['6:1', 'Student-Teacher Ratio', 'var(--oe-surface-pale-blue)'],
                  ].map(([num, lbl, bg]) => (
                    <div key={lbl} className="p-4 rounded-xl shadow" style={{ backgroundColor: bg }}>
                      <div className="text-2xl font-extrabold">{num}</div>
                      <div className="text-xs font-semibold mt-1">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award size={20} className="text-[var(--oe-brand-accent)]" /> Our Campuses & Educational Divisions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {companies.filter((c) => c.campus_type === 'campus').map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-5 bg-white shadow-2xs space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--oe-brand-accent)' }}>{c.code}</div>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    <div className="text-xs text-slate-600 flex items-start gap-1.5"><MapPin size={13} className="shrink-0 mt-0.5" />{c.street}, {c.city}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5"><Phone size={13} />{c.phone}</div>
                    <div className="text-xs text-slate-700 font-medium pt-1 border-t border-slate-100">{c.head_of_school}</div>
                    <div className="text-[11px] text-slate-500">{c.curriculum_summary}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};
