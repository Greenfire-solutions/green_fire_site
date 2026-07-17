import { statusItem } from '../config/statusConfig';

export const elderProtocol = {
  headline: 'Indigenous Elders, Knowledge Keepers, and Local Elders',
  intro:
    'Greenfire may seek guidance from Indigenous Elders, named tribal representatives, cultural knowledge holders, local Elders, historians, land stewards, and long-term residents when those relationships are relevant and appropriately established.',
  statement:
    'Greenfire seeks guidance through relationships built on clear invitation, consent, compensation, cultural protocol, and continued accountability. Knowledge holders determine what may be recorded, shared, archived, commercialized, or kept private.',
  status: statusItem('vision', 'Elder advisory relationships are aspirational until formally established.'),
  principles: [
    'Relationship before request',
    'Clear invitation',
    'Informed consent',
    'Fair compensation',
    'Cultural boundaries',
    'Review before sensitive publication',
    'The ability to withdraw or restrict material',
    'Benefit sharing',
    'Protection from unauthorized AI or data use',
    'Continued relationship after the project',
  ],
  doNot: [
    'Do not state that all Indigenous people share one worldview',
    'Do not imply tribal endorsement without written confirmation',
    'Do not use Indigenous culture as marketing aesthetic',
    'Do not record ceremonies automatically',
    'Do not enter private knowledge into AI systems without consent',
  ],
};

export const conflictSection = {
  headline: 'Conflict, Safety, and Repair',
  intro: 'A functioning commons requires safety agreements, clear boundaries, and processes for addressing harm.',
  includes: [
    'Safety agreements and facility rules',
    'Process for reporting harm',
    'Listening and mediation when appropriate',
    'Graduated consequences',
    'Documentation with privacy',
    'Policy improvement',
  ],
  status: statusItem('planned'),
  note: 'Restorative processes do not replace emergency services, mandated reporting, or immediate safety interventions.',
};

export const offeringsCategories = [
  {
    id: 'media',
    title: 'Media and Story Production',
    description: 'Film, documentary, music, podcasts, photography, design, campaigns, livestreaming, and impact reporting.',
    path: '/offerings/packages',
    items: ['Film & documentary', 'Music production', 'Podcasts', 'Photography', 'Social campaigns', 'Impact reporting'],
  },
  {
    id: 'spaces',
    title: 'Creative and Community Media Spaces',
    description: 'Recording access, podcast studios, editing stations, mobile production, and community studio setup.',
    path: '/offerings/studio',
    items: ['Recording access', 'Podcast access', 'Editing stations', 'Equipment access', 'Media-space design'],
  },
  {
    id: 'events',
    title: 'Events and Activations',
    description: 'Greenfire Sessions, performances, screenings, workshops, markets, fundraisers, and creative activations.',
    path: '/offerings/workshops',
    items: ['Greenfire Sessions', 'Performances', 'Screenings', 'Workshops', 'Markets', 'Fundraisers'],
  },
  {
    id: 'maker',
    title: 'Maker and Innovation Experiences',
    description: 'Collaborative builds, repair workshops, prototyping, ecological design, and community design labs.',
    path: '/offerings/packages',
    items: ['Build sessions', 'Repair workshops', 'Prototyping', 'Product design', 'Build documentation'],
  },
  {
    id: 'education',
    title: 'Education, Facilitation, and Consulting',
    description: 'Youth media education, community listening facilitation, hub design, and open-source implementation support.',
    path: '/offerings/workshops',
    items: ['Youth media education', 'Workshops', 'Hub design', 'Pilot consulting', 'Implementation support'],
  },
];

export const offeringsStatement =
  'Revenue from Greenfire offerings helps support community listening, equipment access, youth pathways, Elder compensation, project development, documentation, and accessible public programming.';
