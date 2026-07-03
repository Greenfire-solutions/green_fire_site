import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Hammer, Heart, Music, Video, ArrowRight, Inbox, Search, Network, Cpu,
  BookOpen, Coins, Map, CheckSquare, Sprout, Play, ChevronDown, Swords, Zap, Star,
  Trophy, Target, Sparkles, Plus, CheckCircle2, Flame, Shield, Award, BatteryCharging,
  ClipboardList, Handshake, DollarSign, TreePine,
} from 'lucide-react';
import { ContactButton } from '../components/ContactProvider';
import { SectionLabel, SectionTitle, XPChip } from '../components/ui';
import {
  systemNodes, intakeCategories, councilCriteria, researchSteps, collaborationRoles,
  projectLevels, hubsData, materialsData, economicEngineData, rolesData, metrics,
} from '../data/programData';

export function ProgramDeepDive() {
  const [activeNode, setActiveNode] = useState(systemNodes[0]);
  const [expandedMaterial, setExpandedMaterial] = useState<number | null>(null);
  const [showGameMechanics, setShowGameMechanics] = useState(false); 

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="pb-20">
      
      {/* OS Hero Section */}
      <section className="relative pt-12 pb-20 px-6 border-b border-emerald-900/30 overflow-hidden">
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
