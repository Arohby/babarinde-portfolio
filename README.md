# Babarinde Abdur-Roheem – Portfolio

Node.js project, no dependencies to install (Node 18+).

```bash
npm start            # builds dist/ then serves http://localhost:3000
PORT=8080 npm start  # custom port
npm run dev          # same, restarts when you edit src/, scripts/ or site.config.js
npm run build        # only generate dist/ (what Vercel runs)
```

## How it works
`scripts/build.js` turns `src/index.html` into **one real HTML file per URL** in `dist/`
(`/`, `/projects`, `/projects/logo`, `/start/logo`, `/uiux/astra`, `/contact` …). Each file has its own
`<title>`, description, canonical link, Open Graph/Twitter tags and exactly one `<h1>`, so crawlers
that don't run JavaScript see unique pages. It also writes `sitemap.xml` and `robots.txt`.
In the browser, `src/js/app.js` handles navigation without reloads and keeps the same titles/tags.

## Where to edit
- `site.config.js` – every page's title and description, and the site URL (`SITE`). Keep titles 30–60 characters and unique. The build warns if not.
- `src/index.html` – all page markup. Tools in "My Creative Tools" are the `.h-tool` blocks.
- `src/css/base.css` – original styles; `src/css/home.css` – Home page scroll sections + nav.
- `src/js/app.js` – routing, lightbox, forms, theme toggle; `src/js/home-scroll.js` – Home page 3D scroll engine.
- `src/images/` – all images (`pN.webp` = project pieces), `src/og-image.png` – share image.

New case study or page? Add it to `src/index.html`; case studies (`<article class="case" data-c="slug">`) are picked up automatically.
If you change domain, update `SITE` in `site.config.js` and the canonical/og tags in the `<head>` of `src/index.html`.

## Deploy
Vercel: import the folder; `vercel.json` already runs `npm run build` and serves `dist/`.
Any Node host: `npm start`.

Note: `src/index.html` loads a third-party tracking/popup script from `pulse-v2-zeta.vercel.app` at the very top of `<head>` (from the original file). Keep it first.
