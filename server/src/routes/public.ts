import { Router } from 'express';
import mongoose from 'mongoose';
import { Page, SiteSettings, University, Inquiry } from '../models.js';
import { inquirySchema, asString, escapeRegex } from '../validation.js';
import { limitRequests } from '../security.js';

export const publicRouter = Router();

publicRouter.get('/health', (_, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 }));
publicRouter.get('/site', async (_, res) => {
  const settings = await SiteSettings.findOne({ key: 'main' }).lean();
  res.json(settings);
});
publicRouter.get('/pages/:slug', async (req, res) => {
  const slug = req.params.slug === 'home' ? 'index' : req.params.slug;
  const page = await Page.findOne({ slug, published: true }).lean();
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  res.json(page);
});
publicRouter.get('/universities', async (req, res) => {
  const query: Record<string, unknown> = { published: true, verifiedAt: { $exists: true, $ne: null } };
  const level = asString(req.query.level);
  const field = asString(req.query.field);
  const city = asString(req.query.city);
  const search = asString(req.query.search).trim();
  const budget = Number(req.query.budget);
  if (level) query.levels = level;
  if (field) query.fields = field;
  if (city) query.city = city;
  if (Number.isFinite(budget) && budget > 0) query.tuitionFrom = { $lte: budget };
  if (search) query.name = { $regex: escapeRegex(search.slice(0, 80)), $options: 'i' };
  const page = Math.max(1, Math.min(1000, Number(req.query.page) || 1));
  const limit = 12;
  const [items, total] = await Promise.all([
    University.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    University.countDocuments(query),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
publicRouter.get('/universities/:slug', async (req, res) => {
  const university = await University.findOne({ slug: req.params.slug, published: true, verifiedAt: { $exists: true, $ne: null } }).lean();
  if (!university) return res.status(404).json({ error: 'Study option not found.' });
  res.json(university);
});
publicRouter.post('/inquiries', limitRequests(5, 10 * 60 * 1000), async (req, res) => {
  const data = inquirySchema.parse(req.body);
  if (data.website) return res.status(202).json({ ok: true });
  const { website: _website, ...inquiryData } = data;
  const inquiry = await Inquiry.create(inquiryData);
  res.status(201).json({ ok: true, id: inquiry.id });
});

