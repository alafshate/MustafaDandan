# Mustafa Dandan — Portfolio

Personal portfolio site for **Mustafa Dandan**, Civil Engineer and VDC & BIM Designer.
Built with Angular 19 (standalone components, SCSS, no third-party UI dependencies).

## Running it

```bash
npm install
npm start        # dev server at http://localhost:4200
npm run build    # production build -> dist/portfolio/browser
```

The production build is a static site: deploy the contents of `dist/portfolio/browser`
to any static host (Netlify, GitHub Pages, Cloudflare Pages, …).

## Editing the content

**All site content lives in one file: [`src/app/data/portfolio.data.ts`](src/app/data/portfolio.data.ts).**
No résumé content is written into component templates, so this is the only file you
need to touch to keep the site current. Its shape is type-checked against
[`src/app/models/portfolio.models.ts`](src/app/models/portfolio.models.ts), so the
build fails if a required field is missing or an icon name is misspelled.

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

Set the real domain in [`src/index.html`](src/index.html): `og:url`, and absolute URLs
for `og:image` / `twitter:image` (social scrapers generally require absolute URLs).
