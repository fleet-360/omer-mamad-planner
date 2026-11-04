// Demo provider: approves every payment immediately. Used until real credentials are configured.
export async function createPayment({ order }) {
  return { status: 'paid', providerRef: 'MOCK-' + order.id.slice(0, 8) };
}

export async function verifyWebhook(req) {
  const { orderId } = req.body || {};
  return { orderId, paid: true, providerRef: 'MOCK', raw: req.body };
}
