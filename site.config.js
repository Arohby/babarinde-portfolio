// Single source of truth for every page's <title>, description and URL.
// Titles should be 30-60 characters and unique; descriptions ~50-160.
export const SITE = 'https://babarinde.vercel.app';
export const NAME = 'Babarinde Abdur-Roheem';

const DISC = {
  graphics: ['Graphics Design', 'Flyers, social posts, carousels and banners'],
  logo: ['Logo Design', 'Logos and brand marks'],
  motion: ['Motion Design', 'Animated posts and short motion graphics'],
  uiux: ['UI/UX Design', 'App and website interfaces, flows and prototypes']
};
const START = { logo: 'Logo', graphics: 'Graphics', uiux: 'UI/UX' };

// `cases` = [{ slug, name }] read from src/index.html by the build script.
export function buildRoutes(cases) {
  const r = [];
  r.push({ path: '/', view: 'home', title: `${NAME} | Graphic and UI/UX Designer`,
    description: 'Portfolio of Babarinde Abdur-Roheem, designer in Ibadan, Nigeria: graphics, logos, motion and UI/UX.', priority: '1.0' });
  r.push({ path: '/projects', view: 'projects', disc: 'graphics', title: `Design Projects | ${NAME}`,
    description: 'Every design by Babarinde Abdur-Roheem, grouped by client: flyers, logos, motion graphics and UI/UX.', priority: '0.9' });
  for (const [k, [n, d]] of Object.entries(DISC)) {
    r.push({ path: `/projects/${k}`, view: 'projects', disc: k, title: `${n} Projects | ${NAME}`,
      description: `${n} work by Babarinde Abdur-Roheem. ${d}, grouped by client. Tap a piece to see it full size.`, priority: '0.8' });
  }
  r.push({ path: '/start', view: 'start', kind: 'logo', title: `Start a Design Project | ${NAME}`,
    description: 'Fill in a short brief to start a logo, graphics or UI/UX design project with Babarinde Abdur-Roheem.', priority: '0.7' });
  for (const [k, n] of Object.entries(START)) {
    r.push({ path: `/start/${k}`, view: 'start', kind: k, title: `Start a ${n} Project | ${NAME}`,
      description: `Tell Babarinde Abdur-Roheem about your brand and the ${n.toLowerCase()} project you need. Your brief goes straight to WhatsApp or email.`, priority: '0.7' });
  }
  for (const c of cases) {
    r.push({ path: `/uiux/${c.slug}`, view: 'case', caseSlug: c.slug, title: `${c.name} UI/UX Case Study | Abdur-Roheem`,
      description: `${c.name}: a UI/UX case study by Babarinde Abdur-Roheem covering the problem, the process and the final screens.`, priority: '0.6' });
  }
  r.push({ path: '/contact', view: 'contact', title: `Contact ${NAME} | Designer`,
    description: 'Contact Babarinde Abdur-Roheem about a graphics, logo, motion or UI/UX design project. Reach out on WhatsApp or email.', priority: '0.8' });
  // private client preview: built, but noindex and not in the sitemap
  r.push({ path: '/client/cybitronix-x7k2q9', view: 'preview', noindex: true, title: `Cybitronix Logo Preview | ${NAME}`,
    description: 'Private logo preview for the client.' });
  return r;
}
