import mongoose, { Schema } from 'mongoose';

const pageSchema = new Schema({
  slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  html: { type: String, required: true },
  published: { type: Boolean, default: false },
}, { timestamps: true });

export const Page = mongoose.model('Page', pageSchema);

