import { config } from './config.js';

// Same order as the design's plan picker (index 0..3).
export const PLANS = [
  { key: 'trial', name: 'ניסיון', sub: 'שרטוט בודד, ללא חיוב', drawings: 1, users: 1 },
  { key: 'basic', name: 'בסיס', sub: 'עד 10 שרטוטים · משתמש אחד', drawings: 10, users: 1 },
  { key: 'pro', name: 'מקצועי', sub: 'עד 40 שרטוטים · 3 משתמשים', drawings: 40, users: 3 },
  { key: 'office', name: 'משרד', sub: 'ללא הגבלה', drawings: null, users: null },
];

/** price in ILS (agorot precision) incl. VAT, or null when the plan has no price configured yet */
export function quote(planIndex) {
  const plan = PLANS[planIndex];
  if (!plan) return null;
  if (plan.key === 'trial') return { plan, net: 0, vat: 0, total: 0 };
  const net = config.prices[plan.key];
  if (net === null || Number.isNaN(net)) return { plan, net: null, vat: null, total: null };
  const vat = Math.round(net * config.vatRate * 100) / 100;
  return { plan, net, vat, total: Math.round((net + vat) * 100) / 100 };
}
