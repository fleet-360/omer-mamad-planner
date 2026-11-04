import crypto from 'node:crypto';
import { config } from './config.js';

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pw, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(String(pw), salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (s) => crypto.createHmac('sha256', config.authSecret).update(s).digest('base64url');

export function issueToken(user, days = 14) {
  const payload = b64(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + days * 864e5 }));
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

/** Express middleware: attaches req.user ({sub,email}) when a valid Bearer token is present. */
export function attachUser(req, _res, next) {
  const h = req.headers.authorization || '';
  req.user = h.startsWith('Bearer ') ? readToken(h.slice(7)) : null;
  next();
}
