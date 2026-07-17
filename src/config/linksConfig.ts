/** External and form endpoints — leave empty until verified; never invent URLs */
export const linksConfig = {
  donationUrl: '' as string,
  repositoryUrl: '' as string,
  documentationUrl: '' as string,
  eventTicketUrl: '' as string,
  openSourceStatus: 'planned' as 'planned' | 'preparing-release' | 'published',
  forms: {
    communityIntakeConfigured: Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY),
    generalContactConfigured: Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY),
    partnershipConfigured: Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY),
    mediaSpaceConfigured: Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY),
  },
} as const;
