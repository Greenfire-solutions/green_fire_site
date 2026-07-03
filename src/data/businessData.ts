import {
  Video, Scissors, Mic, Music, Palette, Image, Globe, Settings, Layout,
  Compass, Radio, Film, Bot, GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const servicesOffered: { title: string; icon: LucideIcon }[] = [
  { title: 'Video Production', icon: Video },
  { title: 'Video Editing', icon: Scissors },
  { title: 'Audio Recording', icon: Mic },
  { title: 'Song Production', icon: Music },
  { title: 'Music Production', icon: Radio },
  { title: 'Branding', icon: Palette },
  { title: 'Graphic Design', icon: Image },
  { title: 'Flyers', icon: Image },
  { title: 'Web Design', icon: Globe },
  { title: 'Tech Setup', icon: Settings },
  { title: 'UI Design', icon: Layout },
  { title: 'Creative Direction', icon: Compass },
  { title: 'Studio Recording', icon: Mic },
  { title: 'Cinematic Content Production', icon: Film },
  { title: 'Robot Arm Camera Movement', icon: Bot },
  { title: 'Workshops and Private Lessons', icon: GraduationCap },
];

export const servicePackages = [
  {
    title: 'Brand Starter Package',
    price: 'Custom quote',
    description: 'For artists, small businesses, events, and creative projects that need a clean identity and professional launch materials.',
    includes: ['Brand direction', 'Logo refinement', 'Graphics', 'Flyers', 'Social media assets', 'Website or landing page layout', 'UI design support', 'Promo content planning', 'Creative strategy'],
    bestFor: 'Artists launching a new project, small businesses needing better visuals, retreats, events, workshops, creators building a public identity.',
    cta: 'Book a Brand Starter Call',
    subject: 'Green Fire — Brand Starter Package',
  },
  {
    title: 'Music + Media Package',
    price: 'Custom quote',
    description: 'For musicians, producers, singers, rappers, DJs, and performance artists who need help creating the sound and visuals around a release.',
    includes: ['Audio recording', 'Vocal recording', 'Song production', 'Beat production', 'Music direction', 'Cover art', 'Promo flyers', 'Short-form video content', 'Music video planning', 'Release graphics', 'Landing page or website support', 'Social media content'],
    cta: 'Book a Music + Media Session',
    subject: 'Green Fire — Music + Media Package',
  },
  {
    title: 'Content Creation Package',
    price: 'Custom quote',
    description: 'For creators, brands, entrepreneurs, wellness leaders, educators, and small businesses that need video content, social media assets, or promotional materials.',
    includes: ['Video production', 'Video editing', 'Short-form reels', 'Promo videos', 'Interview content', 'Podcast-style clips', 'Graphics', 'Flyers', 'Audio cleanup', 'Simple motion graphics', 'Branding support', 'Content strategy'],
    cta: 'Book a Content Package',
    subject: 'Green Fire — Content Creation Package',
  },
  {
    title: 'Full Creative Launch Package',
    price: 'Custom quote',
    description: 'For people who want the whole thing built together: sound, visuals, branding, web, graphics, and launch strategy.',
    includes: ['Branding', 'Video production', 'Video editing', 'Audio recording', 'Song production', 'Graphics', 'Flyers', 'Web design', 'UI design', 'Tech setup', 'Creative direction', 'Social media content', 'Studio production', 'Campaign planning', 'Optional cinematic Bolt robot production in Utah'],
    cta: 'Build My Creative Launch',
    subject: 'Green Fire — Full Creative Launch Package',
  },
];

export const cinematicPackages = [
  {
    title: 'Signature Content',
    price: '$3,500',
    description: 'Half-day premium production for artists, brands, and campaigns that need polished cinematic visuals.',
    includes: ['Half-day production, up to 4 hours', 'Cinema camera and professional lighting', '2–3 edited videos, vertical or horizontal', 'Color grading and sound design', 'Simple motion graphics and text overlays', 'Creative direction to guide the shoot'],
    bestFor: 'Artists, small brands, product promos, social media content, event promotion, professional profile content, launch videos.',
    cta: 'Book Signature Content',
    subject: 'Green Fire — Signature Content ($3,500)',
  },
  {
    title: 'Cinematic Motion',
    price: '$7,500',
    description: 'Full-day production with Bolt robot operation for high-end brand and performance content.',
    includes: ['Full-day production, up to 8 hours', 'Bolt robot operation included', 'Advanced camera and lighting setup', '4–6 edited videos', 'Color grading and sound design', 'Shot planning', 'Product-focused storytelling', 'Slow-motion shots', 'Motion-controlled shots', 'Deliverables optimized for social media and ads'],
    bestFor: 'High-end brand content, product videos, music visuals, performance content, social ad campaigns, cinematic business promos, artists wanting premium visuals.',
    cta: 'Book Cinematic Motion',
    subject: 'Green Fire — Cinematic Motion ($7,500)',
  },
  {
    title: 'Full Campaign Production',
    price: '$12,000',
    description: 'Expanded creative direction and deliverables for full brand campaigns and major rollouts.',
    includes: ['Full-day production with expanded creative direction', 'Priority Bolt robot operation', 'Full camera and lighting package', '6–10 edited videos', 'Concept development', 'Shot planning', 'Color grading and sound design', 'Motion graphics and VFX as needed', 'Multi-platform deliverables for TikTok, Meta, web, and ads', 'Edits structured for performance'],
    bestFor: 'Full brand campaigns, music video campaigns, product launches, paid ad campaigns, major announcements, premium content rollouts, businesses needing a complete content library.',
    cta: 'Book Full Campaign',
    subject: 'Green Fire — Full Campaign Production ($12,000)',
  },
];

export const cinematicAddons = [
  'Additional edited video: $600 each',
  'Additional shoot day: $3,000',
  'Raw footage delivery: available by request',
  '24–48 hour rush turnaround: available by request',
  'Travel, lodging, and location production: custom quoted',
];

export const combinedPackages = [
  {
    title: 'Artist Content Day',
    description: 'For artists who need a strong batch of content in one focused session.',
    includes: 'Studio recording, performance video, short-form clips, promo graphics, cover art direction, flyers, editing, release content planning, and optional cinematic Bolt robot production in Utah.',
  },
  {
    title: 'Business Media Day',
    description: 'For small businesses, coaches, wellness brands, and entrepreneurs who need better media.',
    includes: 'Branding, promo video, website support, graphics, flyers, interview content, social media clips, editing, content strategy, and optional travel-based production.',
  },
  {
    title: 'Music Video + Release Build',
    description: 'For artists who want the song, visuals, and rollout to feel connected.',
    includes: 'Song production, recording, video shoot, editing, cover art, promo graphics, reels and shorts, landing page, release strategy, and optional cinematic robot arm shots in Utah.',
  },
  {
    title: 'Workshop + Studio Build',
    description: 'For people who want to learn while creating a finished project.',
    includes: 'Private lessons, studio time, guided project build, video editing lessons, music production lessons, branding lessons, website lessons, and final deliverable review.',
  },
];

export const studioSessions = [
  'Audio recording', 'Video recording', 'Music production', 'Podcast-style recording',
  'Content creation', 'Brand shoots', 'Creative direction', 'Editing sessions',
  'Design sessions', 'Private lessons', 'Workshops',
];

export const workshopTopics = [
  'Video production', 'Video editing', 'Audio recording', 'Song production',
  'Music production', 'Branding', 'Graphic design', 'Flyer design', 'Web design',
  'Tech setup', 'UI design', 'Content creation', 'Creative workflow',
  'Release planning', 'Studio recording', 'Media business setup',
];

export const workshopAudiences = [
  'Artists', 'Musicians', 'Small business owners', 'Youth programs',
  'Community groups', 'Schools', 'Creative entrepreneurs', 'Wellness practitioners',
  'People who want to learn by making something real',
];

export const utahBoltIdealFor = [
  'Music videos', 'Product videos', 'Brand campaigns', 'Performance visuals',
  'Social media ads', 'Cinematic promos', 'Launch campaigns', 'High-end artist content',
  'Experimental creative shoots',
];

export const bookingOptions = [
  'A media package', 'A cinematic production package', 'A studio session',
  'A music production session', 'A content day', 'A workshop', 'A private lesson',
  'A Utah Bolt robot production session', 'A full creative launch package',
];

export const projectTypes = [
  'Brand Starter Package', 'Music + Media Package', 'Content Creation Package',
  'Full Creative Launch Package', 'Signature Content ($3,500)', 'Cinematic Motion ($7,500)',
  'Full Campaign Production ($12,000)', 'Studio Session', 'Workshop / Private Lesson',
  'Utah Bolt Production', 'Community / Program Collaboration', 'Other',
];

export const interestAreas = [
  'Media production', 'Music', 'Branding', 'Web design', 'Workshops', 'Cinematic production',
];
