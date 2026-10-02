import type { Express } from 'express';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from './config.js';
import { Page } from './models.js';

const escapeMeta = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export async function registerSite(app: Express) {
  app.use('/uploads', express.static(config.uploadDir, { fallthrough: false }));
  if (!config.production) return;

  app.use(express.static(config.clientDistDir, { index: false }));
  const template = await readFile(resolve(config.clientDistDir, 'index.html'), 'utf8');
  app.get(/.*/, async (req, res) => {
    if (!req.path.endsWith('.html') && req.path !== '/' && !req.path.startsWith('/admin')) return res.status(404).send('Not found');
    let title = 'HornSphere Consulting';
    let description = '';
    if (req.path.startsWith('/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    } else {
      const slug = req.path === '/' ? 'index' : req.path.slice(1, -5);
      const page = await Page.findOne({ slug, published: true }).select('title description').lean();
      if (!page) return res.status(404).send('Page not found');
      title = page.title;
      description = page.description || '';
    }
    const html = template.replace('<title>HornSphere Consulting</title>', `<title>${escapeMeta(title)}</title><meta name="description" content="${escapeMeta(description)}"><meta property="og:title" content="${escapeMeta(title)}"><meta property="og:description" content="${escapeMeta(description)}">`);
    res.setHeader('Cache-Control', 'no-store');
    res.type('html').send(html);
  });
}
