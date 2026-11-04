import fs from 'node:fs';
import crypto from 'node:crypto';
import express from 'express';
import { config } from './config.js';
import { db } from './db.js';
import { hashPassword, verifyPassword, issueToken } from './auth.js';
import { PLANS, quote } from './plans.js';
import { paymentProvider } from './services/payments/index.js';
import { sendEmail, notifyOffice } from './services/email/index.js';
import { uploadDrawing, inspectDwg } from './services/drawings.js';

export const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (res, error, status = 400) => res.status(status).json({ error });
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
const publicUser = (u) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, office: u.office, plan: u.plan });

// multipart filenames may arrive latin1-decoded; recover UTF-8 (Hebrew) names
const fixName = (n) => { const u = Buffer.from(n, 'latin1').toString('utf8'); return u.includes('�') ? n : u; };

function nextOrderId() {
  const d = new Date();
  const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const n = db.all('orders').filter((o) => o.id.startsWith(`OM-${ymd}-`)).length + 1;
  return `OM-${ymd}-${String(n).padStart(4, '0')}`;
}

// ------------------------------------------------------------------ health
router.get('/health', (_req, res) => {
  res.json({ ok: true, payments: config.payments.provider, email: config.email.provider, demo: config.authDemo });
});

// ------------------------------------------------------------------ auth
router.post('/auth/signup', wrap(async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!isEmail(email)) return bad(res, 'כתובת דוא״ל לא תקינה');
  if (!config.authDemo && String(b.password || '').length < 8) return bad(res, 'סיסמה — לפחות 8 תווים');
  let user = db.find('users', (u) => u.email === email);
  if (user && !config.authDemo) return bad(res, 'קיים כבר חשבון עם הדוא״ל הזה', 409);
  const profile = {
    email, firstName: b.firstName || '', lastName: b.lastName || '', office: b.office || '', phone: b.phone || '',
    officeEmail: b.officeEmail || '', officeAddress: b.officeAddress || '',
    buildTypes: b.buildTypes || [], projectType: b.projectType || '', field: b.field || '',
  };
  user = user ? db.update('users', user.id, profile) : db.insert('users', { ...profile, password: hashPassword(b.password || crypto.randomUUID()) });
  res.json({ token: issueToken(user), user: publicUser(user) });
}));

router.post('/auth/login', wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  let user = db.find('users', (u) => u.email === email);
  if (!user && config.authDemo && isEmail(email)) user = db.insert('users', { email, password: hashPassword(password), demo: true });
  if (!user || (!config.authDemo && !verifyPassword(password, user.password))) return bad(res, 'דוא״ל או סיסמה שגויים', 401);
  res.json({ token: issueToken(user), user: publicUser(user) });
}));

// ------------------------------------------------------------------ payments
router.get('/plans', (_req, res) => res.json({ plans: PLANS.map((p, i) => ({ ...p, ...quote(i), plan: undefined })) }));

router.post('/payments/checkout', wrap(async (req, res) => {
  const { plan: planIndex, method, customer = {} } = req.body || {};
  const q = quote(Number(planIndex));
  if (!q) return bad(res, 'חבילה לא קיימת');
  const provider = paymentProvider();
  if (q.total === null && provider.name !== 'mock') return bad(res, 'המחיר לחבילה זו טרם הוגדר');

  const order = db.insert('orders', {
    id: nextOrderId(), userId: req.user?.sub || null, plan: q.plan.key, planName: q.plan.name, method: method || 'card',
    net: q.net, vat: q.vat, total: q.total ?? 0, currency: 'ILS', status: 'pending', provider: provider.name,
    customer: { firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone, office: customer.office },
  });

  const paid = async () => {
    db.update('orders', order.id, { status: 'paid', paidAt: new Date().toISOString() });
    const mail = { ...order, orderId: order.id, firstName: customer.firstName };
    if (q.plan.key === 'trial') await sendEmail('welcome', customer.email, { firstName: customer.firstName, planName: q.plan.name });
    else await sendEmail('receipt', customer.email, mail);
    await notifyOffice('officeNewPayment', mail);
  };

  // trial: no charge at all
  if (q.plan.key === 'trial') { await paid(); return res.json({ orderId: order.id, status: 'paid' }); }

  const r = await provider.createPayment({
    order,
    customer,
    successUrl: `${config.appUrl}/?payment=success&order=${order.id}#/signup`,
    cancelUrl: `${config.appUrl}/?payment=cancel&order=${order.id}#/signup`,
    notifyUrl: `${config.apiPublicUrl}/api/payments/webhook/${provider.name}`,
  });
  db.update('orders', order.id, { providerRef: r.providerRef || null });
  if (r.status === 'paid') { await paid(); return res.json({ orderId: order.id, status: 'paid' }); }
  res.json({ orderId: order.id, status: 'pending', redirectUrl: r.redirectUrl });
}));

// provider -> server notification (source of truth for live payments)
router.post('/payments/webhook/:provider', express.urlencoded({ extended: true }), wrap(async (req, res) => {
  const provider = paymentProvider(req.params.provider);
  const r = await provider.verifyWebhook(req);
  const order = r.orderId && db.find('orders', (o) => o.id === r.orderId);
  if (!order) return bad(res, 'order not found', 404);
  if (order.status !== 'paid') {
    db.update('orders', order.id, { status: r.paid ? 'paid' : 'failed', providerRef: r.providerRef, paidAt: r.paid ? new Date().toISOString() : null });
    if (r.paid) {
      const mail = { ...order, orderId: order.id, firstName: order.customer?.firstName };
      await sendEmail('receipt', order.customer?.email, mail);
      await notifyOffice('officeNewPayment', mail);
    }
  }
  res.json({ ok: true });
}));

router.get('/payments/orders/:id', (req, res) => {
  const o = db.find('orders', (x) => x.id === req.params.id);
  if (!o) return bad(res, 'not found', 404);
  res.json({ id: o.id, status: o.status, planName: o.planName, total: o.total });
});

// ------------------------------------------------------------------ drawings (DWG only)
router.post('/uploads/drawing', (req, res, next) => {
  uploadDrawing(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? `הקובץ גדול מ‑${config.maxUploadMb}MB` : err.message;
      return bad(res, msg, err.status || 400);
    }
    if (!req.file) return bad(res, 'לא נבחר קובץ');
    const info = inspectDwg(req.file.path);
    if (!info.ok) {
      fs.unlink(req.file.path, () => {});
      return bad(res, 'הקובץ אינו קובץ DWG תקין');
    }
    const row = db.insert('uploads', {
      userId: req.user?.sub || null, originalName: fixName(req.file.originalname),
      storedAs: req.file.filename, size: req.file.size, dwg: info.code, version: info.version,
    });
    res.json({ id: row.id, name: row.originalName, size: row.size, version: info.version });
  });
});

// ------------------------------------------------------------------ projects (wizard)
router.post('/projects', wrap(async (req, res) => {
  const b = req.body || {};
  const f = b.fields || {};
  const project = db.insert('projects', {
    userId: req.user?.sub || null, mode: b.mode, fields: f, answers: b.answers || {}, contacts: b.contacts,
    approvedFile: !!b.approvedFile, drawingId: b.drawingId || null, drawingName: b.drawingName || null, status: 'submitted',
  });
  const mail = { projectName: f.projName, address: f.projAddr, drawingName: b.drawingName, projectId: project.id };
  const owner = req.user?.email || f.devEmail;
  if (owner) await sendEmail('projectSubmitted', owner, mail);
  await notifyOffice('officeNewProject', mail);
  res.json({ id: project.id, status: project.status });
}));

// ------------------------------------------------------------------ exports
router.post('/exports', wrap(async (req, res) => {
  // The DWG/PDF generation engine plugs in here (e.g. AutoCAD / ODA worker). Queued for now.
  const job = db.insert('exports', { userId: req.user?.sub || null, drawingId: req.body?.drawingId || null, formats: req.body?.formats || [], status: 'queued' });
  res.json({ id: job.id, status: job.status });
}));

// ------------------------------------------------------------------ billing
const DEMO_INVOICES = [
  { id: 'INV-2609-11', desc: 'חבילת מקצועי · ספטמבר 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2608-08', desc: 'חבילת מקצועי · אוגוסט 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2607-04', desc: 'חבילת בסיס · יולי 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2606-02', desc: 'שדרוג חבילה · יוני 2026', sum: '—', state: 'זוכה' },
];

router.get('/billing/invoices', (req, res) => {
  const mine = req.user ? db.all('orders').filter((o) => o.userId === req.user.sub && o.status === 'paid' && o.total > 0) : [];
  if (!mine.length) return res.json({ invoices: DEMO_INVOICES, demo: true });
  res.json({
    invoices: mine.reverse().map((o) => ({
      id: o.id, desc: `חבילת ${o.planName} · ${new Date(o.paidAt || o.createdAt).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`,
      sum: `${Number(o.total).toLocaleString('he-IL')} ₪`, state: 'שולם',
    })),
  });
});
