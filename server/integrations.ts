import { store } from './store.js';

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
