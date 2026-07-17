import { statusItem } from '../config/statusConfig';

export const homepageHero = {
  label: 'Greenfire Innovation Center',
  headline: 'Where Community Wisdom Becomes Local Solutions',
  subheadline:
    'Greenfire brings community members, youth, Elders, artists, makers, land stewards, researchers, and local partners together to identify real needs, create practical responses, tell the story, gather support, and build what the community actually needs.',
  primaryCta: { label: 'Share a Community Need', subject: 'Greenfire — Community Need' },
  secondaryCta: { label: 'See How Greenfire Works', path: '/how-it-works' as const },
  tertiaryCta: { label: 'Explore Our Offerings', path: '/offerings' as const },
};

export const needSection = {
  headline: 'Communities Have Ideas. What Is Missing Is a Shared Way to Build Them.',
  paragraphs: [
    'Communities are full of knowledge, skills, creativity, and care, but local needs often remain scattered, undocumented, unfunded, and unbuilt. Artists lack infrastructure. Youth lack meaningful pathways. Elders are too often excluded. Landowners have space but no complete activation model. Residents want to help but do not know where to begin.',
    'Greenfire creates the bridge between what a community knows and what it can build together.',
  ],
};

export const whatIsSection = {
  headline: 'A Community Innovation Center Powered by a Creator Commons',
  paragraphs: [
    'Greenfire Innovation Center is a place where community needs can become media campaigns, youth projects, maker prototypes, public events, ecological action, paid opportunities, and locally owned value.',
    'Its operating model, Greenfire Creator Commons, connects community listening, bioregional understanding, creative production, practical building, cultural gathering, transparent exchange, and impact reporting into one repeating process.',
  ],
};

export const offeringsPreview = {
  title: 'Offerings That Help Sustain the Mission',
  statement:
    'Greenfire is developing a transparent revenue-allocation model so earned income can help sustain both operations and community projects.',
  categories: [
    { title: 'Media & Story Production', icon: 'Video' },
    { title: 'Creative & Community Media Spaces', icon: 'Mic' },
    { title: 'Events & Activations', icon: 'Calendar' },
    { title: 'Maker & Innovation Experiences', icon: 'Hammer' },
    { title: 'Education, Facilitation & Consulting', icon: 'BookOpen' },
  ],
};

export const communityMediaSpaces = {
  headline: 'Every Community Should Be Able to Tell Its Own Story',
  intro:
    'Greenfire helps communities establish and operate their own media spaces — in a community center, school, library, farm, warehouse, mobile trailer, or neighborhood gathering space.',
  spaces: [
    'Recording rooms',
    'Podcast studios',
    'Editing stations',
    'Youth media labs',
    'Livestream rooms',
    'Screening spaces',
    'Mobile production kits',
    'Shared camera and audio libraries',
  ],
  cta: { label: 'Create a Community Media Space', subject: 'Greenfire — Community Media Space Inquiry' },
  status: statusItem('pilot', 'Media-space planning and setup support is in pilot development.'),
};

export const finalCta = {
  headline: 'The community names the need. Greenfire helps build the response.',
  primary: { label: 'Share a Community Need', subject: 'Greenfire — Community Need' },
  secondary: { label: 'Get Involved', path: '/get-involved' as const },
};
