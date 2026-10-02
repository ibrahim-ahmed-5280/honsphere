import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response, NextFunction } from 'express';
import { Admin, Session } from './models.js';
import { config } from './config.js';

const scrypt = promisify(scryptCallback);
const cookieName = 'hs_admin_session';
const sessionAgeMs = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, encoded] = stored.split(':');
  if (!salt || !encoded || !/^[0-9a-f]{128}$/.test(encoded)) return false;
  const expected = Buffer.from(encoded, 'hex');
  const actual = await scrypt(password, salt, expected.length) as Buffer;
  return timingSafeEqual(actual, expected);
}

const sessionKey = config.sessionSecret || randomBytes(32).toString('hex');
const hashToken = (token: string) => createHmac('sha256', sessionKey).update(token).digest('hex');

function getCookie(req: Request, name: string) {
  const parts = (req.headers.cookie || '').split(';').map(part => part.trim());
  const value = parts.find(part => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
}

export async function startSession(res: Response, adminId: string) {
  const token = randomBytes(32).toString('hex');
  await Session.create({ tokenHash: hashToken(token), userId: adminId, expiresAt: new Date(Date.now() + sessionAgeMs) });
  res.cookie(cookieName, token, { httpOnly: true, secure: config.production, sameSite: 'lax', maxAge: sessionAgeMs, path: '/' });
}

export async function endSession(req: Request, res: Response) {
  const token = getCookie(req, cookieName);
  if (token) await Session.deleteOne({ tokenHash: hashToken(token) });
  res.clearCookie(cookieName, { httpOnly: true, secure: config.production, sameSite: 'lax', path: '/' });
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getCookie(req, cookieName);
    if (!/^[0-9a-f]{64}$/.test(token)) return res.status(401).json({ error: 'Please sign in.' });
    const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
    if (!session) return res.status(401).json({ error: 'Your session has expired.' });
    const admin = await Admin.findOne({ _id: session.userId, active: true }).lean();
    if (!admin) return res.status(401).json({ error: 'Access denied.' });
    res.locals.admin = { id: String(admin._id), fullName: admin.fullName || '', email: admin.email, role: admin.role };
    next();
  } catch (error) {
    next(error);
  }
}
