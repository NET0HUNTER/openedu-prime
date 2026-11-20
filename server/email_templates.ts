import { store, type Rec } from './store.js';

export type EmailTemplateKind =
  | 'admission_confirmation'
  | 'student_enrollment'
  | 'portal_credentials'
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
  accent: string;
  gold: string;
  footer: string;
} {
  const co: Rec | undefined =
    (companyId ? store.byId('res.company', companyId) : undefined) ??
    store.all('res.company')[0];
  return {
    name: String(co?.name || 'OpenEdu Prime — Oshwal Academy'),
    code: String(co?.code || 'OPENEDU'),
    motto: String(co?.motto || 'Inspiring Excellence Across Every Campus'),
    street: String(co?.street || 'First Parklands Avenue, Off Mpaka Road'),
    city: String(co?.city || 'Nairobi'),
    phone: String(co?.phone || '+254 142 645 861'),
    email: String(co?.email || 'enquiries@oerb.org'),
    website: String(co?.website || 'https://www.oshwalacademy.sc.ke'),
    primary: String(co?.theme_primary || '#1e3f7c'),
    accent: String(co?.theme_accent || '#ec1c24'),
    gold: String(co?.theme_gold || '#f4cb00'),
    footer: String(co?.report_footer || 'OpenEdu Prime Multi-Campus ERP · Automated Official Communication'),
  };
}

function buildTemplatePreset(kind: EmailTemplateKind, ctx: EmailRenderContext): EmailRenderContext {
  switch (kind) {
    case 'admission_confirmation':
      return {
        badge: 'ADMISSIONS',
        badgeColor: '#0284c7',
        title: ctx.title || 'Admission Application Update',
        subtitle: ctx.subtitle || 'Admissions & Enrolment Office',
        calloutTone: 'info',
        ...ctx,
      };
    case 'student_enrollment':
      return {
        badge: 'OFFICIAL ENROLMENT',
        badgeColor: '#059669',
        title: ctx.title || 'Welcome to Your Academic Cohort',
        subtitle: ctx.subtitle || 'Registrar & Student Information System',
        calloutTone: 'success',
        ...ctx,
      };
    case 'portal_credentials':
      return {
        badge: 'PORTAL ACCESS',
        badgeColor: '#4f46e5',
        title: ctx.title || 'Your OpenEdu Prime Account is Ready',
        subtitle: ctx.subtitle || 'Digital Campus & Portal Identity',
        calloutTone: 'info',
        ...ctx,
      };
    case 'fee_invoice':
      return {
        badge: 'TUITION & BILLING',
        badgeColor: '#d97706',
        title: ctx.title || 'Fee Invoice & Payment Statement',
        subtitle: ctx.subtitle || 'Bursar & Student Accounts Office',
        calloutTone: 'info',
        ...ctx,
      };
    case 'absentee_alert':
      return {
        badge: 'ATTENDANCE ALERT',
        badgeColor: '#dc2626',
        title: ctx.title || 'Student Absence Notification',
        subtitle: ctx.subtitle || 'Pastoral Care & Attendance Monitoring',
        calloutTone: 'warning',
        ...ctx,
      };
    case 'event_badge':
      return {
        badge: 'EVENT PASS',
        badgeColor: '#0f766e',
        title: ctx.title || 'Confirmed Event Registration & Pass',
        subtitle: ctx.subtitle || 'Campus Events & Community Relations',
        calloutTone: 'success',
        ...ctx,
      };
    case 'campaign_newsletter':
      return {
        badge: 'CAMPUS CIRCULAR',
        badgeColor: '#1e3f7c',
        title: ctx.title || 'Official School Circular',
        subtitle: ctx.subtitle || 'Communications & Parent Relations',
        ...ctx,
      };
    case 'smtp_test':
      return {
        badge: 'SMTP VERIFIED',
        badgeColor: '#059669',
        title: ctx.title || 'Live SMTP Email Relay Active',
        subtitle: ctx.subtitle || 'System Integration Diagnostics',
        calloutTone: 'success',
        ...ctx,
      };
    default:
      return {
        badge: 'NOTIFICATION',
        badgeColor: '#1e3f7c',
        title: ctx.title || 'Official Notification',
        subtitle: ctx.subtitle || 'OpenEdu Prime ERP',
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

  const greetingName = c.recipientName ? escapeHtml(c.recipientName) : 'Valued Member';
  const paragraphsHtml = (c.bodyParagraphs ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(p)}</p>`,
    )
    .join('\n');

  const rawSectionHtml = c.rawHtmlBody
    ? `<div style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#334155;">${c.rawHtmlBody}</div>`
    : '';

  const summaryRowsHtml =
    c.summaryRows && c.summaryRows.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;overflow:hidden;background:#f8fafc;">
          <tbody>
            ${c.summaryRows
              .map(
                (row, i) => `
              <tr>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#475569;width:38%;border-bottom:${
                  i === c.summaryRows!.length - 1 ? 'none' : '1px solid #e2e8f0'
                };">${escapeHtml(row.label)}</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:500;color:#0f172a;text-align:right;border-bottom:${
                  i === c.summaryRows!.length - 1 ? 'none' : '1px solid #e2e8f0'
                };">${escapeHtml(row.value)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>`
      : '';

  const calloutColors =
    c.calloutTone === 'warning'
      ? { bg: '#fef2f2', border: '#ef4444', title: '#991b1b', text: '#7f1d1d' }
      : c.calloutTone === 'success'
      ? { bg: '#ecfdf5', border: '#10b981', title: '#065f46', text: '#064e3b' }
      : { bg: '#eff6ff', border: '#2563eb', title: '#1e40af', text: '#1e3a8a' };

  const calloutHtml =
    c.calloutTitle || c.calloutText
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;background:${calloutColors.bg};border-left:4px solid ${calloutColors.border};border-radius:6px;">
          <tr>
            <td style="padding:14px 16px;">
              ${
                c.calloutTitle
                  ? `<div style="font-size:13px;font-weight:700;color:${calloutColors.title};margin-bottom:4px;">${escapeHtml(c.calloutTitle)}</div>`
                  : ''
              }
              ${
                c.calloutText
                  ? `<div style="font-size:13px;line-height:1.5;color:${calloutColors.text};">${escapeHtml(c.calloutText)}</div>`
                  : ''
              }
            </td>
          </tr>
        </table>`
      : '';

  const ctaHtml =
    c.ctaLabel && c.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px 0;">
          <tr>
            <td align="center" bgcolor="${escapeHtml(campus.primary)}" style="border-radius:6px;">
              <a href="${escapeHtml(c.ctaUrl)}" target="_blank" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                ${escapeHtml(c.ctaLabel)} &rarr;
              </a>
            </td>
          </tr>
        </table>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.title || campus.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
          <!-- Institutional Brand Header -->
          <tr>
            <td style="background-color:${escapeHtml(campus.primary)};padding:22px 28px;border-bottom:4px solid ${escapeHtml(campus.gold)};">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">${escapeHtml(campus.name)}</div>
                    <div style="font-size:12px;color:#cbd5e1;margin-top:3px;">${escapeHtml(campus.motto)}</div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:4px 10px;border-radius:999px;background-color:${escapeHtml(
                      c.badgeColor || '#0284c7',
                    )};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
                      ${escapeHtml(c.badge || 'OFFICIAL')}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Title Banner -->
          <tr>
            <td style="padding:26px 28px 10px 28px;">
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:${escapeHtml(campus.primary)};margin-bottom:6px;">
                ${escapeHtml(c.subtitle || '')}
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:700;line-height:1.3;color:#0f172a;">
                ${escapeHtml(c.title || 'Official Notice')}
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:12px 28px 28px 28px;">
              <p style="margin:0 0 14px 0;font-size:15px;font-weight:600;color:#1e293b;">
                Dear ${greetingName},
              </p>
              ${paragraphsHtml}
              ${rawSectionHtml}
              ${summaryRowsHtml}
              ${calloutHtml}
              ${ctaHtml}
              <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                Warm regards,<br />
                <strong style="color:#1e293b;">${escapeHtml(campus.name)}</strong><br />
                ${escapeHtml(campus.street)}, ${escapeHtml(campus.city)} · Tel: ${escapeHtml(campus.phone)}
              </p>
            </td>
          </tr>

          <!-- Legal / Footer Bar -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 28px;border-top:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:11px;color:#64748b;line-height:1.5;">
                ${escapeHtml(campus.footer)}<br />
                Contact: <a href="mailto:${escapeHtml(campus.email)}" style="color:${escapeHtml(campus.primary)};text-decoration:none;">${escapeHtml(campus.email)}</a> ·
                <a href="${escapeHtml(campus.website)}" style="color:${escapeHtml(campus.primary)};text-decoration:none;">${escapeHtml(campus.website)}</a>
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
    `${campus.name} — ${c.title || 'Notification'}`,
    '',
    `Dear ${c.recipientName || 'Valued Member'},`,
    '',
    ...(c.bodyParagraphs ?? []),
    ...(c.summaryRows?.length
      ? ['', 'Summary:', ...c.summaryRows.map((r) => `• ${r.label}: ${r.value}`)]
      : []),
    ...(c.calloutTitle || c.calloutText
      ? ['', `${c.calloutTitle || 'Note'}: ${c.calloutText || ''}`]
      : []),
    ...(c.ctaLabel && c.ctaUrl ? ['', `${c.ctaLabel}: ${c.ctaUrl}`] : []),
    '',
    `Warm regards,`,
    `${campus.name} (${campus.phone} | ${campus.email})`,
  ];

  return { html, text: textParts.join('\n') };
}
