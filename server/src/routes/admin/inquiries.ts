import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Inquiry } from '../../models.js';
import { asString } from '../../validation.js';

export const inquiriesRouter = Router();
const router = inquiriesRouter;

router.get('/inquiries', async (req, res) => {
  const status = asString(req.query.status);
  const filter: { status?: 'new' | 'in-progress' | 'closed' } = {};
  if (status === 'new' || status === 'in-progress' || status === 'closed') filter.status = status;
  res.json(await Inquiry.find(filter).sort({ createdAt: -1 }).limit(300).lean());
});
router.patch('/inquiries/:id', async (req, res) => {
  const data = z.object({ status: z.enum(['new', 'in-progress', 'closed']) }).parse(req.body);
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid inquiry ID.' });
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { $set: data }, { returnDocument: 'after' });
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' });
  res.json(inquiry);
});

