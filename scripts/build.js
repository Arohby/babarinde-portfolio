// Generates dist/: one real HTML file per URL (unique title, description, canonical,
// Open Graph tags, one <h1>), plus sitemap.xml and robots.txt. No dependencies.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, buildRoutes } from '../site.config.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setMeta = (html, re, val) => html.replace(re, (_, a, b) => a + esc(val) + b);

export function build() {
  const tpl = readFileSync(join(SRC, 'index.html'), 'utf8');

  // case studies: slug + heading text
  const cases = [];
  const rc = /<article class="case" data-c="([^"]+)"[^>]*>[\s\S]*?<h2 class="h1">([^<]*)<\/h2>/g;
  for (let m; (m = rc.exec(tpl));) cases.push({ slug: m[1], name: m[2].trim() });
  const routes = buildRoutes(cases);

  rmSync(DIST, { recursive: true, force: true });
  cpSync(SRC, DIST, { recursive: true, filter: (s) => s !== join(SRC, 'index.html') });

  const clientRoutes = {};
  for (const r of routes) clientRoutes[r.path] = { title: r.title, description: r.description, noindex: !!r.noindex };

  const problems = [];
  const seenTitles = new Set();
  for (const r of routes) {
    if (r.title.length < 30 || r.title.length > 60) problems.push(`title length ${r.title.length}: ${r.path}`);
    if (seenTitles.has(r.title)) problems.push(`duplicate title: ${r.path}`);
    seenTitles.add(r.title);
    writePage(r, tpl, clientRoutes);
  }

  const pub = routes.filter((r) => !r.noindex);
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(join(DIST, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pub.map((r) => `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>\n`).join('') +
    '</urlset>\n');
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`Built ${routes.length} pages into dist/` + (problems.length ? '\nWARNINGS:\n  ' + problems.join('\n  ') : ''));
  return routes;
}

function writePage(r, tpl, clientRoutes) {
  let h = tpl;
  const url = SITE + (r.path === '/' ? '/' : r.path);
  // ---- head
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`);
  h = setMeta(h, /(<meta name="description" content=")[^"]*(")/, r.description);
  h = setMeta(h, /(<link rel="canonical" href=")[^"]*(")/, url);
  h = setMeta(h, /(<meta property="og:url" content=")[^"]*(")/, url);
  h = setMeta(h, /(<meta property="og:title" content=")[^"]*(")/, r.title);
  h = setMeta(h, /(<meta property="og:description" content=")[^"]*(")/, r.description);
  h = setMeta(h, /(<meta name="twitter:title" content=")[^"]*(")/, r.title);
  h = setMeta(h, /(<meta name="twitter:description" content=")[^"]*(")/, r.description);
  h = setMeta(h, /(<meta name="robots" content=")[^"]*(")/, r.noindex ? 'noindex,nofollow' : 'index,follow');
  h = h.replace('</head>', `<script>window.ROUTES=${JSON.stringify(clientRoutes).replace(/</g, '\\u003c')}</script>\n</head>`);

  // ---- which view / panel is visible without JavaScript
  h = h.replace(/<div data-view="(\w+)"([^>]*)>/g, (m, v, a) => `<div data-view="${v}"${a.replace(/\s*hidden/, '')}${v === r.view ? '' : ' hidden'}>`);
  if (r.view === 'projects')
    h = h.replace(/<div class="disc" data-d="(\w+)"([^>]*)>/g, (m, d, a) => `<div class="disc" data-d="${d}"${a.replace(/\s*hidden/, '')}${d === r.disc ? '' : ' hidden'}>`);
  if (r.view === 'start')
    h = h.replace(/<form class="pf" data-kind="(\w+)"([^>]*)>/g, (m, k, a) => `<form class="pf" data-kind="${k}"${a.replace(/\s*hidden/, '')}${k === r.kind ? '' : ' hidden'}>`);
  if (r.view === 'case')
    h = h.replace(/<article class="case" data-c="([^"]+)"([^>]*)>/g, (m, c, a) => `<article class="case" data-c="${c}"${a.replace(/\s*hidden/, '')}${c === r.caseSlug ? '' : ' hidden'}>`);

  // ---- exactly one <h1> per page
  if (r.view !== 'home') h = h.replace(/<h1 class="h-bigname">([\s\S]*?)<\/h1>/, '<p class="h-bigname">$1</p>');
  const promote = (from) => {
    const i = h.indexOf(from); if (i < 0) return;
    const a = h.indexOf('<h2', i), b = h.indexOf('</h2>', a);
    h = h.slice(0, a) + '<h1' + h.slice(a + 3, b) + '</h1>' + h.slice(b + 5);
  };
  if (r.view === 'projects') promote('<div data-view="projects"');
  if (r.view === 'preview') promote('<div data-view="preview"');
  if (r.view === 'case') promote(`<article class="case" data-c="${r.caseSlug}"`);
  if (r.view === 'start') {
    promote('<div data-view="start"');
    const t = { logo: 'Start a logo project', graphics: 'Start a graphics project', uiux: 'Start a UI/UX project' }[r.kind];
    h = h.replace(/(<h1 id="sh"[^>]*>)[^<]*/, `$1${t}`);
  }
  if (r.view === 'contact') {
    h = h.replace('<section class="contact" id="contact"><h2>Need a design?</h2>', '<section class="contact" id="contact"><h1>Need a design?</h1>');
    h = h.replace('<html lang="en">', '<html lang="en" class="is-contact">');
  }

  const out = r.path === '/' ? join(DIST, 'index.html') : join(DIST, r.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, h);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
