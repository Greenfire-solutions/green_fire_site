export const CONTACT_EMAIL = 'civilizationexplorer@gmail.com';

export function mailtoHref(options: {
  subject: string;
  body?: string;
}): string {
  const params = new URLSearchParams();
  params.set('subject', options.subject);
  if (options.body) params.set('body', options.body);
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}
