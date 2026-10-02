import mongoose, { Schema } from 'mongoose';

const inquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  organisation: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  universitySlug: String,
  status: { type: String, enum: ['new', 'in-progress', 'closed'], default: 'new' },
}, { timestamps: true });
inquirySchema.index({ createdAt: -1, status: 1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);

