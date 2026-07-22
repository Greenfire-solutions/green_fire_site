import { statusItem } from '../config/statusConfig';

/** Primary homepage story — kept short and clear (from the Green Fire one-pager). */
export const homepageHero = {
  label: 'Green Fire Research and Innovation Center',
  headline: 'A Living Center for Council, Creativity, Regeneration, and Community Solutions',
  subheadline:
    'Green Fire brings artists, builders, educators, healers, researchers, creators, families, and local leaders together to solve real problems through collaboration, creativity, and regenerative action.',
  primaryCta: { label: 'Share a Community Need', subject: 'Green Fire — Community Need' },
  secondaryCta: { label: 'See How It Works', path: '/how-it-works' as const },
  tertiaryCta: { label: 'Explore Offerings', path: '/offerings' as const },
};

export const centralIdea =
  'When people gather in council, share their gifts, and work on real-world solutions together, culture can heal and communities can become stronger, more creative, and more resilient.';

export const councilSection = {
  title: 'The Council Circle',
  body:
    'At the heart of Green Fire is the Council Circle: a shared space where the community gathers to listen, identify needs, make decisions, resolve challenges, and launch meaningful projects. The Council is where ideas become missions, community problems become creative projects, and people are invited to contribute their skills in service of something larger than themselves.',
};

export const eldersFirstSection = {
  title: 'Elders Guide First',
  body:
    'Before the first council is held, Green Fire begins by inviting Indigenous Elders and knowledge keepers to offer guidance and direction — asking, not assuming — so that the community’s values and moral foundation are shaped with their wisdom from the start, not added on afterward.',
  status: statusItem(
    'pilot',
    'Relationships with Elders are built through invitation, consent, and compensation.',
  ),
};

export const coreSectors = [
  {
    id: 'media',
    title: 'Media Hub',
    body:
      'Where storytelling and cultural expression live together — podcasts, video, documentaries, livestreams, courses, and social storytelling — alongside live performance, music production, sound healing, and youth showcases. Art and music give the work its heartbeat and turn local solutions into visible, teachable stories.',
  },
  {
    id: 'maker',
    title: 'Maker & Innovation Space',
    body:
      'Where ideas become physical reality — building, prototyping, repairs, tool education, technology, youth STEM, and regenerative infrastructure. When an affordable or regenerative solution is developed here, it can grow into its own business, with shared ownership held by the creators who built it.',
  },
];

export const livingEcosystem = {
  title: 'How the pieces work together',
  steps: [
    { label: 'Council', detail: 'identifies the need' },
    { label: 'Research', detail: 'understands the problem' },
    { label: 'Maker & Innovation', detail: 'builds solutions' },
    { label: 'Media Hub', detail: 'documents the process through art, music, and story' },
    { label: 'Education', detail: 'turns the process into something others can learn and repeat' },
  ],
  careNote:
    'Care for the people doing the work — grounding, connection, and community wellbeing — is not a separate department. It runs through everything Green Fire does.',
};

export const bioregionalNote = {
  title: 'A bioregional workspace',
  body:
    'Local ecological realities — water, food, energy, land — and the needs of the surrounding ecoregion are woven into how solutions are built, tracked, and rewarded.',
};

export const economicNote = {
  title: 'A practical economic engine',
  body:
    'Green Fire can generate revenue through memberships, workshops, events, retreats, studio rentals, maker classes, youth programs, media production, sponsorships, grants, donations, and regenerative products — so the work can become financially sustainable while creating opportunities for artists, builders, teachers, healers, and local entrepreneurs.',
};

export const startNowSection = {
  title: 'Begin now. Grow into a campus.',
  longTerm:
    'The long-term vision is a full land-based campus with a council hall, media and music studio, maker and innovation lab, gardens, event space, outdoor classrooms, lodging, and regenerative land systems.',
  startNow:
    'But Green Fire can begin immediately without owning land — with a simple gathering space, a weekly council, a camera, a speaker, a project board, a small team, and one real community problem to solve.',
};

export const closingLines = [
  'Green Fire begins when people gather. It grows when they build together. It becomes powerful when the work is documented, shared, taught, and repeated.',
  'The mission is to create a living model for regenerative community: a place where creativity becomes service, technology supports life, culture supports action, and council helps guide the future.',
  'Green Fire is a center for the people who are ready to build what comes next.',
];

/** Kept for learn-more panels (nothing removed from the site). */
export const needSection = {
  headline: 'Communities Have Ideas. What Is Missing Is a Shared Way to Build Them.',
  paragraphs: [
    'Communities are full of knowledge, skills, creativity, and care, but local needs often remain scattered, undocumented, unfunded, and unbuilt. Artists lack infrastructure. Youth lack meaningful pathways. Elders are too often excluded. Landowners have space but no complete activation model. Residents want to help but do not know where to begin.',
    'Green Fire creates the bridge between what a community knows and what it can build together.',
  ],
};

export const whatIsSection = {
  headline: 'A Community Innovation Center Powered by a Creator Commons',
  paragraphs: [
    'Greenfire Innovation Center is a place where community needs can become media campaigns, youth projects, maker prototypes, public events, ecological action, paid opportunities, and locally owned value.',
    'Its operating model, Greenfire Creator Commons, connects community listening, bioregional understanding, creative production, practical building, cultural gathering, transparent exchange, and impact reporting into one repeating process.',
    'A big part of that process is inviting Indigenous Elders — from the local bioregion or from other places — to guide values, morals, and stories that can shape solutions and media, always with consent, compensation, and cultural protocol, and always looking for ways to support Indigenous people.',
  ],
};

export const offeringsPreview = {
  title: 'Offerings That Help Sustain the Mission',
  statement:
    'Green Fire is developing a transparent revenue-allocation model so earned income can help sustain both operations and community projects.',
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
    'Green Fire helps communities establish and operate their own media spaces — in a community center, school, library, farm, warehouse, mobile trailer, or neighborhood gathering space.',
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
  cta: { label: 'Create a Community Media Space', subject: 'Green Fire — Community Media Space Inquiry' },
  status: statusItem('pilot', 'Media-space planning and setup support is in pilot development.'),
};

export const finalCta = {
  headline: 'Green Fire begins when people gather.',
  primary: { label: 'Share a Community Need', subject: 'Green Fire — Community Need' },
  secondary: { label: 'Get Involved', path: '/get-involved' as const },
};
