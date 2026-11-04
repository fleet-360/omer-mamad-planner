// Payment provider switch. Choose with PAYMENT_PROVIDER=mock|grow|cardcom.
//
// Every provider implements:
//   createPayment({ order, customer, successUrl, cancelUrl, notifyUrl })
//       -> { status: 'paid' }                      (mock: charged immediately)
//       -> { redirectUrl, providerRef }            (live: customer pays on the provider's secure page)
//   verifyWebhook(req) -> { orderId, paid, providerRef, raw }
//
// Card numbers never touch this server: the live providers collect them on their own PCI-compliant page.
import { config } from '../../config.js';
import * as mock from './mock.js';
import * as grow from './grow.js';
import * as cardcom from './cardcom.js';

const PROVIDERS = { mock, grow, cardcom };

export function paymentProvider(name = config.payments.provider) {
  const p = PROVIDERS[name];
  if (!p) throw new Error(`Unknown PAYMENT_PROVIDER "${name}"`);
  return { name, ...p };
}
