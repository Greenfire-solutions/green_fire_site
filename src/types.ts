export type Page =
  | 'home'
  | 'packages'
  | 'cinematic'
  | 'studio'
  | 'workshops'
  | 'utah-bolt'
  | 'program'
  | 'contact';

export const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'packages', label: 'Packages' },
  { id: 'cinematic', label: 'Cinematic Production' },
  { id: 'studio', label: 'Studio' },
  { id: 'workshops', label: 'Workshops' },
  { id: 'utah-bolt', label: 'Utah Bolt Studio' },
  { id: 'program', label: 'Program' },
  { id: 'contact', label: 'Contact' },
];
