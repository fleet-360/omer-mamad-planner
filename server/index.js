import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config, ROOT } from './config.js';
import { attachUser } from './auth.js';
import { router } from './routes.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(attachUser);

app.use('/api', router);
app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

// production: serve the built client (npm run build -> dist/)
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : config.env === 'production' ? 'שגיאת שרת' : err.message });
});

app.listen(config.port, () => {
  console.log(`API on http://localhost:${config.port}  ·  payments=${config.payments.provider}  ·  email=${config.email.provider}  ·  demo-auth=${config.authDemo}`);
});
