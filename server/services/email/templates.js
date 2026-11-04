// Hebrew RTL email templates in the system's visual language (#1A1A17 / #4C6EF5 / Rubik).
import { config } from '../../config.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function layout(title, bodyHtml, cta) {
  const button = cta
    ? `<a href="${esc(cta.url)}" style="display:inline-block;background:#4C6EF5;color:#fff;text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500">${esc(cta.label)}</a>`
    : '';
  return `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#F4F2ED;font-family:Rubik,Arial,sans-serif;color:#1A1A17">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2ED;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #DEDCD5" dir="rtl">
<tr><td style="background:#1A1A17;color:#F4F2ED;padding:14px 22px;font-size:13px;font-weight:500">
<span style="display:inline-block;width:12px;height:12px;border:2px solid #4C6EF5;vertical-align:middle;margin-left:8px"></span>מערכת תכנון ממ״ד · התקן עומר</td></tr>
<tr><td style="padding:30px 26px;text-align:right">
<h1 style="font-size:21px;font-weight:600;margin:0 0 14px">${esc(title)}</h1>
<div style="font-size:14px;line-height:1.7;color:#4A4943">${bodyHtml}</div>
${button ? `<div style="margin-top:24px">${button}</div>` : ''}
</td></tr>
<tr><td style="padding:14px 26px;border-top:1px solid #EDEBE4;font-size:11.5px;color:#8C8A82;text-align:right">הודעה זו נשלחה אוטומטית ממערכת תכנון ממ״ד.</td></tr>
</table></td></tr></table></body></html>`;
}

const rows = (pairs) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px;font-size:13px">${pairs
    .map(([k, v]) => `<tr><td style="color:#8C8A82;padding:3px 0 3px 22px">${esc(k)}</td><td style="padding:3px 0">${esc(v)}</td></tr>`)
    .join('')}</table>`;

export function welcome({ firstName, planName }) {
  const title = 'החשבון נפתח';
  const text = `שלום ${firstName || ''},\nהחשבון שלך במערכת תכנון ממ״ד נפתח${planName ? ` (חבילת ${planName})` : ''}.\nאפשר להתחיל ולפתוח פרויקט: ${config.appUrl}/#/wizard`;
  return {
    subject: 'ברוכים הבאים למערכת תכנון ממ״ד',
    text,
    html: layout(title, `שלום ${esc(firstName)},<br>החשבון שלך נפתח${planName ? ` · חבילת ${esc(planName)}` : ''}. אפשר להעלות שרטוט ולהתחיל בתכנון.`, { label: 'לפתיחת פרויקט', url: `${config.appUrl}/#/wizard` }),
  };
}

export function receipt({ orderId, planName, net, vat, total, firstName }) {
  const fmt = (n) => (n === null || n === undefined ? '—' : `${Number(n).toLocaleString('he-IL')} ₪`);
  const pairs = [['מספר הזמנה', orderId], ['חבילה', planName], ['מחיר חודשי', fmt(net)], ['מע״מ', fmt(vat)], ['סה״כ', fmt(total)]];
  return {
    subject: `התשלום התקבל · ${orderId}`,
    text: `שלום ${firstName || ''},\nהתשלום התקבל.\n` + pairs.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: layout('התשלום התקבל', `שלום ${esc(firstName)}, תודה! פרטי ההזמנה:` + rows(pairs), { label: 'לפתיחת פרויקט', url: `${config.appUrl}/#/wizard` }),
  };
}

export function projectSubmitted({ projectName, address, drawingName, projectId }) {
  const pairs = [['פרויקט', projectName || '—'], ['כתובת', address || '—'], ['שרטוט', drawingName || '—'], ['מזהה', projectId]];
  return {
    subject: `הפרויקט נפתח · ${projectName || projectId}`,
    text: 'השאלון נשלח והפרויקט נפתח.\n' + pairs.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: layout('השאלון נשלח', 'הפרויקט נפתח והשרטוט מוכן להצבה.' + rows(pairs), { label: 'פתח את השרטוט', url: `${config.appUrl}/#/canvas` }),
  };
}

export function officeNewProject(data) {
  const t = projectSubmitted(data);
  return { ...t, subject: `[חדש] ${t.subject}` };
}

export function officeNewPayment(data) {
  const t = receipt(data);
  return { ...t, subject: `[תשלום] ${data.planName} · ${data.orderId}` };
}
