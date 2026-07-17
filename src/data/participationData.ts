import { statusItem } from '../config/statusConfig';

export const participationPathways = [
  {
    id: 'need',
    title: 'Bring a Need',
    description: 'Share a challenge, observation, dream, local story, or project idea.',
    cta: { label: 'Submit a Need', subject: 'Greenfire — Community Need', path: '/get-involved#bring-a-need' },
  },
  {
    id: 'skill',
    title: 'Offer a Skill',
    description:
      'Participate as an artist, filmmaker, musician, builder, grower, educator, researcher, organizer, technician, designer, mentor, or community member.',
    cta: { label: 'Offer a Skill', subject: 'Greenfire — Offer a Skill', path: '/get-involved#offer-a-skill' },
  },
  {
    id: 'partner',
    title: 'Host or Partner',
    description: 'Offer space, equipment, materials, expertise, access, sponsorship, or organizational partnership.',
    cta: { label: 'Partner With Greenfire', subject: 'Greenfire — Partnership Inquiry', path: '/get-involved#host-partner' },
  },
  {
    id: 'elder',
    title: 'Elder Guidance & Indigenous Partnership',
    description:
      'Invite Indigenous Elder guidance, travel support, cultural protocol conversations, or ways to put Elders and Indigenous communities at the forefront of a project.',
    cta: {
      label: 'Connect About Elder Guidance',
      subject: 'Greenfire — Indigenous Elder Guidance & Partnership',
      path: '/get-involved#elder-guidance',
    },
  },
  {
    id: 'support',
    title: 'Support a Project',
    description: 'Donate, sponsor, volunteer, attend an event, provide materials, or help fund a visible prototype.',
    cta: { label: 'Support a Project', subject: 'Greenfire — Project Support', path: '/get-involved#support' },
  },
  {
    id: 'replicate',
    title: 'Start a Local Version',
    description:
      'Adapt the Greenfire Creator Commons model for another community, property, neighborhood, town, or bioregion.',
    cta: { label: 'Explore Adaptation', path: '/open-source' },
  },
];

export const youthSection = {
  headline: 'Youth Development Across the System',
  intro:
    'Youth participation is woven throughout the Greenfire process — not isolated in a single program.',
  roles: [
    'Filmmaker', 'Photographer', 'Music producer', 'Podcast producer', 'Designer', 'Researcher',
    'Community journalist', 'Maker', 'Builder', 'Gardener', 'Event producer', 'Interviewer',
    'Project documentarian', 'Apprentice', 'Youth project lead',
  ],
  pathways: [
    'Training and mentorship',
    'Paid internships when funded',
    'Portfolio development',
    'Public showcases',
    'Safety training',
    'Apprenticeships',
  ],
  status: statusItem('planned', 'Youth cohorts and enrollment are not yet active. Use the general interest form for schools, mentors, or guardians.'),
  note: 'Until safeguarding systems are ready, use a general interest form — not a direct youth application.',
};

export const jobsSection = {
  headline: 'Community Needs Can Become Meaningful Work',
  pathway: [
    'Community need',
    'Approved project',
    'Project scope',
    'Specific tasks',
    'Skill matching',
    'Paid work, contract, apprenticeship, volunteering, work trade, or credits',
    'Proof of completion',
    'Payment, access, recognition, or defined reward',
  ],
  status: statusItem('planned'),
};

export const creditsSection = {
  headline: 'Greenfire Credits',
  disclaimer:
    'Greenfire Credits are being designed as non-transferable internal contribution records that may unlock access, recognition, training, events, tools, studio time, or project opportunities. They are not cryptocurrency, legal tender, or an investment product.',
  status: statusItem('vision', 'No ledger, policies, or verification rules exist yet.'),
};

export const aiSection = {
  headline: 'Technology Supports the Community. It Does Not Govern It.',
  mayAssist: [
    'Summarizing meetings', 'Organizing intake', 'Drafting project plans', 'Matching skills with tasks',
    'Grant preparation', 'Impact reporting', 'Reducing administrative burden',
  ],
  mustNot: [
    'Make final funding decisions', 'Secretly profile participants', 'Replace consent',
    'Replace Elder guidance', 'Use sacred or restricted knowledge', 'Sell community data',
  ],
  dataStatement:
    'Greenfire is developing community-governed data practices based on consent, transparency, minimal collection, human review, and the right to correct or remove information where possible.',
  status: statusItem('planned'),
};
