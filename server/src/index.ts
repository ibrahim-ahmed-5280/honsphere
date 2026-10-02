import mongoose from 'mongoose';
import { config } from './config.js';
import { seedMissingContent } from './seed-data.js';
import { createApp } from './app.js';

await mongoose.connect(config.mongoUri);
await seedMissingContent();
const app = await createApp();
app.listen(config.port, () => console.log(`HornSphere API listening on http://127.0.0.1:${config.port}`));
