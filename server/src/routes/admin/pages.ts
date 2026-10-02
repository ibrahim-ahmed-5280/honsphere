import { Router } from 'express';
import { Page } from '../../models.js';
import { pageSchema } from '../../validation.js';
import { cleanPageHtml } from '../../security.js';

export const pagesRouter = Router();
const router = pagesRouter;

router.get('/pages', async (_, res) => res.json(await Page.find().select('-html').sort({ slug: 1 }).lean()));
router.get('/pages/:slug', async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug }).lean();
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  res.json(page);
});
router.post('/pages', async (req, res) => {
  const data = pageSchema.parse(req.body);
  const page = await Page.create({ ...data, html: cleanPageHtml(data.html) });
  res.status(201).json(page);
});
router.put('/pages/:slug', async (req, res) => {
  const data = pageSchema.parse({ ...req.body, slug: req.params.slug });
  const page = await Page.findOneAndUpdate({ slug: req.params.slug }, { $set: { ...data, html: cleanPageHtml(data.html) } }, { returnDocument: 'after', runValidators: true });
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  res.json(page);
});

