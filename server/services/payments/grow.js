// Grow (formerly Meshulam) — the provider shown in the design ("secure.grow.co.il").
// Flow: createPaymentProcess -> redirect customer to data.url -> Grow calls notifyUrl -> approveTransaction.
// Field names follow Grow's "Light" server API. Confirm against the API docs Grow sends with the
// merchant account (pageCode / userId) before going live.
import { config } from '../../config.js';

const cfg = () => config.payments.grow;

async function call(method, fields) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null && v !== '') body.append(k, String(v));
  const res = await fetch(`${cfg().apiUrl}/${method}`, { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status !== 1) {
    throw new Error('Grow: ' + ((json.err && json.err.message) || json.message || `HTTP ${res.status}`));
  }
  return json.data || {};
}

export async function createPayment({ order, customer, successUrl, cancelUrl, notifyUrl }) {
  const { pageCode, userId, apiKey } = cfg();
  if (!pageCode || !userId) throw new Error('Grow is not configured (GROW_PAGE_CODE / GROW_USER_ID)');
  const data = await call('createPaymentProcess', {
    pageCode,
    userId,
    apiKey,
    sum: order.total,
    description: `מערכת תכנון ממ״ד · חבילת ${order.planName}`,
    successUrl,
    cancelUrl,
    notifyUrl,
    cField1: order.id,
    'pageField[fullName]': [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    'pageField[phone]': customer.phone,
    'pageField[email]': customer.email,
  });
  return { redirectUrl: data.url, providerRef: data.processId || data.processToken };
}

export async function verifyWebhook(req) {
  // Grow posts form fields such as data[transactionId], data[processId], data[processToken], data[cField1]
  const b = req.body || {};
  const d = b.data || b;
  const orderId = d.cField1 || d['cField1'];
  const paid = String(b.status ?? d.status ?? '1') === '1';
  if (paid) {
    // Grow requires the merchant to acknowledge the transaction.
    await call('approveTransaction', {
      pageCode: cfg().pageCode,
      userId: cfg().userId,
      transactionId: d.transactionId,
      transactionToken: d.transactionToken,
      transactionTypeId: d.transactionTypeId,
      paymentType: d.paymentType,
      sum: d.sum,
      firstPaymentSum: d.firstPaymentSum,
      periodicalPaymentSum: d.periodicalPaymentSum,
      paymentsNum: d.paymentsNum,
      allPaymentsNum: d.allPaymentsNum,
      paymentDate: d.paymentDate,
      asmachta: d.asmachta,
      description: d.description,
      fullName: d.fullName,
      payerPhone: d.payerPhone,
      payerEmail: d.payerEmail,
      cardSuffix: d.cardSuffix,
      cardType: d.cardType,
      cardTypeCode: d.cardTypeCode,
      cardBrand: d.cardBrand,
      cardBrandCode: d.cardBrandCode,
      cardExp: d.cardExp,
      processId: d.processId,
      processToken: d.processToken,
    }).catch((e) => console.error('[grow] approveTransaction failed:', e.message));
  }
  return { orderId, paid, providerRef: d.transactionId || d.processId, raw: b };
}
