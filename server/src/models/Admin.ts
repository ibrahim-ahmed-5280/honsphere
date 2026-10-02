import mongoose, { Schema } from 'mongoose';

const adminSchema = new Schema({
  fullName: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['owner', 'editor'], default: 'editor' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Admin = mongoose.model('Admin', adminSchema);

