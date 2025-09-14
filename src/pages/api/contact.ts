import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, TO_EMAIL } = import.meta.env;

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    // Honeypot
    if (String(form.get('bot-field') || '')) return new Response(null, { status: 204 });

    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const company = String(form.get('company') || '').trim();
    const message = String(form.get('message') || '').trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_PORT) === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: FROM_EMAIL,           // e.g. "Quality <no-reply@yourdomain.com>"
      to: TO_EMAIL,               // your inbox
      replyTo: email,             // hit “Reply” to respond to sender
      subject: `New Contact — ${name}${company ? ` (${company})` : ''}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Company: ${company || '-'}`, '', 'Message:', message].join('\n'),
    });

    return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
  } catch (e) {
    console.error('Email error:', e);
    return new Response(JSON.stringify({ ok: false, error: 'Email failed' }), { status: 500 });
  }
};
