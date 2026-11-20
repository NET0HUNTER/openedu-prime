import { MODEL_MAP } from '../shared/meta/index.js';
import { store, type Rec } from './store.js';

export interface MethodResult {
  record?: Rec;
  message?: string;
  redirect?: { model: string; id?: number };
  data?: unknown;
}

export function executeMethod(model: string, method: string, id: number | undefined, args: Record<string, unknown> = {}, userId = 1): MethodResult {
  const def = MODEL_MAP[model];
  if (!def) throw new Error(`Unknown model: ${model}`);

  const btn = def.buttons.find((b) => b.name === method);

  // Domain business methods take precedence over generic stage transitions
  switch (`${model}.${method}`) {
    case 'op.admission.open_student': {
      const adm = store.byId('op.admission', id!);
      if (!adm || !adm.student_id) throw new Error('Enrolled student profile not found');
      return { redirect: { model: 'op.student', id: Number(adm.student_id) } };
    }

    case 'op.admission.enroll_student': {
      const adm = store.byId('op.admission', id!);
      if (!adm) throw new Error('Application not found');
      if (adm.citizenship === 'non_kenyan' && !adm.pupils_pass_no) {
        throw new Error("Statutory Kenyan Immigration Pupil's Pass number is required before enrolling a non-Kenyan student.");
      }
      const fullName = [adm.first_name, adm.middle_name, adm.last_name].filter(Boolean).join(' ');
      const partner = store.create('res.partner', {
        name: fullName, email: adm.email, phone: adm.phone, is_student: true, city: adm.city, company_id: adm.company_id,
      }, userId);
      const student = store.create('op.student', {
        first_name: adm.first_name, middle_name: adm.middle_name, last_name: adm.last_name,
        email: adm.email, phone: adm.phone, gender: adm.gender, birth_date: adm.birth_date,
        course_id: adm.course_id, batch_id: adm.batch_id, citizenship: adm.citizenship,
        pupils_pass_no: adm.pupils_pass_no, pupils_pass_expiry: adm.pupils_pass_expiry,
        street: adm.street, city: adm.city, partner_id: partner.id, company_id: adm.company_id,
      }, userId);
      store.create('op.student.course', {
        student_id: student.id, course_id: adm.course_id, batch_id: adm.batch_id ?? 1, company_id: adm.company_id, state: 'running',
      }, userId);
      store.create('op.library.card', {
        student_id: student.id, card_type: 'Standard Student', company_id: adm.company_id,
      }, userId);
      const reg = adm.register_id ? store.byId('op.admission.register', Number(adm.register_id)) : undefined;
      const tuition = Number(adm.fees || 320000);
      const inv = store.create('account.move', {
        move_type: 'out_invoice', partner_id: partner.id, student_id: student.id, admission_id: adm.id,
        fee_category: 'tuition', invoice_date_due: adm.due_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        line_description: `Admission + Caution + Tuition (${reg?.name ?? 'Enrollment'})`,
        amount_total: tuition, amount_residual: tuition, company_id: adm.company_id, state: 'posted', payment_state: 'not_paid',
      }, userId);
      store.create('account.move.line', {
        move_id: inv.id,
        name: `Admission + Caution + Tuition (${reg?.name ?? 'Enrollment'})`,
        account_name: '400000 Academic Tuition Revenue',
        quantity: 1,
        price_unit: tuition,
      }, userId, false);
      const doneStage = store.all('admission.stage').find((s) => s.state === 'done');
      const studentUser = store.create('res.users', {
        name: fullName,
        login: adm.email || `student.${student.gr_no.toLowerCase()}@oshwalacademy.sc.ke`,
        role: 'student',
        student_id: student.id,
        company_id: adm.company_id || 1,
        company_ids: adm.company_id ? [Number(adm.company_id)] : [1],
        active: true,
      }, userId);
      store.write('op.student', student.id, { user_id: studentUser.id }, userId);
      const updated = store.write('op.admission', adm.id, {
        state: 'done', stage_id: doneStage ? doneStage.id : adm.stage_id, is_student: true, student_id: student.id, partner_id: partner.id, admission_date: new Date().toISOString().slice(0, 10),
      }, userId);
      return { record: updated, message: `Student ${fullName} enrolled (${student.gr_no}), fee invoice ${inv.name} posted, and portal user created (${studentUser.login}).` };
    }

    case 'op.parent.create_parent_user': {
      const parent = store.byId('op.parent', id!);
      if (!parent) throw new Error('Parent not found');
      if (parent.user_id) {
        const existing = store.byId('res.users', Number(parent.user_id));
        return { message: `Parent already has user account: ${existing?.login || 'Active'}` };
      }
      const login = parent.email || `parent${parent.id}@oshwalacademy.sc.ke`;
      const user = store.create('res.users', {
        name: parent.name,
        login,
        role: 'parent',
        parent_id: parent.id,
        company_id: parent.company_id || 1,
        company_ids: parent.company_id ? [Number(parent.company_id)] : [1],
        active: true,
      }, userId);
      const updated = store.write('op.parent', parent.id, { user_id: user.id }, userId);
      return { record: updated, message: `Created portal user ${login} linked to Parent profile.` };
    }

    case 'op.faculty.create_faculty_user': {
      const fac = store.byId('op.faculty', id!);
      if (!fac) throw new Error('Faculty not found');
      if (fac.user_id) {
        const existing = store.byId('res.users', Number(fac.user_id));
        return { message: `Faculty already has user account: ${existing?.login || 'Active'}` };
      }
      const fullName = [fac.first_name, fac.middle_name, fac.last_name].filter(Boolean).join(' ');
      const login = fac.email || `faculty${fac.id}@oshwalacademy.sc.ke`;
      const user = store.create('res.users', {
        name: fullName,
        login,
        role: 'faculty',
        faculty_id: fac.id,
        company_id: fac.company_id || 1,
        company_ids: fac.company_id ? [Number(fac.company_id)] : [1],
        active: true,
      }, userId);
      const updated = store.write('op.faculty', fac.id, { user_id: user.id }, userId);
      return { record: updated, message: `Created user ${login} with Faculty role.` };
    }

    case 'op.subject.registration.action_submitted':
    case 'op.subject.registration.submit': {
      const reg = store.byId('op.subject.registration', id!);
      if (!reg) throw new Error('Subject registration not found');
      const course = reg.course_id ? store.byId('op.course', Number(reg.course_id)) : undefined;
      const compulsoryIds: number[] = Array.isArray(reg.compulsory_subject_ids) ? reg.compulsory_subject_ids : [];
      const electiveIds: number[] = Array.isArray(reg.elective_subject_ids) ? reg.elective_subject_ids : [];
      const totalSubjects = compulsoryIds.length + electiveIds.length;

      // Generic curriculum rules driven by op.course min/max unit loads & code conventions
      if (course?.min_unit_load && totalSubjects < Number(course.min_unit_load)) {
        throw new Error(`${course.name} requires at least ${course.min_unit_load} registered subjects (currently ${totalSubjects}).`);
      }
      if (course?.max_unit_load && totalSubjects > Number(course.max_unit_load)) {
        throw new Error(`${course.name} allows at most ${course.max_unit_load} subjects (currently ${totalSubjects}).`);
      }
      if (course?.code?.includes('AS') || course?.name?.includes('AS-Level')) {
        if (Number(reg.igcse_credits_count ?? 0) < 5 || !reg.english_math_passed) {
          throw new Error('Senior High AS-Level entry requires minimum 5 IGCSE credit passes (Grade C / 4+) including English and Mathematics. Consider Pearson BTEC Level 3.');
        }
      }
      if (reg.is_extra_private_subject) {
        if (reg.has_practical_coursework) {
          throw new Error('Private/extra IGCSE subject entries strictly exclude subjects with practical or coursework components.');
        }
        const student = store.byId('op.student', Number(reg.student_id));
        const sName = student ? store.displayName('op.student', student) : 'Student';
        const esign = store.create('e.sign.request', {
          template_id: 1, signer_name: sName, signer_email: student?.email || 'parent@oshwalacademy.sc.ke',
          student_id: reg.student_id, sequential_order: true,
          signers_summary: '1. Student → 2. Parent → 3. HoD → 4. T&L Coordinator → 5. Head of School',
          company_id: reg.company_id, state: 'sent',
        }, userId);
        const updated = store.write('op.subject.registration', reg.id, { state: 'esign_pending' }, userId);
        return { record: updated, message: `5-Party Private Subject Undertaking E-Sign (${esign.name}) dispatched.` };
      }
      const updated = store.write('op.subject.registration', reg.id, { state: 'submitted' }, userId);
      return { record: updated, message: `Subject registration submitted (${totalSubjects} subjects validated).` };
    }

    case 'op.student.withdrawal.action_submitted':
    case 'op.student.withdrawal.submit': {
      const wd = store.byId('op.student.withdrawal', id!);
      if (!wd) throw new Error('Withdrawal request not found');
      const settings = store.getSettings();
      const requiredDays = Number(settings.withdrawal_notice_days ?? 90);
      const notice = new Date(wd.notice_date).getTime();
      const effective = new Date(wd.effective_date).getTime();
      const diffDays = Math.round((effective - notice) / 86400000);
      const met = diffDays >= requiredDays;
      const updated = store.write('op.student.withdrawal', wd.id, {
        notice_days_given: diffDays,
        full_term_notice_met: met,
        caution_refund_amount: met ? 25000 : 0,
        state: 'submitted',
      }, userId);
      return {
        record: updated,
        message: met
          ? `Full term notice met (${diffDays} >= ${requiredDays} days). Caution Money KES 25,000 eligible for refund.`
          : `Short notice (${diffDays} < ${requiredDays} days). Caution refund flagged for SLT review.`,
      };
    }

    case 'op.academic.year.term_create': {
      const ay = store.byId('op.academic.year', id!);
      if (!ay) throw new Error('Academic Year not found');
      const existing = store.all('op.academic.term').filter((t) => Number(t.academic_year_id) === ay.id);
      if (existing.length === 0) {
        const y = Number(String(ay.start_date).slice(0, 4)) || new Date().getFullYear();
        const terms = ay.term_structure === 'two_semesters'
          ? [
              { name: 'Semester 1 (Sep–Jan)', term_start_date: `${y}-09-01`, term_end_date: `${y + 1}-01-31` },
              { name: 'Semester 2 (Feb–Jun)', term_start_date: `${y + 1}-02-01`, term_end_date: `${y + 1}-06-30` },
            ]
          : [
              { name: 'Term 1 (Sep–Dec)', term_start_date: `${y}-09-01`, term_end_date: `${y}-12-12` },
              { name: 'Term 2 (Jan–Apr)', term_start_date: `${y + 1}-01-08`, term_end_date: `${y + 1}-04-05` },
              { name: 'Term 3 (May–Jul)', term_start_date: `${y + 1}-05-05`, term_end_date: `${y + 1}-07-18` },
            ];
        for (const t of terms) {
          store.create('op.academic.term', { ...t, academic_year_id: ay.id, company_id: ay.company_id }, userId);
        }
      }
      return { record: store.hydrate('op.academic.year', ay), message: 'Academic terms verified/generated.' };
    }

    case 'op.attendance.sheet.enable_kiosk': {
      const sheet = store.byId('op.attendance.sheet', id!);
      if (!sheet) throw new Error('Attendance sheet not found');
      return { record: store.hydrate('op.attendance.sheet', sheet), message: `Attendance Kiosk ready for sheet ${sheet.name}.` };
    }

    case 'op.attendance.sheet.attendance_start': {
      const sheet = store.byId('op.attendance.sheet', id!);
      if (!sheet) throw new Error('Attendance sheet not found');
      const lines = store.all('op.attendance.line').filter((l) => Number(l.attendance_id) === id);
      lines.forEach((l) => {
        store.write('op.attendance.line', l.id, { state: 'start' }, userId);
      });
      const updated = store.write('op.attendance.sheet', id!, { state: 'start' }, userId);
      return { record: updated, message: `Attendance started for ${sheet.name}.` };
    }

    case 'op.attendance.sheet.attendance_draft':
    case 'op.attendance.sheet.reset_attendance': {
      const sheet = store.byId('op.attendance.sheet', id!);
      if (!sheet) throw new Error('Attendance sheet not found');
      const lines = store.all('op.attendance.line').filter((l) => Number(l.attendance_id) === id);
      lines.forEach((l) => {
        store.write('op.attendance.line', l.id, { state: 'draft' }, userId);
      });
      const updated = store.write('op.attendance.sheet', id!, { state: 'draft' }, userId);
      return { record: updated, message: `Attendance reset to draft for ${sheet.name}.` };
    }

    case 'op.attendance.sheet.attendance_done':
    case 'op.attendance.sheet.take_attendance': {
      const sheet = store.byId('op.attendance.sheet', id!);
      if (!sheet) throw new Error('Attendance sheet not found');
      const lines = store.all('op.attendance.line').filter((l) => Number(l.attendance_id) === id);
      const totalPresent = lines.filter((l) => l.present).length;
      const totalAbsent = lines.filter((l) => l.absent).length;
      const excusedCount = lines.filter((l) => l.excused).length;
      const lateCount = lines.filter((l) => l.late).length;
      const total = lines.length;
      const percentage = total > 0 ? Math.round(((totalPresent + lateCount) / total) * 100) : 100;

      lines.forEach((l) => {
        store.write('op.attendance.line', l.id, { state: 'done' }, userId);
      });

      const updated = store.write('op.attendance.sheet', id!, {
        state: 'done',
        total_present: totalPresent,
        total_absent: totalAbsent,
        excused_count: excusedCount,
        late_count: lateCount,
        attendance_percentage: percentage,
      }, userId);
      const settings = store.getSettings();
      let alerts = 0;
      if (settings.attendance_absentee_alert) {
        const absentLines = lines.filter((l) => l.absent);
        for (const line of absentLines) {
          const student = store.byId('op.student', Number(line.student_id));
          if (student) {
            store.create('comm.outbox', {
              to: student.phone || '+254700000000',
              recipient_name: `Parent of ${store.displayName('op.student', student)}`,
              channel: settings.absentee_channel || 'whatsapp',
              subject: 'Morning Roll-Call Absence Alert',
              body: `Dear Parent, ${store.displayName('op.student', student)} was marked Absent (Unexcused) on ${sheet.attendance_date}. Please reply or submit a leave note via the Parent Portal.`,
              res_model: 'op.attendance.sheet', res_id: id, provider: settings.whatsapp_provider || 'simulate', state: 'sent', company_id: sheet.company_id,
            }, userId);
            alerts++;
          }
        }
      }
      return { record: updated, message: `Attendance finalized (${percentage}% present). ${alerts} parent absentee alert(s) queued.` };
    }

    case 'generate.time.table.act_gen_time_table': {
      const wiz = store.byId('generate.time.table', id!);
      if (!wiz) throw new Error('Generate timetable wizard not found');
      const course = store.byId('op.course', Number(wiz.course_id));
      const batch = store.byId('op.batch', Number(wiz.batch_id));
      const subjects = store.all('op.subject').filter((s) => Number(s.course_id) === Number(wiz.course_id));
      const faculty = store.all('op.faculty')[0];
      const classroom = store.all('op.classroom')[0];
      const createdSessions: number[] = [];
      const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

      for (let i = 0; i < 5; i++) {
        const sub = subjects[i % (subjects.length || 1)];
        const day = daysList[i];
        const session = store.create('op.session', {
          name: `${course?.name || 'Class'} - ${sub?.name || 'Session'} (${day.slice(0, 3).toUpperCase()})`,
          course_id: wiz.course_id,
          batch_id: wiz.batch_id,
          subject_id: sub?.id,
          faculty_id: faculty?.id,
          classroom_id: classroom?.id,
          days: day,
          timing: '08:00 - 09:30',
          timing_slot: '08:00 - 09:30',
          type: 'theory',
          state: 'confirm',
        }, userId);
        createdSessions.push(session.id);
      }
      return { record: wiz, message: `Successfully generated ${createdSessions.length} weekly timetable sessions for ${course?.name} (${batch?.name}).` };
    }

    case 'time.table.report.gen_time_table_report': {
      const rep = store.byId('time.table.report', id!);
      return { record: rep, message: 'Timetable report generated and ready for print.' };
    }

    case 'op.result.template.generate_result': {
      const tpl = store.byId('op.result.template', id!);
      if (!tpl) throw new Error('Result template not found');
      const exams = store.all('op.exam').filter((e) => Number(e.session_id) === Number(tpl.exam_session_id));
      const attendees = store.all('op.exam.attendees').filter((a) => exams.some((e) => e.id === Number(a.exam_id)));
      const reg = store.create('op.marksheet.register', {
        name: `${tpl.name} — Marksheet Register`,
        exam_session_id: tpl.exam_session_id,
        result_template_id: tpl.id,
        company_id: tpl.company_id,
        total_pass: attendees.length,
        total_failed: 0,
        state: 'validated',
      }, userId);
      const byStudent = new Map<number, number[]>();
      for (const a of attendees) {
        const sid = Number(a.student_id);
        if (!byStudent.has(sid)) byStudent.set(sid, []);
        byStudent.get(sid)!.push(Number(a.marks ?? 0));
      }
      const scaleLines = store.all('op.grade.scale.line').filter((l) => Number(l.scale_id) === Number(tpl.grade_scale_id));
      for (const [sid, scores] of byStudent.entries()) {
        const total = scores.reduce((a, b) => a + b, 0);
        const pct = scores.length ? Math.round((total / (scores.length * 100)) * 1000) / 10 : 0;
        const grade = scaleLines.find((g) => pct >= Number(g.min_pct) && pct <= Number(g.max_pct))?.name ?? (pct >= 80 ? 'A' : pct >= 60 ? 'B' : 'C');
        const msLine = store.create('op.marksheet.line', {
          marksheet_reg_id: reg.id, student_id: sid, total_marks: total, percentage: pct, grade, gpa: Math.round((pct / 25) * 10) / 10, gpa_count: Math.round((pct / 25) * 10) / 10, status: pct >= 40 ? 'pass' : 'fail', company_id: tpl.company_id,
        }, userId);
        const stuAttendees = attendees.filter((a) => Number(a.student_id) === sid);
        for (const att of stuAttendees) {
          store.create('op.result.line', {
            marksheet_line_id: msLine.id, student_id: sid, exam_id: att.exam_id, marks: att.marks, grade: (att.marks ?? 0) >= 80 ? 'A' : (att.marks ?? 0) >= 60 ? 'B' : 'C', status: (att.marks ?? 0) >= 40 ? 'pass' : 'fail', company_id: tpl.company_id,
          }, userId);
        }
      }
      const updated = store.write('op.result.template', tpl.id, { state: 'result_generated' }, userId);
      return { record: updated, message: `Generated marksheet ${reg.name} with result lines for ${byStudent.size} student(s).` };
    }

    case 'gradebook.gradebook.student_Grade_override':
    case 'gradebook.gradebook.recompute_data':
    case 'gradebook.gradebook.recompute': {
      const gb = store.byId('gradebook.gradebook', id!);
      if (!gb) throw new Error('GradeBook not found');
      const lines = store.all('gradebook.line').filter((l) => Number(l.gradebook_id) === gb.id);
      const avg = lines.length
        ? Math.round((lines.reduce((s, l) => s + Number(l.override_score ?? l.calculated_score ?? 0), 0) / lines.length) * 10) / 10
        : Number(gb.percentage ?? 82);
      const scaleLines = store.all('op.grade.scale.line').filter((l) => Number(l.scale_id) === Number(gb.grade_scale_id));
      const grade = scaleLines.find((g) => avg >= Number(g.min_pct) && avg <= Number(g.max_pct))?.name ?? (avg >= 85 ? 'A*' : avg >= 75 ? 'A' : 'B');
      const updated = store.write('gradebook.gradebook', gb.id, { percentage: avg, grade, state: 'inprogress' }, userId);
      return { record: updated, message: `Recomputed overall average ${avg}% (${grade}).` };
    }

    case 'op.honorroll.generate_honor_roll': {
      const hr = store.byId('op.honorroll', id!);
      if (!hr) throw new Error('Honor roll not found');
      const gbs = store.all('gradebook.gradebook').filter((g) => {
        const pct = Number(g.percentage ?? 0);
        return pct >= Number(hr.from_per ?? 80) && pct <= Number(hr.to_per ?? 100);
      });
      const updated = store.write('op.honorroll', hr.id, { state: 'generate' }, userId);
      return { record: updated, message: `Generated honor roll with ${gbs.length} qualifying student(s).` };
    }

    case 'op.omr.exam.scan': {
      const ex = store.byId('op.omr.exam', id!);
      if (!ex) throw new Error('OMR Exam not found');
      const stu = store.all('op.student')[0];
      if (stu) {
        store.create('op.answer.sheets', {
          student_id: stu.id,
          roll_number: stu.gr_no || 'OAN-001',
          omr_exam_id: ex.id,
          key_type: 'A',
          right_answer: 38,
          wrong_answer: 2,
          not_attampted: 0,
          score: 95,
          company_id: ex.company_id,
        }, userId);
      }
      const nextCount = Number(ex.scanned_count ?? 0) + 25;
      const updated = store.write('op.omr.exam', id!, {
        scanned_count: nextCount,
        answersheet_count: store.all('op.answer.sheets').filter((s) => Number(s.omr_exam_id) === ex.id).length,
        state: 'done',
      }, userId);
      return { record: updated, message: '25 OMR answer sheets optically graded via Job Queue.' };
    }

    case 'account.move.action_post': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const settings = store.getSettings();
      const etims = settings.etims_enabled ? `ETIMS-KE-${String(inv.id).padStart(6, '0')}` : inv.etims_cu_no;
      const updated = store.write('account.move', id!, { state: 'posted', etims_cu_no: etims }, userId);
      return { record: updated, message: etims ? `Invoice posted & registered with KRA eTIMS (${etims}).` : 'Invoice posted.' };
    }

    case 'account.move.pay_mpesa': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const phone = String(args.phone ?? '+254722000000');
      const amount = Number(args.amount ?? inv.amount_residual ?? inv.amount_total);
      const tx = store.create('payment.transaction', {
        reference: `MPE-${inv.id}-${Date.now().toString().slice(-5)}`,
        provider: 'mpesa', phone, amount, move_id: inv.id, student_id: inv.student_id,
        merchant_request_id: `MR-${Date.now()}`, checkout_request_id: `ws_CO_${Date.now()}`,
        state: 'done', mpesa_receipt: `SLK${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        result_desc: 'The service request is processed successfully.', company_id: inv.company_id,
      }, userId);
      const residual = Math.max(0, Number(inv.amount_residual ?? inv.amount_total) - amount);
      const updated = store.write('account.move', inv.id, {
        amount_residual: residual, payment_state: residual === 0 ? 'paid' : 'partial',
      }, userId);
      return { record: updated, message: `M-Pesa STK Push settled (${tx.mpesa_receipt}). Balance: KES ${residual.toLocaleString()}.` };
    }

    case 'account.move.mark_paid': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const updated = store.write('account.move', id!, { amount_residual: 0, payment_state: 'paid' }, userId);
      return { record: updated, message: 'Invoice reconciled and marked Paid.' };
    }

    case 'account.move.send_invoice': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const partner = inv.partner_id ? store.byId('res.partner', Number(inv.partner_id)) : undefined;
      store.create('comm.outbox', {
        to: partner?.email || partner?.phone || 'parent@example.com',
        recipient_name: partner?.name || 'Customer',
        channel: 'email',
        subject: `Invoice ${inv.name}`,
        body: `Please find attached fee invoice ${inv.name} (${inv.line_description || 'Tuition & Fees'}).`,
        res_model: 'account.move',
        res_id: inv.id,
        state: 'sent',
        company_id: inv.company_id,
      }, userId);
      store.logMessage('account.move', inv.id, `Invoice ${inv.name} sent to ${partner?.email || partner?.name || 'customer'}.`, userId, 'notification');
      return { record: store.hydrate('account.move', inv), message: `Invoice ${inv.name} sent to customer.` };
    }

    case 'account.move.action_register_payment': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const amount = Number(args.amount ?? inv.amount_residual ?? inv.amount_total);
      const journalId = Number(args.journal_id ?? 1);
      const pay = store.create('account.payment', {
        payment_type: 'inbound',
        partner_type: 'customer',
        partner_id: inv.partner_id,
        student_id: inv.student_id,
        amount,
        journal_id: journalId,
        move_id: inv.id,
        memo: `Payment for ${inv.name}`,
        state: 'paid',
        company_id: inv.company_id,
      }, userId);
      const payName = String(pay.name || `PAY/${new Date().getFullYear()}/${String(pay.id).padStart(4, '0')}`);
      if (!pay.name) store.write('account.payment', pay.id, { name: payName }, userId);
      const residual = Math.max(0, Number(inv.amount_residual ?? inv.amount_total) - amount);
      const paymentCount = Number(inv.payment_count ?? 0) + 1;
      const updated = store.write('account.move', inv.id, {
        amount_residual: residual,
        payment_state: residual === 0 ? 'paid' : 'partial',
        payment_count: paymentCount,
      }, userId);
      store.logMessage('account.move', inv.id, `Payment ${payName} of KES ${amount.toLocaleString()} registered via ${args.journal_name || 'Bank/M-Pesa'}.`, userId, 'notification');
      return { record: updated, message: `Payment ${payName} of KES ${amount.toLocaleString()} registered.` };
    }

    case 'account.move.action_reverse': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const cn = store.create('account.move', {
        move_type: inv.move_type === 'in_invoice' ? 'in_refund' : 'out_refund',
        partner_id: inv.partner_id,
        student_id: inv.student_id,
        admission_id: inv.admission_id,
        fee_category: inv.fee_category,
        invoice_date_due: new Date().toISOString().slice(0, 10),
        line_description: `Reversal of ${inv.name}`,
        amount_total: inv.amount_total,
        amount_residual: inv.amount_total,
        state: 'draft',
        payment_state: 'not_paid',
        company_id: inv.company_id,
      }, userId);
      store.create('account.move.line', {
        move_id: cn.id,
        name: `Credit Note for ${inv.name}`,
        account_name: '400000 Academic Tuition Revenue',
        quantity: 1,
        price_unit: Number(inv.amount_total ?? 0),
      }, userId, false);
      return { record: store.hydrate('account.move', inv), message: `Credit note ${cn.name} generated.` };
    }

    case 'account.move.action_invoice_sent': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const partner = inv.partner_id ? store.byId('res.partner', Number(inv.partner_id)) : undefined;
      store.create('comm.outbox', {
        to: partner?.email || partner?.phone || 'parent@example.com',
        recipient_name: partner?.name || 'Customer',
        channel: 'email',
        subject: `Invoice ${inv.name}`,
        body: `Please find attached fee invoice ${inv.name} (${inv.line_description || 'Tuition & Fees'}).`,
        res_model: 'account.move',
        res_id: inv.id,
        state: 'sent',
        company_id: inv.company_id,
      }, userId);
      store.logMessage('account.move', inv.id, `Invoice ${inv.name} sent to ${partner?.email || partner?.name || 'customer'}.`, userId, 'notification');
      return { record: store.hydrate('account.move', inv), message: `Invoice ${inv.name} sent to customer.` };
    }

    case 'account.move.action_print_pdf': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      return { record: store.hydrate('account.move', inv), message: `Generated PDF print layout for ${inv.name}.` };
    }

    case 'account.move.button_cancel': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const updated = store.write('account.move', id!, { state: 'cancel' }, userId);
      return { record: updated, message: `Invoice ${inv.name} cancelled.` };
    }

    case 'account.move.button_draft': {
      const inv = store.byId('account.move', id!);
      if (!inv) throw new Error('Invoice not found');
      const updated = store.write('account.move', id!, { state: 'draft' }, userId);
      return { record: updated, message: `Invoice ${inv.name} reset to draft.` };
    }

    case 'account.payment.action_refund_wizard': {
      const pay = store.byId('account.payment', id!);
      if (!pay) throw new Error('Payment not found');
      return { record: pay, message: `Refund wizard initialized for payment ${pay.name}.` };
    }

    case 'account.asset.asset.compute_depreciation_board': {
      const ast = store.byId('account.asset.asset', id!);
      if (!ast) throw new Error('Asset not found');
      const gross = Number(ast.value ?? 0);
      const salvage = Number(ast.salvage_value ?? 0);
      const depreciable = Math.max(0, gross - salvage);
      const residual = depreciable * 0.8; // Year 1 depreciation
      const updated = store.write('account.asset.asset', id!, { value_residual: residual }, userId);
      return { record: updated, message: `Computed depreciation board: residual value KES ${residual.toLocaleString()}.` };
    }

    case 'account.batch.payment.print_batch_payment': {
      const batch = store.byId('account.batch.payment', id!);
      if (!batch) throw new Error('Batch payment not found');
      return { record: batch, message: `Batch payment report generated for ${batch.name}.` };
    }

    case 'account.asset.request.approved_progressbar': {
      const req = store.byId('account.asset.request', id!);
      if (!req) throw new Error('Asset request not found');
      const updated = store.write('account.asset.request', id!, {
        state: 'approved',
        approve_date: new Date().toISOString().slice(0, 10),
      }, userId);
      return { record: updated, message: `Asset request ${req.name} approved.` };
    }

    case 'account.asset.request.allocate_progressbar': {
      const req = store.byId('account.asset.request', id!);
      if (!req) throw new Error('Asset request not found');
      const updated = store.write('account.asset.request', id!, {
        state: 'allocate',
        allocate_date: new Date().toISOString().slice(0, 10),
      }, userId);
      return { record: updated, message: `Asset allocated to ${req.request_for}.` };
    }

    case 'account.asset.request.return_progressbar': {
      const req = store.byId('account.asset.request', id!);
      if (!req) throw new Error('Asset request not found');
      const updated = store.write('account.asset.request', id!, {
        state: 'returned',
        return_date: new Date().toISOString().slice(0, 10),
      }, userId);
      return { record: updated, message: `Asset marked as returned.` };
    }

    case 'account.asset.request.reject_progressbar': {
      const req = store.byId('account.asset.request', id!);
      if (!req) throw new Error('Asset request not found');
      const updated = store.write('account.asset.request', id!, {
        state: 'rejected',
        reject_date: new Date().toISOString().slice(0, 10),
      }, userId);
      return { record: updated, message: `Asset request rejected.` };
    }

    case 'crm.lead.convert_to_student': {
      const lead = store.byId('crm.lead', id!);
      if (!lead) throw new Error('Lead not found');
      const parts = String(lead.contact_name || lead.name).split(' ');
      const adm = store.create('op.admission', {
        first_name: parts[0] || 'Applicant',
        last_name: parts.slice(1).join(' ') || 'Student',
        email: lead.email_from || 'applicant@example.com',
        phone: lead.phone || '+254700000000',
        course_id: lead.target_course || 1,
        company_id: lead.target_campus || lead.company_id,
        state: 'submit',
      }, userId);
      const updated = store.write('crm.lead', id!, { stage: 'won' }, userId);
      return { record: updated, message: `Lead converted to Admission Application ${adm.application_number}.` };
    }

    case 'op.notice.action_to_publish':
    case 'op.notice.publish':
    case 'op.circular.action_publish':
    case 'op.circular.publish': {
      const rec = store.byId(model, id!);
      if (!rec) throw new Error('Record not found');
      const updated = store.write(model, id!, { state: 'published' }, userId);
      store.create('comm.outbox', {
        to: 'All Parents & Staff', recipient_name: String(rec.target_audience ?? 'Campus Broadcast'),
        channel: 'whatsapp', subject: rec.name, body: rec.subject, res_model: model, res_id: id,
        provider: store.getSettings().whatsapp_provider || 'simulate', state: 'sent', company_id: rec.company_id,
      }, userId);
      return { record: updated, message: 'Published and queued for parent/staff broadcast.' };
    }

    case 'mailing.mailing.action_launch':
    case 'mailing.mailing.send_now': {
      const mail = store.byId('mailing.mailing', id!);
      if (!mail) throw new Error('Mailing not found');
      const updated = store.write('mailing.mailing', id!, {
        state: 'done',
        sent: Number(mail.sent ?? 145),
        sent_count: Number(mail.sent_count ?? 145),
        open_rate: Number(mail.open_rate ?? 68),
      }, userId);
      store.create('comm.outbox', {
        to: String(mail.target_audience || 'All Enrolled Parents'),
        recipient_name: String(mail.target_audience || 'Parents'),
        channel: 'email',
        subject: mail.subject,
        body: String(mail.body_html || mail.subject),
        res_model: 'mailing.mailing',
        res_id: mail.id,
        state: 'sent',
        company_id: mail.company_id,
      }, userId);
      return { record: updated, message: `Email campaign "${mail.subject}" launched and delivered.` };
    }

    case 'whatsapp.campaign.action_start_campaign':
    case 'whatsapp.campaign.start': {
      const wc = store.byId('whatsapp.campaign', id!);
      if (!wc) throw new Error('WhatsApp campaign not found');
      const updated = store.write('whatsapp.campaign', id!, {
        state: 'running',
        sent_count: Number(wc.total_participant_count ?? 120),
      }, userId);
      store.create('comm.outbox', {
        to: String(wc.target_model || 'Parents & Guardians'),
        recipient_name: String(wc.target_model || 'Parents'),
        channel: 'whatsapp',
        subject: wc.name,
        body: wc.message_preview,
        res_model: 'whatsapp.campaign',
        res_id: wc.id,
        state: 'sent',
        company_id: wc.company_id,
      }, userId);
      return { record: updated, message: `WhatsApp broadcast "${wc.name}" started.` };
    }

    case 'whatsapp.campaign.generate_campaign_participants': {
      const wc = store.byId('whatsapp.campaign', id!);
      if (!wc) throw new Error('WhatsApp campaign not found');
      const contact = store.all('whatsapp.contact')[0] || store.create('whatsapp.contact', {
        name: 'Mr. Rajesh Shah',
        mobile: '+254722810400',
        company_id: wc.company_id,
      }, userId);
      store.create('whatsapp.campaign.participants', {
        name: contact.name,
        campaign_id: wc.id,
        contact_id: contact.id,
        state: 'running',
        company_id: wc.company_id,
      }, userId);
      const count = store.all('whatsapp.campaign.participants').filter((p) => Number(p.campaign_id) === wc.id).length;
      const updated = store.write('whatsapp.campaign', id!, { total_participant_count: count }, userId);
      return { record: updated, message: `Generated ${count} campaign participant(s).` };
    }

    case 'calendar.event.generate_meeting_link': {
      const ev = store.byId('calendar.event', id!);
      if (!ev) throw new Error('Calendar event not found');
      const url = `https://meet.google.com/oerb-${ev.id}-live`;
      const updated = store.write('calendar.event', id!, { meeting_url: url }, userId);
      return { record: updated, message: `Generated online meeting link: ${url}` };
    }

    case 'e.sign.template.create_request': {
      const tpl = store.byId('e.sign.template', id!);
      if (!tpl) throw new Error('E-Sign template not found');
      const req = store.create('e.sign.request', {
        template_id: tpl.id,
        signer_name: String(args.signer_name || 'Mr. Rajesh Shah'),
        signer_email: String(args.signer_email || 'parent@oshwalacademy.sc.ke'),
        signers_summary: `${tpl.roles_required || 'Parent / Guardian'} -> Registrar`,
        state: 'sent',
        company_id: tpl.company_id,
      }, userId);
      return { record: req, message: `E-Sign request ${req.name} created and sent for signature.` };
    }

    case 'helpdesk.ticket.action_assign_to_me':
    case 'helpdesk.ticket.assign_me': {
      const tkt = store.byId('helpdesk.ticket', id!);
      if (!tkt) throw new Error('Helpdesk ticket not found');
      const updated = store.write('helpdesk.ticket', id!, {
        user_id: userId,
        stage: 'in_progress',
      }, userId);
      return { record: updated, message: `Ticket ${tkt.ticket_seq} assigned to you.` };
    }

    case 'helpdesk.ticket.action_create_opportunity': {
      const tkt = store.byId('helpdesk.ticket', id!);
      if (!tkt) throw new Error('Helpdesk ticket not found');
      const lead = store.create('crm.lead', {
        name: `Opportunity from Ticket ${tkt.ticket_seq}: ${tkt.issue_name}`,
        contact_name: tkt.partner_name || 'Parent Inquiry',
        email_from: tkt.email || 'inquiry@example.com',
        phone: '+254700000000',
        stage: 'new',
        company_id: tkt.company_id,
      }, userId);
      return { record: store.hydrate('helpdesk.ticket', tkt), message: `Created CRM opportunity "${lead.name}".` };
    }

    case 'e.sign.request.sign_now': {
      const req = store.byId('e.sign.request', id!);
      if (!req) throw new Error('E-Sign request not found');
      const updated = store.write('e.sign.request', id!, { state: 'signed', signed_date: new Date().toISOString().slice(0, 16).replace('T', ' ') }, userId);
      if (req.admission_id) store.write('op.admission', Number(req.admission_id), { state: 'signed' }, userId);
      return { record: updated, message: 'Document digitally signed and timestamped.' };
    }

    case 'ir.cron.run_now': {
      return runCronJob(id!, userId);
    }

    case 'op.assignment.update_mark': {
      const asg = store.byId('op.assignment', id!);
      if (!asg) throw new Error('Assignment not found');
      const subs = store.all('op.assignment.sub.line').filter((s) => Number(s.assignment_id) === id);
      let count = 0;
      for (const sub of subs) {
        const raw = Number(sub.marks ?? 0);
        const penalty = Number(sub.penalty ?? 0);
        const net = Math.max(0, Math.round(raw - (raw * penalty / 100)));
        store.write('op.assignment.sub.line', sub.id, { obtained_mark: net }, userId);
        count++;
      }
      const updated = store.write('op.assignment', id!, { mark_update: true }, userId);
      return { record: updated, message: `Updated and recalculated marks across ${count} assignment submission(s).` };
    }

    case 'op.assignment.sub.line.action_open_pdf_view': {
      const sub = store.byId('op.assignment.sub.line', id!);
      if (!sub) throw new Error('Submission not found');
      return { record: sub, message: `Opened Rubric Assessment evaluation workspace for student #${sub.student_id}.` };
    }

    case 'op.assignment.sub.line.ignore_submission_attempt': {
      const sub = store.byId('op.assignment.sub.line', id!);
      if (!sub) throw new Error('Submission not found');
      const updated = store.write('op.assignment.sub.line', id!, { ignore: true, state: 'ignore' }, userId);
      return { record: updated, message: 'Submission attempt marked as ignored.' };
    }

    case 'op.assignment.sub.line.annotate_submission': {
      const sub = store.byId('op.assignment.sub.line', id!);
      if (!sub) throw new Error('Submission not found');
      const updated = store.write('op.assignment.sub.line', id!, {
        feedback_data_json: JSON.stringify({ annotated: true, timestamp: new Date().toISOString() }),
      }, userId);
      return { record: updated, message: 'Annotated submission saved successfully.' };
    }

    case 'op.rubric.template.action_expire_template': {
      const rub = store.byId('op.rubric.template', id!);
      if (!rub) throw new Error('Rubric template not found');
      const updated = store.write('op.rubric.template', id!, {
        state: 'expire',
        template_expired: true,
        template_expired_date: new Date().toISOString(),
        template_expired_by: userId,
      }, userId);
      return { record: updated, message: 'Rubric template marked as expired.' };
    }

    case 'op.course.create_online_course': {
      const crs = store.byId('op.course', id!);
      if (!crs) throw new Error('Course not found');
      const updated = store.write('op.course', id!, {
        online_course_created: true,
        online_course: true,
        is_lms_published: true,
        website_published: true,
        is_published: true,
        state: 'open',
      }, userId);
      const existing = store.all('op.course.module').filter((m) => Number(m.course_id) === id);
      if (existing.length === 0) {
        store.create('op.course.module', {
          name: `${crs.name} — Syllabus & Course Overview`,
          course_id: id,
          sequence: 10,
          module_category: 'document',
          source_type: 'local_file',
          is_published: true,
          website_published: true,
          completion_time: 1.0,
          company_id: crs.company_id,
        }, userId);
        store.write('op.course', id!, { total_modules: 1 }, userId);
      }
      return { record: updated, message: 'Online course successfully created and published on LMS.' };
    }

    case 'op.course.enroll_learner': {
      const crs = store.byId('op.course', id!);
      if (!crs) throw new Error('Course not found');
      const learnerId = Number(args.user_id ?? userId);
      const enr = store.create('op.course.enrollment', {
        course_id: id,
        user_id: learnerId,
        enrollment_date: new Date().toISOString(),
        state: 'in_progress',
        progress: 0,
        company_id: crs.company_id,
      }, userId);
      const modules = store.all('op.course.module').filter((m) => Number(m.course_id) === id);
      for (const m of modules) {
        store.create('op.course.enrollment.line', {
          enrollment_id: enr.id,
          module_id: m.id,
          is_completed: false,
          company_id: crs.company_id,
        }, userId);
      }
      store.write('op.course', id!, { total_enrollment: (Number(crs.total_enrollment) || 0) + 1 }, userId);
      return { record: enr, message: `Successfully enrolled learner in ${crs.name}.` };
    }

    case 'op.course.enrollment.action_complete': {
      const enr = store.byId('op.course.enrollment', id!);
      if (!enr) throw new Error('Enrollment not found');
      const updated = store.write('op.course.enrollment', id!, {
        state: 'done',
        progress: 100,
        completion_date: new Date().toISOString(),
      }, userId);
      const lines = store.all('op.course.enrollment.line').filter((l) => Number(l.enrollment_id) === id);
      for (const l of lines) {
        store.write('op.course.enrollment.line', l.id, {
          is_completed: true,
          completion_date: new Date().toISOString(),
        }, userId);
      }
      return { record: updated, message: 'Course enrollment marked as completed (100%).' };
    }

    case 'op.course.enrollment.action_start': {
      const enr = store.byId('op.course.enrollment', id!);
      if (!enr) throw new Error('Enrollment not found');
      const updated = store.write('op.course.enrollment', id!, { state: 'in_progress' }, userId);
      return { record: updated, message: 'Course enrollment in progress.' };
    }

    case 'op.course.enrollment.action_reset': {
      const enr = store.byId('op.course.enrollment', id!);
      if (!enr) throw new Error('Enrollment not found');
      const updated = store.write('op.course.enrollment', id!, {
        state: 'draft',
        progress: 0,
        completion_date: null,
      }, userId);
      return { record: updated, message: 'Course enrollment reset to draft.' };
    }

    case 'op.course.module.act_publish': {
      const mod = store.byId('op.course.module', id!);
      if (!mod) throw new Error('Module not found');
      const updated = store.write('op.course.module', id!, {
        is_published: true,
        website_published: true,
      }, userId);
      return { record: updated, message: 'Course module published.' };
    }

    case 'op.course.module.act_unpublish': {
      const mod = store.byId('op.course.module', id!);
      if (!mod) throw new Error('Module not found');
      const updated = store.write('op.course.module', id!, {
        is_published: false,
        website_published: false,
      }, userId);
      return { record: updated, message: 'Course module unpublished.' };
    }

    case 'op.quiz.action_confirm': {
      const q = store.byId('op.quiz', id!);
      if (!q) throw new Error('Quiz not found');
      const updated = store.write('op.quiz', id!, { state: 'open', active: true }, userId);
      return { record: updated, message: `Quiz "${q.name}" confirmed and opened for students.` };
    }

    case 'op.quiz.view_quiz': {
      const q = store.byId('op.quiz', id!);
      if (!q) throw new Error('Quiz not found');
      const questions = store.all('op.quiz.line').filter((l) => Number(l.quiz_id) === id);
      return { record: store.hydrate('op.quiz', q), message: `Previewing quiz "${q.name}" (${questions.length} question(s)).` };
    }

    case 'op.quiz.action_done': {
      const q = store.byId('op.quiz', id!);
      if (!q) throw new Error('Quiz not found');
      const updated = store.write('op.quiz', id!, { state: 'done' }, userId);
      return { record: updated, message: `Quiz "${q.name}" marked as done.` };
    }

    case 'op.quiz.action_cancel': {
      const q = store.byId('op.quiz', id!);
      if (!q) throw new Error('Quiz not found');
      const updated = store.write('op.quiz', id!, { state: 'cancel' }, userId);
      return { record: updated, message: `Quiz "${q.name}" closed.` };
    }

    case 'op.quiz.action_draft': {
      const q = store.byId('op.quiz', id!);
      if (!q) throw new Error('Quiz not found');
      const updated = store.write('op.quiz', id!, { state: 'draft' }, userId);
      return { record: updated, message: `Quiz "${q.name}" re-opened to draft.` };
    }

    case 'op.quiz.result.get_action_submit': {
      const res = store.byId('op.quiz.result', id!);
      if (!res) throw new Error('Quiz result not found');
      const updated = store.write('op.quiz.result', id!, {
        state: 'submit',
        submit_date: new Date().toISOString(),
      }, userId);
      return { record: updated, message: 'Quiz attempt submitted for grading.' };
    }

    case 'op.quiz.result.get_action_asses': {
      const res = store.byId('op.quiz.result', id!);
      if (!res) throw new Error('Quiz result not found');
      const updated = store.write('op.quiz.result', id!, {
        state: 'asses',
      }, userId);
      return { record: updated, message: 'Quiz attempt moved to assessment.' };
    }

    case 'op.quiz.result.get_action_done': {
      const res = store.byId('op.quiz.result', id!);
      if (!res) throw new Error('Quiz result not found');
      const lines = store.all('op.quiz.result.line').filter((l) => Number(l.result_id) === id);
      const totalMarks = Number(res.total_marks || lines.reduce((acc, l) => acc + Number(l.question_mark || 0), 0) || 20);
      const receivedMarks = lines.reduce((acc, l) => acc + Number(l.mark || 0), 0);
      const score = totalMarks > 0 ? Math.round((receivedMarks / totalMarks) * 100 * 10) / 10 : 0;
      const totalCorrect = lines.filter((l) => Number(l.mark || 0) > 0).length;
      const totalIncorrect = lines.length - totalCorrect;
      const updated = store.write('op.quiz.result', id!, {
        state: 'done',
        finish_date: new Date().toISOString(),
        received_marks: receivedMarks,
        score,
        total_marks: totalMarks,
        total_question: lines.length,
        total_correct: totalCorrect,
        total_incorrect: totalIncorrect,
      }, userId);
      return { record: updated, message: `Quiz result finalized. Score: ${score}% (${receivedMarks}/${totalMarks} marks).` };
    }

    case 'op.quiz.result.get_action_re_open': {
      const res = store.byId('op.quiz.result', id!);
      if (!res) throw new Error('Quiz result not found');
      const updated = store.write('op.quiz.result', id!, { state: 'open' }, userId);
      return { record: updated, message: 'Quiz attempt reopened.' };
    }

    case 'op.media.movement.issue_media': {
      const mov = store.byId('op.media.movement', id!);
      if (!mov) throw new Error('Movement not found');
      const updated = store.write('op.media.movement', id!, {
        state: 'issue',
        issued_date: new Date().toISOString(),
        return_date: mov.return_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      }, userId);
      if (mov.media_unit_id) {
        store.write('op.media.unit', Number(mov.media_unit_id), { state: 'issue' }, userId);
      }
      return { record: updated, message: 'Media unit issued successfully.' };
    }

    case 'op.media.movement.renew_media':
    case 'op.media.movement.renew': {
      const mov = store.byId('op.media.movement', id!);
      if (!mov) throw new Error('Movement not found');
      const curReturn = mov.return_date ? new Date(String(mov.return_date)).getTime() : Date.now();
      const newReturn = new Date(curReturn + 14 * 86400000).toISOString();
      const updated = store.write('op.media.movement', id!, {
        return_date: newReturn,
        is_renew: true,
      }, userId);
      return { record: updated, message: `Loan renewed (+14 days). New return due: ${newReturn.slice(0, 10)}.` };
    }

    case 'op.media.movement.return_media':
    case 'op.media.movement.return': {
      const mov = store.byId('op.media.movement', id!);
      if (!mov) throw new Error('Movement not found');
      const now = new Date();
      const dueDate = mov.return_date ? new Date(String(mov.return_date)) : now;
      let penalty = Number(mov.penalty ?? 0);
      if (now.getTime() > dueDate.getTime() && penalty === 0) {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
        penalty = daysOverdue * 50; // KES 50/day statutory standard
      }
      const updated = store.write('op.media.movement', id!, {
        state: 'return',
        actual_return_date: now.toISOString(),
        penalty,
      }, userId);
      if (mov.media_unit_id) {
        store.write('op.media.unit', Number(mov.media_unit_id), { state: 'available' }, userId);
      }
      const penaltyMsg = penalty > 0 ? ` Overdue fine: KES ${penalty.toLocaleString()}.` : '';
      return { record: updated, message: `Media unit returned successfully.${penaltyMsg}` };
    }

    case 'op.media.movement.create_penalty_invoice': {
      const mov = store.byId('op.media.movement', id!);
      if (!mov) throw new Error('Movement not found');
      const penalty = Number(mov.penalty ?? 0);
      if (penalty <= 0) throw new Error('No penalty due on this movement');
      const student = mov.student_id ? store.byId('op.student', Number(mov.student_id)) : undefined;
      const inv = store.create('account.move', {
        move_type: 'out_invoice',
        partner_id: student?.partner_id,
        student_id: mov.student_id,
        fee_category: 'library_fine',
        line_description: `Library Overdue Fine (Movement #${mov.id})`,
        amount_total: penalty,
        amount_residual: penalty,
        state: 'posted',
        payment_state: 'not_paid',
        company_id: mov.company_id,
      }, userId);
      const updated = store.write('op.media.movement', id!, { invoice_id: inv.id }, userId);
      return { record: updated, message: `Penalty invoice ${inv.name} for KES ${penalty.toLocaleString()} created and posted.` };
    }

    case 'op.media.unit.issue_media': {
      const unit = store.byId('op.media.unit', id!);
      if (!unit) throw new Error('Media unit not found');
      const updated = store.write('op.media.unit', id!, { state: 'issue' }, userId);
      return { record: updated, message: `Media unit ${unit.name} marked as issued.` };
    }

    case 'op.media.unit.return_media': {
      const unit = store.byId('op.media.unit', id!);
      if (!unit) throw new Error('Media unit not found');
      const updated = store.write('op.media.unit', id!, { state: 'available' }, userId);
      return { record: updated, message: `Media unit ${unit.name} returned to available inventory.` };
    }

    case 'op.media.queue.do_accept':
    case 'op.media.queue.accept': {
      const q = store.byId('op.media.queue', id!);
      if (!q) throw new Error('Queue request not found');
      const updated = store.write('op.media.queue', id!, { state: 'accept' }, userId);
      return { record: updated, message: `Queue request ${q.name} accepted.` };
    }

    case 'op.media.queue.do_reject': {
      const q = store.byId('op.media.queue', id!);
      if (!q) throw new Error('Queue request not found');
      const updated = store.write('op.media.queue', id!, { state: 'reject' }, userId);
      return { record: updated, message: `Queue request ${q.name} rejected.` };
    }

    case 'op.media.queue.do_request_again': {
      const q = store.byId('op.media.queue', id!);
      if (!q) throw new Error('Queue request not found');
      const updated = store.write('op.media.queue', id!, { state: 'request' }, userId);
      return { record: updated, message: `Queue request ${q.name} re-submitted.` };
    }

    case 'op.media.purchase.act_requested': {
      const p = store.byId('op.media.purchase', id!);
      if (!p) throw new Error('Purchase request not found');
      const updated = store.write('op.media.purchase', id!, { state: 'request' }, userId);
      return { record: updated, message: `Media purchase request ${p.name} submitted for librarian approval.` };
    }

    case 'op.media.purchase.act_accept':
    case 'op.media.purchase.approve': {
      const p = store.byId('op.media.purchase', id!);
      if (!p) throw new Error('Purchase request not found');
      const updated = store.write('op.media.purchase', id!, { state: 'accept' }, userId);
      return { record: updated, message: `Media purchase request ${p.name} approved.` };
    }

    case 'op.media.purchase.act_reject': {
      const p = store.byId('op.media.purchase', id!);
      if (!p) throw new Error('Purchase request not found');
      const updated = store.write('op.media.purchase', id!, { state: 'reject' }, userId);
      return { record: updated, message: `Media purchase request ${p.name} rejected.` };
    }

    case 'barcode.issue.media.action_issue': {
      const barcode = String(args.barcode || '');
      const type = String(args.transaction_type || 'issue');
      const card = args.library_card_id ? store.byId('op.library.card', Number(args.library_card_id)) : undefined;
      const unit = barcode ? store.all('op.media.unit').find((u) => u.barcode === barcode) : (args.media_unit_id ? store.byId('op.media.unit', Number(args.media_unit_id)) : undefined);
      if (!unit) throw new Error(`Media unit with barcode "${barcode}" not found`);

      if (type === 'issue') {
        if (!card) throw new Error('Library card required to issue media');
        const mov = store.create('op.media.movement', {
          media_id: unit.media_id,
          media_unit_id: unit.id,
          library_card_id: card.id,
          student_id: card.student_id,
          faculty_id: card.faculty_id,
          type: card.type || 'student',
          state: 'issue',
          issued_date: new Date().toISOString(),
          return_date: new Date(Date.now() + 14 * 86400000).toISOString(),
          company_id: card.company_id,
        }, userId);
        store.write('op.media.unit', unit.id, { state: 'issue' }, userId);
        return { record: mov, message: `Media unit "${unit.name}" issued to ${card.number}.` };
      } else {
        const activeMov = store.all('op.media.movement').find((m) => Number(m.media_unit_id) === unit.id && m.state === 'issue');
        if (activeMov) {
          executeMethod('op.media.movement', 'return_media', activeMov.id, {}, userId);
        } else {
          store.write('op.media.unit', unit.id, { state: 'available' }, userId);
        }
        return { record: unit, message: `Media unit "${unit.name}" returned via barcode scan.` };
      }
    }

    case 'op.digital.library.material.enroll_learner': {
      const mat = store.byId('op.digital.library.material', id!);
      if (!mat) throw new Error('Digital material not found');
      const learnerId = Number(args.user_id ?? userId);
      const enr = store.create('op.digital.library.enrollment', {
        material_id: id,
        user_id: learnerId,
        student_id: args.student_id ? Number(args.student_id) : undefined,
        enrollment_date: new Date().toISOString(),
        state: 'in_progress',
        company_id: mat.company_id,
      }, userId);
      return { record: enr, message: `Enrolled in digital material "${mat.name}".` };
    }

    case 'op.digital.library.enrollment.action_complete': {
      const enr = store.byId('op.digital.library.enrollment', id!);
      if (!enr) throw new Error('Digital enrollment not found');
      const updated = store.write('op.digital.library.enrollment', id!, {
        state: 'completed',
        last_access: new Date().toISOString(),
      }, userId);
      return { record: updated, message: 'Digital library material marked as completed.' };
    }

    case 'op.digital.library.enrollment.action_reset': {
      const enr = store.byId('op.digital.library.enrollment', id!);
      if (!enr) throw new Error('Digital enrollment not found');
      const updated = store.write('op.digital.library.enrollment', id!, {
        state: 'in_progress',
      }, userId);
      return { record: updated, message: 'Digital library material enrollment reset to in progress.' };
    }

    case 'op.route.register.close_register': {
      const reg = store.byId('op.route.register', id!);
      if (!reg) throw new Error('Route register not found');
      const updated = store.write('op.route.register', id!, { state: 'confirm' }, userId);
      return { record: updated, message: `Route register "${reg.name}" confirmed.` };
    }

    case 'op.route.register.register_gathering': {
      const reg = store.byId('op.route.register', id!);
      if (!reg) throw new Error('Route register not found');
      const updated = store.write('op.route.register', id!, { state: 'gathering' }, userId);
      return { record: updated, message: `Route register "${reg.name}" opened for student registration.` };
    }

    case 'op.route.register.cancel_register': {
      const reg = store.byId('op.route.register', id!);
      if (!reg) throw new Error('Route register not found');
      const updated = store.write('op.route.register', id!, { state: 'cancel' }, userId);
      return { record: updated, message: `Route register "${reg.name}" cancelled.` };
    }

    case 'op.route.register.set_to_draft': {
      const reg = store.byId('op.route.register', id!);
      if (!reg) throw new Error('Route register not found');
      const updated = store.write('op.route.register', id!, { state: 'draft' }, userId);
      return { record: updated, message: `Route register "${reg.name}" reset to draft.` };
    }

    case 'op.route.line.start_trip': {
      const trip = store.byId('op.route.line', id!);
      if (!trip) throw new Error('Trip not found');
      const updated = store.write('op.route.line', id!, { state: 'start' }, userId);
      return { record: updated, message: `Trip "${trip.name}" started.` };
    }

    case 'op.route.line.end_trip': {
      const trip = store.byId('op.route.line', id!);
      if (!trip) throw new Error('Trip not found');
      const updated = store.write('op.route.line', id!, { state: 'end' }, userId);
      return { record: updated, message: `Trip "${trip.name}" completed.` };
    }

    case 'op.transportation.agreement.submit_form': {
      const ag = store.byId('op.transportation.agreement', id!);
      if (!ag) throw new Error('Agreement not found');
      const updated = store.write('op.transportation.agreement', id!, { state: 'submit' }, userId);
      return { record: updated, message: 'Transportation agreement submitted.' };
    }

    case 'op.transportation.agreement.confirm_in_progress': {
      const ag = store.byId('op.transportation.agreement', id!);
      if (!ag) throw new Error('Agreement not found');
      const updated = store.write('op.transportation.agreement', id!, { state: 'confirm' }, userId);
      return { record: updated, message: 'Transportation agreement confirmed.' };
    }

    case 'op.transportation.agreement.agreement_confirm': {
      const ag = store.byId('op.transportation.agreement', id!);
      if (!ag) throw new Error('Agreement not found');
      const updated = store.write('op.transportation.agreement', id!, { state: 'agreement' }, userId);
      return { record: updated, message: 'Transportation agreement approved.' };
    }

    case 'op.transportation.agreement.enroll_partner': {
      const ag = store.byId('op.transportation.agreement', id!);
      if (!ag) throw new Error('Agreement not found');
      const updated = store.write('op.transportation.agreement', id!, { state: 'done' }, userId);
      return { record: updated, message: 'Student enrolled in transport route.' };
    }

    case 'op.transportation.agreement.invoice_now':
    case 'op.transportation.agreement.get_invoice': {
      const ag = store.byId('op.transportation.agreement', id!);
      if (!ag) throw new Error('Agreement not found');
      const amount = Number(ag.monthly_fee ?? 18500);
      const today = new Date().toISOString().slice(0, 10);
      const inv = store.create('account.move', {
        move_type: 'out_invoice',
        partner_id: ag.partner_id,
        student_id: ag.student_id,
        fee_category: 'transport',
        invoice_date_due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        line_description: `School Transport Fee (Agreement #${ag.id})`,
        amount_total: amount,
        amount_residual: amount,
        state: 'posted',
        payment_state: 'not_paid',
        company_id: ag.company_id,
      }, userId);
      const updated = store.write('op.transportation.agreement', id!, {
        prev_invoice_date: today,
        invoice_id: inv.id,
      }, userId);
      return { record: updated, message: `Transport fee invoice ${inv.name} (KES ${amount.toLocaleString()}) generated.` };
    }

    case 'op.facility.allocation.create_invoice': {
      const alloc = store.byId('op.facility.allocation', id!);
      if (!alloc) throw new Error('Facility allocation not found');
      const amount = Number(alloc.fee_amount ?? 5000);
      const fac = alloc.facility_id ? store.byId('op.campus.facility', Number(alloc.facility_id)) : undefined;
      const inv = store.create('account.move', {
        move_type: 'out_invoice',
        partner_id: alloc.partner_id,
        fee_category: 'facility',
        invoice_date_due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        line_description: `${alloc.product_name || 'Facility Usage Fee'} — ${fac?.name || 'Campus Facility'}`,
        amount_total: amount,
        amount_residual: amount,
        state: 'posted',
        payment_state: 'not_paid',
        company_id: alloc.company_id,
      }, userId);
      const updated = store.write('op.facility.allocation', id!, {
        invoice_id: inv.id,
      }, userId);
      return { record: updated, message: `Facility allocation invoice ${inv.name} (KES ${amount.toLocaleString()}) created.` };
    }

    case 'op.thesis.registration.action_submit_thesis': {
      const reg = store.byId('op.thesis.registration', id!);
      if (!reg) throw new Error('Thesis registration not found');
      const existing = store.all('op.thesis.submission').find((s) => Number(s.registration_id) === reg.id);
      if (!existing) {
        store.create('op.thesis.submission', {
          title: reg.name,
          registration_id: reg.id,
          student_id: reg.student_id,
          examiner_id: reg.supervisor_id,
          submission_date: new Date().toISOString().slice(0, 10),
          state: 'submitted',
          company_id: reg.company_id,
        }, userId);
      }
      const updated = store.write('op.thesis.registration', id!, { state: 'completed' }, userId);
      return { record: updated, message: `Thesis "${reg.name}" submitted and registration completed.` };
    }

    case 'op.thesis.progress.action_provide_feedback': {
      const prog = store.byId('op.thesis.progress', id!);
      if (!prog) throw new Error('Progress report not found');
      const updated = store.write('op.thesis.progress', id!, {
        feedback_date: new Date().toISOString().slice(0, 10),
        supervisor_feedback: String(args.feedback || prog.supervisor_feedback || 'Reviewed by supervisor; methodology and literature review on track.'),
      }, userId);
      return { record: updated, message: 'Supervisor feedback recorded on progress report.' };
    }

    case 'op.thesis.extension.action_hod_approve': {
      const ext = store.byId('op.thesis.extension', id!);
      if (!ext) throw new Error('Extension request not found');
      const updated = store.write('op.thesis.extension', id!, { state: 'approved' }, userId);
      if (ext.registration_id && ext.requested_deadline) {
        store.write('op.thesis.registration', Number(ext.registration_id), {
          final_submission_deadline: ext.requested_deadline,
        }, userId);
      }
      return { record: updated, message: 'Thesis extension approved by HoD and deadline updated.' };
    }

    case 'op.thesis.submission.action_submit_evaluation': {
      const sub = store.byId('op.thesis.submission', id!);
      if (!sub) throw new Error('Thesis submission not found');
      const score = Number(args.total_score ?? sub.total_score ?? 88);
      const updated = store.write('op.thesis.submission', id!, {
        state: 'evaluated',
        total_score: score,
      }, userId);
      return { record: updated, message: `Thesis evaluation submitted (Score: ${score}/100).` };
    }

    case 'event.registration.action_set_done':
    case 'event.registration.checkin': {
      const reg = store.byId('event.registration', id!);
      if (!reg) throw new Error('Event registration not found');
      const updated = store.write('event.registration', id!, { state: 'done' }, userId);
      if (reg.event_id) {
        const ev = store.byId('event.event', Number(reg.event_id));
        if (ev) {
          store.write('event.event', ev.id, { seats_taken: Number(ev.seats_taken ?? 0) + 1 }, userId);
        }
      }
      return { record: updated, message: `Attendee ${reg.name} checked in.` };
    }

    case 'event.registration.action_send_badge_email': {
      const reg = store.byId('event.registration', id!);
      if (!reg) throw new Error('Event registration not found');
      store.create('comm.outbox', {
        to: reg.email || 'attendee@example.com',
        recipient_name: reg.name,
        channel: 'email',
        subject: `Event Pass & Badge — ${reg.name}`,
        body: `Your registration badge for event #${reg.event_id} is ready.`,
        res_model: 'event.registration',
        res_id: reg.id,
        state: 'sent',
        company_id: reg.company_id,
      }, userId);
      return { record: store.hydrate('event.registration', reg), message: `Badge email sent to ${reg.email}.` };
    }

    case 'op.job.applicant.action_offer': {
      const app = store.byId('op.job.applicant', id!);
      if (!app) throw new Error('Job applicant not found');
      const partner = store.all('res.partner')[0];
      store.create('op.placement.offer', {
        partner_id: partner?.id || 1,
        student_id: app.student_id || 1,
        join_date: app.availability || new Date().toISOString().slice(0, 10),
        offer_package: String(app.salary_proposed || app.salary_expected || 'KES 120,000 / Month'),
        training_period: 6,
        training_type: 'months',
        state: 'offer',
        company_id: app.company_id,
      }, userId);
      const updated = store.write('op.job.applicant', id!, {
        is_offer: true,
        state: 'contract_proposal',
      }, userId);
      return { record: updated, message: `Placement offer sent to ${app.name}.` };
    }

    case 'op.alumni.group.createforum': {
      const grp = store.byId('op.alumni.group', id!);
      if (!grp) throw new Error('Alumni group not found');
      const updated = store.write('op.alumni.group', id!, {
        forum_id: `FORUM-ALU-${grp.id}`,
      }, userId);
      return { record: updated, message: `Alumni forum created for "${grp.name}".` };
    }

    case 'oe.onboarding.steps.step_done':
    case 'oe.onboarding.steps.mark_done': {
      const st = store.byId('oe.onboarding.steps', id!);
      if (!st) throw new Error('Onboarding step not found');
      const updated = store.write('oe.onboarding.steps', id!, {
        is_done: true,
        completed: true,
      }, userId);
      return { record: updated, message: `Onboarding step "${st.name}" marked as done.` };
    }

    case 'hr.applicant.hire': {
      const app = store.byId('hr.applicant', id!);
      if (!app) throw new Error('Applicant not found');
      const job = app.job_id ? store.byId('hr.job', Number(app.job_id)) : undefined;
      const dept = store.all('hr.department')[0];
      const emp = store.create('hr.employee', {
        name: app.partner_name || app.name,
        job_title: job?.name || app.name || 'Teaching Faculty',
        job_id: app.job_id,
        department_id: job?.department_id || dept?.id || 1,
        work_email: app.email_from || 'staff@oshwal.ac.ke',
        work_phone: app.partner_phone || '+254700000000',
        employee_type: 'faculty',
        dbs_verified: Boolean(app.police_clearance_verified),
        company_id: app.company_id,
      }, userId);
      const updated = store.write('hr.applicant', id!, { stage: 'hired' }, userId);
      return { record: updated, message: `Hired ${emp.name} and created Employee record #${emp.id}.` };
    }

    case 'hr.expense.action_post': {
      const exp = store.byId('hr.expense', id!);
      if (!exp) throw new Error('Expense not found');
      const partner = store.all('res.partner')[0];
      const move = store.create('account.move', {
        move_type: 'in_invoice',
        partner_id: partner?.id || 1,
        fee_category: 'other',
        invoice_date: exp.date || new Date().toISOString().slice(0, 10),
        invoice_date_due: exp.date || new Date().toISOString().slice(0, 10),
        line_description: `Staff Expense Reimbursement: ${exp.name}`,
        amount_total: Number(exp.total_amount ?? 0),
        amount_residual: Number(exp.total_amount ?? 0),
        state: 'posted',
        payment_state: 'not_paid',
        company_id: exp.company_id,
      }, userId);
      const updated = store.write('hr.expense', id!, {
        state: 'posted',
        account_move_id: move.id,
      }, userId);
      return { record: updated, message: `Expense posted to accounting journal entry ${move.name}.` };
    }

    case 'multi.approval.type.create_request': {
      const aType = store.byId('multi.approval.type', id!);
      if (!aType) throw new Error('Approval type not found');
      const req = store.create('multi.request', {
        name: `${aType.name} Request`,
        approval_type_id: aType.id,
        user_id: userId,
        date: new Date().toISOString().slice(0, 10),
        reason: `Request initiated from ${aType.name}`,
        state: 'draft',
        company_id: aType.company_id,
      }, userId);
      return { record: req, message: `Created approval request "${req.name}".` };
    }

    case 'multi.request.action_confirm': {
      const req = store.byId('multi.request', id!);
      if (!req) throw new Error('Approval request not found');
      const updated = store.write('multi.request', id!, {
        state: 'pending',
        date_confirmed: new Date().toISOString(),
      }, userId);
      return { record: updated, message: `Approval request "${req.name}" submitted for review.` };
    }

    case 'fleet.vehicle.action_accept_driver_change': {
      const veh = store.byId('fleet.vehicle', id!);
      if (!veh) throw new Error('Vehicle not found');
      const nextDriver = veh.future_driver_id || veh.driver_id;
      const updated = store.write('fleet.vehicle', id!, {
        driver_id: nextDriver,
        future_driver_id: null,
      }, userId);
      return { record: updated, message: `Driver assignment updated on ${veh.name}.` };
    }

    case 'sale.order.action_confirm':
    case 'sale.order.confirm': {
      const so = store.byId('sale.order', id!);
      if (!so) throw new Error('Sales order not found');
      const updated = store.write('sale.order', id!, {
        state: 'sale',
        invoice_status: 'to invoice',
      }, userId);
      return { record: updated, message: `Sales order ${so.name} confirmed.` };
    }

    case 'sale.order.create_invoice': {
      const so = store.byId('sale.order', id!);
      if (!so) throw new Error('Sales order not found');
      const amount = Number(so.amount_total ?? 0);
      const inv = store.create('account.move', {
        move_type: 'out_invoice',
        partner_id: so.partner_id,
        fee_category: 'other',
        invoice_date: new Date().toISOString().slice(0, 10),
        invoice_date_due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        line_description: so.order_summary || `Sales Order ${so.name}`,
        amount_total: amount,
        amount_residual: amount,
        ref: so.name,
        state: 'posted',
        payment_state: 'not_paid',
        company_id: so.company_id,
      }, userId);
      const updated = store.write('sale.order', id!, {
        invoice_status: 'invoiced',
        invoice_count: Number(so.invoice_count ?? 0) + 1,
      }, userId);
      return { record: updated, message: `Customer invoice ${inv.name} created from ${so.name}.` };
    }

    case 'purchase.order.button_confirm':
    case 'purchase.order.confirm': {
      const po = store.byId('purchase.order', id!);
      if (!po) throw new Error('Purchase order not found');
      const updated = store.write('purchase.order', id!, {
        state: 'purchase',
        date_approve: new Date().toISOString(),
        incoming_picking_count: Math.max(1, Number(po.incoming_picking_count ?? 1)),
      }, userId);
      return { record: updated, message: `Purchase order ${po.name} confirmed.` };
    }

    case 'purchase.order.action_view_picking': {
      const po = store.byId('purchase.order', id!);
      if (!po) throw new Error('Purchase order not found');
      const pick = store.create('stock.picking', {
        picking_type: 'incoming',
        picking_type_id: po.picking_type_id || 1,
        partner_id: po.partner_id,
        origin: po.name,
        items_summary: po.order_summary || `Receipt for ${po.name}`,
        state: 'assigned',
        company_id: po.company_id,
      }, userId);
      return { record: store.hydrate('purchase.order', po), message: `Created incoming receipt ${pick.name} for ${po.name}.` };
    }

    case 'stock.picking.button_validate':
    case 'stock.picking.validate': {
      const pick = store.byId('stock.picking', id!);
      if (!pick) throw new Error('Inventory transfer not found');
      const updated = store.write('stock.picking', id!, {
        state: 'done',
        date_done: new Date().toISOString(),
      }, userId);
      return { record: updated, message: `Transfer ${pick.name} validated and completed.` };
    }

    case 'stock.scrap.action_validate': {
      const sc = store.byId('stock.scrap', id!);
      if (!sc) throw new Error('Scrap order not found');
      const updated = store.write('stock.scrap', id!, {
        state: 'done',
        date_done: new Date().toISOString(),
      }, userId);
      return { record: updated, message: `Scrap order ${sc.name} validated.` };
    }

    case 'stock.warehouse.orderpoint.action_replenish': {
      const op = store.byId('stock.warehouse.orderpoint', id!);
      if (!op) throw new Error('Replenishment rule not found');
      const partner = store.all('res.partner')[0];
      const prod = op.product_id ? store.byId('product.template', Number(op.product_id)) : undefined;
      const qty = Number(op.qty_to_order ?? 25);
      const po = store.create('purchase.order', {
        partner_id: partner?.id || 1,
        order_summary: `${qty}x ${prod?.name || 'Replenished Item'}`,
        amount_total: qty * Number(prod?.list_price ?? 1500),
        state: 'draft',
        company_id: op.company_id,
      }, userId);
      return { record: store.hydrate('stock.warehouse.orderpoint', op), message: `Created RFQ ${po.name} for replenishment.` };
    }

    case 'crm.lead.action_sale_quotations_new': {
      const lead = store.byId('crm.lead', id!);
      if (!lead) throw new Error('Lead not found');
      const partner = lead.partner_id || store.all('res.partner')[0]?.id || 1;
      const so = store.create('sale.order', {
        partner_id: partner,
        amount_total: Number(lead.expected_revenue ?? 950000),
        order_summary: `Tuition / Enrollment Quotation for ${lead.name}`,
        state: 'draft',
        company_id: lead.company_id,
      }, userId);
      const updated = store.write('crm.lead', id!, {
        quotation_count: Number(lead.quotation_count ?? 0) + 1,
      }, userId);
      return { record: updated, message: `Created quotation ${so.name} from opportunity.` };
    }

    case 'res.users.role.sync_base_permissions': {
      const role = store.byId('res.users.role', id!);
      if (!role) throw new Error('Role not found');
      const baseRole = (role.base_role || 'faculty') as 'admin' | 'faculty' | 'backoffice' | 'student' | 'parent';
      store.populateRolePermissions(role.id, baseRole, true);
      const updated = store.hydrate('res.users.role', store.byId('res.users.role', role.id)!);
      return {
        record: updated,
        message: `Synced ${updated.model_access_count} model access rights and ${updated.rules_count} record rules from Base Profile '${baseRole}'.`,
      };
    }

    default: {
      if (btn?.to && id !== undefined && def.stageField) {
        const vals: Record<string, unknown> = { [def.stageField]: btn.to };
        if (model === 'op.admission') {
          const stg = store.all('admission.stage').find((s) => s.state === btn.to);
          if (stg) vals.stage_id = stg.id;
        }
        const updated = store.write(model, id, vals, userId);
        return { record: updated, message: `Transitioned to ${btn.to}` };
      }
      if (btn && id !== undefined) {
        const rec = store.byId(model, id);
        return { record: rec ? store.hydrate(model, rec) : undefined, message: `Executed ${btn.string}.` };
      }
      throw new Error(`Unsupported method ${model}.${method}`);
    }
  }
}

export function runCronJob(cronId: number, userId = 1): MethodResult {
  const cron = store.byId('ir.cron', cronId);
  if (!cron) throw new Error('Cron job not found');
  const start = Date.now();
  let summary = `Executed ${cron.method}`;

  if (cron.method === 'compliance.pupils_pass_and_dbs_audit') {
    const warnDays = Number(store.getSettings().compliance_warning_days ?? 60);
    const horizon = Date.now() + warnDays * 86400000;
    const expiringPasses = store.all('op.student').filter((s) => s.citizenship === 'non_kenyan' && s.pupils_pass_expiry && new Date(s.pupils_pass_expiry).getTime() <= horizon);
    const expiringStaff = store.all('hr.employee').filter((e) => e.police_clearance_expiry && new Date(e.police_clearance_expiry).getTime() <= horizon);
    summary = `Audited compliance: ${expiringPasses.length} Pupil's Pass & ${expiringStaff.length} Good Conduct cert(s) due within ${warnDays}d.`;
  } else if (cron.method === 'attendance.auto_create_daily_sheets') {
    const today = new Date().toISOString().slice(0, 10);
    const regs = store.all('op.attendance.register').filter((r) => r.auto_create);
    let created = 0;
    for (const r of regs) {
      const exists = store.all('op.attendance.sheet').some((s) => Number(s.register_id) === r.id && s.attendance_date === today);
      if (!exists) {
        store.create('op.attendance.sheet', {
          name: `${r.code}-${today}`, register_id: r.id, attendance_date: today, company_id: r.company_id, state: 'draft',
        }, userId);
        created++;
      }
    }
    summary = `Verified ${regs.length} registers; created ${created} attendance sheet(s) for ${today}.`;
  } else if (cron.method === 'library.overdue_fine_calculator') {
    const issued = store.all('op.media.movement').filter((m) => m.state === 'issued');
    summary = `Scanned ${issued.length} active library loan(s) for overdue fines.`;
  }

  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const execMs = Math.max(4, Date.now() - start);
  store.create('queue.job', {
    name: cron.name, method: cron.method, channel: cron.channel, cron_id: cron.id,
    state: 'done', date_created: nowStr, date_done: nowStr, exec_time: execMs, result: summary,
  }, userId);
  const updated = store.write('ir.cron', cron.id, { last_run: nowStr, last_result: summary }, userId);
  return { record: updated, message: summary };
}
