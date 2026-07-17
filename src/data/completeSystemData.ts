import { statusItem, type StatusItem } from '../config/statusConfig';

export type SystemStage = {
  id: string;
  number: number;
  title: string;
  whatHappens: string;
  whoParticipates: string[];
  produces: string[];
  status: StatusItem;
};

export const tenStageSystem: SystemStage[] = [
  {
    id: 'listen',
    number: 1,
    title: 'Listen',
    whatHappens: 'Community members submit needs, ideas, stories, and opportunities through intake and listening sessions.',
    whoParticipates: ['Residents', 'Youth', 'Artists', 'Local organizations', 'Businesses', 'Land stewards'],
    produces: ['Community needs list', 'Project proposals', 'Story leads'],
    status: statusItem('active'),
  },
  {
    id: 'sense',
    number: 2,
    title: 'Sense the Bioregion',
    whatHappens: 'Local ecological and place-based conditions are reviewed to understand context before designing a response.',
    whoParticipates: ['Researchers', 'Land stewards', 'Local residents', 'Youth documentarians'],
    produces: ['Place context notes', 'Bioregional considerations', 'Feasibility inputs'],
    status: statusItem('pilot'),
  },
  {
    id: 'council',
    number: 3,
    title: 'Council',
    whatHappens: 'Community input is reviewed, clarified, and prioritized to determine an appropriate next step.',
    whoParticipates: ['Community members', 'Project stewards', 'Facilitators'],
    produces: ['Selected projects', 'Public updates', 'Defined responsibilities'],
    status: statusItem('pilot', 'Pilot governance model in development — not a formal council yet.'),
  },
  {
    id: 'design',
    number: 4,
    title: 'Design',
    whatHappens: 'Interdisciplinary teams shape the smallest useful version of a project safe enough to test.',
    whoParticipates: ['Youth', 'Makers', 'Artists', 'Researchers', 'Community liaisons'],
    produces: ['Project scope', 'Design concepts', 'Safety and consent plans'],
    status: statusItem('pilot'),
  },
  {
    id: 'build',
    number: 5,
    title: 'Build',
    whatHappens: 'Prototypes, repairs, campaigns, and practical responses are created in real conditions.',
    whoParticipates: ['Makers', 'Builders', 'Youth apprentices', 'Volunteers'],
    produces: ['Working prototypes', 'Repairs', 'Installations', 'Build documentation'],
    status: statusItem('active'),
  },
  {
    id: 'story',
    number: 6,
    title: 'Tell the Story',
    whatHappens: 'Media documents the need, process, and outcomes with consent — making work visible and fundable.',
    whoParticipates: ['Filmmakers', 'Photographers', 'Podcast producers', 'Designers', 'Youth media creators'],
    produces: ['Films', 'Podcasts', 'Campaigns', 'Impact reports', 'Build tutorials'],
    status: statusItem('active'),
  },
  {
    id: 'gather',
    number: 7,
    title: 'Gather',
    whatHappens: 'Greenfire Sessions combine culture, participation, visibility, and project support.',
    whoParticipates: ['Artists', 'Vendors', 'Volunteers', 'Community members', 'Funders'],
    produces: ['Events', 'Participation', 'Fundraising', 'Public accountability moments'],
    status: statusItem('pilot'),
  },
  {
    id: 'exchange',
    number: 8,
    title: 'Exchange',
    whatHappens: 'Contributions, roles, and rewards are tracked transparently where policies exist.',
    whoParticipates: ['Project leads', 'Volunteers', 'Paid contractors', 'Youth participants'],
    produces: ['Contribution records', 'Access pathways', 'Recognition'],
    status: statusItem('planned', 'Contribution credits and exchange systems are in design — not operational.'),
  },
  {
    id: 'measure',
    number: 9,
    title: 'Measure',
    whatHappens: 'Human, ecological, cultural, and economic outcomes are reviewed with the community.',
    whoParticipates: ['Project teams', 'Community members', 'Facilitators'],
    produces: ['Pilot reports', 'Lessons learned', 'Impact categories documented'],
    status: statusItem('planned'),
  },
  {
    id: 'replicate',
    number: 10,
    title: 'Replicate',
    whatHappens: 'Successful patterns become guides, toolkits, and open-source materials other communities can adapt.',
    whoParticipates: ['Documentation teams', 'Facilitators', 'Partner communities'],
    produces: ['Case studies', 'Build guides', 'Adaptation toolkits'],
    status: statusItem('vision'),
  },
];
