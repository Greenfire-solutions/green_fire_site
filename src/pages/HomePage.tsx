import { Link } from 'react-router-dom';
import { ArrowRight, Users, Video, Hammer } from 'lucide-react';
import {
  homepageHero,
  centralIdea,
  councilSection,
  eldersFirstSection,
  coreSectors,
  livingEcosystem,
  bioregionalNote,
  economicNote,
  startNowSection,
  closingLines,
  needSection,
  whatIsSection,
  offeringsPreview,
  communityMediaSpaces,
  finalCta,
} from '../data/homepageData';
import { siteConfig } from '../config/siteConfig';
import { participationPathways } from '../data/participationData';
import { exampleProject } from '../data/impactMetricsData';
import { pilotRoadmap } from '../data/pilotRoadmapData';
import { openSourceContent } from '../data/openSourceData';
import { condensedReplication } from '../data/greenfireLoopData';
import { elderGuidance } from '../data/elderGuidanceData';
import { PageHero, SectionLabel, BookButton } from '../components/ui';
import { PublicGreenfireLoop } from '../components/home/PublicGreenfireLoop';
import { CoreCapacitiesSection } from '../components/home/CoreCapacitiesSection';
import { ElderGuidanceSection } from '../components/home/ElderGuidanceSection';
import { LearnMorePanel } from '../components/home/LearnMorePanel';
import { StatusBadge, StatusNote } from '../components/StatusBadge';
import { usePageMeta } from '../lib/usePageMeta';
import { getServiceIcon } from '../lib/icons';

export function HomePage() {
  usePageMeta(
    'Green Fire Research and Innovation Center | Council, Creativity & Community Solutions',
    'Green Fire is a living center for council, creativity, regeneration, and community solutions — gathering people to solve real problems together.',
  );

  return (
    <>
      {/* ——— Clear above-the-fold story ——— */}
      <PageHero label={homepageHero.label} title={homepageHero.headline} subtitle={homepageHero.subheadline}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap items-start">
          <BookButton subject={homepageHero.primaryCta.subject}>
            {homepageHero.primaryCta.label}
          </BookButton>
          <Link
            to={homepageHero.secondaryCta.path}
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-neutral-900/50 px-8 py-4 text-base font-semibold text-emerald-100 hover:bg-neutral-800"
          >
            {homepageHero.secondaryCta.label}
          </Link>
          <Link
            to={homepageHero.tertiaryCta.path}
            className="inline-flex items-center px-2 py-4 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            {homepageHero.tertiaryCta.label} →
          </Link>
        </div>
      </PageHero>

      <section className="border-b border-white/5 py-14 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xl md:text-2xl font-medium text-white leading-snug border-l-4 border-emerald-500/50 pl-6">
            {centralIdea}
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-4xl grid gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-xl bg-emerald-500/10 p-3 mb-4 ring-1 ring-emerald-500/20">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{councilSection.title}</h2>
            <p className="text-stone-400 leading-relaxed text-sm md:text-base">{councilSection.body}</p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <SectionLabel text="First" color="amber" />
              <StatusBadge item={eldersFirstSection.status} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{eldersFirstSection.title}</h2>
            <p className="text-stone-400 leading-relaxed text-sm md:text-base">{eldersFirstSection.body}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <SectionLabel text="Two Core Sectors" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">Around the Council</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {coreSectors.map((sector) => {
              const Icon = sector.id === 'media' ? Video : Hammer;
              return (
                <article key={sector.id} className="rounded-[2rem] border border-white/10 bg-neutral-950 p-8">
                  <Icon className="h-8 w-8 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">{sector.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{sector.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Living Ecosystem" color="cyan" />
          <h2 className="text-2xl font-semibold text-white mb-8">{livingEcosystem.title}</h2>
          <ol className="space-y-3 mb-8">
            {livingEcosystem.steps.map((step, i) => (
              <li key={step.label} className="flex items-start gap-4 text-sm md:text-base">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs ring-1 ring-emerald-500/20">
                  {i + 1}
                </span>
                <p className="text-stone-300 pt-1">
                  <strong className="text-white">{step.label}</strong>{' '}
                  <span className="text-stone-400">{step.detail}.</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-stone-500 leading-relaxed border-t border-white/5 pt-6">
            {livingEcosystem.careNote}
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-14 px-6">
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <h3 className="font-bold text-white mb-2">{bioregionalNote.title}</h3>
            <p className="text-sm text-stone-400 leading-relaxed">{bioregionalNote.body}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <h3 className="font-bold text-white mb-2">{economicNote.title}</h3>
            <p className="text-sm text-stone-400 leading-relaxed">{economicNote.body}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">{startNowSection.title}</h2>
          <p className="text-sm text-stone-500 mb-4 leading-relaxed">{startNowSection.longTerm}</p>
          <p className="text-stone-300 leading-relaxed">{startNowSection.startNow}</p>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          {closingLines.map((line) => (
            <p key={line.slice(0, 48)} className="text-stone-300 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">{finalCta.headline}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <BookButton subject={finalCta.primary.subject}>{finalCta.primary.label}</BookButton>
            <Link
              to={finalCta.secondary.path}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10"
            >
              {finalCta.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Everything else stays available ——— */}
      <LearnMorePanel
        panels={[
          {
            id: 'need',
            title: 'Why Green Fire is needed',
            summary: 'Communities have ideas — what is missing is a shared way to build them.',
            children: (
              <>
                <h3 className="text-white font-bold mb-3">{needSection.headline}</h3>
                {needSection.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="mb-3">{p}</p>
                ))}
              </>
            ),
          },
          {
            id: 'creator-commons',
            title: 'Creator Commons & innovation center model',
            summary: siteConfig.operatingModelName,
            children: (
              <>
                <h3 className="text-white font-bold mb-3">{whatIsSection.headline}</h3>
                {whatIsSection.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="mb-3">{p}</p>
                ))}
                <p className="mt-4 text-emerald-300 italic">{siteConfig.pullStatement}</p>
                <p className="mt-4 text-stone-500">{siteConfig.poweredByStatement}</p>
              </>
            ),
          },
          {
            id: 'loop',
            title: 'The public Greenfire loop',
            summary: 'Listen → Understand → Design → Build → Gather → Measure',
            children: <PublicGreenfireLoop embedded />,
          },
          {
            id: 'elders',
            title: 'Indigenous Elders at the forefront',
            summary: 'Travel, guidance into solutions and media, and support for Indigenous people.',
            children: (
              <>
                <ElderGuidanceSection embedded />
                <p className="mt-4 text-xs text-stone-500">{elderGuidance.statement}</p>
              </>
            ),
          },
          {
            id: 'capacities',
            title: 'Four core capacities',
            summary: 'Listening, bioregional intelligence, media & culture, maker innovation.',
            children: <CoreCapacitiesSection embedded />,
          },
          {
            id: 'example',
            title: 'Example project cycle',
            summary: exampleProject.title,
            children: (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <StatusBadge item={exampleProject.status} />
                </div>
                <h3 className="text-white font-bold mb-2">{exampleProject.headline}</h3>
                <p className="mb-4">
                  <strong className="text-white">{exampleProject.title}:</strong> {exampleProject.signal}
                </p>
                <div className="space-y-3">
                  {exampleProject.steps.map((step) => (
                    <div key={step.title} className="rounded-xl border border-white/5 bg-neutral-900 p-4">
                      <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
                      <p className="text-sm">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </>
            ),
          },
          {
            id: 'media-spaces',
            title: 'Community media spaces',
            summary: communityMediaSpaces.headline,
            children: (
              <>
                <p className="mb-4">{communityMediaSpaces.intro}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {communityMediaSpaces.spaces.map((s) => (
                    <span key={s} className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-stone-300">
                      {s}
                    </span>
                  ))}
                </div>
                <BookButton subject={communityMediaSpaces.cta.subject}>{communityMediaSpaces.cta.label}</BookButton>
                <StatusNote item={communityMediaSpaces.status} />
              </>
            ),
          },
          {
            id: 'participate',
            title: 'Ways to participate',
            summary: 'Bring a need, offer a skill, partner, support, adapt the model.',
            children: (
              <div className="grid gap-4 sm:grid-cols-2">
                {participationPathways.map((path) => (
                  <div key={path.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-5 flex flex-col">
                    <h3 className="font-bold text-white mb-2">{path.title}</h3>
                    <p className="text-sm flex-grow mb-4">{path.description}</p>
                    {'subject' in path.cta ? (
                      <BookButton subject={path.cta.subject} variant="secondary" className="text-xs px-4 py-3">
                        {path.cta.label}
                      </BookButton>
                    ) : (
                      <Link to={path.cta.path} className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
                        {path.cta.label} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'start-small',
            title: 'Start small replication path',
            summary: condensedReplication.title,
            children: (
              <>
                <p className="flex flex-wrap gap-2 text-emerald-300 font-medium mb-4">
                  {condensedReplication.steps.map((s, i) => (
                    <span key={s}>
                      {s}
                      {i < condensedReplication.steps.length - 1 ? ' →' : ''}
                    </span>
                  ))}
                </p>
                <p>{condensedReplication.note}</p>
              </>
            ),
          },
          {
            id: 'offerings',
            title: 'Offerings that sustain the mission',
            summary: 'Media, studio, events, maker, and education services.',
            children: (
              <>
                <p className="mb-4">{offeringsPreview.statement}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                  {offeringsPreview.categories.map((cat) => {
                    const Icon = getServiceIcon(cat.icon);
                    return (
                      <div key={cat.title} className="rounded-2xl border border-white/5 bg-neutral-900 p-4 text-center">
                        <Icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-stone-300">{cat.title}</p>
                      </div>
                    );
                  })}
                </div>
                <Link
                  to="/offerings"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-300"
                >
                  Explore All Offerings <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ),
          },
          {
            id: 'pilot',
            title: 'Pilot roadmap',
            summary: 'Goals for the first year — not completed accomplishments.',
            children: (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <StatusBadge item={pilotRoadmap.phases[0].status} />
                </div>
                <p className="mb-4">{pilotRoadmap.intro}</p>
                <Link to="/pilot-roadmap" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
                  View full pilot roadmap →
                </Link>
              </>
            ),
          },
          {
            id: 'open-source',
            title: 'Open source / Creator Commons',
            summary: openSourceContent.getStatusMessage(),
            children: (
              <>
                <h3 className="text-white font-bold mb-2">{openSourceContent.headline}</h3>
                <p className="mb-4">{openSourceContent.intro}</p>
                <Link to="/open-source" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
                  Learn about the Creator Commons →
                </Link>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
