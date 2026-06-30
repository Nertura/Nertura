import { Resend } from 'resend';

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.OUTREACH_FROM_EMAIL);
}

export async function sendOutreachEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OUTREACH_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and OUTREACH_FROM_EMAIL must be configured');
  }

  const resend = new Resend(apiKey);

  const html = params.body
    .split('\n')
    .map((line) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html,
    text: params.body,
  });

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error('Resend did not return a message id');

  return { id: data.id };
}

export async function sendAdminNotification(params: {
  subject: string;
  body: string;
}): Promise<void> {
  const notifyEmail = process.env.OUTREACH_NOTIFY_EMAIL;
  if (!notifyEmail || !isResendConfigured()) return;

  await sendOutreachEmail({
    to: notifyEmail,
    subject: params.subject,
    body: params.body,
  });
}
