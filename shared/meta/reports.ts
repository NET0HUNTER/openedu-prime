export interface ReportDefinition {
  id: string;
  name: string;
  model: string;
  reportType: 'pdf' | 'html' | 'xlsx';
  description?: string;
  actionName?: string;
}

export const MODEL_REPORTS: Record<string, ReportDefinition[]> = {
  'op.student': [
    { id: 'student_id_card', name: 'Student ID Card', model: 'op.student', reportType: 'pdf', actionName: 'openeducat_core.report_student_idcard', description: '440x320 ID Card with photo, metadata, and Code128 barcode' },
    { id: 'student_information', name: 'Student Information', model: 'op.student', reportType: 'pdf', actionName: 'openeducat_core_enterprise.report_student_information', description: 'Comprehensive student profile covering general, contact, academic, and citizenship records' },
    { id: 'student_course_enrollment', name: 'Course Enrollment', model: 'op.student', reportType: 'pdf', actionName: 'openeducat_core_enterprise.report_student_course_enrollment', description: 'Detailed student batch, academic year, and enrolled subject list' },
    { id: 'student_library_card', name: 'Library ID Card', model: 'op.student', reportType: 'pdf', actionName: 'openeducat_library.report_student_library_card', description: 'Official campus library borrower pass with barcode' },
    { id: 'student_attendance_summary', name: 'Attendance Summary', model: 'op.student', reportType: 'pdf', actionName: 'openeducat_student_attendance_enterprise.report_student_attendance_summary', description: 'Historical roll-call attendance register summary' },
    { id: 'student_dossier', name: 'Student Academic Dossier & Profile', model: 'op.student', reportType: 'pdf', description: 'Full academic transcript, progression history, and compliance dossier' },
  ],
  'op.admission': [
    { id: 'student_admission_letter', name: 'Student Admission Letter', model: 'op.admission', reportType: 'pdf', actionName: 'openeducat_admission_esign.report_admission_letter_request', description: 'Formal letter of acceptance and enrollment confirmation' },
    { id: 'admission_application_form', name: 'Admission Application Form', model: 'op.admission', reportType: 'pdf', actionName: 'openeducat_admission.report_admission_application', description: 'Official signed admission application with student biography and compliance checks' },
  ],
  'account.move': [
    { id: 'invoice_pdf', name: 'Invoice PDF', model: 'account.move', reportType: 'pdf', actionName: 'account.report_invoice_with_payments', description: 'Official tax invoice with itemized line items, totals, and settlement lines' },
    { id: 'invoice_without_payment', name: 'PDF without Payment', model: 'account.move', reportType: 'pdf', actionName: 'account.report_invoice', description: 'Invoice without payment settlement receipts' },
    { id: 'fee_invoice_voucher', name: 'Student Fee Invoice Voucher & Receipt', model: 'account.move', reportType: 'pdf', description: 'Fee voucher with KRA eTIMS and M-Pesa details' },
  ],
  'op.marksheet.line': [
    { id: 'marksheet_report', name: 'Marksheet', model: 'op.marksheet.line', reportType: 'pdf', actionName: 'openeducat_exam.report_marksheet_report', description: 'Student examination marksheet with sessional scores and passing percentage' },
  ],
  'op.exam.session': [
    { id: 'marksheet_report', name: 'Marksheet', model: 'op.exam.session', reportType: 'pdf', actionName: 'openeducat_exam.report_marksheet_report', description: 'Official exam session marksheet summary' },
    { id: 'exam_hall_ticket', name: 'Candidate Exam Hall Ticket', model: 'op.exam.session', reportType: 'pdf', description: 'Examination hall admission slip listing timetable and seat allocations' },
  ],
  'op.library.card': [
    { id: 'library_card_barcode', name: 'Library Card Barcode', model: 'op.library.card', reportType: 'pdf', actionName: 'openeducat_library.report_library_card_barcode', description: 'Library borrower barcode sheet' },
    { id: 'library_borrower_card', name: 'Library Borrower Card & Barcode', model: 'op.library.card', reportType: 'pdf', description: 'Library card with lending quota and barcode' },
  ],
  'hr.employee': [
    { id: 'employee_badge', name: 'Print Badge', model: 'hr.employee', reportType: 'pdf', actionName: 'hr.print_employee_badge', description: 'Employee photo identification badge with barcode' },
    { id: 'staff_id_badge', name: 'Staff Identity Badge', model: 'hr.employee', reportType: 'pdf', description: 'Staff badge with TSC number, department, and campus access tier' },
  ],
  'op.session': [
    { id: 'session_timetable', name: 'Class Timetable Schedule Matrix', model: 'op.session', reportType: 'pdf', actionName: 'openeducat_timetable.report_timetable', description: 'Weekly schedule breakdown by interval slot, room, faculty, and stream' },
  ],
  'op.attendance.sheet': [
    { id: 'attendance_register_sheet', name: 'Roll-Call Attendance Sheet', model: 'op.attendance.sheet', reportType: 'pdf', actionName: 'openeducat_attendance.report_attendance_sheet', description: 'Class attendance register with present, late, and absentee records' },
  ],
  'gradebook.gradebook': [
    { id: 'official_transcript', name: 'Official Academic Transcript (CAIE / Edexcel)', model: 'gradebook.gradebook', reportType: 'pdf', actionName: 'gradebook.report_transcript', description: 'Official transcript stamped with British curriculum grading scales and GPA' },
  ],
};

export function getReportsForModel(model: string): ReportDefinition[] {
  return MODEL_REPORTS[model] ?? [];
}

export function findReportByIdOrAction(identifier: string): { report: ReportDefinition; model: string } | null {
  const norm = identifier.toLowerCase();
  for (const [model, reports] of Object.entries(MODEL_REPORTS)) {
    const found = reports.find((rp) => {
      const act = (rp.actionName || '').toLowerCase();
      const id = rp.id.toLowerCase();
      return (
        id === norm ||
        act === norm ||
        (act && (norm.endsWith(act.split('.').pop() || '') || act.endsWith(norm.split('.').pop() || ''))) ||
        (id && norm.includes(id)) ||
        (norm.includes(id.replace(/_/g, '.')))
      );
    });
    if (found) return { report: found, model };
  }
  return null;
}
