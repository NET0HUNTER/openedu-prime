import { store } from '../store.js';
import { seedInstalledModules } from './modules.js';

export function seedDefault(): void {
  store.reset('default');
  const c = (model: string, vals: Record<string, unknown>) => store.create(model, vals, 1, false);

  c('res.country', { name: 'United States', code: 'US' });
  store.syncSystemModelsCatalog();
  c('res.users.role', { name: 'School Administrator', code: 'ROLE-ADMIN', base_role: 'admin', comment: 'Full ERP administration privileges.', active: true });
  c('res.users.role', { name: 'Faculty & Teacher', code: 'ROLE-FACULTY', base_role: 'faculty', comment: 'Academic classroom, LMS, grading and timetable access.', active: true });
  c('res.users.role', { name: 'Backoffice & Finance', code: 'ROLE-BACKOFFICE', base_role: 'backoffice', comment: 'Admissions, student records and billing.', active: true });
  const theme = {
    theme_primary: '#1565C0', theme_primary_dark: '#0D47A1', theme_accent: '#714B67', theme_gold: '#F59E0B',
    theme_card_1: '#FCE4EC', theme_card_2: '#E8EAF6', theme_surface_1: '#FFFFFF', theme_surface_2: '#E3F2FD',
    theme_bg: '#f9fbfc', theme_font: 'Rubik', menu_style: 'apps', chatter_position: 'sided', dark_mode: false,
  };
  const co = c('res.company', {
    name: 'OpenEduCat', code: 'OEC-MAIN', campus_type: 'school', street: '8000 Marina Blvd, Suite 300', city: 'Chicago', country_id: 1,
    email: 'info@yourcompany.example.com', phone: '+1 555-555-5556', currency: 'USD',
    report_footer: '+1 555-555-5556  info@yourcompany.example.com  https://www.openeducat.org', ...theme,
  });
  c('res.company', { name: 'Campus 2', code: 'OEC-C2', parent_id: co.id, campus_type: 'campus', street: '400 Howard St', city: 'San Francisco', country_id: 1, currency: 'USD', ...theme });

  c('res.config.settings', {
    name: 'OpenEduCat Default Settings', seed_profile: 'default',
    term_program: 'Program', term_course: 'Course', term_batch: 'Batch', term_subject: 'Subject',
    term_faculty: 'Faculty', term_student: 'Student', website_title: 'OpenEduCat School ERP',
    website_tagline: 'Comprehensive Educational Management System', demo_logins: true, company_id: co.id,
  });

  const ay = c('op.academic.year', { name: '2026–2027', start_date: '2026-09-01', end_date: '2027-06-30', term_structure: 'two_semesters', company_id: co.id });
  const t1 = c('op.academic.term', { name: 'Semester 1', academic_year_id: ay.id, term_start_date: '2026-09-01', term_end_date: '2027-01-31', company_id: co.id });
  const ft = c('op.fees.terms', { name: 'Semester Fixed Terms', code: 'SEM-1', company_id: co.id });
  const lvl = c('op.program.level', { name: 'Bachelors', code: 'BACH', company_id: co.id });
  const prog = c('op.program', { name: 'Bachelor of Computer Applications', code: 'BCA', program_level_id: lvl.id, company_id: co.id });
  const c1 = c('op.course', { name: 'BCA-CC-Semester-1', code: 'BCA-S1', program_id: prog.id, fees_term_id: ft.id, is_lms_published: true, company_id: co.id });
  const c2 = c('op.course', { name: 'Learn Python', code: 'PY-101', program_id: prog.id, fees_term_id: ft.id, is_lms_published: true, company_id: co.id });
  const b1 = c('op.batch', { name: 'BCA BATCH-A', code: 'BCA-A', course_id: c1.id, start_date: '2026-09-01', end_date: '2027-01-31', company_id: co.id });
  const s1 = c('op.subject', { name: 'Fundamentals of Programming using C', code: 'CS101', course_id: c1.id, company_id: co.id });
  const fac = c('op.faculty', { first_name: 'William D', last_name: 'Mitchell', email: 'faculty@openeducat.com', company_id: co.id });
  const partnerStu = c('res.partner', { name: 'Emma J Parker', is_student: true, email: 'student@openeducat.com', street: '350 5th Avenue', city: 'New York', company_id: co.id });
  const stu = c('op.student', { gr_no: 'ST001', title: 'Miss', first_name: 'Emma J', last_name: 'Parker', email: 'student@openeducat.com', gender: 'f', birth_date: '2004-05-06', blood_group: 'A-', nationality: 1, street: '350 5th Avenue', city: 'New York', partner_id: partnerStu.id, course_id: c1.id, batch_id: b1.id, company_id: co.id });
  const par = c('op.parent', { name: 'Jacob Parker', email: 'parent@openeducat.com', student_ids: [stu.id], company_id: co.id });

  const uAdmin = c('res.users', { name: 'Mitchell Admin', login: 'admin', role: 'admin', company_id: co.id, company_ids: [co.id], is_demo: true });
  c('res.users', { name: 'William D Mitchell', login: 'faculty@openeducat.com', role: 'faculty', faculty_id: fac.id, company_id: co.id, company_ids: [co.id], is_demo: true });
  c('res.users', { name: 'Siddharth', login: 'backoffice@openeducat.com', role: 'backoffice', company_id: co.id, company_ids: [co.id], is_demo: true });
  c('res.users', { name: 'Emma J Parker', login: 'student@openeducat.com', role: 'student', student_id: stu.id, company_id: co.id, company_ids: [co.id], is_demo: true });
  c('res.users', { name: 'Jacob Parker', login: 'parent@openeducat.com', role: 'parent', parent_id: par.id, student_id: stu.id, company_id: co.id, company_ids: [co.id], is_demo: true });

  const stgDraft = c('admission.stage', { name: 'Draft', sequence: 1, fold: false, state: 'draft', view_boolean: true, company_id: co.id });
  c('admission.stage', { name: 'Submitted', sequence: 2, fold: false, state: 'submit', view_boolean: true, company_id: co.id });
  c('admission.stage', { name: 'Confirmed', sequence: 3, fold: false, state: 'confirm', view_boolean: true, company_id: co.id });
  c('admission.stage', { name: 'Done', sequence: 4, fold: false, state: 'done', view_boolean: true, company_id: co.id });
  c('admission.stage', { name: 'Rejected', sequence: 5, fold: true, state: 'reject', view_boolean: true, company_id: co.id });

  const ltDef = c('student.leave.type', { name: 'Medical Leave', code: 'MED', requires_medical_note: true, company_id: co.id });
  c('student.leave.request', { student_id: stu.id, leave_type: ltDef.id, start_date: '2026-11-20T09:00:00Z', end_date: '2026-11-21T17:00:00Z', duration: 2.0, state: 'draft', company_id: co.id, description: 'Medical checkup' });

  const reg = c('op.admission.register', { name: 'Certificate in Fine Arts', academic_years_id: ay.id, course_id: c2.id, academic_term_id: t1.id, start_date: '2026-11-18', end_date: '2026-12-18', fees: 2000, state: 'application', company_id: co.id });
  c('op.admission.fees.line', { register_id: reg.id, course_id: c2.id, fees: 2000, course_fees_product_id: 'Fine Arts Term Tuition Fee', registration_fees: false, register_product_id: 'Fine Arts Registration Fee', company_id: co.id });
  c('op.admission', { register_id: reg.id, title: 'Mr.', first_name: 'Joon H', last_name: 'Kim', name: 'Mr. Joon H Kim', email: 'joonkim@example.com', phone: '+1 555-0146', course_id: c2.id, batch_id: b1.id, fees: 2000, birth_date: '2004-03-10', state: 'draft', stage_id: stgDraft.id, company_id: co.id });
  const invDef = c('account.move', { move_type: 'out_invoice', partner_id: partnerStu.id, student_id: stu.id, fee_category: 'tuition', invoice_date_due: '2026-12-01', line_description: 'Semester 1 Tuition Fee — BCA-CC-Semester-1', amount_total: 2000, amount_residual: 400, state: 'posted', payment_state: 'partial', company_id: co.id });
  c('account.move.line', { move_id: invDef.id, name: 'Semester 1 Tuition Fee — BCA-CC-Semester-1', account_name: '400000 Academic Tuition Revenue', quantity: 1, price_unit: 2000, price_subtotal: 2000, company_id: co.id });
  c('op.session', { name: 'William D Mitchell: Programming C', faculty_id: fac.id, course_id: c1.id, batch_id: b1.id, subject_id: s1.id, state: 'confirm', company_id: co.id });
  c('ir.cron', { name: 'Queue Job Worker Heartbeat', method: 'queue_job.worker_heartbeat', cron: '*/1 * * * *', channel: 'root', model: 'queue.job', active: true });
  c('dashboard.kpi', { name: 'Admissions', model: 'op.admission', measure: 'count', target: 50, color: '#1565C0', icon: 'FileUser', dashboard: 'executive' });
  c('product.template', { name: 'Campus Hoodie & Handbook Pack', category: 'uniform', list_price: 49, qty_available: 100, is_published: true, company_id: co.id });
  c('calendar.online.appointment', { name: 'Meeting with Principal', code: 'COA001', duration_hours: 0.5, staff_in_charge: 'Mitchell Admin', share_url: '/booking', company_id: co.id });
  c('helpdesk.team', { name: 'Campus IT Desk', leader_id: uAdmin.id, alias_email: 'help@openeducat.com', company_id: co.id });
  c('account.journal', { name: 'Customer Invoices', code: 'INV', type: 'sale', default_account: '400000 Product Sales', company_id: co.id });
  c('account.journal', { name: 'Vendor Bills', code: 'BILL', type: 'purchase', default_account: '200100 Accounts Payable', company_id: co.id });
  c('account.journal', { name: 'Bank', code: 'BNK1', type: 'bank', default_account: '101400 Bank', company_id: co.id });
  c('op.department', { name: 'Engineering', code: 'ENG', company_id: co.id });
  c('op.media.type', { name: 'Course Books', code: 'CB', company_id: co.id });
  seedInstalledModules(c);
  store.ensureSecurityBootstrap();
}
