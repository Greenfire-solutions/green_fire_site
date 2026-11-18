import seo from '../config/seo.json';
export const ROUTES = {
  home: '/',
  /** The original home page (council, Elders, the Creator Commons model), kept whole. */
  vision: '/vision',
  join: '/join',
  howItWorks: '/how-it-works',
  offerings: '/offerings',
  tech: '/tech',
  store: '/store',
  medixn: '/medixn',
  offeringsPackages: '/offerings/packages',
  offeringsCinematic: '/offerings/cinematic',
  offeringsStudio: '/offerings/studio',
  offeringsWorkshops: '/offerings/workshops',
  openSource: '/open-source',
  getInvolved: '/get-involved',
  contact: '/contact',
  start: '/start',
  invest: '/invest',
  games: '/games',
  rootsignal: '/rootsignal',
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
  vision: ROUTES.vision,
  join: ROUTES.join,
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
  { path: ROUTES.games, label: 'Kids Game Lab' },
  { path: ROUTES.rootsignal, label: 'ROOTSIGNAL' },
  { path: ROUTES.store, label: 'Store' },
  { path: ROUTES.offerings, label: 'Offerings' },
  { path: ROUTES.tech, label: 'Tech' },
  { path: ROUTES.blog, label: 'Blog' },
  { path: ROUTES.openSource, label: 'Open Source' },
  { path: ROUTES.getInvolved, label: 'Get Involved' },
] as const;

/* The header menus. Every page the old flat bar linked is still in one of
   these four groups, so nothing became unreachable when the bar was tidied. */
export type NavItem = { path: string; label: string; note?: string };
export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'AI Services',
    items: [
      { path: ROUTES.start, label: 'AI built for you', note: 'Learn It, Build It, Build It Together' },
      { path: ROUTES.offerings, label: 'All offerings', note: 'Media, studio, events and workshops' },
      { path: ROUTES.games, label: 'Kids Game Lab', note: 'Kids make their own games with AI' },
      { path: ROUTES.contact, label: 'Contact', note: 'Ask a question first' },
    ],
  },
  {
    label: 'Collective',
    items: [
      { path: ROUTES.join, label: 'Join the Collective', note: 'Free to join, Builder membership' },
      { path: ROUTES.getInvolved, label: 'Get Involved', note: 'Bring a need, offer a skill, partner' },
      { path: ROUTES.howItWorks, label: 'How It Works', note: 'How projects move from need to built' },
      { path: ROUTES.openSource, label: 'Open Source', note: 'Data, consent and the Creator Commons' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { path: ROUTES.store, label: 'Store', note: 'Apps, harnesses and bots' },
      { path: ROUTES.tech, label: 'Tech and 3D', note: 'What we build, running live' },
      { path: ROUTES.rootsignal, label: 'ROOTSIGNAL', note: 'Our game' },
      { path: ROUTES.medixn, label: 'MEDIXN', note: 'Laser synthesizer plugin' },
      { path: ROUTES.blog, label: 'Blog', note: 'Notes and guides' },
    ],
  },
  {
    label: 'About',
    items: [
      { path: ROUTES.vision, label: 'The Green Fire Vision', note: 'Council, Elders and the innovation center' },
      { path: ROUTES.pilotRoadmap, label: 'Pilot Roadmap', note: 'Goals for the first year' },
      { path: ROUTES.invest, label: 'Funders and Partners', note: 'Land, campuses and backing' },
    ],
  },
];

export const FOOTER_NAV = [
  { path: ROUTES.join, label: 'Join the Collective' },
  { path: ROUTES.start, label: 'AI Services' },
  { path: ROUTES.vision, label: 'The Green Fire Vision' },
  { path: ROUTES.howItWorks, label: 'About' },
  { path: ROUTES.store, label: 'Store' },
  { path: ROUTES.medixn, label: 'MEDIXN synth plugin' },
  { path: ROUTES.games, label: 'Kids Game Lab' },
  { path: ROUTES.rootsignal, label: 'ROOTSIGNAL game' },
  { path: ROUTES.blog, label: 'Blog' },
  { path: ROUTES.pilotRoadmap, label: 'Pilot Roadmap' },
  { path: ROUTES.invest, label: 'Funders and Partners' },
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
