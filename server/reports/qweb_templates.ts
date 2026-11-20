import { generateBarcodeSvg } from './barcode.js';

export interface CompanyInfo {
  name?: string;
  street?: string;
  street2?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  report_header?: string;
  report_footer?: string;
  external_report_layout_id?: string;
  paperformat?: string;
  font?: string;
  theme_primary?: string;
  theme_accent?: string;
  currency_symbol?: string;
  [key: string]: any;
}

function escapeHtml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function computeAgeYears(birthDate?: string): string {
  if (!birthDate) return '';
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? `${age} Years` : '';
}

function defaultVectorLogoSvg(companyName: string, primaryColor: string): string {
  return `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#495057"/>
        <path d="M10 14L20 9L30 14L20 19L10 14Z" fill="#ffffff"/>
        <path d="M13 18.5V25.5C13 27.5 16.2 29.5 20 29.5C23.8 29.5 27 27.5 27 25.5V18.5L20 22L13 18.5Z" fill="#dee2e6"/>
      </svg>
      <div style="line-height: 1.05;">
        <div style="font-size: 16px; font-weight: 700; color: ${primaryColor};">${escapeHtml(companyName)}</div>
      </div>
    </div>
  `;
}

const QWEB_FONT_MAP: Record<string, { css: string; gf: string }> = {
  lato: { css: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', gf: 'Lato:ital,wght@0,300;0,400;0,700;0,900;1,400' },
  roboto: { css: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', gf: 'Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400' },
  open_sans: { css: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', gf: 'Open+Sans:ital,wght@0,400;0,600;0,700;1,400' },
  montserrat: { css: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', gf: 'Montserrat:ital,wght@0,400;0,600;0,700;1,400' },
  oswald: { css: '"Oswald", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', gf: 'Oswald:wght@400;500;700' },
  raleway: { css: '"Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', gf: 'Raleway:ital,wght@0,400;0,600;0,700;1,400' },
};

export function renderExternalLayout(opts: {
  company: CompanyInfo;
  title: string;
  recipientAddressHtml?: string;
  contentHtml: string;
  layout?: string;
  hideHeader?: boolean;
}): string {
  const { company, title, recipientAddressHtml, contentHtml, hideHeader } = opts;
  const companyName = company.name || 'OpenEduCat';
  const layout = (opts.layout || company.external_report_layout_id || 'light').toLowerCase();
  const paperformat = company.paperformat || 'letter';
  const primaryColor = company.theme_primary || '#1565c0';
  const secondaryColor = company.theme_accent || '#495057';
  const fontKey = String(company.font || 'lato').toLowerCase();
  const fontMeta = QWEB_FONT_MAP[fontKey] || QWEB_FONT_MAP.lato;

  const cityLine = [company.city, company.country].filter(Boolean).join(', ');
  const footerText = company.report_footer || '';
  const tagline = company.report_header || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontMeta.gf}&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${paperformat === 'a4' ? 'A4 portrait' : 'letter portrait'};
      margin: 14mm 15mm 20mm 15mm;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: ${fontMeta.css};
      font-size: 13px;
      line-height: 1.45;
      color: #212529;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      word-wrap: break-word;
    }
    .container { width: 100%; max-width: 780px; margin: 0 auto; padding: 12px 16px; }
    .header { margin-bottom: 22px; }
    .footer {
      margin-top: 32px;
      border-top: 1px solid #212529;
      padding-top: 6px;
      font-size: 11.5px;
      color: #6c757d;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .row { display: flex; flex-wrap: wrap; margin-right: -12px; margin-left: -12px; }
    .col-3 { flex: 0 0 25%; max-width: 25%; padding-right: 12px; padding-left: 12px; }
    .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding-right: 12px; padding-left: 12px; }
    .col-6 { flex: 0 0 50%; max-width: 50%; padding-right: 12px; padding-left: 12px; }
    .col-12 { flex: 0 0 100%; max-width: 100%; padding-right: 12px; padding-left: 12px; }
    .col-sm-5 { flex: 0 0 41.666667%; max-width: 41.666667%; padding-right: 12px; padding-left: 12px; }
    .ms-auto { margin-left: auto !important; }
    .text-end { text-align: right !important; }
    .text-center { text-align: center !important; }
    .text-start { text-align: left !important; }
    .text-muted { color: #6c757d !important; }
    .fw-bold { font-weight: 700 !important; }
    .mb-0 { margin-bottom: 0 !important; }
    .mb-1 { margin-bottom: 4px !important; }
    .mb-2 { margin-bottom: 8px !important; }
    .mb-3 { margin-bottom: 12px !important; }
    .mb-4 { margin-bottom: 16px !important; }
    .mt-0 { margin-top: 0 !important; }
    .mt-2 { margin-top: 8px !important; }
    .mt-3 { margin-top: 12px !important; }
    .mt-4 { margin-top: 16px !important; }
    .mt-5 { margin-top: 24px !important; }
    .p-0 { padding: 0 !important; }
    .w-100 { width: 100% !important; }
    .list-unstyled { padding-left: 0; list-style: none; margin: 0; }
    .d-flex { display: flex !important; }
    .align-items-center { align-items: center !important; }
    .justify-content-between { justify-content: space-between !important; }

    h2, .h2 { font-size: 26px; font-weight: 400; margin-top: 0; margin-bottom: 16px; color: #212529; letter-spacing: -0.01em; }
    h3, .h3 { font-size: 20px; font-weight: 400; margin-top: 0; margin-bottom: 12px; color: #212529; }
    h4, .h4 { font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 8px; color: #212529; }

    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: #212529;
      border-bottom: 1px solid #212529;
      padding-bottom: 4px;
      margin: 16px 0 8px 0;
    }

    .table { width: 100%; margin-bottom: 1rem; color: #212529; vertical-align: top; border-collapse: collapse; }
    .table th, .table td { padding: 5px 8px; vertical-align: top; font-weight: 400; }
    .table-sm th, .table-sm td { padding: 4px 4px; }
    .table-borderless th, .table-borderless td, .table-borderless thead, .table-borderless tbody { border: 0 none; }
    .o_main_table thead { border-bottom: 1px solid #212529; }
    .o_main_table thead th { font-weight: 700; padding-bottom: 6px; }
    .o_main_table th:first-child, .o_main_table td:first-child { padding-left: 0; }
    .o_main_table th:last-child, .o_main_table td:last-child { padding-right: 0; }
    .o_total_table { width: 100%; border-top: 1px solid #212529; }
    .o_total_table td { padding: 4px 0; }

    ${layout === 'boxed' ? `
      .article { border: 1px solid ${secondaryColor}; padding: 20px; border-radius: 4px; }
      .header { border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 12px; }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}
    ${layout === 'bold' ? `
      .header { background: ${primaryColor}; color: #ffffff; padding: 16px; border-radius: 4px; border-bottom: 3px solid ${secondaryColor}; }
      .header * { color: #ffffff !important; }
      .o_main_table thead { background: ${primaryColor}; color: #ffffff; border-bottom: 2px solid ${secondaryColor}; }
      .o_main_table thead th { color: #ffffff !important; padding: 7px 8px; }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}
    ${layout === 'striped' ? `
      .header { border-top: 3px solid ${primaryColor}; border-bottom: 2px solid ${secondaryColor}; padding: 12px 0; }
      .o_main_table tbody tr:nth-of-type(odd) { background-color: rgba(0, 0, 0, 0.035); }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}
    ${layout === 'bubble' ? `
      .header { background: #f1f5f9; border-radius: 12px; padding: 16px; border-left: 6px solid ${primaryColor}; border-bottom: 2px solid ${secondaryColor}; }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}
    ${layout === 'wave' ? `
      .header { border-bottom: 3px solid ${primaryColor}; box-shadow: inset 0 -3px 0 ${secondaryColor}; padding-bottom: 14px; }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}
    ${layout === 'folder' ? `
      .header { border-left: 5px solid ${primaryColor}; border-top: 2px solid ${secondaryColor}; padding: 10px 12px; background: #fafbfc; }
      h2, .h2 { color: ${primaryColor}; }
    ` : ''}

    .o_company_logo_small { max-height: 4rem; max-width: 11rem; object-fit: contain; margin-bottom: 6px; }
    .o_portal_address { font-style: normal; line-height: 1.4; font-size: 12.5px; color: #212529; }

    @media print {
      body { width: 100%; }
      .no-print { display: none !important; }
      .footer.html-preview-only { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container article o_report_layout_${escapeHtml(layout)} o_table_standard o_company_1_layout">
    ${hideHeader ? '' : `
    <div class="header">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <div>
          ${company.logo
            ? `<img class="o_company_logo_small" alt="Logo" src="${company.logo}">`
            : defaultVectorLogoSvg(companyName, primaryColor)
          }
        </div>
        ${tagline ? `<div class="text-end text-muted" style="font-size: 11px; max-width: 48%;">${escapeHtml(tagline)}</div>` : ''}
      </div>
      <div class="row">
        <div class="col-6" name="company_address">
          <address class="o_portal_address mb-0">
            <div>${escapeHtml(companyName)}</div>
            ${company.street ? `<div>${escapeHtml(company.street)}</div>` : ''}
            ${company.street2 ? `<div>${escapeHtml(company.street2)}</div>` : ''}
            ${cityLine ? `<div>${escapeHtml(cityLine)}</div>` : ''}
          </address>
        </div>
        ${recipientAddressHtml ? `
        <div class="col-sm-5 ms-auto" name="address">
          ${recipientAddressHtml}
        </div>
        ` : ''}
      </div>
    </div>`}

    <div class="page">
      ${contentHtml}
    </div>

    ${hideHeader ? '' : `
    <div class="footer html-preview-only">
      <div class="text-start">Page 1 / 1</div>
      ${footerText ? `<div class="text-end">${escapeHtml(footerText)}</div>` : ''}
    </div>`}
  </div>
</body>
</html>`;
}

/** 1. Invoice / Fee Receipt (INV_2026_00008.pdf) */
export function renderInvoiceReport(record: Record<string, any>, company: CompanyInfo, withPayments = true): string {
  const curr = company.currency_symbol || (company.currency ? `${company.currency} ` : (String(company.city || '').toLowerCase().includes('nairobi') || String(company.country || '').toLowerCase().includes('kenya') ? 'KES ' : '$ '));
  const invNumber = record.name || record.number || `INV/2026/${String(record.id || 1).padStart(5, '0')}`;
  const partnerName = record.partner_id__label || record.student_id__label || record.partner_name || 'Student / Parent';
  const street = record.partner_street || record.street || '';
  const city = record.partner_city || record.city || company.city || '';
  const country = record.partner_country || company.country || '';
  const invDate = record.invoice_date || record.date || new Date().toISOString().slice(0, 10);
  const dueDate = record.invoice_date_due || invDate;
  const totalNum = Number(record.amount_total ?? 0);
  const computedPaid = record.amount_residual !== undefined
    ? Math.max(0, totalNum - Number(record.amount_residual))
    : (record.payment_state === 'paid' ? totalNum : 0);
  const paidNum = withPayments ? Number(record.amount_paid ?? computedPaid) : 0;
  const dueNum = Math.max(0, totalNum - paidNum);

  const recipientHtml = `
    <address class="o_portal_address mb-0">
      <div>${escapeHtml(partnerName)}</div>
      ${street ? `<div>${escapeHtml(street)}</div>` : ''}
      ${city ? `<div>${escapeHtml(city)}</div>` : ''}
      ${country ? `<div>${escapeHtml(country)}</div>` : ''}
    </address>
  `;

  const lines = Array.isArray(record.invoice_line_ids) && record.invoice_line_ids.length > 0
    ? record.invoice_line_ids
    : [{
        name: record.line_description || (record.ref ? `[${record.ref}] ${record.name || 'Tuition & Campus Fees'}` : (record.fees_term_id__label || 'Tuition & School Fees')),
        quantity: 1,
        price_unit: totalNum,
        price_subtotal: totalNum,
      }];

  const contentHtml = `
    <h2><span>Invoice</span> <span>${escapeHtml(invNumber)}</span></h2>
    <div class="row mb-4" id="informations">
      <div class="col-4"><strong>Invoice Date</strong><div>${escapeHtml(invDate)}</div></div>
      <div class="col-4"><strong>Due Date</strong><div>${escapeHtml(dueDate)}</div></div>
      <div class="col-4"><strong>Delivery Date</strong><div>${escapeHtml(invDate)}</div></div>
    </div>

    <table class="table o_main_table table-borderless mb-0">
      <thead>
        <tr>
          <th class="text-start">Description</th>
          <th class="text-end">Quantity</th>
          <th class="text-end">Unit Price</th>
          <th class="text-end">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map((l: any) => {
          const qty = Number(l.quantity ?? 1);
          const unit = Number(l.price_unit ?? totalNum);
          const sub = Number(l.price_subtotal ?? (qty * unit));
          return `
          <tr>
            <td class="text-start">${escapeHtml(l.name || l.description || 'Fee Assessment')}</td>
            <td class="text-end">${qty.toFixed(2)}</td>
            <td class="text-end">${unit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="text-end">${curr}${sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 18px;">
      <div style="font-size: 13px; color: #212529; margin-top: 8px;">
        Payment Communication: <strong>${escapeHtml(invNumber)}</strong>
      </div>
      <div style="width: 280px;">
        <table class="o_total_table table table-borderless">
          <tbody>
            <tr class="fw-bold">
              <td>Total</td>
              <td class="text-end fw-bold">${curr}${totalNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ${withPayments && paidNum > 0 ? `
            <tr>
              <td><i class="text-muted">Paid on ${escapeHtml(invDate)}</i></td>
              <td class="text-end">${curr}${paidNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
            ${withPayments ? `
            <tr class="fw-bold" style="font-size: 14px;">
              <td class="fw-bold">Amount Due</td>
              <td class="text-end fw-bold">${curr}${dueNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Invoice ${invNumber}`,
    recipientAddressHtml: recipientHtml,
    contentHtml,
  });
}

/** 2. Student Information (Student_Information_-_Emma_J_Parker.pdf) */
export function renderStudentInformationReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || record.name || [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(' ') || `Student #${record.id}`;
  const gender = record.gender === 'f' ? 'Female' : record.gender === 'm' ? 'Male' : (record.gender || '');
  const birthDate = record.birth_date || '';
  const age = computeAgeYears(birthDate);
  const bloodGroup = record.blood_group || '';
  const email = record.email || '';
  const mobile = record.mobile || record.phone || '';
  const addressLines = [record.street, record.city, record.nationality__label || company.country].filter(Boolean);
  const grNo = record.gr_no || '';
  const course = record.course_id__label || '';
  const batch = record.batch_id__label || '';
  const nationality = record.nationality__label || record.nationality_id__label || '';
  const language = record.language || 'English (US)';
  const visaInfo = record.pupils_pass_no || record.visa_info || '';
  const photo = record.image_1920 || record.image;

  const contentHtml = `
    <h2>Student Information</h2>
    <div>
      <div class="section-title">General Information</div>
      <table class="table table-sm table-borderless mb-4">
        <tbody>
          <tr>
            <td width="30%">Name</td>
            <td>${escapeHtml(name)}</td>
            <td rowspan="5" class="text-end" width="24%" style="vertical-align: top;">
              ${photo
                ? `<img style="width: 112px; height: 112px; object-fit: cover; border: 1px solid #dee2e6;" src="${photo}" alt="Student Photo">`
                : `<div style="width: 112px; height: 112px; border: 1px solid #dee2e6; background: #f8f9fa; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #1565c0;">${escapeHtml(name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase())}</div>`
              }
            </td>
          </tr>
          <tr><td>Gender</td><td>${escapeHtml(gender)}</td></tr>
          <tr><td>Birth Date</td><td>${escapeHtml(birthDate)}</td></tr>
          <tr><td>Age</td><td>${escapeHtml(age)}</td></tr>
          <tr><td>Blood Group</td><td>${escapeHtml(bloodGroup)}</td></tr>
        </tbody>
      </table>

      <div class="section-title">Contact Information</div>
      <table class="table table-sm table-borderless mb-4">
        <tbody>
          <tr><td width="30%">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td>Mobile</td><td>${escapeHtml(mobile)}</td></tr>
          <tr>
            <td style="vertical-align: top;">Address</td>
            <td>${addressLines.map((l) => escapeHtml(l)).join('<br>')}</td>
          </tr>
        </tbody>
      </table>

      <div class="row mt-4">
        <div class="col-6">
          <div class="section-title">Academic Information</div>
          <table class="table table-sm table-borderless mb-4">
            <tbody>
              <tr><td width="38%">GR Number</td><td>${escapeHtml(grNo)}</td></tr>
              <tr><td>Course</td><td>${escapeHtml(course)}</td></tr>
              <tr><td>Batch</td><td>${escapeHtml(batch)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="col-6">
          <div class="section-title">Citizenship Information</div>
          <table class="table table-sm table-borderless mb-4">
            <tbody>
              <tr><td width="38%">Nationality</td><td>${escapeHtml(nationality)}</td></tr>
              <tr><td>Language</td><td>${escapeHtml(language)}</td></tr>
              <tr><td>Visa Info.</td><td>${escapeHtml(visaInfo)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Student Information - ${name}`,
    contentHtml,
  });
}

/** 3. Student ID Card (Student_ID_Card_-_Emma_J_Parker.pdf) */
export function renderStudentIdCardReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || record.name || [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(' ') || `Student #${record.id}`;
  const bloodGroup = record.blood_group || '';
  const birthDate = record.birth_date || '';
  const course = record.course_id__label || '';
  const barcode = record.barcode || record.gr_no || `OE${String(record.id || 1).padStart(6, '0')}`;
  const photo = record.image_1920 || record.image;
  const barcodeSvg = generateBarcodeSvg(barcode, 165, 36);

  const cardHtml = `
    <div style="padding: 8px 0;">
      <div style="width: 420px; border: 1.5px solid #212529; background: #ffffff; padding: 12px 14px;">
        <div style="margin-bottom: 6px;">
          ${company.logo
            ? `<img style="max-height: 44px; max-width: 140px; object-fit: contain;" src="${company.logo}" alt="Logo">`
            : defaultVectorLogoSvg(company.name || 'OpenEduCat', company.theme_primary || '#1565c0')
          }
        </div>
        <hr style="border: 0; border-top: 1px solid #adb5bd; margin: 6px 0 12px 0;">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="width: 112px; shrink: 0;">
            ${photo
              ? `<img style="width: 112px; height: 130px; object-fit: cover; border: 1px solid #dee2e6;" src="${photo}" alt="Student">`
              : `<div style="width: 112px; height: 130px; border: 1px solid #dee2e6; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #1565c0;">${escapeHtml(name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase())}</div>`
            }
          </div>
          <div style="flex: 1; font-size: 12.5px; line-height: 1.55;">
            <div style="font-size: 18px; font-weight: 400; margin: 0 0 8px 0; color: #212529;">STUDENT ID CARD</div>
            <div><strong>Name:</strong> ${escapeHtml(name)}</div>
            <div><strong>Blood Group:</strong> ${escapeHtml(bloodGroup)}</div>
            <div><strong>Birthdate:</strong> ${escapeHtml(birthDate)}</div>
            <div><strong>Course:</strong> ${escapeHtml(course)}</div>
            <div style="margin-top: 8px;">${barcodeSvg}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Student ID Card - ${name}`,
    contentHtml: cardHtml,
  });
}

/** 4. Student Course Enrollment (Course_Enrollment_-_Emma_J_Parker.pdf) */
export function renderCourseEnrollmentReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || record.name || [record.first_name, record.last_name].filter(Boolean).join(' ') || `Student #${record.id}`;
  const course = record.course_id__label || 'Course Enrollment';
  const batch = record.batch_id__label || 'Batch A';
  const academicYear = record.academic_year_id__label || '2026-2027';
  const academicTerm = record.academic_term_id__label || 'Term 1';
  const rollNumber = record.gr_no || record.roll_number || `STU-${String(record.id || 1).padStart(4, '0')}`;
  const subjects: any[] = Array.isArray(record._subjects) && record._subjects.length > 0
    ? record._subjects
    : [{ name: `${course} Core Subject`, code: 'CORE-101', type: 'Theory', subject_type: 'Compulsory', grade_weightage: '100.0' }];

  const recipientHtml = `
    <address class="o_portal_address mb-0">
      <div class="fw-bold">${escapeHtml(name)}</div>
      ${record.street ? `<div>${escapeHtml(record.street)}</div>` : ''}
      ${record.city ? `<div>${escapeHtml(record.city)}</div>` : ''}
      ${company.country ? `<div>${escapeHtml(company.country)}</div>` : ''}
    </address>
  `;

  const contentHtml = `
    <h2>Student Course Enrollment</h2>
    <h3 class="mt-2 mb-3">${escapeHtml(course)}</h3>

    <div class="row mb-4" style="font-size: 12.5px;">
      <div class="col-3">
        <div class="fw-bold" style="font-size: 11px;">BATCH</div>
        <div>${escapeHtml(batch)}</div>
      </div>
      <div class="col-3">
        <div class="fw-bold" style="font-size: 11px;">ACADEMIC YEAR</div>
        <div>${escapeHtml(academicYear)}</div>
      </div>
      <div class="col-3">
        <div class="fw-bold" style="font-size: 11px;">ACADEMIC TERM</div>
        <div>${escapeHtml(academicTerm)}</div>
      </div>
      <div class="col-3">
        <div class="fw-bold" style="font-size: 11px;">ROLL NUMBER</div>
        <div>${escapeHtml(rollNumber)}</div>
      </div>
    </div>

    <h4 class="mb-2">Subjects</h4>
    <table class="table o_main_table table-borderless">
      <thead>
        <tr>
          <th class="text-start">NAME</th>
          <th class="text-start">CODE</th>
          <th class="text-start">TYPE</th>
          <th class="text-start">Subject TYPE</th>
          <th class="text-end">GRADE WEIGHTAGE</th>
        </tr>
      </thead>
      <tbody>
        ${subjects.map((s) => `
          <tr>
            <td class="text-start">${escapeHtml(s.name)}</td>
            <td class="text-start">${escapeHtml(s.code || '—')}</td>
            <td class="text-start" style="text-transform: capitalize;">${escapeHtml(s.type || 'Theory')}</td>
            <td class="text-start" style="text-transform: capitalize;">${escapeHtml(s.subject_type || 'Compulsory')}</td>
            <td class="text-end">${Number(s.grade_weightage ?? 0).toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company,
    title: `Course Enrollment - ${name}`,
    recipientAddressHtml: recipientHtml,
    contentHtml,
  });
}

/** 5. Student Attendance Summary (Attendance_Summary_-_Emma_J_Parker.pdf) */
export function renderAttendanceSummaryReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || record.name || [record.first_name, record.last_name].filter(Boolean).join(' ') || `Student #${record.id}`;
  const lines: any[] = Array.isArray(record._attendance_lines) && record._attendance_lines.length > 0
    ? record._attendance_lines
    : [{
        attendance_id__label: 'Daily Roll Call',
        attendance_date: new Date().toISOString().slice(0, 10),
        present: true,
        course_id__label: record.course_id__label || 'Core',
        batch_id__label: record.batch_id__label || 'Batch A',
      }];

  const contentHtml = `
    <h2>Student Attendance Summary</h2>
    <address class="o_portal_address mb-4">
      <div class="fw-bold">${escapeHtml(name)}</div>
      ${record.street ? `<div>${escapeHtml(record.street)}</div>` : ''}
      ${record.city ? `<div>${escapeHtml(record.city)}</div>` : ''}
      ${company.country ? `<div>${escapeHtml(company.country)}</div>` : ''}
    </address>

    <table class="table o_main_table table-borderless">
      <thead>
        <tr>
          <th class="text-start">Sr. No.</th>
          <th class="text-start">Attendance Sheet</th>
          <th class="text-start">Attendance Date</th>
          <th class="text-start">Attendance</th>
          <th class="text-start">Course</th>
          <th class="text-start">Batch</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map((l, idx) => {
          const status = l.present ? 'Present' : l.late ? 'Late' : l.excused ? 'Excused' : l.absent ? 'Absent' : (l.state || 'Present');
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(l.attendance_id__label || l.sheet_name || `AS-${idx + 1}`)}</td>
              <td>${escapeHtml(l.attendance_date || l.date || '')}</td>
              <td style="text-transform: capitalize;">${escapeHtml(status)}</td>
              <td>${escapeHtml(l.course_id__label || record.course_id__label || '')}</td>
              <td>${escapeHtml(l.batch_id__label || record.batch_id__label || '')}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company,
    title: `Attendance Summary - ${name}`,
    contentHtml,
  });
}

/** 6. Admission Letter (Student_Admission_Letter.pdf) */
export function renderAdmissionLetterReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(' ').trim() || 'Applicant';
  const dob = record.birth_date || '';
  const address = [record.street, record.city, record.country || company.country].filter(Boolean).join(', ');
  const course = record.course_id__label || 'Academic Program';
  const appCode = record.application_number || `APP-${String(record.id || 1).padStart(4, '0')}`;

  const contentHtml = `
    <h2>Admission Letter (${escapeHtml(appCode)})</h2>
    <div style="font-size: 14px; line-height: 1.6;">
      <p class="fw-bold mb-3" style="font-size: 15px;">We are pleased to confirm the admission of:</p>
      <div style="display: grid; grid-template-columns: 140px 1fr; gap: 6px; margin-bottom: 18px;">
        <span>Name:</span><span>${escapeHtml(name)}</span>
        <span>Date of Birth:</span><span>${escapeHtml(dob)}</span>
        <span>Address:</span><span>${escapeHtml(address)}</span>
      </div>

      <p class="mb-3">Dear, ${escapeHtml(name)}</p>
      <p class="mb-3">
        We are delighted to inform you that you have been successfully admitted to the <strong>${escapeHtml(course)}</strong> program at <strong>${escapeHtml(company.name || 'OpenEduCat')}</strong>.
        Your academic credentials and application have been thoroughly reviewed and found to satisfy all entry requirements set by the Academic Council.
      </p>
      <p class="mb-4">
        Please report to the Registrar's Office on orientation day with your original academic certificates and proof of tuition fee settlement to complete your final registration.
      </p>

      <div class="mt-4">
        <div class="fw-bold">Best Regards,</div>
        <div>${escapeHtml(company.head_of_school || 'Registrar / Head of School')}</div>
        <div>${escapeHtml(company.name || 'OpenEduCat')}</div>
      </div>

      <div class="row mt-5" style="margin-top: 56px;">
        <div class="col-6 text-center">
          <hr style="width: 70%; margin: 0 auto; border: 0; border-top: 1.5px solid #212529;">
          <p class="mt-2" style="font-size: 13px;">Director Signature</p>
        </div>
        <div class="col-6 text-center">
          <hr style="width: 70%; margin: 0 auto; border: 0; border-top: 1.5px solid #212529;">
          <p class="mt-2" style="font-size: 13px;">Student Signature</p>
        </div>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Student Admission Letter - ${name}`,
    contentHtml,
  });
}

/** 7. Marksheet Report (Marksheet.pdf) */
export function renderMarksheetReport(record: Record<string, any>, company: CompanyInfo): string {
  const studentName = record.student_id__label || record.display_name || 'Student';
  const course = record.course_id__label || record.exam_session_id__label || 'Course';
  const examName = record.exam_session_id__label || record.name || 'Examination Session';
  const examCode = record.exam_code || `EX-${String(record.id || 1).padStart(3, '0')}`;

  const lines: any[] = Array.isArray(record._marksheet_lines) && record._marksheet_lines.length > 0
    ? record._marksheet_lines
    : [
        { subject: 'Core Paper 1', type: 'Sessional', total: 100, min: 40, obtained: Number(record.total_marks || 78) },
      ];

  const totalMax = lines.reduce((acc, l) => acc + Number(l.total || 100), 0);
  const totalObt = lines.reduce((acc, l) => acc + Number(l.obtained || 0), 0);
  const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '0.00';
  const passed = Number(pct) >= 40;

  const contentHtml = `
    <div class="text-center mb-4">
      <h2><strong>MarkSheet</strong></h2>
    </div>

    <div class="row mb-4" id="informations" style="font-size: 13px;">
      <div class="col-3"><strong>Student Name</strong><div>${escapeHtml(studentName)}</div></div>
      <div class="col-3"><strong>Course</strong><div>${escapeHtml(course)}</div></div>
      <div class="col-3"><strong>Exam Name</strong><div>${escapeHtml(examName)}</div></div>
      <div class="col-3"><strong>Exam Code</strong><div>${escapeHtml(examCode)}</div></div>
    </div>

    <table class="table o_main_table table-borderless mt-4 mb-4">
      <thead>
        <tr>
          <th class="text-start">Subject</th>
          <th class="text-center">Exam Type</th>
          <th class="text-center">Total Marks</th>
          <th class="text-center">Passing Marks</th>
          <th class="text-center">Obtained Marks</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map((l) => `
          <tr>
            <td class="text-start">${escapeHtml(l.subject || l.subject_id__label || 'Subject')}</td>
            <td class="text-center">${escapeHtml(l.type || 'Sessional')}</td>
            <td class="text-center">${l.total ?? 100}</td>
            <td class="text-center">${l.min ?? 40}</td>
            <td class="text-center">${l.obtained ?? 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <table class="table o_main_table table-borderless mt-4">
      <thead>
        <tr>
          <th class="text-center">Month/Year of Passing</th>
          <th class="text-center">Obtained Marks / Total Marks</th>
          <th class="text-center">Percentage</th>
          <th class="text-center">Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">${new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })}</td>
          <td class="text-center">${totalObt} / ${totalMax}</td>
          <td class="text-center">${pct} %</td>
          <td class="text-center fw-bold">${passed ? 'Pass' : 'Fail'}</td>
        </tr>
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company,
    title: `Marksheet - ${studentName}`,
    contentHtml,
  });
}

/** 8. Library ID Card (Library_ID_Card_-_Emma_J_Parker.pdf) */
export function renderLibraryCardReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.student_id__label || record.display_name || [record.first_name, record.last_name].filter(Boolean).join(' ') || 'Card Holder';
  const cardNo = record.number || record.barcode || `LCB${String(record.id || 1).padStart(10, '0')}`;
  const type = record.library_card_type_id__label || record.type || 'Student Library Card';
  const date = record.issue_date || new Date().toLocaleDateString('en-US');
  const barcodeSvg = generateBarcodeSvg(cardNo, 180, 34);
  const photo = record.image_1920 || record.image;

  const cardHtml = `
    <div style="padding: 8px 0;">
      <div style="width: 420px; background: #ffffff; border: 1.5px solid #212529; padding: 14px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          ${company.logo
            ? `<img style="max-height: 44px; max-width: 110px; object-fit: contain;" src="${company.logo}" alt="Logo">`
            : defaultVectorLogoSvg(company.name || 'OpenEduCat', company.theme_primary || '#1565c0')
          }
          <div>
            <div style="font-size: 19px; font-weight: 400; color: #212529; line-height: 1.1;">Library Card</div>
            <div class="text-muted" style="font-size: 11px;">${escapeHtml(company.name || 'OpenEduCat')}</div>
          </div>
        </div>
        <hr style="border: 0; border-top: 1px solid #adb5bd; margin: 8px 0 12px 0;">
        <div style="display: flex; gap: 14px;">
          <div style="width: 110px;">
            ${photo
              ? `<img style="width: 110px; height: 125px; object-fit: cover; border: 1px solid #dee2e6;" src="${photo}" alt="Card Holder">`
              : `<div style="width: 110px; height: 125px; border: 1px solid #dee2e6; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #1565c0;">${escapeHtml(name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase())}</div>`
            }
          </div>
          <div style="flex: 1; font-size: 12px; line-height: 1.6;">
            <div><strong>Name:</strong> ${escapeHtml(name)}</div>
            <div><strong>Card No:</strong> ${escapeHtml(cardNo)}</div>
            <div><strong>Type:</strong> ${escapeHtml(type)}</div>
            <div><strong>Issued Date:</strong> ${escapeHtml(date)}</div>
            <div style="margin-top: 8px;">${barcodeSvg}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Library Card - ${name}`,
    contentHtml: cardHtml,
  });
}

/** 9. Library Card(s) Barcode (Library_Card_Barcode.pdf) */
export function renderLibraryBarcodeReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.student_id__label || record.partner_id__label || record.display_name || 'Card Holder';
  const code = record.number || record.barcode || `LCB${String(record.id || 1).padStart(10, '0')}`;
  const barcodeSvg = generateBarcodeSvg(code, 220, 48);

  const contentHtml = `
    <h2>Library Card(s) Barcode</h2>
    <table class="table o_main_table table-borderless mt-3">
      <thead>
        <tr>
          <th class="text-center" width="50%">Card Holder</th>
          <th class="text-center" width="50%">Card Barcode</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center" style="font-size: 16px; vertical-align: middle;">${escapeHtml(name)}</td>
          <td class="text-center">${barcodeSvg}</td>
        </tr>
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company,
    title: `Library Card(s) Barcode - ${name}`,
    contentHtml,
  });
}

/** 10. Employee / Faculty Badge (Badge_-_Abigail_Peterson.pdf) */
export function renderEmployeeBadgeReport(record: Record<string, any>, company: CompanyInfo): string {
  const name = record.display_name || record.name || [record.first_name, record.last_name].filter(Boolean).join(' ') || 'Staff Member';
  const job = record.job_title || record.department_id__label || 'Faculty / Staff';
  const photo = record.image_1920 || record.image;

  const cardHtml = `
    <div style="padding: 12px 0;">
      <div style="width: 340px; border: 1px solid #212529; border-radius: 8px; padding: 14px; background: #ffffff;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="width: 110px;">
            ${company.logo
              ? `<img style="max-height: 36px; max-width: 110px; object-fit: contain; margin-bottom: 10px;" src="${company.logo}" alt="Logo">`
              : defaultVectorLogoSvg(company.name || 'OpenEduCat', company.theme_primary || '#1565c0')
            }
            ${photo
              ? `<img style="width: 105px; height: 120px; object-fit: cover; border: 1px solid #dee2e6;" src="${photo}" alt="Staff">`
              : `<div style="width: 105px; height: 120px; border: 1px solid #dee2e6; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #1565c0;">${escapeHtml(name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase())}</div>`
            }
          </div>
          <div style="flex: 1; text-align: center; padding-top: 4px;">
            <div style="font-size: 16px; font-weight: 500; color: #212529;">${escapeHtml(name)}</div>
            <div style="font-size: 11px; color: #6c757d; margin-top: 2px;">${escapeHtml(job)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderExternalLayout({
    company,
    title: `Badge - ${name}`,
    contentHtml: cardHtml,
    hideHeader: true,
  });
}

/** 11. OMR Bubble Answer Sheet PDF */
export function renderOmrSheetReport(opts: { title: string; questions: number; options: number; company: CompanyInfo }): string {
  const letters = ['A', 'B', 'C', 'D', 'E'].slice(0, Math.min(5, Math.max(4, opts.options)));
  const count = Math.min(50, Math.max(5, opts.questions));

  const contentHtml = `
    <div style="border-bottom: 2px solid #212529; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 class="mb-1 fw-bold">${escapeHtml(opts.title)}</h3>
        <div style="font-size: 12px; color: #495057;">Candidate Roll No: ___________________ &nbsp;&nbsp; Paper Set: [ A ] &nbsp;&nbsp; Date: ${new Date().toISOString().slice(0, 10)}</div>
      </div>
      <div style="border: 1px solid #212529; padding: 4px 8px; font-family: monospace; font-size: 11px;">OMR-SHEET</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 36px; font-family: monospace; font-size: 12px;">
      ${Array.from({ length: count }).map((_, i) => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 3px 0; border-bottom: 1px dotted #e9ecef;">
          <span style="width: 28px; text-align: right; font-weight: 700;">${i + 1}.</span>
          ${letters.map((l) => `
            <span style="width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #212529; display: inline-flex; align-items: center; justify-content: center; font-size: 10px;">${l}</span>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  return renderExternalLayout({
    company: opts.company,
    title: opts.title,
    contentHtml,
  });
}

/** 12. Timetable Schedule / Admissions Summary Tabular Report PDF */
export function renderTabularSummaryReport(opts: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  company: CompanyInfo;
}): string {
  const contentHtml = `
    <h2>${escapeHtml(opts.title)}</h2>
    <table class="table o_main_table table-borderless mt-3">
      <thead>
        <tr>
          ${opts.headers.map((h) => `<th class="text-start">${escapeHtml(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${opts.rows.map((row) => `
          <tr>
            ${row.map((cell) => `<td class="text-start">${escapeHtml(cell)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company: opts.company,
    title: opts.title,
    contentHtml,
  });
}

/** 13. Generic fallback for other models */
export function renderGenericReport(report: { name: string; id: string }, record: Record<string, any>, company: CompanyInfo): string {
  const title = `${report.name} — #${record.id}`;
  const keys = Object.keys(record).filter((k) => !k.startsWith('create_') && !k.startsWith('write_') && !k.startsWith('_') && k !== 'company_id');

  const contentHtml = `
    <h2>${escapeHtml(report.name)}</h2>
    <div class="row mb-4" id="informations">
      <div class="col-4"><strong>Record ID</strong><div>#${record.id}</div></div>
      <div class="col-4"><strong>Date</strong><div>${new Date().toLocaleDateString('en-GB')}</div></div>
      <div class="col-4"><strong>Status</strong><div style="text-transform: capitalize;">${escapeHtml(record.state || 'Confirmed')}</div></div>
    </div>

    <table class="table o_main_table table-borderless mt-3 mb-0">
      <thead>
        <tr>
          <th class="text-start" style="width: 35%;">Field</th>
          <th class="text-start">Value</th>
        </tr>
      </thead>
      <tbody>
        ${keys.slice(0, 16).map((k) => {
          let val = record[k];
          if (val === null || val === undefined || val === '') val = '-';
          if (typeof val === 'object') val = record[`${k}__label`] || val.name || JSON.stringify(val);
          return `
            <tr>
              <td class="text-start" style="color: #6c757d;">${escapeHtml(k.replace(/_/g, ' '))}</td>
              <td class="text-start">${escapeHtml(val)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  return renderExternalLayout({
    company,
    title,
    contentHtml,
  });
}
