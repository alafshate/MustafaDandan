const { test, expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const { mkdtemp, copyFile, readFile, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
let directory, server;
const headers = { 'X-Requested-With': 'PortfolioAdmin' };
async function start() {
  server = spawn(process.execPath, ['server/server.mjs'], {
    env: { ...process.env, NODE_ENV: 'test', ADMIN_PASSWORD: 'Admin@1234$', PUBLIC_ORIGIN: '', DATA_DIR: directory, PORT: '3107' },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    server.stdout.on('data', data => { if (data.toString().includes('listening')) resolve(); });
    // Persistence failures are logged but must not prevent the public server starting.
    server.stderr.on('data', () => {});
    server.on('exit', code => reject(new Error(`Server exited: ${code}`)));
  });
}
async function stop() {
  if (server && server.exitCode === null) await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
}
test.beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'portfolio-admin-'));
  await copyFile('data/portfolio.json', path.join(directory, 'portfolio.json'));
  await start();
});
test.afterAll(async () => {
  await stop();
  if (directory && path.dirname(path.resolve(directory)) === path.resolve(tmpdir()) && path.basename(directory).startsWith('portfolio-admin-')) {
    await rm(directory, { recursive: true, force: true });
  }
});

test('protected editor, validation, browser save, public refresh, restart and logout', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  expect((await request.get('/api/admin/content')).status()).toBe(401);
  expect((await request.put('/api/admin/content', { headers, data: {} })).status()).toBe(401);
  expect((await request.get('/admin', { maxRedirects: 0 })).status()).toBe(302);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('button', { name: 'Save Changes' })).toHaveCount(0);
  await page.getByLabel('Password', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Incorrect password.');
  await page.getByLabel('Password', { exact: true }).fill('Admin@1234$');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  const cookie = (await page.context().cookies()).find(c => c.name === 'portfolio-admin');
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Strict');
  const api = page.context().request;
  const csrf = (await (await api.get('/api/admin/session')).json()).csrf;
  const snapshot = await (await api.get('/api/admin/content')).json();
  expect((await api.put('/api/admin/content', { headers, data: snapshot })).status()).toBe(403);
  expect((await api.put('/api/admin/content', { headers: { ...headers, 'X-Admin-CSRF': csrf }, data: { data: {} } })).status()).toBe(400);
  const unsafe = structuredClone(snapshot);
  unsafe.data.socials[0].href = 'javascript:alert(1)';
  expect((await api.put('/api/admin/content', { headers: { ...headers, 'X-Admin-CSRF': csrf }, data: unsafe })).status()).toBe(400);
  expect((await api.put('/api/admin/content', { headers: { ...headers, 'X-Admin-CSRF': csrf }, data: { ...snapshot, version: 'stale' } })).status()).toBe(409);
  expect((await api.put('/api/admin/content', { headers: { ...headers, 'X-Admin-CSRF': csrf, 'Content-Type': 'application/json' }, data: '{broken' })).status()).toBe(400);
  await page.locator('summary').filter({ hasText: /^Personal$/ }).click();
  await page.getByLabel('Email', { exact: true }).fill('invalid-email');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('alert')).toContainText('valid email');
  await page.getByLabel('Email', { exact: true }).fill(snapshot.data.personal.email);
  await page.locator('summary').filter({ hasText: /^Hero$/ }).click();
  const changed = 'Runtime persistence verification — saved through the admin editor.';
  await page.getByLabel('Intro', { exact: true }).fill(changed);
  await page.locator('summary').filter({ hasText: /^Languages$/ }).click();
  await page.getByRole('button', { name: 'Add Languages', exact: true }).click();
  const lastLanguage = page.getByRole('group', { name: 'Languages 4', exact: true });
  await lastLanguage.getByLabel('Name', { exact: true }).fill('Test language');
  await lastLanguage.getByLabel('Level', { exact: true }).fill('Beginner');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved.');
  expect(JSON.parse(await readFile(path.join(directory, 'portfolio.json'), 'utf8')).hero.intro).toBe(changed);
  const publicPage = await page.context().newPage();
  await publicPage.goto('/');
  await expect(publicPage.getByText(changed, { exact: true })).toBeVisible();
  await publicPage.reload();
  await expect(publicPage.getByText(changed, { exact: true })).toBeVisible();
  await expect(publicPage.getByText('Test language', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove Languages 4', exact: true }).click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved.');
  await stop(); await start();
  await publicPage.reload();
  await expect(publicPage.getByText(changed, { exact: true })).toBeVisible();
  expect((await api.get('/api/admin/session')).status()).toBe(401);
  await page.goto('/admin');
  await page.getByLabel('Password', { exact: true }).fill('Admin@1234$');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await api.get('/api/admin/content')).status()).toBe(401);
  expect(errors).toEqual([]);
  await writeFile(path.join(directory, 'portfolio.json'), '{broken');
  await publicPage.reload();
  const seed = require('../data/portfolio.json');
  await expect(publicPage.getByText(seed.hero.intro, { exact: true })).toBeVisible();
  await stop(); await start();
  await publicPage.reload();
  await expect(publicPage.getByText(seed.hero.intro, { exact: true })).toBeVisible();
});
