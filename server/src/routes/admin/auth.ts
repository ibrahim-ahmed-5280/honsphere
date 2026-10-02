import { Router } from 'express';
import { z } from 'zod';
import { Admin } from '../../models.js';
import { requireAdmin, startSession, endSession, verifyPassword } from '../../auth.js';
import { limitRequests } from '../../security.js';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', limitRequests(10, 15 * 60 * 1000), async (req, res) => {
  const data = z.object({ email: z.email(), password: z.string().min(1) }).parse(req.body);
  const admin = await Admin.findOne({ email: data.email.toLowerCase(), active: true }).select('+passwordHash');
  if (!admin || !await verifyPassword(data.password, admin.passwordHash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  await startSession(res, admin.id);
  res.json({ fullName: admin.fullName || '', email: admin.email, role: admin.role });
});
adminAuthRouter.post('/logout', requireAdmin, async (req, res) => {
  await endSession(req, res);
  res.json({ ok: true });
});
adminAuthRouter.get('/me', requireAdmin, (_, res) => res.json(res.locals.admin));

