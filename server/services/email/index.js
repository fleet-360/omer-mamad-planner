// Email sending. Choose with EMAIL_PROVIDER=console|smtp|resend.
//  console — prints the email to the server log (default, nothing is sent)
//  smtp    — any SMTP server (Gmail Workspace, Office 365, SendGrid SMTP, ...) via nodemailer
//  resend  — Resend HTTP API (RESEND_API_KEY)
import nodemailer from 'nodemailer';
import { config } from '../../config.js';
import * as templates from './templates.js';

let transport = null;

async function deliver({ to, subject, html, text }) {
  const { provider, from } = config.email;
  if (!to) return { skipped: true };

  if (provider === 'smtp') {
    const s = config.email.smtp;
    transport ||= nodemailer.createTransport({ host: s.host, port: s.port, secure: s.secure, auth: s.user ? { user: s.user, pass: s.pass } : undefined });
    const info = await transport.sendMail({ from, to, subject, html, text });
    return { id: info.messageId };
  }

  if (provider === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.email.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html, text }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('Resend: ' + (json.message || res.status));
    return { id: json.id };
  }

  console.log(`\n[email:console] to=${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`);
  return { id: 'console' };
}

/** send(templateName, to, data) — never throws, so a mail outage does not break signup or payment */
export async function sendEmail(name, to, data = {}) {
  const tpl = templates[name];
  if (!tpl) throw new Error(`Unknown email template "${name}"`);
  const { subject, html, text } = tpl(data);
  try {
    return await deliver({ to, subject, html, text });
  } catch (e) {
    console.error(`[email] "${name}" to ${to} failed:`, e.message);
    return { error: e.message };
  }
}

export function notifyOffice(name, data) {
  return config.email.notify ? sendEmail(name, config.email.notify, data) : Promise.resolve({ skipped: true });
}
