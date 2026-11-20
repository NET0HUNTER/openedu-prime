import { store } from '../store.js';
import { seedInstalledModules } from './modules.js';

export function seedOshwal(): void {
  store.reset('oshwal');
  const c = (model: string, vals: Record<string, unknown>) => store.create(model, vals, 1, false);

  c('res.country', { name: 'Kenya', code: 'KE' });
  c('res.country', { name: 'United Kingdom', code: 'GB' });
  c('res.country', { name: 'India', code: 'IN' });
  c('res.lang', { name: 'English (US)', code: 'en_US', iso_code: 'en', active: true });
  c('res.lang', { name: 'English (UK)', code: 'en_GB', iso_code: 'en', active: true });
  c('res.lang', { name: 'Swahili / Kiswahili', code: 'sw_KE', iso_code: 'sw', active: true });

  c('res.users.role', { name: 'School Administrator', code: 'ROLE-ADMIN', model_access_count: 145, rules_count: 32, comment: 'Full multi-campus ERP access across OERB.', active: true });
  c('res.users.role', { name: 'Academic Faculty & Teacher', code: 'ROLE-FACULTY', model_access_count: 68, rules_count: 18, comment: 'Classroom, grading, attendance, LMS & timetable access.', active: true });
  c('res.users.role', { name: 'Finance & Backoffice Officer', code: 'ROLE-BACKOFFICE', model_access_count: 54, rules_count: 14, comment: 'Accounting, fee invoicing, payroll, HR & compliance access.', active: true });

  c('op.board.affiliation', { name: 'Cambridge Assessment International Education (CAIE)', code: 'CAIE-KE042', note: 'Accredited Cambridge International School for Primary, Lower Secondary, IGCSE & AS/A-Level.' });
  c('op.board.affiliation', { name: 'Pearson Edexcel & BTEC International', code: 'EDEXCEL-BTEC', note: 'Approved Centre for International GCSE, International A-Level (IAL) & BTEC Level 3.' });

  // 1. Companies / Campuses (OERB + 4 Nairobi Campuses + Mombasa Campus)
  const theme = {
    theme_primary: '#1e3f7c', theme_primary_dark: '#21407a', theme_accent: '#ec1c24', theme_gold: '#f4cb00',
    theme_card_1: '#f68b92', theme_card_2: '#91a3c7', theme_surface_1: '#fcf5ea', theme_surface_2: '#cfdfff',
    theme_bg: '#f9fbfc', theme_font: 'Rubik', menu_style: 'apps', chatter_position: 'sided', dark_mode: false,
    report_header: 'Cambridge Assessment International Education (Centre KE042) · Pearson Edexcel Approved Centre · BTEC Level 3',
    report_footer: 'Oshwal Education & Relief Board · P.O. Box 49633 - 00100 Nairobi, Kenya · Registered Educational Trust #1941',
    external_report_layout_id: 'light',
    paperformat: 'a4',
    watermark_enabled: true,
  };
  const oerb = c('res.company', {
    name: 'Oshwal Education & Relief Board (OERB)', code: 'OERB-HQ', campus_type: 'group',
    motto: 'Compass for Life Skills — Inspiring and Growing Unique Greatness',
    head_of_school: 'Chairman: Mr. Suhash Ratilal Shah (2024–2026)', founded: '11 April 1941 (Academy Est. 1950)',
    street: 'First Parklands Avenue, Off Mpaka Road, Parklands', city: 'Nairobi', country_id: 1,
    postal_address: 'P.O. Box 49633 – 00100, Nairobi, Kenya', phone: '+254 142 645 861', phone2: '+254 735 888 845',
    email: 'enquiries@oerb.org', website: 'https://www.oshwalacademy.sc.ke',
    board_affiliation: 'CAIE, Pearson Edexcel, Pearson BTEC, ASDAN, ACT, SAT, IELTS',
    curriculum_summary: 'British National Curriculum (EYFS, IEYC, Primary, Lower Secondary, IGCSE, AS/A-Level, IAL, BTEC Level 3)',
    student_capacity: 3200, staff_count: 520, ...theme,
  });
  const nur = c('res.company', {
    name: 'Oshwal Academy Nairobi — Nursery', code: 'OAN-NUR', parent_id: oerb.id, campus_type: 'campus',
    motto: 'Putting Children First', head_of_school: 'Ms. Rooma Mali', founded: '6 October 1968',
    street: '6 Wambugu Road, Off Limuru Road, Parklands', city: 'Nairobi', country_id: 1,
    postal_address: 'P.O. Box 1130 – 00606, Nairobi', phone: '+254 722 291 833', phone2: '+254 735 347 211',
    email: 'nursery@oshwalacademy.sc.ke', website: 'https://nursery.oshwalacademy.sc.ke',
    board_affiliation: 'EYFS (UK), Inclusive Education Dept (IED 08:00–15:00)',
    curriculum_summary: 'Playgroup (20:3), Pre-School (25:2), Kindergarten (25:2), Reception (25:2), IED (10:3)',
    student_capacity: 520, staff_count: 95, ...theme,
  });
  const pri = c('res.company', {
    name: 'Oshwal Academy Nairobi — Primary', code: 'OAN-PRI', parent_id: oerb.id, campus_type: 'campus',
    motto: 'Compass for Life Skills', head_of_school: 'Ms. Kalpana Vora & SLT', founded: '1950',
    street: '2nd Parklands Avenue, Mpaka Road Junction, Parklands', city: 'Nairobi', country_id: 1,
    postal_address: 'P.O. Box 1130 – 00606, Nairobi', phone: '+254 725 506 510', phone2: '+254 736 743 660',
    email: 'primary@oshwalacademy.sc.ke', website: 'https://primary.oshwalacademy.sc.ke',
    board_affiliation: 'Cambridge Primary (CIE), ASDAN IED (Ages 7–20), KAIS & PIPSSA',
    curriculum_summary: 'Years 1–6 (6 streams A–F per year), Paid Clubs (15:20–16:20), Tue/Thu Non-Paid Clubs',
    student_capacity: 980, staff_count: 145, ...theme,
  });
  const jnr = c('res.company', {
    name: 'Oshwal Academy Nairobi — Junior High', code: 'OAN-JNR', parent_id: oerb.id, campus_type: 'campus',
    motto: 'Compass for Life Skills', head_of_school: 'Mrs. Sujata Yanamandra', founded: '1950',
    street: 'First Parklands Avenue, Off Mpaka Road, Parklands', city: 'Nairobi', country_id: 1,
    postal_address: 'P.O. Box 1130 – 00606, Nairobi', phone: '+254 725 529 622', phone2: '+254 734 745 555',
    email: 'juniorhigh@oshwalacademy.sc.ke', website: 'https://junior.oshwalacademy.sc.ke',
    board_affiliation: 'CAIE & Pearson Edexcel Approved IGCSE Centre',
    curriculum_summary: 'Key Stage 3 (Years 7–9) & Key Stage 4 IGCSE (Years 10–11, 28 Subjects)',
    student_capacity: 820, staff_count: 120, ...theme,
  });
  const snr = c('res.company', {
    name: 'Oshwal Academy Nairobi — Senior High', code: 'OAN-SNR', parent_id: oerb.id, campus_type: 'campus',
    motto: 'Compass for Life Skills', head_of_school: 'Senior High SLT (Academic Consultant: Mrs. Jyotsna Chotai)', founded: '1950',
    street: 'Wambugu Lane, Off Parklands Road, Parklands', city: 'Nairobi', country_id: 1,
    postal_address: 'P.O. Box 1130 – 00606, Nairobi', phone: '+254 721 821 962', phone2: '+254 787 157 166',
    email: 'seniorhigh@oshwalacademy.sc.ke', website: 'https://senior.oshwalacademy.sc.ke',
    board_affiliation: 'Pearson Edexcel (IAL, BTEC Level 3), CAIE (AS/A-Level), ACT, SAT, IELTS',
    curriculum_summary: 'Key Stage 5 (Years 12–13): 17 A-Level/IAL Subjects + 4 BTEC Level 3 Extended Diplomas',
    student_capacity: 360, staff_count: 65, ...theme,
  });
  const mba = c('res.company', {
    name: 'Oshwal Academy Mombasa', code: 'OAM-MBA', parent_id: oerb.id, campus_type: 'campus',
    motto: 'Compass for Life Skills', head_of_school: 'Ms. Mildred Aseyo', founded: '1968 (Nyali Campus 2004)',
    street: 'Off Beach Road, Nyali (14-Acre Campus)', city: 'Mombasa', country_id: 1,
    postal_address: 'P.O. Box 83021 – 80100, Mombasa', phone: '+254 722 207 785', phone2: '+254 735 839 777',
    email: 'customercare@oshwalacademy.sc.ke', website: 'https://mombasa.oshwalacademy.sc.ke',
    board_affiliation: 'IEYC, EYFS, Cambridge Primary, Cambridge Lower Secondary, IGCSE, AS/A-Level, Edexcel IAL',
    curriculum_summary: 'All-Through Ages 2–18 + Paid Saturday Enrichment (Skating, LAMDA)',
    student_capacity: 850, staff_count: 110, ...theme,
  });

  // 2. Settings
  c('res.config.settings', {
    name: 'OERB / Oshwal Academy Global Configuration', seed_profile: 'oshwal',
    term_program: 'Curriculum Pathway', term_course: 'Year Group', term_batch: 'Stream / Class',
    term_subject: 'Subject', term_faculty: 'Teacher / Lecturer', term_student: 'Learner / Student',
    academic_year_start_month: 9, withdrawal_notice_days: 90, attendance_absentee_alert: true,
    absentee_channel: 'whatsapp', library_fine_per_day: 25, compliance_warning_days: 60,
    mpesa_env: 'simulate', mpesa_shortcode: '522522', mpesa_callback_url: '/api/v1/integrations/mpesa/c2b-callback',
    whatsapp_provider: 'simulate', sms_provider: 'simulate', email_provider: 'simulate',
    ai_provider: 'none', meeting_provider: 'google_meet', etims_enabled: true, exam_board_edi: true,
    website_title: 'Oshwal Academy — Nairobi & Mombasa (OERB)',
    website_tagline: 'Compass for Life Skills — Inspiring and Growing Unique Greatness',
    public_admissions_open: true, demo_logins: true, company_id: oerb.id,
  });

  // 3. Academic Year & Terms
  const ay = c('op.academic.year', { name: '2026–2027 Academic Year', start_date: '2026-09-01', end_date: '2027-07-18', term_structure: 'three_terms', company_id: oerb.id });
  const t1 = c('op.academic.term', { name: 'Term 1 (Sep–Dec 2026)', academic_year_id: ay.id, term_start_date: '2026-09-01', term_end_date: '2026-12-12', company_id: oerb.id });
  c('op.academic.term', { name: 'Term 2 (Jan–Apr 2027)', academic_year_id: ay.id, term_start_date: '2027-01-08', term_end_date: '2027-04-05', company_id: oerb.id });
  c('op.academic.term', { name: 'Term 3 (May–Jul 2027)', academic_year_id: ay.id, term_start_date: '2027-05-05', term_end_date: '2027-07-18', company_id: oerb.id });

  // 4. Departments, Program Levels, Programs
  const dSci = c('op.department', { name: 'Sciences & Mathematics', code: 'SCI-MTH', company_id: jnr.id });
  const dHum = c('op.department', { name: 'Humanities & Languages', code: 'HUM-LNG', company_id: jnr.id });
  const dBtec = c('op.department', { name: 'BTEC Vocational & Enterprise', code: 'BTEC-VOC', company_id: snr.id });
  const dIed = c('op.department', { name: 'Inclusive Education (IED / ASDAN)', code: 'IED-SEN', company_id: pri.id });

  const lEyfs = c('op.program.level', { name: 'Early Years (EYFS / IEYC)', code: 'EYFS', company_id: nur.id });
  const lPri = c('op.program.level', { name: 'Primary (KS1 & KS2)', code: 'KS1-2', company_id: pri.id });
  const lSec = c('op.program.level', { name: 'Junior High (KS3 & IGCSE)', code: 'KS3-4', company_id: jnr.id });
  const lSixth = c('op.program.level', { name: 'Senior High / Sixth Form (KS5)', code: 'KS5', company_id: snr.id });

  const pEyfs = c('op.program', { name: 'Early Years Foundation Stage (EYFS / IEYC)', code: 'PROG-EYFS', program_level_id: lEyfs.id, min_unit_load: 7, max_unit_load: 7, company_id: nur.id, short_desc: '7 EYFS Learning Areas for ages 1.5–5.5 (Nairobi & Mombasa)' });
  const pPri = c('op.program', { name: 'Cambridge Primary (Years 1–6)', code: 'PROG-CIE-PRI', program_level_id: lPri.id, min_unit_load: 8, max_unit_load: 10, company_id: pri.id, short_desc: 'CIE English, Maths, Science + ICT, Languages, Arts, Sports & ASDAN IED' });
  const pIgcse = c('op.program', { name: 'Cambridge & Pearson Edexcel IGCSE (KS3–4)', code: 'PROG-IGCSE', program_level_id: lSec.id, department_id: dSci.id, min_unit_load: 8, max_unit_load: 10, company_id: jnr.id, short_desc: '9-subject IGCSE pathway (Compulsory English, Maths & Second Language)' });
  const pALevel = c('op.program', { name: 'GCE AS/A-Level & Pearson Edexcel IAL (KS5)', code: 'PROG-ALEVEL', program_level_id: lSixth.id, department_id: dSci.id, min_unit_load: 3, max_unit_load: 4, required_thesis: true, company_id: snr.id, short_desc: 'Pre-university AS/A-Level (min 5 IGCSE credits incl. English & Math)' });
  const pBtec = c('op.program', { name: 'Pearson BTEC Level 3 Extended Diploma', code: 'PROG-BTEC3', program_level_id: lSixth.id, department_id: dBtec.id, min_unit_load: 1, max_unit_load: 2, company_id: snr.id, short_desc: '2-year coursework-assessed vocational pre-university diploma (eq. 3 A-Levels)' });

  // 5. Grade Scales
  const gsIgcse = c('op.grade.scale', { name: 'Pearson Edexcel / CAIE IGCSE (9–1)', board: 'Pearson Edexcel / CAIE', company_id: jnr.id, state: 'active' });
  [['9', 90, 100, 9], ['8', 80, 89.9, 8], ['7', 70, 79.9, 7], ['6', 60, 69.9, 6], ['5', 50, 59.9, 5], ['4', 40, 49.9, 4], ['3', 30, 39.9, 3], ['U', 0, 29.9, 0]].forEach(([n, mn, mx, g]) =>
    c('op.grade.scale.line', { scale_id: gsIgcse.id, name: n, min_pct: mn, max_pct: mx, gpa: g, company_id: jnr.id }),
  );
  const gsALevel = c('op.grade.scale', { name: 'GCE A-Level / Edexcel IAL (A*–E)', board: 'CAIE / Edexcel IAL', company_id: snr.id, state: 'active' });
  [['A*', 90, 100, 4.0], ['A', 80, 89.9, 3.7], ['B', 70, 79.9, 3.3], ['C', 60, 69.9, 3.0], ['D', 50, 59.9, 2.3], ['E', 40, 49.9, 2.0], ['U', 0, 39.9, 0]].forEach(([n, mn, mx, g]) =>
    c('op.grade.scale.line', { scale_id: gsALevel.id, name: n, min_pct: mn, max_pct: mx, gpa: g, company_id: snr.id }),
  );
  const gsBtec = c('op.grade.scale', { name: 'Pearson BTEC Level 3 (D*–P)', board: 'Pearson BTEC', company_id: snr.id, state: 'active' });
  [['D*', 85, 100, 4.0], ['D', 70, 84.9, 3.5], ['M', 55, 69.9, 2.7], ['P', 40, 54.9, 2.0], ['N', 0, 39.9, 0]].forEach(([n, mn, mx, g]) =>
    c('op.grade.scale.line', { scale_id: gsBtec.id, name: n, min_pct: mn, max_pct: mx, gpa: g, company_id: snr.id }),
  );
  const gsEyfs = c('op.grade.scale', { name: 'EYFS / Primary Attainment', board: 'EYFS / CIE Primary', company_id: nur.id, state: 'active' });
  [['Exceeding', 80, 100, 3], ['Expected', 50, 79.9, 2], ['Emerging', 0, 49.9, 1]].forEach(([n, mn, mx, g]) =>
    c('op.grade.scale.line', { scale_id: gsEyfs.id, name: n, min_pct: mn, max_pct: mx, gpa: g, company_id: nur.id }),
  );

  // 6. Fees Terms
  const ftTermly = c('op.fees.terms', { name: 'OERB Termly Tuition (Sep / Jan / May)', code: 'OERB-TERM', terms_type: 'fixed_date', note: 'Admission + Caution Money + Termly Tuition', company_id: oerb.id });

  // 7. Courses / Year Groups across Nairobi & Mombasa
  const cRec = c('op.course', { name: 'Reception (EYFS Foundation 2)', code: 'OAN-REC', program_id: pEyfs.id, evaluation_type: 'CCE', fees_term_id: ftTermly.id, min_unit_load: 7, max_unit_load: 7, grade_scale_id: gsEyfs.id, is_lms_published: true, company_id: nur.id, short_desc: 'Ages 4.5–5.5 EYFS Reception (25:2 ratio)' });
  const cY5 = c('op.course', { name: 'Year 5 — Cambridge Primary (KS2)', code: 'OAN-Y5', program_id: pPri.id, evaluation_type: 'normal', fees_term_id: ftTermly.id, min_unit_load: 8, max_unit_load: 10, grade_scale_id: gsEyfs.id, is_lms_published: true, company_id: pri.id, short_desc: '6-stream Cambridge Primary Year 5 + Clubs (15:20–16:20)' });
  const cY10 = c('op.course', { name: 'Year 10 — IGCSE (KS4)', code: 'OAN-Y10-IGCSE', program_id: pIgcse.id, department_id: dSci.id, evaluation_type: 'normal', fees_term_id: ftTermly.id, min_unit_load: 9, max_unit_load: 10, grade_scale_id: gsIgcse.id, is_lms_published: true, company_id: jnr.id, short_desc: 'CAIE & Edexcel IGCSE Year 10 (9 subjects standard load)' });
  const cY12AS = c('op.course', { name: 'Year 12 — GCE AS-Level & IAL', code: 'OAN-Y12-AS', program_id: pALevel.id, department_id: dSci.id, evaluation_type: 'normal', fees_term_id: ftTermly.id, min_unit_load: 3, max_unit_load: 4, grade_scale_id: gsALevel.id, is_lms_published: true, company_id: snr.id, short_desc: 'Sixth Form Year 12 AS-Level (4 subjects, min 5 IGCSE credits)' });
  const cY12Btec = c('op.course', { name: 'Year 12 — Pearson BTEC Level 3 Extended Diploma', code: 'OAN-Y12-BTEC', program_id: pBtec.id, department_id: dBtec.id, evaluation_type: 'CWA', fees_term_id: ftTermly.id, min_unit_load: 1, max_unit_load: 2, grade_scale_id: gsBtec.id, is_lms_published: true, company_id: snr.id, short_desc: '100% coursework BTEC Level 3 (Art & Design, Enterprise, Hospitality, Sport)' });
  const cMbaIgcse = c('op.course', { name: 'Mombasa Year 10 — Cambridge IGCSE', code: 'OAM-Y10-IGCSE', program_id: pIgcse.id, evaluation_type: 'normal', fees_term_id: ftTermly.id, min_unit_load: 8, max_unit_load: 10, grade_scale_id: gsIgcse.id, is_lms_published: true, company_id: mba.id, short_desc: 'Oshwal Academy Mombasa Nyali Campus IGCSE cohort' });

  // 8. Batches / Streams
  const bRecA = c('op.batch', { name: 'Reception — Stream A', code: 'REC-A', course_id: cRec.id, start_date: '2026-09-01', end_date: '2027-07-18', max_students: 25, staff_count: 2, company_id: nur.id });
  const bY5B = c('op.batch', { name: 'Year 5 — Stream B', code: 'Y5-B', course_id: cY5.id, start_date: '2026-09-01', end_date: '2027-07-18', max_students: 26, staff_count: 2, company_id: pri.id });
  const bY10A = c('op.batch', { name: 'Year 10 — Stream East', code: 'Y10-E', course_id: cY10.id, start_date: '2026-09-01', end_date: '2027-07-18', max_students: 24, staff_count: 2, company_id: jnr.id });
  const bY12A = c('op.batch', { name: 'Year 12 AS — Cohort 2026', code: 'Y12-AS1', course_id: cY12AS.id, start_date: '2026-09-01', end_date: '2027-07-18', max_students: 20, staff_count: 2, company_id: snr.id });
  const bMba10 = c('op.batch', { name: 'Mombasa Year 10 — Nyali Alpha', code: 'MBA-Y10A', course_id: cMbaIgcse.id, start_date: '2026-09-01', end_date: '2027-07-18', max_students: 24, staff_count: 2, company_id: mba.id });

  // 9. Subjects (28 IGCSE + 17 A-Level + 4 BTEC)
  const igcseSubjects: [string, string, string, boolean][] = [
    ['English Language (IGCSE)', 'IG-ENG', 'compulsory', false],
    ['Mathematics (IGCSE)', 'IG-MTH', 'compulsory', false],
    ['French (IGCSE)', 'IG-FRE', 'elective', false],
    ['German (IGCSE)', 'IG-GER', 'elective', false],
    ['Swahili (IGCSE)', 'IG-SWA', 'elective', false],
    ['Hindi (IGCSE)', 'IG-HIN', 'elective', false],
    ['Gujarati (IGCSE)', 'IG-GUJ', 'elective', false],
    ['Physics (IGCSE)', 'IG-PHY', 'elective', true],
    ['Chemistry (IGCSE)', 'IG-CHM', 'elective', true],
    ['Biology (IGCSE)', 'IG-BIO', 'elective', true],
    ['Computer Science (IGCSE)', 'IG-CSC', 'elective', false],
    ['ICT (IGCSE)', 'IG-ICT', 'elective', true],
    ['Additional Mathematics (IGCSE)', 'IG-AMTH', 'elective', false],
    ['Business Studies (IGCSE)', 'IG-BUS', 'elective', false],
    ['Economics (IGCSE)', 'IG-ECO', 'elective', false],
    ['Accounts (IGCSE)', 'IG-ACC', 'elective', false],
    ['Geography (IGCSE)', 'IG-GEO', 'elective', false],
    ['History (IGCSE)', 'IG-HIS', 'elective', false],
    ['Global Perspectives (IGCSE)', 'IG-GP', 'elective', true],
    ['Psychology (IGCSE)', 'IG-PSY', 'elective', false],
    ['Art & Design (IGCSE)', 'IG-ART', 'elective', true],
    ['Music (IGCSE)', 'IG-MUS', 'elective', true],
    ['Drama (IGCSE)', 'IG-DRM', 'elective', true],
    ['Physical Education (IGCSE)', 'IG-PE', 'elective', true],
    ['Food and Nutrition (IGCSE)', 'IG-FN', 'elective', true],
    ['Environmental Management (IGCSE)', 'IG-ENV', 'elective', false],
    ['Literature in English (IGCSE)', 'IG-LIT', 'elective', false],
    ['Human Biology (IGCSE)', 'IG-HBIO', 'elective', false],
  ];
  const subRecords = igcseSubjects.map(([name, code, st, cw]) =>
    c('op.subject', { name, code, subject_type: st, type: cw ? 'both' : 'theory', has_coursework: cw, exam_board: 'CAIE', course_id: cY10.id, department_id: dSci.id, company_id: jnr.id }),
  );
  const aLevelSubjects: [string, string, string][] = [
    ['Mathematics (Edexcel IAL)', 'IAL-MTH', 'Edexcel'], ['Physics (Edexcel IAL)', 'IAL-PHY', 'Edexcel'],
    ['Chemistry (Edexcel IAL)', 'IAL-CHM', 'Edexcel'], ['Biology (Edexcel IAL)', 'IAL-BIO', 'Edexcel'],
    ['Economics (Edexcel IAL)', 'IAL-ECO', 'Edexcel'], ['Business (Edexcel IAL)', 'IAL-BUS', 'Edexcel'],
    ['Accounting (Edexcel IAL)', 'IAL-ACC', 'Edexcel'], ['Computer Science (CAIE AL)', 'AL-CSC', 'CAIE'],
    ['Law (CAIE AL)', 'AL-LAW', 'CAIE'], ['Psychology (CAIE AL)', 'AL-PSY', 'CAIE'],
  ];
  const alRecords = aLevelSubjects.map(([name, code, board]) =>
    c('op.subject', { name, code, subject_type: 'elective', exam_board: board, course_id: cY12AS.id, department_id: dSci.id, company_id: snr.id }),
  );
  ['BTEC Level 3 — Art & Design', 'BTEC Level 3 — Enterprise & Entrepreneurship', 'BTEC Level 3 — Hospitality', 'BTEC Level 3 — Sport'].forEach((name, i) =>
    c('op.subject', { name, code: `BTEC3-0${i + 1}`, subject_type: 'compulsory', exam_board: 'BTEC', has_coursework: true, course_id: cY12Btec.id, department_id: dBtec.id, company_id: snr.id }),
  );
  store.write('op.course', cY10.id, { subject_ids: subRecords.map((s) => s.id) }, 1, false);
  store.write('op.course', cY12AS.id, { subject_ids: alRecords.map((s) => s.id) }, 1, false);

  // 10. LMS Course Content Modules & Enrollments
  const cm1 = c('op.course.module', {
    name: 'IGCSE Physics — Mechanics & Kinematics Pack',
    course_id: cY10.id,
    sequence: 10,
    module_category: 'document',
    source_type: 'local_file',
    completion_time: 1.0,
    is_published: true,
    website_published: true,
    company_id: jnr.id,
  });
  const cm2 = c('op.course.module', {
    name: 'Edexcel IAL Pure Mathematics P1 Revision Video',
    course_id: cY12AS.id,
    sequence: 10,
    module_category: 'video',
    video_type: 'url',
    video_url: 'https://www.youtube.com/watch?v=sampleMathP1',
    completion_time: 1.5,
    is_published: true,
    website_published: true,
    company_id: snr.id,
  });
  const cm3 = c('op.course.module', {
    name: 'IGCSE Physics — Wave Optics & Electromagnetic Spectrum',
    course_id: cY10.id,
    sequence: 20,
    module_category: 'video',
    video_type: 'url',
    video_url: 'https://www.youtube.com/watch?v=sampleOptics',
    completion_time: 1.0,
    is_published: true,
    website_published: true,
    company_id: jnr.id,
  });
  const cm4 = c('op.course.module', {
    name: 'BTEC Level 3 Enterprise — Pitch Deck Template',
    course_id: cY12Btec.id,
    sequence: 10,
    module_category: 'document',
    source_type: 'local_file',
    completion_time: 2.0,
    is_published: true,
    website_published: true,
    company_id: snr.id,
  });
  c('op.lms.module', { name: 'IGCSE Physics — Mechanics & Kinematics Pack', course_id: cY10.id, sequence: 10, content_type: 'document', duration_mins: 45, company_id: jnr.id });
  c('op.lms.module', { name: 'Edexcel IAL Pure Mathematics P1 Revision Video', course_id: cY12AS.id, sequence: 10, content_type: 'video', duration_mins: 55, company_id: snr.id });

  // Update total_modules and total_enrollment on courses
  store.write('op.course', cY10.id, { total_modules: 2, total_enrollment: 1, online_course_created: true, online_course: true, state: 'open' }, 1, false);
  store.write('op.course', cY12AS.id, { total_modules: 1, total_enrollment: 1, online_course_created: true, online_course: true, state: 'open' }, 1, false);

  // Seed sample learner enrollment
  const enr1 = c('op.course.enrollment', {
    course_id: cY10.id,
    user_id: 1,
    enrollment_date: '2026-09-02 08:30:00',
    state: 'in_progress',
    progress: 50,
    company_id: jnr.id,
  });
  c('op.course.enrollment.line', {
    enrollment_id: enr1.id,
    module_id: cm1.id,
    is_completed: true,
    completion_date: '2026-09-03 10:15:00',
    company_id: jnr.id,
  });
  c('op.course.enrollment.line', {
    enrollment_id: enr1.id,
    module_id: cm3.id,
    is_completed: false,
    company_id: jnr.id,
  });

  // 11. Classrooms & Campus Facilities
  const cr1 = c('op.classroom', { name: 'Junior High Smart Room 104', code: 'JNR-104', capacity: 26, course_id: cY10.id, batch_id: bY10A.id, company_id: jnr.id });
  const cr2 = c('op.classroom', { name: 'Senior High Lecture Hall A', code: 'SNR-LHA', capacity: 32, course_id: cY12AS.id, batch_id: bY12A.id, company_id: snr.id });
  const ftLab = c('op.facility.type', { name: 'Science & ICT Laboratory', code: 'LAB', company_id: oerb.id });
  const ftSport = c('op.facility.type', { name: 'Sports & Swimming Complex', code: 'SPRT', company_id: oerb.id });
  const ftMed = c('op.facility.type', { name: 'Campus Infirmary & IED Clinic', code: 'INF', company_id: oerb.id });
  const fac1 = c('op.campus.facility', { name: 'Nyali 14-Acre Lecture Theatre & Science Block', code: 'OAM-LT', facility_type_id: ftLab.id, capacity: 180, company_id: mba.id });
  c('op.campus.facility', { name: 'Primary Batting Cage, Gym & Swimming Pool', code: 'OAN-PRI-POOL', facility_type_id: ftSport.id, capacity: 60, company_id: pri.id });
  c('op.campus.facility', { name: 'Nursery IED OT/PT & Nursing Suite', code: 'OAN-NUR-IED', facility_type_id: ftMed.id, capacity: 15, company_id: nur.id });

  // 12. HR Departments, Employees & Faculty (with Child Protection Police Clearance)
  const hrDepAcad = c('hr.department', { name: 'Teaching Faculty (180 OAN + Mombasa)', total_employees: 240, company_id: oerb.id });
  const hrDepClin = c('hr.department', { name: 'IED Clinical & Nursing', total_employees: 18, company_id: nur.id });
  const emp1 = c('hr.employee', { name: 'Mrs. Sujata Yanamandra', job_title: 'Head of Junior High', department_id: hrDepAcad.id, work_email: 'juniorhigh@oshwalacademy.sc.ke', employee_type: 'admin', gender: 'f', police_clearance_no: 'DCI-PCC-2026-8811', police_clearance_expiry: '2027-06-30', dbs_verified: true, company_id: jnr.id });
  const emp2 = c('hr.employee', { name: 'Dr. Kamau Njoroge', job_title: 'Senior Physics & IAL Lecturer', department_id: hrDepAcad.id, work_email: 'faculty@oshwalacademy.sc.ke', employee_type: 'faculty', gender: 'm', police_clearance_no: 'DCI-PCC-2026-4410', police_clearance_expiry: '2026-12-15', dbs_verified: true, company_id: jnr.id });
  const emp3 = c('hr.employee', { name: 'Ms. Wanjiku Mwangi', job_title: 'IED Occupational Therapist', department_id: hrDepClin.id, work_email: 'ied.ot@oshwalacademy.sc.ke', employee_type: 'support', gender: 'f', police_clearance_no: 'DCI-PCC-2026-5509', police_clearance_expiry: '2027-04-01', dbs_verified: true, company_id: nur.id });

  const facKamau = c('op.faculty', { first_name: 'Dr. Kamau', last_name: 'Njoroge', email: 'faculty@oshwalacademy.sc.ke', phone: '+254 722 551 200', gender: 'm', main_department_id: dSci.id, emp_id: emp2.id, faculty_subject_ids: [subRecords[7].id, alRecords[1].id], police_clearance_no: 'DCI-PCC-2026-4410', police_clearance_expiry: '2026-12-15', company_id: jnr.id });
  const facAmina = c('op.faculty', { first_name: 'Ms. Amina', last_name: 'Hassan', email: 'amina.hassan@oshwalacademy.sc.ke', phone: '+254 733 440 112', gender: 'f', main_department_id: dHum.id, faculty_subject_ids: [subRecords[0].id, subRecords[2].id, subRecords[4].id], police_clearance_no: 'DCI-PCC-2026-7732', police_clearance_expiry: '2027-08-20', company_id: mba.id });

  // 13. Parents, Students & Contacts
  const relParent = c('op.parent.relationship', { name: 'Parent / Guardian', code: 'PRN', company_id: oerb.id });
  const partnerParent = c('res.partner', { name: 'Mr. Rajesh Shah', is_parent: true, email: 'parent@oshwalacademy.sc.ke', phone: '+254 722 810 400', city: 'Nairobi', company_id: jnr.id });
  const parentRajesh = c('op.parent', { name: 'Mr. Rajesh Shah', relationship_id: relParent.id, email: 'parent@oshwalacademy.sc.ke', mobile: '+254 722 810 400', partner_id: partnerParent.id, company_id: jnr.id });

  const partnerStu1 = c('res.partner', { name: 'Aarav R. Shah', is_student: true, email: 'student@oshwalacademy.sc.ke', phone: '+254 722 810 401', street: '2nd Parklands Avenue', city: 'Nairobi', company_id: jnr.id });
  const stu1 = c('op.student', { gr_no: 'OAN/2026/0001', title: 'Mr.', first_name: 'Aarav', middle_name: 'R.', last_name: 'Shah', email: 'student@oshwalacademy.sc.ke', phone: '+254 722 810 401', gender: 'm', birth_date: '2011-04-14', blood_group: 'O+', course_id: cY10.id, batch_id: bY10A.id, program_id: pIgcse.id, citizenship: 'kenyan', nationality: 1, street: '2nd Parklands Avenue', city: 'Nairobi', partner_id: partnerStu1.id, parent_ids: [parentRajesh.id], barcode: 'OAN-0001', pin: '1001', company_id: jnr.id });
  const stu2 = c('op.student', { gr_no: 'OAN/2026/0002', title: 'Miss', first_name: 'Zara', last_name: 'Patel', email: 'zara.patel@oshwalacademy.sc.ke', phone: '+254 734 221 900', gender: 'f', birth_date: '2009-09-22', blood_group: 'A+', course_id: cY12AS.id, batch_id: bY12A.id, program_id: pALevel.id, citizenship: 'non_kenyan', nationality: 2, pupils_pass_no: 'KE-PP-2026-9041', pupils_pass_expiry: '2026-12-20', city: 'Nairobi', company_id: snr.id });
  const stu3 = c('op.student', { gr_no: 'OAM/2026/0003', title: 'Mr.', first_name: 'Neel', last_name: 'Doshi', email: 'neel.doshi@oshwalacademy.sc.ke', phone: '+254 722 310 555', gender: 'm', birth_date: '2011-07-09', blood_group: 'B+', course_id: cMbaIgcse.id, batch_id: bMba10.id, program_id: pIgcse.id, citizenship: 'kenyan', nationality: 1, city: 'Mombasa', company_id: mba.id });
  const stu4 = c('op.student', { gr_no: 'OAN/2026/0004', title: 'Miss', first_name: 'Diya', last_name: 'Mehta', email: 'diya.mehta@oshwalacademy.sc.ke', phone: '+254 725 400 310', gender: 'f', birth_date: '2016-02-11', blood_group: 'AB+', course_id: cY5.id, batch_id: bY5B.id, program_id: pPri.id, ied_support: true, citizenship: 'kenyan', nationality: 1, city: 'Nairobi', company_id: pri.id });
  store.write('op.parent', parentRajesh.id, { student_ids: [stu1.id] }, 1, false);

  // 14. Users (5 Role Perspectives + Admin)
  const uAdmin = c('res.users', { name: 'OERB System Administrator', login: 'admin', role: 'admin', company_id: oerb.id, company_ids: [oerb.id, nur.id, pri.id, jnr.id, snr.id, mba.id], is_demo: true });
  const uFac = c('res.users', { name: 'Dr. Kamau Njoroge', login: 'faculty@oshwalacademy.sc.ke', role: 'faculty', faculty_id: facKamau.id, employee_id: emp2.id, company_id: jnr.id, company_ids: [jnr.id, snr.id], is_demo: true });
  const uBack = c('res.users', { name: 'Mrs. Sujata Yanamandra (Backoffice)', login: 'backoffice@oshwalacademy.sc.ke', role: 'backoffice', employee_id: emp1.id, company_id: oerb.id, company_ids: [oerb.id, nur.id, pri.id, jnr.id, snr.id, mba.id], is_demo: true });
  const uStu = c('res.users', { name: 'Aarav R. Shah', login: 'student@oshwalacademy.sc.ke', role: 'student', student_id: stu1.id, company_id: jnr.id, company_ids: [jnr.id], is_demo: true });
  const uPar = c('res.users', { name: 'Mr. Rajesh Shah', login: 'parent@oshwalacademy.sc.ke', role: 'parent', parent_id: parentRajesh.id, student_id: stu1.id, company_id: jnr.id, company_ids: [jnr.id], is_demo: true });
  store.write('op.student', stu1.id, { user_id: uStu.id }, 1, false);
  store.write('op.parent', parentRajesh.id, { user_id: uPar.id }, 1, false);
  store.write('op.faculty', facKamau.id, { user_id: uFac.id }, 1, false);

  // 15. Admissions (Registers, Applications, Stages, Tags, Templates)
  const stageDefs: [string, string, boolean][] = [
    ['Draft', 'draft', false],
    ['Online Admission', 'online', false],
    ['Submitted', 'submit', false],
    ['Confirmed', 'confirm', false],
    ['Pending', 'pending', false],
    ['Sent for Signature', 'sent', false],
    ['Signature Confirmed', 'sign_confirmed', false],
    ['Admission Confirm', 'admission', false],
    ['Done', 'done', false],
    ['Rejected', 'reject', true],
    ['Cancelled', 'cancel', true],
  ];
  const stages = stageDefs.map(([n, st, fld], idx) =>
    c('admission.stage', { name: n, sequence: idx + 1, fold: fld, state: st, view_boolean: true, company_id: oerb.id }),
  );
  const stgMap = Object.fromEntries(stages.map((s) => [s.state, s.id]));

  c('admission.tag', { name: 'Sibling Priority', color: 2, company_id: oerb.id });
  c('admission.tag', { name: 'Feeder Campus Transfer', color: 4, company_id: oerb.id });
  c('admission.tag', { name: "Pupil's Pass Required", color: 1, company_id: oerb.id });
  c('op.admission.customtemplate', { name: 'OERB Standard Admission Application Form (Sep 2026)', program_base_template: false, company_id: oerb.id, admission_webpage: '<p>OERB 7-step intake: Inquiry, Form, Parent/Head Interview, Assessment, Offer, Fee & Pupil Pass, Stream Allocation.</p>' });

  const regJnr = c('op.admission.register', { name: '2026–2027 Junior High Year 10 IGCSE Intake', academic_years_id: ay.id, course_id: cY10.id, academic_term_id: t1.id, start_date: '2026-01-10', end_date: '2026-08-31', fees: 345000, registration_fees: true, caution_money: 25000, minimum_age_criteria: 14, state: 'application', company_id: jnr.id });
  const regSnr = c('op.admission.register', { name: '2026–2027 Senior High AS-Level & BTEC Intake', academic_years_id: ay.id, course_id: cY12AS.id, academic_term_id: t1.id, start_date: '2026-02-01', end_date: '2026-08-31', fees: 410000, registration_fees: true, caution_money: 25000, minimum_age_criteria: 16, state: 'application', company_id: snr.id });
  const regMba = c('op.admission.register', { name: '2026–2027 Mombasa Rolling Intake (Nyali)', academic_years_id: ay.id, course_id: cMbaIgcse.id, academic_term_id: t1.id, start_date: '2026-01-01', end_date: '2027-06-30', fees: 295000, registration_fees: false, caution_money: 20000, minimum_age_criteria: 2, state: 'application', company_id: mba.id });

  c('op.admission.fees.line', { register_id: regJnr.id, course_id: cY10.id, fees: 345000, course_fees_product_id: 'Year 10 Term Tuition Fee', registration_fees: true, register_product_id: 'Junior High Admission Registration Fee', company_id: jnr.id });
  c('op.admission.fees.line', { register_id: regSnr.id, course_id: cY12AS.id, fees: 410000, course_fees_product_id: 'Year 12 AS-Level Tuition Fee', registration_fees: true, register_product_id: 'Senior High Admission Registration Fee', company_id: snr.id });
  c('op.admission.fees.line', { register_id: regMba.id, course_id: cMbaIgcse.id, fees: 295000, course_fees_product_id: 'Mombasa IGCSE Tuition Fee', registration_fees: false, register_product_id: 'Mombasa Registration Fee', company_id: mba.id });

  c('op.admission', { register_id: regJnr.id, title: 'Mr.', first_name: 'Kian', last_name: 'Kotecha', name: 'Mr. Kian Kotecha', email: 'kian.kotecha@example.com', phone: '+254 722 901 111', course_id: cY10.id, batch_id: bY10A.id, fees: 345000, fees_term_id: ftTermly.id, birth_date: '2011-08-19', citizenship: 'kenyan', prev_institute_id: 'OAN Primary', state: 'confirm', stage_id: stgMap['confirm'], assessment_score: 88, company_id: jnr.id });
  c('op.admission', { register_id: regJnr.id, title: 'Miss', first_name: 'Riya', last_name: 'Shah', name: 'Miss Riya Shah', email: 'riya.shah@example.com', phone: '+254 722 444 900', course_id: cY10.id, batch_id: bY10A.id, fees: 345000, fees_term_id: ftTermly.id, birth_date: '2011-02-15', citizenship: 'kenyan', prev_institute_id: 'OAN Primary', state: 'draft', stage_id: stgMap['draft'], company_id: jnr.id });
  c('op.admission', { register_id: regJnr.id, title: 'Mr.', first_name: 'Aarav', middle_name: 'R.', last_name: 'Shah', name: 'Mr. Aarav R. Shah', email: 'student@oshwalacademy.sc.ke', phone: '+254 722 810 401', course_id: cY10.id, batch_id: bY10A.id, fees: 345000, fees_term_id: ftTermly.id, birth_date: '2011-04-14', citizenship: 'kenyan', prev_institute_id: 'OAN Primary', student_id: stu1.id, is_student: true, state: 'done', stage_id: stgMap['done'], company_id: jnr.id });
  c('op.admission', { register_id: regSnr.id, title: 'Miss', first_name: 'Maya', last_name: 'Vora', name: 'Miss Maya Vora', email: 'maya.vora@example.com', phone: '+254 733 551 090', course_id: cY12AS.id, batch_id: bY12A.id, fees: 410000, fees_term_id: ftTermly.id, birth_date: '2009-11-04', citizenship: 'non_kenyan', pupils_pass_no: 'PENDING-KE-2026', prev_institute_id: 'Braeburn School', prev_result: '7 IGCSE Credits (incl. Eng A, Math A*)', state: 'confirm', stage_id: stgMap['confirm'], company_id: snr.id });
  c('op.admission', { register_id: regMba.id, title: 'Mr.', first_name: 'Rohan', last_name: 'Bhatt', name: 'Mr. Rohan Bhatt', email: 'rohan.bhatt@example.com', phone: '+254 712 440 811', course_id: cMbaIgcse.id, batch_id: bMba10.id, fees: 295000, fees_term_id: ftTermly.id, birth_date: '2011-05-30', citizenship: 'kenyan', state: 'submit', stage_id: stgMap['submit'], company_id: mba.id });

  // 16. Subject Registrations, IED Clinical Logs, Health & Fees Plans
  c('op.subject.registration', {
    student_id: stu1.id, course_id: cY10.id, batch_id: bY10A.id,
    compulsory_subject_ids: [subRecords[0].id, subRecords[1].id, subRecords[2].id],
    elective_subject_ids: [subRecords[7].id, subRecords[8].id, subRecords[9].id, subRecords[10].id, subRecords[13].id, subRecords[14].id],
    state: 'approved', company_id: jnr.id,
  });
  c('op.ied.log', { student_id: stu4.id, specialist_role: 'ot', pathway: 'asdan_computing', progress_note: 'ASDAN Computing Vocational Taster — fine motor & keyboarding milestone achieved.', company_id: pri.id });
  c('op.health', { student_id: stu1.id, height_cm: 168, weight_kg: 58, vaccination_status: 'complete', blood_group: 'O+', clinic_notes: 'All routine immunizations verified at Parklands Infirmary.', company_id: jnr.id });

  const fp1 = c('op.fees.plan', { student_id: stu1.id, course_id: cY10.id, fees_term_id: ftTermly.id, total_amount: 345000, state: 'active', company_id: jnr.id });
  c('op.fees.plan.line', { fees_plan_id: fp1.id, product_name: 'Term 1 Tuition (Sep–Dec 2026)', amount: 305000, due_date: '2026-09-05', state: 'invoiced', company_id: jnr.id });
  c('op.fees.plan.line', { fees_plan_id: fp1.id, product_name: 'Refundable Caution Money Deposit', amount: 25000, due_date: '2026-09-05', state: 'paid', company_id: jnr.id });
  c('op.fees.plan.line', { fees_plan_id: fp1.id, product_name: 'Paid Specialist Club (Robotics / LAMDA 15:20–16:20)', amount: 15000, due_date: '2026-09-15', state: 'draft', company_id: jnr.id });

  // 17. Timetable Sessions, Lesson Planning & Attendance
  const ses1 = c('op.session', { name: 'Dr. Kamau Njoroge: Physics (IGCSE) 08:00–08:45', faculty_id: facKamau.id, course_id: cY10.id, batch_id: bY10A.id, subject_id: subRecords[7].id, classroom_id: cr1.id, timing_slot: '08:00-08:45', state: 'confirm', company_id: jnr.id });
  c('op.session', { name: 'Dr. Kamau Njoroge: Edexcel IAL Physics 09:30–10:30', faculty_id: facKamau.id, course_id: cY12AS.id, batch_id: bY12A.id, subject_id: alRecords[1].id, classroom_id: cr2.id, timing_slot: '09:30-10:30', state: 'confirm', company_id: snr.id });
  c('op.lesson', { name: 'IGCSE Physics — Kinematics & Velocity-Time Graphs', course_id: cY10.id, batch_id: bY10A.id, subject_id: subRecords[7].id, faculty_id: facKamau.id, lesson_topic: 'Deriving acceleration from velocity-time gradient and distance from area under curve.', company_id: jnr.id });

  const attReg = c('op.attendance.register', { name: 'Year 10 Stream East Morning Roll Call', code: 'OAN-Y10E-REG', course_id: cY10.id, batch_id: bY10A.id, subject_id: subRecords[7].id, auto_create: true, auto_create_type: 'daily', company_id: jnr.id });
  const attSheet = c('op.attendance.sheet', { name: `OAN-Y10E-${new Date().toISOString().slice(0, 10)}`, register_id: attReg.id, session_id: ses1.id, state: 'done', company_id: jnr.id });
  c('op.attendance.line', { attendance_id: attSheet.id, student_id: stu1.id, present: true, remark: 'On time', company_id: jnr.id });
  c('op.attendance.type', { name: 'Present', present: true, company_id: oerb.id });
  c('op.attendance.type', { name: 'Absent Unexcused', absent: true, company_id: oerb.id });
  c('op.attendance.type', { name: 'Late', late: true, company_id: oerb.id });

  // 18. Assignments, Exams, GradeBook, Quizzes, Thesis & OMR
  const asgType1 = c('grading.assignment.type', { name: 'BTEC Level 3 Coursework Unit', code: 'BTEC-CW', weightage: 100, company_id: snr.id });
  const asgType2 = c('grading.assignment.type', { name: 'IGCSE Formative Lab Report', code: 'IG-LAB', weightage: 30, company_id: jnr.id });
  const rub1 = c('op.rubric.template', { name: 'Pearson BTEC Pass / Merit / Distinction Rubric', rubrics_type: 'points', state: 'in_use', company_id: snr.id });
  c('op.rubric.element', { name: 'P1-P4 Core Evidence', rubrics_template_id: rub1.id, point: 40 });
  c('op.rubric.element', { name: 'M1-M3 Analytical Evaluation', rubrics_template_id: rub1.id, point: 30 });
  c('op.rubric.element', { name: 'D1-D2 Strategic Justification', rubrics_template_id: rub1.id, point: 30 });
  c('op.rubric.level', { name: 'Exemplary / Distinction', percentage: 100, sequence: 10, is_active: true });
  c('op.rubric.level', { name: 'Competent / Merit', percentage: 75, sequence: 20, is_active: true });
  c('op.rubric.level', { name: 'Threshold / Pass', percentage: 50, sequence: 30, is_active: true });
  c('op.assign.grade.config', { grade: 'Distinction*', company_id: snr.id });
  c('op.assign.grade.config', { grade: 'Distinction', company_id: snr.id });
  c('op.assign.grade.config', { grade: 'Merit', company_id: snr.id });
  c('op.assign.grade.config', { grade: 'Pass', company_id: snr.id });
  const lateRule = c('late.submission', { name: 'OAN Secondary 24h Grace Rule', company_id: jnr.id });
  c('late.submission.line', { late_submission_id: lateRule.id, no_of_days: 1, penalty_type: 'percentage', penalty: 5 });
  c('late.submission.line', { late_submission_id: lateRule.id, no_of_days: 2, penalty_type: 'percentage', penalty: 10 });
  const asg1 = c('op.assignment', { name: 'IGCSE Physics Pendulum Investigation', sequence: 'ASG-001', course_id: cY10.id, batch_id: bY10A.id, subject_id: subRecords[7].id, faculty_id: facKamau.id, assignment_type: asgType2.id, year_id: ay.id, term_id: t1.id, rubric_template_id: rub1.id, late_submission_id: lateRule.id, allocation_ids: [stu1.id], description: 'Measure oscillation period across 5 string lengths and plot T^2 vs L.', state: 'publish', company_id: jnr.id });
  c('op.assignment.sub.line', { assignment_id: asg1.id, student_id: stu1.id, marks: 91, penalty: 0, obtained_mark: 91, state: 'accept', company_id: jnr.id });

  const exType = c('op.exam.type', { name: 'CAIE / Edexcel Mock & Series', code: 'MOCK-SER', company_id: oerb.id });
  const exRoom = c('op.exam.room', { name: 'Parklands Main Examination Hall', classroom_id: cr1.id, capacity: 120, company_id: jnr.id });
  const exSes = c('op.exam.session', { name: 'May/June 2027 IGCSE & IAL Series', exam_code: 'MJ-2027', exam_type: exType.id, course_id: cY10.id, batch_id: bY10A.id, year_id: ay.id, term_id: t1.id, start_date: '2027-05-10', end_date: '2027-06-18', exam_board: 'CAIE', state: 'held', company_id: jnr.id });
  const ex1 = c('op.exam', { name: 'IGCSE Physics Paper 4 (Extended)', exam_code: '0625/42', session_id: exSes.id, subject_id: subRecords[7].id, faculty_id: facKamau.id, room_id: exRoom.id, total_marks: 100, min_marks: 40, state: 'result_updated', company_id: jnr.id });
  c('op.exam.attendees', { exam_id: ex1.id, student_id: stu1.id, room_id: exRoom.id, marks: 91, grade: '9', status: 'present', company_id: jnr.id });
  c('op.result.template', { name: 'IGCSE 9–1 Series Broadsheet Template', exam_session_id: exSes.id, grade_scale_id: gsIgcse.id, company_id: jnr.id });

  const gb1 = c('gradebook.gradebook', { name: 'GB/OAN/Y10/0001', student_id: stu1.id, course_id: cY10.id, academic_year_id: ay.id, grade_scale_id: gsIgcse.id, percentage: 91, grade: '9', state: 'publish', company_id: jnr.id });
  c('gradebook.line', { gradebook_id: gb1.id, subject_id: subRecords[7].id, term_id: t1.id, assignment_name: 'Pendulum Investigation + Mock', calculated_score: 91, final_grade: '9', company_id: jnr.id });
  c('op.honorroll', { name: 'Principal Honor Roll — Term 1', student_id: stu1.id, course_id: cY10.id, year_id: ay.id, from_per: 80, to_per: 100, percentage: 91, company_id: jnr.id });

  const qCat = c('op.quiz.category', { name: 'IGCSE & Edexcel Topic Quizzes', code: 'QZ-IG', company_id: jnr.id });
  const qBankType = c('op.question.bank.type', { name: 'CAIE Topical Assessments', code: 'CAIE-TOP', company_id: jnr.id });
  const qGradeDist = c('op.answer.grade', { name: 'Distinction', min_score: 80, max_score: 100, remarks: 'Outstanding conceptual mastery', company_id: jnr.id });
  const qGradePass = c('op.answer.grade', { name: 'Pass', min_score: 50, max_score: 79, remarks: 'Satisfactory understanding', company_id: jnr.id });

  const qBank = c('op.question.bank', { name: 'CAIE 0625 Physics Past Papers Bank', bank_type_id: qBankType.id, subject_id: subRecords[7].id, question_count: 140, active: true, company_id: jnr.id });

  const q1 = c('op.quiz', {
    name: 'IGCSE Physics — Forces & Motion Check',
    categ_id: qCat.id,
    course_id: cY10.id,
    subject_id: subRecords[7].id,
    quiz_config: 'normal',
    assigned_to: 'open_for_all',
    total_marks: 20,
    time_config: true,
    time_limit_hr: 0,
    time_limit_minute: 20,
    single_page: false,
    prev_allow: true,
    show_answer: true,
    state: 'open',
    active: true,
    company_id: jnr.id,
  });
  c('op.quiz.line', { quiz_id: q1.id, name: 'What is the SI unit of acceleration?', que_type: 'optional', mark: 5, sequence: 10, answer: 'm/s²', bank_id: qBank.id, grade_true_id: qGradeDist.id, grade_false_id: qGradePass.id, company_id: jnr.id });
  c('op.quiz.line', { quiz_id: q1.id, name: 'State Newton’s Second Law in equation form (F = ma).', que_type: 'blank', mark: 5, sequence: 20, answer: 'F = ma', bank_id: qBank.id, grade_true_id: qGradeDist.id, company_id: jnr.id });
  c('op.quiz.line', { quiz_id: q1.id, name: 'Which of the following are vector quantities? (Select all that apply)', que_type: 'multiple_choice', mark: 10, sequence: 30, answer: 'Velocity, Acceleration, Momentum', bank_id: qBank.id, grade_true_id: qGradeDist.id, company_id: jnr.id });
  c('op.quiz.question', { quiz_id: q1.id, question: 'What is the SI unit of acceleration?', qtype: 'mcq', options: 'm/s | m/s^2 | N/kg | J', correct_answer: 'm/s^2', marks: 5, company_id: jnr.id });

  const qRes1 = c('op.quiz.result', {
    name: 'QR/OAN/2026/0001',
    quiz_id: q1.id,
    student_id: stu1.id,
    user_id: 1,
    categ_id: qCat.id,
    total_marks: 20,
    received_marks: 20,
    score: 100,
    total_question: 3,
    total_correct: 3,
    total_incorrect: 0,
    submit_date: '2026-10-15 10:20:00',
    finish_date: '2026-10-15 10:35:00',
    state: 'done',
    company_id: jnr.id,
  });
  c('op.quiz.result.line', { result_id: qRes1.id, name: 'What is the SI unit of acceleration?', que_type: 'optional', question_mark: 5, mark: 5, answer: 'm/s²', given_answer: 'm/s²', company_id: jnr.id });
  c('op.quiz.result.line', { result_id: qRes1.id, name: 'State Newton’s Second Law in equation form (F = ma).', que_type: 'blank', question_mark: 5, mark: 5, answer: 'F = ma', given_answer: 'F = ma', company_id: jnr.id });
  c('op.quiz.result.line', { result_id: qRes1.id, name: 'Which of the following are vector quantities? (Select all that apply)', que_type: 'multiple_choice', question_mark: 10, mark: 10, answer: 'Velocity, Acceleration, Momentum', given_answer: 'Velocity, Acceleration, Momentum', company_id: jnr.id });

  c('op.thesis.registration', { name: 'Extended Research Essay: Solar Microgrids in Coastal Kenya', student_id: stu2.id, program_id: pALevel.id, research_area: 'Renewable Energy Engineering', supervisor_id: facKamau.id, state: 'in_progress', company_id: snr.id });
  const omrCfg = c('op.answersheet.configuration', { name: 'CAIE Paper 1 Multiple Choice 40-Q Grid', subject_id: subRecords[7].id, question_count: 40, options_count: 4, company_id: jnr.id });
  c('op.omr.exam', { name: 'IGCSE Physics Paper 1 Mock OMR', subject_id: subRecords[7].id, answersheet_config_id: omrCfg.id, scanned_count: 75, state: 'done', company_id: jnr.id });

  // 19. Transportation, Fleet, Library, Digital Library, Events (Paid/Non-Paid Clubs & Sports)
  const bus1 = c('fleet.vehicle', { name: 'OAN Parklands Bus 01 (KDN 402A)', license_plate: 'KDN 402A', model_name: 'Isuzu NQR 33-Seater', seats: 33, company_id: oerb.id });
  const opVeh1 = c('op.vehicle', { name: 'OAN Parklands Bus 01 (KDN 402A)', license_plate: 'KDN 402A', capacity: 33, model_name: 'Isuzu NQR 33-Seater', active: true, company_id: oerb.id });
  const cPlan1 = c('cost.plan', { name: 'Termly Transport Plan (Zone A - Parklands/Westlands)', code: 'TR-ZA-T1', bill: 1, bill_selection: 'months', expires_after: 3, periodicity: 'termly', amount: 18500, company_id: oerb.id });
  const rt1 = c('op.route', { name: 'Westlands – Muthaiga – Parklands Route', vehicle_id: bus1.id, op_vehicle_id: opVeh1.id, cost: 18500, company_id: oerb.id });
  const stop1 = c('op.stop', { sequence: 10, name: 'Sarit Centre Pickup', route_id: rt1.id, estimated_arrival_conf: 6.75, estimated_arrival: '06:45 AM', company_id: oerb.id });
  const rtReg1 = c('op.route.register', { name: 'Term 1 Parklands Transport Register', route_id: rt1.id, plan_id: cPlan1.id, start_date: '2026-09-01', end_date: '2026-12-12', cost: 18500, state: 'gathering', company_id: oerb.id });
  c('op.route.line', { name: 'Morning Pickup — Westlands/Parklands', route_id: rt1.id, route_type: 'pickup', start_time: '06:30', state: 'start', company_id: oerb.id });
  c('op.transportation.agreement', { partner_id: partnerStu1.id, student_id: stu1.id, route_register_id: rtReg1.id, route_id: rt1.id, stop_id: stop1.id, plan_id: cPlan1.id, monthly_fee: 18500, state: 'done', company_id: jnr.id });

  const cardTypeStu = c('op.library.card.type', { name: 'Standard Student Card', code: 'STU-14D', duration: 14, penalty_amt_per_day: 50, allowable_media: 3, max_books: 3, company_id: oerb.id });
  const cardTypeFac = c('op.library.card.type', { name: 'Faculty Research Card', code: 'FAC-30D', duration: 30, penalty_amt_per_day: 0, allowable_media: 10, max_books: 10, company_id: oerb.id });

  const auth1 = c('op.author', { name: 'David Sang', country: 'United Kingdom', bio: 'Author of Cambridge IGCSE and A-Level Physics textbooks.', company_id: oerb.id });
  const auth2 = c('op.author', { name: 'Mike Follows', country: 'United Kingdom', bio: 'Co-author of Cambridge Physics curriculum guides.', company_id: oerb.id });
  const pub1 = c('op.publisher', { name: 'Cambridge University Press', city: 'Cambridge, UK', website: 'https://cambridge.org/education', company_id: oerb.id });
  const pub2 = c('op.publisher', { name: 'Pearson Education', city: 'London, UK', website: 'https://pearson.com', company_id: oerb.id });

  const tagIgcse = c('op.tag', { name: 'IGCSE Core/Extended', color: 1, company_id: oerb.id });
  const tagSci = c('op.tag', { name: 'Natural Sciences', color: 2, company_id: oerb.id });

  const mtBook = c('op.media.type', { name: 'Textbook / Print Book', code: 'BOOK', issued: 1, available: 3, due_media_today: 0, due_media_month: 1, color: 1, total_media: 4, company_id: oerb.id });
  const lCard = c('op.library.card', { number: 'LC/2026/0001', library_card_type_id: cardTypeStu.id, type: 'student', student_id: stu1.id, card_type: 'Standard Student', issue_date: '2026-09-01', active: true, company_id: jnr.id });
  const media1 = c('op.media', {
    name: 'Cambridge IGCSE Physics Coursebook (3rd Ed)',
    media_type_id: mtBook.id,
    isbn: '9781108888073',
    internal_code: 'OAN-LIB-PHY-01',
    edition: '3rd Edition',
    authors: 'David Sang, Mike Follows',
    publishers: 'Cambridge University Press',
    total_units: 2,
    active: true,
    company_id: jnr.id,
  });
  const unit1 = c('op.media.unit', { name: 'IGCSE-PHY-U01', media_id: media1.id, media_type_id: mtBook.id, barcode: 'LIB-OAN-1001', state: 'issue', active: true, company_id: jnr.id });
  const unit2 = c('op.media.unit', { name: 'IGCSE-PHY-U02', media_id: media1.id, media_type_id: mtBook.id, barcode: 'LIB-OAN-1002', state: 'available', active: true, company_id: jnr.id });

  c('op.media.movement', {
    media_id: media1.id,
    media_type_id: mtBook.id,
    media_unit_id: unit1.id,
    library_card_id: lCard.id,
    student_id: stu1.id,
    type: 'student',
    issued_date: '2026-10-01 09:00:00',
    return_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    penalty: 0,
    state: 'issue',
    active: true,
    company_id: jnr.id,
  });

  c('op.media.queue', {
    name: 'QUEUE/2026/0001',
    user_id: 1,
    student_id: stu2.id,
    media_id: media1.id,
    date_from: '2026-11-01',
    date_to: '2026-11-15',
    state: 'request',
    active: true,
    company_id: jnr.id,
  });

  c('op.media.purchase', {
    request_no: 'PR/2026/0001',
    name: 'Advanced Level Physics 7th Edition (Nelkon & Parker)',
    author: 'Michael Nelkon, Philip Parker',
    publisher: 'Heinemann',
    media_type_id: mtBook.id,
    requested_by: facKamau.id,
    request_date: '2026-10-20',
    state: 'draft',
    active: true,
    company_id: snr.id,
  });
  const dlc = c('op.digital.library.category', { name: 'CAIE & Edexcel Past Papers & eBooks', company_id: oerb.id });
  c('op.digital.library.material', { name: 'Pearson Edexcel IAL Mathematics P1–P4 Revision Guide', category_id: dlc.id, material_type: 'ebook', authors: 'Pearson Education', edition: '2026', company_id: snr.id });

  c('event.event', { name: 'Primary Paid Club: Taekwondo & Robotics (15:20–16:20)', event_category: 'club_paid', venue: 'Primary Gym & ICT Lab', ticket_price: 15000, seats_max: 30, stage: 'announced', company_id: pri.id });
  c('event.event', { name: 'Primary Teacher-Led Eco & MSMUN Club (Tue/Thu)', event_category: 'club_free', venue: 'Primary Quadrangle', ticket_price: 0, seats_max: 40, stage: 'announced', company_id: pri.id });
  c('event.event', { name: 'Mombasa Saturday Enrichment: Skating & LAMDA', event_category: 'saturday', venue: 'Nyali 14-Acre Complex', ticket_price: 12000, seats_max: 35, stage: 'announced', company_id: mba.id });
  c('event.event', { name: 'EAMUN & World Scholar’s Cup Regional Qualifier', event_category: 'academic', venue: 'Parklands / Gigiri', ticket_price: 0, seats_max: 60, stage: 'booked', company_id: jnr.id });

  // 20. Finance (KES Invoices + M-Pesa Payment), CRM, Notices, Policies (DMS & E-Sign), Appointments, Helpdesk, AIO & Onboarding
  const inv1 = c('account.move', { move_type: 'out_invoice', partner_id: partnerStu1.id, student_id: stu1.id, fee_category: 'tuition', invoice_date_due: '2026-09-10', line_description: 'Term 1 Tuition Fee — Year 10 IGCSE (OAN Junior High)', amount_total: 305000, amount_residual: 305000, etims_cu_no: 'ETIMS-KE-000101', state: 'posted', payment_state: 'not_paid', company_id: jnr.id, narration: 'Payable within 14 days via M-Pesa Paybill 522522 or Bank Transfer.' });
  c('account.move.line', { move_id: inv1.id, name: 'Term 1 Tuition Fee — Year 10 IGCSE (OAN Junior High)', account_name: '400000 Academic Tuition Revenue', quantity: 1, price_unit: 290000, price_subtotal: 290000, company_id: jnr.id });
  c('account.move.line', { move_id: inv1.id, name: 'IGCSE Science Lab & ICT Resource Levy', account_name: '400200 Laboratory & STEM Levy', quantity: 1, price_unit: 15000, price_subtotal: 15000, company_id: jnr.id });
  const inv2 = c('account.move', { move_type: 'out_invoice', partner_id: partnerStu1.id, student_id: stu1.id, fee_category: 'caution', invoice_date_due: '2026-09-05', line_description: 'Refundable Caution Money Deposit (Withdrawal Policy: 1 Term Written Notice)', amount_total: 25000, amount_residual: 0, etims_cu_no: 'ETIMS-KE-000102', state: 'posted', payment_state: 'paid', company_id: jnr.id, narration: 'Refundable upon written one-term withdrawal notice per OERB policy.' });
  c('account.move.line', { move_id: inv2.id, name: 'Refundable Caution Money Deposit (Withdrawal Policy: 1 Term Notice)', account_name: '210500 Student Caution Deposits', quantity: 1, price_unit: 25000, price_subtotal: 25000, company_id: jnr.id });
  c('payment.transaction', { reference: 'MPE-INIT-01', provider: 'mpesa', phone: '+254722810400', amount: 25000, move_id: inv2.id, student_id: stu1.id, mpesa_receipt: 'SK92OAN77P', result_desc: 'Caution Deposit Settled', state: 'done', company_id: jnr.id });

  c('crm.lead', { name: 'Parent Inquiry — Year 7 Transfer from UK', contact_name: 'Mrs. Priya Shah', email_from: 'priya.shah@example.com', phone: '+254 720 331 990', target_campus: jnr.id, target_course: cY10.id, expected_revenue: 345000, stage: 'qualified', company_id: jnr.id });
  c('op.notice', { name: 'Term 1 Safety Drill Schedule (Fire, Duck-Cover-Hold, Lock-Down)', subject: 'Mandatory Termly Emergency Drills Across All 5 Campuses', target_audience: 'all', high_priority: true, description: '<p>Scheduled safety drills will run across Parklands & Nyali campuses on Friday 10:00 AM.</p>', state: 'published', company_id: oerb.id });
  c('op.circular', { name: 'IGCSE & IAL May/June 2027 Examination Entry Window', circular_type: 'EXM', subject: 'CAIE & Pearson Edexcel Candidate Subject Confirmation', description: '<p>Parents & Year 10/12 learners must confirm subject entries via the Student Portal.</p>', state: 'published', company_id: jnr.id });

  [
    'Admission-Policy-Final-25.2.21.pdf', 'School-Fees-Policy-Oct-2026.pdf', 'Withdrawal-Policy-2020.doc.pdf',
    'Consequences-of-Misdemeanor.pdf', 'Substance-Abuse-Prevention-Policy-2019.pdf', 'Guideline-Information-to-Parents-2023-1.pdf',
    'Media-Consent-Form-Oct-2026.pdf', 'CCTV-Privacy-Policy-Sep-2026.pdf',
  ].forEach((name) => c('dms.file', { name, directory: 'OERB Policies & Compliance', category: 'policy', extension: 'pdf', is_public_policy: true, company_id: oerb.id }));

  const esTpl1 = c('e.sign.template', { name: 'IGCSE 5-Party Private Subject Undertaking', roles_required: 'Student, Parent, HoD, T&L Coordinator, Head of School', policy_code: 'OAN-JNR-PRIV', company_id: jnr.id });
  const esTpl2 = c('e.sign.template', { name: 'OERB Media Consent Form & Liability Waiver (Oct 2026)', roles_required: 'Parent / Guardian', policy_code: 'OERB-MEDIA-26', company_id: oerb.id });
  c('e.sign.request', { template_id: esTpl2.id, signer_name: 'Mr. Rajesh Shah', signer_email: 'parent@oshwalacademy.sc.ke', student_id: stu1.id, signers_summary: 'Parent / Guardian', state: 'signed', company_id: jnr.id });

  c('calendar.online.appointment', { name: 'Parent & Head of School Admissions Interview', code: 'OERB-INT-01', duration_hours: 0.5, staff_in_charge: 'Mrs. Sujata Yanamandra', share_url: '/booking', company_id: jnr.id });
  c('calendar.online.appointment', { name: 'University & Careers Guidance Session (Senior High)', code: 'OAN-CAR-02', duration_hours: 0.75, staff_in_charge: 'Careers Guidance Officer', share_url: '/booking', company_id: snr.id });
  c('calendar.event', { name: 'OERB Academic Council & Campus Heads Review', location: 'First Parklands Ave Boardroom', course_ids: [cY10.id, cY12AS.id], company_id: oerb.id });

  c('op.activity.announcement', { name: 'UK & North America University Fair — Parklands Senior High', opportunity_type: 'university', start_date: '2026-10-15', end_date: '2026-10-16', description: '45% of OAN graduates transition to top global universities; meet Russell Group, Ivy League & Canadian admissions officers.', company_id: snr.id });
  c('op.alumni.group', { name: 'Oshwal Academy Alumni — Class of 2020–2025', graduation_year: 2025, member_count: 640, company_id: oerb.id });
  c('hr.job', { name: 'IGCSE & A-Level Computer Science Teacher (CAIE)', department_id: hrDepAcad.id, no_of_recruitment: 2, is_published: true, company_id: jnr.id });
  c('hr.job', { name: 'Early Years (EYFS / IEYC) Lead Educator', department_id: hrDepAcad.id, no_of_recruitment: 3, is_published: true, company_id: nur.id });
  c('helpdesk.ticket', { issue_name: 'Interactive Whiteboard Calibration — Room JNR-104', partner_id: partnerParent.id, email: 'juniorhigh@oshwalacademy.sc.ke', team_name: 'hardware', priority: 2, help_description: 'Projector & smartboard touch calibration requested before Period 3.', stage: 'in_progress', company_id: jnr.id });

  c('aio.agent.library', { name: 'Oshwal Admissions & Curriculum Concierge AI', agent_type: 'single', module_names: 'Admissions, SIS, E-Sign', instructions: 'Assist prospective Nairobi & Mombasa families with EYFS, CIE, IGCSE 9-subject rules, AS-Level 5-credit prerequisites, BTEC Level 3, and M-Pesa fee payments.', company_id: oerb.id });
  c('aio.agent.library', { name: 'IGCSE & IAL Revision Tutor Agent', agent_type: 'single', module_names: 'LMS, Quiz, Grade Book', instructions: 'Generate formative CAIE/Edexcel past-paper questions and rubric feedback.', company_id: jnr.id });

  // 21. 11 Scheduled Intervals (ir.cron)
  [
    ['Queue Job Worker Heartbeat', 'queue_job.worker_heartbeat', '*/1 * * * *', 'root', 'queue.job', 'Processes async OMR grading, AI course/quiz generation, and bulk fee invoices.'],
    ['Morning Transport Pickup Manifest', 'transport.morning_pickup_manifest', '15 6 * * 1-5', 'root.transport', 'op.route.line', 'Initializes 06:15 AM Parklands & Nyali bus trip manifests.'],
    ['Auto-Create Daily Attendance Sheets', 'attendance.auto_create_daily_sheets', '0 7 * * 1-6', 'root.attendance', 'op.attendance.register', 'Generates daily roll-call sheets (Mon–Fri + Mombasa Sat).'],
    ['Morning Absentee WhatsApp/SMS Alert', 'attendance.morning_absentee_whatsapp', '30 8 * * 1-5', 'root.comms', 'op.attendance.sheet', 'Alerts parents of Absent Unexcused learners after morning roll call.'],
    ['Nursery & IED 15:00 Dismissal Interval', 'intervals.nursery_ied_dismissal', '0 15 * * 1-5', 'root.timetable', 'op.session', 'Closes 08:00–15:00 Nursery & IED sessions and triggers early bus manifest.'],
    ['Primary Paid Clubs Transition (15:20–16:20)', 'intervals.primary_clubs_transition', '20 15 * * 1-5', 'root.timetable', 'event.event', 'Opens attendance for Paid Specialist Clubs & Tue/Thu Teacher-Led Clubs.'],
    ['Junior & Senior High 16:30 Dismissal', 'intervals.secondary_dismissal', '30 16 * * 1-5', 'root.timetable', 'op.session', 'Closes secondary academic/remedial blocks and dispatches late buses.'],
    ['Library Overdue Fine Calculator', 'library.overdue_fine_calculator', '15 0 * * *', 'root.library', 'op.media.movement', 'Accrues daily KES 25 overdue fines on unreturned books.'],
    ['Assignment Late Penalty Calculator', 'assignments.late_penalty_engine', '30 0 * * *', 'root.grading', 'op.assignment.sub.line', 'Applies configured grace-hour and daily percentage penalties.'],
    ["Pupil's Pass & Good Conduct Audit", 'compliance.pupils_pass_and_dbs_audit', '0 6 * * *', 'root.compliance', 'op.student', "Audits non-citizen Pupil's Pass and staff Certificate of Good Conduct expiries."],
    ['Termly Tuition & Transport Billing', 'finance.termly_and_monthly_billing', '0 5 1 * *', 'root.finance', 'op.fees.plan', 'Generates monthly transport & termly tuition fee invoices.'],
  ].forEach(([name, method, cron, channel, model, description]) =>
    c('ir.cron', { name, method, cron, channel, model, description, active: true, last_result: 'Ready (Scheduled)' }),
  );

  // 22. 14 Onboarding Setup Steps
  ['Academic Year', 'Academic Term', 'Programs & Pathways', 'Courses / Year Groups', 'Batches / Streams', 'Subjects (28 IGCSE / 17 AL)', 'Class Rooms & Labs', 'Grade Scales (9-1 / A*-E / BTEC)', 'Paid & Non-Paid Clubs', 'OERB 7-Step Admissions', 'Fees Plans & M-Pesa', 'Child Protection & Good Conduct', 'Pupil Pass Compliance', 'Parent & Student Portal'].forEach((name, i) =>
    c('oe.onboarding.steps', { sequence: i + 1, name, target_model: 'op.course', description: `Configure ${name} for Oshwal Academy Nairobi & Mombasa`, completed: i < 10 }),
  );

  // 23. Executive KPIs (OERB Multi-Campus)
  [
    ['Total Campuses (OERB)', 'res.company', 'count', '', 6, '#1e3f7c', 'Building2', 'executive'],
    ['Active Learners Enrolled', 'op.student', 'count', '', 3200, '#ec1c24', 'GraduationCap', 'executive'],
    ['Pending Admissions', 'op.admission', 'count', '', 50, '#f4cb00', 'FileUser', 'admissions'],
    ['Fee Invoiced (KES)', 'account.move', 'sum', 'amount_total', 1000000, '#1e3f7c', 'Landmark', 'finance'],
    ['Active Cron Intervals', 'ir.cron', 'count', '', 11, '#0F766E', 'Clock', 'compliance'],
  ].forEach(([name, model, measure, field, target, color, icon, dashboard], i) =>
    c('dashboard.kpi', { sequence: (i + 1) * 10, name, model, measure, field, target, color, icon, dashboard }),
  );

  // 24. Seeded Sample Activity & Discuss
  c('mail.activity', { summary: "Verify Maya Vora Pupil's Pass before Senior High enrollment", res_model: 'op.admission', res_id: 2, activity_type: 'upload', user_id: uBack.id });
  c('mail.activity', { summary: 'Confirm CAIE IGCSE Paper 4 invigilation roster', res_model: 'op.exam', res_id: 1, activity_type: 'todo', user_id: uFac.id });
  c('discuss.channel', { name: '#oerb-campus-heads', channel_type: 'channel', description: 'Nairobi (Nursery/Primary/Junior/Senior) & Mombasa Leadership Sync', members_count: 14 });
  c('discuss.channel', { name: '#parklands-transport-ops', channel_type: 'channel', description: 'Daily 06:15 AM & afternoon dismissal bus manifests', members_count: 19 });
  c('website.page', { name: 'Oshwal Academy Academics & Curriculum', url: '/academics', page_type: 'page', is_published: true, summary: 'EYFS, IEYC, CIE Primary, IGCSE, AS/A-Level, BTEC Level 3' });
  c('im_livechat.channel', { name: 'Oshwal Admissions Live Desk', chatbot_name: 'OERB Admissions Bot', url_regex: '/courses-offered', happy_pct: 94 });
  c('survey.survey', { title: 'Annual OERB Parent Satisfaction & Pastoral Care Survey', survey_type: 'survey', questions_count: 12, participants_count: 248 });
  c('whatsapp.campaign', { name: 'Term 1 Fee Reminder & M-Pesa Express Link', template_name: 'OERB Term Fee Reminder', message_preview: 'Dear Parent, Term 1 fee statements are live on your /my portal with 1-tap M-Pesa Express.', sent_count: 312, state: 'running' });
  c('mailing.mailing', { subject: 'Welcome to 2026–2027 Academic Year — Oshwal Academy Nairobi & Mombasa', sent_count: 680, open_rate: 78.4, state: 'done' });
  c('marketing.campaign', { name: '2027 Open Day & IGCSE/Sixth Form Showcase', participants_count: 145, state: 'running' });

  // 25. Additional Configuration, OBE, Shop Products, Journals & Metadata Records
  c('op.activity.type', { name: 'MSMUN / EAMUN Debate', code: 'MUN', company_id: oerb.id });
  const ltype1 = c('student.leave.type', { name: 'Medical / Infirmary Leave', code: 'MED', requires_medical_note: true, company_id: oerb.id });
  c('student.leave.type', { name: 'Family Emergency Leave', code: 'FAM', requires_medical_note: false, company_id: oerb.id });
  c('student.leave.request', {
    student_id: stu1.id,
    leave_type: ltype1.id,
    start_date: '2026-11-20T08:00:00Z',
    end_date: '2026-11-21T16:00:00Z',
    duration: 2.0,
    company_id: snr.id,
    description: 'Medical leave with doctor certificate.',
    state: 'draft',
  });
  c('op.achievement.type', { name: 'Cambridge Outstanding Learner Award', code: 'CAIE-OLA', company_id: oerb.id });
  const conv1 = c('op.convocation.ceremony', { name: 'Class of 2026 Graduation & Sixth Form Valedictory', academic_year_id: ay.id, date: '2027-07-10', venue: 'Parklands Senior High Auditorium', state: 'confirmed', company_id: snr.id });
  c('op.convocation.registration', { ceremony_id: conv1.id, student_id: stu2.id, gown_size: 'M', guest_count: 3, state: 'registered', company_id: snr.id });
  const skCat = c('op.skill.category', { name: 'STEM & Research Competencies', code: 'STEM', company_id: oerb.id });
  c('op.skill', { name: 'Experimental Physics & Data Analysis', category_id: skCat.id, company_id: jnr.id });
  c('op.skill.level', { name: 'Exceeding / Distinction', level_progress: 92, company_id: oerb.id });
  const po1 = c('program.outcome', { name: 'PO1 — Scientific Inquiry & Critical Reasoning', code: 'PO-01', program_id: pIgcse.id, target_attainment: 80, company_id: jnr.id });
  c('course.outcome', { name: 'CO1 — Apply Newton Laws & Kinematics to Physical Systems', code: 'CO-PHY-1', course_id: cY10.id, program_outcome_id: po1.id, company_id: jnr.id });
  c('course.credit', { course_id: cY10.id, min_credit: 18, max_credit: 24, academic_year_id: ay.id, company_id: jnr.id });
  c('school.offences', { name: 'Substance Abuse / Prohibited Contraband Zero-Tolerance', code: 'POL-SUB', severity: 'critical', company_id: oerb.id });
  const gcat = c('grievance.category', { name: 'Pastoral & Safeguarding', sla_days: 1, company_id: oerb.id });
  const gteam = c('grievance.team', { name: 'Senior Pastoral SLT Team', company_id: oerb.id });
  c('grievance', {
    name: 'GRV001',
    subject: 'Parent inquiry regarding Year 10 locker allocation',
    grievance_for: 'student',
    student_id: stu1.id,
    grievance_category_id: gcat.id,
    grievance_team_id: gteam.id,
    course_id: cY10.id,
    state: 'submitted',
    company_id: jnr.id,
    description: 'Student requested assistance with science wing locker assignment.',
  });
  c('op.scholarship.type', { name: 'OERB Academic Excellence Merit Bursary', code: 'MERIT', max_percentage: 50, company_id: oerb.id });
  c('op.course.tag', { name: 'Cambridge Certified', color: 2, company_id: oerb.id });
  c('op.course.category', { name: 'IGCSE & International A-Level', description: 'CAIE & Pearson Edexcel syllabi', company_id: oerb.id });
  c('op.grade.table', { name: 'CAIE Extended Tier 9 (90–100%)', grade_scale_id: gsIgcse.id, percentage_from: 90, percentage_to: 100, letter_grade: '9', gpa: 9, company_id: jnr.id });
  c('op.grade.template', { name: 'OAN Secondary Termly Report Template', course_id: cY10.id, grade_scale_id: gsIgcse.id, company_id: jnr.id });
  c('assignment.stage', { name: 'Published', sequence: 20, state: 'published', company_id: oerb.id });
  c('op.answer.grade', { name: 'Distinction Band (80–100%)', min_score: 80, max_score: 100, remarks: 'Mastery demonstrated', company_id: oerb.id });
  c('op.question.bank.type', { name: 'CAIE Past Paper MCQ', code: 'CAIE-MCQ', company_id: oerb.id });
  const tr1 = store.all('op.thesis.registration')[0];
  if (tr1) {
    c('op.thesis.progress', { name: 'Literature Review & Solar Load Audit Completed', registration_id: tr1.id, student_id: stu2.id, milestones_completed: 'Completed 18 peer-reviewed coastal microgrid papers.', company_id: snr.id });
    c('op.thesis.extension', { registration_id: tr1.id, student_id: stu2.id, requested_deadline: '2027-06-15', extension_days: 14, reason: 'Awaiting field irradiation data from Nyali campus roof array.', company_id: snr.id });
  }
  c('op.thesis.committee', { name: 'Dr. Kamau Njoroge (Supervisor)', faculty_id: facKamau.id, role: 'supervisor', email: 'faculty@oshwalacademy.sc.ke', company_id: snr.id });
  c('op.thesis.evaluation.template', { name: 'Extended Essay Assessment Criteria (A–E)', max_marks: 100, criteria_summary: 'Focus & Method 20% | Knowledge 20% | Critical Thinking 40% | Presentation 20%', company_id: snr.id });
  c('queue.job.function', { name: 'omr.grade_sheets', allow_commit: true });
  c('op.cost.plan', { name: 'OERB Termly Zone-A Transport Plan', periodicity: 'termly', amount: 48000, company_id: oerb.id });
  c('op.author', { name: 'David Sang', country: 'United Kingdom', company_id: oerb.id });
  c('op.publisher', { name: 'Cambridge University Press', city: 'Cambridge', website: 'https://www.cambridge.org', company_id: oerb.id });
  c('op.library.card.type', { name: 'Student Standard (5 Books / 14 Days)', max_books: 5, duration_days: 14, company_id: oerb.id });
  c('op.media.queue', { media_id: media1.id, student_id: stu2.id, company_id: snr.id });
  c('op.media.purchase', { name: 'Pearson Edexcel IAL Further Mathematics FM1/FM2', author: 'Greg Attwood', isbn: '9781292244655', requested_by: facKamau.id, company_id: snr.id });
  c('op.digital.library.enrollment', { material_id: store.all('op.digital.library.material')[0]?.id ?? 1, student_id: stu1.id, company_id: jnr.id });
  c('event.registration', { event_id: store.all('event.event')[0]?.id ?? 1, partner_id: partnerStu1.id, name: 'Aarav R. Shah', email: 'student@oshwalacademy.sc.ke', state: 'done', company_id: pri.id });
  c('op.placement.cell', { name: 'OAN Sixth Form UCAS & CommonApp Advisory', coordinator_id: facKamau.id, email: 'careers@oshwalacademy.sc.ke', company_id: snr.id });
  c('training.season', { name: '2026–2027 University Placement Cycle', academic_year_id: ay.id, start_date: '2026-09-15', end_date: '2027-05-30', company_id: snr.id });
  c('fleet.vehicle.log.contract', { name: 'KDN 402A PSV Comprehensive Insurance', vehicle_id: bus1.id, amount: 185000, expiration_date: '2027-08-31', company_id: oerb.id });
  c('fleet.vehicle.log.services', { name: 'KDN 402A Quarterly Safety & Brake Inspection', vehicle_id: bus1.id, amount: 34500, company_id: oerb.id });
  const jt1 = c('op.job.type', { name: 'Student Internship / Attachment', code: 'INT', company_id: oerb.id });
  c('job.post.stage', { name: 'Recruiting', sequence: 10, company_id: oerb.id });
  const jp1 = c('op.job.post', { name: 'Alumni Mentorship: Software Engineering Intern (Safaricom)', employment_type: 'internship', salary_from: 35000, salary_upto: 50000, description: 'Open to OAN/OAM graduates studying CS or Engineering.', company_id: oerb.id });
  c('op.job.applicant', { name: 'Zara Patel — UCAS Software Mentorship', job_post_id: jp1.id, student_id: stu2.id, email: 'zara.patel@oshwalacademy.sc.ke', state: 'shortlisted', company_id: snr.id });
  c('op.notice.group', { name: 'All OERB Campuses (Nairobi + Mombasa)', company_id: oerb.id });
  c('op.circular.type', { name: 'Examination Series Notice', code: 'EXM', company_id: oerb.id });
  c('aio.workflow', { name: '7-Step Admission Triage & E-Sign Pipeline', trigger_model: 'op.admission', steps_summary: 'Validate age & credits -> Schedule Interview -> Trigger E-Sign Policy', company_id: oerb.id });
  c('aio.model', { name: 'Gemini 2.5 Flash (OERB Concierge)', provider: 'gemini', model_id: 'gemini-2.5-flash', company_id: oerb.id });
  c('aio.tool', { name: 'Verify IGCSE Prerequisites', technical_name: 'check_alevel_prerequisites', description: 'Checks 5 IGCSE A*-C credits including English & Maths.', company_id: snr.id });
  c('helpdesk.team', { name: 'Smart Classroom & ERP IT Desk', leader_id: uAdmin.id, alias_email: 'ithelp@oshwalacademy.sc.ke', company_id: oerb.id });
  c('issue.type', { name: 'Smartboard / AV Hardware', code: 'AV-HW', company_id: oerb.id });
  c('helpdesk.stage', { name: 'In Progress', sequence: 20, company_id: oerb.id });
  c('hr.leave.type', { name: 'Annual Paid Leave', code: 'PAID', max_days: 21, company_id: oerb.id });
  c('hr.expense.category', { name: 'Science Lab Consumables', code: 'LAB-EXP', company_id: oerb.id });
  c('multi.approval.type', { name: 'Fee Waiver / Private IGCSE Undertaking', minimum_approvers: 2, apply_for_model: 'op.subject.registration', company_id: oerb.id });
  c('product.template', { name: 'Oshwal Academy Blazer (Deep Navy Crest)', category: 'uniform', list_price: 5800, qty_available: 120, is_published: true, description: 'Official embroidered blazer in Deep Navy (#1e3f7c).', company_id: oerb.id });
  c('product.template', { name: 'Oshwal House PE Kit (Crimson / Gold)', category: 'uniform', list_price: 2600, qty_available: 200, is_published: true, description: 'Breathable sports kit for Athletics, Cricket & Swimming.', company_id: oerb.id });
  c('product.template', { name: 'Cambridge IGCSE Complete Physics Bundle + Past Papers', category: 'books', list_price: 4950, qty_available: 65, is_published: true, description: 'Required textbook & workbook for Year 10–11.', company_id: jnr.id });
  c('product.template', { name: 'Paid Specialist Club Term Pass (Robotics / Taekwondo / Piano)', category: 'fee', list_price: 15000, qty_available: 40, is_published: true, description: '15:20–16:20 afternoon specialist enrichment pass.', company_id: pri.id });
  c('account.journal', { name: 'M-Pesa Paybill 522522 (KCB OERB)', code: 'MPESA', type: 'bank', default_account: '101400 M-Pesa Clearing', company_id: oerb.id });
  c('account.journal', { name: 'Student Tuition & Caution Invoices', code: 'TUIT', type: 'sale', default_account: '400000 Academic Tuition Revenue', company_id: oerb.id });
  c('account.journal', { name: 'Vendor & CapEx Bills', code: 'BILL', type: 'purchase', default_account: '200100 Accounts Payable', company_id: oerb.id });
  c('account.journal', { name: 'Petty Cash & Infirmary Imprest', code: 'CASH', type: 'cash', default_account: '101100 Campus Petty Cash', company_id: oerb.id });
  c('account.account', { code: '101400', name: 'M-Pesa Clearing & Settlement', account_type: 'asset_cash', company_id: oerb.id });
  c('account.account', { code: '200100', name: 'Accounts Payable', account_type: 'liability_payable', company_id: oerb.id });
  c('account.account', { code: '400000', name: 'Academic Tuition Revenue', account_type: 'income', company_id: oerb.id });
  c('account.tax', { name: 'Exempt Educational Service (0%)', type_tax_use: 'sale', amount: 0, company_id: oerb.id });
  c('account.payment.term', { name: 'Termly 30-Day Due Date', company_id: oerb.id });
  const assetCat = c('account.asset.category', { name: 'Laboratory & Science Equipment', company_id: oerb.id });
  const asset1 = c('account.asset.asset', { name: 'Vernier Wireless Physics Sensors Set (Junior High Lab 2)', code: 'AST-LAB-01', category_id: assetCat.id, value: 95000, value_residual: 95000, state: 'open', company_id: jnr.id });
  const reason1 = c('asset.request.reason', { name: 'Replace legacy kinematics dataloggers ahead of May IGCSE practicals.', company_id: oerb.id });
  c('account.asset.request', { name: 'AST-REQ-2026-001', request_for: 'faculty', faculty_id: facKamau.id, requested_asset: 'Vernier Wireless Physics Sensors Set', asset_id: asset1.id, request_reason_id: reason1.id, state: 'approved', company_id: jnr.id });
  const pay1 = c('account.payment', { name: 'PAY/2026/0001', payment_type: 'inbound', partner_type: 'customer', partner_id: partnerParent.id, student_id: stu1.id, amount: 320000, journal_id: 1, state: 'paid', company_id: jnr.id });
  c('account.batch.payment', { name: 'BATCH/2026/0001', batch_type: 'customer', journal_id: 1, payment_ids: [pay1.id], state: 'sent', company_id: oerb.id });
  c('dms.directory', { name: 'OERB Policies & Statutory Compliance', category: 'Governance & Safeguarding', is_root_directory: true, company_id: oerb.id });
  c('spreadsheet.spreadsheet', { name: 'OERB 2026–2027 Term 1 Tuition & Caution Reconciliation.xlsx', category: 'Finance & Bursar', company_id: oerb.id });
  c('mail.message', { res_model: 'discuss.channel', res_id: 1, body: 'Welcome to the 2026–2027 Academic Year across all Parklands & Nyali campuses!', author_id: uAdmin.id, message_type: 'comment' });
  c('mail.message', { res_model: 'account.move', res_id: 1, body: 'Term 1 Fee Statement INV/2026/0001 ready for parent portal & M-Pesa Express.', author_id: uAdmin.id, message_type: 'notification' });
  c('mail.message', { res_model: 'op.admission', res_id: 2, body: "Pupil's Pass clearance requested for Maya Vora (Senior High AS-Level).", author_id: uBack.id, message_type: 'comment' });
  c('mail.message', { res_model: 'op.exam', res_id: 1, body: 'CAIE IGCSE Physics Paper 4 (0625/42) invigilation roster confirmed.', author_id: uFac.id, message_type: 'comment' });

  // 26. Rich Dashboard Records & 65 Apps Catalog (appended at end to preserve existing IDs)
  c('op.media.type', { name: 'Reference Books', code: 'REF', company_id: oerb.id });
  c('op.media.type', { name: 'Digital Disc', code: 'DISC', company_id: oerb.id });
  c('op.media.type', { name: 'Magazine & Periodicals', code: 'MAG', company_id: oerb.id });
  c('op.media.type', { name: 'Research Papers & Past Exam Packs', code: 'RES', company_id: oerb.id });

  c('op.attendance.register', { name: 'Year 12 AS Physics & Labs Weekly Roll Call', code: 'OAN-Y12-REG', course_id: cY12AS.id, batch_id: bY12A.id, subject_id: alRecords[1].id, auto_create: true, auto_create_type: 'weekly', company_id: snr.id });
  c('op.attendance.register', { name: 'Primary Paid Specialist Clubs Monthly Check', code: 'OAN-CLUB-REG', course_id: cY5.id, batch_id: bY5B.id, auto_create: true, auto_create_type: 'monthly', company_id: pri.id });

  c('op.route.register', { name: 'Term 1 Lavington – Kileleshwa Route Register', route_id: rt1.id, start_date: '2026-09-01', end_date: '2026-12-12', cost: 18500, state: 'confirm', company_id: jnr.id });
  c('op.route.register', { name: 'Term 2 Early Planning Transport Draft', route_id: rt1.id, start_date: '2027-01-08', end_date: '2027-04-05', cost: 19000, state: 'draft', company_id: oerb.id });

  c('crm.lead', { name: 'Sibling Enrollment — Reception EYFS 2027', contact_name: 'Mrs. Meera Shah', email_from: 'meera.shah@example.com', phone: '+254 721 662 400', target_campus: nur.id, target_course: cRec.id, expected_revenue: 245000, priority: 3, stage: 'new', company_id: nur.id });
  c('crm.lead', { name: 'Sixth Form BTEC Enterprise Campus Tour', contact_name: 'Mr. David Otieno', email_from: 'd.otieno@example.com', phone: '+254 733 118 220', target_campus: snr.id, target_course: cY12Btec.id, expected_revenue: 410000, priority: 2, stage: 'proposition', company_id: snr.id });
  c('crm.lead', { name: 'Mombasa Nyali IGCSE Relocating Family', contact_name: 'Dr. Hassan Ali', email_from: 'hassan.ali@example.com', phone: '+254 722 908 310', target_campus: mba.id, target_course: cMbaIgcse.id, expected_revenue: 295000, priority: 3, stage: 'won', company_id: mba.id });

  c('helpdesk.team', { name: 'Admissions & Parent Portal Support', leader_id: uBack.id, alias_email: 'admissionsdesk@oshwalacademy.sc.ke', company_id: oerb.id });
  c('op.lms.module', { name: 'IGCSE Physics — Wave Optics & Electromagnetic Spectrum', course_id: cY10.id, sequence: 20, content_type: 'video', duration_mins: 40, company_id: jnr.id });
  c('op.lms.module', { name: 'BTEC Level 3 Enterprise — Pitch Deck Template', course_id: cY12Btec.id, sequence: 10, content_type: 'assignment', duration_mins: 60, company_id: snr.id });

  const team1 = c('crm.team', { name: 'OERB School Shop & Uniform Desk', user_id: uAdmin.id, invoiced_target: 2500000, alias_name: 'shop', company_id: oerb.id });
  c('crm.team', { name: 'Admissions & Parent Enrollment Desk', user_id: uBack.id, invoiced_target: 18000000, alias_name: 'admissions', company_id: oerb.id });
  c('product.product', { name: 'Oshwal Academy Blazer (Size M - Deep Navy)', default_code: 'UNI-BLZ-M', barcode: '616110004101', product_tmpl_id: 1, lst_price: 5800, standard_price: 3900, qty_available: 120 });
  c('product.product', { name: 'Oshwal House PE Kit (Size M - Crimson)', default_code: 'UNI-PE-M', barcode: '616110004102', product_tmpl_id: 2, lst_price: 2600, standard_price: 1650, qty_available: 200 });
  c('product.pricelist', { name: 'Standard KES Parent Shop Pricelist', code: 'KES-STD', selectable: true, company_id: oerb.id });
  c('sale.order.template', { name: 'New Student Complete Uniform & Textbook Pack', number_of_days: 30, note: 'Standard uniform & stationery starter bundle.', company_id: oerb.id });
  c('quotation.document', { name: 'OERB Official Quotation Header', document_type: 'header', company_id: oerb.id });
  c('delivery.carrier', { name: 'Campus Uniform Store Pickup (Free)', delivery_type: 'fixed', fixed_price: 0, company_id: oerb.id });
  c('crm.tag', { name: 'Sibling Priority', color: 2 });
  c('crm.tag', { name: 'International Relocation', color: 4 });
  c('product.attribute', { name: 'Uniform Size', display_type: 'pills', create_variant: 'always' });
  c('product.combo', { name: 'IGCSE Science Lab Coat + Goggles Combo', base_price: 3200, company_id: jnr.id });
  c('product.tag', { name: 'Compulsory Uniform', color: 1 });
  c('product.supplierinfo', { partner_id: partnerParent.id, product_tmpl_id: 1, min_qty: 50, price: 3900, delay: 7, company_id: oerb.id });
  const wh1 = c('stock.warehouse', { name: 'OERB Parklands Central Store', code: 'OERB-WH', partner_id: partnerParent.id, company_id: oerb.id });
  c('stock.picking.type', { name: 'Receipts', code: 'incoming', sequence_code: 'IN', warehouse_id: wh1.id, count_picking_ready: 2, company_id: oerb.id });
  c('stock.picking.type', { name: 'Delivery Orders', code: 'outgoing', sequence_code: 'OUT', warehouse_id: wh1.id, count_picking_ready: 3, company_id: oerb.id });
  c('stock.picking.type', { name: 'Internal Campus Transfers', code: 'internal', sequence_code: 'INT', warehouse_id: wh1.id, count_picking_ready: 1, company_id: oerb.id });
  c('stock.lot', { name: 'LOT-CAIE-PHY-2026', product_id: 3, ref: 'BATCH-2026-A', product_qty: 65, standard_price: 3500, company_id: jnr.id });
  c('stock.scrap', { name: 'SP/2026/0001', product_id: 2, scrap_qty: 2, origin: 'Damaged PE Kit sample', state: 'done', company_id: oerb.id });
  c('stock.warehouse.orderpoint', { name: 'OP/0001', product_id: 1, warehouse_id: wh1.id, product_min_qty: 20, product_max_qty: 150, qty_to_order: 30, company_id: oerb.id });
  c('crm.lost.reason', { name: 'Relocated Outside Nairobi / Mombasa', leads_count: 2 });
  c('crm.iap.lead.mining.request', { name: 'LM/2026/001', search_type: 'companies', lead_count: 15, team_id: team1.id, user_id: uAdmin.id, state: 'done', company_id: oerb.id });

  const blog1 = c('blog.blog', { name: 'Oshwal Academy Campus Chronicles & Achievements', subtitle: 'IGCSE, A-Level, Sports & Community Highlights', company_id: oerb.id });
  c('blog.post', { name: 'Oshwal Senior High Achieves 98% A*–B in Edexcel IAL Sciences', subtitle: 'Celebrating our Class of 2026 STEM Scholars', blog_id: blog1.id, author_id: partnerParent.id, is_published: true, visits: 340, content: '<p>Outstanding results across Physics, Chemistry, and Further Mathematics.</p>', company_id: snr.id });
  const forum1 = c('forum.forum', { name: 'OERB Parent & Student Academic Q&A Forum', mode: 'questions', company_id: oerb.id });
  c('forum.post', { name: 'How to select between CAIE A-Level and Pearson BTEC Level 3?', forum_id: forum1.id, create_uid: uAdmin.id, views: 88, vote_count: 14, state: 'active', content: '<p>Compare coursework vs exam-assessed pathways for Sixth Form.</p>', company_id: snr.id });
  c('website.technical.page', { name: 'Admissions Online Application Portal', view_key: 'openeducat_admission.portal_apply', website_url: '/admissions/apply' });
  c('product.public.category', { name: 'Official School Uniforms & Sportswear', sequence: 10, company_id: oerb.id });
  c('product.ribbon', { name: 'Compulsory Term 1', bg_color: '#1565C0', text_color: '#FFFFFF', position: 'left' });
  c('website.visitor', { name: 'Visitor #1042 (Nairobi)', partner_id: partnerParent.id, visit_count: 5, page_count: 18, is_connected: true, company_id: oerb.id });
  c('mailing.list', { name: 'All OERB Parents & Guardians Newsletter', contact_count: 1420, is_public: true, company_id: oerb.id });
  c('mailing.contact', { name: 'Mr. Rajesh Shah', email: 'parent@oshwalacademy.sc.ke', company_name: 'Oshwal Parent Community', company_id: jnr.id });
  c('link.tracker', { title: 'Term 1 2026 Prospectus Download', url: 'https://oshwalacademy.sc.ke/prospectus-2026.pdf', short_url: 'https://oerb.ke/p26', count: 215, company_id: oerb.id });
  const wb1 = c('whatsapp.business', { name: 'OERB Official WhatsApp Concierge (+254 725 529 622)', phone_number: '+254725529622', phone_number_id: 'WABA-OERB-01', state: 'verified', company_id: oerb.id });
  c('whatsapp.contact', { name: 'Mr. Rajesh Shah', mobile: '+254722810400', partner_id: partnerParent.id, company_id: jnr.id });
  c('whatsapp.template', { name: 'term_fee_mpesa_reminder', category: 'utility', lang_code: 'en', body: 'Dear {{1}}, Term 1 fee balance for {{2}} is due. Pay via M-Pesa Paybill 522522.', state: 'approved', company_id: oerb.id });
  c('mail.canned.response', { source: ':admissions', substitution: 'Welcome to Oshwal Academy! Admissions for the 2026–2027 academic year are open across all 5 campuses.', description: 'Admissions greeting' });
  c('chatbot.script', { title: 'OERB Admissions & Fee Support Bot', active: true, operator_partner_id: partnerParent.id, company_id: oerb.id });
  const surv1 = c('survey.survey', { title: 'Term 1 Parent Satisfaction & Transport Feedback Survey', survey_type: 'survey', questions_count: 8, answer_count: 42, participants_count: 42, state: 'open', company_id: oerb.id });
  const sq1 = c('survey.question', { title: 'How satisfied are you with the Cambridge IGCSE & Lab facilities?', survey_id: surv1.id, question_type: 'simple_choice', company_id: oerb.id });
  c('survey.question.answer', { value: 'Very Satisfied (5/5)', question_id: sq1.id, is_correct: true, answer_score: 10, company_id: oerb.id });
  c('survey.user_input', { survey_id: surv1.id, partner_id: partnerParent.id, email: 'parent@oshwalacademy.sc.ke', scoring_percentage: 95, state: 'done', company_id: oerb.id });
  c('res.partner.title', { name: 'Doctor', shortcut: 'Dr.' });
  c('res.partner.industry', { name: 'Education & Academic Institutions', full_name: 'Education / International Schools' });
  c('res.country.state', { name: 'Nairobi County', code: 'NBO', country_id: 1 });
  c('res.country.state', { name: 'Mombasa County', code: 'MBA', country_id: 1 });
  const bnk1 = c('res.bank', { name: 'KCB Bank Kenya Limited', bic: 'KCBLKENX', city: 'Nairobi', country: 1 });
  c('res.partner.bank', { acc_number: '110022334455', partner_id: partnerParent.id, bank_id: bnk1.id, company_id: oerb.id });
  c('board.board', { name: 'Head of School Executive Board', layout: '2-1', company_id: oerb.id });
  c('spreadsheet.dashboard.group', { name: 'Academic & Bursar KPIs', sequence: 10, company_id: oerb.id });
  c('dashboard_pro.main_dashboard', { name: 'OERB Multi-Campus Live Telemetry', theme: 'OpenEduCat Executive', is_active: true, company_id: oerb.id });
  c('calendar.appointment.resource', { name: 'Parklands Admissions Interview Room 1', capacity: 4, company_id: oerb.id });
  const dmsCat1 = c('dms.category', { name: 'Statutory & Safeguarding Policies', company_id: oerb.id });
  c('dms.tag', { name: 'Mandatory Sign-Off', category_id: dmsCat1.id, color: 2, company_id: oerb.id });
  c('dms.storage', { name: 'OERB Encrypted Cloud Filestore', save_type: 'database', company_id: oerb.id });
  c('dms.access.group', { name: 'SLT & Campus Registrars', perm_read: true, perm_create: true, perm_write: true, company_id: oerb.id });
  c('e.sign.items', { name: 'Parent Digital Signature', item_type: 'signature', required: true });
  c('e.sign.item.role', { name: 'Parent / Legal Guardian', color: 2 });
  const aioAg1 = c('aio.agent', { name: 'OERB Admissions & Cambridge IGCSE Advisor', library_id: 1, model_id: 1, system_prompt: 'Assist parents with IGCSE 9-subject rules and AS-Level 5-credit prerequisites.', state: 'active', company_id: oerb.id });
  const aioSess1 = c('aio.playground.session', { name: 'IGCSE Subject Selection Advisory #01', user_id: uAdmin.id, agent_id: aioAg1.id, total_tokens: 640, message_count: 4, state: 'active', company_id: jnr.id });
  c('aio.playground.message', { session_id: aioSess1.id, role: 'user', content: 'Can a private candidate sit IGCSE Physics 0625?', tokens_used: 45, company_id: jnr.id });
  c('aio.model.provider', { name: 'Google Gemini Enterprise', code: 'gemini', api_base_url: 'https://generativelanguage.googleapis.com', is_active: true, company_id: oerb.id });
  c('aio.guardrail', { name: 'Child Protection & Student PII Redaction Guard', policy_type: 'child_safety', enforcement: 'block', company_id: oerb.id });
  c('aio.collection', { name: 'OERB 2026–2027 Handbooks & Syllabi Vector Store', vector_dimension: 1536, documents_count: 28, company_id: oerb.id });
  c('rating.rating', { res_name: 'TKT/2026/0001', partner_id: partnerParent.id, rating: 5, rating_text: 'top', feedback: 'Fast resolution on Parent Portal login.', company_id: oerb.id });
  c('helpdesk.tag', { name: 'Smartboard / AV', color: 3 });
  void wb1;

  seedInstalledModules(c);
  void jt1;
}
