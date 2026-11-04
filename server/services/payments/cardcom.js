// Cardcom (LowProfile hosted page, API v11) — alternative Israeli provider.
// Flow: LowProfile/Create -> redirect to Url -> Cardcom calls WebHookUrl -> confirm with LowProfile/GetLpResult.
import { config } from '../../config.js';

const cfg = () => config.payments.cardcom;

async function call(method, body) {
  const res = await fetch(`${cfg().apiUrl}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ResponseCode !== 0) throw new Error('Cardcom: ' + (json.Description || `HTTP ${res.status}`));
  return json;
}

export async function createPayment({ order, customer, successUrl, cancelUrl, notifyUrl }) {
  const { terminal, apiName } = cfg();
  if (!terminal || !apiName) throw new Error('Cardcom is not configured (CARDCOM_TERMINAL / CARDCOM_API_NAME)');
  const r = await call('LowProfile/Create', {
    TerminalNumber: Number(terminal),
    ApiName: apiName,
    Amount: order.total,
    SuccessRedirectUrl: successUrl,
    FailedRedirectUrl: cancelUrl,
    WebHookUrl: notifyUrl,
    ReturnValue: order.id,
    ProductName: `מערכת תכנון ממ״ד · חבילת ${order.planName}`,
    Language: 'he',
    ISOCoinId: 1,
    Document: customer.email
      ? { Name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.office, Email: customer.email, Products: [{ Description: order.planName, UnitCost: order.total }] }
      : undefined,
  });
  return { redirectUrl: r.Url, providerRef: r.LowProfileId };
}

export async function verifyWebhook(req) {
  const b = req.body || {};
  const r = await call('LowProfile/GetLpResult', {
    TerminalNumber: Number(cfg().terminal),
    ApiName: cfg().apiName,
    LowProfileId: b.LowProfileId,
  });
  const tx = r.TranzactionInfo;
  const paid = r.ResponseCode === 0 && (!tx || tx.ResponseCode === 0);
  return { orderId: r.ReturnValue || b.ReturnValue, paid, providerRef: (tx && tx.TranzactionId) || b.LowProfileId, raw: r };
}
