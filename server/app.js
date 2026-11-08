// The Express app, shared by the local server (server/index.js) and the Vercel function (api/index.js).
import express from 'express';
import { config } from './config.js';
import { attachUser } from './auth.js';
import { router } from './routes.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(attachUser);

app.use('/api', router);
app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : config.env === 'production' ? 'שגיאת שרת' : err.message });
});
