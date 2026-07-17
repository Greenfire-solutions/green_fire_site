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
