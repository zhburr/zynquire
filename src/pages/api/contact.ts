import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, TO_EMAIL } = import.meta.env;

export const POST: APIRoute = async ({ request }) => {
  // ✅ NEW: detect if the client wants JSON (our fetch does)
  const wantsJSON = request.headers.get('accept')?.includes('application/json');

  try {
    const form = await request.formData();

    // honeypot
    if (String(form.get('bot-field') || '')) {
      return wantsJSON
        ? new Response(JSON.stringify({ ok: true, skipped: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        : new Response(null, { status: 204 });
    }

    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const company = String(form.get('company') || '').trim();
    const message = String(form.get('message') || '').trim();

    // ✅ NEW: validation returns JSON with 400 for AJAX
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // send email (unchanged)
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_PORT) === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New Contact — ${name}${company ? ` (${company})` : ''}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Company: ${company || '-'}`, '', 'Message:', message].join('\n'),
    });

    // ✅ SUCCESS:
    // - If AJAX: JSON { ok:true }
    // - If normal POST: redirect to /thank-you
    if (wantsJSON) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
  } catch (e: any) {
    // ✅ ERROR: always JSON for AJAX path
    return new Response(JSON.stringify({ ok: false, error: 'We couldn’t send your message right now. Please try again in a moment' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
