export const ROUTES = {
  home: '/',
  howItWorks: '/how-it-works',
  offerings: '/offerings',
  offeringsPackages: '/offerings/packages',
  offeringsCinematic: '/offerings/cinematic',
  offeringsStudio: '/offerings/studio',
  offeringsWorkshops: '/offerings/workshops',
  offeringsUtahBolt: '/offerings/utah-bolt',
  openSource: '/open-source',
  getInvolved: '/get-involved',
  contact: '/contact',
  pilotRoadmap: '/pilot-roadmap',
  admin: '/admin',
} as const;

/** Maps legacy CMS internalPage values and old Page IDs to URL paths */
export const LEGACY_PAGE_TO_PATH: Record<string, string> = {
  home: ROUTES.home,
  packages: ROUTES.offeringsPackages,
  cinematic: ROUTES.offeringsCinematic,
  studio: ROUTES.offeringsStudio,
  workshops: ROUTES.offeringsWorkshops,
  'utah-bolt': ROUTES.offeringsUtahBolt,
  program: ROUTES.howItWorks,
  contact: ROUTES.contact,
  offerings: ROUTES.offerings,
  'how-it-works': ROUTES.howItWorks,
  'open-source': ROUTES.openSource,
  'get-involved': ROUTES.getInvolved,
};

export function resolvePath(pageOrPath?: string): string {
  if (!pageOrPath) return ROUTES.contact;
  if (pageOrPath.startsWith('/')) return pageOrPath;
  return LEGACY_PAGE_TO_PATH[pageOrPath] || ROUTES.contact;
}

export const PRIMARY_NAV = [
  { path: ROUTES.home, label: 'Home' },
  { path: ROUTES.howItWorks, label: 'How It Works' },
  { path: ROUTES.offerings, label: 'Offerings' },
  { path: ROUTES.openSource, label: 'Open Source' },
  { path: ROUTES.getInvolved, label: 'Get Involved' },
] as const;

export const FOOTER_NAV = [
  { path: ROUTES.howItWorks, label: 'About' },
  { path: ROUTES.pilotRoadmap, label: 'Pilot Roadmap' },
  { path: ROUTES.getInvolved, label: 'Community Intake' },
  { path: ROUTES.getInvolved, label: 'Partner With Greenfire' },
  { path: ROUTES.openSource, label: 'Data and Consent' },
  { path: ROUTES.contact, label: 'Contact' },
] as const;
