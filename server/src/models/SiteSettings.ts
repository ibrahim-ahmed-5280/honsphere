import mongoose, { Schema } from 'mongoose';

const navLinkSchema = new Schema({ label: String, href: String }, { _id: false });
const footerGroupSchema = new Schema({
  title: String,
  links: [navLinkSchema],
}, { _id: false });

const settingsSchema = new Schema({
  key: { type: String, default: 'main', unique: true },
  brandName: String,
  logoPath: String,
  darkLogoPath: { type: String, default: '' },
  iconPath: String,
  tagline: String,
  footerIntro: String,
  address: String,
  email: String,
  phoneDisplay: String,
  phoneE164: String,
  whatsappPhone: String,
  whatsappGreeting: String,
  whatsappSubtitle: String,
  headerCtaLabel: String,
  headerCtaHref: String,
  navLinks: [navLinkSchema],
  serviceLinks: [navLinkSchema],
  footerGroups: [footerGroupSchema],
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', settingsSchema);

