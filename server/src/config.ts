import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

if (existsSync('.env')) process.loadEnvFile('.env');

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hornsphere',
  production: process.env.NODE_ENV === 'production',
  sessionSecret: process.env.SESSION_SECRET || '',
  publicOrigin: process.env.PUBLIC_ORIGIN || '',
  trustProxy: process.env.TRUST_PROXY || '',
  uploadDir: resolve(process.env.UPLOAD_DIR || fileURLToPath(new URL('../data/uploads/', import.meta.url))),
  clientDistDir: fileURLToPath(new URL('../../client/dist/', import.meta.url)),
};

if (config.production && config.sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters in production.');
}
