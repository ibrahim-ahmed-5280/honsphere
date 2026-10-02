import express from 'express';
import { config } from './config.js';
import { checkOrigin } from './security.js';
import { publicRouter } from './routes/public.js';
import { adminAuthRouter } from './routes/admin/auth.js';
import { adminRouter } from './routes/admin/index.js';
import { registerSite } from './site.js';
import { handleError } from './errors.js';

export async function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use((_, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '4mb' }));
  app.use(checkOrigin);
  app.use('/api', publicRouter);
  app.use('/api/admin', adminAuthRouter);
  app.use('/api/admin', adminRouter);
  await registerSite(app);
  app.use(handleError);
  return app;
}
