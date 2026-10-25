# Babarinde Abdur-Roheem – Portfolio

A Node.js project with no dependencies to install (Node 18+).

```bash
npm start            # http://localhost:3000
PORT=8080 npm start  # custom port
```

## Structure
- `server.js` – small static server (gzip, caching, safe paths)
- `public/index.html` – all page markup (Home, Projects, Start forms, Case study, Contact)
- `public/css/base.css` – original site styles (palette, buttons, grids, forms)
- `public/css/home.css` – Home page scroll sections + nav
- `public/js/app.js` – hash routing, lightbox, forms, theme toggle, reveal effects
- `public/js/home-scroll.js` – scroll-driven 3D engine for the Home page
- `public/images/` – all images (`pN.webp` = the project pieces)

Tools shown in "My Creative Tools" are plain markup in `public/index.html` (`.h-tool`).

Note: `public/index.html` loads a third-party tracking/popup script from `pulse-v2-zeta.vercel.app` (it was in the original file). They sit at the very top of `<head>` on every page, so keep them there.

## SEO / URLs
- Real paths (`/projects`, `/projects/logo`, `/start/logo`, `/uiux/astra`, `/contact`) instead of `#/` links; old `#/` links still redirect.
- `public/sitemap.xml` and `public/robots.txt` (points to the sitemap). Update the domain in both, in the `<head>` tags of `public/index.html`, and in `SITE` at the top of the routing code in `public/js/app.js` if you move off `babarinde.vercel.app`.
- Each page updates its title, description, canonical and Open Graph/Twitter tags (`public/og-image.png` is the share image).
- `vercel.json` serves `public/` and sends every path to `index.html` so deep links work on Vercel.
