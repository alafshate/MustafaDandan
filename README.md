# Mustafa Dandan — Portfolio

Personal portfolio site for **Mustafa Dandan**, Civil Engineer and VDC & BIM Designer.
Built with Angular 19 (standalone components, SCSS, no third-party UI dependencies).

## Running it

```bash
npm install
npm start        # static public portfolio at http://localhost:4200; no backend needed
npm run start:admin # optional Angular + local admin server
npm run build    # production build -> dist/portfolio/browser
npm run server   # serve the built Angular site and API at http://localhost:3000
```

The public site is fully static and supports GitHub Pages. Only authenticated admin
editing requires the optional Node server and a writable local data directory.
`npm run start:admin` proxies admin API requests and the saved JSON asset to that
server; ordinary `npm start` serves the bundled assets directly.

## Editing the content

**Editable content lives in [`data/portfolio.json`](data/portfolio.json).**
Open `/admin`, log in, edit the expandable sections, and click **Save Changes**.
The local-development password is `Admin@1234$`; set `ADMIN_PASSWORD` in the server
environment to override it. The password is never included in Angular source or bundles.
All fields in the existing content model are editable, including nested arrays;
use the Add/Remove controls for repeatable entries. Invalid saves show an error and
leave the saved file intact. Logout ends the session; leaving with unsaved edits warns you.

The build copies the canonical JSON to `dist/portfolio/browser/data/portfolio.json`.
The public route loads `data/portfolio.json` relative to the document base, without
API requests, credentials, localhost URLs, or a backend dependency. If the request
fails, times out, or returns malformed content, it logs the cause and uses a validated
snapshot of the same JSON included in the JavaScript bundle.

On the optional self-hosted server, that same asset URL serves the saved local JSON.
After saving there, refresh the public page to see the change without rebuilding.
If persistence becomes unavailable, the server serves the build's static snapshot;
admin read/write errors remain visible. The server validates the entire document, synchronizes a temporary file
in the same directory, and atomically renames it to `portfolio.json`. A version check
rejects stale editor saves. The API never accepts a destination path.

Angular still uses [`PortfolioData`](src/app/models/portfolio.models.ts).
[`server/portfolio.schema.json`](server/portfolio.schema.json) is generated from those
models and drives both server validation and the editor. If a developer changes the
models, run `npm run schema:generate` and commit the updated schema. Additional server
checks reject unsafe URLs, invalid navigation targets, duplicate IDs, and invalid email.

| To change | Edit |
| --- | --- |
| Name, title, email, phone, location, LinkedIn | `personal`, `socials` |
| Hero intro, focus chips, the three fact tiles | `hero` |
| About paragraphs and the four highlight cards | `about` |
| Section headings, eyebrows and lead sentences | `sections` |
| Jobs | `experience` — append another object |
| Projects | `projects` — append another object |
| Skills | `skills[].items`, or append a whole category |
| Degrees | `education` |
| Awards and certifications | `credentials` |
| Languages | `languages` |
| Contact cards | `contactChannels` |

Notes on specific fields:

- **`projects[].featured: true`** renders that project as a full-width case study with
  the *Design Parameters* panel; `false` renders it as a card in the grid below.
- **`projects[].specs`** drives the design-parameter table. Leave it as `[]` to hide it.
- **`credentials[].issuer`** can be an empty string to omit the issuer line.
- **`personal.resumeUrl`** — set to `null` to remove every résumé CTA (nav, hero,
  contact, footer) at once. It currently points at `public/Mustafa-Dandan-Resume.pdf`.
- **`nav[].id`** must match the `id` on the corresponding `<section>`.
- **Icons** are referenced by name (`IconName`). The full set lives in
  [`src/app/shared/icon/icon.component.ts`](src/app/shared/icon/icon.component.ts);
  add a new `@case` there and a new name to the `IconName` union to extend it.

## Assets

Everything in `public/` is copied to the site root at build time:

- `md_pp.jpg` — profile photo (400 × 400, shown 1:1 so it is never cropped or stretched)
- `Mustafa-Dandan-Resume.pdf` — the résumé served by the download CTAs
- `favicon.svg` — monogram favicon

## Theming

Both themes are defined as CSS custom properties at the top of
[`src/styles.scss`](src/styles.scss) — `:root` / `[data-theme='dark']` for dark,
`[data-theme='light']` for light. Components never hardcode a colour, so changing an
accent is a one-line edit in each block. The visitor's choice is stored in
`localStorage` and applied in `index.html` before first paint to avoid a flash.

## Before going live

### GitHub Pages (public portfolio)

For `https://alafshate.github.io/`, the build and deploy base href is `/`.
No `deployUrl` override is needed: JS, CSS, images and JSON resolve under that root.
Publish the **contents of `dist/portfolio/browser`**, including `data/`, `admin/`, and
`.nojekyll`, to the user site's Pages publishing source. Do not publish the parent
`dist/portfolio` directory or the source checkout as the site artifact.

`npm run build` also creates `admin/index.html` and `admin/login/index.html` from
the built entry page. These make direct navigation/refresh work on a file-only host
without changing the portfolio's section anchors or using hash routing.
The deployment builder uses this prepared output (`noBuild: true`); `npm run deploy`
builds it first, then publishes using the configured Git remote. Ensure that remote's
Pages site is the intended `alafshate.github.io` user site before deploying.

GitHub Pages cannot authenticate admins or write content. `/admin` remains available
but explains that saving requires the optional self-hosted server. To publish edits
on GitHub Pages, update the canonical `data/portfolio.json` (or copy your saved file
there), build, and publish the new static artifact. A save on a separate local server
does not update GitHub Pages automatically.

### Optional self-hosted admin persistence

Use one Node server process on a VPS/server/container behind an HTTPS reverse proxy.
Deploy `server/`, `dist/portfolio/browser/`, `package.json`, and `package-lock.json`,
then install runtime dependencies with `npm ci --omit=dev` and run `npm run server`.
Build Angular beforehand with the development dependencies installed.

Configure these environment variables in your service/container:

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `ADMIN_PASSWORD` | `Admin@1234$` (or your chosen replacement; quote it in shell configuration) |
| `PUBLIC_ORIGIN` | Your exact HTTPS origin, e.g. `https://portfolio.example.com`, without a trailing slash |
| `DATA_DIR` | Absolute persistent directory, e.g. `/var/lib/mustafa-portfolio` |
| `HOST` | Defaults to `127.0.0.1`; use `0.0.0.0` inside a container behind the proxy |
| `PORT` | Defaults to `3000` |

**Mount the whole persistent directory at `DATA_DIR`, not just the JSON file**:
atomic replacement requires creating and renaming a neighboring temporary file.
Copy the supplied `data/portfolio.json` into that directory **once**, before the first
start. Give the service user read/write access to the directory and file. Keep it
outside the deployment checkout and retain the volume across deployments. Back it up;
never replace it with the repository seed on subsequent deployments. The server logs
missing/invalid JSON and rejects editing until it is repaired; public loading falls
back to the bundled snapshot rather than overwriting the saved file.

Ephemeral or read-only hosts cannot retain these edits. Use a persistent local volume;
no cloud database is involved. Run a single writer process (no clustered replicas).
Sessions are held in server memory with an eight-hour expiry, so restarting logs admins
out while content remains on disk. Production cookies are Secure, HttpOnly, SameSite=Strict;
writes require a session and CSRF token. Login attempts are rate-limited by socket IP
(clients behind a reverse proxy share that limit). Proxy the site and API under the
same origin at `/`, preserve `Origin`, and terminate HTTPS at the proxy.

## Verification

```bash
npm run build
npm run check:server
npx playwright install chromium
npm run test:admin
```

The admin browser test starts an isolated server on port 3107 with a temporary copy of the
content. It checks protected access, correct/incorrect passwords, cookie flags,
validation/CSRF/conflict rejection, adding/removing/editing through the editor,
public refresh, persistence after a real server restart, and logout. It leaves the
repository's portfolio content unchanged.

Static production tests serve only files from the built output on port 3108. They
verify root refresh, local assets/data without any API requests, missing/malformed
content fallback, and direct admin navigation without a backend. The admin test also
checks that corrupt saved JSON cannot prevent public loading, including after restart.

Set the real domain in [`src/index.html`](src/index.html): `og:url`, and absolute URLs
for `og:image` / `twitter:image` (social scrapers generally require absolute URLs).
