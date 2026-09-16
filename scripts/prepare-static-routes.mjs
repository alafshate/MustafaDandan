import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Real directory indexes let GitHub Pages serve/refresh the admin URLs without
// an SPA rewrite server or hash routing (which would break section anchors).
const browser = path.resolve('dist/portfolio/browser');
for (const route of ['admin', 'admin/login']) {
  const directory = path.join(browser, route);
  await mkdir(directory, { recursive: true });
  await copyFile(path.join(browser, 'index.html'), path.join(directory, 'index.html'));
}
await writeFile(path.join(browser, '.nojekyll'), '');
