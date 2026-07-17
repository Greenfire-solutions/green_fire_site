import { statusItem } from '../config/statusConfig';

export const coreCapacities = [
  {
    id: 'listening',
    title: 'Community Listening and Council',
    purpose:
      'To receive community needs, clarify them, understand who is affected, map available assets, review feasibility, and determine an appropriate next step.',
    mayInclude: [
      'Community intake',
      'Listening circles',
      'Project proposals',
      'Public meetings',
      'Consent-based decision-making',
      'Participatory budgeting',
      'Conflict and repair pathways',
    ],
    output: 'Clear community needs, selected projects, public updates, transparent decisions, defined responsibilities.',
    status: statusItem('pilot', 'Formal council and participatory budget are pilot governance concepts — not yet operating.'),
    pullQuote: null,
  },
  {
    id: 'bioregional',
    title: 'Bioregional Intelligence',
    purpose:
      'To understand the actual place being served rather than applying the same solution everywhere.',
    mayInclude: [
      'Watershed and rainfall patterns',
      'Heat and drought conditions',
      'Soil and food access',
      'Energy resilience',
      'Local culture and trades',
      'Existing community infrastructure',
    ],
    output: 'Place-based context that shapes project priorities and design.',
    status: statusItem('pilot', 'Bioregional mapping framework in development — no live ecological dashboard yet.'),
    pullQuote: 'The community speaks through intake. The land speaks through bioregional signals.',
  },
  {
    id: 'media',
    title: 'Media, Arts, and Culture',
    purpose:
      'Help communities tell their own stories, make local needs visible, document projects, attract participation and funding, preserve appropriate local memory, teach creative skills, and create paid opportunities.',
    mayInclude: [
      'Film and documentary',
      'Music and audio production',
      'Podcasts and photography',
      'Design and livestreaming',
      'Community journalism',
      'Performances and youth storytelling',
      'Impact reports and build tutorials',
    ],
    output: 'Visible stories, campaigns, archives, and creative pathways.',
    status: statusItem('active'),
    pullQuote: 'Media is not separate from the work. Media helps the work become visible, fundable, teachable, and repeatable.',
  },
  {
    id: 'maker',
    title: 'Maker and Product Innovation',
    purpose:
      'Turn real community problems into practical experiments, repairs, prototypes, products, services, kits, and local infrastructure.',
    mayInclude: [
      'Repair and reuse',
      'Fabrication and ecological design',
      'Product development',
      'Appropriate technology',
      'Tool sharing',
      'Youth apprenticeships',
      'Community-born enterprises',
    ],
    output: 'Working prototypes, repairs, infrastructure, and build documentation.',
    status: statusItem('active'),
    pullQuote: 'The goal is not to build everything at once. The goal is to make the smallest useful version, test it in real conditions, and improve it.',
  },
];

export const eventsSection = {
  title: 'Greenfire Sessions',
  headline: 'Events as the Activation Engine',
  description:
    'Greenfire Sessions are the cultural activation layer that connects the system — combining music, film, local storytelling, youth presentations, project demonstrations, volunteer recruitment, fundraising, workshops, local food, and maker markets.',
  statement:
    'Events are where Greenfire gathers culture, participation, visibility, funding, local business, and public accountability around real community projects.',
  status: statusItem('pilot'),
};
