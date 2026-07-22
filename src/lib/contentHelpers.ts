import type { ButtonActionType, OfferingItem, SiteContent } from '../types/content';
import { resolvePath } from './routes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

export function youtubeToEmbedUrl(url?: string): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function isValidUrl(url?: string): boolean {
  if (!url?.trim()) return true;
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

export function validateContent(content: SiteContent): string[] {
  const errors: string[] = [];
  if (!content.settings.siteTitle.trim()) errors.push('Site title is required.');
  if (!content.settings.heroHeadline.trim()) errors.push('Hero headline is required.');
  if (!content.settings.contactEmail.trim()) errors.push('Contact email is required.');
  else if (!EMAIL_RE.test(content.settings.contactEmail)) errors.push('Contact email is invalid.');

  content.offerings.forEach((o) => {
    if (!o.title.trim()) errors.push(`Offering "${o.id}" is missing a title.`);
    if (o.thumbnailUrl && !isValidUrl(o.thumbnailUrl)) errors.push(`"${o.title}" has an invalid thumbnail URL.`);
    if (o.videoUrl && !isValidUrl(o.videoUrl)) errors.push(`"${o.title}" has an invalid video URL.`);
    if (o.youtubeUrl && !youtubeToEmbedUrl(o.youtubeUrl)) errors.push(`"${o.title}" has an invalid YouTube URL.`);
    if (o.buttonActionType === 'email' && o.buttonEmail && !EMAIL_RE.test(o.buttonEmail)) {
      errors.push(`"${o.title}" has an invalid button email.`);
    }
    if (o.buttonActionType === 'external_url' && o.buttonUrl && !URL_RE.test(o.buttonUrl)) {
      errors.push(`"${o.title}" has an invalid button URL.`);
    }
  });

  return errors;
}

export function getVisibleOfferings(content: SiteContent, category: OfferingItem['category']): OfferingItem[] {
  return content.offerings
    .filter((o) => o.category === category && o.visible)
    .sort((a, b) => a.order - b.order);
}

export function getOfferingPrice(price?: string): string {
  return price?.trim() || 'Custom quote';
}

export function buildMailtoLink(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const qs = params.toString();
  return `mailto:${email}${qs ? `?${qs}` : ''}`;
}

export function resolveButtonAction(
  offering: Pick<
    OfferingItem,
    | 'buttonActionType'
    | 'buttonUrl'
    | 'buttonEmail'
    | 'buttonSubject'
    | 'buttonMessage'
    | 'internalPage'
    | 'youtubeUrl'
    | 'title'
  >,
  defaults: { email: string; internalPage: string },
): {
  type: ButtonActionType;
  href?: string;
  path?: string;
  contactSubject?: string;
  contactMessage?: string;
} {
  const type = offering.buttonActionType || 'contact_form';
  switch (type) {
    case 'external_url':
      return { type, href: offering.buttonUrl || defaults.internalPage };
    case 'youtube': {
      const embed = youtubeToEmbedUrl(offering.youtubeUrl || offering.buttonUrl);
      return { type, href: embed || offering.buttonUrl };
    }
    case 'email':
      return {
        type,
        href: buildMailtoLink(
          offering.buttonEmail || defaults.email,
          offering.buttonSubject,
          offering.buttonMessage,
        ),
      };
    case 'internal_page':
      return { type, path: resolvePath(offering.internalPage || defaults.internalPage) };
    case 'scroll_contact':
      return { type, path: resolvePath('contact') };
    case 'contact_form':
    default:
      return {
        type: 'contact_form',
        path: resolvePath('contact'),
        contactSubject: offering.buttonSubject || `Greenfire — ${offering.title || 'Inquiry'}`,
        contactMessage: offering.buttonMessage || '',
      };
  }
}

export function newOfferingId(): string {
  return `offering-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function duplicateOffering(item: OfferingItem): OfferingItem {
  return {
    ...item,
    id: newOfferingId(),
    title: `${item.title} (Copy)`,
    order: item.order + 1,
  };
}

const DEFAULT_MEDIA_SHOWCASES: OfferingItem[] = [
  {
    id: 'media-showcase-social',
    title: 'Social Media',
    subtitle: 'Short-form content that grows your audience',
    description:
      'Reels, shorts, stories, and platform-ready content designed to capture attention and build consistent presence across social channels.',
    price: 'Custom quote',
    category: 'media_showcase',
    includes: ['Short-form video', 'Platform-ready edits', 'Captions & hooks', 'Content series planning'],
    bestFor: ['Creators', 'Brands', 'Local businesses', 'Artists'],
    addOns: [],
    youtubeUrl: '',
    order: 0,
    visible: true,
    featured: true,
    buttonLabel: 'Book Now',
    buttonActionType: 'contact_form',
    buttonSubject: 'Green Fire — Social Media Production',
    buttonMessage: 'Hi Green Fire team,\n\nI am interested in Social Media production.\n\n',
    internalPage: 'contact',
  },
  {
    id: 'media-showcase-brand',
    title: 'Brand Building',
    subtitle: 'Visual identity and story that stick',
    description:
      'Brand films, lookbooks, campaign assets, and narrative content that define how your project or business shows up in the world.',
    price: 'Custom quote',
    category: 'media_showcase',
    includes: ['Brand story films', 'Campaign assets', 'Visual identity support', 'Launch-ready deliverables'],
    bestFor: ['Startups', 'Nonprofits', 'Artists', 'Product launches'],
    addOns: [],
    youtubeUrl: '',
    order: 1,
    visible: true,
    featured: true,
    buttonLabel: 'Book Now',
    buttonActionType: 'contact_form',
    buttonSubject: 'Green Fire — Brand Building Media',
    buttonMessage: 'Hi Green Fire team,\n\nI am interested in Brand Building media.\n\n',
    internalPage: 'contact',
  },
  {
    id: 'media-showcase-cinematic',
    title: 'Cinematic Production',
    subtitle: 'Premium motion for films, music, and campaigns',
    description:
      'High-end cinematic production for music videos, documentaries, commercials, and hero films — including Utah Bolt precision camera movement when needed.',
    price: 'Custom quote',
    category: 'media_showcase',
    includes: ['Cinematic direction', 'Premium camera work', 'Color & sound polish', 'Delivery for film & web'],
    bestFor: ['Music artists', 'Agencies', 'Documentaries', 'Premium brands'],
    addOns: [],
    youtubeUrl: '',
    order: 2,
    visible: true,
    featured: true,
    premium: true,
    buttonLabel: 'Book Now',
    buttonActionType: 'contact_form',
    buttonSubject: 'Green Fire — Cinematic Production',
    buttonMessage: 'Hi Green Fire team,\n\nI am interested in Cinematic Production.\n\n',
    internalPage: 'contact',
  },
];

/** Ensure the three Media Showcase slots exist (for older published content). */
export function ensureMediaShowcases(content: SiteContent): SiteContent {
  const existing = content.offerings.filter((o) => o.category === 'media_showcase');
  if (existing.length >= 3) return content;
  const have = new Set(existing.map((o) => o.id));
  const missing = DEFAULT_MEDIA_SHOWCASES.filter((d) => !have.has(d.id));
  return {
    ...content,
    offerings: [...content.offerings, ...missing],
  };
}
