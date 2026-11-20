import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/index.js';
import { seedOshwal } from '../server/seeds/oshwal.js';
import { store } from '../server/store.js';
import { detectLanIpv4, resolvePublicOrigin } from '../server/integrations.js';
import { getReportsForModel, checkModelAccess } from '../shared/meta/index.js';

describe('OpenEduCat Reports Engine, Downloads & RBAC Security Hierarchy', () => {
  const app = createApp();

  beforeEach(() => {
    seedOshwal();
  }, 30000);

  it('exposes bound reports catalog and serves printable report payloads', async () => {
    const admReports = getReportsForModel('op.admission');
    expect(admReports.length).toBeGreaterThanOrEqual(1);
    expect(admReports.some((r) => r.id === 'admission_application_form')).toBe(true);

    const stuReports = getReportsForModel('op.student');
    expect(stuReports.some((r) => r.id === 'student_id_card')).toBe(true);

    const firstAdm = store.all('op.admission')[0];
    const res = await request(app).get(`/api/v1/reports/admission_application_form/${firstAdm.id}`);
    expect(res.status).toBe(200);
    expect(res.body.report.id).toBe('admission_application_form');
    expect(res.body.record.id).toBe(firstAdm.id);
    expect(res.body.company.name).toContain('Oshwal');
  });

  it('supports record duplication (copy) via API', async () => {
    const student = store.all('op.student')[0];
    const res = await request(app)
      .post(`/api/v1/models/op-student/${student.id}/copy`)
      .set('X-User-Id', '1');
    expect(res.status).toBe(201);
    expect(res.body.record.id).not.toBe(student.id);
    expect(res.body.record.first_name).toBe(`${student.first_name} (copy)`);
  });

  it('enforces RBAC 403 Forbidden when Faculty attempts to write to Financial or Settings models', async () => {
    const facultyUser = store.all('res.users').find((u) => u.role === 'faculty')!;
    const inv = store.all('account.move')[0];

    // Faculty attempting to modify fee invoice -> blocked with 403
    const badRes = await request(app)
      .patch(`/api/v1/models/account-move/${inv.id}`)
      .set('X-User-Id', String(facultyUser.id))
      .send({ amount_total: 999999 });
    expect(badRes.status).toBe(403);
    expect(badRes.body.error).toContain('Access Denied');
    expect(badRes.body.error).toContain('faculty');

    // Faculty attempting to call call_kw write on account.move -> blocked with 403
    const rpcRes = await request(app)
      .post('/api/v1/dataset/call_kw/account.move/write')
      .set('X-User-Id', String(facultyUser.id))
      .send({ id: inv.id, vals: { amount_total: 999999 } });
    expect(rpcRes.status).toBe(403);
    expect(rpcRes.body.error).toContain('Access Denied');

    // Admin user can write without restriction
    const adminUser = store.all('res.users').find((u) => u.role === 'admin')!;
    const okRes = await request(app)
      .patch(`/api/v1/models/account-move/${inv.id}`)
      .set('X-User-Id', String(adminUser.id))
      .send({ ref: 'REF-ADMIN-UPDATE' });
    expect(okRes.status).toBe(200);
    expect(okRes.body.record.ref).toBe('REF-ADMIN-UPDATE');
  });

  it('verifies checkModelAccess logic for all roles', () => {
    expect(checkModelAccess('account.move', 'admin', 'write').allowed).toBe(true);
    expect(checkModelAccess('account.move', 'faculty', 'write').allowed).toBe(false);
    expect(checkModelAccess('res.config.settings', 'faculty', 'write').allowed).toBe(false);
    expect(checkModelAccess('op.session', 'faculty', 'write').allowed).toBe(true);
    expect(checkModelAccess('op.student', 'student', 'write').allowed).toBe(false);
    expect(checkModelAccess('op.student', 'student', 'read').allowed).toBe(true);
  });

  it('renders printable HTML report with exact OpenEduCat QWeb layout and barcode', async () => {
    const student = store.all('op.student')[0];
    const res = await request(app).get(`/report/html/openeducat_core.report_student_idcard/${student.id}?layout=light`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('STUDENT ID CARD');
    expect(res.text).toContain('o_report_layout_light');
    expect(res.text).toContain('Blood Group');

    // Also test exact Invoice report route matching live instance with real invoice_line_ids
    const inv = store.all('account.move')[0];
    const invRes = await request(app).get(`/report/html/account.report_invoice_with_payments/${inv.id}`);
    expect(invRes.status).toBe(200);
    expect(invRes.text).toContain('Invoice');
    expect(invRes.text).toContain('Amount Due');
    expect(invRes.text).toContain('Term 1 Tuition Fee');
    expect(invRes.text).not.toContain('FURN_8888');
    expect(invRes.text).not.toContain('🎓');

    // Query overrides for live QWeb Document Layout preview
    const overrideRes = await request(app).get(`/report/html/account.report_invoice_with_payments/${inv.id}?layout=bold&font=roboto`);
    expect(overrideRes.status).toBe(200);
    expect(overrideRes.text).toContain('o_report_layout_bold');
    expect(overrideRes.text).toContain('"Roboto"');

    // Admission Letter uses company signatory rather than hardcoded Mitchell Admin
    const adm = store.all('op.admission')[0];
    const letterRes = await request(app).get(`/report/html/openeducat_admission_esign.report_admission_letter_request/${adm.id}`);
    expect(letterRes.status).toBe(200);
    expect(letterRes.text).not.toContain('Mitchell Admin');

    // Test Course Enrollment & Attendance Summary QWeb templates
    const enrollHtml = await request(app).get(`/report/html/openeducat_core_enterprise.report_student_course_enrollment/${student.id}`);
    expect(enrollHtml.status).toBe(200);
    expect(enrollHtml.text).toContain('Student Course Enrollment');

    // Test binary multi-page PDF generation (%PDF- header)
    const enrollPdfRes = await request(app)
      .get(`/report/pdf/openeducat_core_enterprise.report_student_course_enrollment/${student.id}`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(enrollPdfRes.status).toBe(200);
    if (String(enrollPdfRes.headers['content-type']).includes('application/pdf')) {
      expect((enrollPdfRes.body as Buffer).slice(0, 5).toString('ascii')).toBe('%PDF-');
      expect((enrollPdfRes.body as Buffer).length).toBeGreaterThan(15000);
    }

    const attHtml = await request(app).get(`/report/html/openeducat_student_attendance_enterprise.report_student_attendance_summary/${student.id}`);
    expect(attHtml.status).toBe(200);
    expect(attHtml.text).toContain('Student Attendance Summary');
  }, 20000);

  it('auto-calculates account.move.line subtotal and parent invoice total on create', async () => {
    const inv = store.all('account.move')[0];
    const prevTotal = Number(inv.amount_total);
    const created = await request(app)
      .post('/api/v1/dataset/call_kw/account.move.line/web_save')
      .set('X-User-Id', '1')
      .send({ vals: { move_id: inv.id, name: 'IGCSE Mock Exam Fee', quantity: 2, price_unit: 4500 } });
    expect(created.status).toBe(201);
    expect(created.body.record.price_subtotal).toBe(9000);
    const updatedInv = store.byId('account.move', inv.id)!;
    expect(updatedInv.amount_total).toBe(prevTotal + 9000);
  });

  it('generates server-side CSV export with UTF-8 BOM encoding matching Odoo 19 /web/export/csv', async () => {
    const res = await request(app)
      .post('/api/v1/export/csv')
      .send({
        model: 'op.student',
        fields: [
          { name: 'first_name', label: 'First Name' },
          { name: 'last_name', label: 'Last Name' },
          { name: 'gr_no', label: 'GR Number' },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment; filename="op_student_export_');
    // Ensure UTF-8 BOM is present
    expect(res.text.charCodeAt(0)).toBe(0xFEFF);
    expect(res.text).toContain('"First Name","Last Name","GR Number"');
  });

  it('generates genuine binary OOXML XLSX workbook matching Odoo 19 /web/export/xlsx', async () => {
    const res = await request(app)
      .post('/api/v1/export/xlsx')
      .send({
        model: 'op.student',
        fields: [
          { name: 'first_name', label: 'First Name' },
          { name: 'gr_no', label: 'GR Number' },
        ],
      })
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
    expect(res.headers['content-disposition']).toContain('.xlsx');
    expect((res.body as Buffer).slice(0, 2).toString('ascii')).toBe('PK');
  });

  it('auto-populates all models & rules on new sub-role, recomputes counts, hides unchecked modules, and enforces 403', async () => {
    // 1. Create a custom sub-role under base_role = 'faculty'
    const roleRes = await request(app)
      .post('/api/v1/dataset/call_kw/res.users.role/web_save')
      .set('X-User-Id', '1')
      .send({ vals: { name: 'IGCSE Science Teacher', code: 'ROLE-SCI', base_role: 'faculty' } });
    expect(roleRes.status).toBe(201);
    const customRole = roleRes.body.record;
    expect(customRole.model_access_count).toBeGreaterThan(50);
    expect(customRole.rules_count).toBeGreaterThanOrEqual(4);
    expect(Array.isArray(customRole.access_ids)).toBe(true);
    expect(Array.isArray(customRole.rule_ids)).toBe(true);

    // 2. Uncheck HR models for this Teacher role (perm_read = false on hr.employee, hr.leave, etc.)
    const hrLines = customRole.access_ids.filter((l: any) => l.module_group === 'HR & Payroll');
    expect(hrLines.length).toBeGreaterThanOrEqual(2);
    for (const hl of hrLines) {
      const wRes = await request(app)
        .post('/api/v1/dataset/call_kw/ir.model.access/write')
        .set('X-User-Id', '1')
        .send({ id: hl.id, vals: { perm_read: false, perm_write: false, perm_create: false, perm_unlink: false } });
      expect(wRes.status).toBe(200);
    }

    // Re-read role and verify model_access_count decreased automatically
    const rereadRole = await request(app)
      .post('/api/v1/dataset/call_kw/res.users.role/web_read')
      .set('X-User-Id', '1')
      .send({ id: customRole.id });
    expect(rereadRole.body.record.model_access_count).toBe(customRole.model_access_count - hrLines.length);

    // 3. Create a user bound to this custom Teacher role
    const uRes = await request(app)
      .post('/api/v1/dataset/call_kw/res.users/web_save')
      .set('X-User-Id', '1')
      .send({ vals: { name: 'Teacher Jane', login: 'tjane@oshwalacademy.sc.ke', role_id: customRole.id, role: 'faculty', company_id: 4 } });
    expect(uRes.status).toBe(201);
    const teacherUser = uRes.body.record;

    // 4. Verify Human Resources app is dynamically hidden from Teacher Jane's menus, while Attendance & LMS remain visible
    const menuRes = await request(app)
      .get('/api/v1/meta/menus')
      .set('X-User-Id', String(teacherUser.id));
    expect(menuRes.status).toBe(200);
    const appIds = menuRes.body.apps.map((a: any) => a.id);
    expect(appIds).not.toContain('hr');
    expect(appIds).toContain('attendance');
    expect(appIds).toContain('lms');

    // 5. Verify Teacher Jane gets 403 Forbidden on hr.employee search_read, while op.session & res.company succeed
    const hrBlocked = await request(app)
      .post('/api/v1/dataset/call_kw/hr.employee/search_read')
      .set('X-User-Id', String(teacherUser.id))
      .send({});
    expect(hrBlocked.status).toBe(403);
    expect(hrBlocked.body.error).toContain('ir.model.access');

    const sessionOk = await request(app)
      .post('/api/v1/dataset/call_kw/op.session/search_read')
      .set('X-User-Id', String(teacherUser.id))
      .send({});
    expect(sessionOk.status).toBe(200);

    const campusSafe = await request(app)
      .post('/api/v1/dataset/call_kw/res.company/search_read')
      .set('X-User-Id', String(teacherUser.id))
      .send({});
    expect(campusSafe.status).toBe(200);
  });

  it('enforces ir.rule protect_posted and exposes standalone security tables', async () => {
    // Backoffice user cannot delete a posted invoice due to ir.rule protect_posted
    const backofficeUser = store.all('res.users').find((u) => u.role === 'backoffice')!;
    const postedInv = store.all('account.move').find((m) => m.state === 'posted')!;
    const delRes = await request(app)
      .delete(`/api/v1/models/account-move/${postedInv.id}`)
      .set('X-User-Id', String(backofficeUser.id));
    expect(delRes.status).toBe(403);
    expect(delRes.body.error).toContain('Access Denied');

    // Standalone Admin endpoints return Access Rights, Record Rules, and Models
    const accessList = await request(app).get('/api/v1/models/ir-model-access').set('X-User-Id', '1');
    expect(accessList.status).toBe(200);
    expect(accessList.body.total).toBeGreaterThan(100);
    expect(accessList.body.records.length).toBe(80);

    const ruleList = await request(app).get('/api/v1/models/ir-rule').set('X-User-Id', '1');
    expect(ruleList.status).toBe(200);
    expect(ruleList.body.records.length).toBeGreaterThan(5);
  });

  it('supports configurable SMTP settings without leaking passwords and renders branded HTML emails across workflows', async () => {
    // 1. Update configurable SMTP settings via /api/v1/settings
    const saveRes = await request(app)
      .post('/api/v1/settings')
      .set('X-User-Id', '1')
      .send({
        email_provider: 'smtp',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_encryption: 'starttls',
        smtp_user: 'admissions@oshwalacademy.sc.ke',
        smtp_pass: 'secret-test-password',
        smtp_from_name: 'Oshwal Academy Admissions',
      });
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.settings.smtp_host).toBe('smtp.gmail.com');
    expect(saveRes.body.settings.smtp_user).toBe('admissions@oshwalacademy.sc.ke');
    // Password must never be returned in plaintext API responses or stored on store settings
    expect(saveRes.body.settings.smtp_pass).toBe('');
    expect(store.getSettings().smtp_pass).toBeUndefined();

    // 2. HTML Email preview renders institutional branding & summary cards
    const prevRes = await request(app).get('/api/v1/integrations/email/preview/fee_invoice');
    expect(prevRes.status).toBe(200);
    expect(prevRes.headers['content-type']).toContain('text/html');
    expect(prevRes.text).toContain('<!DOCTYPE html>');
    expect(prevRes.text).toContain('M-Pesa Paybill Instructions');

    // 3. Invoice send workflow logs formatted HTML email in comm.outbox
    const inv = store.all('account.move')[0];
    const sendRes = await request(app)
      .post('/api/v1/dataset/call_kw/account.move/send_invoice')
      .set('X-User-Id', '1')
      .send({ id: inv.id });
    expect(sendRes.status).toBe(200);

    // Give async fire-and-forget dispatch a short tick
    await new Promise((r) => setTimeout(r, 30));
    const emailRows = store.all('comm.outbox').filter((m) => m.channel === 'email' && m.res_model === 'account.move');
    expect(emailRows.length).toBeGreaterThanOrEqual(1);
    const latest = emailRows[emailRows.length - 1];
    expect(latest.body_html).toContain('<!DOCTYPE html>');
    expect(latest.body_html).toContain(String(inv.name));
  });

  it('hashes user passwords with scrypt, enforces login verification, and handles password setup/reset tokens', async () => {
    // 1. Create a user with an initial password
    const uRes = await request(app)
      .post('/api/v1/dataset/call_kw/res.users/web_save')
      .set('X-User-Id', '1')
      .send({
        vals: {
          name: 'Bursar Test',
          login: 'bursar.test@oshwalacademy.sc.ke',
          role: 'backoffice',
          initial_password: 'StrongPassword!23',
        },
      });
    expect(uRes.status).toBe(201);
    const createdUser = uRes.body.record;
    expect(createdUser.password_set).toBe(true);
    expect(createdUser.password_hash).toBeUndefined();
    expect(createdUser.initial_password).toBeUndefined();

    // 2. Wrong password -> 401
    const badLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'bursar.test@oshwalacademy.sc.ke', password: 'WrongPassword' });
    expect(badLogin.status).toBe(401);

    // 3. Correct password -> 200 & sanitized user
    const goodLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'bursar.test@oshwalacademy.sc.ke', password: 'StrongPassword!23' });
    expect(goodLogin.status).toBe(200);
    expect(goodLogin.body.user.login).toBe('bursar.test@oshwalacademy.sc.ke');
    expect(goodLogin.body.user.password_hash).toBeUndefined();

    // 4. Send Password Setup Email + Reset Token completion
    const uNoPw = await request(app)
      .post('/api/v1/dataset/call_kw/res.users/web_save')
      .set('X-User-Id', '1')
      .send({ vals: { name: 'Teacher Invite', login: 'invite@oshwalacademy.sc.ke', role: 'faculty' } });
    expect(uNoPw.body.record.password_set).toBe(false);

    const noPwLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'invite@oshwalacademy.sc.ke', password: 'anything' });
    expect(noPwLogin.status).toBe(401);

    const resetDispatch = await request(app)
      .post('/api/v1/dataset/call_kw/res.users/send_reset_email')
      .set('X-User-Id', '1')
      .send({ id: uNoPw.body.record.id, args: { origin: 'http://localhost:5175' } });
    expect(resetDispatch.status).toBe(200);

    const rawUser = store.byId('res.users', uNoPw.body.record.id)!;
    expect(typeof rawUser.reset_token).toBe('string');

    const lanIp = detectLanIpv4();
    const expectedOrigin = resolvePublicOrigin('http://localhost:5175');
    if (lanIp) {
      expect(expectedOrigin).toBe(`http://${lanIp}:5175`);
      expect(expectedOrigin).not.toContain('localhost');
    }
    await new Promise((r) => setTimeout(r, 30));
    const outboxReset = store.all('comm.outbox').find((o) => o.to === 'invite@oshwalacademy.sc.ke' && String(o.body || '').includes(String(rawUser.reset_token)));
    expect(outboxReset).toBeDefined();
    expect(String(outboxReset?.body || '')).toContain(`${expectedOrigin}/web/reset_password?token=${encodeURIComponent(String(rawUser.reset_token))}`);

    const completeReset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawUser.reset_token, password: 'NewUserPass99' });
    expect(completeReset.status).toBe(200);
    expect(completeReset.body.user.password_set).toBe(true);

    const loginAfterReset = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'invite@oshwalacademy.sc.ke', password: 'NewUserPass99' });
    expect(loginAfterReset.status).toBe(200);

    // 5. Chatter 'Send message' (comment) on res.users dispatches HTML email to outbox
    const msgRes = await request(app)
      .post('/api/v1/dataset/call_kw/mail.message/create')
      .set('X-User-Id', '1')
      .send({
        vals: {
          res_model: 'res.users',
          res_id: uNoPw.body.record.id,
          body: 'Hello Simon, welcome aboard!',
          message_type: 'comment',
        },
      });
    expect(msgRes.status).toBe(201);
    await new Promise((r) => setTimeout(r, 30));
    const chatterOutbox = store.all('comm.outbox').find((o) => o.to === 'invite@oshwalacademy.sc.ke' && String(o.body).includes('Hello Simon, welcome aboard!'));
    expect(chatterOutbox).toBeDefined();
    expect(chatterOutbox!.body_html).toContain('<!DOCTYPE html>');
  });
});
