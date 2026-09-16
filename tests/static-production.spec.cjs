const { test, expect } = require('@playwright/test');
const { createServer } = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const path = require('node:path');
const seed = require('../data/portfolio.json');

const root = path.resolve('dist/portfolio/browser');
const origin = 'http://127.0.0.1:3108';
let server;
test.use({ baseURL: origin });
test.beforeAll(async () => {
  // A file-only host: no Express, APIs, proxy, or SPA rewrite fallback.
  server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, origin).pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location: `${pathname}/` }).end(); return; }
        file = path.join(file, 'index.html');
      }
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' }[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type }).end(await readFile(file));
    } catch { res.writeHead(404, { 'Content-Type': 'text/html' }).end('<h1>Not found</h1>'); }
  });
  await new Promise(resolve => server.listen(3108, '127.0.0.1', resolve));
});
test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); });

test('production root and refresh load all local assets without any API', async ({ page, request }) => {
  const failures = [], apiCalls = [], errors = [];
  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(response.url()); });
  page.on('requestfailed', request => { if (request.url().startsWith(origin)) failures.push(request.url()); });
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiCalls.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  expect(html).toContain('<base href="/">');
  expect(html).not.toContain('/MustafaDandan/');
  expect(JSON.parse(await readFile(path.join(root, 'data/portfolio.json'), 'utf8'))).toEqual(seed);
  expect((await request.get('/data/portfolio.json')).headers()['content-type']).toContain('application/json');
  expect((await page.goto('/')).status()).toBe(200);
  await expect(page.getByRole('heading', { name: seed.personal.name, exact: true })).toBeVisible();
  await expect(page.getByText(seed.hero.intro, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => new URL('data/portfolio.json', document.baseURI).pathname)).toBe('/data/portfolio.json');
  expect(new URL('data/portfolio.json', 'https://alafshate.github.io/').href).toBe('https://alafshate.github.io/data/portfolio.json');
  await page.reload();
  await expect(page.getByRole('heading', { name: seed.personal.name, exact: true })).toBeVisible();
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  for (const asset of [seed.personal.profileImage, seed.personal.resumeUrl, 'favicon.svg']) {
    expect((await request.get(`/${asset}`)).status()).toBe(200);
  }
  expect(apiCalls).toEqual([]);
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});

for (const failure of ['404', 'network', 'malformed JSON', 'invalid nested content']) {
  test(`bundled content survives ${failure}`, async ({ page }) => {
    const warnings = [], errors = [];
    page.on('console', msg => { if (msg.type() === 'warning') warnings.push(msg.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/data/portfolio.json', route => {
      if (failure === 'network') return route.abort('failed');
      const invalid = structuredClone(seed);
      invalid.projects[0].bullets = [null];
      return route.fulfill({ status: failure === '404' ? 404 : 200, contentType: 'application/json',
        body: failure === 'malformed JSON' ? '{broken' : JSON.stringify(invalid) });
    });
    await page.goto('/');
    await expect(page.getByText(seed.hero.intro, { exact: true })).toBeVisible();
    expect(warnings.some(message => message.includes('using bundled content'))).toBe(true);
    expect(errors).toEqual([]);
    await expect(page).toHaveURL(`${origin}/`);
  });
}

test('static admin routes refresh and explain unavailable persistence without breaking public content', async ({ page, request }) => {
  expect((await request.get('/admin/')).status()).toBe(200);
  expect((await request.get('/admin/login/')).status()).toBe(200);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login\/?$/);
  await page.reload();
  await page.getByLabel('Password', { exact: true }).fill('test');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('GitHub Pages serves the public portfolio');
  await expect(page.getByRole('button', { name: 'Save Changes' })).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByText(seed.hero.intro, { exact: true })).toBeVisible();
});
