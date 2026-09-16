import express from 'express';
import Ajv from 'ajv';
import { readFile, mkdir, open, rename, unlink } from 'node:fs/promises';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.env.NODE_ENV === 'production';
if (production && (!process.env.ADMIN_PASSWORD || !process.env.PUBLIC_ORIGIN || !process.env.DATA_DIR)) {
  throw new Error('Production requires ADMIN_PASSWORD, PUBLIC_ORIGIN (https://your-domain), and a persistent DATA_DIR.');
}
if (production && !process.env.PUBLIC_ORIGIN.startsWith('https://')) throw new Error('Production requires HTTPS.');
const passwordHash = hash(process.env.ADMIN_PASSWORD ?? 'Admin@1234$');
const directory = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const contentFile = path.join(directory, 'portfolio.json');
const schema = JSON.parse(await readFile(path.join(root, 'server/portfolio.schema.json'), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);
function hash(value) { return createHash('sha256').update(value).digest(); }
function version(value) { return hash(JSON.stringify(value)).toString('hex'); }
function contentError(data) {
  if (!validate(data)) return validate.errors.map(e => `${e.instancePath || '/'} ${e.message}`).join('; ');
  let error;
  function walk(value, key = '') {
    if (typeof value === 'string') {
      if (['href', 'resumeUrl', 'profileImage'].includes(key) &&
          (!value || /[\s\\\u0000-\u001f]/.test(value) || value.startsWith('//') ||
           (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^(https?:|mailto:|tel:)/i.test(value)))) error = `${key}: use a safe local path or http(s), mailto, or tel URL.`;
      if (['id', 'targetId'].includes(key) && !/^[a-z][a-z0-9-]*$/.test(value)) error = `${key}: use a lowercase section/project identifier.`;
    } else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => walk(v, k));
  }
  walk(data);
  const sections = ['about', 'experience', 'projects', 'skills', 'education', 'contact'];
  if (data.nav.some(n => !sections.includes(n.id)) || !sections.includes(data.hero.primaryCta.targetId) || !sections.includes(data.hero.secondaryCta.targetId)) error = 'Navigation and hero targets must identify an existing section.';
  if (new Set(data.projects.map(p => p.id)).size !== data.projects.length || new Set(data.nav.map(n => n.id)).size !== data.nav.length) error = 'Project and navigation identifiers must be unique.';
  if (!data.personal.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) error = 'A name and valid email address are required.';
  return error;
}
async function readContent() {
  const data = JSON.parse(await readFile(contentFile, 'utf8'));
  const error = contentError(data);
  if (error) throw new Error(`Invalid portfolio.json: ${error}`);
  return data;
}
await mkdir(directory, { recursive: true });
// Fail clearly on missing/invalid content; never overwrite a mounted volume with seed data.
await readContent();
const sessions = new Map();
const attempts = new Map();
const lifetime = 8 * 60 * 60 * 1000;
const cookieName = production ? '__Host-portfolio-admin' : 'portfolio-admin';
const cookieOptions = { httpOnly: true, secure: production, sameSite: 'strict', path: '/' };
function sessionId(req) { return req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1); }
function session(req) { const s = sessions.get(sessionId(req)); return s && s.expires > Date.now() ? s : undefined; }
setInterval(() => {
  for (const [key, s] of sessions) if (s.expires <= Date.now()) sessions.delete(key);
  for (const [key, a] of attempts) if (a.until <= Date.now()) attempts.delete(key);
}, 60000).unref();
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'same-origin');
  if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    if (req.get('X-Requested-With') !== 'PortfolioAdmin' || !req.is('application/json') ||
        req.get('Sec-Fetch-Site') === 'cross-site' ||
        (process.env.PUBLIC_ORIGIN && req.get('Origin') !== process.env.PUBLIC_ORIGIN)) {
      return res.status(403).json({ error: 'Request origin or content type rejected.' });
    }
  }
  next();
});
app.use(express.json({ limit: '1mb', strict: true }));
function requireAdmin(req, res, next) {
  const current = session(req);
  if (!current) return res.status(401).json({ error: 'Please log in.' });
  if (!['GET', 'HEAD'].includes(req.method) && req.get('X-Admin-CSRF') !== current.csrf) return res.status(403).json({ error: 'Invalid security token. Please log in again.' });
  next();
}
app.get('/api/portfolio', async (req, res) => res.json(await readContent()));
app.post('/api/admin/login', (req, res) => {
  const key = req.socket.remoteAddress;
  const attempt = attempts.get(key);
  if (attempt && attempt.until > Date.now() && attempt.count >= 10) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  if (typeof req.body?.password !== 'string' || req.body.password.length > 256 || !timingSafeEqual(hash(req.body.password), passwordHash)) {
    const active = attempt && attempt.until > Date.now() ? attempt : { count: 0, until: Date.now() + 900000 };
    active.count++; attempts.set(key, active);
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  attempts.delete(key);
  sessions.delete(sessionId(req));
  const id = randomBytes(32).toString('hex');
  const csrf = randomBytes(32).toString('hex');
  sessions.set(id, { csrf, expires: Date.now() + lifetime });
  res.cookie(cookieName, id, { ...cookieOptions, maxAge: lifetime }).json({ csrf });
});
app.get('/api/admin/session', requireAdmin, (req, res) => res.json({ csrf: session(req).csrf }));
app.get('/api/admin/content', requireAdmin, async (req, res) => {
  const data = await readContent();
  res.json({ data, version: version(data), schema });
});
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  sessions.delete(sessionId(req));
  res.clearCookie(cookieName, cookieOptions).json({ ok: true });
});
let writes = Promise.resolve();
app.put('/api/admin/content', requireAdmin, async (req, res, next) => {
  const error = contentError(req.body?.data);
  if (error) return res.status(400).json({ error });
  // Serialize compare-and-write so concurrent editors cannot silently overwrite each other.
  const operation = writes.then(async () => {
    if (req.body.version !== version(await readContent())) return res.status(409).json({ error: 'Content changed in another session. Reload the editor before saving.' });
    const temporary = path.join(directory, `.portfolio-${randomBytes(16).toString('hex')}.tmp`);
    try {
      const file = await open(temporary, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(req.body.data, null, 2) + '\n'); await file.sync(); }
      finally { await file.close(); }
      await rename(temporary, contentFile);
    } finally { await unlink(temporary).catch(() => {}); }
    res.json({ version: version(req.body.data) });
  });
  writes = operation.catch(() => {});
  await operation.catch(next);
});
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.get(['/admin', '/admin/'], (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!session(req)) return res.redirect('/admin/login');
  next();
});
const browser = path.join(root, 'dist/portfolio/browser');
app.use(express.static(browser, { index: false }));
app.get(['/', '/admin', '/admin/', '/admin/login'], (req, res) => res.sendFile(path.join(browser, 'index.html')));
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(error.status === 413 ? 413 : error.type === 'entity.parse.failed' ? 400 : 500).json({ error: error.status === 413 ? 'Content exceeds 1 MB.' : error.type === 'entity.parse.failed' ? 'Malformed JSON.' : 'Unable to read or save content. Check the server data directory.' });
});
const server = app.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => console.log(`Portfolio server listening on ${server.address().port}`));
