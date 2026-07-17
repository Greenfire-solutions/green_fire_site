import { statusItem } from '../config/statusConfig';

export const publicLoop = {
  title: 'The Public Greenfire Loop',
  intro: 'A simplified view of how community input becomes practical, visible, and shareable local action.',
  linkLabel: 'Explore the Complete Ten-Stage System',
  linkPath: '/how-it-works#ten-stages',
  stages: [
    {
      id: 'listen',
      title: 'Listen',
      description:
        'Residents, youth, Elders, artists, local organizations, businesses, land stewards, and other community members can name needs, ideas, stories, resources, and opportunities.',
      status: statusItem('active'),
    },
    {
      id: 'understand',
      title: 'Understand the Place',
      description:
        'Greenfire considers who is affected and examines relevant local conditions such as water, heat, soil, food, energy, materials, infrastructure, history, culture, and existing community assets — including inviting Indigenous Elder guidance for the bioregion when relationships and consent allow.',
      status: statusItem('pilot'),
    },
    {
      id: 'design',
      title: 'Choose and Design Together',
      description:
        'Community input, Indigenous Elder guidance on values and morals, local knowledge, feasibility, urgency, available resources, and ecological relevance help shape a project that is safe and useful enough to test.',
      status: statusItem('pilot'),
    },
    {
      id: 'build',
      title: 'Build and Tell the Story',
      description:
        'Makers, artists, youth, builders, researchers, and media creators develop the prototype, campaign, service, event, or practical response while documenting the process.',
      status: statusItem('active'),
    },
    {
      id: 'gather',
      title: 'Gather and Circulate Support',
      description:
        'Greenfire Sessions — events, workshops, screenings, performances, markets, and partnerships — bring people and resources into the project.',
      status: statusItem('pilot'),
    },
    {
      id: 'measure',
      title: 'Measure, Improve, and Share',
      description:
        'The community reviews human, ecological, cultural, and economic outcomes. What works can become a guide, toolkit, case study, or open-source pattern another community can adapt.',
      status: statusItem('planned'),
    },
  ],
};

export const condensedReplication = {
  title: 'Start Small, Build One Useful Project',
  steps: ['Listen', 'Map', 'Gather', 'Build One Useful Project', 'Report', 'Adapt'],
  note: 'A pilot may start with one partner space, one listening session, one community need, one temporary media kit, one small prototype, one Greenfire Session, and one transparent report.',
};
