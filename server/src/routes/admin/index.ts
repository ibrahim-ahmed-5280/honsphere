import { Router } from 'express';
import { Page, University, Inquiry } from '../../models.js';
import { requireAdmin } from '../../auth.js';
import { pagesRouter } from './pages.js';
import { settingsRouter } from './settings.js';
import { universitiesRouter } from './universities.js';
import { inquiriesRouter } from './inquiries.js';
import { usersRouter } from './users.js';
import { uploadsRouter } from './uploads.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get('/summary', async (_, res) => {
  const [pages, universities, inquiries, newInquiries] = await Promise.all([
    Page.countDocuments(), University.countDocuments(), Inquiry.countDocuments(), Inquiry.countDocuments({ status: 'new' }),
  ]);
  res.json({ pages, universities, inquiries, newInquiries });
});
adminRouter.use(pagesRouter, settingsRouter, universitiesRouter, inquiriesRouter, usersRouter, uploadsRouter);
