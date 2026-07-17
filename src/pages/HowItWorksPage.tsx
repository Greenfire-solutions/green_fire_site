import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SectionLabel, SectionTitle, BookButton } from '../components/ui';
import { homeSectors } from '../data/programData';
import { ProgramDeepDive } from '../program/ProgramDeepDive';
import { useSiteContent } from '../context/ContentContext';
import { tenStageSystem } from '../data/completeSystemData';
import { coreCapacities, eventsSection } from '../data/capacitiesData';
import { youthSection, jobsSection, creditsSection, aiSection } from '../data/participationData';
import { conflictSection } from '../data/offeringsData';
import { elderGuidance } from '../data/elderGuidanceData';
import { impactCategories } from '../data/impactMetricsData';
import { siteConfig } from '../config/siteConfig';
import { usePageMeta } from '../lib/usePageMeta';
import { StatusBadge, StatusNote } from '../components/StatusBadge';
import { eventRevenueExample } from '../data/pilotRoadmapData';

export function HowItWorksPage() {
  usePageMeta(siteConfig.seo.howItWorksTitle, siteConfig.seo.homeDescription);
  const content = useSiteContent();
  const { program } = content.pages;
  const [openSection, setOpenSection] = useState<string | null>('vision');
  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_45%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
          <SectionLabel text="Greenfire Creator Commons" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-8 leading-tight">
            {program.headline || 'How Greenfire Works'}
          </h1>
          <div className="space-y-5 text-stone-300 leading-relaxed">
            {program.introParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone-500">{siteConfig.poweredByStatement}</p>
        </div>
      </section>

      <section id="ten-stages" className="border-b border-white/5 py-20 px-6 scroll-mt-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Complete System" color="cyan" />
          <SectionTitle title="The Ten-Stage Greenfire Cycle" />
          <p className="text-stone-400 mb-10 text-sm">Each stage includes its current development status.</p>
          <div className="space-y-4">
            {tenStageSystem.map((stage) => (
              <article key={stage.id} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-white">
                    <span className="text-emerald-400 mr-2">{stage.number}.</span>
                    {stage.title}
                  </h3>
                  <StatusBadge item={stage.status} />
                </div>
                <p className="text-sm text-stone-400 mb-4">{stage.whatHappens}</p>
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold uppercase text-stone-500 mb-1">Who may participate</p>
                    <p className="text-stone-400">{stage.whoParticipates.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-stone-500 mb-1">Produces</p>
                    <p className="text-stone-400">{stage.produces.join(', ')}</p>
                  </div>
                </div>
                <StatusNote item={stage.status} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capacities" className="border-b border-white/5 py-20 px-6 bg-neutral-900/20 scroll-mt-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Capacities" />
          <SectionTitle title="Four Core Capacities" />
          <div className="space-y-6">
            {coreCapacities.map((cap) => (
              <article key={cap.id} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{cap.title}</h3>
                  <StatusBadge item={cap.status} />
                </div>
                <p className="text-sm text-stone-400 mb-3">{cap.purpose}</p>
                {cap.pullQuote && <p className="text-sm text-emerald-300 italic mb-3">{cap.pullQuote}</p>}
                <StatusNote item={cap.status} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SectionLabel text="Events" color="orange" />
            <StatusBadge item={eventsSection.status} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{eventsSection.headline}</h2>
          <p className="text-stone-400 mb-4">{eventsSection.description}</p>
          <p className="text-sm text-emerald-300 italic mb-6">{eventsSection.statement}</p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs font-bold uppercase text-amber-300 mb-3">{eventRevenueExample.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {eventRevenueExample.allocations.map((a) => (
                <div key={a.label} className="text-center rounded-lg bg-neutral-950 p-2">
                  <span className="block text-lg font-bold text-white">{a.percent}%</span>
                  <span className="text-[10px] text-stone-500">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-12 px-6">
        <div className="mx-auto max-w-4xl space-y-3">
          {program.accordionSections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden">
              <button type="button" onClick={() => toggle(section.id)} className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-white hover:bg-white/5">
                {section.title}
                <span className="text-emerald-400 text-xl">{openSection === section.id ? '−' : '+'}</span>
              </button>
              {openSection === section.id && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4 text-stone-400 text-sm leading-relaxed">
                  <p>{section.content}</p>
                  {section.id === 'sectors' && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                      {homeSectors.map((sector) => {
                        const Icon = sector.icon;
                        return (
                          <div key={sector.title} className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                            <Icon className="h-6 w-6 text-emerald-400 mb-2" />
                            <h4 className="font-bold text-white text-sm">{sector.title}</h4>
                            <p className="text-xs text-stone-400 mt-1">{sector.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {section.id === 'join' && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <BookButton subject="Greenfire — Join Founding Circle" variant="secondary">Join Founding Circle</BookButton>
                      <BookButton subject="Greenfire — Submit a Community Need">Submit a Community Need</BookButton>
                      <BookButton subject="Greenfire — Donate to Pilot" variant="secondary">Support the Pilot</BookButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Deep dive sections as accordions */}
      <section className="border-b border-white/5 py-16 px-6 bg-neutral-900/20">
        <div className="mx-auto max-w-4xl space-y-6">
          <SectionLabel text="Operating Model Details" />
          <Expandable title="Youth Development" status={youthSection.status}>
            <p className="mb-4">{youthSection.intro}</p>
            <p className="text-xs font-bold uppercase text-stone-500 mb-2">Possible roles</p>
            <p className="text-sm mb-4">{youthSection.roles.join(', ')}</p>
            <p className="text-xs text-amber-300/80">{youthSection.note}</p>
            <StatusNote item={youthSection.status} />
          </Expandable>
          <Expandable title={jobsSection.headline} status={jobsSection.status}>
            <p className="text-sm mb-3">Pathway: {jobsSection.pathway.join(' → ')}</p>
            <StatusNote item={jobsSection.status} />
          </Expandable>
          <Expandable title={creditsSection.headline} status={creditsSection.status}>
            <p className="text-sm mb-3">{creditsSection.disclaimer}</p>
            <StatusNote item={creditsSection.status} />
          </Expandable>
          <Expandable title={aiSection.headline} status={aiSection.status}>
            <p className="text-sm mb-3">{aiSection.dataStatement}</p>
            <StatusNote item={aiSection.status} />
          </Expandable>
          <div id="elder-guidance" className="scroll-mt-24">
            <Expandable title={elderGuidance.headline} status={elderGuidance.status} defaultOpen>
              <p className="text-sm mb-4 font-medium text-stone-300">{elderGuidance.subheadline}</p>
              <p className="text-sm mb-4 italic text-emerald-300/90">{elderGuidance.statement}</p>
              <p className="text-xs font-bold uppercase text-stone-500 mb-2">{elderGuidance.howWeBringElders.title}</p>
              <p className="text-sm mb-4">{elderGuidance.howWeBringElders.intro}</p>
              <ul className="space-y-3 mb-6">
                {elderGuidance.howWeBringElders.pathways.map((path) => (
                  <li key={path.title} className="rounded-xl border border-white/5 bg-neutral-900 p-4">
                    <span className="font-bold text-white text-sm block mb-1">{path.title}</span>
                    <span className="text-sm">{path.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs font-bold uppercase text-stone-500 mb-2">{elderGuidance.whatGuidanceShapes.title}</p>
              <p className="text-sm mb-3">{elderGuidance.whatGuidanceShapes.intro}</p>
              <ul className="text-sm space-y-1 mb-6 list-disc list-inside">
                {elderGuidance.whatGuidanceShapes.outcomes.map((o) => <li key={o}>{o}</li>)}
              </ul>
              <p className="text-xs font-bold uppercase text-stone-500 mb-2">{elderGuidance.supportCommitments.title}</p>
              <p className="text-sm mb-3">{elderGuidance.supportCommitments.intro}</p>
              <ul className="text-sm space-y-1 mb-6 list-disc list-inside">
                {elderGuidance.supportCommitments.commitments.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <p className="text-xs font-bold uppercase text-stone-500 mb-2">Protocol principles</p>
              <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                {elderGuidance.principles.map((p) => <li key={p}>{p}</li>)}
              </ol>
              <StatusNote item={elderGuidance.status} />
            </Expandable>
          </div>
          <Expandable title={conflictSection.headline} status={conflictSection.status}>
            <p className="text-sm mb-3">{conflictSection.intro}</p>
            <p className="text-xs text-stone-500">{conflictSection.note}</p>
            <StatusNote item={conflictSection.status} />
          </Expandable>
          <Expandable title={impactCategories.headline} status={impactCategories.status}>
            <p className="text-sm mb-4">{impactCategories.intro}</p>
            <StatusNote item={impactCategories.status} />
          </Expandable>
        </div>
      </section>

      <section className="px-6 py-8 border-b border-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="System Explorer" color="cyan" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">{program.deepDiveTitle}</h2>
          <p className="text-stone-400 text-sm max-w-2xl mx-auto mb-4">{program.deepDiveSubtitle}</p>
          <p className="text-xs text-stone-500">Interactive explorer below — gamification and metrics are illustrative pilot concepts.</p>
        </div>
      </section>

      <ProgramDeepDive />

      <section className="py-12 px-6 text-center">
        <Link to="/get-involved" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
          Ready to participate? Get Involved →
        </Link>
      </section>
    </>
  );
}

function Expandable({
  title,
  status,
  children,
  defaultOpen = false,
}: {
  title: string;
  status: { statusLabel: string; status: string; description?: string };
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/5"
      >
        <span className="font-semibold text-white">{title}</span>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge item={status as import('../config/statusConfig').StatusItem} />
          <span className="text-emerald-400">{open ? '−' : '+'}</span>
        </div>
      </button>
      {open && <div className="px-6 pb-6 border-t border-white/5 pt-4 text-stone-400">{children}</div>}
    </div>
  );
}
