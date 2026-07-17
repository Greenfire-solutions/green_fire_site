import { statusItem } from '../config/statusConfig';

export const pilotRoadmap = {
  headline: 'Pilot Roadmap',
  intro: 'Greenfire begins by proving one complete cycle. Milestones below are goals — not completed accomplishments.',
  phases: [
    {
      title: 'First 90 Days',
      status: statusItem('pilot'),
      items: [
        'Establish the pilot team',
        'Confirm a pilot space or property partner',
        'Launch community intake',
        'Hold initial listening sessions',
        'Define basic consent and safety policies',
        'Select one first project',
        'Produce one short project story',
        'Host one Greenfire Session',
        'Build a basic project-status system',
      ],
    },
    {
      title: 'Months 3–6',
      status: statusItem('planned'),
      items: [
        'Launch a youth creator or maker pilot if safeguarding is ready',
        'Complete one visible prototype or community build',
        'Test a contribution-tracking system',
        'Publish a transparent pilot report',
        'Build sponsor and funder relationships',
        'Test recurring events',
        'Generate earned revenue through appropriate offerings',
      ],
    },
    {
      title: 'Months 6–12',
      status: statusItem('planned'),
      items: [
        'Complete three to five projects if capacity allows',
        'Train youth in defined creative or maker skills',
        'Compensate participating Elders and local guides when relationships exist',
        'Test products or services',
        'Publish the first toolkit',
        'Release an annual impact report',
        'Prepare the model for independent adaptation',
      ],
    },
  ],
};

export const eventRevenueExample = {
  label: 'Illustrative pilot allocation — not a guaranteed allocation for every event.',
  status: statusItem('pilot'),
  allocations: [
    { label: 'Operations', percent: 35 },
    { label: 'Artists, creators, and crew', percent: 25 },
    { label: 'Community project fund', percent: 20 },
    { label: 'Elder and youth support', percent: 10 },
    { label: 'Reserves and maintenance', percent: 10 },
  ],
};
