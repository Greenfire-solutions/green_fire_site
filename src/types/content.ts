export type ButtonActionType =
  | 'internal_page'
  | 'external_url'
  | 'youtube'
  | 'email'
  | 'contact_form'
  | 'scroll_contact';

export type OfferingCategory =
  | 'what_we_offer'
  | 'media_showcase'
  | 'service_package'
  | 'cinematic'
  | 'cinematic_addon'
  | 'combined'
  | 'studio_session'
  | 'workshop_topic'
  | 'workshop_audience'
  | 'utah_bolt_ideal'
  | 'hero_cta'
  | 'contact_cta';

export interface ButtonConfig {
  label: string;
  actionType: ButtonActionType;
  internalPage?: string;
  buttonUrl?: string;
  buttonEmail?: string;
  buttonSubject?: string;
  buttonMessage?: string;
}

export interface OfferingItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: string;
  category: OfferingCategory;
  includes: string[];
  bestFor: string[];
  addOns: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  buttonLabel: string;
  buttonActionType: ButtonActionType;
  buttonUrl?: string;
  buttonEmail?: string;
  buttonSubject?: string;
  buttonMessage?: string;
  internalPage?: string;
  icon?: string;
  featured: boolean;
  order: number;
  visible: boolean;
  premium?: boolean;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface ProgramAccordionSection {
  id: string;
  title: string;
  content: string;
  bullets?: string[];
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  heroLabel: string;
  heroHeadline: string;
  heroSubheadline: string;
  contactEmail: string;
  defaultBookingEmail: string;
  defaultButtonAction: ButtonActionType;
  defaultInternalPage: string;
  footerTagline: string;
  footerCopy: string;
  socialLinks: { label: string; url: string }[];
}

export interface PageCopy {
  title?: string;
  headline?: string;
  subheadline?: string;
  intro?: string;
  sectionLabel?: string;
  sectionTitle?: string;
  boltAdvantage?: string;
  travelNote?: string;
  pricingNote?: string;
  cinematicIntro?: string;
}

export interface SiteContent {
  version: number;
  settings: SiteSettings;
  pages: {
    home: PageCopy & {
      whatWeOfferTitle: string;
      howItWorksTitle: string;
      howItWorksSteps: HowItWorksStep[];
      combinedSectionTitle: string;
      bottomCtaTitle: string;
      bottomCtaText: string;
    };
    packages: PageCopy;
    cinematic: PageCopy;
    studio: PageCopy;
    workshops: PageCopy;
    utahBolt: PageCopy;
    program: PageCopy & {
      introParagraphs: string[];
      builtAround: string[];
      closingLines: string[];
      accordionSections: ProgramAccordionSection[];
      deepDiveTitle: string;
      deepDiveSubtitle: string;
    };
    contact: PageCopy & {
      bookingOptions: string[];
      projectTypes: string[];
      interestAreas: string[];
    };
  };
  offerings: OfferingItem[];
}

export type AdminSection =
  | 'settings'
  | 'home'
  | 'media_showcase'
  | 'what_we_offer'
  | 'packages'
  | 'cinematic'
  | 'studio'
  | 'workshops'
  | 'utah_bolt'
  | 'program'
  | 'contact';
