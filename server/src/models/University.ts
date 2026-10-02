import mongoose, { Schema } from 'mongoose';

const programmeSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  field: { type: String, required: true },
  tuition: Number,
  currency: { type: String, default: 'USD' },
  duration: String,
  intake: String,
  requirements: String,
}, { _id: true });

const universitySchema = new Schema({
  slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
  name: { type: String, required: true },
  type: { type: String, enum: ['Public', 'Private', 'Other'], default: 'Other' },
  city: { type: String, required: true },
  country: { type: String, default: 'Malaysia' },
  website: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  levels: [String],
  fields: [String],
  tuitionFrom: Number,
  tuitionCurrency: { type: String, default: 'USD' },
  tuitionNote: { type: String, default: '' },
  intakes: { type: String, default: '' },
  entryRequirements: { type: String, default: '' },
  programmes: [programmeSchema],
  verifiedAt: Date,
  published: { type: Boolean, default: false },
}, { timestamps: true });
universitySchema.index({ published: 1, city: 1, tuitionFrom: 1 });
universitySchema.index({ name: 'text', description: 'text', fields: 'text' });

export const University = mongoose.model('University', universitySchema);

