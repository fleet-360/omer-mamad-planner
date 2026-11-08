// Local / self-hosted server. On Vercel this file is not used (see api/index.js).
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config, ROOT } from './config.js';
import { app } from './app.js';

// npm start after npm run build: serve the built client too (on Vercel the CDN does this)
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  const site = express.Router();
  site.use(express.static(dist));
  site.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  app.use(site);
}

app.listen(config.port, () => {
  console.log(`API on http://localhost:${config.port}  ·  db=${config.supabase.url ? 'supabase' : 'file'}  ·  payments=${config.payments.provider}  ·  email=${config.email.provider}  ·  demo-auth=${config.authDemo}`);
});
