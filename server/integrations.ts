import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { store } from './store.js';
import {
  renderProfessionalEmail,
  type EmailRenderContext,
  type EmailTemplateKind,
} from './email_templates.js';

const SECRETS_FILE = path.resolve(process.cwd(), 'server', 'data', '.secrets.json');

export interface SmtpConfig {
  provider: string;
  host: string;
  port: number;
  encryption: 'starttls' | 'ssl' | 'none';
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export function readLocalSecrets(): Record<string, string> {
  try {
    if (!fs.existsSync(SECRETS_FILE)) return {};
    const parsed = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeLocalSecrets(patch: Record<string, string | undefined>): void {
  if (process.env.VITEST) return;
  const cur = readLocalSecrets();
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (v === '') delete cur[k];
    else cur[k] = v;
  }
  fs.mkdirSync(path.dirname(SECRETS_FILE), { recursive: true });
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(cur, null, 2), 'utf8');
}

export function resolveSmtpConfig(): SmtpConfig {
  const s = store.getSettings();
  const secrets = readLocalSecrets();
  const host = String(s.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(s.smtp_port || process.env.SMTP_PORT || 587);
  const encryption = String(
    s.smtp_encryption || process.env.SMTP_ENCRYPTION || (port === 465 ? 'ssl' : 'starttls'),
  ) as SmtpConfig['encryption'];
  const user = String(s.smtp_user || secrets.smtp_user || process.env.SMTP_USER || '').trim();
  const pass = String(secrets.smtp_pass || process.env.SMTP_PASS || '').trim();
  const fromName = String(s.smtp_from_name || process.env.SMTP_FROM_NAME || 'SabiEdu').trim();
  const fromEmail = String(s.smtp_from_email || process.env.SMTP_FROM_EMAIL || user || 'noreply@sabiedu.local').trim();
  const provider = String(s.email_provider || process.env.EMAIL_PROVIDER || 'simulate').trim();
  return { provider, host, port, encryption, user, pass, fromName, fromEmail };
}

function createSmtpTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.encryption === 'ssl' || cfg.port === 465,
    requireTLS: cfg.encryption === 'starttls',
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function testSmtpConnection(testTo?: string): Promise<{
  ok: boolean;
  message: string;
  messageId?: string;
  configured: boolean;
}> {
  const cfg = resolveSmtpConfig();
  if (!cfg.host) {
    return { ok: false, configured: false, message: 'SMTP Host is not configured.' };
  }
  if (!cfg.user || !cfg.pass) {
    return {
      ok: false,
      configured: false,
      message: `SMTP Host (${cfg.host}:${cfg.port}) saved, but ${!cfg.user ? 'SMTP Username/Email' : 'SMTP Password'} is missing. Enter it under Settings → Messaging to send live emails.`,
    };
  }
  if (process.env.VITEST) {
    return { ok: true, configured: true, message: `SMTP transport ready (${cfg.host}:${cfg.port} as ${cfg.user}).` };
  }
  try {
    const transporter = createSmtpTransport(cfg);
    await transporter.verify();
    if (testTo && testTo.includes('@')) {
      const { html, text } = renderProfessionalEmail('smtp_test', {
        recipientName: 'System Administrator',
        title: 'SMTP Relay Connected & Verified',
        bodyParagraphs: [
          'This automated verification email confirms that your SabiEdu School ERP SMTP configuration is live and delivering executive HTML communications.',
          'All admissions updates, student enrolments, tuition invoices, portal invitations, and attendance notices will now be delivered using this relay.',
        ],
        summaryRows: [
          { label: 'SMTP Server', value: `${cfg.host}:${cfg.port}` },
          { label: 'Encryption', value: cfg.encryption.toUpperCase() },
          { label: 'Authenticated Account', value: cfg.user },
          { label: 'Sender Identity', value: `${cfg.fromName} <${cfg.fromEmail}>` },
        ],
        calloutTitle: 'Production Ready',
        calloutText: 'Credentials are stored strictly outside source control and managed dynamically through Settings configuration.',
      });
      const info = await transporter.sendMail({
        from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
        to: testTo,
        subject: 'SabiEdu — SMTP Relay & HTML Correspondence Verified',
        html,
        text,
      });
      store.create('comm.outbox', {
        to: testTo,
        recipient_name: 'SMTP Verification Test',
        channel: 'email',
        subject: 'SabiEdu — SMTP Relay & HTML Correspondence Verified',
        body: text,
        body_html: html,
        provider: 'smtp',
        provider_ref: info.messageId,
        state: 'sent',
      });
      return {
        ok: true,
        configured: true,
        messageId: info.messageId,
        message: `Live SMTP verified (${cfg.host}:${cfg.port}) and test HTML email sent to ${testTo} (ID: ${info.messageId}).`,
      };
    }
    return {
      ok: true,
      configured: true,
      message: `Live SMTP handshake verified (${cfg.host}:${cfg.port} as ${cfg.user}).`,
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      message: `SMTP connection failed (${cfg.host}:${cfg.port}): ${err?.message || 'Authentication or network error'}`,
    };
  }
}

export async function sendTemplatedEmail(opts: {
  to: string;
  recipientName?: string;
  subject: string;
  template: EmailTemplateKind;
  context: EmailRenderContext;
  resModel?: string;
  resId?: number;
  userId?: number;
}) {
  const cfg = resolveSmtpConfig();
  const { html, text } = renderProfessionalEmail(opts.template, {
    recipientName: opts.recipientName,
    ...opts.context,
  });

  const outbox = store.create(
    'comm.outbox',
    {
      to: opts.to,
      recipient_name: opts.recipientName || opts.to,
      channel: 'email',
      subject: opts.subject,
      body: text,
      body_html: html,
      res_model: opts.resModel,
      res_id: opts.resId,
      provider: cfg.provider === 'smtp' ? 'smtp' : 'simulate',
      provider_ref: cfg.provider === 'smtp' ? 'pending_smtp' : `email_sim_${Date.now()}`,
      state: cfg.provider === 'smtp' ? 'queued' : 'sent',
      company_id: opts.context.companyId,
    },
    opts.userId ?? 1,
    false,
  );

  if (cfg.provider === 'smtp' && cfg.host && cfg.user && cfg.pass && opts.to.includes('@') && !process.env.VITEST) {
    try {
      const transporter = createSmtpTransport(cfg);
      const info = await transporter.sendMail({
        from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
        to: opts.to,
        subject: opts.subject,
        html,
        text,
      });
      return store.write('comm.outbox', outbox.id, {
        state: 'sent',
        provider: 'smtp',
        provider_ref: info.messageId,
      }, opts.userId ?? 1, false);
    } catch (err: any) {
      return store.write('comm.outbox', outbox.id, {
        state: 'failed',
        provider: 'smtp',
        error: err?.message || 'SMTP delivery failed',
      }, opts.userId ?? 1, false);
    }
  }

  return outbox;
}

export function dispatchEmailAsync(opts: Parameters<typeof sendTemplatedEmail>[0]): void {
  void sendTemplatedEmail(opts).catch(() => {
    // Outbox record logs delivery state cleanly without blocking synchronous workflows
  });
}

export async function triggerMpesaStkPush(opts: { phone: string; amount: number; move_id?: number; student_id?: number; accountRef?: string }) {
  const settings = store.getSettings();
  const inv = opts.move_id ? store.byId('account.move', opts.move_id) : undefined;
  const stu = opts.student_id ? store.byId('op.student', opts.student_id) : undefined;
  const ref = opts.accountRef || stu?.gr_no || inv?.name || `SCH-${Date.now()}`;

  // If Daraja production/sandbox credentials are configured, hit Safaricom Daraja OAuth + STK Push
  if (settings.mpesa_env !== 'simulate' && settings.mpesa_consumer_key && settings.mpesa_consumer_secret && settings.mpesa_passkey) {
    const base = settings.mpesa_env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
    const creds = Buffer.from(`${settings.mpesa_consumer_key}:${settings.mpesa_consumer_secret}`).toString('base64');
    const authRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${creds}` },
    });
    const authData = (await authRes.json()) as { access_token?: string };
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${settings.mpesa_shortcode}${settings.mpesa_passkey}${ts}`).toString('base64');
    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: settings.mpesa_shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(opts.amount),
        PartyA: opts.phone.replace(/^\+/, ''),
        PartyB: settings.mpesa_shortcode,
        PhoneNumber: opts.phone.replace(/^\+/, ''),
        CallBackURL: settings.mpesa_callback_url,
        AccountReference: ref,
        TransactionDesc: `School Fee Payment (${ref})`,
      }),
    });
    const data = (await stkRes.json()) as Record<string, string>;
    return store.create('payment.transaction', {
      reference: ref, provider: 'mpesa', phone: opts.phone, amount: opts.amount,
      move_id: opts.move_id, student_id: opts.student_id,
      merchant_request_id: data.MerchantRequestID, checkout_request_id: data.CheckoutRequestID,
      result_desc: data.CustomerMessage || 'STK Push sent', state: 'pending', company_id: inv?.company_id ?? 1,
    });
  }

  // Simulation mode (default until school enters Daraja keys in Settings -> Payments)
  const tx = store.create('payment.transaction', {
    reference: ref, provider: 'mpesa', phone: opts.phone, amount: opts.amount,
    move_id: opts.move_id, student_id: opts.student_id,
    merchant_request_id: `SIM-MR-${Date.now()}`, checkout_request_id: `ws_CO_SIM_${Date.now()}`,
    mpesa_receipt: `SLK${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    result_desc: 'Simulated Daraja STK Push settled instantly.', state: 'done', company_id: inv?.company_id ?? 1,
  });
  if (inv) {
    const rem = Math.max(0, Number(inv.amount_residual ?? inv.amount_total) - opts.amount);
    store.write('account.move', inv.id, { amount_residual: rem, payment_state: rem === 0 ? 'paid' : 'partial' });
  }
  return tx;
}

export async function sendWhatsAppMessage(to: string, body: string, recipient_name = 'Recipient', res_model?: string, res_id?: number) {
  const settings = store.getSettings();
  if (settings.whatsapp_provider === 'meta_cloud' && settings.whatsapp_token && settings.whatsapp_phone_number_id) {
    const res = await fetch(`https://graph.facebook.com/v20.0/${settings.whatsapp_phone_number_id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.whatsapp_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/^\+/, ''), type: 'text', text: { body } }),
    });
    const data = (await res.json()) as { messages?: { id: string }[]; error?: { message: string } };
    return store.create('comm.outbox', {
      to, recipient_name, channel: 'whatsapp', subject: 'WhatsApp Cloud Message', body,
      res_model, res_id, provider: 'meta_cloud', provider_ref: data.messages?.[0]?.id,
      state: res.ok ? 'sent' : 'failed', error: data.error?.message,
    });
  }
  return store.create('comm.outbox', {
    to, recipient_name, channel: 'whatsapp', subject: 'WhatsApp Message', body,
    res_model, res_id, provider: 'simulate', provider_ref: `wa_sim_${Date.now()}`, state: 'sent',
  });
}

export function exportExamBoardEdi(sessionId?: number) {
  const regs = store.all('op.subject.registration').filter((r) => r.state === 'approved' || r.state === 'submitted');
  const lines = regs.map((r) => {
    const stu = store.byId('op.student', Number(r.student_id));
    const course = store.byId('op.course', Number(r.course_id));
    const subs = [...(r.compulsory_subject_ids ?? []), ...(r.elective_subject_ids ?? [])]
      .map((sid: number) => store.byId('op.subject', sid))
      .filter(Boolean);
    return {
      candidate_no: stu?.gr_no,
      candidate_name: stu ? store.displayName('op.student', stu) : '',
      year_group: course?.name,
      session_id: sessionId ?? 1,
      entries: subs.map((s) => ({ code: s!.code, title: s!.name, board: s!.exam_board })),
    };
  });
  return {
    format: 'CAIE_EDEXCEL_EDI_V1',
    generated_at: new Date().toISOString(),
    candidates_count: lines.length,
    candidates: lines,
  };
}
