import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.ADMIN_UI_BASE || 'http://127.0.0.1:5173';
const settings = JSON.parse(await readFile(new URL('../../server/data/default-settings.json', import.meta.url), 'utf8'));
const pages = JSON.parse(await readFile(new URL('../../server/data/pages.json', import.meta.url), 'utf8'));
const output = resolve('tests/.artifacts');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

function mock(context) {
  return context.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/site') return route.fulfill({ json: settings });
    if (path === '/api/admin/me') return route.fulfill({ json: { email: 'editor@example.test', fullName: 'Example Owner', role: 'owner' } });
    if (path === '/api/admin/summary') return route.fulfill({ json: { pages: pages.length, universities: 7, inquiries: 0, newInquiries: 0 } });
    if (path === '/api/admin/pages') return route.fulfill({ json: pages.map(({ slug, title, published }) => ({ slug, title, published, updatedAt: '2026-10-01T10:00:00Z' })) });
    if (path === '/api/admin/settings') return route.fulfill({ json: settings });
    if (path === '/api/admin/universities') return route.fulfill({ json: [] });
    if (path === '/api/admin/inquiries') return route.fulfill({ json: [] });
    if (path === '/api/admin/users') return route.fulfill({ json: [{ _id: 'owner', fullName: 'Example Owner', email: 'editor@example.test', role: 'owner', active: true }] });
    if (path.startsWith('/api/pages/')) {
      const page = pages.find(item => item.slug === path.slice('/api/pages/'.length));
      return route.fulfill({ status: page ? 200 : 404, json: page || { error: 'Missing' } });
    }
    return route.fulfill({ status: 404, json: { error: 'Missing' } });
  });
}

async function inspectIcon(page, selector) {
  return page.locator(selector).evaluate(element => {
    const style = getComputedStyle(element);
    return { border: style.borderTopWidth, background: style.backgroundColor, width: element.getBoundingClientRect().width, icon: element.querySelector('svg')?.getBoundingClientRect().width ?? element.querySelector('.material-symbols-outlined')?.getBoundingClientRect().width };
  });
}

async function homeSectionColors(page) {
  return page.evaluate(() => ['.hc-services', '.hc-about', '.hc-education', '.hc-contact']
    .map(selector => getComputedStyle(document.querySelector(selector)).backgroundColor));
}

try {
  await mkdir(output, { recursive: true });
  for (const width of [320, 390, 820, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await mock(context);
    const page = await context.newPage();
    await page.goto(`${base}/index.html`);
    await page.locator('.site-header').waitFor();
    assert.equal(new Set(await homeSectionColors(page)).size, 4, `Light home sections should have distinct backgrounds at ${width}px`);
    const order = await page.locator('.header-inner').evaluate(element => {
      const theme = element.querySelector('.site-theme-toggle');
      const cta = element.querySelector('.header-action');
      return Boolean(theme && cta && (theme.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    assert.ok(order, 'Theme icon should come before Start a conversation');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    assert.equal(new Set(await homeSectionColors(page)).size, 4, `Dark home sections should have distinct backgrounds at ${width}px`);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('hornsphere-theme')), 'dark');
    assert.ok((await inspectIcon(page, '.site-theme-toggle')).background === 'rgba(0, 0, 0, 0)', 'Theme icon has no resting background');
    assert.equal(await page.locator('.site-header .brand').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)', 'Logo should have no backing');
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(dimensions.content <= dimensions.viewport + 1, `Public header overflows at ${width}px: ${JSON.stringify(dimensions)}`);
    if (width <= 820) {
      const menu = await inspectIcon(page, '.menu-toggle');
      assert.equal(menu.border, '0px');
      assert.equal(menu.background, 'rgba(0, 0, 0, 0)');
      assert.ok(menu.icon >= 30, `Public menu icon is too small: ${JSON.stringify(menu)}`);
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About' }).waitFor();
      await page.getByRole('button', { name: 'Close menu' }).click();
    }
    if (width === 390 || width === 1440) await page.screenshot({ path: resolve(output, `theme-public-${width}.png`), fullPage: false });
    if (width === 390) {
      await page.goto(`${base}/about.html`);
      await page.locator('.company-principles').waitFor();
      await page.locator('.company-principles').scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(output, 'theme-about-390.png'), fullPage: false });
      await page.goto(`${base}/education.html`);
      await page.locator('.study-options-section').waitFor();
      await page.locator('.study-options-section').scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(output, 'theme-study-390.png'), fullPage: false });
    }
    await page.reload();
    await page.getByRole('button', { name: 'Switch to light mode' }).waitFor();
    await page.goto(`${base}/admin`);
    await page.getByRole('heading', { name: 'Manage your website' }).waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Theme preference carries into admin');
    const background = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor);
    assert.equal(background, 'rgb(7, 29, 53)', 'Admin dark background should use brand navy');
    if (width <= 820) {
      const menu = await inspectIcon(page, '.cms-menu-button');
      assert.equal(menu.border, '0px');
      assert.equal(menu.background, 'rgba(0, 0, 0, 0)');
      assert.ok(menu.icon >= 26, `Admin menu icon is too small: ${JSON.stringify(menu)}`);
    }
    if (width === 390) await page.screenshot({ path: resolve(output, 'theme-admin-390.png'), fullPage: false });
    if (width === 390) {
      await page.goto(`${base}/admin/settings`);
      await page.getByLabel('Choose light mode logo').waitFor();
      await page.getByLabel('Choose dark mode logo').waitFor();
      assert.equal(await page.locator('.cms-brand').first().evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)', 'Admin logo should have no backing');
    }
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await context.close();
  }
  const brandContext = await browser.newContext({ viewport: { width: 390, height: 800 } });
  await mock(brandContext);
  await brandContext.route('**/api/site', route => route.fulfill({ json: { ...settings, darkLogoPath: '/brand/icon logo.png' } }));
  const brandPage = await brandContext.newPage();
  await brandPage.goto(`${base}/index.html`);
  await brandPage.locator('.brand img').waitFor();
  assert.equal(await brandPage.locator('.brand img').getAttribute('src'), settings.logoPath);
  await brandPage.getByRole('button', { name: 'Switch to dark mode' }).click();
  assert.equal(await brandPage.locator('.brand img').getAttribute('src'), '/brand/icon logo.png', 'Dark mode uses its uploaded logo');
  await brandPage.goto(`${base}/admin`);
  await brandPage.getByRole('heading', { name: 'Manage your website' }).waitFor();
  await brandPage.getByRole('button', { name: 'Open navigation' }).click();
  assert.equal(await brandPage.locator('.cms-mobile-sheet .cms-brand img').getAttribute('src'), '/brand/icon logo.png', 'Admin uses the dark logo too');
  await brandContext.close();
  const auditContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await auditContext.addInitScript(() => localStorage.setItem('hornsphere-theme', 'dark'));
  await mock(auditContext);
  const auditPage = await auditContext.newPage();
  const brightSurfaces = [];
  for (const entry of pages) {
    if (!entry.published) continue;
    await auditPage.goto(`${base}/${entry.slug}.html`);
    await auditPage.locator('main.hc-page-enter').waitFor();
    const found = await auditPage.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(element => {
      const style = getComputedStyle(element);
      const rgb = style.backgroundColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
      const box = element.getBoundingClientRect();
      return rgb && Number(rgb[1]) > 225 && Number(rgb[2]) > 225 && Number(rgb[3]) > 225 && box.width > 100 && box.height > 40;
    }).slice(0, 8).map(element => ({ tag: element.tagName, className: String(element.className).slice(0, 100), color: getComputedStyle(element).backgroundColor })));
    if (found.length) brightSurfaces.push({ page: entry.slug, found });
  }
  assert.deepEqual(brightSurfaces, [], `Dark pages have unexpected light surfaces: ${JSON.stringify(brightSurfaces)}`);
  const brightAdminSurfaces = [];
  for (const path of ['/admin', '/admin/pages', '/admin/universities', '/admin/settings', '/admin/team']) {
    await auditPage.goto(`${base}${path}`);
    await auditPage.locator('.cms-content').waitFor();
    const found = await auditPage.locator('.cms-content').evaluate(content => [...content.querySelectorAll('*')].filter(element => {
      const style = getComputedStyle(element);
      const rgb = style.backgroundColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
      const box = element.getBoundingClientRect();
      return rgb && Number(rgb[1]) > 225 && Number(rgb[2]) > 225 && Number(rgb[3]) > 225 && box.width > 100 && box.height > 40;
    }).slice(0, 8).map(element => ({ tag: element.tagName, className: String(element.className).slice(0, 100), color: getComputedStyle(element).backgroundColor })));
    if (found.length) brightAdminSurfaces.push({ path, found });
  }
  assert.deepEqual(brightAdminSurfaces, [], `Dark admin pages have unexpected light surfaces: ${JSON.stringify(brightAdminSurfaces)}`);
  await auditContext.close();
  console.log('Theme UI check passed: order, persistence, dark surfaces, mobile controls, and responsive widths.');
} finally { await browser.close(); }
