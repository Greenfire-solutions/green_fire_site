import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Users, Hammer, Heart, Music, Video, Calendar, Mail, ArrowRight, Sprout, 
  CheckCircle2, Inbox, Search, Network, Cpu, BookOpen, Coins, Map, 
  Shield, CheckSquare, Award, BatteryCharging, Wrench, Play, ArrowLeft, 
  ChevronDown, Swords, Zap, Star, Trophy, Target, Sparkles, Plus,
  ClipboardList, Handshake, TreePine, DollarSign, Loader2
} from 'lucide-react';
import { CONTACT_EMAIL } from './lib/email';
import { ContactProvider, ContactButton, useContact } from './components/ContactProvider';

type Page = 'home' | 'map';

const homeSectors = [
  { title: 'Innovation Lab', icon: Hammer, description: 'A hands-on prototyping space for fabrication, regenerative builds, and engineering physical solutions to real-world community challenges.' },
  { title: 'Media Hub', icon: Video, description: 'A high-end media studio that documents the build process, turning local innovations into teachable stories, podcasts, and documentaries.' },
  { title: 'Creative Studio', icon: Music, description: 'A cultural hub for artist collaboration, music production, and storytelling that provides the creative heartbeat for our projects.' },
  { title: 'Wellness & Resilience', icon: Heart, description: 'Core human infrastructure offering nervous-system regulation, integration, and care to ensure our builders and creators avoid burnout.' },
];

const systemNodes = [
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

const intakeCategories = ['Youth education needs', 'Food and garden needs', 'Wellness and mental health', 'Housing and land needs', 'Local business support', 'Art and culture needs', 'Media and storytelling', 'Technology needs', 'Environmental challenges', 'Community conflict or repair', 'Event and gathering needs', 'Tool, repair, or maker needs'];
const councilCriteria = ['Community impact', 'Urgency', 'Feasibility', 'Available team', 'Funding potential', 'Educational value', 'Media/story value', 'Regenerative value', 'Replication potential'];

const researchSteps = ['Community interviews', 'Existing solution research', 'Local data gathering', 'Cost estimates', 'Materials lists', 'Case studies', 'Expert interviews', 'Funding research', 'Safety and legal requirements', 'Timeline planning', 'Documentation needs'];
const collaborationRoles = ['Project steward', 'Research lead', 'Builder/maker', 'Media lead', 'Wellness steward', 'Artist/storyteller', 'Youth educator', 'Finance/grant lead', 'Community liaison', 'Volunteer coordinator'];

const projectLevels = [
  { level: 1, title: 'Intake' }, { level: 2, title: 'Research' }, { level: 3, title: 'Council' },
  { level: 4, title: 'Team' }, { level: 5, title: 'Prototype' }, { level: 6, title: 'Test' },
  { level: 7, title: 'Document' }, { level: 8, title: 'Event' }, { level: 9, title: 'Fund' }, { level: 10, title: 'Scale' }
];

const hubsData = [
  {
    title: 'Art & Music Hub', icon: Music, color: 'emerald',
    purpose: 'Creates culture, beauty, ceremony, entertainment, emotional expression, youth showcases, performances, sound healing, and musical identity for the movement.',
    activities: ['Live music', 'Recording', 'DJ classes', 'Sound healing', 'Artist residencies', 'Youth showcases', 'Songwriting circles', 'Festival programming'],
    outputs: ['Songs', 'Performances', 'Albums', 'Sound baths', 'Cultural events', 'Music videos', 'Public inspiration'],
    income: ['Studio sessions', 'Concert tickets', 'Music classes', 'Sound healing events', 'Artist memberships', 'Music licensing']
  },
  {
    title: 'Media Hub', icon: Video, color: 'orange',
    purpose: 'Documents the work, tells the story, produces content, creates education, builds public trust, and turns community solutions into media that can travel.',
    activities: ['Podcasts', 'Interviews', 'Documentaries', 'Social media', 'Livestreaming', 'Courses', 'Photography', 'Impact reports'],
    outputs: ['Podcast episodes', 'Short-form videos', 'Documentaries', 'Online courses', 'Social campaigns', 'Event recaps', 'Donor reports'],
    income: ['Podcast production', 'Video packages', 'Course sales', 'Sponsorships', 'YouTube revenue', 'Livestream packages', 'Content memberships']
  },
  {
    title: 'Maker Space', icon: Hammer, color: 'amber',
    purpose: 'Builds the physical and digital solutions that come from the Council and Research process.',
    activities: ['Prototyping', 'Repairs', 'Tool education', '3D printing', 'Woodworking', 'Fabrication', 'Regenerative infrastructure', 'Youth STEM'],
    outputs: ['Prototypes', 'Repairs', 'Toolkits', 'Furniture', 'Garden infrastructure', 'Art installations', 'Educational kits'],
    income: ['Maker memberships', 'Tool classes', 'Custom fabrication', 'Repair events', 'Product prototyping', 'Sponsored challenges']
  },
  {
    title: 'Wellness Hub', icon: Heart, color: 'rose',
    purpose: 'Supports the health, regulation, emotional safety, and resilience of the people doing the work.',
    activities: ['Yoga', 'Breathwork', 'Sound healing', 'Somatic work', 'Integration circles', 'Bodywork', 'Conflict repair', 'Community care'],
    outputs: ['Wellness sessions', 'Restorative circles', 'Integration support', 'Health education', 'Care protocols', 'Community repair practices'],
    income: ['Wellness memberships', 'Drop-in classes', 'Private sessions', 'Retreats', 'Practitioner room rental', 'Herbal product sales']
  }
];

const materialsData = [
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

const economicEngineData = [
  { category: 'Memberships', items: ['Community membership', 'Creator membership', 'Maker membership', 'Wellness membership', 'Full Green Fire membership', 'Founding patron membership'] },
  { category: 'Events', items: ['Concerts', 'Markets', 'Speaker nights', 'Council nights', 'Festivals', 'Showcases', 'Fundraisers', 'Retreats'] },
  { category: 'Education', items: ['Workshops', 'Online courses', 'Youth camps', 'Certifications', 'Apprenticeships', 'Homeschool programs', 'Corporate trainings'] },
  { category: 'Media', items: ['Podcasts', 'Video production', 'Sponsorships', 'YouTube revenue', 'Livestreaming', 'Documentary work', 'Local business storytelling'] },
  { category: 'Maker / Innovation', items: ['Prototyping', 'Fabrication', 'Repairs', 'Product development', 'Tool classes', 'Build workshops', 'Sponsored challenges'] },
  { category: 'Wellness', items: ['Classes', 'Private sessions', 'Sound baths', 'Breathwork', 'Retreats', 'Practitioner rentals', 'Herbal products'] },
  { category: 'Grants & Donations', items: ['Youth education grants', 'Arts grants', 'Climate grants', 'Workforce development', 'Community health', 'STEM'] },
  { category: 'Products', items: ['Music', 'Merch', 'Journals', 'Toolkits', 'Herbal goods', 'Education kits', 'Digital downloads', 'Art prints'] }
];

const rolesData = [
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

const metrics = [
  { label: 'Needs Submitted', value: '142', icon: Inbox },
  { label: 'Active Projects', value: '18', icon: CheckSquare },
  { label: 'Volunteers', value: '350+', icon: Users },
  { label: 'Youth Served', value: '1,200', icon: Sprout },
  { label: 'Workshops', value: '84', icon: BookOpen },
  { label: 'Media Pieces', value: '450', icon: Play },
  { label: 'Prototypes', value: '32', icon: Cpu },
  { label: 'Wellness Hours', value: '2,100', icon: Heart },
];

const SectionLabel = ({ text, color = 'emerald' }) => (
  <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] text-${color}-400`}>{text}</p>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">{title}</h2>
);

const XPChip = ({ points }) => (
  <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 font-mono shadow-[0_0_10px_rgba(52,211,153,0.15)]">
    +{points} XP
  </span>
);

function Home({ navigate }: { navigate: (page: Page) => void }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const { submitMessage, isSubmitting, contactPrefill, clearContactPrefill } = useContact();

  const [editableData, setEditableData] = useState({
    songs: [], posts: [], shows: [], merch: [], courses: [], expenses: [], income: []
  });

  const handleAddData = (category, type) => {
    const newItem = { id: Date.now(), title: `New ${type} ${editableData[category].length + 1}`, timestamp: new Date().toLocaleTimeString() };
    setEditableData(prev => ({ ...prev, [category]: [...prev[category], newItem] }));
  };

  useEffect(() => { 
    window.scrollTo(0, 0); 
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  useEffect(() => {
    if (!contactPrefill) return;
    setForm((prev) => ({
      ...prev,
      message: contactPrefill.message,
    }));
    clearContactPrefill();
  }, [contactPrefill, clearContactPrefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitMessage({
      name: form.name,
      email: form.email,
      subject: `Green Fire — message from ${form.name || 'website visitor'}`,
      message: form.message,
    });
    if (ok) {
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-100 pb-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          
          <nav className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="rounded-full bg-emerald-500/10 p-3 ring-1 ring-emerald-400/30 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:ring-emerald-400/50">
                <Flame className="h-8 w-8 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold tracking-wide">Green Fire</span>
            </div>
            <div className="hidden items-center gap-8 text-sm font-medium text-stone-300 md:flex">
              <a href="#mission" className="transition-colors hover:text-emerald-300">Mission</a>
              <a href="#sectors" className="transition-colors hover:text-emerald-300">Sectors</a>
              <a href="#contact" className="transition-colors hover:text-emerald-300">Contact</a>
              <button onClick={() => navigate('map')} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-1.5 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Map className="h-4 w-4" /> System Map
              </button>
            </div>
          </nav>
          {/* Hero Content */}
          <div className="grid gap-12 py-24 md:grid-cols-[1.2fr_0.8fr] md:items-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="mb-6 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-emerald-300 backdrop-blur-sm">
                Solution Design • Innovation Lab • Media Hub
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
                An innovation lab and media hub building what comes next.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">
                Green Fire turns real community problems into working prototypes and high-impact media. We are a rapid-response laboratory designed to design, build, document, and scale regenerative solutions.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <ContactButton
                  subject="Green Fire — Become a Founding Member"
                  body="Hi Green Fire team,\n\nI'm interested in becoming a founding member.\n\n"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-8 py-4 text-base font-semibold text-neutral-950 transition-all hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                >
                  Become a Founding Member <ArrowRight className="ml-2 h-5 w-5" />
                </ContactButton>
                <button onClick={() => navigate('map')} className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-neutral-900/50 px-8 py-4 text-base font-semibold text-emerald-100 transition-all hover:bg-neutral-800 backdrop-blur-sm">
                  Explore System Map
                </button>
              </div>
            </motion.div>
            {/* Hero Visual Card */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
              <div className="rounded-[2.5rem] border border-emerald-500/20 bg-neutral-900/40 p-2 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl">
                <div className="rounded-[2rem] bg-neutral-950/80 p-8">
                  <div className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-emerald-900/20 to-orange-400/10 p-8 ring-1 ring-white/10">
                    <Cpu className="mb-6 h-12 w-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                    <h2 className="text-2xl font-semibold text-white">The Innovation Engine</h2>
                    <p className="mt-4 leading-relaxed text-stone-300">
                      We identify the need, prototype the physical solution, and document the journey. Some solutions become open-source blueprints for the community; others enter our incubator to launch new creator-led businesses.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-stone-300">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <Search className="h-5 w-5 text-emerald-400/70" /> Solution Research
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <Hammer className="h-5 w-5 text-emerald-400/70" /> Rapid Prototyping
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <Video className="h-5 w-5 text-emerald-400/70" /> Media & Storytelling
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <Sprout className="h-5 w-5 text-emerald-400/70" /> Scalable Models
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="mx-auto max-w-7xl px-6 py-32 scroll-mt-20">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">Mission</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl leading-[1.1]">
            Gather the people. Name the problem. Build the solution. Share the model.
          </h2>
          <p className="mt-8 text-xl leading-relaxed text-stone-400 max-w-3xl">
            Green Fire operates as a rapid-response innovation engine. We don't just talk about change; we physically build working solutions and use high-end media production to turn localized projects into open-source models for the community, or incubate them into sustainable businesses led by local creators.
          </p>
        </div>
      </section>

      {/* Process & Offerings Section */}
      <section className="border-t border-white/5 bg-neutral-950 py-32">
        <div className="mx-auto max-w-7xl px-6">
          
          {/* Part 1: The Process */}
          <div className="mb-32">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">The Methodology</p>
            <h2 className="mb-16 text-3xl font-semibold tracking-tight text-white md:text-5xl">How a problem becomes a model.</h2>
            <div className="grid gap-12 md:grid-cols-4 relative">
              <div className="hidden md:block absolute top-8 left-12 right-12 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />
              {[
                { step: '01', title: 'Listen & Align', icon: Search, desc: 'We source real, pressing needs from the community and align teams around them.' },
                { step: '02', title: 'Build & Prototype', icon: Hammer, desc: 'Our makers and engineers design and fabricate physical or digital solutions.' },
                { step: '03', title: 'Capture the Story', icon: Video, desc: 'The media hub films the build process, turning the journey into premium media.' },
                { step: '04', title: 'Scale & Incubate', icon: Network, desc: 'We open-source blueprints for community replication, or incubate the project into a creator-led business.' }
              ].map((item) => (
                <div key={item.step} className="relative z-10 flex flex-col items-start md:items-center md:text-center group">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-950 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] text-emerald-400 transition-all group-hover:scale-110 group-hover:border-emerald-400/50 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Part 2: The Offerings */}
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">Our Outputs</p>
            <h2 className="mb-12 text-3xl font-semibold tracking-tight text-white md:text-5xl">What we deliver to the community.</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {[
                 { title: 'Regenerative Infrastructure', icon: TreePine, desc: 'Physical builds like community gardens, wellness spaces, and renewable toolkits.' },
                 { title: 'Documentaries & Media', icon: Play, desc: 'High-end storytelling, podcasts, and video series documenting local solutions.' },
                 { title: 'Open-Source Blueprints', icon: BookOpen, desc: 'Step-by-step guides, budgets, and material lists for other communities to use.' },
                 { title: 'Workshops & Education', icon: Users, desc: 'Hands-on training, youth programs, and digital courses based on our builds.' },
                 { title: 'Media Production Services', icon: Video, desc: 'Studio space, equipment, and production services for local creators and brands.' },
                 { title: 'Prototyping & Incubation', icon: Wrench, desc: 'Engineering access to build solutions, plus business incubation to help creators launch them.' }
               ].map(offering => (
                 <div key={offering.title} className="rounded-2xl border border-white/5 bg-neutral-900/30 p-8 transition-all hover:bg-neutral-900 hover:border-white/10">
                   <offering.icon className="mb-5 h-8 w-8 text-stone-500" />
                   <h3 className="mb-3 text-lg font-bold text-white">{offering.title}</h3>
                   <p className="text-sm leading-relaxed text-stone-400">{offering.desc}</p>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* Sectors Section */}
      <section id="sectors" className="border-y border-white/5 bg-neutral-900/30 py-32 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">Four Sectors</p>
              <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">The Green Fire ecosystem</h2>
            </div>
            <p className="max-w-xl text-lg text-stone-400 leading-relaxed md:text-right">
              Each sector stands alone, but together they form a complete engine for culture, education, healing, invention, and public storytelling.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homeSectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <div key={sector.title} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/50 p-8 transition-all hover:bg-neutral-900 hover:border-emerald-500/30">
                  <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                    <Icon className="h-32 w-32 text-emerald-500 transform rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-emerald-400/10 p-4 ring-1 ring-emerald-400/20 text-emerald-400">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-white">{sector.title}</h3>
                    <p className="leading-relaxed text-stone-400">{sector.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-emerald-900/40 bg-neutral-950 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.15),transparent_40%)] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Ready to build the future?</h2>
          <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you have a community problem to solve, an invention to incubate, or the skills to help us build, there is a place for you in the circle.
          </p>
          <ContactButton
            subject="Green Fire — Join Us"
            body="Hi Green Fire team,\n\nI'd like to join and contribute.\n\n"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-10 py-5 text-lg font-bold text-neutral-950 transition-all hover:bg-emerald-300 hover:scale-105 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
          >
            Join Us <ArrowRight className="ml-2 h-6 w-6" />
          </ContactButton>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="border-b border-emerald-900/40 bg-neutral-950 py-24 scroll-mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-2xl px-6 z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20 mb-6">
              <Mail className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Reach Out</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Get in touch</h2>
            <p className="text-stone-400 leading-relaxed">
              Share a community need, partnership idea, or how you&apos;d like to help build Green Fire.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-2xl backdrop-blur-sm">
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                id="contact-name"
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
              <input
                id="contact-email"
                type="email"
                required
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
            <textarea
              id="contact-message"
              required
              rows={5}
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-y min-h-[120px]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-8 py-4 text-base font-bold text-neutral-950 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Send Message <Mail className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-stone-500">
              Messages are delivered to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                {CONTACT_EMAIL}
              </a>
            </p>
          </form>
        </div>
      </section>

      <section className="border-b border-emerald-900/40 bg-neutral-900/30 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 z-10">
          <div className="mb-10 text-center">
            <SectionLabel text="Beta Feature" color="emerald" />
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Creator Data Management</h2>
            <p className="text-stone-400 text-sm max-w-2xl mx-auto">
              Add and manage real editable data for your media hub, events, and economic engine.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button onClick={() => handleAddData('songs', 'Song')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-emerald-500/30 px-5 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <Music className="h-4 w-4" /> Add Song
            </button>
            <button onClick={() => handleAddData('posts', 'Post')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-orange-500/30 px-5 py-3 text-sm font-bold text-orange-400 hover:bg-orange-500/10 transition-all shadow-[0_0_15px_rgba(251,146,60,0.1)]">
              <ClipboardList className="h-4 w-4" /> Add Post
            </button>
            <button onClick={() => handleAddData('shows', 'Show')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-purple-500/30 px-5 py-3 text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Calendar className="h-4 w-4" /> Add Show
            </button>
            <button onClick={() => handleAddData('merch', 'Merch Item')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-amber-500/30 px-5 py-3 text-sm font-bold text-amber-400 hover:bg-amber-500/10 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Sparkles className="h-4 w-4" /> Add Merch Item
            </button>
            <button onClick={() => handleAddData('courses', 'Course')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-cyan-500/30 px-5 py-3 text-sm font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <BookOpen className="h-4 w-4" /> Add Course
            </button>
            <button onClick={() => handleAddData('expenses', 'Expense')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-rose-500/30 px-5 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <DollarSign className="h-4 w-4" /> Add Expense
            </button>
            <button onClick={() => handleAddData('income', 'Income')} className="flex items-center gap-2 rounded-xl bg-neutral-950 border border-emerald-500/50 px-5 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <Coins className="h-4 w-4" /> Add Income
            </button>
          </div>

          {/* Data Display */}
          {Object.values(editableData).some(arr => arr.length > 0) && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(editableData).map(([category, items]) => (
                items.length > 0 && (
                  <div key={category} className="rounded-2xl border border-white/5 bg-neutral-950 p-5 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center justify-between">
                      {category} <span className="bg-white/5 px-2 py-0.5 rounded text-stone-400">{items.length}</span>
                    </h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      <AnimatePresence>
                        {items.slice().reverse().map(item => (
                          <motion.li 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            key={item.id} 
                            className="text-sm bg-neutral-900/50 border border-white/5 p-3 rounded-xl flex justify-between items-center text-stone-300"
                          >
                            <span>{item.title}</span>
                            <span className="text-[10px] text-stone-500 font-mono">{item.timestamp}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-12 text-center text-sm text-stone-500">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Flame className="h-6 w-6 text-emerald-500/50" />
            <span className="text-lg font-semibold text-stone-300 tracking-wide">Green Fire</span>
          </div>
          <p className="uppercase tracking-widest text-xs font-bold text-emerald-500/50 mb-6">Gather • Build • Heal • Document • Teach • Repeat</p>
          <p className="mb-4">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400/80 hover:text-emerald-300 transition-colors inline-flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
            </a>
          </p>
          <p>© {new Date().getFullYear()} Green Fire Research and Innovation Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function InnovationMap({ navigate }: { navigate: (page: Page) => void }) {
  const [activeNode, setActiveNode] = useState(systemNodes[0]);
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [showGameMechanics, setShowGameMechanics] = useState(false); 

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Map Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <button onClick={() => navigate('home')} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white tracking-wide text-sm hidden sm:block">Green Fire OS Map</span>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 border-b border-emerald-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <SectionLabel text="The Operating System" />
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight text-white">
            From Community Need to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">Regenerative Solution.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-400 leading-relaxed mb-8 max-w-3xl mx-auto">
            Green Fire uses council, research, collaboration, gamification, media, making, wellness, and education to transform real community problems into funded projects, public stories, working prototypes, and repeatable models.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-stone-300 mb-10 bg-neutral-900/50 inline-flex p-2 rounded-2xl border border-white/5 shadow-inner">
            <span className="px-3 py-1 bg-neutral-950 rounded-xl flex items-center gap-2 border border-white/5"><ArrowRight className="h-3 w-3 text-emerald-400" /> Problem → Project</span>
            <span className="px-3 py-1 bg-neutral-950 rounded-xl flex items-center gap-2 border border-white/5"><ArrowRight className="h-3 w-3 text-orange-400" /> Project → Story</span>
            <span className="px-3 py-1 bg-neutral-950 rounded-xl flex items-center gap-2 border border-white/5"><ArrowRight className="h-3 w-3 text-cyan-400" /> Story → Education</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <ContactButton
              subject="Green Fire — Submit a Community Need"
              body="Hi Green Fire team,\n\nI'd like to submit a community need.\n\nProblem or opportunity:\n\nWhat help is needed:\n\n"
              className="rounded-xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300 transition-colors shadow-[0_0_20px_rgba(52,211,153,0.2)]"
            >
              Submit a Need
            </ContactButton>
            <ContactButton
              subject="Green Fire — Join Founding Circle"
              body="Hi Green Fire team,\n\nI'd like to join the founding circle.\n\n"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Join Founding Circle
            </ContactButton>
            <button onClick={() => document.getElementById('system-map').scrollIntoView({behavior: 'smooth'})} className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors">Explore Map</button>
          </div>
        </div>
      </section>

      {/* 2. Interactive System Map */}
      <section id="system-map" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <SectionLabel text="Interactive Blueprint" color="cyan" />
            <SectionTitle title="The Living System Map" />
            <p className="text-stone-400 max-w-2xl mx-auto text-sm">
              Click any node to explore how this circular system transforms community input into regenerative output.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 bg-neutral-900/30 border border-white/5 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative rounded-3xl bg-neutral-950 border border-white/5 p-6 flex flex-col justify-center min-h-[400px] shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                 {systemNodes.map((node) => (
                   <button
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border transition-all ${activeNode.id === node.id ? `bg-neutral-900 border-${node.color.split('-')[1]}-400 shadow-lg scale-[1.02] ring-1 ring-${node.color.split('-')[1]}-400/50` : 'bg-neutral-950 border-white/5 hover:border-white/20'}`}
                   >
                     <div className={`mb-3 p-3 rounded-xl ${node.bg} ${node.color}`}><node.icon className="h-6 w-6" /></div>
                     <span className="text-xs font-bold uppercase tracking-wide text-stone-200">{node.title}</span>
                   </button>
                 ))}
              </div>
            </div>

            <div className="rounded-3xl bg-neutral-950 border border-white/5 p-8 flex flex-col justify-center relative shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl" />
              <div className={`inline-flex rounded-xl ${activeNode.bg} p-3 mb-6 self-start ring-1 ${activeNode.ring} relative z-10`}>
                <activeNode.icon className={`h-8 w-8 ${activeNode.color}`} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10">{activeNode.title}</h3>
              <p className="text-stone-400 leading-relaxed text-base mb-8 relative z-10">{activeNode.desc}</p>
              <div className="mt-auto pt-6 border-t border-white/5 relative z-10">
                <p className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-2"><Network className="h-3 w-3"/> System Flow</p>
                <p className="text-xs text-stone-400 leading-relaxed">Outputs feed directly into the next regenerative phase. Wellness, Art, and Media support every stage.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Community Intake Flow */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel text="Phase 1: Input" color="blue" />
              <SectionTitle title="Community Intake" />
              <p className="text-lg text-stone-300 leading-relaxed mb-6">
                Green Fire begins by listening. Community members, organizations, artists, schools, and local businesses submit needs, ideas, problems, or opportunities.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {intakeCategories.map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-xs font-medium text-stone-400">{cat}</span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-8 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/> Live Form Preview
              </div>
              <div className="space-y-4 opacity-80">
                <div className="space-y-4 pointer-events-none">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center px-4"><span className="text-stone-500 text-sm">Name</span></div>
                    <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center px-4"><span className="text-stone-500 text-sm">Email</span></div>
                  </div>
                  <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex pt-4 px-4"><span className="text-stone-500 text-sm">What problem or opportunity are you bringing?</span></div>
                  <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center px-4"><span className="text-stone-500 text-sm">What help is needed?</span></div>
                  <div className="flex gap-2">
                     <div className="h-10 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center text-blue-400 text-sm font-medium"><Plus className="h-4 w-4 mr-1"/> Upload Docs/Photos</div>
                  </div>
                </div>
                <ContactButton
                  subject="Green Fire — Submit a Community Need"
                  body="Hi Green Fire team,\n\nI'd like to submit a community need.\n\n"
                  className="w-full h-12 rounded-xl bg-blue-500/20 text-blue-400 font-bold mt-2 border border-blue-500/30 flex items-center justify-center"
                >
                  Submit Need
                </ContactButton>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-xs font-bold uppercase text-stone-500 mb-3">Intake Outputs</p>
                <div className="flex flex-wrap gap-2">
                   {['Project Proposal', 'Council Agenda Item', 'Media Story Lead', 'Grant Opportunity'].map(o => (
                     <span key={o} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-stone-300">{o}</span>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Council & Prioritization Model */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-6xl">
           <div className="text-center mb-16">
            <SectionLabel text="Phase 2: Alignment" color="orange" />
            <SectionTitle title="Council Core: Where the Community Decides" />
            <p className="text-stone-400 max-w-2xl mx-auto text-lg leading-relaxed">
              The Council is the heart of Green Fire. It reviews incoming needs, aligns them with the mission, and decides what becomes a project, a workshop, or a long-term initiative.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-8">
             <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-8">
               <Users className="h-10 w-10 text-orange-400 mb-6"/>
               <h3 className="text-2xl font-bold text-white mb-4">Core Questions</h3>
               <ul className="space-y-4 text-sm text-stone-300">
                 <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/> Is this aligned with our mission?</li>
                 <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/> Who needs to be in the room?</li>
                 <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/> What is the smallest useful prototype?</li>
                 <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/> Can this become a repeatable model?</li>
                 <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/> Is there a funding pathway?</li>
               </ul>
             </div>
             
             <div>
               <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 text-center md:text-left">Scoring Criteria Model</h4>
               <div className="grid sm:grid-cols-3 gap-3 mb-8">
                 {councilCriteria.map((c, i) => (
                   <div key={c} className="bg-neutral-950 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-colors">
                     <span className="text-xs font-bold text-stone-300">{c}</span>
                     <div className="flex gap-1">
                       {[1,2,3].map(dot => <div key={dot} className={`w-1.5 h-1.5 rounded-full ${i%2===0 && dot===3 ? 'bg-white/10' : 'bg-orange-400/50 group-hover:bg-orange-400 transition-colors'}`}/>)}
                     </div>
                   </div>
                 ))}
               </div>

               <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl">
                 <p className="text-xs font-bold uppercase text-stone-500 mb-3">Potential Outcomes</p>
                 <div className="flex flex-wrap gap-2">
                   {['Immediate action', 'Research project', 'Workshop', 'Maker prototype', 'Youth program', 'Long-term initiative'].map(outcome => (
                     <span key={outcome} className="px-3 py-1.5 bg-neutral-950 border border-white/5 rounded-lg text-xs font-medium text-stone-300">{outcome}</span>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Research + Collaboration Framework */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/20">
         <div className="mx-auto max-w-6xl">
           <div className="mb-12">
             <SectionLabel text="Phase 3: Formation" color="purple" />
             <SectionTitle title="Research & Collaboration" />
             <p className="text-stone-400 max-w-2xl text-lg leading-relaxed mb-8">
               Once approved, Research clarifies the problem. Then, interdisciplinary teams form around it.
             </p>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
             <div className="rounded-[2rem] border border-white/5 bg-neutral-950 p-8 shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                 <Search className="h-6 w-6 text-purple-400"/>
                 <h3 className="text-xl font-bold text-white">Research Focus</h3>
               </div>
               <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-400">
                 {researchSteps.map(step => (
                   <li key={step} className="flex items-start gap-1.5"><span className="text-purple-500 mt-0.5">•</span> {step}</li>
                 ))}
               </ul>
             </div>

             <div className="rounded-[2rem] border border-white/5 bg-neutral-950 p-8 shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                 <Network className="h-6 w-6 text-emerald-400"/>
                 <h3 className="text-xl font-bold text-white">Team Formation</h3>
               </div>
               <div className="flex flex-wrap gap-2 mb-6">
                 {collaborationRoles.slice(0,8).map(role => (
                   <span key={role} className="text-[11px] bg-neutral-900 border border-white/10 px-2.5 py-1.5 rounded-lg text-stone-300">{role}</span>
                 ))}
               </div>
               <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                 <p className="text-sm text-emerald-100 font-medium italic">"No one has to solve the whole problem alone. Green Fire breaks the problem into quests, roles, tasks, and visible steps."</p>
               </div>
             </div>
           </div>
         </div>
      </section>

      {/* 6. Gamified System (Existing + Expanded Deep Dive) */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-950">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
             <SectionLabel text="Phase 3 & 4: Teams & Quests" color="emerald" />
             <SectionTitle title="Gamified Collaboration" />
             <p className="text-stone-400 max-w-2xl mx-auto text-sm">
               We break massive problems into quests, roles, tasks, and visible steps so anyone can contribute their specific skills without burning out.
             </p>
          </div>

          {/* Existing Gamified Collaboration Content */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-[2rem] p-8 mb-8 shadow-inner">
            <h4 className="text-sm font-bold uppercase text-emerald-400 mb-6 text-center tracking-widest">Project Progression</h4>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
               {projectLevels.map((lvl) => (
                 <div key={lvl.level} className="flex flex-col items-center gap-2 w-16 md:w-20 group">
                   <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${lvl.level <= 5 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-neutral-950 text-stone-500 border-white/10 group-hover:border-white/30'}`}>
                     {lvl.level}
                   </div>
                   <span className="text-[10px] font-bold uppercase text-center text-stone-400">{lvl.title}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 shadow-lg">
               <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400"/> The Four Guilds</h4>
               <ul className="space-y-3 text-sm text-stone-400">
                 <li className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-white/5"><strong className="text-orange-400">Fire:</strong> <span>Leadership, action, events</span></li>
                 <li className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-white/5"><strong className="text-rose-400">Water:</strong> <span>Wellness, care, emotional process</span></li>
                 <li className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-white/5"><strong className="text-amber-400">Earth:</strong> <span>Land, food, building, physical systems</span></li>
                 <li className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-white/5"><strong className="text-cyan-400">Air:</strong> <span>Media, education, tech</span></li>
               </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 shadow-lg">
               <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-emerald-400"/> Contribution Rewards</h4>
               <div className="flex flex-wrap gap-2">
                 {['Badges', 'Studio Time', 'Maker Access', 'Credits', 'Paid Roles', 'Residencies', 'Portfolio Proof', 'Mentorships', 'Free Classes'].map(r => (
                   <span key={r} className="px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-xs font-medium text-stone-300 hover:border-emerald-500/30 transition-colors cursor-default">{r}</span>
                 ))}
               </div>
            </div>
          </div>

          {/* EXPANSION TOGGLE */}
          <div className="flex justify-center mb-10">
            <button 
              onClick={() => setShowGameMechanics(!showGameMechanics)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-8 py-4 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all focus:outline-none shadow-[0_0_20px_rgba(52,211,153,0.1)]"
            >
              <Swords className="h-5 w-5" />
              {showGameMechanics ? "Hide Game Mechanics Dashboard" : "Explore Game Mechanics Dashboard"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showGameMechanics ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* EXPANDED RPG/QUEST DASHBOARD */}
          <AnimatePresence>
            {showGameMechanics && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-white/10 space-y-24 pb-10">
                  
                  {/* 1. How Points Are Earned */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-500/20 rounded-xl"><Star className="h-6 w-6 text-orange-400"/></div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">Earn Points by Contributing</h3>
                    </div>
                    <p className="text-stone-400 text-base mb-8 max-w-3xl leading-relaxed">Green Fire members earn points by showing up, completing quests, collaborating across guilds, documenting proof of work, and helping projects become useful, fundable, and repeatable.</p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Basic Actions */}
                      <div className="rounded-2xl bg-neutral-900/40 border border-white/5 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2"><Target className="h-3 w-3"/> Basic Actions</h4>
                        <ul className="space-y-3 text-sm text-stone-300">
                          <li className="flex justify-between items-center">Attend council <XPChip points={5}/></li>
                          <li className="flex justify-between items-center">Submit a need <XPChip points={10}/></li>
                          <li className="flex justify-between items-center">Join project team <XPChip points={15}/></li>
                          <li className="flex justify-between items-center">Complete a task <XPChip points={25}/></li>
                          <li className="flex justify-between items-center">Lead a task <XPChip points={40}/></li>
                          <li className="flex justify-between items-center">Complete phase <XPChip points={75}/></li>
                          <li className="flex justify-between items-center">Help finish project <XPChip points={150}/></li>
                        </ul>
                      </div>
                      {/* Proof of Work */}
                      <div className="rounded-2xl bg-neutral-900/40 border border-white/5 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2"><ClipboardList className="h-3 w-3"/> Proof of Work</h4>
                        <ul className="space-y-3 text-sm text-stone-300">
                          <li className="flex justify-between items-center">Photo proof <XPChip points={5}/></li>
                          <li className="flex justify-between items-center">Video proof <XPChip points={10}/></li>
                          <li className="flex justify-between items-center">Field notes <XPChip points={10}/></li>
                          <li className="flex justify-between items-center">Before/after doc <XPChip points={20}/></li>
                          <li className="flex justify-between items-center">Project recap <XPChip points={30}/></li>
                          <li className="flex justify-between items-center">Case study <XPChip points={75}/></li>
                        </ul>
                      </div>
                      {/* Collab Bonuses */}
                      <div className="rounded-2xl bg-neutral-900/40 border border-white/5 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2"><Handshake className="h-3 w-3"/> Collab Bonuses</h4>
                        <ul className="space-y-3 text-sm text-stone-300">
                          <li className="flex justify-between items-center">Work with 1 guild <XPChip points={25}/></li>
                          <li className="flex justify-between items-center">2-guild collab <XPChip points={50}/></li>
                          <li className="flex justify-between items-center">3-guild collab <XPChip points={100}/></li>
                          <li className="flex justify-between items-center">4-guild collab <XPChip points={200}/></li>
                          <li className="flex justify-between items-center">Mentor newbie <XPChip points={50}/></li>
                          <li className="flex justify-between items-center">Bring partner <XPChip points={75}/></li>
                        </ul>
                      </div>
                      {/* Funding Bonuses */}
                      <div className="rounded-2xl bg-neutral-900/40 border border-white/5 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2"><DollarSign className="h-3 w-3"/> Funding Bonuses</h4>
                        <ul className="space-y-3 text-sm text-stone-300">
                          <li className="flex justify-between items-center">Sponsor lead <XPChip points={25}/></li>
                          <li className="flex justify-between items-center">Write a grant <XPChip points={50}/></li>
                          <li className="flex justify-between items-center">Secure donation <XPChip points={75}/></li>
                          <li className="flex justify-between items-center">Paid workshop <XPChip points={75}/></li>
                          <li className="flex justify-between items-center">Generate revenue <XPChip points={150}/></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 2. Guild Combo Bonuses */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-500/20 rounded-xl"><Zap className="h-6 w-6 text-rose-400"/></div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">Guild Combo Bonuses</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { title: 'Signal Boost', combos: [<Flame className="h-4 w-4 text-orange-400"/>, <Plus className="h-3 w-3 text-stone-600"/>, <Video className="h-4 w-4 text-cyan-400"/>], text: 'Fire + Air', desc: 'A performer, speaker, or event leader works with a media creator to turn a live event into a podcast, video, livestream, or campaign.', xp: 50, output: 'Public story, event recap, social media content, audience growth.' },
                        { title: 'Healing Land', combos: [<TreePine className="h-4 w-4 text-amber-400"/>, <Plus className="h-3 w-3 text-stone-600"/>, <Heart className="h-4 w-4 text-rose-400"/>], text: 'Earth + Water', desc: 'A land steward works with a healer to create an herbal garden, wellness trail, tea ceremony, or plant medicine class.', xp: 50, output: 'Healing space, wellness event, herbal education, retreat offering.' },
                        { title: 'Teach the Build', combos: [<Hammer className="h-4 w-4 text-amber-400"/>, <Plus className="h-3 w-3 text-stone-600"/>, <Video className="h-4 w-4 text-cyan-400"/>], text: 'Earth + Air', desc: 'A maker, gardener, or builder works with a media educator to turn a physical project into a tutorial, class, or digital guide.', xp: 50, output: 'Workshop, video tutorial, build guide, course module.' },
                        { title: 'Build the Gathering', combos: [<Flame className="h-4 w-4 text-orange-400"/>, <Plus className="h-3 w-3 text-stone-600"/>, <Hammer className="h-4 w-4 text-amber-400"/>], text: 'Fire + Earth', desc: 'An event producer works with builders and land stewards to create a stage, market, outdoor classroom, or community workday.', xp: 50, output: 'Event infrastructure, public gathering, community activation.' },
                        { title: 'Teach the Nervous System', combos: [<Heart className="h-4 w-4 text-rose-400"/>, <Plus className="h-3 w-3 text-stone-600"/>, <Video className="h-4 w-4 text-cyan-400"/>], text: 'Water + Air', desc: 'A wellness facilitator works with a media creator to make emotional intelligence videos, integration guides, or breathwork education.', xp: 50, output: 'Wellness content, class, guided audio, online offering.' },
                        { title: 'Full Circle', combos: [<Sparkles className="h-4 w-4 text-emerald-400"/>], text: 'All Four Guilds', desc: 'Fire, Water, Earth, and Air all work together on one project: leadership, care, building, and media/education.', xp: 200, output: 'A complete community project that can be funded, taught, documented, and repeated.', isEpic: true },
                      ].map(combo => (
                        <div key={combo.title} className={`rounded-2xl bg-neutral-900/40 border ${combo.isEpic ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'border-white/5'} p-6 flex flex-col h-full relative overflow-hidden`}>
                          {combo.isEpic && <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="h-24 w-24 text-emerald-500"/></div>}
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                              <div className="flex items-center gap-1.5 mb-2 bg-neutral-950 px-2 py-1 rounded w-fit border border-white/5 shadow-inner">
                                {combo.combos.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 ml-1">{combo.text}</span>
                              </div>
                              <h4 className="font-bold text-white text-lg">{combo.title}</h4>
                            </div>
                            <XPChip points={combo.xp} />
                          </div>
                          <p className="text-sm text-stone-400 leading-relaxed mb-6 relative z-10 flex-grow">{combo.desc}</p>
                          <div className="bg-neutral-950 rounded-xl p-3 relative z-10 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Output Created</span>
                            <span className="text-xs text-emerald-300/90 font-medium">{combo.output}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Member Level System */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/20 rounded-xl"><Award className="h-6 w-6 text-purple-400"/></div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">Member Levels</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-5 overflow-x-auto pb-4 snap-x">
                      {[
                        { lvl: 1, name: 'Spark', xp: '0–100', text: 'New member. Can attend council, volunteer, and join beginner quests.', unlocks: ['Council access', 'Beginner quests', 'Community badge'] },
                        { lvl: 2, name: 'Flamekeeper', xp: '100–300', text: 'Trusted contributor. Can join project teams and earn basic rewards.', unlocks: ['Project team access', 'Event discounts', 'Quest board rec.'] },
                        { lvl: 3, name: 'Builder', xp: '300–700', text: 'Skilled contributor. Can lead tasks and receive public portfolio proof.', unlocks: ['Lead small tasks', 'Studio/maker access', 'Portfolio proof'] },
                        { lvl: 4, name: 'Steward', xp: '700–1,500', text: 'Community leader. Can guide teams, mentor members, and shape projects.', unlocks: ['Mentor role', 'Project leadership', 'Paid role eligibility'] },
                        { lvl: 5, name: 'Guild Lead', xp: '1,500+', text: 'Sector leader. Can lead workshops, coordinate guilds, launch projects.', unlocks: ['Workshop leadership', 'Residencies', 'Council trust role'] },
                      ].map(level => (
                        <div key={level.lvl} className="min-w-[220px] flex-1 rounded-2xl bg-neutral-900/40 border border-white/10 p-6 snap-center flex flex-col relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full" />
                          <div className="h-12 w-12 bg-neutral-950 border border-white/10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-inner mb-4 relative z-10">
                            {level.lvl}
                          </div>
                          <h4 className="font-bold text-emerald-400 text-lg relative z-10">{level.name}</h4>
                          <p className="font-mono text-xs text-stone-500 mb-4 relative z-10">{level.xp} XP</p>
                          <p className="text-sm text-stone-400 mb-6 leading-relaxed flex-grow relative z-10">{level.text}</p>
                          <div className="pt-4 border-t border-white/5 space-y-2 relative z-10">
                            <span className="text-[10px] font-bold uppercase text-stone-600 block mb-2 tracking-widest">Unlocks</span>
                            {level.unlocks.map(u => <div key={u} className="text-xs text-stone-300 flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400/70 mt-0.5 shrink-0"/> {u}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Live Quest Board */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-500/20 rounded-xl"><Map className="h-6 w-6 text-emerald-400"/></div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">Live Quest Board</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { title: 'Build the Herbal Wellness Garden', tags: ['Earth', 'Water', 'Air'], diff: 4, xp: 500, fund: '$750', roles: 'Land steward, herbalist, filmmaker, youth educator', proof: 'Photos, materials list, plant map, short recap', status: 'Team Forming' },
                        { title: 'Film the First Green Fire Council Story', tags: ['Air', 'Fire'], diff: 3, xp: 300, fund: '$250', roles: 'Camera operator, editor, interviewer, council steward', proof: 'Interview footage and edited 3-minute story', status: 'In Progress' },
                        { title: 'Repair and Paint the Community Stage', tags: ['Earth', 'Fire'], diff: 5, xp: 700, fund: '$1,200', roles: 'Builder, painter, event lead, safety lead', proof: 'Before/after photos, receipts, completion video', status: 'Materials Needed' },
                        { title: 'Create a Youth Music and Nature Workshop', tags: ['Fire', 'Earth', 'Air', 'Water'], diff: 6, xp: 1000, fund: '$2,000', roles: 'Music mentor, youth ed, land steward, wellness, filmmaker', proof: 'Lesson plan, event photos, parent feedback, recap video', status: 'Council Approved' },
                      ].map(quest => (
                        <div key={quest.title} className="rounded-[2rem] border border-white/10 bg-neutral-900/50 p-8 shadow-xl backdrop-blur-sm flex flex-col hover:border-emerald-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex gap-1.5 flex-wrap">
                              {quest.tags.map(t => (
                                <span key={t} className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-white/10 shadow-inner ${t==='Fire'?'bg-orange-500/10 text-orange-400': t==='Water'?'bg-rose-500/10 text-rose-400': t==='Earth'?'bg-amber-500/10 text-amber-400':'bg-cyan-500/10 text-cyan-400'}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                            <span className="bg-neutral-950 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-400 border border-white/5 uppercase flex items-center gap-1 shadow-inner">Lvl {quest.diff}</span>
                          </div>
                          <h4 className="text-2xl font-bold text-white mb-6 leading-tight">{quest.title}</h4>
                          <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                              <span className="block text-[10px] uppercase text-stone-500 font-bold mb-1 tracking-wider">Rewards</span>
                              <div className="flex items-center gap-2"><span className="text-emerald-400 font-mono text-base font-bold">{quest.xp} XP</span> <span className="text-stone-600 text-sm">|</span> <span className="text-amber-400 font-mono text-base font-bold">{quest.fund}</span></div>
                            </div>
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                              <span className="block text-[10px] uppercase text-stone-500 font-bold mb-1 tracking-wider">Status</span>
                              <span className="text-stone-300 text-sm font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> {quest.status}</span>
                            </div>
                            <div className="col-span-2 bg-neutral-950 p-4 rounded-2xl border border-white/5 space-y-3">
                              <div><span className="block text-[10px] uppercase text-stone-500 font-bold tracking-wider mb-1">Needed Roles</span><span className="text-sm text-stone-300 leading-relaxed">{quest.roles}</span></div>
                              <div><span className="block text-[10px] uppercase text-stone-500 font-bold tracking-wider mb-1">Proof Req.</span><span className="text-sm text-stone-300 leading-relaxed">{quest.proof}</span></div>
                            </div>
                          </div>
                          <ContactButton
                            subject={`Green Fire — Join Quest: ${quest.title}`}
                            body={`Hi Green Fire team,\n\nI'd like to join the quest: ${quest.title}\n\n`}
                            className="w-full py-4 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-emerald-400 hover:text-neutral-950 transition-all border border-white/5 flex items-center justify-center gap-2 group shadow-lg"
                          >
                            Join Quest <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
                          </ContactButton>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Rewards and 6. Mini Example */}
                  <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Rewards */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-xl"><Trophy className="h-6 w-6 text-blue-400"/></div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">Rewards & Unlocks</h3>
                      </div>
                      <p className="text-base text-stone-400 mb-8 leading-relaxed">
                        Points represent contribution, trust, proof, and collaboration. As members gain XP, they unlock access, recognition, and future paid opportunities.
                      </p>
                      <div className="rounded-[2rem] border border-white/10 bg-neutral-900/40 p-8 space-y-5 mb-8">
                        {[
                          { xp: '100 XP', r: 'Green Fire badge' },
                          { xp: '250 XP', r: 'Free class or event ticket' },
                          { xp: '500 XP', r: 'Studio or maker space access' },
                          { xp: '1,000 XP', r: 'Featured member profile' },
                          { xp: '1,500 XP', r: 'Eligible for paid project roles' },
                          { xp: '2,000 XP', r: 'Eligible to lead a workshop' },
                          { xp: '3,000 XP', r: 'Eligible for residency or leadership' },
                        ].map(item => (
                          <div key={item.xp} className="flex items-center gap-6 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            <span className="font-mono text-base font-bold text-emerald-400 w-24 shrink-0 bg-emerald-500/10 px-2 py-1 rounded text-center border border-emerald-500/20">{item.xp}</span>
                            <span className="text-sm md:text-base text-stone-300 font-medium">{item.r}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-stone-500 uppercase tracking-widest bg-neutral-950 border border-white/5 p-5 rounded-2xl leading-relaxed">
                        <strong className="text-orange-400">Note:</strong> Paid roles, revenue shares, and credits must be approved by the Council and Finance Lead so the system stays fair, legal, and sustainable.
                      </p>
                    </div>

                    {/* Example Results Screen */}
                    <div>
                       <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-stone-800 rounded-xl border border-white/10"><CheckSquare className="h-6 w-6 text-stone-400"/></div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">Example Match Results</h3>
                      </div>
                      <div className="rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/80 p-10 shadow-[0_0_40px_rgba(52,211,153,0.05)] relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                        
                        <div className="text-center mb-10">
                          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-black tracking-[0.2em] uppercase mb-4 shadow-[0_0_15px_rgba(52,211,153,0.3)]">Quest Complete</span>
                          <h4 className="text-3xl font-bold text-white">Herbal Wellness Garden</h4>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center text-sm md:text-base"><span className="text-stone-300">Land steward builds beds</span><span className="font-mono text-emerald-400 font-bold">+150</span></div>
                          <div className="flex justify-between items-center text-sm md:text-base"><span className="text-stone-300">Healer designs ceremony</span><span className="font-mono text-emerald-400 font-bold">+150</span></div>
                          <div className="flex justify-between items-center text-sm md:text-base"><span className="text-stone-300">Filmmaker documents</span><span className="font-mono text-emerald-400 font-bold">+100</span></div>
                          <div className="flex justify-between items-center text-sm md:text-base"><span className="text-stone-300">Youth educator class</span><span className="font-mono text-emerald-400 font-bold">+75</span></div>
                          <div className="w-full h-px bg-white/10 my-3" />
                          <div className="flex justify-between items-center text-sm"><span className="text-stone-400 italic">Combo: Earth + Water</span><span className="font-mono text-orange-400 font-bold">+50</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-stone-400 italic">Combo: Earth + Air</span><span className="font-mono text-orange-400 font-bold">+50</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-stone-400 italic">Completion Bonus</span><span className="font-mono text-orange-400 font-bold">+150</span></div>
                        </div>

                        <div className="bg-neutral-950 border border-emerald-500/20 rounded-2xl p-5 flex justify-between items-center mb-8 shadow-inner">
                          <span className="text-xs font-bold uppercase text-stone-400 tracking-widest">Total XP Distributed</span>
                          <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">675 XP</span>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                           <span className="block text-xs uppercase text-stone-500 font-bold mb-3 tracking-widest">New Assets Created:</span>
                           <div className="flex flex-wrap gap-2">
                             <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-stone-300 font-medium">Wellness Tickets</span>
                             <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-stone-300 font-medium">Herbal Class</span>
                             <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-stone-300 font-medium">Youth Workshop</span>
                             <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-stone-300 font-medium">Herbal Products</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outro */}
                  <div className="text-center max-w-3xl mx-auto pt-12">
                    <p className="text-stone-400 italic leading-relaxed text-lg mb-10">
                      "Green Fire gamification is not fake points for empty activity. It is a visible trust, contribution, and collaboration system that helps people see where they fit, how they can help, and how their work can become recognized, funded, taught, and repeated."
                    </p>
                    <ContactButton
                      subject="Green Fire — Join a Quest"
                      body="Hi Green Fire team,\n\nI'd like to join a quest.\n\n"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-10 py-5 text-lg font-bold text-neutral-950 shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:bg-emerald-300 transition-all hover:scale-105"
                    >
                      <Swords className="h-6 w-6" /> Join a Quest
                    </ContactButton>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 7. The Four Core Hubs */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Physical Infrastructure" color="cyan" />
          <SectionTitle title="The Four Core Hubs" />
          
          <div className="grid lg:grid-cols-2 gap-8 mt-12">
            {hubsData.map(hub => (
              <div key={hub.title} className="rounded-[2.5rem] border border-white/5 bg-neutral-950 p-8 hover:border-white/10 transition-colors shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-2xl bg-${hub.color}-500/10 text-${hub.color}-400 ring-1 ring-${hub.color}-500/20`}>
                    <hub.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{hub.title}</h3>
                </div>
                <p className="text-base text-stone-400 mb-8 leading-relaxed">{hub.purpose}</p>
                
                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div>
                    <p className={`text-[10px] font-bold uppercase text-${hub.color}-400 mb-3 tracking-widest`}>Activities</p>
                    <ul className="text-sm text-stone-300 space-y-2">{hub.activities.slice(0,5).map(a => <li key={a} className="flex items-start gap-2"><span className={`text-${hub.color}-500/50 mt-0.5`}>•</span> {a}</li>)}</ul>
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase text-${hub.color}-400 mb-3 tracking-widest`}>Income Streams</p>
                    <ul className="text-sm text-stone-300 space-y-2">{hub.income.slice(0,5).map(i => <li key={i} className="flex items-start gap-2"><span className={`text-${hub.color}-500/50 mt-0.5`}>•</span> {i}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8, 9, 10. Media Hub, Innovation Lab, Wellness Deep Dives */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-6xl space-y-24">
          
          {/* Media Hub Engine */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel text="Media Engine" color="pink" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Media Hub: The Story Engine</h3>
              <p className="text-stone-400 leading-relaxed mb-6">
                The Media Hub turns every project into story, education, marketing, funding, and cultural momentum. It captures the entire journey from the community need to the replication model.
              </p>
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-sm text-pink-200 font-medium flex items-center gap-3">
                <Video className="h-5 w-5 shrink-0" />
                Project → Film → Edit → Publish → Educate → Attract Members → Attract Donors → Fund More Projects.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl">
                 <h4 className="text-xs uppercase font-bold text-stone-500 tracking-wider mb-4">Captures</h4>
                 <ul className="space-y-2 text-sm text-stone-300">
                   {['Before and after', 'The community need', 'The people involved', 'The research process', 'The final result'].map(i => <li key={i} className="flex gap-2"><span className="text-pink-500/50">•</span>{i}</li>)}
                 </ul>
               </div>
               <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl">
                 <h4 className="text-xs uppercase font-bold text-stone-500 tracking-wider mb-4">Revenue Outputs</h4>
                 <ul className="space-y-2 text-sm text-stone-300">
                   {['Sponsorships', 'Paid media prod.', 'YouTube revenue', 'Courses', 'Grant docs'].map(i => <li key={i} className="flex gap-2"><span className="text-pink-500/50">•</span>{i}</li>)}
                 </ul>
               </div>
            </div>
          </div>

          {/* Innovation Lab Engine */}
          <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
             <div className="md:order-2">
              <SectionLabel text="Maker Engine" color="cyan" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Innovation Lab: The Prototype Engine</h3>
              <p className="text-stone-400 leading-relaxed mb-6">
                The Innovation Lab turns research into working models. It connects the Council for priorities, Research for design, Maker Space for building, and the Economic Engine for productization.
              </p>
            </div>
            <div className="md:order-1 rounded-3xl border border-white/5 bg-neutral-950 p-8 shadow-xl">
               <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-6">Prototype Stages</h4>
               <div className="grid grid-cols-2 gap-3">
                 {['Problem Definition', 'Sketch', 'Materials List', 'Budget', 'Prototype', 'Test', 'Improve', 'Document', 'Teach', 'Replicate'].map((stage, idx) => (
                   <div key={stage} className="flex items-center gap-3 bg-neutral-900/50 border border-white/5 p-3 rounded-xl">
                     <span className="text-cyan-500/50 text-xs font-mono font-bold">{idx+1}.</span>
                     <span className="text-sm font-medium text-stone-300">{stage}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Wellness Engine */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel text="Care Engine" color="rose" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Wellness: The Human Sustainability System</h3>
              <p className="text-stone-400 leading-relaxed mb-6">
                Community projects fail when people burn out or avoid conflict. Green Fire includes wellness not as an extra, but as core infrastructure to support emotional safety and nervous-system regulation.
              </p>
            </div>
            <div className="space-y-4">
               {[
                 { t: 'Before council', d: 'Grounding and arriving' },
                 { t: 'During council', d: 'Clear communication and listening' },
                 { t: 'During projects', d: 'Stress support and boundary setting' },
                 { t: 'During conflict', d: 'Repair circles and mediation' },
                 { t: 'After events', d: 'Integration and rest' }
               ].map(point => (
                 <div key={point.t} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-white/5">
                   <Heart className="h-5 w-5 text-rose-400/50 shrink-0" />
                   <div>
                     <span className="text-sm font-bold text-white block">{point.t}</span>
                     <span className="text-sm text-stone-400">{point.d}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* 11. Economic Engine Map */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/20">
        <div className="mx-auto max-w-6xl">
           <div className="text-center mb-16">
            <SectionLabel text="Sustainability" color="emerald" />
            <SectionTitle title="Economic Engine Map" />
            <p className="text-stone-400 max-w-2xl mx-auto text-lg leading-relaxed">
              How Green Fire serves and sustains itself. The center creates money through memberships, services, sponsorships, events, grants, content, and products.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {economicEngineData.map(group => (
              <div key={group.category} className="rounded-2xl border border-white/5 bg-neutral-950 p-6 hover:border-emerald-500/30 transition-colors shadow-lg">
                <h4 className="font-bold text-white mb-4 text-lg border-b border-white/5 pb-3">{group.category}</h4>
                <ul className="space-y-2.5">
                  {group.items.map(item => (
                    <li key={item} className="text-sm text-stone-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Materials & Equipment Map */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <SectionLabel text="Space Requirements" color="amber" />
            <SectionTitle title="Materials Map" />
            <p className="text-stone-400 text-lg">Click a space to see essential materials, estimated costs, and potential revenue.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {materialsData.map((space, idx) => (
              <div key={space.space} className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden shadow-md">
                <button 
                  onClick={() => setExpandedMaterial(expandedMaterial === idx ? null : idx)} 
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <h4 className="font-bold text-white text-lg">{space.space}</h4>
                  <ChevronDown className={`h-5 w-5 text-stone-500 transition-transform ${expandedMaterial === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMaterial === idx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-neutral-900/30">
                      <div className="p-6 pt-0 border-t border-white/5">
                        <div className="flex flex-wrap gap-4 text-xs text-stone-400 mb-6 mt-4">
                          <span className="bg-neutral-950 px-3 py-1.5 rounded border border-white/5">Cost: <strong className="text-amber-400 ml-1">{space.cost}</strong></span>
                          <span className="bg-neutral-950 px-3 py-1.5 rounded border border-white/5">Manager: <strong className="text-white ml-1">{space.managed}</strong></span>
                        </div>
                        <p className="text-sm text-stone-300 mb-4"><strong className="text-stone-500">Supports:</strong> {space.supports}</p>
                        <p className="text-[10px] uppercase font-bold text-stone-500 mb-2 tracking-wider">Essential Materials</p>
                        <div className="flex flex-wrap gap-2">
                          {space.essential.map(item => <span key={item} className="text-xs bg-white/5 border border-white/10 text-stone-300 px-3 py-1.5 rounded-lg">{item}</span>)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Roles & Responsibilities */}
      <section className="py-24 px-6 border-t border-white/5 bg-neutral-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionLabel text="Human Infrastructure" color="blue" />
            <SectionTitle title="People Map" />
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">The core roles that make the operating system work.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesData.map(role => (
              <div key={role.title} className="rounded-2xl border border-white/5 bg-neutral-950 p-6 hover:border-blue-500/30 transition-colors shadow-lg">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-white mb-3">{role.title}</h4>
                <p className="text-sm text-stone-400 leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14 & 15. Example Journey & Dashboard */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            
            {/* Timeline Journey */}
            <div>
              <SectionLabel text="Theory in Practice" color="orange" />
              <SectionTitle title="Example Journey" />
              <div className="p-6 rounded-2xl bg-neutral-900/30 border border-white/5 mb-10 shadow-inner">
                <p className="text-base font-medium text-stone-300 italic leading-relaxed">"Our youth need a safe creative place after school."</p>
              </div>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500/50 before:to-transparent">
                {[
                  { s: 'Intake', d: 'Parent submits need via form.' },
                  { s: 'Council', d: 'Agrees it aligns with youth ed & media.' },
                  { s: 'Research', d: 'Interviews parents and teachers for costs/space.' },
                  { s: 'Collaboration', d: 'Team forms with educators, makers, wellness.' },
                  { s: 'Prototype', d: 'Runs one Saturday maker workshop.' },
                  { s: 'Media', d: 'Creates a short impact video of the day.' },
                  { s: 'Scale / Fund', d: 'Video wins grant to fund 6-week program.' },
                ].map((step, i) => (
                  <div key={step.s} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-orange-500 bg-neutral-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(249,115,22,0.3)] relative z-10 text-orange-400 font-bold text-sm">
                      {i+1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-lg">
                      <h4 className="mb-2 font-bold text-white text-base">{step.s}</h4>
                      <p className="text-sm text-stone-400 leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Dashboard */}
            <div>
              <SectionLabel text="Live Simulation" color="emerald" />
              <SectionTitle title="Impact Dashboard" />
              <div className="grid grid-cols-2 gap-4 mt-10">
                {metrics.map(m => (
                  <div key={m.label} className="rounded-[2rem] border border-emerald-500/10 bg-emerald-950/10 p-6 text-center flex flex-col items-center justify-center hover:bg-emerald-900/20 transition-colors">
                    <m.icon className="h-6 w-6 text-emerald-500/50 mb-4" />
                    <span className="block text-4xl font-black text-white mb-2 tracking-tight">{m.value}</span>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 16. OS Footer CTA */}
      <section className="py-32 px-6 border-t border-emerald-900/40 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Help Build the First Pilot.</h2>
          <p className="text-stone-300 mb-12 text-lg leading-relaxed max-w-3xl mx-auto">
            We don't need to wait for the full campus. The first Green Fire pilot starts now with a council circle, a small team, a camera, and one real community problem to solve.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
             <ContactButton
               subject="Green Fire — Donate to Pilot"
               body="Hi Green Fire team,\n\nI'd like to donate to the pilot.\n\n"
               className="rounded-2xl bg-orange-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-orange-300 transition-colors shadow-[0_0_20px_rgba(251,146,60,0.2)]"
             >
               Donate to Pilot
             </ContactButton>
             <ContactButton
               subject="Green Fire — Become a Founder"
               body="Hi Green Fire team,\n\nI'd like to become a founder.\n\n"
               className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
             >
               Become a Founder
             </ContactButton>
             <ContactButton
               subject="Green Fire — Offer a Workshop"
               body="Hi Green Fire team,\n\nI'd like to offer a workshop.\n\n"
               className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
             >
               Offer a Workshop
             </ContactButton>
             <ContactButton
               subject="Green Fire — Submit a Community Need"
               body="Hi Green Fire team,\n\nI'd like to submit a community need.\n\n"
               className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
             >
               Submit a Need
             </ContactButton>
          </div>
          <p className="text-stone-500 text-sm uppercase tracking-widest font-bold">
            Green Fire begins when people gather.<br/>It grows when they build together.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <ContactProvider onNavigateHome={() => setCurrentPage('home')}>
      {currentPage === 'home' ? (
        <Home navigate={setCurrentPage} />
      ) : (
        <InnovationMap navigate={setCurrentPage} />
      )}
    </ContactProvider>
  );
}