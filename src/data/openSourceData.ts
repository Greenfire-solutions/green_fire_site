import { linksConfig } from '../config/linksConfig';
import { statusItem } from '../config/statusConfig';

export const openSourceContent = {
  headline: 'Built to Be Adapted, Not Copied Without Context',
  intro:
    'Greenfire Creator Commons is being developed as an open-source framework that communities can adapt according to their land, culture, needs, laws, resources, and relationships. The purpose is not to make every community identical. The purpose is to provide useful starting structures that local people can reshape.',
  status: statusItem('planned', 'Open-source release is planned — no published license or repository yet.'),
  mayInclude: [
    'Website source code',
    'Community intake templates',
    'Council formats',
    'Project proposal templates',
    'Media consent templates',
    'Maker safety templates',
    'Impact reporting tools',
    'Event formats',
    'Media-space plans',
    'Bioregional mapping guides',
    'Chapter launch guides',
    'Educational materials and case studies',
  ],
  revenueNote:
    'Open source does not mean every service must be free. Greenfire may generate earned revenue through implementation support, training, facilitation, media production, event production, and custom deployment.',
  supportLanguage: [
    'Implementation support',
    'Training',
    'Facilitated launch services',
    'Custom deployment',
    'Network membership',
  ],
  replicationPathway: [
    { step: 'Seed', detail: 'Introduce the model to a community or property.' },
    { step: 'Listen', detail: 'Hold intake and listening sessions.' },
    { step: 'Map', detail: 'Map assets, needs, and bioregional context.' },
    { step: 'Gather', detail: 'Convene people and resources.' },
    { step: 'Choose', detail: 'Select one useful first project.' },
    { step: 'Build', detail: 'Prototype and document.' },
    { step: 'Report', detail: 'Share transparent outcomes.' },
    { step: 'Formalize', detail: 'Establish governance as capacity allows.' },
    { step: 'Grow', detail: 'Expand programs with evidence.' },
    { step: 'Network', detail: 'Connect with other adapting communities.' },
  ],
  getStatusMessage(): string {
    switch (linksConfig.openSourceStatus) {
      case 'published':
        return 'Open source materials are published.';
      case 'preparing-release':
        return 'Open-source release in preparation.';
      default:
        return 'Designed to become open source.';
    }
  },
};
