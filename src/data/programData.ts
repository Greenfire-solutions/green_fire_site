import {
  Hammer, Heart, Music, Video, Inbox, Users, Search, Network, Cpu, BookOpen, Coins,
  CheckSquare, Sprout, Play,
} from 'lucide-react';

export const homeSectors = [
  { title: 'Innovation Lab', icon: Hammer, description: 'A hands-on prototyping space for fabrication, regenerative builds, and engineering physical solutions to real-world community challenges.' },
  { title: 'Media Hub', icon: Video, description: 'A high-end media studio that documents the build process, turning local innovations into teachable stories, podcasts, and documentaries.' },
  { title: 'Creative Studio', icon: Music, description: 'A cultural hub for artist collaboration, music production, and storytelling that provides the creative heartbeat for our projects.' },
  { title: 'Wellness & Resilience', icon: Heart, description: 'Core human infrastructure offering nervous-system regulation, integration, and care to ensure our builders and creators avoid burnout.' },
];

export const systemNodes = [
  { id: 'intake', title: 'Community Intake', icon: Inbox, desc: 'Listening to local needs, ideas, and challenges.', color: 'text-blue-400', bg: 'bg-blue-400/10', ring: 'ring-blue-400/30' },
  { id: 'council', title: 'Council Core', icon: Users, desc: 'Reviewing, prioritizing, and aligning needs with the mission.', color: 'text-orange-400', bg: 'bg-orange-400/10', ring: 'ring-orange-400/30' },
  { id: 'research', title: 'Research Team', icon: Search, desc: 'Studying the problem, costs, and existing solutions.', color: 'text-purple-400', bg: 'bg-purple-400/10', ring: 'ring-purple-400/30' },
  { id: 'collaboration', title: 'Collaboration Guilds', icon: Network, desc: 'Forming interdisciplinary teams around the project.', color: 'text-emerald-400', bg: 'bg-emerald-400/10', ring: 'ring-emerald-400/30' },
  { id: 'innovation', title: 'Innovation Lab', icon: Cpu, desc: 'Designing and prototyping the digital or physical solution.', color: 'text-cyan-400', bg: 'bg-cyan-400/10', ring: 'ring-cyan-400/30' },
  { id: 'maker', title: 'Maker Space', icon: Hammer, desc: 'Building the tools, infrastructure, and hardware.', color: 'text-amber-400', bg: 'bg-amber-400/10', ring: 'ring-amber-400/30' },
  { id: 'media', title: 'Media Hub', icon: Video, desc: 'Documenting the process and telling the story.', color: 'text-pink-400', bg: 'bg-pink-400/10', ring: 'ring-pink-400/30' },
  { id: 'wellness', title: 'Wellness Hub', icon: Heart, desc: 'Supporting the emotional health of the builders.', color: 'text-rose-400', bg: 'bg-rose-400/10', ring: 'ring-rose-400/30' },
  { id: 'education', title: 'Education Center', icon: BookOpen, desc: 'Turning the process into teachable workshops and courses.', color: 'text-indigo-400', bg: 'bg-indigo-400/10', ring: 'ring-indigo-400/30' },
  { id: 'economic', title: 'Economic Engine', icon: Coins, desc: 'Creating sustainable revenue through the model.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' },
];

export const intakeCategories = ['Youth education needs', 'Food and garden needs', 'Wellness and mental health', 'Housing and land needs', 'Local business support', 'Art and culture needs', 'Media and storytelling', 'Technology needs', 'Environmental challenges', 'Community conflict or repair', 'Event and gathering needs', 'Tool, repair, or maker needs'];
export const councilCriteria = ['Community impact', 'Urgency', 'Feasibility', 'Available team', 'Funding potential', 'Educational value', 'Media/story value', 'Regenerative value', 'Replication potential'];
export const researchSteps = ['Community interviews', 'Existing solution research', 'Local data gathering', 'Cost estimates', 'Materials lists', 'Case studies', 'Expert interviews', 'Funding research', 'Safety and legal requirements', 'Timeline planning', 'Documentation needs'];
export const collaborationRoles = ['Project steward', 'Research lead', 'Builder/maker', 'Media lead', 'Wellness steward', 'Artist/storyteller', 'Youth educator', 'Finance/grant lead', 'Community liaison', 'Volunteer coordinator'];

export const projectLevels = [
  { level: 1, title: 'Intake' }, { level: 2, title: 'Research' }, { level: 3, title: 'Council' },
  { level: 4, title: 'Team' }, { level: 5, title: 'Prototype' }, { level: 6, title: 'Test' },
  { level: 7, title: 'Document' }, { level: 8, title: 'Event' }, { level: 9, title: 'Fund' }, { level: 10, title: 'Scale' },
];

export const hubsData = [
  { title: 'Art & Music Hub', icon: Music, color: 'emerald', purpose: 'Creates culture, beauty, ceremony, entertainment, emotional expression, youth showcases, performances, sound healing, and musical identity for the movement.', activities: ['Live music', 'Recording', 'DJ classes', 'Sound healing', 'Artist residencies', 'Youth showcases', 'Songwriting circles', 'Festival programming'], outputs: ['Songs', 'Performances', 'Albums', 'Sound baths', 'Cultural events', 'Music videos', 'Public inspiration'], income: ['Studio sessions', 'Concert tickets', 'Music classes', 'Sound healing events', 'Artist memberships', 'Music licensing'] },
  { title: 'Media Hub', icon: Video, color: 'orange', purpose: 'Documents the work, tells the story, produces content, creates education, builds public trust, and turns community solutions into media that can travel.', activities: ['Podcasts', 'Interviews', 'Documentaries', 'Social media', 'Livestreaming', 'Courses', 'Photography', 'Impact reports'], outputs: ['Podcast episodes', 'Short-form videos', 'Documentaries', 'Online courses', 'Social campaigns', 'Event recaps', 'Donor reports'], income: ['Podcast production', 'Video packages', 'Course sales', 'Sponsorships', 'YouTube revenue', 'Livestream packages', 'Content memberships'] },
  { title: 'Maker Space', icon: Hammer, color: 'amber', purpose: 'Builds the physical and digital solutions that come from the Council and Research process.', activities: ['Prototyping', 'Repairs', 'Tool education', '3D printing', 'Woodworking', 'Fabrication', 'Regenerative infrastructure', 'Youth STEM'], outputs: ['Prototypes', 'Repairs', 'Toolkits', 'Furniture', 'Garden infrastructure', 'Art installations', 'Educational kits'], income: ['Maker memberships', 'Tool classes', 'Custom fabrication', 'Repair events', 'Product prototyping', 'Sponsored challenges'] },
  { title: 'Wellness Hub', icon: Heart, color: 'rose', purpose: 'Supports the health, regulation, emotional safety, and resilience of the people doing the work.', activities: ['Yoga', 'Breathwork', 'Sound healing', 'Somatic work', 'Integration circles', 'Bodywork', 'Conflict repair', 'Community care'], outputs: ['Wellness sessions', 'Restorative circles', 'Integration support', 'Health education', 'Care protocols', 'Community repair practices'], income: ['Wellness memberships', 'Drop-in classes', 'Private sessions', 'Retreats', 'Practitioner room rental', 'Herbal product sales'] },
];

export const materialsData = [
  { space: 'Council Circle', cost: '$500–$10k', managed: 'Council Steward', supports: 'Meetings, conflict repair, launches', essential: ['Circle seating', 'Shade/shelter', 'Whiteboard', 'Project board', 'Speaker', 'Microphone', 'Lighting', 'Fire centerpiece', 'Signage'] },
  { space: 'Art & Music Hub', cost: '$3k–$25k', managed: 'Art & Music Director', supports: 'Shows, recording, youth music', essential: ['PA system', 'Microphones', 'Cables', 'Audio interface', 'Studio monitors', 'Acoustic treatment', 'Stage lighting', 'MIDI keyboard'] },
  { space: 'Media Hub', cost: '$3k–$30k', managed: 'Media Director', supports: 'Podcasts, videos, courses', essential: ['Cameras', 'Tripods', 'Lighting', 'Podcast mics', 'Editing computer', 'Backdrops', 'Switcher', 'Teleprompter'] },
  { space: 'Media Hub Workspace', cost: '$2k–$20k', managed: 'Media Hub Manager', supports: 'Creators, editors, course builders', essential: ['Shared worktables', 'Desks', 'Content calendar board', 'Editing stations', 'Lighting', 'Set pieces'] },
  { space: 'Maker Space', cost: '$5k–$50k', managed: 'Maker Space Director', supports: 'Repairs, fabrication, prototypes', essential: ['Workbenches', 'Power tools', 'Safety gear', '3D printers', 'Soldering station', 'Dust collection', 'Hardware bins'] },
  { space: 'Innovation Lab', cost: '$3k–$25k', managed: 'Innovation Director', supports: 'Research, design sprints', essential: ['Whiteboards', 'Computers', 'Prototyping kits', 'Materials library', 'Design software'] },
  { space: 'Wellness Hub', cost: '$2k–$25k', managed: 'Wellness Director', supports: 'Classes, sound healing, circles', essential: ['Yoga mats', 'Bolsters', 'Sound bowls', 'Massage table', 'Tea station', 'Soft lighting', 'Privacy screens'] },
  { space: 'Education Room', cost: '$2k–$20k', managed: 'Education Director', supports: 'Youth programs, workshops', essential: ['Tables', 'Chairs', 'Projector', 'Whiteboard', 'Art supplies', 'Curriculum shelves'] },
  { space: 'Outdoor Event Space', cost: '$5k–$75k', managed: 'Event Producer', supports: 'Concerts, festivals, markets', essential: ['Stage', 'PA system', 'Lighting', 'Seating', 'Vendor tents', 'Bathrooms', 'First aid station'] },
  { space: 'Garden / Land', cost: '$2k–$50k', managed: 'Land Steward', supports: 'Food ed, restoration, farm events', essential: ['Beds', 'Soil/Compost', 'Irrigation', 'Tools', 'Rainwater tanks', 'Outdoor seating', 'Seeds'] },
];

export const economicEngineData = [
  { category: 'Memberships', items: ['Community membership', 'Creator membership', 'Maker membership', 'Wellness membership', 'Full Green Fire membership', 'Founding patron membership'] },
  { category: 'Events', items: ['Concerts', 'Markets', 'Speaker nights', 'Council nights', 'Festivals', 'Showcases', 'Fundraisers', 'Retreats'] },
  { category: 'Education', items: ['Workshops', 'Online courses', 'Youth camps', 'Certifications', 'Apprenticeships', 'Homeschool programs', 'Corporate trainings'] },
  { category: 'Media', items: ['Podcasts', 'Video production', 'Sponsorships', 'YouTube revenue', 'Livestreaming', 'Documentary work', 'Local business storytelling'] },
  { category: 'Maker / Innovation', items: ['Prototyping', 'Fabrication', 'Repairs', 'Product development', 'Tool classes', 'Build workshops', 'Sponsored challenges'] },
  { category: 'Wellness', items: ['Classes', 'Private sessions', 'Sound baths', 'Breathwork', 'Retreats', 'Practitioner rentals', 'Herbal products'] },
  { category: 'Grants & Donations', items: ['Youth education grants', 'Arts grants', 'Climate grants', 'Workforce development', 'Community health', 'STEM'] },
  { category: 'Products', items: ['Music', 'Merch', 'Journals', 'Toolkits', 'Herbal goods', 'Education kits', 'Digital downloads', 'Art prints'] },
];

export const rolesData = [
  { title: 'Vision Holder / Executive Director', desc: 'Owns mission, partnerships, fundraising, culture, public story, and long-term direction.' },
  { title: 'Operations Director', desc: 'Runs calendar, rentals, staff, facilities, logistics, safety, and daily flow.' },
  { title: 'Council Steward', desc: 'Facilitates council, tracks proposals, manages agenda, supports conflict repair.' },
  { title: 'Research Lead', desc: 'Studies problems, gathers info, interviews people, builds reports, supports grants.' },
  { title: 'Innovation Director', desc: 'Turns research into prototypes, design sprints, product ideas, and working models.' },
  { title: 'Maker Space Director', desc: 'Runs shop, tools, safety, memberships, build days, and fabrication.' },
  { title: 'Media Director', desc: 'Runs podcasts, videos, livestreams, courses, content calendars, and documentation.' },
  { title: 'Media Hub Manager', desc: 'Coordinates creators, editors, social posts, publishing schedules, sets, and brand partnerships.' },
  { title: 'Art & Music Director', desc: 'Runs shows, studio sessions, music programming, artist residencies.' },
  { title: 'Wellness Director', desc: 'Runs classes, practitioner scheduling, wellness protocols, circles, and integration.' },
  { title: 'Education Director', desc: 'Builds youth programs, workshops, curriculum, teacher partnerships, and certifications.' },
  { title: 'Land Steward', desc: 'Runs gardens, compost, food systems, outdoor classrooms, native plants, and land restoration.' },
  { title: 'Finance / Development Lead', desc: 'Handles budgets, grants, sponsors, donors, memberships, revenue tracking.' },
  { title: 'Volunteer Coordinator', desc: 'Onboards volunteers, matches people to projects, tracks contributions.' },
  { title: 'Community Liaison', desc: 'Builds relationships with neighborhoods, schools, nonprofits, local businesses.' },
  { title: 'Safety / Care Lead', desc: 'Handles safety protocols, first aid, youth policies, event safety, consent culture.' },
];

export const metrics = [
  { label: 'Needs Submitted', value: '142', icon: Inbox },
  { label: 'Active Projects', value: '18', icon: CheckSquare },
  { label: 'Volunteers', value: '350+', icon: Users },
  { label: 'Youth Served', value: '1,200', icon: Sprout },
  { label: 'Workshops', value: '84', icon: BookOpen },
  { label: 'Media Pieces', value: '450', icon: Play },
  { label: 'Prototypes', value: '32', icon: Cpu },
  { label: 'Wellness Hours', value: '2,100', icon: Heart },
];

export const methodologySteps = [
  { step: '01', title: 'Listen & Align', icon: Search, desc: 'We source real, pressing needs from the community and align teams around them.' },
  { step: '02', title: 'Build & Prototype', icon: Hammer, desc: 'Our makers and engineers design and fabricate physical or digital solutions.' },
  { step: '03', title: 'Capture the Story', icon: Video, desc: 'The media hub films the build process, turning the journey into premium media.' },
  { step: '04', title: 'Scale & Incubate', icon: Network, desc: 'We open-source blueprints for community replication, or incubate projects into creator-led businesses.' },
];

export const offeringsData = [
  { title: 'Regenerative Infrastructure', icon: Sprout, desc: 'Physical builds like community gardens, wellness spaces, and renewable toolkits.' },
  { title: 'Documentaries & Media', icon: Play, desc: 'High-end storytelling, podcasts, and video series documenting local solutions.' },
  { title: 'Open-Source Blueprints', icon: BookOpen, desc: 'Step-by-step guides, budgets, and material lists for other communities to use.' },
  { title: 'Workshops & Education', icon: Users, desc: 'Hands-on training, youth programs, and digital courses based on our builds.' },
  { title: 'Media Production Services', icon: Video, desc: 'Studio space, equipment, and production services for local creators and brands.' },
  { title: 'Prototyping & Incubation', icon: Hammer, desc: 'Engineering access to build solutions, plus business incubation to help creators launch them.' },
];
