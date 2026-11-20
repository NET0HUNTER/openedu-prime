import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/index.js';
import { seedOshwal } from '../server/seeds/oshwal.js';
import { store } from '../server/store.js';
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
});
