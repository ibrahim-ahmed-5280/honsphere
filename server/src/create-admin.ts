import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { config } from './config.js';
import { Admin, Session } from './models.js';
import { hashPassword } from './auth.js';

const prompt = createInterface({ input, output });
const email = (process.argv[2] || process.env.ADMIN_EMAIL || await prompt.question('Admin email: ')).trim().toLowerCase();
const fullName = (process.argv[3] || process.env.ADMIN_FULL_NAME || '').trim();
const password = process.env.ADMIN_INITIAL_PASSWORD || await prompt.question('Password (12+ characters): ');
prompt.close();
if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || fullName.length > 120) {
  throw new Error('Enter a valid email, a password of at least 12 characters, and a name under 120 characters.');
}
await mongoose.connect(config.mongoUri);
const existing = await Admin.findOne({ email });
const ownerExists = await Admin.exists({ role: 'owner' });
if (existing) {
  existing.passwordHash = await hashPassword(password);
  if (fullName) existing.fullName = fullName;
  existing.active = true;
  await existing.save();
  await Session.deleteMany({ userId: existing.id });
  console.log(`Password updated for ${email}.`);
} else {
  await Admin.create({ fullName, email, passwordHash: await hashPassword(password), role: ownerExists ? 'editor' : 'owner' });
  console.log(`Admin ${email} created.`);
}
await mongoose.disconnect();
