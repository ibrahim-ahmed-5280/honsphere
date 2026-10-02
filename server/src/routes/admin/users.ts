import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Admin, Session } from '../../models.js';
import { hashPassword } from '../../auth.js';

export const usersRouter = Router();
const router = usersRouter;

router.get('/users', async (_, res) => {
  if (res.locals.admin.role !== 'owner') return res.status(403).json({ error: 'Owner access required.' });
  res.json(await Admin.find().select('-passwordHash').sort({ email: 1 }).lean());
});
router.post('/users', async (req, res) => {
  if (res.locals.admin.role !== 'owner') return res.status(403).json({ error: 'Owner access required.' });
  const data = z.object({ fullName: z.string().trim().min(2).max(120), email: z.email(), password: z.string().min(12), role: z.enum(['owner', 'editor']) }).parse(req.body);
  const user = await Admin.create({ fullName: data.fullName, email: data.email.toLowerCase(), passwordHash: await hashPassword(data.password), role: data.role });
  res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
});
router.patch('/users/:id', async (req, res) => {
  if (res.locals.admin.role !== 'owner') return res.status(403).json({ error: 'Owner access required.' });
  const data = z.object({ active: z.boolean().optional(), password: z.string().min(12).optional() }).parse(req.body);
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid admin ID.' });
  if (req.params.id === res.locals.admin.id && data.active === false) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  const update: Record<string, unknown> = {};
  if (data.active !== undefined) update.active = data.active;
  if (data.password) update.passwordHash = await hashPassword(data.password);
  const user = await Admin.findByIdAndUpdate(req.params.id, { $set: update }, { returnDocument: 'after' }).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Admin not found.' });
  if (data.password || data.active === false) await Session.deleteMany({ userId: user.id });
  res.json(user);
});

