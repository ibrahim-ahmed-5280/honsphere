import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { config } from '../src/config.js';
import { hashPassword } from '../src/auth.js';
import { Admin, Inquiry, Page, Session, SiteSettings, University } from '../src/models.js';
import { cleanPageHtml } from '../src/security.js';

const base = `http://127.0.0.1:${config.port}`;
const marker = `smoke-${randomBytes(6).toString('hex')}`;
const password = randomBytes(24).toString('hex');
let cookie = '';
let uploadPath = '';
let originalSettings: Record<string, unknown> | null = null;
let testAdminId = '';

async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json() as Record<string, any>;
  return { response, data };
}

try {
  await mongoose.connect(config.mongoUri);
  testAdminId = String((await Admin.create({ fullName: 'Smoke Owner', email: `${marker}@example.test`, passwordHash: await hashPassword(password), role: 'owner' })).id);
  assert.equal((await request('/api/admin/summary')).response.status, 401);
  const login = await request('/api/admin/login', 'POST', { email: `${marker}@example.test`, password });
  assert.equal(login.response.status, 200);
  cookie = login.response.headers.get('set-cookie')?.split(';')[0] || '';
  assert.ok(cookie.startsWith('hs_admin_session='));
  const currentAdmin = (await request('/api/admin/me')).data;
  assert.equal(currentAdmin.email, `${marker}@example.test`);
  assert.equal(currentAdmin.fullName, 'Smoke Owner');
  const newAdmin = await request('/api/admin/users', 'POST', { fullName: 'Smoke Editor', email: `${marker}-editor@example.test`, password, role: 'editor' });
  assert.equal(newAdmin.response.status, 201);
  assert.equal(newAdmin.data.fullName, 'Smoke Editor');
  const adminList = (await request('/api/admin/users')).data as Array<{ fullName: string; email: string }>;
  assert.ok(adminList.some(admin => admin.email === `${marker}-editor@example.test` && admin.fullName === 'Smoke Editor'));

  const originalPage = (await request('/api/pages/index')).data;
  assert.ok(originalPage.html.includes('<svg'));
  const clean = cleanPageHtml('<svg viewBox="0 0 100 100"><path d="M0 0 L10 10"></path></svg><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">bad</a>');
  assert.ok(clean.includes('viewBox="0 0 100 100"'), 'SVG viewBox should survive editing');
  assert.ok(!clean.includes('<script') && !clean.includes('javascript:') && !clean.includes('onclick='));

  const newPage = await request('/api/admin/pages', 'POST', { slug: marker, title: 'Smoke page', description: 'Test', bodyClass: '', html: '<section><h1>Test page</h1><script>alert(1)</script></section>', published: true });
  assert.equal(newPage.response.status, 201);
  const publicPage = await request(`/api/pages/${marker}`);
  assert.equal(publicPage.response.status, 200);
  assert.ok(!publicPage.data.html.includes('script'));

  const settings = (await request('/api/admin/settings')).data;
  originalSettings = settings;
  const changed = await request('/api/admin/settings', 'PUT', { ...settings, tagline: `${settings.tagline} ${marker}` });
  assert.equal(changed.response.status, 200);
  assert.ok((await request('/api/site')).data.tagline.endsWith(marker));

  const university = {
    slug: marker, name: `Example ${marker}`, type: 'Private', city: 'Mogadishu', country: 'Somalia',
    website: 'https://example.org', logoUrl: '', description: 'A test listing.', levels: ["Bachelor's"],
    fields: ['Business'], tuitionFrom: 1000, tuitionCurrency: 'USD', tuitionNote: 'Indicative',
    intakes: 'September', entryRequirements: 'Check with institution.', programmes: [], verifiedAt: null, published: false,
  };
  assert.equal((await request('/api/admin/universities', 'POST', university)).response.status, 201);
  assert.equal((await request(`/api/universities/${marker}`)).response.status, 404);
  assert.equal((await request(`/api/admin/universities/${marker}`, 'PUT', { ...university, published: true })).response.status, 400);
  const verified = await request(`/api/admin/universities/${marker}`, 'PUT', { ...university, verifiedAt: new Date().toISOString(), published: true });
  assert.equal(verified.response.status, 200);
  assert.equal((await request(`/api/universities/${marker}`)).response.status, 200);
  const search = await request(`/api/universities?search=${encodeURIComponent(marker)}&field=Business`);
  assert.equal(search.data.total, 1);

  const inquiry = await request('/api/inquiries', 'POST', { name: 'Smoke Test', email: 'smoke@example.test', organisation: '', subject: 'General enquiry', message: `This is a test enquiry ${marker}.`, universitySlug: marker, website: '' });
  assert.equal(inquiry.response.status, 201);
  assert.ok((await request('/api/admin/inquiries')).data.some((item: { _id: string }) => item._id === inquiry.data.id));
  assert.equal((await request(`/api/admin/inquiries/${inquiry.data.id}`, 'PATCH', { status: 'closed' })).data.status, 'closed');

  const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/YV8AAAAASUVORK5CYII=';
  const upload = await request('/api/admin/uploads', 'POST', { filename: 'smoke.png', dataUrl: `data:image/png;base64,${tinyPng}` });
  assert.equal(upload.response.status, 201);
  uploadPath = resolve(config.uploadDir, upload.data.url.split('/').pop());
  assert.equal((await fetch(`${base}${upload.data.url}`)).status, 200);
  const imageHtml = `<section class="page-hero" style="--page-hero-image:url('${upload.data.url}')"><img src="${upload.data.url}" alt="Test image"></section>`;
  const updatedPage = await request(`/api/admin/pages/${marker}`, 'PUT', { slug: marker, title: 'Smoke page', description: 'Test', bodyClass: '', html: imageHtml, published: true });
  assert.equal(updatedPage.response.status, 200);
  const savedPublicPage = await request(`/api/pages/${marker}`);
  assert.ok(savedPublicPage.data.html.includes(upload.data.url), 'Uploaded image URL should appear in the public page');
  assert.ok(savedPublicPage.data.html.includes('--page-hero-image'), 'Uploaded hero image should survive page saving');

  assert.equal((await request('/api/admin/logout', 'POST')).response.status, 200);
  assert.equal((await request('/api/admin/me')).response.status, 401);
  console.log('Smoke test passed: auth, page editing and sanitizing, settings, verified study listings, enquiry, upload, logout.');
} finally {
  if (mongoose.connection.readyState === 1) {
    if (originalSettings) await SiteSettings.findOneAndUpdate({ key: 'main' }, { $set: originalSettings });
    await Promise.all([
      Page.deleteOne({ slug: marker }), University.deleteOne({ slug: marker }),
      Inquiry.deleteMany({ message: { $regex: marker } }),
      Admin.deleteOne({ email: `${marker}@example.test` }),
      Admin.deleteOne({ email: `${marker}-editor@example.test` }),
    ]);
    if (testAdminId) await Session.deleteMany({ userId: testAdminId });
    await mongoose.disconnect();
  }
  if (uploadPath) await unlink(uploadPath).catch(() => {});
}
