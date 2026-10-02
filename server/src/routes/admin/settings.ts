import { Router } from 'express';
import { SiteSettings } from '../../models.js';
import { settingsSchema } from '../../validation.js';

export const settingsRouter = Router();
const router = settingsRouter;

router.get('/settings', async (_, res) => res.json(await SiteSettings.findOne({ key: 'main' }).lean()));
router.put('/settings', async (req, res) => {
  const data = settingsSchema.parse(req.body);
  const settings = await SiteSettings.findOneAndUpdate({ key: 'main' }, { $set: data }, { returnDocument: 'after', runValidators: true });
  res.json(settings);
});

