import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.ADMIN_UI_BASE || 'http://127.0.0.1:5173';
const outputDir = resolve('tests/.artifacts');
const siteSettings = JSON.parse(await readFile(new URL('../../server/data/default-settings.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const pages = [
  { slug: 'index', title: 'International Student Recruitment | HornSphere Consulting', published: true, updatedAt: '2026-09-29T09:00:00Z' },
  { slug: 'education', title: 'Research Training & Capacity Development | HornSphere', published: true, updatedAt: '2026-09-28T09:00:00Z' },
  { slug: 'draft', title: 'International Student Recruitment Services | HornSphere', published: false, updatedAt: '2026-09-27T09:00:00Z' },
];
const universities = [
  { slug: 'example-university', name: 'Example University', type: 'Private', city: 'Kuala Lumpur', country: 'Malaysia', website: 'https://example.edu', logoUrl: '', description: '', levels: [], fields: [], tuitionFrom: null, tuitionCurrency: 'USD', tuitionNote: '', intakes: '', entryRequirements: '', programmes: [], published: false, verifiedAt: null },
];
const inquiries = [
  { _id: 'sample-1', name: 'Sample Enquirer', email: 'sample@example.test', organisation: '', subject: 'Study guidance', message: 'I would like help choosing a programme.', universitySlug: '', status: 'new', createdAt: '2026-09-30T10:00:00Z' },
];

function mockApi(context, loggedIn = true, writes = { count: 0 }, mediaState = null) {
  let createdUniversity = null;
  let authenticated = loggedIn;
  const adminUsers = [{ _id: 'owner-1', fullName: 'Example Owner', email: 'editor@example.test', role: 'owner', active: true }];
  return context.route('**/api/admin/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') writes.count += 1;
    if (path === '/api/admin/login' && route.request().method() === 'POST') {
      authenticated = true;
      return route.fulfill({ json: { email: 'editor@example.test', role: 'owner' } });
    }
    if (path === '/api/admin/me') return route.fulfill({ status: authenticated ? 200 : 401, json: authenticated ? { email: 'editor@example.test', role: 'owner' } : { error: 'Unauthorized' } });
    if (!authenticated) return route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    if (path === '/api/admin/summary') return route.fulfill({ json: { pages: pages.length, universities: universities.length, inquiries: inquiries.length, newInquiries: 1 } });
    if (path === '/api/admin/pages') return route.fulfill({ json: pages });
    if (path === '/api/admin/pages/index') return route.fulfill({ json: { ...pages[0], description: 'Home page', bodyClass: 'home', html: '<section class="section"><div><h2>Welcome</h2><p>Home content</p></div></section>' } });
    if (mediaState && path === '/api/admin/pages/consulting' && route.request().method() === 'PUT') {
      mediaState.page = route.request().postDataJSON();
      return route.fulfill({ json: mediaState.page });
    }
    if (mediaState && path === '/api/admin/pages/consulting') return route.fulfill({ json: mediaState.page });
    if (mediaState && path === '/api/admin/uploads' && route.request().method() === 'POST') {
      mediaState.uploads += 1;
      return route.fulfill({ status: 201, json: { url: `/uploads/page-image-${mediaState.uploads}.png` } });
    }
    if (path === '/api/admin/universities' && route.request().method() === 'POST') {
      createdUniversity = { ...route.request().postDataJSON(), updatedAt: '2026-10-01T10:00:00Z' };
      return route.fulfill({ status: 201, json: createdUniversity });
    }
    if (path === '/api/admin/universities') return route.fulfill({ json: createdUniversity ? [...universities, createdUniversity] : universities });
    if (createdUniversity && path === `/api/admin/universities/${createdUniversity.slug}` && route.request().method() === 'PUT') {
      createdUniversity = { ...route.request().postDataJSON(), updatedAt: '2026-10-01T11:00:00Z' };
      return route.fulfill({ json: createdUniversity });
    }
    if (createdUniversity && path === `/api/admin/universities/${createdUniversity.slug}`) return route.fulfill({ json: createdUniversity });
    if (path === '/api/admin/universities/example-university') return route.fulfill({ json: universities[0] });
    if (path === '/api/admin/settings') return route.fulfill({ json: siteSettings });
    if (path === '/api/admin/users' && route.request().method() === 'POST') {
      const newAdmin = route.request().postDataJSON();
      writes.lastAdmin = newAdmin;
      adminUsers.push({ _id: `admin-${adminUsers.length + 1}`, fullName: newAdmin.fullName, email: newAdmin.email, role: newAdmin.role, active: true });
      return route.fulfill({ status: 201, json: adminUsers.at(-1) });
    }
    if (path === '/api/admin/users') return route.fulfill({ json: adminUsers });
    if (path === '/api/admin/inquiries') return route.fulfill({ json: inquiries });
    if (path === '/api/admin/inquiries/sample-1' && route.request().method() === 'PATCH') return route.fulfill({ json: { ...inquiries[0], ...route.request().postDataJSON() } });
    return route.fulfill({ status: 404, json: { error: 'Not found' } });
  });
}

async function assertNoHorizontalOverflow(page, label) {
  const report = await page.evaluate(() => ({
    viewport: innerWidth,
    page: document.documentElement.scrollWidth,
    containers: ['.cms-main', '.cms-form-page', '.cms-listing', '.cms-university-table-scroll'].map(selector => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();
      return { selector, left: Math.round(box?.left ?? 0), right: Math.round(box?.right ?? 0), width: Math.round(box?.width ?? 0), scrollWidth: element?.scrollWidth ?? 0 };
    }),
    elements: [...document.querySelectorAll('body *')]
      .filter(element => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.right > innerWidth + 1;
      })
      .slice(0, 12)
      .map(element => ({ tag: element.tagName, className: String(element.className).slice(0, 90), right: Math.round(element.getBoundingClientRect().right) })),
  }));
  assert.ok(report.page <= report.viewport + 1, `${label} has horizontal overflow: ${JSON.stringify(report)}`);
}

try {
  await mkdir(outputDir, { recursive: true });
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const writes = { count: 0 };
    await mockApi(context, true, writes);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/admin`);
    await page.getByRole('heading', { name: 'Manage your website' }).waitFor();
    await page.screenshot({ path: resolve(outputDir, `overview-${width}.png`), fullPage: true });
    const body = await page.locator('body').innerText();
    assert.doesNotMatch(body, /[ÃÂâ�]/, 'Admin contains broken text encoding');
    await assertNoHorizontalOverflow(page, `Overview at ${width}px`);
    if (width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: resolve(outputDir, 'mobile-navigation.png'), fullPage: false });
      await page.locator('[data-slot="sheet-content"]').getByRole('link', { name: 'Pages' }).click();
    } else {
      await page.getByRole('navigation', { name: 'Admin navigation' }).getByRole('link', { name: 'Pages' }).click();
    }
    await page.getByRole('heading', { name: 'Pages' }).waitFor();
    await page.getByRole('textbox', { name: 'Search pages' }).fill('Education');
    assert.equal(await page.locator('.cms-table-row').count(), 1);
    await assertNoHorizontalOverflow(page, `Pages at ${width}px`);
    if (width === 1440) {
      await page.goto(`${base}/admin/pages/index`);
      await page.getByRole('heading', { name: 'Edit index' }).waitFor();
      const saveButtonStyle = await page.getByRole('button', { name: 'Save page' }).evaluate(element => ({ border: getComputedStyle(element).borderTopWidth, weight: getComputedStyle(element).fontWeight, size: getComputedStyle(element).fontSize }));
      assert.deepEqual(saveButtonStyle, { border: '0px', weight: '400', size: '14px' }, 'Filled admin buttons should be borderless with regular readable text');
      const originalSections = await page.locator('.cms-section-list button').count();
      await page.getByRole('button', { name: '+ Add' }).click();
      await page.getByRole('alertdialog').getByText('Add a section?').waitFor();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
      assert.equal(await page.locator('.cms-section-list button').count(), originalSections, 'Cancel should not add a section');
      await page.getByRole('button', { name: '+ Add' }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Add section' }).click();
      assert.equal(await page.locator('.cms-section-list button').count(), originalSections + 1, 'Confirm should add a section');
      await page.getByRole('button', { name: 'Remove', exact: true }).click();
      await page.getByRole('alertdialog').getByText('Remove this section?').waitFor();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
      assert.equal(await page.locator('.cms-section-list button').count(), originalSections + 1, 'Cancel should not remove a section');
      await page.getByRole('button', { name: 'Remove', exact: true }).click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Remove section' }).click();
      assert.equal(await page.locator('.cms-section-list button').count(), originalSections, 'Confirm should remove a section');
      await page.getByRole('button', { name: 'Save page' }).click();
      await page.getByRole('alertdialog').getByText('Save changes to this page?').waitFor();
      await page.screenshot({ path: resolve(outputDir, 'confirm-save.png'), fullPage: true });
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
      assert.equal(writes.count, 0, 'Cancel should not save the page');
      await page.goto(`${base}/admin/inquiries`);
      await page.getByRole('heading', { name: 'Enquiries' }).waitFor();
      await page.locator('#inquiry-status').selectOption('closed');
      await page.getByRole('alertdialog').getByText('Update enquiry status?').waitFor();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
      assert.equal(writes.count, 0, 'Cancel should not update the enquiry');
      await page.locator('#inquiry-status').selectOption('closed');
      await page.getByRole('alertdialog').getByRole('button', { name: 'Update status' }).click();
      await page.getByText('Enquiry status updated.').waitFor();
      assert.equal(writes.count, 1, 'Confirm should update the enquiry once');
    }
    await context.close();
    assert.deepEqual(errors, [], `Browser error at ${width}px`);
  }

  for (const width of [1920, 1100, 900, 768, 700, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await mockApi(context);
    const page = await context.newPage();
    await page.goto(`${base}/admin`);
    await page.getByRole('heading', { name: 'Manage your website' }).waitFor();
    await assertNoHorizontalOverflow(page, `Overview at ${width}px`);
    if (width === 1920 || width === 320) await page.screenshot({ path: resolve(outputDir, `overview-${width}.png`), fullPage: true });
    await page.goto(`${base}/admin/pages`);
    await page.getByRole('heading', { name: 'Pages' }).waitFor();
    await assertNoHorizontalOverflow(page, `Pages at ${width}px`);
    await page.goto(`${base}/admin/pages/index`);
    await page.getByRole('heading', { name: 'Edit index' }).waitFor();
    await assertNoHorizontalOverflow(page, `Page editor at ${width}px`);
    await page.goto(`${base}/admin/universities`);
    await page.getByRole('heading', { name: 'Universities' }).waitFor();
    await page.getByRole('cell', { name: 'Draft' }).waitFor();
    await assertNoHorizontalOverflow(page, `Universities at ${width}px`);
    await page.goto(`${base}/admin/inquiries`);
    await page.getByRole('heading', { name: 'Enquiries' }).waitFor();
    await assertNoHorizontalOverflow(page, `Enquiries at ${width}px`);
    if ([1920, 768, 320].includes(width)) {
      await page.goto(`${base}/admin/universities/new`);
      await page.getByRole('heading', { name: 'Add university' }).waitFor();
      await assertNoHorizontalOverflow(page, `University editor at ${width}px`);
      await page.goto(`${base}/admin/settings`);
      await page.getByRole('heading', { name: 'Site settings' }).waitFor();
      await assertNoHorizontalOverflow(page, `Settings at ${width}px`);
      const headerPosition = await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 600);
        return { scrollY: window.scrollY, top: document.querySelector('.cms-topbar').getBoundingClientRect().top };
      });
      assert.ok(headerPosition.scrollY > 100, `Settings should scroll at ${width}px`);
      assert.equal(Math.round(headerPosition.top), 0, `Dashboard header should remain visible at ${width}px`);
      await page.goto(`${base}/admin/team`);
      await page.getByRole('heading', { name: 'Admin team' }).waitFor();
      await assertNoHorizontalOverflow(page, `Admin team at ${width}px`);
      await page.getByLabel('Full name').waitFor();
      const buttonAlignment = await page.locator('.cms-team-form').evaluate(form => {
        const button = form.querySelector('.cms-team-form-actions button');
        return form.getBoundingClientRect().right - button.getBoundingClientRect().right - parseFloat(getComputedStyle(form).paddingRight);
      });
      assert.ok(Math.abs(buttonAlignment) < 2, `Create admin button should align right at ${width}px`);
    }
    await context.close();
  }

  const createContext = await browser.newContext({ viewport: { width: 390, height: 840 }, deviceScaleFactor: 1 });
  const createWrites = { count: 0 };
  await mockApi(createContext, true, createWrites);
  const createPage = await createContext.newPage();
  await createPage.goto(`${base}/admin/universities`);
  await createPage.getByRole('heading', { name: 'Universities' }).waitFor();
  await createPage.getByText('Drafts stay off the public site.', { exact: false }).waitFor();
  const createTrigger = createPage.getByRole('button', { name: 'Create university' });
  const createTriggerStyle = await createTrigger.evaluate(element => ({ border: getComputedStyle(element).borderTopWidth, height: element.getBoundingClientRect().height, weight: getComputedStyle(element).fontWeight, size: getComputedStyle(element).fontSize }));
  assert.equal(createTriggerStyle.border, '0px', 'Create button should have no border');
  assert.ok(createTriggerStyle.height >= 47.9, `Create button should have comfortable height: ${JSON.stringify(createTriggerStyle)}`);
  assert.equal(createTriggerStyle.weight, '400', 'Create button text should be regular weight');
  assert.equal(createTriggerStyle.size, '14px', 'Create button text should be readable');
  await createTrigger.click();
  const createDialog = createPage.getByRole('dialog', { name: 'Create university' });
  await createDialog.getByRole('heading', { name: 'Identity' }).waitFor();
  await createDialog.getByRole('heading', { name: 'Study information' }).waitFor();
  await createDialog.getByRole('heading', { name: 'Programmes' }).waitFor();
  await createDialog.getByRole('heading', { name: 'Publication status' }).waitFor();
  assert.equal(await createDialog.getByLabel('Choose university logo').count(), 1, 'University logo uses the shared upload control');
  await createDialog.getByText('Choose a file or drag it here').waitFor();
  await createDialog.getByLabel('Choose university logo').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('89504e470d0a1a0a', 'hex') });
  await createPage.getByRole('alertdialog').getByText('Upload this university logo?').waitFor();
  await createPage.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
  assert.equal(createWrites.count, 0, 'Cancel should not upload the logo');
  await assertNoHorizontalOverflow(createPage, 'Create university dialog at 390px');
  const dialogSize = await createDialog.evaluate(element => ({ visible: element.clientWidth, content: element.scrollWidth }));
  assert.ok(dialogSize.content <= dialogSize.visible + 1, `Create dialog overflows: ${JSON.stringify(dialogSize)}`);
  await createPage.screenshot({ path: resolve(outputDir, 'university-create-390.png'), fullPage: false });
  await createDialog.locator('.cms-image-dropzone').screenshot({ path: resolve(outputDir, 'university-upload.png') });
  await createDialog.getByRole('textbox', { name: 'Name' }).fill('New Example Institute');
  await createDialog.getByRole('textbox', { name: 'URL slug' }).fill('new-example-institute');
  await createDialog.getByRole('textbox', { name: 'City' }).fill('Mogadishu');
  await createDialog.getByRole('textbox', { name: 'Official website' }).fill('https://example.edu');
  await createDialog.getByRole('textbox', { name: 'Qualification levels (comma separated)' }).fill('Bachelor, Master');
  await createDialog.getByRole('button', { name: 'Create university', exact: true }).click();
  await createPage.getByRole('alertdialog').getByText('Create this university?').waitFor();
  await createPage.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
  assert.equal(createWrites.count, 0, 'Cancel should not create a university');
  await createDialog.getByRole('button', { name: 'Create university', exact: true }).click();
  await createPage.getByRole('alertdialog').getByRole('button', { name: 'Create university' }).click();
  await createPage.getByRole('status').getByText('New Example Institute was created.', { exact: false }).waitFor();
  assert.equal(createWrites.count, 1, 'Confirm should create one university');
  await createPage.getByRole('link', { name: 'Edit New Example Institute' }).click();
  await createPage.getByRole('heading', { name: 'New Example Institute' }).waitFor();
  assert.equal(await createPage.locator('.cms-card h2').first().innerText(), 'Publication status', 'Publication controls should be first on the edit page');
  await createPage.getByLabel('Last verified on').fill('2026-10-01');
  await createPage.getByLabel('Publish listing').check();
  await createPage.getByRole('button', { name: 'Save university' }).click();
  await createPage.getByRole('alertdialog').getByText('Save university changes?').waitFor();
  await createPage.getByRole('alertdialog').getByRole('button', { name: 'Save changes' }).click();
  await createPage.getByText('University saved.', { exact: false }).waitFor();
  assert.equal(createWrites.count, 2, 'Publishing should save the listing once');
  await createPage.locator('.cms-page-editor-head').getByRole('button', { name: 'Universities' }).click();
  await createPage.getByRole('row', { name: /New Example Institute/ }).getByText('Published').waitFor();
  await assertNoHorizontalOverflow(createPage, 'Published university list at 390px');
  await createContext.close();

  const teamContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const teamWrites = { count: 0 };
  await mockApi(teamContext, true, teamWrites);
  const teamPage = await teamContext.newPage();
  await teamPage.goto(`${base}/admin/team`);
  await teamPage.getByRole('heading', { name: 'Admin team' }).waitFor();
  await teamPage.getByLabel('Full name').fill('New Team Member');
  await teamPage.getByLabel('Email').fill('new-member@example.test');
  await teamPage.getByLabel('Temporary password (12+ characters)').fill('temporary-password-123');
  await teamPage.getByRole('button', { name: 'Create admin' }).click();
  await teamPage.getByRole('alertdialog').getByRole('button', { name: 'Create admin' }).click();
  await teamPage.getByText('New Team Member').waitFor();
  await teamPage.getByRole('alertdialog').waitFor({ state: 'hidden' });
  assert.equal(teamWrites.lastAdmin.fullName, 'New Team Member', 'Full name should be sent to the server');
  assert.equal(teamWrites.count, 1, 'Creating an admin should send one request');
  await assertNoHorizontalOverflow(teamPage, 'Named admin team at 390px');
  await teamPage.screenshot({ path: resolve(outputDir, 'admin-team-mobile.png'), fullPage: true });
  await teamContext.close();

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await mockApi(context, false);
  const page = await context.newPage();
  await page.goto(`${base}/admin/pages`);
  await page.getByRole('heading', { name: 'Sign in' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/admin-site/loginpage-site', 'Signed-out admins should be sent to the dedicated sign-in URL');
  assert.equal(await page.locator('.cms-login .cms-login-logo').count(), 1, 'Logo should be inside the sign-in form');
  assert.equal(await page.locator('.cms-login-icon, .cms-login-back, .cms-login-brand').count(), 0, 'Old sign-in chrome should be removed');
  const introStyle = await page.locator('.cms-login-intro').evaluate(element => getComputedStyle(element).textAlign);
  assert.equal(introStyle, 'center', 'Sign-in introduction should be centered');
  const labelStyle = await page.getByText('Email address', { exact: true }).evaluate(element => getComputedStyle(element).textAlign);
  assert.notEqual(labelStyle, 'center', 'Form labels should retain their normal alignment');
  await assertNoHorizontalOverflow(page, 'Sign in at 1440px');
  await page.screenshot({ path: resolve(outputDir, 'login.png'), fullPage: true });
  await page.getByLabel('Email address').fill('editor@example.test');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#admin-email')).boxShadow.includes('rgba(11, 46, 89, 0.16)'));
  const focusedInput = await page.getByLabel('Email address').evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, border: getComputedStyle(element).borderTopColor, shadow: getComputedStyle(element).boxShadow }));
  assert.equal(focusedInput.outline, 'none', 'Sign-in input should use one focus treatment');
  assert.equal(focusedInput.border, 'rgb(11, 46, 89)', 'Focused sign-in border should use the brand navy');
  assert.match(focusedInput.shadow, /rgba\(11, 46, 89, 0\.16\)/, 'Focus ring should use the same navy hue');
  await page.getByLabel('Email address').screenshot({ path: resolve(outputDir, 'login-input-focus.png') });
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'password');
  await page.getByRole('button', { name: 'Show password' }).click();
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text');
  assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), 'test-password');
  await page.getByRole('button', { name: 'Hide password' }).click();
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: 'Pages' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/admin/pages', 'Successful sign-in should return to the requested admin page');
  await page.goto(`${base}/admin-site/loginpage-site`);
  await page.getByRole('heading', { name: 'Manage your website' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/admin', 'Signed-in admins should skip the login page');
  await context.close();

  const mobileLoginContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mockApi(mobileLoginContext, false);
  const mobileLoginPage = await mobileLoginContext.newPage();
  await mobileLoginPage.goto(`${base}/admin-site/loginpage-site`);
  await mobileLoginPage.getByRole('heading', { name: 'Sign in' }).waitFor();
  await assertNoHorizontalOverflow(mobileLoginPage, 'Sign in at 390px');
  await mobileLoginPage.screenshot({ path: resolve(outputDir, 'login-mobile.png'), fullPage: true });
  await mobileLoginContext.close();

  const mediaState = {
    page: { slug: 'consulting', title: 'Consulting | HornSphere', description: '', bodyClass: 'service-page', published: true, html: '<section class="page-hero service-hero" style="--service-hero-image:url(&quot;assets/somalia-consulting.webp&quot;)"><div class="hs-container"><h1>Consulting</h1><img src="assets/somalia-about.webp" alt="Team"></div></section>' },
    uploads: 0,
  };
  const mediaContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await mockApi(mediaContext, true, { count: 0 }, mediaState);
  await mediaContext.route('**/api/site', route => route.fulfill({ json: siteSettings }));
  await mediaContext.route('**/api/pages/consulting', route => route.fulfill({ json: mediaState.page }));
  await mediaContext.route('**/uploads/page-image-*.png', route => route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/YV8AAAAASUVORK5CYII=', 'base64') }));
  const mediaPage = await mediaContext.newPage();
  await mediaPage.goto(`${base}/admin/pages/consulting`);
  await mediaPage.getByRole('heading', { name: 'Edit consulting' }).waitFor();
  await mediaPage.getByText('Hero background').waitFor();
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/YV8AAAAASUVORK5CYII=', 'base64');
  await mediaPage.getByLabel('Choose hero background').setInputFiles({ name: 'hero.png', mimeType: 'image/png', buffer: tinyPng });
  await mediaPage.getByRole('alertdialog').getByRole('button', { name: 'Upload image' }).click();
  await mediaPage.getByText('Image uploaded. Save the page to publish it.').waitFor();
  await mediaPage.getByLabel('Choose section image 1').setInputFiles({ name: 'section.png', mimeType: 'image/png', buffer: tinyPng });
  await mediaPage.getByRole('alertdialog').getByRole('button', { name: 'Upload image' }).click();
  await mediaPage.locator('.cms-image-fields').nth(1).locator('img').waitFor();
  await mediaPage.getByRole('button', { name: 'Save page' }).click();
  await mediaPage.getByRole('alertdialog').getByRole('button', { name: 'Save changes' }).click();
  await mediaPage.getByText('Saved. The public page now uses this content.').waitFor();
  assert.match(mediaState.page.html, /--page-hero-image:\s*url\([^)]*\/uploads\/page-image-1\.png[^)]*\)/);
  assert.match(mediaState.page.html, /<img src="\/uploads\/page-image-2\.png"/);
  await mediaPage.goto(`${base}/consulting.html`);
  await mediaPage.getByRole('heading', { name: 'Consulting' }).waitFor();
  assert.equal(await mediaPage.locator('#main').evaluate(element => getComputedStyle(element).opacity), '1', 'Public page should remain visible during its entrance transition');
  const publicImage = await mediaPage.locator('.page-hero').evaluate(element => getComputedStyle(element, '::after').backgroundImage);
  assert.match(publicImage, /\/uploads\/page-image-1\.png/, 'Public hero should use the uploaded background');
  assert.match(await mediaPage.locator('.page-hero img').getAttribute('src'), /\/uploads\/page-image-2\.png/);
  assert.equal(await mediaPage.locator('.page-hero img').evaluate(element => element.complete && element.naturalWidth > 0), true, 'Public inline image should load');
  await mediaContext.close();

  const publicContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await publicContext.route('**/api/site', route => route.fulfill({ json: siteSettings }));
  await publicContext.route('**/api/pages/index', route => route.fulfill({ json: { slug: 'index', title: 'HornSphere', description: '', bodyClass: 'home', html: '<section style="min-height:900px"></section>', published: true } }));
  const publicPage = await publicContext.newPage();
  await publicPage.goto(`${base}/index.html`);
  const whatsAppButton = publicPage.getByRole('button', { name: 'Open WhatsApp chat' });
  await whatsAppButton.waitFor();
  assert.equal(await whatsAppButton.locator('svg').getAttribute('viewBox'), '0 0 24 24', 'WhatsApp button should use the corrected logo');
  await whatsAppButton.screenshot({ path: resolve(outputDir, 'whatsapp-button.png') });
  await publicContext.close();
  console.log('UI check passed: responsive admin screens, login, image uploads, public page media, confirmations, and WhatsApp button.');
} finally {
  await browser.close();
}
