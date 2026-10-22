import seo from '../config/seo.json';
export const ROUTES = {
  home: '/',
  howItWorks: '/how-it-works',
  offerings: '/offerings',
  tech: '/tech',
  offeringsPackages: '/offerings/packages',
  offeringsCinematic: '/offerings/cinematic',
  offeringsStudio: '/offerings/studio',
  offeringsWorkshops: '/offerings/workshops',
  openSource: '/open-source',
  getInvolved: '/get-involved',
  contact: '/contact',
  start: '/start',
  pilotRoadmap: '/pilot-roadmap',
  /** Static HTML written at build time by scripts/seo/build.mjs, not a React route. */
  blog: '/blog/',
  admin: '/admin',
} as const;

/** Maps legacy CMS internalPage values and old Page IDs to URL paths */
export const LEGACY_PAGE_TO_PATH: Record<string, string> = {
  home: ROUTES.home,
  packages: ROUTES.offeringsPackages,
  cinematic: ROUTES.offeringsCinematic,
  studio: ROUTES.offeringsStudio,
  workshops: ROUTES.offeringsWorkshops,
  'utah-bolt': ROUTES.offeringsCinematic,
  program: ROUTES.howItWorks,
  contact: ROUTES.contact,
  offerings: ROUTES.offerings,
  'how-it-works': ROUTES.howItWorks,
  'open-source': ROUTES.openSource,
  'get-involved': ROUTES.getInvolved,
  tech: ROUTES.tech,
};

export function resolvePath(pageOrPath?: string): string {
  if (!pageOrPath) return ROUTES.contact;
  if (pageOrPath.startsWith('/')) return pageOrPath;
  return LEGACY_PAGE_TO_PATH[pageOrPath] || ROUTES.contact;
}

export const PRIMARY_NAV = [
  { path: ROUTES.home, label: 'Home' },
  { path: ROUTES.howItWorks, label: 'How It Works' },
  { path: ROUTES.start, label: 'AI Help' },
  { path: ROUTES.offerings, label: 'Offerings' },
  { path: ROUTES.tech, label: 'Tech' },
  { path: ROUTES.blog, label: 'Blog' },
  { path: ROUTES.openSource, label: 'Open Source' },
  { path: ROUTES.getInvolved, label: 'Get Involved' },
] as const;

export const FOOTER_NAV = [
  { path: ROUTES.howItWorks, label: 'About' },
  { path: ROUTES.blog, label: 'Blog' },
  { path: ROUTES.pilotRoadmap, label: 'Pilot Roadmap' },
  { path: ROUTES.tech, label: 'Tech and 3D' },
  { path: ROUTES.getInvolved, label: 'Community Intake' },
  { path: ROUTES.getInvolved, label: 'Partner With Greenfire' },
  { path: ROUTES.openSource, label: 'Data and Consent' },
  { path: ROUTES.contact, label: 'Contact' },
] as const;

/** The blog is plain HTML outside the app, so it needs a full page load, not a router push. */
/* The evergreen topic pages (/solarpunk and the rest) are static files too,
   listed once in seo.json beside their text in content/pages. */
export const TOPIC_NAV: { path: string; label: string }[] = seo.topics;

export const isStaticPath = (path: string) =>
  path === ROUTES.blog || path.startsWith('/blog') || TOPIC_NAV.some((t) => t.path === path);
