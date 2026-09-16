# Mustafa Dandan — Portfolio

Personal portfolio site for **Mustafa Dandan**, Civil Engineer and VDC & BIM Designer.
Built with Angular 19 (standalone components, SCSS, no third-party UI dependencies).

## Running it

```bash
npm install
npm start        # Angular at http://localhost:4200 + API at 127.0.0.1:3000
npm run build    # production build -> dist/portfolio/browser
npm run server   # serve the built Angular site and API at http://localhost:3000
```

The site now requires the Node server and a persistent writable local data directory.
Static-only hosting (including the old GitHub Pages deployment target) cannot support
admin saves. Angular's development server proxies `/api` to the Node server.

## Editing the content

**Editable content lives in [`data/portfolio.json`](data/portfolio.json).**
Open `/admin`, log in, edit the expandable sections, and click **Save Changes**.
The local-development password is `Admin@1234$`; set `ADMIN_PASSWORD` in the server
environment to override it. The password is never included in Angular source or bundles.
All fields in the existing content model are editable, including nested arrays;
use the Add/Remove controls for repeatable entries. Invalid saves show an error and
leave the saved file intact. Logout ends the session; leaving with unsaved edits warns you.

The public route fetches `/api/portfolio` before rendering its existing components.
After saving, refresh the public page to see the change. No Angular build or deployment
is needed. The server validates the entire document, synchronizes a temporary file
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
never replace it with the repository seed on subsequent deployments. The server fails
on missing/invalid JSON rather than silently overwriting existing content.

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

The browser test starts an isolated server on port 3107 with a temporary copy of the
content. It checks protected access, correct/incorrect passwords, cookie flags,
validation/CSRF/conflict rejection, adding/removing/editing through the editor,
public refresh, persistence after a real server restart, and logout. It leaves the
repository's portfolio content unchanged.

Set the real domain in [`src/index.html`](src/index.html): `og:url`, and absolute URLs
for `og:image` / `twitter:image` (social scrapers generally require absolute URLs).
