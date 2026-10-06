import mongoose from 'mongoose';
import { config } from './config.js';
import { Page } from './models.js';

const placeholder = '<span class="company-director-mark" aria-hidden="true">AO</span>';
const portrait = '<img class="company-director-mark company-director-portrait" src="/assets/manager-portrait-cutout.png" alt="Managing Director portrait" width="1024" height="1536" loading="lazy" decoding="async">';

await mongoose.connect(config.mongoUri);
try {
  const page = await Page.findOne({ slug: 'about' });
  if (!page) throw new Error('About page not found. Seed the site first.');
  if (page.html.includes(placeholder)) {
    const original = page.html;
    const result = await Page.updateOne(
      { _id: page._id, html: original },
      { $set: { html: original.replace(placeholder, portrait) } },
    );
    if (!result.modifiedCount) throw new Error('About page changed during the update. Run again.');
    console.log('Manager portrait added. Existing About page edits preserved.');
  } else {
    console.log('No original manager placeholder found; About page left unchanged.');
  }
} finally {
  await mongoose.disconnect();
}
