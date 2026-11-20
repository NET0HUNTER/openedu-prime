import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/index.js';
import { seedOshwal } from '../server/seeds/oshwal.js';
import { seedDefault } from '../server/seeds/default.js';
import { ALL_MODELS, APPS, MODEL_MAP, PORTAL_CARDS } from '../shared/meta/index.js';
import { store } from '../server/store.js';

describe('OpenEduCat Generic School ERP + Oshwal Academy Seed Pack', () => {
  const app = createApp();

  beforeEach(() => {
    seedOshwal();
  }, 30000);

  it('exposes OpenAPI 3.1 spec covering all 53 apps and models', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(Object.keys(res.body.paths).length).toBeGreaterThan(100);
    const docs = await request(app).get('/api/docs');
    expect(docs.status).toBe(200);
    expect(docs.text).toContain('OpenAPI 3.1 Specification');
  });

  it('enforces role-based app counts (Admin 53, Faculty 35, Backoffice 25, Student/Parent Portal)', async () => {
    const admin = await request(app).post('/api/v1/auth/demo-login').send({ role: 'admin' });
    const adminMenus = await request(app).get('/api/v1/meta/menus').set('X-User-Id', String(admin.body.user.id));
    expect(adminMenus.body.apps.length).toBe(53);

    const faculty = await request(app).post('/api/v1/auth/demo-login').send({ role: 'faculty' });
    const facMenus = await request(app).get('/api/v1/meta/menus').set('X-User-Id', String(faculty.body.user.id));
    expect(facMenus.body.apps.length).toBe(35);

    const back = await request(app).post('/api/v1/auth/demo-login').send({ role: 'backoffice' });
    const backMenus = await request(app).get('/api/v1/meta/menus').set('X-User-Id', String(back.body.user.id));
    expect(backMenus.body.apps.length).toBe(25);

    const stu = await request(app).post('/api/v1/auth/demo-login').send({ role: 'student' });
    expect(stu.body.redirect).toBe('/my');
    const portal = await request(app).get('/api/v1/portal/my').set('X-User-Id', String(stu.body.user.id));
    expect(portal.body.cards.length).toBe(35);
  });

  it('seeds Oshwal Nairobi (4 campuses) + Mombasa + OERB with Oshwal color tokens and switches cleanly to default seed', async () => {
    const sess = await request(app).get('/api/v1/meta/session');
    expect(sess.body.seedProfile).toBe('oshwal');
    expect(sess.body.companies.length).toBe(6);
    expect(sess.body.companies[0].theme_primary).toBe('#1e3f7c');
    expect(sess.body.companies[0].theme_accent).toBe('#ec1c24');
    expect(sess.body.companies[0].theme_gold).toBe('#f4cb00');

    // Switch to default OpenEduCat seed (proving zero school hardcoding)
    const sw = await request(app).post('/api/v1/admin/switch-seed').send({ profile: 'default' });
    expect(sw.status).toBe(200);
    const defSess = await request(app).get('/api/v1/meta/session');
    expect(defSess.body.seedProfile).toBe('default');
    expect(defSess.body.companies[0].theme_primary).toBe('#1565C0');
    seedOshwal();
  }, 20000);

  it("enforces Pupil's Pass gate on non-Kenyan enrollment and auto-creates student + invoice on Kenyan enrollment", async () => {
    const maya = store.all('op.admission').find((a) => a.citizenship === 'non_kenyan')!;
    store.write('op.admission', maya.id, { pupils_pass_no: '' });
    const failEnroll = await request(app)
      .post('/api/v1/dataset/call_kw/op.admission/enroll_student')
      .send({ id: maya.id });
    expect(failEnroll.status).toBe(400);
    expect(failEnroll.body.error).toContain("Pupil's Pass");

    const kian = store.all('op.admission').find((a) => a.citizenship === 'kenyan' && a.state !== 'done')!;
    const okEnroll = await request(app)
      .post('/api/v1/dataset/call_kw/op.admission/enroll_student')
      .send({ id: kian.id });
    expect(okEnroll.status).toBe(200);
    expect(okEnroll.body.record.state).toBe('done');
    expect(okEnroll.body.record.student_id).toBeTruthy();
  });

  it('executes full OpenEduCat 19 Admissions parity flow: register lifecycle & application stage progression', async () => {
    // 1. Admission Register lifecycle: draft -> confirm -> application -> admission -> done -> reset_to_draft
    const ay = store.all('op.academic.year')[0];
    const course = store.all('op.course')[0];
    const newReg = store.create('op.admission.register', {
      name: '2026 Testing Intake', academic_years_id: ay.id, course_id: course.id,
      start_date: '2026-11-20', state: 'draft', admission_base: 'course',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/confirm_register').send({ id: newReg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/start_application').send({ id: newReg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('application');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/start_admission').send({ id: newReg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('admission');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/close_register').send({ id: newReg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/action_reset_to_draft').send({ id: newReg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 2. Application full stage progression: draft -> submit -> confirm -> sent -> sign_confirmed -> admission -> enroll (done)
    const newApp = store.create('op.admission', {
      register_id: newReg.id, title: 'Mr.', first_name: 'Liam', last_name: 'Smith',
      email: 'liam.smith@example.com', phone: '+1 555-9988', course_id: course.id,
      birth_date: '2008-05-12', citizenship: 'kenyan', state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/submit_form').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submit');
    const submitStage = store.all('admission.stage').find((s) => s.state === 'submit');
    if (submitStage) expect(res.body.record.stage_id).toBe(submitStage.id);

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/confirm_in_progress').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/send_for_signature').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('sent');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/confirm_admin_signature').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('sign_confirmed');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/admission_confirm').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('admission');

    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/enroll_student').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');
    expect(res.body.record.student_id).toBeTruthy();

    const stuId = Number(res.body.record.student_id);
    res = await request(app).post('/api/v1/dataset/call_kw/op.admission/open_student').send({ id: newApp.id });
    expect(res.status).toBe(200);
    expect(res.body.redirect?.model).toBe('op.student');
    expect(res.body.redirect?.id).toBe(stuId);

    // 3. Course Change Request flow
    const stu = store.all('op.student')[0];
    const c2 = store.all('op.course')[1] || course;
    const reqChange = store.create('op.student.course.change.req', {
      student_id: stu.id, from_course_id: course.id, to_course_id: c2.id,
      reason_to_change: 'Academic pathway realignment', state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.student.course.change.req/action_course_change_fees').send({ id: reqChange.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('course_change_fees');

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.course.change.req/action_approve').send({ id: reqChange.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approve');
  });

  it('executes full OpenEduCat 19 Students parity flows: smart buttons, leave workflow, progression and withdrawal', async () => {
    // 1. Verify op.student 14 smart buttons metadata
    const studentDef = MODEL_MAP['op.student'];
    expect(studentDef).toBeDefined();
    expect(studentDef.smart.length).toBe(14);
    const smartLabels = studentDef.smart.map((s) => s.string);
    expect(smartLabels).toEqual(expect.arrayContaining([
      'Admission', 'Invoiced', 'Fees Plan Details', 'Assignment', 'Attendance',
      'Activity', 'GradeBook', 'Placements', 'Job Post', 'Discipline', 'Media',
      'Health', 'Parents', 'Leads',
    ]));

    const stu = store.all('op.student')[0];
    expect(stu).toBeDefined();

    // 2. Student Leave Request lifecycle: draft -> confirm -> validate -> approve -> cancel -> draft
    const leaveType = store.all('student.leave.type')[0];
    expect(leaveType).toBeDefined();
    const leaveReq = store.create('student.leave.request', {
      student_id: stu.id,
      leave_type: leaveType.id,
      start_date: '2026-11-20T08:00:00Z',
      end_date: '2026-11-22T16:00:00Z',
      duration: 3.0,
      description: 'Attending National Science Congress',
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/student.leave.request/action_confirm').send({ id: leaveReq.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/student.leave.request/action_validate').send({ id: leaveReq.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('validate');

    res = await request(app).post('/api/v1/dataset/call_kw/student.leave.request/action_approve').send({ id: leaveReq.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approve');

    res = await request(app).post('/api/v1/dataset/call_kw/student.leave.request/action_cancel').send({ id: leaveReq.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('cancel');

    res = await request(app).post('/api/v1/dataset/call_kw/student.leave.request/action_draft').send({ id: leaveReq.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 3. Student Progression lifecycle: draft -> open -> done -> draft
    const prog = store.create('op.student.progression', {
      student_id: stu.id,
      name: '2026 Term Progression Review',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.progression/state_open').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('open');

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.progression/state_done').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.progression/state_draft').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 4. Student Withdrawal Request lifecycle: draft -> submitted -> processed -> approved
    const wd = store.create('op.student.withdrawal', {
      student_id: stu.id,
      withdrawal_reason: 'Relocation abroad',
      notice_date: '2026-08-01',
      effective_date: '2026-11-15',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.withdrawal/action_submitted').send({ id: wd.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submitted');
    expect(res.body.record.full_term_notice_met).toBe(true);

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.withdrawal/action_processed').send({ id: wd.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('processed');

    res = await request(app).post('/api/v1/dataset/call_kw/op.student.withdrawal/action_approved').send({ id: wd.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');
  });

  it('executes full OpenEduCat 19 SIS parity flows: smart buttons, fees plan, health, discipline, grievances, and convocation', async () => {
    // 1. Verify Smart Buttons metadata for Faculty (7), Department (6), Course (8), Batch (2)
    const facDef = MODEL_MAP['op.faculty'];
    expect(facDef?.smart.length).toBe(7);
    expect(facDef.smart.map((s) => s.string)).toEqual(expect.arrayContaining([
      'Courses', 'Subjects', 'Assignment', 'Time Table', 'Sessions', 'Health', 'Media',
    ]));

    const deptDef = MODEL_MAP['op.department'];
    expect(deptDef?.smart.length).toBe(6);
    expect(deptDef.smart.map((s) => s.string)).toEqual(expect.arrayContaining([
      'Courses', 'Faculties', 'Students', 'Subjects', 'Batches', 'TimeTable',
    ]));

    const courseDef = MODEL_MAP['op.course'];
    expect(courseDef?.smart.length).toBeGreaterThanOrEqual(8);
    expect(courseDef.smart.map((s) => s.string)).toEqual(expect.arrayContaining([
      'Subjects', 'LMS Course', 'Faculties', 'Students', 'Assignment', 'Course Credit', 'Time Table', 'GradeBook',
    ]));

    const batchDef = MODEL_MAP['op.batch'];
    expect(batchDef?.smart.length).toBe(2);
    expect(batchDef.smart.map((s) => s.string)).toEqual(expect.arrayContaining([
      'Students', 'Sessions',
    ]));

    const stu = store.all('op.student')[0];
    const feesTerm = store.all('op.fees.terms')[0];

    // 2. Fees Plan lifecycle: draft -> running -> done -> draft
    const fp = store.create('op.fees.plan', {
      name: 'FP2026-001',
      student_id: stu.id,
      fees_term_id: feesTerm.id,
      total_amount: 150000,
      state: 'draft',
    });
    let res = await request(app).post('/api/v1/dataset/call_kw/op.fees.plan/running_fees_plan').send({ id: fp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('running');

    res = await request(app).post('/api/v1/dataset/call_kw/op.fees.plan/done_fees_plan').send({ id: fp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.fees.plan/draft_fees_plan').send({ id: fp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 3. Health & Infirmary lifecycle: draft -> confirm -> draft
    const hl = store.create('op.health', {
      type: 'student',
      student_id: stu.id,
      height: 165,
      weight: 55,
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.health/confirm_register').send({ id: hl.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.health/set_to_draft').send({ id: hl.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 4. Discipline Record lifecycle: draft -> email_sent -> awaiting_letter -> action_taken -> reset_draft
    const disc = store.create('op.discipline', {
      student_id: stu.id,
      note: 'Late to physics lab without hall pass',
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.discipline/send_email').send({ id: disc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('email_sent');

    res = await request(app).post('/api/v1/dataset/call_kw/op.discipline/apologies_letter').send({ id: disc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('awaiting_letter');

    res = await request(app).post('/api/v1/dataset/call_kw/op.discipline/take_action').send({ id: disc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('action_taken');

    res = await request(app).post('/api/v1/dataset/call_kw/op.discipline/reset_draft').send({ id: disc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 5. Grievances lifecycle: draft -> submitted -> in_review -> action -> resolve -> close
    const gcat = store.all('grievance.category')[0];
    const grv = store.create('grievance', {
      name: 'GRV-TEST-01',
      subject: 'Lab equipment calibration feedback',
      grievance_for: 'student',
      student_id: stu.id,
      grievance_category_id: gcat.id,
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/grievance/submitted_progressbar').send({ id: grv.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submitted');

    res = await request(app).post('/api/v1/dataset/call_kw/grievance/inreview_progressbar').send({ id: grv.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('in_review');

    // Manually advance to action stage
    store.write('grievance', grv.id, { state: 'action' });
    res = await request(app).post('/api/v1/dataset/call_kw/grievance/resolve_progressbar').send({ id: grv.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('resolve');

    res = await request(app).post('/api/v1/dataset/call_kw/grievance/close_progressbar').send({ id: grv.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('close');

    // 6. Convocation Ceremony & Registration lifecycle: draft -> registered -> done -> cancelled -> draft
    const ceremony = store.all('op.convocation.ceremony')[0];
    expect(ceremony).toBeDefined();
    const creg = store.create('op.convocation.registration', {
      ceremony_id: ceremony.id,
      student_id: stu.id,
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.convocation.registration/action_submit').send({ id: creg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('registered');

    res = await request(app).post('/api/v1/dataset/call_kw/op.convocation.registration/action_approve').send({ id: creg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.convocation.registration/action_cancel').send({ id: creg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('cancelled');

    res = await request(app).post('/api/v1/dataset/call_kw/op.convocation.registration/action_draft').send({ id: creg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');
  });

  it('validates AS-Level 5-credit gate, blocks practical private IGCSE, and triggers 5-party E-Sign for valid private IGCSE', async () => {
    const asCourse = store.all('op.course').find((c) => c.code === 'OAN-Y12-AS')!;
    const badAs = store.create('op.subject.registration', {
      student_id: 1, course_id: asCourse.id, batch_id: 4, compulsory_subject_ids: [29, 30, 31],
      igcse_credits_count: 4, english_math_passed: true,
    });
    const r1 = await request(app).post('/api/v1/dataset/call_kw/op.subject.registration/submit').send({ id: badAs.id });
    expect(r1.status).toBe(400);
    expect(r1.body.error).toContain('5 IGCSE credit passes');

    const y10Course = store.all('op.course').find((c) => c.code === 'OAN-Y10-IGCSE')!;
    const privOk = store.create('op.subject.registration', {
      student_id: 1, course_id: y10Course.id, batch_id: 3,
      compulsory_subject_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      is_extra_private_subject: true, private_subject_name: 'Gujarati Theory', has_practical_coursework: false,
    });
    const r2 = await request(app).post('/api/v1/dataset/call_kw/op.subject.registration/submit').send({ id: privOk.id });
    expect(r2.status).toBe(200);
    expect(r2.body.record.state).toBe('esign_pending');
  });

  it('settles student fee invoice via M-Pesa STK Push and runs scheduled ir.cron intervals', async () => {
    const pay = await request(app)
      .post('/api/v1/integrations/mpesa/stk-push')
      .send({ phone: '+254722810400', amount: 305000, move_id: 1, student_id: 1 });
    expect(pay.status).toBe(200);
    expect(pay.body.transaction.state).toBe('done');
    const inv = store.byId('account.move', 1)!;
    expect(inv.payment_state).toBe('paid');

    const cronRes = await request(app).post('/api/v1/cron/10/run').send({});
    expect(cronRes.status).toBe(200);
    expect(cronRes.body.message).toContain('Audited compliance');
  });

  it('has valid metadata references across all 53 apps, 35 portal cards, relations & admission register stats', async () => {
    for (const m of ALL_MODELS) {
      for (const f of Object.values(m.fields)) {
        if ((f.type === 'many2one' || f.type === 'many2many' || f.type === 'one2many') && f.relation) {
          expect(MODEL_MAP[f.relation], `${m.name}.${f.name} -> ${f.relation}`).toBeTruthy();
        }
      }
    }
    for (const appDef of APPS) {
      if (appDef.defaultModel) expect(MODEL_MAP[appDef.defaultModel], appDef.id).toBeTruthy();
      for (const sm of appDef.menus) {
        if (sm.model) expect(MODEL_MAP[sm.model], `${appDef.id}:${sm.label}`).toBeTruthy();
      }
    }
    for (const pc of PORTAL_CARDS) {
      if (pc.model) expect(MODEL_MAP[pc.model], pc.id).toBeTruthy();
    }

    const regRes = await request(app).post('/api/v1/dataset/call_kw/op.admission.register/search_read').send({});
    expect(regRes.status).toBe(200);
    expect(regRes.body.records[0]._register_stats).toBeTruthy();
    expect(regRes.body.records[0]._register_stats.draft).toBeGreaterThanOrEqual(1);
    expect(regRes.body.records[0]._register_stats.confirm).toBeGreaterThanOrEqual(1);
    expect(regRes.body.records[0]._register_stats.enroll).toBeGreaterThanOrEqual(1);
  });

  it('seeds 65+ apps/modules in ir.module.module and hydrates live dashboard stats for SIS, Accounting, Library, Attendance & Helpdesk', async () => {
    const modRes = await request(app).post('/api/v1/dataset/call_kw/ir.module.module/search_read').send({ limit: 100 });
    expect(modRes.status).toBe(200);
    expect(modRes.body.total).toBeGreaterThanOrEqual(50);

    const deptRes = await request(app).post('/api/v1/dataset/call_kw/op.department/search_read').send({});
    expect(deptRes.status).toBe(200);
    expect(deptRes.body.records[0]._dept_stats).toBeTruthy();
    expect(deptRes.body.records[0]._dept_stats.programs).toBeGreaterThanOrEqual(1);

    const jrnRes = await request(app).post('/api/v1/dataset/call_kw/account.journal/search_read').send({});
    expect(jrnRes.status).toBe(200);
    expect(jrnRes.body.records.length).toBeGreaterThanOrEqual(3);
    expect(jrnRes.body.records[0]._journal_stats).toBeTruthy();

    const mtRes = await request(app).post('/api/v1/dataset/call_kw/op.media.type/search_read').send({});
    expect(mtRes.status).toBe(200);
    expect(mtRes.body.records.length).toBeGreaterThanOrEqual(4);
    expect(mtRes.body.records[0]._library_stats).toBeTruthy();

    const attRegRes = await request(app).post('/api/v1/dataset/call_kw/op.attendance.register/search_read').send({});
    expect(attRegRes.status).toBe(200);
    expect(attRegRes.body.records[0]._register_sheet_count).toBeGreaterThanOrEqual(1);

    const hdRes = await request(app).post('/api/v1/dataset/call_kw/helpdesk.team/search_read').send({});
    expect(hdRes.status).toBe(200);
    expect(hdRes.body.records[0]._team_stats).toBeTruthy();
  });

  it('verifies Module 4 (Class Attendances) full lifecycle, kiosk, and percentage calculations', async () => {
    // 1. Verify model definitions and smart buttons
    const regModel = MODEL_MAP['op.attendance.register'];
    expect(regModel).toBeDefined();
    expect(regModel.smart.map((s) => s.string)).toContain('Attendance Sheets');

    const sheetModel = MODEL_MAP['op.attendance.sheet'];
    expect(sheetModel).toBeDefined();
    expect(sheetModel.smart.map((s) => s.string)).toContain('Present');
    expect(sheetModel.smart.map((s) => s.string)).toContain('Absent');
    expect(sheetModel.buttons.map((b) => b.name)).toContain('attendance_start');
    expect(sheetModel.buttons.map((b) => b.name)).toContain('attendance_done');

    const lineModel = MODEL_MAP['op.attendance.line'];
    expect(lineModel).toBeDefined();
    expect(lineModel.fields.present).toBeDefined();
    expect(lineModel.fields.absent).toBeDefined();

    // 2. Create an Attendance Sheet and lines
    const reg = store.all('op.attendance.register')[0];
    expect(reg).toBeDefined();

    const sheet = store.create('op.attendance.sheet', {
      name: 'Test Class Attendance 10A',
      register_id: reg.id,
      attendance_date: '2026-11-19',
      state: 'draft',
    });
    const sheetId = sheet.id;

    // Add 2 lines: 1 present, 1 absent
    const students = store.all('op.student').slice(0, 2);
    expect(students.length).toBe(2);

    store.create('op.attendance.line', {
      attendance_id: sheetId,
      student_id: students[0].id,
      present: true,
      absent: false,
      state: 'draft',
    });
    store.create('op.attendance.line', {
      attendance_id: sheetId,
      student_id: students[1].id,
      present: false,
      absent: true,
      state: 'draft',
    });

    // 3. Test enable_kiosk
    const kioskRes = await request(app).post('/api/v1/dataset/call_kw/op.attendance.sheet/enable_kiosk').send({ id: sheetId });
    expect(kioskRes.status).toBe(200);
    expect(kioskRes.body.message).toContain('Kiosk ready');

    // 4. Test attendance_start
    const startRes = await request(app).post('/api/v1/dataset/call_kw/op.attendance.sheet/attendance_start').send({ id: sheetId });
    expect(startRes.status).toBe(200);
    expect(startRes.body.record.state).toBe('start');

    // 5. Test attendance_done
    const doneRes = await request(app).post('/api/v1/dataset/call_kw/op.attendance.sheet/attendance_done').send({ id: sheetId });
    expect(doneRes.status).toBe(200);
    expect(doneRes.body.record.state).toBe('done');
    expect(doneRes.body.record.total_present).toBe(1);
    expect(doneRes.body.record.total_absent).toBe(1);
    expect(doneRes.body.record.attendance_percentage).toBe(50);

    // 6. Test reset_attendance / attendance_draft
    const resetRes = await request(app).post('/api/v1/dataset/call_kw/op.attendance.sheet/reset_attendance').send({ id: sheetId });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.record.state).toBe('draft');
  });

  it('verifies Module 5 (Time Table) full lifecycle, session progression, and timetable generation wizard', async () => {
    // 1. Verify model definitions, buttons, and smart buttons
    const sessionModel = MODEL_MAP['op.session'];
    expect(sessionModel).toBeDefined();
    expect(sessionModel.smart.map((s) => s.string)).toContain('Attendance Sheet');
    expect(sessionModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'lecture_confirm', 'lecture_done', 'lecture_draft', 'lecture_cancel',
    ]));
    expect(sessionModel.kanban.groupBy).toBe('days');

    const lessonModel = MODEL_MAP['op.lesson'];
    expect(lessonModel).toBeDefined();
    expect(lessonModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'lesson_plan', 'lesson_conduct', 'lesson_cancel', 'lesson_draft',
    ]));

    // 2. Session progression: draft -> lecture_confirm -> lecture_done -> lecture_cancel -> lecture_draft
    const course = store.all('op.course')[0];
    const batch = store.all('op.batch')[0];
    const subject = store.all('op.subject')[0];
    const faculty = store.all('op.faculty')[0];

    const session = store.create('op.session', {
      name: 'Advanced Chemistry Lab Practical',
      course_id: course.id,
      batch_id: batch.id,
      subject_id: subject.id,
      faculty_id: faculty.id,
      days: 'monday',
      timing: '09:00 - 10:30',
      type: 'practical',
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.session/lecture_confirm').send({ id: session.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.session/lecture_done').send({ id: session.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.session/lecture_cancel').send({ id: session.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('cancel');

    res = await request(app).post('/api/v1/dataset/call_kw/op.session/lecture_draft').send({ id: session.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 3. Lesson plan progression: draft -> lesson_plan -> lesson_conduct
    const lesson = store.create('op.lesson', {
      name: 'Chemical Equilibrium & Le Chatelier Principle',
      course_id: course.id,
      batch_id: batch.id,
      subject_id: subject.id,
      faculty_id: faculty.id,
      lesson_topic: 'Equilibrium constants and shift mechanisms',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.lesson/lesson_plan').send({ id: lesson.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('plan');

    res = await request(app).post('/api/v1/dataset/call_kw/op.lesson/lesson_conduct').send({ id: lesson.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('conduct');

    // 4. Generate Timetable wizard
    const wiz = store.create('generate.time.table', {
      name: 'Batch 10A Timetable Generator',
      course_id: course.id,
      batch_id: batch.id,
      start_date: '2026-11-20',
      end_date: '2026-11-27',
      skip_conflicts: true,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/generate.time.table/act_gen_time_table').send({ id: wiz.id });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Successfully generated');

    const createdSessions = store.all('op.session').filter((s) => Number(s.course_id) === course.id && Number(s.batch_id) === batch.id);
    expect(createdSessions.length).toBeGreaterThanOrEqual(5);
  });

  it('verifies Module 6 (Exams) full lifecycle, attendees, marksheet generation, and result lines', async () => {
    // 1. Verify model metadata and smart buttons
    const sessionModel = MODEL_MAP['op.exam.session'];
    expect(sessionModel).toBeDefined();
    expect(sessionModel.smart.map((s) => s.string)).toContain('Exams');
    expect(sessionModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'act_schedule', 'act_held', 'act_done', 'act_cancel', 'act_draft',
    ]));

    const examModel = MODEL_MAP['op.exam'];
    expect(examModel).toBeDefined();
    expect(examModel.smart.map((s) => s.string)).toContain('Attendees');
    expect(examModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'act_schedule', 'act_held', 'act_result_updated', 'act_done', 'act_cancel', 'act_draft',
    ]));

    const resLineModel = MODEL_MAP['op.result.line'];
    expect(resLineModel).toBeDefined();
    expect(resLineModel.fields.marksheet_line_id).toBeDefined();
    expect(resLineModel.fields.exam_id).toBeDefined();

    // 2. Exam Session lifecycle: draft -> schedule -> held -> done
    const course = store.all('op.course')[0];
    const batch = store.all('op.batch')[0];
    const examType = store.all('op.exam.type')[0];

    const examSession = store.create('op.exam.session', {
      name: '2026 Term 1 Final Examinations',
      exam_code: 'EXAM-2026-T1',
      course_id: course.id,
      batch_id: batch.id,
      exam_type: examType.id,
      start_date: '2026-11-20',
      end_date: '2026-11-28',
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.exam.session/act_schedule').send({ id: examSession.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('schedule');

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam.session/act_held').send({ id: examSession.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('held');

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam.session/act_done').send({ id: examSession.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // 3. Exam lifecycle: draft -> schedule -> held -> result_updated -> done
    const subject = store.all('op.subject')[0];
    const exam = store.create('op.exam', {
      name: 'Pure Mathematics Paper 1',
      exam_code: 'MATH-P1',
      session_id: examSession.id,
      subject_id: subject.id,
      total_marks: 100,
      min_marks: 40,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam/act_schedule').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('schedule');

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam/act_held').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('held');

    // Add attendees
    const students = store.all('op.student').slice(0, 2);
    store.create('op.exam.attendees', {
      exam_id: exam.id,
      student_id: students[0].id,
      marks: 88,
      status: 'present',
    });
    store.create('op.exam.attendees', {
      exam_id: exam.id,
      student_id: students[1].id,
      marks: 74,
      status: 'present',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam/act_result_updated').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('result_updated');

    res = await request(app).post('/api/v1/dataset/call_kw/op.exam/act_done').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // 4. Result Template & Marksheet Generation
    const scale = store.all('op.grade.scale')[0];
    const tpl = store.create('op.result.template', {
      name: 'Pure Math Marksheet Template',
      exam_session_id: examSession.id,
      grade_scale_id: scale?.id,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.result.template/generate_result').send({ id: tpl.id });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Generated marksheet');

    // Verify marksheet register, marksheet lines, and result lines were created
    const registers = store.all('op.marksheet.register').filter((r) => Number(r.result_template_id) === tpl.id);
    expect(registers.length).toBeGreaterThanOrEqual(1);

    const msLines = store.all('op.marksheet.line').filter((l) => Number(l.marksheet_reg_id) === registers[0].id);
    expect(msLines.length).toBe(2);

    const resLines = store.all('op.result.line').filter((rl) => Number(rl.exam_id) === exam.id);
    expect(resLines.length).toBe(2);

    // 5. Marksheet Register validate
    res = await request(app).post('/api/v1/dataset/call_kw/op.marksheet.register/action_validate').send({ id: registers[0].id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('validated');
  });

  it('verifies Module 7 (Grade Book) full lifecycle, grading assignments, recomputation, and honor roll', async () => {
    // 1. Verify model metadata and smart buttons
    const assignModel = MODEL_MAP['grading.assignment'];
    expect(assignModel).toBeDefined();
    expect(assignModel.smart.map((s) => s.string)).toContain('Grade');
    expect(assignModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'action_published', 'action_grading_started', 'action_grading_closed', 'action_grades_published', 'action_cancelled', 'action_draft',
    ]));

    const gbModel = MODEL_MAP['gradebook.gradebook'];
    expect(gbModel).toBeDefined();
    expect(gbModel.smart.map((s) => s.string)).toContain('GradeBook');
    expect(gbModel.buttons.map((b) => b.name)).toEqual(expect.arrayContaining([
      'action_inprogress', 'action_publish', 'recompute_data', 'student_Grade_override', 'action_cancelled', 'action_draft',
    ]));

    const honorModel = MODEL_MAP['op.honorroll'];
    expect(honorModel).toBeDefined();
    expect(honorModel.fields.from_per).toBeDefined();
    expect(honorModel.fields.to_per).toBeDefined();

    const stageModel = MODEL_MAP['assignment.stage'];
    expect(stageModel).toBeDefined();

    const tableModel = MODEL_MAP['op.grade.table'];
    expect(tableModel).toBeDefined();

    // 2. Grading Assignment lifecycle: draft -> published -> grading_started -> grading_closed -> grades_published
    const course = store.all('op.course')[0];
    const subject = store.all('op.subject')[0];
    const faculty = store.all('op.faculty')[0];
    const aType = store.all('grading.assignment.type')[0];

    const assign = store.create('grading.assignment', {
      name: 'Calculus Optimization Project',
      course_id: course.id,
      subject_id: subject.id,
      faculty_id: faculty.id,
      assignment_type: aType.id,
      point: 100,
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/grading.assignment/action_published').send({ id: assign.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('published');

    res = await request(app).post('/api/v1/dataset/call_kw/grading.assignment/action_grading_started').send({ id: assign.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('grading_started');

    res = await request(app).post('/api/v1/dataset/call_kw/grading.assignment/action_grading_closed').send({ id: assign.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('grading_closed');

    res = await request(app).post('/api/v1/dataset/call_kw/grading.assignment/action_grades_published').send({ id: assign.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('grades_published');

    // 3. Grade Book lifecycle: draft -> inprogress -> recompute_data -> publish
    const student = store.all('op.student')[0];
    const year = store.all('op.academic.year')[0];
    const scale = store.all('op.grade.scale')[0];

    const gb = store.create('gradebook.gradebook', {
      name: `GB-TEST-${student.id}`,
      student_id: student.id,
      course_id: course.id,
      academic_year_id: year.id,
      grade_scale_id: scale.id,
      percentage: 0,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/gradebook.gradebook/action_inprogress').send({ id: gb.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('inprogress');

    store.create('gradebook.line', {
      gradebook_id: gb.id,
      subject_id: subject.id,
      calculated_score: 92,
      override_score: 94,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/gradebook.gradebook/recompute_data').send({ id: gb.id });
    expect(res.status).toBe(200);
    expect(res.body.record.percentage).toBe(94);

    res = await request(app).post('/api/v1/dataset/call_kw/gradebook.gradebook/action_publish').send({ id: gb.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('publish');

    // 4. Honor Roll generation
    const hr = store.create('op.honorroll', {
      name: 'High Achievers Honor Roll 2026',
      course_id: course.id,
      from_per: 90,
      to_per: 100,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.honorroll/generate_honor_roll').send({ id: hr.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('generate');
  });

  it('Module 8: Assignments — verifies exact live models, 10 menus, submission workflows, rubrics & late penalties', async () => {
    // 1. Metadata & Menus
    const asgDef = MODEL_MAP['op.assignment'];
    expect(asgDef).toBeTruthy();
    expect(asgDef.smart.map((s) => s.string)).toContain('Submissions');
    const asgBtnNames = asgDef.buttons.map((b) => b.name);
    expect(asgBtnNames).toContain('act_publish');
    expect(asgBtnNames).toContain('act_finish');
    expect(asgBtnNames).toContain('update_mark');
    expect(asgBtnNames).toContain('act_cancel');
    expect(asgBtnNames).toContain('act_set_to_draft');

    const subDef = MODEL_MAP['op.assignment.sub.line'];
    expect(subDef).toBeTruthy();
    const subBtnNames = subDef.buttons.map((b) => b.name);
    expect(subBtnNames).toContain('act_submit');
    expect(subBtnNames).toContain('act_to_assess');
    expect(subBtnNames).toContain('act_accept');
    expect(subBtnNames).toContain('act_change_req');
    expect(subBtnNames).toContain('act_reject');
    expect(subBtnNames).toContain('act_draft');
    expect(subBtnNames).toContain('action_open_pdf_view');
    expect(subBtnNames).toContain('ignore_submission_attempt');

    const rubDef = MODEL_MAP['op.rubric.template'];
    expect(rubDef).toBeTruthy();
    const rubBtnNames = rubDef.buttons.map((b) => b.name);
    expect(rubBtnNames).toContain('act_in_use');
    expect(rubBtnNames).toContain('action_expire_template');

    expect(MODEL_MAP['grading.assignment.type']).toBeTruthy();
    expect(MODEL_MAP['op.rubric.level']).toBeTruthy();
    expect(MODEL_MAP['op.assign.grade.config']).toBeTruthy();
    expect(MODEL_MAP['late.submission']).toBeTruthy();
    expect(MODEL_MAP['late.submission.line']).toBeTruthy();
    expect(MODEL_MAP['op.assessment.attempt']).toBeTruthy();

    const asgApp = APPS.find((a) => a.id === 'assignments');
    expect(asgApp).toBeTruthy();
    expect(asgApp!.menus.length).toBe(10);
    const menuModels = asgApp!.menus.map((m) => m.model).filter(Boolean);
    expect(menuModels).toContain('op.assignment');
    expect(menuModels).toContain('op.assignment.sub.line');
    expect(menuModels).toContain('grading.assignment.type');
    expect(menuModels).toContain('op.rubric.template');
    expect(menuModels).toContain('op.assign.grade.config');
    expect(menuModels).toContain('op.rubric.level');
    expect(menuModels).toContain('late.submission');

    // 2. Operational Assignment & Submission flow
    const course = store.all('op.course')[0];
    const batch = store.all('op.batch')[0];
    const subject = store.all('op.subject')[0];
    const faculty = store.all('op.faculty')[0];
    const student = store.all('op.student')[0];
    const asgType = store.all('grading.assignment.type')[0];

    const asg = store.create('op.assignment', {
      name: 'Cambridge IAL Chemistry Lab Experiment',
      sequence: 'ASG-CH-01',
      course_id: course.id,
      batch_id: batch.id,
      subject_id: subject.id,
      faculty_id: faculty.id,
      assignment_type: asgType.id,
      marks: 100,
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.assignment/act_publish').send({ id: asg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('publish');

    const sub = store.create('op.assignment.sub.line', {
      assignment_id: asg.id,
      student_id: student.id,
      marks: 85,
      penalty: 10,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment.sub.line/act_submit').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submit');

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment.sub.line/act_to_assess').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('to_assess');

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment.sub.line/action_open_pdf_view').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Rubric Assessment');

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment/update_mark').send({ id: asg.id });
    expect(res.status).toBe(200);
    const updatedSub = store.byId('op.assignment.sub.line', sub.id);
    // 85 - (85 * 0.10) = 77 (Math.round(76.5) = 77)
    expect(updatedSub?.obtained_mark).toBe(77);

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment.sub.line/act_accept').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('accept');

    res = await request(app).post('/api/v1/dataset/call_kw/op.assignment/act_finish').send({ id: asg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('finish');

    // 3. Rubric Template expiration workflow
    const rub = store.create('op.rubric.template', {
      name: 'OAN Term 1 Practical Rubric',
      rubrics_type: 'points',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.rubric.template/action_expire_template').send({ id: rub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('expire');
    expect(res.body.record.template_expired).toBe(true);
  });

  it('Module 9: Accounting (Fees / Invoicing) — verifies exact live models, 40 menus, invoice payment lifecycle, assets & batches', async () => {
    // 1. Metadata & Menus
    const invDef = MODEL_MAP['account.move'];
    expect(invDef).toBeTruthy();
    expect(invDef.smart.map((s) => s.string)).toContain('Payments');
    const invBtnNames = invDef.buttons.map((b) => b.name);
    expect(invBtnNames).toContain('action_post');
    expect(invBtnNames).toContain('action_register_payment');
    expect(invBtnNames).toContain('action_reverse');
    expect(invBtnNames).toContain('button_cancel');
    expect(invBtnNames).toContain('button_draft');

    const payDef = MODEL_MAP['account.payment'];
    expect(payDef).toBeTruthy();
    const payBtnNames = payDef.buttons.map((b) => b.name);
    expect(payBtnNames).toContain('action_post');
    expect(payBtnNames).toContain('action_validate');
    expect(payBtnNames).toContain('action_refund_wizard');

    expect(MODEL_MAP['account.move.line']).toBeTruthy();
    expect(MODEL_MAP['account.batch.payment']).toBeTruthy();
    expect(MODEL_MAP['account.journal']).toBeTruthy();
    expect(MODEL_MAP['account.account']).toBeTruthy();
    expect(MODEL_MAP['account.tax']).toBeTruthy();
    expect(MODEL_MAP['account.payment.term']).toBeTruthy();
    expect(MODEL_MAP['account.fiscal.position']).toBeTruthy();
    expect(MODEL_MAP['account.journal.group']).toBeTruthy();
    expect(MODEL_MAP['account.asset.asset']).toBeTruthy();
    expect(MODEL_MAP['account.asset.category']).toBeTruthy();
    expect(MODEL_MAP['account.asset.request']).toBeTruthy();
    expect(MODEL_MAP['asset.request.reason']).toBeTruthy();
    expect(MODEL_MAP['account.change.lock.date']).toBeTruthy();
    expect(MODEL_MAP['asset.depreciation.confirmation.wizard']).toBeTruthy();
    expect(MODEL_MAP['l10n_us_1099.wizard']).toBeTruthy();
    expect(MODEL_MAP['account.invoice.report']).toBeTruthy();
    expect(MODEL_MAP['account.analytic.line']).toBeTruthy();
    expect(MODEL_MAP['asset.asset.report']).toBeTruthy();
    expect(MODEL_MAP['product.category']).toBeTruthy();
    expect(MODEL_MAP['payment.provider']).toBeTruthy();
    expect(MODEL_MAP['payment.method']).toBeTruthy();
    expect(MODEL_MAP['exchange.rate.sync.error']).toBeTruthy();
    expect(MODEL_MAP['op.fees.terms']).toBeTruthy();
    expect(MODEL_MAP['op.fees.element']).toBeTruthy();
    expect(MODEL_MAP['op.fees.terms.line']).toBeTruthy();
    expect(MODEL_MAP['op.student.fees.details']).toBeTruthy();

    const accApp = APPS.find((a) => a.id === 'accounting');
    expect(accApp).toBeTruthy();
    expect(accApp!.menus.length).toBe(40);
    const menuModels = accApp!.menus.map((m) => m.model).filter(Boolean);
    expect(menuModels).toContain('account.journal');
    expect(menuModels).toContain('account.move');
    expect(menuModels).toContain('account.payment');
    expect(menuModels).toContain('account.batch.payment');
    expect(menuModels).toContain('account.account');
    expect(menuModels).toContain('account.tax');
    expect(menuModels).toContain('account.payment.term');
    expect(menuModels).toContain('account.fiscal.position');
    expect(menuModels).toContain('account.asset.asset');
    expect(menuModels).toContain('account.asset.request');
    expect(menuModels).toContain('account.invoice.report');
    expect(menuModels).toContain('asset.asset.report');

    // 2. Operational Invoicing & Payment lifecycle
    const partner = store.all('res.partner')[0];
    const student = store.all('op.student')[0];
    const journal = store.all('account.journal')[0];

    const inv = store.create('account.move', {
      name: 'INV/2026/TEST01',
      move_type: 'out_invoice',
      partner_id: partner.id,
      student_id: student.id,
      amount_total: 150000,
      amount_residual: 150000,
      state: 'draft',
      payment_state: 'not_paid',
    });

    store.create('account.move.line', {
      move_id: inv.id,
      name: 'Term 1 Tuition - AS Level Physics & Chem',
      quantity: 1,
      price_unit: 150000,
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/account.move/action_post').send({ id: inv.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('posted');

    res = await request(app).post('/api/v1/dataset/call_kw/account.move/action_register_payment').send({
      id: inv.id,
      amount: 150000,
      journal_id: journal.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.record.payment_state).toBe('paid');
    expect(res.body.record.amount_residual).toBe(0);
    expect(res.body.record.payment_count).toBe(1);

    // Verify payment record was created
    const pay = store.all('account.payment').find((p) => Number(p.move_id) === inv.id);
    expect(pay).toBeTruthy();
    expect(pay?.amount).toBe(150000);
    expect(pay?.state).toBe('paid');

    // 3. Reversal & Credit Note
    res = await request(app).post('/api/v1/dataset/call_kw/account.move/action_reverse').send({ id: inv.id });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Credit note');

    // 4. Asset lifecycle & depreciation
    const cat = store.create('account.asset.category', { name: 'Campus Smartboards' });
    const asset = store.create('account.asset.asset', {
      name: 'Promethean 75-inch Interactive Display',
      category_id: cat.id,
      value: 250000,
      salvage_value: 50000,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/account.asset.asset/compute_depreciation_board').send({ id: asset.id });
    expect(res.status).toBe(200);
    expect(res.body.record.value_residual).toBe(160000);

    // 5. Asset Request lifecycle
    const reason = store.create('asset.request.reason', { name: 'Physics Lab Expansion' });
    const reqAsset = store.create('account.asset.request', {
      name: 'AST-REQ-TEST-01',
      request_for: 'student',
      student_id: student.id,
      requested_asset: 'Lab Sensor Kit',
      request_reason_id: reason.id,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/account.asset.request/approved_progressbar').send({ id: reqAsset.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');
    expect(res.body.record.approve_date).toBeTruthy();

    res = await request(app).post('/api/v1/dataset/call_kw/account.asset.request/allocate_progressbar').send({ id: reqAsset.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('allocate');

    res = await request(app).post('/api/v1/dataset/call_kw/account.asset.request/return_progressbar').send({ id: reqAsset.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('returned');
  });

  it('Module 10: LMS (backend + learner player) — verifies exact live models, 10 menus, course creation & learner enrollment workflows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const lmsModels = [
      'op.course', 'op.course.module', 'op.course.enrollment', 'op.course.enrollment.line',
      'op.course.tag', 'op.course.category', 'op.course.announcement',
      'op.course.question', 'op.course.answer', 'op.course.plan',
    ];
    for (const m of lmsModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all live menus in LMS app
    const lmsApp = APPS.find((a) => a.id === 'lms');
    expect(lmsApp).toBeDefined();
    expect(lmsApp!.menus.length).toBeGreaterThanOrEqual(10);
    const labels = lmsApp!.menus.map((m) => m.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Summary');
    expect(labels).toContain('Course Participation');
    expect(labels).toContain('Course Profile Report');
    expect(labels).toContain('Quiz Participation Report');
    expect(labels).toContain('Quiz Statistics');
    expect(labels).toContain('Forum Participation');
    expect(labels).toContain('Tags');
    expect(labels).toContain('Category');
    expect(labels).toContain('LMS Course Generator');

    // 3. Course creation & create_online_course action
    const course = store.create('op.course', {
      name: 'Cambridge IGCSE Computer Science 0478',
      code: 'CS-0478',
      evaluation_type: 'normal',
      state: 'draft',
      online_course_created: false,
      online_course: false,
      is_lms_published: false,
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.course/create_online_course').send({ id: course.id });
    expect(res.status).toBe(200);
    expect(res.body.record.online_course_created).toBe(true);
    expect(res.body.record.online_course).toBe(true);
    expect(res.body.record.is_lms_published).toBe(true);
    expect(res.body.record.website_published).toBe(true);
    expect(res.body.record.state).toBe('open');

    // 4. Course module lifecycle
    const mod = store.create('op.course.module', {
      name: 'Topic 1 — Data Representation & Binary Systems',
      course_id: course.id,
      sequence: 10,
      module_category: 'video',
      video_type: 'url',
      video_url: 'https://youtube.com/watch?v=sampleCS0478',
      is_published: false,
      website_published: false,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.course.module/act_publish').send({ id: mod.id });
    expect(res.status).toBe(200);
    expect(res.body.record.is_published).toBe(true);
    expect(res.body.record.website_published).toBe(true);

    res = await request(app).post('/api/v1/dataset/call_kw/op.course.module/act_unpublish').send({ id: mod.id });
    expect(res.status).toBe(200);
    expect(res.body.record.is_published).toBe(false);

    // 5. Learner enrollment & progress tracking
    res = await request(app).post('/api/v1/dataset/call_kw/op.course/enroll_learner').send({ id: course.id, user_id: 1 });
    expect(res.status).toBe(200);
    const enrId = res.body.record.id;
    expect(enrId).toBeDefined();
    expect(res.body.record.state).toBe('in_progress');

    // Verify enrollment lines auto-created for modules
    const enrLines = store.all('op.course.enrollment.line').filter((l) => Number(l.enrollment_id) === enrId);
    expect(enrLines.length).toBeGreaterThanOrEqual(1);

    // 6. Complete course enrollment
    res = await request(app).post('/api/v1/dataset/call_kw/op.course.enrollment/action_complete').send({ id: enrId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');
    expect(res.body.record.progress).toBe(100);
    expect(res.body.record.completion_date).toBeTruthy();

    // 7. Reset enrollment
    res = await request(app).post('/api/v1/dataset/call_kw/op.course.enrollment/action_reset').send({ id: enrId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');
    expect(res.body.record.progress).toBe(0);
  });

  it('Module 11: Quiz — verifies exact live models, 9 menus, quiz lifecycle, line scoring & result assessment workflows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const quizModels = [
      'op.quiz', 'op.quiz.line', 'op.quiz.result', 'op.quiz.result.line',
      'op.question.bank', 'op.quiz.category', 'op.answer.grade',
      'op.question.bank.type', 'op.quiz.config',
    ];
    for (const m of quizModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 9 live menus in Quiz app
    const quizApp = APPS.find((a) => a.id === 'quiz');
    expect(quizApp).toBeDefined();
    expect(quizApp!.menus.length).toBeGreaterThanOrEqual(9);
    const labels = quizApp!.menus.map((m) => m.label);
    expect(labels).toContain('Quiz');
    expect(labels).toContain('Results');
    expect(labels).toContain('Question Bank');
    expect(labels).toContain('Quiz Result Analysis');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Quiz Category');
    expect(labels).toContain('Grades');
    expect(labels).toContain('Question Bank Type');
    expect(labels).toContain('AI Quiz Generator');

    // 3. Quiz creation & full lifecycle (draft -> open -> done -> cancel -> draft)
    const cat = store.all('op.quiz.category')[0];
    const quiz = store.create('op.quiz', {
      name: 'IGCSE Chemistry Equilibrium Check',
      categ_id: cat?.id || 1,
      quiz_config: 'normal',
      assigned_to: 'open_for_all',
      total_marks: 20,
      state: 'draft',
      active: true,
    });

    // Add quiz lines (questions)
    store.create('op.quiz.line', {
      quiz_id: quiz.id,
      name: 'Define Le Chatelier’s Principle.',
      que_type: 'descriptive',
      mark: 10,
      sequence: 10,
    });
    store.create('op.quiz.line', {
      quiz_id: quiz.id,
      name: 'What happens to the yield of ammonia when pressure increases?',
      que_type: 'optional',
      mark: 10,
      sequence: 20,
    });

    // Confirm quiz
    let res = await request(app).post('/api/v1/dataset/call_kw/op.quiz/action_confirm').send({ id: quiz.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('open');

    // View exam / preview
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz/view_quiz').send({ id: quiz.id });
    expect(res.status).toBe(200);

    // Mark done
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz/action_done').send({ id: quiz.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // Close / Cancel
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz/action_cancel').send({ id: quiz.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('cancel');

    // Re-open to draft
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz/action_draft').send({ id: quiz.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 4. Quiz result submission, assessment, and automatic percentage scoring
    const student = store.all('op.student')[0];
    const qResult = store.create('op.quiz.result', {
      name: 'QR/2026/TEST/001',
      quiz_id: quiz.id,
      student_id: student?.id || 1,
      total_marks: 20,
      state: 'open',
    });

    store.create('op.quiz.result.line', {
      result_id: qResult.id,
      name: 'Define Le Chatelier’s Principle.',
      question_mark: 10,
      mark: 9,
      que_type: 'descriptive',
    });
    store.create('op.quiz.result.line', {
      result_id: qResult.id,
      name: 'What happens to the yield of ammonia when pressure increases?',
      question_mark: 10,
      mark: 10,
      que_type: 'optional',
    });

    // Submit attempt
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz.result/get_action_submit').send({ id: qResult.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submit');
    expect(res.body.record.submit_date).toBeDefined();

    // Move to assessment
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz.result/get_action_asses').send({ id: qResult.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('asses');

    // Finalize assessment and auto-score
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz.result/get_action_done').send({ id: qResult.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');
    expect(res.body.record.received_marks).toBe(19);
    expect(res.body.record.score).toBe(95); // 19 / 20 * 100 = 95%
    expect(res.body.record.total_correct).toBe(2);

    // Reopen attempt
    res = await request(app).post('/api/v1/dataset/call_kw/op.quiz.result/get_action_re_open').send({ id: qResult.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('open');
  });

  it('Module 12: Library — verifies exact live models, 20 menus, media inventory, issue/renew/return/fine flows, and barcode workflows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const libModels = [
      'op.media', 'op.media.unit', 'op.media.movement', 'op.media.queue',
      'op.media.purchase', 'barcode.issue.media', 'op.library.card',
      'op.library.card.type', 'op.publisher', 'op.author', 'op.tag', 'op.media.type',
    ];
    for (const m of libModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 20 live menus in Library app
    const libApp = APPS.find((a) => a.id === 'library');
    expect(libApp).toBeDefined();
    expect(libApp!.menus.length).toBe(20);
    const labels = libApp!.menus.map((m) => m.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Media');
    expect(labels).toContain('Media Units');
    expect(labels).toContain('Media Movements');
    expect(labels).toContain('Media Queue Requests');
    expect(labels).toContain('Media Purchase Requests');
    expect(labels).toContain('Issue Media');
    expect(labels).toContain('Barcode');
    expect(labels).toContain('Media Analysis');
    expect(labels).toContain('Media Unit Analysis');
    expect(labels).toContain('Media Movement Analysis');
    expect(labels).toContain('Media Queue Analysis');
    expect(labels).toContain('Media Purchase Analysis');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Library Cards');
    expect(labels).toContain('Publishers');
    expect(labels).toContain('Authors');
    expect(labels).toContain('Tags');
    expect(labels).toContain('Media Type');
    expect(labels).toContain('Library Card Types');

    // 3. Media & Media Unit inventory management
    const mType = store.all('op.media.type')[0];
    const media = store.create('op.media', {
      name: 'Cambridge International AS and A Level Chemistry',
      media_type_id: mType.id,
      isbn: '9781108863193',
      internal_code: 'OAN-LIB-CHM-01',
      edition: '3rd Edition',
      total_units: 1,
      active: true,
    });
    expect(media.id).toBeDefined();

    const unit = store.create('op.media.unit', {
      name: 'CHM-A2-U01',
      media_id: media.id,
      media_type_id: mType.id,
      barcode: 'BAR-CHM-001',
      state: 'available',
      active: true,
    });
    expect(unit.id).toBeDefined();

    // 4. Movement issue, renew, return, and penalty invoice generation
    const card = store.all('op.library.card')[0];
    const student = store.all('op.student')[0];

    const mov = store.create('op.media.movement', {
      media_id: media.id,
      media_type_id: mType.id,
      media_unit_id: unit.id,
      library_card_id: card.id,
      student_id: student.id,
      state: 'available',
      active: true,
    });

    // Issue Media
    let res = await request(app).post('/api/v1/dataset/call_kw/op.media.movement/issue_media').send({ id: mov.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('issue');
    expect(res.body.record.issued_date).toBeDefined();
    // Unit should be marked as issued
    const unitAfterIssue = store.byId('op.media.unit', unit.id);
    expect(unitAfterIssue?.state).toBe('issue');

    // Renew Media (+14 days)
    res = await request(app).post('/api/v1/dataset/call_kw/op.media.movement/renew_media').send({ id: mov.id });
    expect(res.status).toBe(200);
    expect(res.body.record.is_renew).toBe(true);

    // Return Media (with penalty test)
    // Manually set return_date to 5 days ago to trigger overdue calculation
    store.write('op.media.movement', mov.id, {
      return_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.media.movement/return_media').send({ id: mov.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('return');
    expect(res.body.record.actual_return_date).toBeDefined();
    expect(res.body.record.penalty).toBe(250); // 5 days * 50 KES
    const unitAfterReturn = store.byId('op.media.unit', unit.id);
    expect(unitAfterReturn?.state).toBe('available');

    // Generate Overdue Fine Invoice
    res = await request(app).post('/api/v1/dataset/call_kw/op.media.movement/create_penalty_invoice').send({ id: mov.id });
    expect(res.status).toBe(200);
    expect(res.body.record.invoice_id).toBeDefined();
    const inv = store.byId('account.move', res.body.record.invoice_id);
    expect(inv?.amount_total).toBe(250);
    expect(inv?.fee_category).toBe('library_fine');

    // 5. Queue Request lifecycle (request -> accept -> reject -> request)
    const queue = store.create('op.media.queue', {
      name: 'QUEUE/2026/TEST01',
      media_id: media.id,
      student_id: student.id,
      state: 'request',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.media.queue/do_accept').send({ id: queue.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('accept');

    res = await request(app).post('/api/v1/dataset/call_kw/op.media.queue/do_reject').send({ id: queue.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('reject');

    res = await request(app).post('/api/v1/dataset/call_kw/op.media.queue/do_request_again').send({ id: queue.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('request');

    // 6. Media Purchase Request lifecycle (draft -> request -> accept)
    const purchase = store.create('op.media.purchase', {
      name: 'Campbell Biology 12th Edition',
      author: 'Lisa A. Urry',
      publisher: 'Pearson',
      media_type_id: mType.id,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.media.purchase/act_requested').send({ id: purchase.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('request');

    res = await request(app).post('/api/v1/dataset/call_kw/op.media.purchase/act_accept').send({ id: purchase.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('accept');

    // 7. Barcode Scanner Checkout and Checkin workflow
    const barcodeUnit = store.create('op.media.unit', {
      name: 'BARCODE-UNIT-01',
      media_id: media.id,
      barcode: 'SCAN-990011',
      state: 'available',
    });

    // Barcode Issue
    res = await request(app).post('/api/v1/dataset/call_kw/barcode.issue.media/action_issue').send({
      args: {
        barcode: 'SCAN-990011',
        transaction_type: 'issue',
        library_card_id: card.id,
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('issue');
    const checkedUnit = store.byId('op.media.unit', barcodeUnit.id);
    expect(checkedUnit?.state).toBe('issue');

    // Barcode Return
    res = await request(app).post('/api/v1/dataset/call_kw/barcode.issue.media/action_issue').send({
      args: {
        barcode: 'SCAN-990011',
        transaction_type: 'return',
      },
    });
    expect(res.status).toBe(200);
    const returnedUnit = store.byId('op.media.unit', barcodeUnit.id);
    expect(returnedUnit?.state).toBe('available');
  });

  it('Module 13: Digital Library — verifies exact live models, 3 menus, digital materials, and learner enrollment lifecycle', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const digitalModels = [
      'op.digital.library.category',
      'op.digital.library.material',
      'op.digital.library.enrollment',
    ];
    for (const m of digitalModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 3 live menus in Digital Library app
    const dLibApp = APPS.find((a) => a.id === 'digital_library');
    expect(dLibApp).toBeDefined();
    expect(dLibApp!.menus.length).toBe(3);
    const labels = dLibApp!.menus.map((m) => m.label);
    expect(labels).toContain('Category');
    expect(labels).toContain('Material');
    expect(labels).toContain('Enrollment');

    // 3. Category & Material creation
    const cat = store.create('op.digital.library.category', {
      name: 'Cambridge A-Level STEM Resources',
      code: 'AL-STEM',
      description: 'Advanced Level past papers, video tutorials, and interactive eBooks',
    });
    expect(cat.id).toBeDefined();

    const mat = store.create('op.digital.library.material', {
      name: 'Cambridge International AS & A Level Mathematics Pure 1 (Coursebook)',
      category_id: cat.id,
      material_type: 'document',
      material_source: 'upload',
      material_edition: '2026 Edition',
      isbn_code: '9781108407144',
      publish_online: true,
      rating: 5,
      material_description: '<p>Complete textbook covering Pure Mathematics 1 syllabus.</p>',
    });
    expect(mat.id).toBeDefined();

    // 4. Learner digital enrollment lifecycle
    const student = store.all('op.student')[0];
    let res = await request(app).post('/api/v1/dataset/call_kw/op.digital.library.material/enroll_learner').send({
      id: mat.id,
      user_id: 1,
      student_id: student.id,
    });
    expect(res.status).toBe(200);
    const enrId = res.body.record.id;
    expect(enrId).toBeDefined();
    expect(res.body.record.state).toBe('in_progress');

    // Complete enrollment
    res = await request(app).post('/api/v1/dataset/call_kw/op.digital.library.enrollment/action_complete').send({ id: enrId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('completed');
    expect(res.body.record.last_access).toBeDefined();

    // Reset enrollment
    res = await request(app).post('/api/v1/dataset/call_kw/op.digital.library.enrollment/action_reset').send({ id: enrId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('in_progress');
  });

  it('Module 14: Transportation — verifies exact live models, 9 menus, route register lifecycle, trips, and transport agreement billing', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const transModels = [
      'op.route.register', 'op.route.line', 'op.transportation.agreement',
      'op.route', 'op.stop', 'op.vehicle', 'cost.plan',
    ];
    for (const m of transModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 9 live menus in Transportation app
    const transApp = APPS.find((a) => a.id === 'transportation');
    expect(transApp).toBeDefined();
    expect(transApp!.menus.length).toBe(9);
    const labels = transApp!.menus.map((m) => m.label);
    expect(labels).toContain('Route Register');
    expect(labels).toContain('Trips');
    expect(labels).toContain('Agreements');
    expect(labels).toContain('Trips Analysis');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Routes');
    expect(labels).toContain('Stops');
    expect(labels).toContain('Vehicles');
    expect(labels).toContain('Plan');

    // 3. Create Vehicle, Cost Plan, Route, and Stop
    const veh = store.create('op.vehicle', {
      name: 'OAN Nyali Bus 02 (KDP 811B)',
      license_plate: 'KDP 811B',
      capacity: 33,
      active: true,
    });
    expect(veh.id).toBeDefined();

    const plan = store.create('cost.plan', {
      name: 'Nyali Zone B Monthly Transport Plan',
      code: 'TR-NY-ZB',
      bill: 1,
      bill_selection: 'months',
      expires_after: 3,
      amount: 16500,
    });
    expect(plan.id).toBeDefined();

    const route = store.create('op.route', {
      name: 'Nyali Cinemax – City Mall – Campus Route',
      op_vehicle_id: veh.id,
      cost: 16500,
      active: true,
    });
    expect(route.id).toBeDefined();

    const stop = store.create('op.stop', {
      sequence: 10,
      name: 'City Mall Nyali Stop',
      route_id: route.id,
      estimated_arrival_conf: 6.5,
      estimated_arrival: '06:30 AM',
      active: true,
    });
    expect(stop.id).toBeDefined();

    // 4. Route Register lifecycle: draft -> confirm -> gathering -> cancel -> draft
    const reg = store.create('op.route.register', {
      name: 'Term 2 Nyali Transport Register',
      route_id: route.id,
      plan_id: plan.id,
      start_date: '2027-01-05',
      end_date: '2027-04-10',
      cost: 16500,
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.route.register/close_register').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.route.register/register_gathering').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('gathering');

    res = await request(app).post('/api/v1/dataset/call_kw/op.route.register/cancel_register').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('cancel');

    res = await request(app).post('/api/v1/dataset/call_kw/op.route.register/set_to_draft').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('draft');

    // 5. Trip lifecycle: draft -> start -> end
    const trip = store.create('op.route.line', {
      name: 'Morning Pickup — Nyali Route',
      route_id: route.id,
      route_type: 'pickup',
      route_date: '2027-01-06',
      start_time: '06:15',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.route.line/start_trip').send({ id: trip.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('start');

    res = await request(app).post('/api/v1/dataset/call_kw/op.route.line/end_trip').send({ id: trip.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('end');

    // 6. Transportation Agreement lifecycle & monthly billing
    const student = store.all('op.student')[0];
    const ag = store.create('op.transportation.agreement', {
      partner_id: student.partner_id || 1,
      student_id: student.id,
      route_register_id: reg.id,
      route_id: route.id,
      stop_id: stop.id,
      plan_id: plan.id,
      monthly_fee: 16500,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.transportation.agreement/submit_form').send({ id: ag.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submit');

    res = await request(app).post('/api/v1/dataset/call_kw/op.transportation.agreement/confirm_in_progress').send({ id: ag.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.transportation.agreement/agreement_confirm').send({ id: ag.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('agreement');

    res = await request(app).post('/api/v1/dataset/call_kw/op.transportation.agreement/enroll_partner').send({ id: ag.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    res = await request(app).post('/api/v1/dataset/call_kw/op.transportation.agreement/invoice_now').send({ id: ag.id });
    expect(res.status).toBe(200);
    expect(res.body.record.invoice_id).toBeDefined();
    const inv = store.byId('account.move', res.body.record.invoice_id);
    expect(inv?.amount_total).toBe(16500);
    expect(inv?.fee_category).toBe('transport');
  });

  it('Module 15: Campus — verifies exact live models, 4 menus, parent/child facilities, and facility allocation invoicing', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const campusModels = ['op.campus.facility', 'op.facility.allocation', 'op.facility.type'];
    for (const m of campusModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 4 live menus in Campus app
    const campusApp = APPS.find((a) => a.id === 'campus');
    expect(campusApp).toBeDefined();
    expect(campusApp!.menus.length).toBe(4);
    const labels = campusApp!.menus.map((m) => m.label);
    expect(labels).toContain('Facility');
    expect(labels).toContain('Facility Allocations');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Facility Type');

    // 3. Create Facility Type, Parent Facility, and Child Sub-Facility
    const fType = store.create('op.facility.type', {
      name: 'STEM & Science Laboratories',
      code: 'STEM-LAB',
      active: true,
    });
    expect(fType.id).toBeDefined();

    const parentFac = store.create('op.campus.facility', {
      name: 'Parklands Science Wing',
      code: 'FAC-SCI-W1',
      facility_type_id: fType.id,
      capacity: 150,
      active: true,
    });
    expect(parentFac.id).toBeDefined();

    const childFac = store.create('op.campus.facility', {
      name: 'A-Level Robotics & Mechatronics Lab',
      code: 'FAC-ROB-01',
      facility_type_id: fType.id,
      parent_id: parentFac.id,
      capacity: 30,
      active: true,
    });
    expect(childFac.id).toBeDefined();

    // 4. Create Facility Allocation and generate Invoice
    const partner = store.all('res.partner')[0];
    const alloc = store.create('op.facility.allocation', {
      partner_id: partner.id,
      facility_id: childFac.id,
      product_name: 'Weekend Robotics Club Facility Booking',
      fee_amount: 12000,
      from_date: '2026-11-20 09:00:00',
      to_date: '2026-11-20 15:00:00',
    });

    const res = await request(app).post('/api/v1/dataset/call_kw/op.facility.allocation/create_invoice').send({ id: alloc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.invoice_id).toBeDefined();
    const inv = store.byId('account.move', res.body.record.invoice_id);
    expect(inv?.amount_total).toBe(12000);
    expect(inv?.fee_category).toBe('facility');
  });

  it('Module 16: Settings & Integrations — verifies live menus, users, roles, board affiliations, payment providers & system settings', async () => {
    // 1. Verify exact OpenEduCat 19 Settings models exist
    const settingsModels = [
      'res.config.settings', 'res.users', 'res.company', 'res.users.role',
      'op.board.affiliation', 'payment.provider', 'payment.transaction', 'ir.cron',
    ];
    for (const m of settingsModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify live menus in Settings app
    const settingsApp = APPS.find((a) => a.id === 'settings');
    expect(settingsApp).toBeDefined();
    const labels = settingsApp!.menus.map((m) => m.label);
    expect(labels).toContain('General Settings');
    expect(labels).toContain('Users');
    expect(labels).toContain('Companies');
    expect(labels).toContain('Roles');
    expect(labels).toContain('Board Affiliation');

    // 3. Verify Board Affiliations & User Roles
    const boards = store.all('op.board.affiliation');
    expect(boards.length).toBeGreaterThanOrEqual(2);

    const roles = store.all('res.users.role');
    expect(roles.length).toBeGreaterThanOrEqual(3);

    // 4. Read and update General Settings via REST API
    const getRes = await request(app).get('/api/v1/settings');
    expect(getRes.status).toBe(200);
    expect(getRes.body.settings).toBeDefined();

    const postRes = await request(app).post('/api/v1/settings').send({
      library_fine_per_day: 50,
      etims_enabled: true,
      mpesa_env: 'simulate',
    });
    expect(postRes.status).toBe(200);
    expect(postRes.body.settings.library_fine_per_day).toBe(50);
    expect(postRes.body.settings.etims_enabled).toBe(true);
  });

  it('Module 17: Thesis — verifies exact live models, 8 menus, registration lifecycle, progress reports, extension approvals & evaluation', async () => {
    // 1. Verify exact OpenEduCat 19 Thesis models exist
    const thesisModels = [
      'op.thesis.registration', 'op.thesis.progress', 'op.thesis.extension',
      'op.thesis.submission', 'op.thesis.committee', 'op.thesis.evaluation.template',
      'op.thesis.extension.reason', 'op.thesis.report.type',
    ];
    for (const m of thesisModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 8 live menus in Thesis app
    const thesisApp = APPS.find((a) => a.id === 'thesis');
    expect(thesisApp).toBeDefined();
    expect(thesisApp!.menus.length).toBe(8);
    const labels = thesisApp!.menus.map((m) => m.label);
    expect(labels).toContain('Registrations');
    expect(labels).toContain('Progress Reports');
    expect(labels).toContain('Extension Requests');
    expect(labels).toContain('Submissions');
    expect(labels).toContain('Committee Members');
    expect(labels).toContain('Evaluation Templates');
    expect(labels).toContain('Extension Reasons');
    expect(labels).toContain('Report Types');

    // 3. Thesis Registration lifecycle: draft -> submitted -> approved -> in_progress -> completed
    const student = store.all('op.student')[0];
    const faculty = store.all('op.faculty')[0];
    const reg = store.create('op.thesis.registration', {
      name: 'Extended Project Qualification: Machine Learning in Precision Agriculture',
      student_id: student.id,
      supervisor_id: faculty.id,
      research_area: 'Artificial Intelligence & Agritech',
      final_submission_deadline: '2027-03-01',
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.registration/action_submit').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submitted');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.registration/action_approve').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.registration/action_start').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('in_progress');

    // 4. Progress Report & Supervisor Feedback
    const repType = store.create('op.thesis.report.type', { name: 'Mid-Term Milestone Review', code: 'MTR-01' });
    const prog = store.create('op.thesis.progress', {
      name: 'Chapter 1-2 Literature & Methodology Progress',
      registration_id: reg.id,
      student_id: student.id,
      report_id: repType.id,
      report_content: 'Completed sensor calibration and dataset collection.',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.progress/action_submit').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submitted');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.progress/action_provide_feedback').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.feedback_date).toBeDefined();

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.progress/action_approve').send({ id: prog.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    // 5. Extension Request multi-tier approval (draft -> supervisor_review -> hod_review -> approved)
    const extReason = store.create('op.thesis.extension.reason', { name: 'Laboratory Equipment Calibration Delay', code: 'LAB-DLY' });
    const ext = store.create('op.thesis.extension', {
      registration_id: reg.id,
      student_id: student.id,
      reason_id: extReason.id,
      requested_deadline: '2027-03-15',
      extension_duration: 14,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.extension/action_submit').send({ id: ext.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('supervisor_review');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.extension/action_supervisor_approve').send({ id: ext.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('hod_review');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.extension/action_hod_approve').send({ id: ext.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');
    expect(store.byId('op.thesis.registration', reg.id)?.final_submission_deadline).toBe('2027-03-15');

    // 6. Submit Thesis & Complete Evaluation
    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.registration/action_submit_thesis').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('completed');

    const sub = store.all('op.thesis.submission').find((s) => Number(s.registration_id) === reg.id)!;
    expect(sub).toBeDefined();

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.submission/action_start_review').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('under_review');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.submission/action_approve').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.submission/action_submit_evaluation').send({ id: sub.id, args: { total_score: 92 } });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('evaluated');
    expect(res.body.record.total_score).toBe(92);

    res = await request(app).post('/api/v1/dataset/call_kw/op.thesis.submission/action_complete').send({ id: sub.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('completed');
  });

  it('Module 18: OMR — verifies exact live models, 5 menus, answer key configuration, and optical sheet scanning', async () => {
    // 1. Verify exact OpenEduCat 19 OMR models exist
    const omrModels = [
      'op.omr.exam', 'op.answer.sheets', 'op.answersheet.configuration', 'op.omr.template.wizard',
    ];
    for (const m of omrModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 5 live menus in OMR app
    const omrApp = APPS.find((a) => a.id === 'omr');
    expect(omrApp).toBeDefined();
    expect(omrApp!.menus.length).toBe(5);
    const labels = omrApp!.menus.map((m) => m.label);
    expect(labels).toContain('Exam');
    expect(labels).toContain('Generate Sheet');
    expect(labels).toContain('Answer Sheets');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Answer Sheet');

    // 3. Create OMR Answer Key Configuration & OMR Exam
    const subj = store.all('op.subject')[0];
    const cfg = store.create('op.answersheet.configuration', {
      name: 'CAIE Chemistry 0620 Paper 2 MCQ 40-Q Key',
      subject_id: subj.id,
      question_count: 40,
      options_count: 4,
    });

    const exam = store.create('op.omr.exam', {
      name: 'IGCSE Chemistry Paper 2 Mock OMR',
      subject_id: subj.id,
      answersheet_config_id: cfg.id,
      answersheet_configuration_id: cfg.id,
      scanned_count: 0,
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.omr.exam/action_confirm_progressbar').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.omr.exam/scan').send({ id: exam.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');
    expect(res.body.record.scanned_count).toBe(25);
    expect(res.body.record.answersheet_count).toBeGreaterThanOrEqual(1);
  });

  it('Module 19: Events — verifies exact live models, 10 menus, event lifecycle, registration desk check-in & badge emails', async () => {
    // 1. Verify exact OpenEduCat 19 Events models exist
    const eventModels = [
      'event.event', 'event.registration', 'event.type', 'event.stage',
      'event.tag.category', 'event.question', 'event.lead.rule',
    ];
    for (const m of eventModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 10 live menus in Events app
    const eventsApp = APPS.find((a) => a.id === 'events');
    expect(eventsApp).toBeDefined();
    expect(eventsApp!.menus.length).toBe(10);
    const labels = eventsApp!.menus.map((m) => m.label);
    expect(labels).toContain('Events');
    expect(labels).toContain('Registration Desk');
    expect(labels).toContain('Attendees');
    expect(labels).toContain('Revenues');
    expect(labels).toContain('Settings');
    expect(labels).toContain('Event Templates');
    expect(labels).toContain('Event Stages');
    expect(labels).toContain('Event Tags Categories');
    expect(labels).toContain('Event Questions');
    expect(labels).toContain('Lead Generation');

    // 3. Create Event Template, Stage, Event, and Attendee Registration
    const evType = store.create('event.type', { name: 'Inter-School STEM Symposium', seats_max: 100 });
    const evStage = store.create('event.stage', { name: 'Announced & Open', sequence: 20 });
    const ev = store.create('event.event', {
      name: 'Oshwal Annual Robotics & AI Expo 2027',
      event_category: 'academic',
      event_type_id: evType.id,
      stage_id: evStage.id,
      seats_max: 100,
      seats_taken: 0,
      stage: 'booked',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/event.event/announce').send({ id: ev.id });
    expect(res.status).toBe(200);
    expect(res.body.record.stage).toBe('announced');

    const reg = store.create('event.registration', {
      event_id: ev.id,
      name: 'Aarav Patel',
      email: 'aarav.patel@student.oshwal.ac.ke',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/event.registration/action_confirm').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('open');

    res = await request(app).post('/api/v1/dataset/call_kw/event.registration/action_set_done').send({ id: reg.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');
    expect(store.byId('event.event', ev.id)?.seats_taken).toBe(1);

    res = await request(app).post('/api/v1/dataset/call_kw/event.registration/action_send_badge_email').send({ id: reg.id });
    expect(res.status).toBe(200);
  });

  it('Modules 20, 21 & 22: Placements, Alumni & Job — verifies exact live models, 17 menus, announcements, applications, offers & alumni forums', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const pajModels = [
      'op.activity.announcement', 'op.job.applicant', 'op.placement.offer',
      'op.placement.cell', 'training.season', 'op.alumni.group',
      'op.job.post', 'op.job.type', 'job.post.stage',
    ];
    for (const m of pajModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 10 live menus in Placements app
    const placeApp = APPS.find((a) => a.id === 'placements');
    expect(placeApp).toBeDefined();
    expect(placeApp!.menus.length).toBe(10);
    expect(placeApp!.menus.map((m) => m.label)).toEqual([
      'Job Opportunities', 'Student Applications', 'Placement Offers', 'Campus Events',
      'Coordination Teams', 'Partner Companies', 'Recruitment Sessions',
      'Event Templates', 'Event Stages', 'Event Tages',
    ]);

    // 3. Verify all 3 live menus in Alumni app
    const alumniApp = APPS.find((a) => a.id === 'alumni');
    expect(alumniApp).toBeDefined();
    expect(alumniApp!.menus.length).toBe(3);
    expect(alumniApp!.menus.map((m) => m.label)).toEqual([
      'Alumni Group', 'Alumni Job', 'Settings',
    ]);

    // 4. Verify all 4 live menus in Job app
    const jobApp = APPS.find((a) => a.id === 'job');
    expect(jobApp).toBeDefined();
    expect(jobApp!.menus.length).toBe(4);
    expect(jobApp!.menus.map((m) => m.label)).toEqual([
      'Job Post', 'Applicant', 'Job Type', 'Stages',
    ]);

    // 5. Activity Announcement lifecycle: draft -> confirm -> published -> unpublished
    const partner = store.all('res.partner')[0];
    const student = store.all('op.student')[0];
    const ann = store.create('op.activity.announcement', {
      name: 'UCAS & Russell Group University Placement Drive 2027',
      partner_id: partner.id,
      opportunity_type: 'university',
      start_date: '2027-02-01',
      end_date: '2027-03-15',
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/op.activity.announcement/set_confirm').send({ id: ann.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('confirm');

    res = await request(app).post('/api/v1/dataset/call_kw/op.activity.announcement/set_published').send({ id: ann.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('published');

    // 6. Job Post & Student Application -> Offer -> Placement Join
    const post = store.create('op.job.post', {
      name: 'FinTech Data Engineering Intern',
      job_post: 'Junior Data Engineer',
      employment_type: 'internship',
      salary_from: 80000,
      salary_upto: 120000,
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.job.post/set_review').send({ id: post.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('review');

    res = await request(app).post('/api/v1/dataset/call_kw/op.job.post/set_submit').send({ id: post.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submit');

    const applicant = store.create('op.job.applicant', {
      name: 'Rohan Shah',
      job_post_id: post.id,
      post_id: post.id,
      activity_id: ann.id,
      student_id: student.id,
      email: 'rohan.shah@student.oshwal.ac.ke',
      salary_expected: 100000,
      salary_proposed: 110000,
      state: 'applied',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.job.applicant/shortlist').send({ id: applicant.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('shortlisted');

    res = await request(app).post('/api/v1/dataset/call_kw/op.job.applicant/action_offer').send({ id: applicant.id });
    expect(res.status).toBe(200);
    expect(res.body.record.is_offer).toBe(true);
    expect(res.body.record.state).toBe('contract_proposal');

    const offer = store.all('op.placement.offer').find((o) => Number(o.student_id) === student.id)!;
    expect(offer).toBeDefined();

    res = await request(app).post('/api/v1/dataset/call_kw/op.placement.offer/placement_join').send({ id: offer.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('join');

    // 7. Alumni Group Forum Creation
    const alu = store.create('op.alumni.group', {
      name: 'Oshwal Senior High Class of 2026 Alumni',
      graduation_year: 2026,
      alumni_fees_amount: 5000,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/op.alumni.group/createforum').send({ id: alu.id });
    expect(res.status).toBe(200);
    expect(res.body.record.forum_id).toContain('FORUM-ALU-');
  });

  it('Modules 23 & 24: Job Queue & OnBoarding — verifies exact live models, menus, job requeue/done/cancel & onboarding steps', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    for (const m of ['queue.job', 'queue.job.channel', 'queue.job.function', 'oe.onboarding.steps']) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 3 live menus in Job Queue app
    const qApp = APPS.find((a) => a.id === 'queue_job');
    expect(qApp).toBeDefined();
    expect(qApp!.menus.length).toBe(3);
    expect(qApp!.menus.map((m) => m.label)).toEqual(['Jobs', 'Channels', 'Job Functions']);

    // 3. Verify OnBoarding app
    const obApp = APPS.find((a) => a.id === 'onboarding');
    expect(obApp).toBeDefined();
    expect(obApp!.menus.length).toBe(1);

    // 4. Job Queue lifecycle: failed -> pending (requeue) -> done (button_done)
    const ch = store.create('queue.job.channel', { name: 'root.grading', capacity: 4 });
    const fn = store.create('queue.job.function', { name: 'op.omr.exam.scan_batch', channel_id: ch.id });
    const job = store.create('queue.job', {
      name: 'OMR Batch Scan #101',
      channel: 'root.grading',
      job_function_id: fn.id,
      state: 'failed',
      exc_name: 'TimeoutError',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/queue.job/requeue').send({ id: job.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('pending');

    res = await request(app).post('/api/v1/dataset/call_kw/queue.job/button_done').send({ id: job.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // 5. OnBoarding step completion
    const step = store.create('oe.onboarding.steps', {
      sequence: 10,
      name: 'Configure Academic Year & Terms',
      step_name: 'Configure Academic Year & Terms',
      target_model: 'op.academic.year',
      is_start: true,
      is_done: false,
      completed: false,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/oe.onboarding.steps/step_done').send({ id: step.id });
    expect(res.status).toBe(200);
    expect(res.body.record.is_done).toBe(true);
    expect(res.body.record.completed).toBe(true);
  });

  it('Modules 25, 26 & 27: Human Resources, Recruitment & Time Off — verifies exact live models, 46 menus, hiring flow & leave approvals', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const hrModels = [
      'hr.employee', 'hr.department', 'hr.employee.skill', 'hr.resume.line',
      'hr.work.location', 'resource.calendar', 'hr.departure.reason', 'hr.skill.type',
      'hr.job', 'hr.version', 'hr.contract.type', 'gamification.badge',
      'gamification.challenge', 'gamification.goal', 'hr.talent.pool',
      'hr.applicant', 'hr.recruitment.degree', 'hr.applicant.refuse.reason',
      'hr.applicant.category', 'mail.activity.type', 'mail.activity.plan', 'hr.job.platform',
      'hr.leave', 'hr.leave.allocation', 'hr.leave.type', 'hr.leave.accrual.plan',
      'resource.calendar.leaves', 'hr.leave.mandatory.day',
    ];
    for (const m of hrModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify all 19 live menus in Human Resources app
    const hrApp = APPS.find((a) => a.id === 'hr');
    expect(hrApp).toBeDefined();
    expect(hrApp!.menus.length).toBe(19);

    // 3. Verify all 14 live menus in Recruitment app
    const recApp = APPS.find((a) => a.id === 'recruitment');
    expect(recApp).toBeDefined();
    expect(recApp!.menus.length).toBe(14);

    // 4. Verify all 13 live menus in Time Off app
    const leaveApp = APPS.find((a) => a.id === 'time_off');
    expect(leaveApp).toBeDefined();
    expect(leaveApp!.menus.length).toBe(13);

    // 5. Recruitment Applicant -> Hire & Create Employee
    const dept = store.all('hr.department')[0];
    const job = store.create('hr.job', {
      name: 'Senior Physics & Robotics Teacher',
      department_id: dept.id,
      no_of_recruitment: 1,
    });
    const applicant = store.create('hr.applicant', {
      name: 'Senior Physics Application',
      partner_name: 'Dr. Grace Wanjiku',
      email_from: 'grace.wanjiku@academic.ke',
      job_id: job.id,
      police_clearance_verified: true,
      stage: 'offer',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/hr.applicant/hire').send({ id: applicant.id });
    expect(res.status).toBe(200);
    expect(res.body.record.stage).toBe('hired');

    const hiredEmp = store.all('hr.employee').find((e) => e.name === 'Dr. Grace Wanjiku')!;
    expect(hiredEmp).toBeDefined();

    // 6. Time Off Allocation & Time Off Request lifecycle: confirm -> validate1 -> validate
    const lType = store.all('hr.leave.type')[0];
    const alloc = store.create('hr.leave.allocation', {
      name: 'Annual Leave Allocation 2027',
      employee_id: hiredEmp.id,
      holiday_status_id: lType.id,
      number_of_days: 21,
      state: 'confirm',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/hr.leave.allocation/action_approve').send({ id: alloc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('validate');

    const leave = store.create('hr.leave', {
      name: 'Academic Conference Attendance',
      employee_id: hiredEmp.id,
      holiday_status_id: lType.id,
      date_from: '2027-02-10',
      date_to: '2027-02-12',
      duration_days: 3,
      state: 'confirm',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/hr.leave/action_approve').send({ id: leave.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('validate1');

    res = await request(app).post('/api/v1/dataset/call_kw/hr.leave/action_validate').send({ id: leave.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('validate');
  });

  it('Modules 28, 29 & 30: Expenses, Approvals & Fleet — verifies exact live models, 20 menus, expense accounting post, multi-approval & fleet odometer/driver flows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const eafModels = [
      'hr.expense', 'hr.expense.category', 'multi.approval.type', 'multi.request',
      'fleet.vehicle', 'fleet.vehicle.log.contract', 'fleet.vehicle.log.services',
      'fleet.vehicle.odometer', 'fleet.vehicle.model.brand', 'fleet.vehicle.model',
      'fleet.vehicle.model.category',
    ];
    for (const m of eafModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify menus in Expenses (5), Approvals (5), and Fleet (10)
    expect(APPS.find((a) => a.id === 'expenses')!.menus.length).toBe(5);
    expect(APPS.find((a) => a.id === 'approvals')!.menus.length).toBe(5);
    expect(APPS.find((a) => a.id === 'fleet')!.menus.length).toBe(10);

    // 3. Expense lifecycle: draft -> submitted -> approved -> posted (creates account.move)
    const emp = store.all('hr.employee')[0];
    const exp = store.create('hr.expense', {
      name: 'Science Lab Reagents & Glassware Reimbursement',
      employee_id: emp.id,
      total_amount: 14500,
      state: 'draft',
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/hr.expense/action_submit').send({ id: exp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('submitted');

    res = await request(app).post('/api/v1/dataset/call_kw/hr.expense/action_approve').send({ id: exp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    res = await request(app).post('/api/v1/dataset/call_kw/hr.expense/action_post').send({ id: exp.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('posted');
    expect(res.body.record.account_move_id).toBeDefined();

    // 4. Multi-Approval Type & Request lifecycle: draft -> pending -> approved
    const aType = store.create('multi.approval.type', {
      name: 'CapEx STEM Equipment Requisition',
      approval_minimum: 2,
    });

    res = await request(app).post('/api/v1/dataset/call_kw/multi.approval.type/create_request').send({ id: aType.id });
    expect(res.status).toBe(200);
    const reqId = res.body.record.id;

    res = await request(app).post('/api/v1/dataset/call_kw/multi.request/action_confirm').send({ id: reqId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('pending');
    expect(res.body.record.date_confirmed).toBeDefined();

    res = await request(app).post('/api/v1/dataset/call_kw/multi.request/action_approve').send({ id: reqId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    // 5. Fleet Vehicle Odometer & Driver Handover
    const partner = store.all('res.partner')[0];
    const veh = store.all('fleet.vehicle')[0];
    store.write('fleet.vehicle', veh.id, { future_driver_id: partner.id });

    res = await request(app).post('/api/v1/dataset/call_kw/fleet.vehicle/action_accept_driver_change').send({ id: veh.id });
    expect(res.status).toBe(200);
    expect(res.body.record.driver_id).toBe(partner.id);

    const odo = store.create('fleet.vehicle.odometer', {
      vehicle_id: veh.id,
      value: 45200,
      unit: 'km',
    });
    expect(odo.id).toBeDefined();
  });

  it('Modules 31, 32, 33 & 34: Sales, Purchase, Inventory & CRM — verifies exact live models, 70 menus, order-to-invoice, PO-to-receipt, transfer validation, scrap & CRM lead conversion', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const commModels = [
      'sale.order', 'sale.order.line', 'crm.team', 'product.template', 'product.product',
      'product.pricelist', 'sale.report', 'sale.order.template', 'quotation.document',
      'delivery.carrier', 'crm.tag', 'product.attribute', 'product.combo', 'product.category',
      'product.tag', 'payment.provider', 'payment.method', 'purchase.order', 'purchase.order.line',
      'purchase.report', 'product.supplierinfo', 'stock.picking.type', 'stock.picking',
      'stock.scrap', 'stock.lot', 'stock.move.line', 'stock.move', 'stock.warehouse',
      'stock.warehouse.orderpoint', 'crm.lead', 'crm.lost.reason', 'crm.iap.lead.mining.request',
      'crm.activity.report',
    ];
    for (const m of commModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify menus in Sales (26), Purchase (10), Inventory (18), and CRM (16)
    expect(APPS.find((a) => a.id === 'sales')!.menus.length).toBe(26);
    expect(APPS.find((a) => a.id === 'purchase')!.menus.length).toBe(10);
    expect(APPS.find((a) => a.id === 'inventory')!.menus.length).toBe(18);
    expect(APPS.find((a) => a.id === 'crm')!.menus.length).toBe(16);

    const partner = store.all('res.partner')[0];
    const prod = store.all('product.template')[0];

    // 3. Sales Order lifecycle: draft -> action_confirm -> create_invoice
    const so = store.create('sale.order', {
      partner_id: partner.id,
      amount_total: 11600,
      order_summary: '2x Oshwal Academy Blazer',
      state: 'draft',
    });
    store.create('sale.order.line', {
      order_id: so.id,
      product_id: prod.id,
      name: prod.name,
      product_uom_qty: 2,
      price_unit: 5800,
      price_subtotal: 11600,
    });

    let res = await request(app).post('/api/v1/dataset/call_kw/sale.order/action_confirm').send({ id: so.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('sale');

    res = await request(app).post('/api/v1/dataset/call_kw/sale.order/create_invoice').send({ id: so.id });
    expect(res.status).toBe(200);
    expect(res.body.record.invoice_status).toBe('invoiced');
    expect(res.body.record.invoice_count).toBe(1);

    // 4. Purchase Order lifecycle: draft -> button_confirm -> action_view_picking -> stock.picking button_validate
    const po = store.create('purchase.order', {
      partner_id: partner.id,
      amount_total: 195000,
      order_summary: '50x IGCSE Physics Textbooks',
      state: 'draft',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/purchase.order/button_confirm').send({ id: po.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('purchase');

    res = await request(app).post('/api/v1/dataset/call_kw/purchase.order/action_view_picking').send({ id: po.id });
    expect(res.status).toBe(200);

    const pick = store.all('stock.picking').find((p) => p.origin === po.name)!;
    expect(pick).toBeDefined();

    res = await request(app).post('/api/v1/dataset/call_kw/stock.picking/button_validate').send({ id: pick.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // 5. Stock Scrap validation & Replenishment orderpoint
    const scrap = store.create('stock.scrap', {
      product_id: prod.id,
      scrap_qty: 3,
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/stock.scrap/action_validate').send({ id: scrap.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    const op = store.all('stock.warehouse.orderpoint')[0];
    res = await request(app).post('/api/v1/dataset/call_kw/stock.warehouse.orderpoint/action_replenish').send({ id: op.id });
    expect(res.status).toBe(200);

    // 6. CRM Lead -> New Quotation & Convert To Student
    const lead = store.create('crm.lead', {
      name: 'Year 10 IGCSE Mid-Year Transfer Inquiry',
      contact_name: 'Mrs. Priya Desai',
      email_from: 'priya.desai@example.com',
      phone: '+254722111333',
      expected_revenue: 320000,
      stage: 'qualified',
    });

    res = await request(app).post('/api/v1/dataset/call_kw/crm.lead/action_sale_quotations_new').send({ id: lead.id });
    expect(res.status).toBe(200);
    expect(res.body.record.quotation_count).toBe(1);

    res = await request(app).post('/api/v1/dataset/call_kw/crm.lead/convert_to_student').send({ id: lead.id });
    expect(res.status).toBe(200);
    expect(res.body.record.stage).toBe('won');
  });

  it('Modules 35–42: Website, Email Marketing, Whatsapp, Live Chat, Surveys, Contacts, Discuss & Notice Board — verifies exact live models, 99 menus & broadcast workflows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const commsModels = [
      'website.page', 'blog.post', 'blog.blog', 'blog.tag', 'blog.tag.category',
      'forum.post', 'forum.forum', 'gamification.karma.rank', 'forum.tag', 'forum.post.reason',
      'website.technical.page', 'product.public.category', 'product.ribbon', 'website.visitor',
      'website.track', 'mailing.mailing', 'mailing.list', 'mailing.contact', 'mailing.trace.report',
      'mailing.subscription', 'link.tracker', 'mail.blacklist', 'mailing.subscription.optout',
      'mailing.filter', 'whatsapp.campaign', 'whatsapp.contact', 'whatsapp.activity.trace',
      'whatsapp.campaign.participants', 'whatsapp.business', 'whatsapp.template', 'whatsapp.tag',
      'whatsapp.template.library', 'whatsapp.server.action', 'whatsapp.team.assignment',
      'im_livechat.channel', 'im_livechat.channel.member.history', 'im_livechat.report.channel',
      'mail.canned.response', 'chatbot.script', 'im_livechat.expertise', 'im_livechat.conversation.tag',
      'survey.survey', 'survey.user_input', 'survey.question', 'survey.question.answer',
      'survey.user_input.line', 'res.partner', 'res.partner.category', 'res.partner.title',
      'res.partner.industry', 'res.country', 'res.country.state', 'res.country.group',
      'res.bank', 'res.partner.bank', 'discuss.channel', 'res.role', 'op.notice',
      'op.circular', 'op.notice.group', 'op.circular.type',
    ];
    for (const m of commsModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify menus count across Website (42), Email Marketing (10), Whatsapp (12), Live Chat (10), Surveys (5), Contacts (9), Discuss (6), Notice Board (5)
    expect(APPS.find((a) => a.id === 'website')!.menus.length).toBe(42);
    expect(APPS.find((a) => a.id === 'email_marketing')!.menus.length).toBe(10);
    expect(APPS.find((a) => a.id === 'whatsapp')!.menus.length).toBe(12);
    expect(APPS.find((a) => a.id === 'livechat')!.menus.length).toBe(10);
    expect(APPS.find((a) => a.id === 'surveys')!.menus.length).toBe(5);
    expect(APPS.find((a) => a.id === 'contacts')!.menus.length).toBe(9);
    expect(APPS.find((a) => a.id === 'discuss')!.menus.length).toBe(6);
    expect(APPS.find((a) => a.id === 'notice_board')!.menus.length).toBe(5);

    // 3. Email Marketing launch flow
    const mail = store.create('mailing.mailing', {
      subject: 'Term 2 2027 Fee Schedule & Transport Registration Open',
      target_audience: 'All Enrolled Parents',
      state: 'draft',
    });
    let res = await request(app).post('/api/v1/dataset/call_kw/mailing.mailing/action_launch').send({ id: mail.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('done');

    // 4. WhatsApp Campaign start & generate participants
    const wc = store.create('whatsapp.campaign', {
      name: 'IGCSE Mock Exam Parent Alert',
      message_preview: 'Reminder: IGCSE Mock Exams begin Monday at 08:00 AM.',
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/whatsapp.campaign/action_start_campaign').send({ id: wc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('running');

    res = await request(app).post('/api/v1/dataset/call_kw/whatsapp.campaign/generate_campaign_participants').send({ id: wc.id });
    expect(res.status).toBe(200);
    expect(res.body.record.total_participant_count).toBeGreaterThan(0);

    // 5. Notice Board lifecycle: draft -> action_to_in_progress -> action_to_publish
    const notice = store.create('op.notice', {
      name: 'Inter-House Swimming Gala Notice',
      subject: 'Primary & Junior High Swimming Gala',
      description: '<p>All houses assemble at 08:30 AM.</p>',
      state: 'draft',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/op.notice/action_to_in_progress').send({ id: notice.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('in_progress');

    res = await request(app).post('/api/v1/dataset/call_kw/op.notice/action_to_publish').send({ id: notice.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('published');
  });

  it('Modules 43–53: Dashboards, KPI Dashboard, Calendar, Documents, E-Sign, Automated Marketing, Multi Campus, Spreadsheets, Apps, AIO & Helpdesk — verifies exact live models, 73 menus & workflows', async () => {
    // 1. Verify exact OpenEduCat 19 models exist
    const sysModels = [
      'board.board', 'spreadsheet.dashboard.group', 'dashboard_pro.main_dashboard',
      'calendar.event', 'calendar.online.appointment', 'calendar.appointment.resource',
      'dms.file', 'dms.directory', 'dms.tag', 'dms.category', 'dms.storage', 'dms.access.group',
      'e.sign.template', 'e.sign.request', 'e.sign.items', 'e.sign.item.role',
      'marketing.campaign', 'marketing.trace', 'marketing.participant',
      'spreadsheet.spreadsheet', 'ir.module.module',
      'aio.playground.message', 'aio.playground.session', 'aio.session.tag',
      'aio.session.analytics', 'aio.agent.analytics', 'aio.cost.optimizer',
      'aio.engagement.metrics', 'aio.token.trend.analyzer', 'aio.agent.library',
      'aio.agent', 'aio.team.analytics', 'aio.agent.execution', 'aio.model.provider',
      'aio.model', 'aio.workflow', 'aio.workflow.execution', 'aio.workflow.step',
      'aio.hook', 'aio.hook.log', 'aio.tool', 'aio.collection', 'aio.webhook.endpoint',
      'aio.database.config', 'aio.guardrail', 'aio.file.source', 'aio.json.schema',
      'aio.output.template', 'aio.agent.evaluation', 'aio.agent.approval',
      'helpdesk.team', 'helpdesk.ticket', 'helpdesk.report', 'rating.rating',
      'issue.type', 'helpdesk.tag', 'helpdesk.stage',
    ];
    for (const m of sysModels) {
      expect(MODEL_MAP[m], `Missing model ${m}`).toBeDefined();
    }

    // 2. Verify menus count across Dashboards (3), KPI Dashboard (4), Calendar (4), Documents (8), E-sign (4), Automated Marketing (4), Multi Campus (1), Spreadsheets (1), Apps (3), AIO (30), Helpdesk (10)
    expect(APPS.find((a) => a.id === 'dashboards')!.menus.length).toBe(3);
    expect(APPS.find((a) => a.id === 'kpi_dashboard')!.menus.length).toBe(4);
    expect(APPS.find((a) => a.id === 'calendar')!.menus.length).toBe(4);
    expect(APPS.find((a) => a.id === 'documents')!.menus.length).toBe(8);
    expect(APPS.find((a) => a.id === 'esign')!.menus.length).toBe(4);
    expect(APPS.find((a) => a.id === 'automated_marketing')!.menus.length).toBe(4);
    expect(APPS.find((a) => a.id === 'multi_campus')!.menus.length).toBe(1);
    expect(APPS.find((a) => a.id === 'spreadsheets')!.menus.length).toBe(1);
    expect(APPS.find((a) => a.id === 'apps')!.menus.length).toBe(3);
    expect(APPS.find((a) => a.id === 'aio')!.menus.length).toBe(30);
    expect(APPS.find((a) => a.id === 'helpdesk')!.menus.length).toBe(10);

    // 3. Calendar Event meeting link generation
    const ev = store.create('calendar.event', {
      name: 'Year 11 Parent-Teacher Consultation',
      start_date: '2027-02-15 09:00:00',
      stop_date: '2027-02-15 10:00:00',
    });
    let res = await request(app).post('/api/v1/dataset/call_kw/calendar.event/generate_meeting_link').send({ id: ev.id });
    expect(res.status).toBe(200);
    expect(res.body.record.meeting_url).toContain('https://meet.google.com/');

    // 4. E-Sign template -> create_request -> sign_now
    const tpl = store.all('e.sign.template')[0];
    res = await request(app).post('/api/v1/dataset/call_kw/e.sign.template/create_request').send({ id: tpl.id });
    expect(res.status).toBe(200);
    const reqId = res.body.record.id;

    res = await request(app).post('/api/v1/dataset/call_kw/e.sign.request/sign_now').send({ id: reqId });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('signed');

    // 5. AIO Tool Approval lifecycle
    const approval = store.create('aio.agent.approval', {
      name: 'Approve Transcript Export Tool Call',
      state: 'pending',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/aio.agent.approval/action_approve').send({ id: approval.id });
    expect(res.status).toBe(200);
    expect(res.body.record.state).toBe('approved');

    // 6. Helpdesk Ticket: action_assign_to_me -> action_create_opportunity -> solve
    const tkt = store.create('helpdesk.ticket', {
      issue_name: 'Projector HDMI Signal Issue in Junior High Lab 3',
      help_description: 'Requires cable replacement before Period 3.',
      stage: 'new',
    });
    res = await request(app).post('/api/v1/dataset/call_kw/helpdesk.ticket/action_assign_to_me').send({ id: tkt.id });
    expect(res.status).toBe(200);
    expect(res.body.record.stage).toBe('in_progress');

    res = await request(app).post('/api/v1/dataset/call_kw/helpdesk.ticket/action_create_opportunity').send({ id: tkt.id });
    expect(res.status).toBe(200);

    res = await request(app).post('/api/v1/dataset/call_kw/helpdesk.ticket/solve').send({ id: tkt.id });
    expect(res.status).toBe(200);
    expect(res.body.record.stage).toBe('done');
  });

  it('End-to-End Workflows: onchange auto-fill, inline O2M web_save, Multi-Role Portal RBAC, LMS progress tracking, Integration testers & AI Generators', async () => {
    const admin = await request(app).post('/api/v1/auth/demo-login').send({ role: 'admin' });
    const faculty = await request(app).post('/api/v1/auth/demo-login').send({ role: 'faculty' });
    const stu = await request(app).post('/api/v1/auth/demo-login').send({ role: 'student' });

    const adminHdr = { 'X-User-Id': String(admin.body.user.id) };
    const facHdr = { 'X-User-Id': String(faculty.body.user.id) };
    const stuHdr = { 'X-User-Id': String(stu.body.user.id) };

    // 1. onchange RPC on op.admission and account.move
    const reg = store.all('op.admission.register')[0];
    let res = await request(app)
      .post('/api/v1/dataset/call_kw/op.admission/onchange')
      .set(adminHdr)
      .send({ vals: { register_id: reg.id } });
    expect(res.status).toBe(200);
    expect(res.body.value.course_id).toBe(reg.course_id);
    expect(res.body.value.fees).toBe(reg.fees);

    const firstStudent = store.all('op.student')[0];
    res = await request(app)
      .post('/api/v1/dataset/call_kw/account.move/onchange')
      .set(adminHdr)
      .send({ vals: { student_id: firstStudent.id } });
    expect(res.status).toBe(200);
    expect(res.body.value.company_id).toBe(firstStudent.company_id);

    // 2. Inline one2many child line creation in single web_save
    res = await request(app)
      .post('/api/v1/dataset/call_kw/account.move/web_save')
      .set(adminHdr)
      .send({
        vals: {
          student_id: firstStudent.id,
          move_type: 'out_invoice',
          line_description: 'Consolidated Term 1 Lab & Exam Invoice',
          amount_total: 12500,
          invoice_line_ids: [
            { name: 'Science Lab Levy', quantity: 1, price_unit: 7500, price_subtotal: 7500 },
            { name: 'Past Paper Booklet', quantity: 2, price_unit: 2500, price_subtotal: 5000 },
          ],
        },
      });
    expect(res.status).toBe(201);
    const createdMoveId = res.body.record.id;
    const childLines = store.all('account.move.line').filter((l) => Number(l.move_id) === createdMoveId);
    expect(childLines.length).toBe(2);

    // 3. Portal profile update & strict RBAC preservation
    res = await request(app)
      .post('/api/v1/portal/profile')
      .set(stuHdr)
      .send({ phone: '+254711998877', street: 'Westlands Ring Rd', city: 'Nairobi' });
    expect(res.status).toBe(200);
    expect(res.body.student.phone).toBe('+254711998877');

    // Student cannot directly write op.student or account.move; faculty cannot write account.move
    res = await request(app)
      .post('/api/v1/dataset/call_kw/op.student/web_save')
      .set(stuHdr)
      .send({ id: firstStudent.id, vals: { phone: '+254700000001' } });
    expect(res.status).toBe(403);

    res = await request(app)
      .post('/api/v1/dataset/call_kw/account.move/web_save')
      .set(facHdr)
      .send({ vals: { student_id: firstStudent.id, amount_total: 5000 } });
    expect(res.status).toBe(403);

    // Student CAN create self-service records (helpdesk ticket, leave request, quiz result)
    res = await request(app)
      .post('/api/v1/dataset/call_kw/helpdesk.ticket/web_save')
      .set(stuHdr)
      .send({ vals: { issue_name: 'Student Portal Password Reset', help_description: 'Please sync WiFi login' } });
    expect(res.status).toBe(201);

    res = await request(app)
      .post('/api/v1/dataset/call_kw/student.leave.request/web_save')
      .set(stuHdr)
      .send({ vals: { name: 'Medical Appointment Leave', from_date: '2027-02-10', to_date: '2027-02-11' } });
    expect(res.status).toBe(201);

    // 4. AI Course Generator -> Enroll Learner -> Lesson completion recomputes progress 0% -> 100%
    res = await request(app)
      .post('/api/v1/ai/generate-course')
      .set(adminHdr)
      .send({ topic: 'IGCSE Chemistry Organic Synthesis', modulesCount: 2 });
    expect(res.status).toBe(201);
    const lmsCourseId = res.body.course.id;
    const lmsMods = store.all('op.course.module').filter((m) => Number(m.course_id) === lmsCourseId);
    expect(lmsMods.length).toBe(2);

    res = await request(app)
      .post('/api/v1/dataset/call_kw/op.course/enroll_learner')
      .set(stuHdr)
      .send({ id: lmsCourseId, args: { user_id: stu.body.user.id } });
    expect(res.status).toBe(200);
    const enrId = res.body.record.id;
    expect(res.body.record.progress).toBe(0);

    const enrLines = store.all('op.course.enrollment.line').filter((l) => Number(l.enrollment_id) === enrId);
    expect(enrLines.length).toBe(2);

    res = await request(app)
      .post('/api/v1/dataset/call_kw/op.course.enrollment.line/web_save')
      .set(stuHdr)
      .send({ id: enrLines[0].id, vals: { is_completed: true } });
    expect(res.status).toBe(200);
    expect(store.byId('op.course.enrollment', enrId)?.progress).toBe(50);

    res = await request(app)
      .post('/api/v1/dataset/call_kw/op.course.enrollment.line/web_save')
      .set(stuHdr)
      .send({ id: enrLines[1].id, vals: { is_completed: true } });
    expect(res.status).toBe(200);
    expect(store.byId('op.course.enrollment', enrId)?.progress).toBe(100);
    expect(store.byId('op.course.enrollment', enrId)?.state).toBe('done');

    // 5. AI Quiz Generator creates real quiz + questions, and student can submit & auto-grade quiz result
    res = await request(app)
      .post('/api/v1/ai/generate-quiz')
      .set(adminHdr)
      .send({ topic: 'Alkanes & Alkenes Checkpoint', questionCount: 4 });
    expect(res.status).toBe(201);
    const quizLines = store.all('op.quiz.line').filter((q) => Number(q.quiz_id) === res.body.quiz.id);
    expect(quizLines.length).toBe(4);

    const qrRes = await request(app)
      .post('/api/v1/dataset/call_kw/op.quiz.result/web_save')
      .set(stuHdr)
      .send({ vals: { name: 'QR/STU/TEST', quiz_id: res.body.quiz.id, student_id: firstStudent.id, total_marks: 20, state: 'open' } });
    expect(qrRes.status).toBe(201);
    const qrSub = await request(app)
      .post('/api/v1/dataset/call_kw/op.quiz.result/get_action_submit')
      .set(stuHdr)
      .send({ id: qrRes.body.record.id });
    expect(qrSub.status).toBe(200);
    const qrDone = await request(app)
      .post('/api/v1/dataset/call_kw/op.quiz.result/get_action_done')
      .set(stuHdr)
      .send({ id: qrRes.body.record.id });
    expect(qrDone.status).toBe(200);
    expect(qrDone.body.record.state).toBe('done');

    // 6. Integration Connection Test Adapters
    for (const kind of ['mpesa', 'whatsapp', 'sms', 'email', 'meetings', 'sso', 'webhook', 'ai']) {
      const t = await request(app)
        .post('/api/v1/integrations/test')
        .set(adminHdr)
        .send({ kind });
      expect(t.status, `Integration test failed for ${kind}`).toBe(200);
      expect(t.body.ok).toBe(true);
      expect(String(t.body.message).length).toBeGreaterThan(5);
    }
  });
});
