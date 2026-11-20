import { findReportByIdOrAction } from '../../shared/meta/reports.js';
import {
  renderInvoiceReport,
  renderStudentInformationReport,
  renderStudentIdCardReport,
  renderCourseEnrollmentReport,
  renderAttendanceSummaryReport,
  renderAdmissionLetterReport,
  renderMarksheetReport,
  renderLibraryCardReport,
  renderLibraryBarcodeReport,
  renderEmployeeBadgeReport,
  renderGenericReport,
  type CompanyInfo,
} from './qweb_templates.js';
import { generatePdfFromHtml } from './pdf_generator.js';

export function renderQwebReportHtml(opts: {
  reportId: string;
  record: Record<string, any>;
  company: CompanyInfo;
  layout?: string;
}): { html: string; reportName: string; filename: string } | null {
  const { reportId, record, company, layout } = opts;
  const match = findReportByIdOrAction(reportId);
  const report = match?.report;
  const targetModel = match?.model;

  if (!report && !targetModel) {
    return null;
  }

  const reportIdOrAction = report?.id || reportId;
  const safeName = (record.display_name || record.name || record.id || 'document').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${report?.name ? report.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'report'}_${safeName}.pdf`;

  let html = '';

  const effectiveCompany = {
    ...company,
    external_report_layout_id: layout || company.external_report_layout_id || 'light',
  };

  if (targetModel === 'account.move' || reportIdOrAction.includes('invoice')) {
    const withPayments = !reportIdOrAction.includes('without_payment');
    html = renderInvoiceReport(record, effectiveCompany, withPayments);
  } else if (reportIdOrAction === 'student_id_card' || reportIdOrAction.includes('report_student_idcard')) {
    html = renderStudentIdCardReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'student_course_enrollment' || reportIdOrAction.includes('course_enrollment')) {
    html = renderCourseEnrollmentReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'student_attendance_summary' || reportIdOrAction.includes('attendance_summary')) {
    html = renderAttendanceSummaryReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'student_information' || reportIdOrAction.includes('report_student_information')) {
    html = renderStudentInformationReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'student_admission_letter' || reportIdOrAction.includes('report_admission_letter_request')) {
    html = renderAdmissionLetterReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'marksheet_report' || reportIdOrAction.includes('report_marksheet_report')) {
    html = renderMarksheetReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'library_card_barcode' || reportIdOrAction.includes('library_card_barcode')) {
    html = renderLibraryBarcodeReport(record, effectiveCompany);
  } else if (reportIdOrAction === 'student_library_card' || reportIdOrAction.includes('library')) {
    html = renderLibraryCardReport(record, effectiveCompany);
  } else if (reportIdOrAction.includes('badge') || targetModel === 'hr.employee') {
    html = renderEmployeeBadgeReport(record, effectiveCompany);
  } else {
    html = renderGenericReport(report || { name: 'Report', id: reportId }, record, effectiveCompany);
  }

  return { html, reportName: report?.name || 'Report', filename };
}

export async function renderQwebReportPdf(opts: {
  reportId: string;
  record: Record<string, any>;
  company: CompanyInfo;
  layout?: string;
}): Promise<{ pdfBuffer: Buffer | null; html: string; filename: string }> {
  const rendered = renderQwebReportHtml(opts);
  if (!rendered) {
    return { pdfBuffer: null, html: '<h1>Report not found</h1>', filename: 'report.pdf' };
  }

  const paperformat = (opts.company.paperformat === 'a4' ? 'a4' : 'letter');
  const normId = opts.reportId.toLowerCase();
  const isCardReport = normId.includes('badge') || normId === 'hr.print_employee_badge';
  const pdfBuffer = await generatePdfFromHtml(rendered.html, paperformat, {
    displayHeaderFooter: !isCardReport,
    footerText: opts.company.report_footer || '',
  });
  return { pdfBuffer, html: rendered.html, filename: rendered.filename };
}

export * from './qweb_templates.js';
export * from './pdf_generator.js';
