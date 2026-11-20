import { store, type Rec } from './store.js';

export type EmailTemplateKind =
  | 'admission_confirmation'
  | 'student_enrollment'
  | 'portal_credentials'
  | 'password_reset'
  | 'fee_invoice'
  | 'absentee_alert'
  | 'event_badge'
  | 'campaign_newsletter'
  | 'smtp_test'
  | 'general_notice';

export interface EmailRenderContext {
  recipientName?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  summaryRows?: { label: string; value: string }[];
  bodyParagraphs?: string[];
  rawHtmlBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  calloutTitle?: string;
  calloutText?: string;
  calloutTone?: 'info' | 'warning' | 'success';
  companyId?: number;
}

function escapeHtml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCampusContext(companyId?: number): {
  name: string;
  code: string;
  motto: string;
  street: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  primary: string;
  footer: string;
} {
  const co: Rec | undefined =
    (companyId ? store.byId('res.company', companyId) : undefined) ??
    store.all('res.company')[0];
  const rawName = String(co?.name || '').trim();
  const cleanName = rawName === 'OpenEduCat Classic Blue' || !rawName
    ? 'SabiEdu — Oshwal Education & Relief Board'
    : rawName;
  return {
    name: cleanName,
    code: String(co?.code || 'SABIEDU'),
    motto: String(co?.motto || 'Excellence in Academic Governance & Administration'),
    street: String(co?.street || 'First Parklands Avenue, Off Mpaka Road'),
    city: String(co?.city || 'Nairobi'),
    phone: String(co?.phone || '+254 142 645 861'),
    email: String(co?.email || 'enquiries@oerb.org'),
    website: String(co?.website || 'https://www.oshwalacademy.sc.ke'),
    primary: '#0F172A',
    footer: String(co?.report_footer || 'Oshwal Education & Relief Board · P.O. Box 49633 - 00100 Nairobi, Kenya · Registered Educational Trust #1941'),
  };
}

function buildTemplatePreset(kind: EmailTemplateKind, ctx: EmailRenderContext): EmailRenderContext {
  switch (kind) {
    case 'admission_confirmation':
      return {
        badge: 'ADMISSIONS DIRECTORATE',
        title: ctx.title || 'Official Application Transmittal — Admissions Review',
        subtitle: ctx.subtitle || 'Office of Admissions & Student Placement',
        calloutTone: 'info',
        ...ctx,
      };
    case 'student_enrollment':
      return {
        badge: 'REGISTRAR GENERAL',
        title: ctx.title || 'Official Certificate of Cohort Enrolment',
        subtitle: ctx.subtitle || 'Office of the Academic Registrar',
        calloutTone: 'success',
        ...ctx,
      };
    case 'portal_credentials':
      return {
        badge: 'CAMPUS IT & ACCESS CONTROL',
        title: ctx.title || 'Provisioning Notice: Official Workspace Credentials',
        subtitle: ctx.subtitle || 'Directorate of Digital Infrastructure & Student Records',
        calloutTone: 'info',
        ...ctx,
      };
    case 'password_reset':
      return {
        badge: 'SECURITY & ACCESS DIRECTIVE',
        title: ctx.title || 'Authentication Key & Password Configuration Directive',
        subtitle: ctx.subtitle || 'SabiEdu Identity Governance & Authentication Services',
        calloutTone: 'warning',
        ...ctx,
      };
    case 'fee_invoice':
      return {
        badge: 'BURSARIAT & TREASURY',
        title: ctx.title || 'Statement of Tuition & Student Account Assessment',
        subtitle: ctx.subtitle || 'Office of the Bursar & Financial Controller',
        calloutTone: 'info',
        ...ctx,
      };
    case 'absentee_alert':
      return {
        badge: 'PASTORAL DIRECTIVE',
        title: ctx.title || 'Attendance Exception & Absence Notice',
        subtitle: ctx.subtitle || 'Pastoral Care & Statutory Attendance Administration',
        calloutTone: 'warning',
        ...ctx,
      };
    case 'event_badge':
      return {
        badge: 'EXTERNAL RELATIONS',
        title: ctx.title || 'Accredited Campus Event Pass & Registration',
        subtitle: ctx.subtitle || 'Office of Protocol, Public Affairs & Campus Events',
        calloutTone: 'success',
        ...ctx,
      };
    case 'campaign_newsletter':
      return {
        badge: 'EXECUTIVE BULLETIN',
        title: ctx.title || 'Executive Institutional Circular & Bulletin',
        subtitle: ctx.subtitle || 'Office of the Executive Chairman & Board of Governors',
        ...ctx,
      };
    case 'smtp_test':
      return {
        badge: 'SYSTEM AUDIT',
        title: ctx.title || 'SMTP Infrastructure & Security Relay Clearance',
        subtitle: ctx.subtitle || 'Enterprise Messaging Network Diagnostics',
        calloutTone: 'success',
        ...ctx,
      };
    default:
      return {
        badge: 'OFFICIAL COMMUNICATION',
        title: ctx.title || 'Official Institutional Notice',
        subtitle: ctx.subtitle || 'SabiEdu Central Executive Administration',
        ...ctx,
      };
  }
}

export function renderProfessionalEmail(
  kind: EmailTemplateKind,
  rawCtx: EmailRenderContext,
): { html: string; text: string } {
  const c = buildTemplatePreset(kind, rawCtx);
  const campus = getCampusContext(c.companyId);
  const formalNavy = '#0F172A';
  const borderRule = '#CBD5E1';

  const greetingName = c.recipientName ? escapeHtml(c.recipientName) : 'Valued Member';
  const paragraphsHtml = (c.bodyParagraphs ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#1E293B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(p)}</p>`,
    )
    .join('\n');

  const rawSectionHtml = c.rawHtmlBody
    ? `<div style="margin:0 0 20px 0;font-size:14px;line-height:1.7;color:#1E293B;">${c.rawHtmlBody}</div>`
    : '';

  const summaryRowsHtml =
    c.summaryRows && c.summaryRows.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;border:1px solid ${borderRule};border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <thead>
            <tr style="background-color:${formalNavy};">
              <th align="left" style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#FFFFFF;border:1px solid ${formalNavy};">Particulars / Record Field</th>
              <th align="right" style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#FFFFFF;border:1px solid ${formalNavy};">Recorded Assessment / Value</th>
            </tr>
          </thead>
          <tbody>
            ${c.summaryRows
              .map(
                (row, i) => `
              <tr style="background-color:${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                <td style="padding:11px 14px;font-size:13px;font-weight:600;color:#334155;border:1px solid ${borderRule};width:42%;">${escapeHtml(row.label)}</td>
                <td style="padding:11px 14px;font-size:13px;font-weight:700;color:#0F172A;text-align:right;border:1px solid ${borderRule};font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">${escapeHtml(row.value)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>`
      : '';

  const calloutHtml =
    c.calloutTitle || c.calloutText
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:22px 0;border:1px solid #94A3B8;background-color:#F8FAFC;">
          <tr>
            <td style="padding:16px 20px;">
              ${
                c.calloutTitle
                  ? `<div style="font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0F172A;margin-bottom:6px;border-bottom:1px solid #E2E8F0;padding-bottom:4px;">${escapeHtml(c.calloutTitle)}</div>`
                  : ''
              }
              ${
                c.calloutText
                  ? `<div style="font-size:13px;line-height:1.6;color:#334155;font-weight:500;">${escapeHtml(c.calloutText)}</div>`
                  : ''
              }
            </td>
          </tr>
        </table>`
      : '';

  const ctaHtml =
    c.ctaLabel && c.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 14px 0;">
          <tr>
            <td align="left">
              <a href="${escapeHtml(c.ctaUrl)}" target="_blank" style="display:inline-block;padding:13px 28px;background-color:${formalNavy};color:#FFFFFF;text-decoration:none;font-size:12.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border:1px solid ${formalNavy};">
                ${escapeHtml(c.ctaLabel)} &rarr;
              </a>
            </td>
          </tr>
        </table>
        <div style="margin:0 0 20px 0;font-size:11.5px;line-height:1.6;color:#64748B;">
          <strong>Direct Verification URL:</strong> <a href="${escapeHtml(c.ctaUrl)}" style="color:${formalNavy};text-decoration:underline;word-break:break-all;">${escapeHtml(c.ctaUrl)}</a>
        </div>`
      : '';

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.title || campus.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDEFE9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#EDEFE9;padding:36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Document Sheet -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:650px;background-color:#FFFFFF;border:1px solid #CBD5E1;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
          <!-- Top Classification Header -->
          <tr>
            <td style="padding:12px 36px;background-color:#F8FAFC;border-bottom:1px solid #E2E8F0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#475569;">
                    SABIEDU ENTERPRISE SCHOOL ERP · OFFICIAL TRANSMISSION
                  </td>
                  <td align="right" style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748B;">
                    ${escapeHtml(c.badge || 'CONFIDENTIAL')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Formal Institutional Letterhead Masthead -->
          <tr>
            <td style="padding:28px 36px 20px 36px;border-bottom:3px double #0F172A;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-family:'Charter','Georgia','Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#0F172A;line-height:1.2;">
                      ${escapeHtml(campus.name)}
                    </div>
                    <div style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#334155;margin-top:5px;">
                      ${escapeHtml(c.subtitle || 'DIRECTORATE OF ACADEMIC & FINANCIAL CONTROLS')}
                    </div>
                    <div style="font-size:11px;color:#64748B;margin-top:4px;line-height:1.4;">
                      ${escapeHtml(campus.street)}, ${escapeHtml(campus.city)} · Tel: ${escapeHtml(campus.phone)} · Email: ${escapeHtml(campus.email)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Formal Transmittal Docket -->
          <tr>
            <td style="padding:20px 36px 12px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8FAFC;border:1px solid #E2E8F0;padding:12px 16px;">
                <tr>
                  <td style="width:50%;vertical-align:top;font-size:11.5px;color:#475569;line-height:1.6;">
                    <strong style="color:#0F172A;text-transform:uppercase;">Date of Transmission:</strong> ${todayStr}<br />
                    <strong style="color:#0F172A;text-transform:uppercase;">Jurisdiction:</strong> Republic of Kenya / International Curriculum
                  </td>
                  <td style="width:50%;vertical-align:top;font-size:11.5px;color:#475569;line-height:1.6;text-align:right;">
                    <strong style="color:#0F172A;text-transform:uppercase;">Classification:</strong> Official Institutional Record<br />
                    <strong style="color:#0F172A;text-transform:uppercase;">System Authority:</strong> SabiEdu Multi-Campus Platform
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document Subject Title -->
          <tr>
            <td style="padding:14px 36px 6px 36px;">
              <h1 style="margin:0;font-family:'Charter','Georgia','Times New Roman',serif;font-size:20px;font-weight:700;line-height:1.3;color:#0F172A;border-bottom:1px solid #E2E8F0;padding-bottom:10px;">
                ${escapeHtml(c.title || 'Official Institutional Notice')}
              </h1>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding:16px 36px 28px 36px;">
              <p style="margin:0 0 16px 0;font-size:14.5px;font-weight:700;color:#0F172A;">
                Dear ${greetingName},
              </p>
              ${paragraphsHtml}
              ${rawSectionHtml}
              ${summaryRowsHtml}
              ${calloutHtml}
              ${ctaHtml}

              <!-- Official Sign-off Block -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;border-top:1px solid #E2E8F0;padding-top:18px;">
                <tr>
                  <td style="font-size:13px;line-height:1.7;color:#334155;">
                    Yours faithfully,<br />
                    <strong style="color:#0F172A;font-size:14px;">The Executive Directorate</strong><br />
                    <span style="font-weight:600;color:#475569;">${escapeHtml(campus.name)}</span><br />
                    <span style="font-size:11.5px;color:#64748B;">For and on behalf of the Board of Governors &amp; Executive Council</span>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <div style="border:1px solid #CBD5E1;padding:6px 14px;font-size:10px;font-weight:700;color:#64748B;letter-spacing:0.1em;text-transform:uppercase;text-align:center;">
                      OFFICIALLY VERIFIED<br />SABIEDU AUTHENTIC
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Statutory Legal Disclaimer & Confidentiality Notice -->
          <tr>
            <td style="background-color:#F8FAFC;padding:20px 36px;border-top:1px solid #CBD5E1;">
              <div style="font-size:10px;line-height:1.6;color:#64748B;text-align:justify;">
                <strong>CONFIDENTIALITY &amp; STATUTORY COMPLIANCE NOTICE:</strong> The contents of this transmission and any associated attachments are strictly confidential and legally privileged, intended exclusively for the individual or corporate entity named above. This transmittal is subject to compliance under the Kenya Data Protection Act (2019) and statutory guidelines governing basic and higher educational institutions. Any unauthorized interception, copying, review, or dissemination is strictly prohibited by law. If received in error, please immediately notify the Office of the Registrar via <a href="mailto:${escapeHtml(campus.email)}" style="color:#0F172A;text-decoration:underline;">${escapeHtml(campus.email)}</a> and purge all copies from your system.<br /><br />
                ${escapeHtml(campus.footer)} · System generated via <a href="${escapeHtml(campus.website)}" style="color:#0F172A;text-decoration:none;"><strong>SabiEdu School ERP Platform</strong></a>.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textParts = [
    `${campus.name} — ${c.title || 'Official Notice'}`,
    '',
    `Dear ${c.recipientName || 'Recipient'},`,
    '',
    ...(c.bodyParagraphs ?? []),
    ...(c.summaryRows?.length
      ? ['', 'Summary:', ...c.summaryRows.map((r) => `• ${r.label}: ${r.value}`)]
      : []),
    ...(c.calloutTitle || c.calloutText
      ? ['', `${c.calloutTitle || 'Notice'}: ${c.calloutText || ''}`]
      : []),
    ...(c.ctaLabel && c.ctaUrl ? ['', `${c.ctaLabel}: ${c.ctaUrl}`] : []),
    '',
    `Sincerely,`,
    `${campus.name} (${campus.phone} | ${campus.email})`,
  ];

  return { html, text: textParts.join('\n') };
}
