import { readFileSync } from 'node:fs';
import { Page, SiteSettings, University } from './models.js';

type SeedPage = { slug: string; title: string; description: string; bodyClass: string; html: string; published: boolean };
type SeedSettings = Record<string, unknown> & { serviceLinks: { label: string; href: string }[] };

function loadData<T>(name: string): T {
  return JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')) as T;
}

const pages = loadData<SeedPage[]>('pages.json');
const settings = loadData<SeedSettings>('default-settings.json');
const universities = loadData<(Record<string, unknown> & { slug: string })[]>('universities.json');

export async function seedMissingContent() {
  await SiteSettings.updateOne({ key: 'main' }, { $setOnInsert: settings }, { upsert: true });
  await SiteSettings.updateOne({ key: 'main', serviceLinks: { $exists: false } }, { $set: { serviceLinks: settings.serviceLinks } });
  for (const page of pages) {
    await Page.updateOne({ slug: page.slug }, { $setOnInsert: page }, { upsert: true });
  }
  for (const university of universities) {
    await University.updateOne({ slug: university.slug }, { $setOnInsert: {
      ...university, country: 'Malaysia', logoUrl: '', description: '',
      tuitionFrom: null, tuitionCurrency: 'USD', tuitionNote: '', intakes: '',
      entryRequirements: '', programmes: [], verifiedAt: null, published: false,
    } }, { upsert: true });
  }
}
