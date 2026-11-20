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
  return {
    name: String(co?.name || 'SabiEdu — Oshwal Academy'),
    code: String(co?.code || 'SABIEDU'),
    motto: String(co?.motto || 'Multi-Campus Academic Administration'),
    street: String(co?.street || 'First Parklands Avenue, Off Mpaka Road'),
    city: String(co?.city || 'Nairobi'),
    phone: String(co?.phone || '+254 142 645 861'),
    email: String(co?.email || 'enquiries@oerb.org'),
    website: String(co?.website || 'https://www.oshwalacademy.sc.ke'),
    primary: String(co?.theme_primary || '#0F2342'),
    footer: String(co?.report_footer || 'SabiEdu Multi-Campus ERP · Official Institutional Correspondence'),
  };
}

function buildTemplatePreset(kind: EmailTemplateKind, ctx: EmailRenderContext): EmailRenderContext {
  switch (kind) {
    case 'admission_confirmation':
      return {
        badge: 'ADMISSIONS',
        title: ctx.title || 'Admission Application Update',
        subtitle: ctx.subtitle || 'Office of Admissions & Enrolment',
        calloutTone: 'info',
        ...ctx,
      };
    case 'student_enrollment':
      return {
        badge: 'OFFICIAL ENROLMENT',
        title: ctx.title || 'Student Enrolment Confirmation',
        subtitle: ctx.subtitle || 'Office of the Registrar',
        calloutTone: 'success',
        ...ctx,
      };
    case 'portal_credentials':
      return {
        badge: 'PORTAL ACCESS',
        title: ctx.title || 'SabiEdu Account Provisioned',
        subtitle: ctx.subtitle || 'Digital Campus Identity',
        calloutTone: 'info',
        ...ctx,
      };
    case 'password_reset':
      return {
        badge: 'ACCOUNT SECURITY',
        title: ctx.title || 'Account Password Setup',
        subtitle: ctx.subtitle || 'SabiEdu Identity & Access Control',
        calloutTone: 'warning',
        ...ctx,
      };
    case 'fee_invoice':
      return {
        badge: 'BURSAR STATEMENT',
        title: ctx.title || 'Tuition & Fee Statement',
        subtitle: ctx.subtitle || 'Student Accounts & Finance Office',
        calloutTone: 'info',
        ...ctx,
      };
    case 'absentee_alert':
      return {
        badge: 'ATTENDANCE NOTICE',
        title: ctx.title || 'Student Absence Notification',
        subtitle: ctx.subtitle || 'Pastoral Care & Attendance Office',
        calloutTone: 'warning',
        ...ctx,
      };
    case 'event_badge':
      return {
        badge: 'EVENT REGISTRATION',
        title: ctx.title || 'Confirmed Event Pass',
        subtitle: ctx.subtitle || 'Campus Events & External Relations',
        calloutTone: 'success',
        ...ctx,
      };
    case 'campaign_newsletter':
      return {
        badge: 'INSTITUTIONAL CIRCULAR',
        title: ctx.title || 'Official School Circular',
        subtitle: ctx.subtitle || 'Executive Administration',
        ...ctx,
      };
    case 'smtp_test':
      return {
        badge: 'SYSTEM DIAGNOSTICS',
        title: ctx.title || 'SMTP Mail Relay Verified',
        subtitle: ctx.subtitle || 'SabiEdu Platform Infrastructure',
        calloutTone: 'success',
        ...ctx,
      };
    default:
      return {
        badge: 'OFFICIAL NOTICE',
        title: ctx.title || 'Official Communication',
        subtitle: ctx.subtitle || 'SabiEdu Administration',
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
  const brandHex = '#0F2342';
  const monogram = escapeHtml(campus.name.trim().charAt(0).toUpperCase() || 'S');

  const greetingName = c.recipientName ? escapeHtml(c.recipientName) : 'Recipient';
  const paragraphsHtml = (c.bodyParagraphs ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:14.5px;line-height:1.65;color:#334155;">${escapeHtml(p)}</p>`,
    )
    .join('\n');

  const rawSectionHtml = c.rawHtmlBody
    ? `<div style="margin:0 0 18px 0;font-size:14.5px;line-height:1.65;color:#334155;">${c.rawHtmlBody}</div>`
    : '';

  const summaryRowsHtml =
    c.summaryRows && c.summaryRows.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:22px 0;border-top:1px solid #CBD5E1;border-bottom:1px solid #CBD5E1;border-collapse:collapse;">
          <tbody>
            ${c.summaryRows
              .map(
                (row, i) => `
              <tr>
                <td style="padding:10px 0;font-size:12.5px;font-weight:500;color:#64748B;width:40%;border-bottom:${
                  i === c.summaryRows!.length - 1 ? 'none' : '1px solid #F1F5F9'
                };">${escapeHtml(row.label)}</td>
                <td style="padding:10px 0;font-size:13px;font-weight:600;color:#0F172A;text-align:right;font-variant-numeric:tabular-nums;border-bottom:${
                  i === c.summaryRows!.length - 1 ? 'none' : '1px solid #F1F5F9'
                };">${escapeHtml(row.value)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>`
      : '';

  const calloutAccent =
    c.calloutTone === 'warning' ? '#991B1B' : c.calloutTone === 'success' ? '#065F46' : brandHex;

  const calloutHtml =
    c.calloutTitle || c.calloutText
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid ${calloutAccent};border-radius:3px;">
          <tr>
            <td style="padding:14px 16px;">
              ${
                c.calloutTitle
                  ? `<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#0F172A;margin-bottom:4px;">${escapeHtml(c.calloutTitle)}</div>`
                  : ''
              }
              ${
                c.calloutText
                  ? `<div style="font-size:13px;line-height:1.55;color:#475569;">${escapeHtml(c.calloutText)}</div>`
                  : ''
              }
            </td>
          </tr>
        </table>`
      : '';

  const ctaHtml =
    c.ctaLabel && c.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 12px 0;">
          <tr>
            <td align="left" bgcolor="${brandHex}" style="border-radius:4px;">
              <a href="${escapeHtml(c.ctaUrl)}" target="_blank" style="display:inline-block;padding:11px 22px;font-size:13.5px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;border-radius:4px;">
                ${escapeHtml(c.ctaLabel)}
              </a>
            </td>
          </tr>
        </table>
        <div style="margin:0 0 18px 0;font-size:11.5px;line-height:1.5;color:#64748B;word-break:break-all;">
          Direct link: <a href="${escapeHtml(c.ctaUrl)}" style="color:${brandHex};text-decoration:underline;">${escapeHtml(c.ctaUrl)}</a>
        </div>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.title || campus.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F4F5F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;background-color:#FFFFFF;border:1px solid #E2E6EC;border-top:3px solid ${brandHex};border-radius:4px;">
          <!-- Executive Masthead -->
          <tr>
            <td style="padding:24px 36px 20px 36px;border-bottom:1px solid #E5E7EB;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:30px;height:30px;background-color:${brandHex};border-radius:3px;text-align:center;vertical-align:middle;font-size:14px;font-weight:700;color:#FFFFFF;">
                          ${monogram}
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <div style="font-size:15px;font-weight:700;color:#0F172A;letter-spacing:-0.01em;">${escapeHtml(campus.name)}</div>
                          <div style="font-size:11.5px;color:#64748B;margin-top:1px;">${escapeHtml(campus.city)} · Powered by SabiEdu</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">
                      ${escapeHtml(c.badge || 'OFFICIAL')}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document Heading -->
          <tr>
            <td style="padding:28px 36px 8px 36px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#475569;margin-bottom:6px;">
                ${escapeHtml(c.subtitle || '')}
              </div>
              <h1 style="margin:0;font-size:21px;font-weight:600;line-height:1.3;letter-spacing:-0.02em;color:#0F172A;">
                ${escapeHtml(c.title || 'Official Notice')}
              </h1>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding:14px 36px 30px 36px;">
              <p style="margin:0 0 14px 0;font-size:14.5px;font-weight:600;color:#0F172A;">
                Dear ${greetingName},
              </p>
              ${paragraphsHtml}
              ${rawSectionHtml}
              ${summaryRowsHtml}
              ${calloutHtml}
              ${ctaHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:26px;border-top:1px solid #F1F5F9;">
                <tr>
                  <td style="padding-top:16px;font-size:13px;line-height:1.6;color:#475569;">
                    Sincerely,<br />
                    <strong style="color:#0F172A;">${escapeHtml(campus.name)}</strong><br />
                    <span style="font-size:12px;color:#64748B;">${escapeHtml(campus.street)}, ${escapeHtml(campus.city)} · Tel: ${escapeHtml(campus.phone)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Institutional Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:16px 36px;border-top:1px solid #E5E7EB;">
              <div style="font-size:11px;color:#64748B;line-height:1.6;">
                ${escapeHtml(campus.footer)}<br />
                <a href="mailto:${escapeHtml(campus.email)}" style="color:#334155;text-decoration:none;">${escapeHtml(campus.email)}</a> ·
                <a href="${escapeHtml(campus.website)}" style="color:#334155;text-decoration:none;">${escapeHtml(campus.website)}</a>
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
