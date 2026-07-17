import { statusItem } from '../config/statusConfig';

export const impactCategories = {
  headline: 'Impact Measurement Framework',
  intro: 'Categories Greenfire intends to measure. No fictional numbers are displayed.',
  status: statusItem('planned', 'Measurement framework — metrics will be reported as they become available.'),
  human: [
    'Residents engaged', 'Youth trained', 'Elders compensated', 'Artists paid', 'Volunteers activated',
    'Apprenticeships created', 'Workshops hosted', 'Skills documented',
  ],
  ecological: [
    'Water captured or conserved', 'Gardens built', 'Food grown or recovered', 'Materials reused',
    'Shade created', 'Trees planted', 'Repairs completed', 'Energy saved',
  ],
  economic: [
    'Event revenue', 'Local vendors paid', 'Creator income generated', 'Youth stipends',
    'Project funds deployed', 'Products prototyped', 'Local jobs or contracts',
  ],
  cultural: [
    'Films', 'Podcasts', 'Music', 'Performances', 'Public events', 'Youth media pieces',
    'Community campaigns', 'Build guides',
  ],
};

export const exampleProject = {
  label: 'Example Greenfire Project Cycle',
  status: statusItem('vision', 'Illustrative example — not a completed project.'),
  headline: 'What the Greenfire Process Looks Like in Real Life',
  title: 'Shade the Block',
  signal: 'Residents report a lack of safe, shaded public gathering space during extreme heat.',
  steps: [
    { title: 'Place-based context', detail: 'Heat conditions, tree canopy, public access, water, materials, and neighborhood history are reviewed.' },
    { title: 'Community guidance', detail: 'Residents, youth, long-term community members, accessibility advocates, builders, and property stewards contribute context.' },
    { title: 'Design', detail: 'Youth and local designers create several low-cost shade concepts.' },
    { title: 'Prototype', detail: 'The maker team builds a small structure using safe, locally appropriate, reused, or affordable materials.' },
    { title: 'Story', detail: 'The media team documents the need and creates a short “Shade the Block” campaign with consent.' },
    { title: 'Gathering', detail: 'A Greenfire Session combines music, local vendors, a project presentation, volunteer signup, and fundraising.' },
    { title: 'Installation and care', detail: 'The prototype is installed after property permission, safety review, accessibility consideration, and a maintenance plan.' },
    { title: 'Measurement', detail: 'Shade created, people served, youth trained, materials reused, funds raised, local workers paid, and community feedback are tracked.' },
    { title: 'Replication', detail: 'Plans, costs, lessons, permissions, and media become a guide another neighborhood can adapt.' },
  ],
};
