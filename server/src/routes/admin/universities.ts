import { Router } from 'express';
import { University } from '../../models.js';
import { universitySchema } from '../../validation.js';

export const universitiesRouter = Router();
const router = universitiesRouter;

router.get('/universities', async (_, res) => res.json(await University.find().sort({ name: 1 }).lean()));
router.get('/universities/:slug', async (req, res) => {
  const university = await University.findOne({ slug: req.params.slug }).lean();
  if (!university) return res.status(404).json({ error: 'University not found.' });
  res.json(university);
});
const parseUniversity = (body: unknown) => {
  const data = universitySchema.parse(body);
  return { ...data, verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null };
};
router.post('/universities', async (req, res) => {
  const university = await University.create(parseUniversity(req.body));
  res.status(201).json(university);
});
router.put('/universities/:slug', async (req, res) => {
  const data = parseUniversity({ ...req.body, slug: req.params.slug });
  const university = await University.findOneAndUpdate({ slug: req.params.slug }, { $set: data }, { returnDocument: 'after', runValidators: true });
  if (!university) return res.status(404).json({ error: 'University not found.' });
  res.json(university);
});

