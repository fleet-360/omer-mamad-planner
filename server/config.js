import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const bool = (v, d = false) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v));
const num = (v) => (v === undefined || v === '' ? null : Number(v));

export const config = {
  env: process.env.NODE_ENV || 'development',
  // API_PORT wins over PORT: dev tools often set PORT for the web server (Vite) and would make both collide
  port: Number(process.env.API_PORT || process.env.PORT || 8787),
  appUrl: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  apiPublicUrl: (process.env.API_PUBLIC_URL || process.env.APP_URL || 'http://localhost:8787').replace(/\/$/, ''),
  authSecret: process.env.AUTH_SECRET || 'dev-only-change-me',
  // demo mode: login accepts any email/password so the client can walk through every screen
  authDemo: bool(process.env.AUTH_DEMO, true),
  dataDir: path.resolve(ROOT, process.env.DATA_DIR || 'data'),
  uploadDir: path.resolve(ROOT, process.env.UPLOAD_DIR || 'uploads'),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 80),
  // Required on Vercel (its filesystem is read-only/ephemeral). Both are injected automatically when the
  // Neon database and the Blob store are connected to the project (Vercel -> Storage). Empty = local files.
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',

  vatRate: Number(process.env.VAT_RATE || 0.18),
  // monthly prices in ILS before VAT. Not decided yet in the design ("—"), so empty by default.
  prices: {
    basic: num(process.env.PLAN_PRICE_BASIC),
    pro: num(process.env.PLAN_PRICE_PRO),
    office: num(process.env.PLAN_PRICE_OFFICE),
  },

  payments: {
    provider: (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase(), // mock | grow | cardcom
    grow: {
      apiUrl: process.env.GROW_API_URL || 'https://sandbox.meshulam.co.il/api/light/server/1.0',
      pageCode: process.env.GROW_PAGE_CODE || '',
      userId: process.env.GROW_USER_ID || '',
      apiKey: process.env.GROW_API_KEY || '',
    },
    cardcom: {
      apiUrl: process.env.CARDCOM_API_URL || 'https://secure.cardcom.solutions/api/v11',
      terminal: process.env.CARDCOM_TERMINAL || '',
      apiName: process.env.CARDCOM_API_NAME || '',
    },
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER || 'console').toLowerCase(), // console | smtp | resend
    from: process.env.EMAIL_FROM || 'מערכת תכנון ממ״ד <no-reply@example.co.il>',
    notify: process.env.NOTIFY_EMAIL || '', // office inbox that gets a copy of new projects / payments
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT || 587),
      secure: bool(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    resendKey: process.env.RESEND_API_KEY || '',
  },
};
