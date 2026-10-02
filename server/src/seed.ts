import mongoose from 'mongoose';
import { config } from './config.js';
import { seedMissingContent } from './seed-data.js';

await mongoose.connect(config.mongoUri);
await seedMissingContent();
console.log('Site settings, 16 pages and seven draft universities are ready in MongoDB. Existing edits were preserved.');
await mongoose.disconnect();
