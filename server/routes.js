import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import { db, supabase } from './db.js';
import { hashPassword, verifyPassword, issueToken } from './auth.js';
import { PLANS, quote } from './plans.js';
import { paymentProvider } from './services/payments/index.js';
import { sendEmail, notifyOffice } from './services/email/index.js';
import { startUpload, readHead, removeDrawing, saveLocal, inspectDwg, STORED_NAME } from './services/drawings.js';

export const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (res, error, status = 400) => res.status(status).json({ error });
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
const publicUser = (u) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, office: u.office, plan: u.plan });

// ponytail: count+1 can collide under concurrent checkouts (PK rejects the 2nd); switch to a DB sequence if volume grows.
async function nextOrderId() {
  const d = new Date();
  const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const n = (await db.countIdPrefix('orders', `OM-${ymd}-`)) + 1;
  return `OM-${ymd}-${String(n).padStart(4, '0')}`;
}

// ------------------------------------------------------------------ health
router.get('/health', (_req, res) => {
  res.json({ ok: true, db: supabase ? 'supabase' : 'file', payments: config.payments.provider, email: config.email.provider, demo: config.authDemo });
});

// ------------------------------------------------------------------ auth
router.post('/auth/signup', wrap(async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!isEmail(email)) return bad(res, 'כתובת דוא״ל לא תקינה');
  if (!config.authDemo && String(b.password || '').length < 8) return bad(res, 'סיסמה — לפחות 8 תווים');
  let user = await db.find('users', { email });
  if (user && !config.authDemo) return bad(res, 'קיים כבר חשבון עם הדוא״ל הזה', 409);
  const profile = {
    email, firstName: b.firstName || '', lastName: b.lastName || '', office: b.office || '', phone: b.phone || '',
    officeEmail: b.officeEmail || '', officeAddress: b.officeAddress || '',
    buildTypes: b.buildTypes || [], projectType: b.projectType || '', field: b.field || '',
  };
  user = user ? await db.update('users', user.id, profile) : await db.insert('users', { ...profile, password: hashPassword(b.password || crypto.randomUUID()) });
  res.json({ token: issueToken(user), user: publicUser(user) });
}));

router.post('/auth/login', wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  let user = await db.find('users', { email });
  if (!user && config.authDemo && isEmail(email)) user = await db.insert('users', { email, password: hashPassword(password), demo: true });
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

  const order = await db.insert('orders', {
    id: await nextOrderId(), userId: req.user?.sub || null, plan: q.plan.key, planName: q.plan.name, method: method || 'card',
    net: q.net, vat: q.vat, total: q.total ?? 0, currency: 'ILS', status: 'pending', provider: provider.name,
    customer: { firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone, office: customer.office },
  });

  const paid = async () => {
    await db.update('orders', order.id, { status: 'paid', paidAt: new Date().toISOString() });
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
  await db.update('orders', order.id, { providerRef: r.providerRef || null });
  if (r.status === 'paid') { await paid(); return res.json({ orderId: order.id, status: 'paid' }); }
  res.json({ orderId: order.id, status: 'pending', redirectUrl: r.redirectUrl });
}));

// provider -> server notification (source of truth for live payments)
router.post('/payments/webhook/:provider', express.urlencoded({ extended: true }), wrap(async (req, res) => {
  const provider = paymentProvider(req.params.provider);
  const r = await provider.verifyWebhook(req);
  const order = r.orderId && (await db.find('orders', { id: String(r.orderId) }));
  if (!order) return bad(res, 'order not found', 404);
  if (order.status !== 'paid') {
    await db.update('orders', order.id, { status: r.paid ? 'paid' : 'failed', providerRef: r.providerRef, paidAt: r.paid ? new Date().toISOString() : null });
    if (r.paid) {
      const mail = { ...order, orderId: order.id, firstName: order.customer?.firstName };
      await sendEmail('receipt', order.customer?.email, mail);
      await notifyOffice('officeNewPayment', mail);
    }
  }
  res.json({ ok: true });
}));

router.get('/payments/orders/:id', wrap(async (req, res) => {
  const o = await db.find('orders', { id: req.params.id });
  if (!o) return bad(res, 'not found', 404);
  res.json({ id: o.id, status: o.status, planName: o.planName, total: o.total });
}));

// ------------------------------------------------------------------ drawings (DWG only)
// 1) reserve a storage path and get a URL the browser uploads to directly
router.post('/uploads/drawing/start', wrap(async (req, res) => {
  const { name, size } = req.body || {};
  if (path.extname(String(name || '')).toLowerCase() !== '.dwg') return bad(res, 'ניתן להעלות קובץ DWG בלבד');
  if (Number(size) > config.maxUploadMb * 1024 * 1024) return bad(res, `הקובץ גדול מ‑${config.maxUploadMb}MB`);
  res.json(await startUpload());
}));

// local mode only (no Supabase): the "storage" the browser PUTs to
if (!supabase) {
  router.put('/uploads/local/:file', express.raw({ type: () => true, limit: `${config.maxUploadMb}mb` }), (req, res) => {
    if (!STORED_NAME.test(req.params.file)) return bad(res, 'bad name');
    saveLocal(req.params.file, req.body);
    res.json({ ok: true });
  });
}

// 2) after the upload: check it's a real DWG and register it
router.post('/uploads/drawing', wrap(async (req, res) => {
  const { path: stored, name, size } = req.body || {};
  if (!STORED_NAME.test(String(stored || ''))) return bad(res, 'לא נבחר קובץ');
  const info = inspectDwg(await readHead(stored));
  if (!info.ok) {
    await removeDrawing(stored);
    return bad(res, 'הקובץ אינו קובץ DWG תקין');
  }
  const row = await db.insert('uploads', {
    userId: req.user?.sub || null, originalName: String(name || stored),
    storedAs: stored, size: Number(size) || null, dwg: info.code, version: info.version,
  });
  res.json({ id: row.id, name: row.originalName, size: row.size, version: info.version });
}));

// ------------------------------------------------------------------ projects (wizard)
router.post('/projects', wrap(async (req, res) => {
  const b = req.body || {};
  const f = b.fields || {};
  const project = await db.insert('projects', {
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
  const job = await db.insert('exports', { userId: req.user?.sub || null, drawingId: req.body?.drawingId || null, formats: req.body?.formats || [], status: 'queued' });
  res.json({ id: job.id, status: job.status });
}));

// ------------------------------------------------------------------ billing
const DEMO_INVOICES = [
  { id: 'INV-2609-11', desc: 'חבילת מקצועי · ספטמבר 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2608-08', desc: 'חבילת מקצועי · אוגוסט 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2607-04', desc: 'חבילת בסיס · יולי 2026', sum: '—', state: 'שולם' },
  { id: 'INV-2606-02', desc: 'שדרוג חבילה · יוני 2026', sum: '—', state: 'זוכה' },
];

router.get('/billing/invoices', wrap(async (req, res) => {
  const mine = req.user ? (await db.list('orders', { userId: req.user.sub, status: 'paid' })).filter((o) => o.total > 0) : [];
  if (!mine.length) return res.json({ invoices: DEMO_INVOICES, demo: true });
  res.json({
    invoices: mine.reverse().map((o) => ({
      id: o.id, desc: `חבילת ${o.planName} · ${new Date(o.paidAt || o.createdAt).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`,
      sum: `${Number(o.total).toLocaleString('he-IL')} ₪`, state: 'שולם',
    })),
  });
}));
