import { z } from 'zod';

const safeLink = z.string().trim().min(1).max(500).refine(value => /^(\/(?!\/)|#|[a-z0-9-]+\.html(?:[?#]|$)|https:\/\/|mailto:|tel:)/i.test(value), 'Use a site page, anchor, HTTPS, email or phone link.');
const safeImage = z.string().trim().max(500).refine(value => !value || /^\/(?!\/)/.test(value) || /^https:\/\//i.test(value), 'Use a local or HTTPS image URL.');
const linkSchema = z.object({ label: z.string().trim().min(1).max(100), href: safeLink });
export const settingsSchema = z.object({
  brandName: z.string().trim().min(1).max(120),
  logoPath: safeImage.refine(Boolean),
  darkLogoPath: safeImage.optional().default(''),
  iconPath: safeImage.refine(Boolean),
  tagline: z.string().trim().max(250),
  footerIntro: z.string().trim().max(500),
  address: z.string().trim().max(200),
  email: z.email(),
  phoneDisplay: z.string().trim().max(50),
  phoneE164: z.string().trim().max(30),
  whatsappPhone: z.string().regex(/^\d{8,16}$/),
  whatsappGreeting: z.string().trim().max(500),
  whatsappSubtitle: z.string().trim().max(150),
  headerCtaLabel: z.string().trim().max(100),
  headerCtaHref: safeLink,
  navLinks: z.array(linkSchema).max(15),
  serviceLinks: z.array(linkSchema).max(12),
  footerGroups: z.array(z.object({ title: z.string().trim().min(1).max(100), links: z.array(linkSchema).max(20) })).max(8),
});
export const pageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(350),
  bodyClass: z.string().regex(/^[\w\s-]*$/).max(120),
  html: z.string().min(1).max(500000),
  published: z.boolean(),
});
const programmeSchema = z.object({
  name: z.string().trim().min(1).max(160),
  level: z.string().trim().min(1).max(80),
  field: z.string().trim().min(1).max(100),
  tuition: z.number().nonnegative().nullable().optional(),
  currency: z.string().trim().max(10),
  duration: z.string().trim().max(100),
  intake: z.string().trim().max(180),
  requirements: z.string().trim().max(2000),
});
export const universitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  name: z.string().trim().min(2).max(160),
  type: z.enum(['Public', 'Private', 'Other']),
  city: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120),
  website: z.url().refine(url => url.startsWith('https://'), 'Use an HTTPS website URL.'),
  logoUrl: safeImage,
  description: z.string().trim().max(5000),
  levels: z.array(z.string().trim().min(1)).max(20),
  fields: z.array(z.string().trim().min(1)).max(50),
  tuitionFrom: z.number().nonnegative().nullable().optional(),
  tuitionCurrency: z.string().trim().max(10),
  tuitionNote: z.string().trim().max(500),
  intakes: z.string().trim().max(1000),
  entryRequirements: z.string().trim().max(2500),
  programmes: z.array(programmeSchema).max(100),
  verifiedAt: z.iso.datetime().nullable(),
  published: z.boolean(),
}).superRefine((data, context) => {
  if (data.published && !data.verifiedAt) context.addIssue({ code: 'custom', path: ['verifiedAt'], message: 'Add a verification date before publishing.' });
});
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  organisation: z.string().trim().max(180).optional().default(''),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(5000),
  universitySlug: z.string().trim().max(80).optional().default(''),
  website: z.string().optional(), // invisible spam trap
});

export const asString = (value: unknown) => typeof value === 'string' ? value : '';
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

