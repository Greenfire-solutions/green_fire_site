import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  homepageHero,
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
import { PageHero, SectionLabel, SectionTitle, BookButton } from '../components/ui';
import { PublicGreenfireLoop } from '../components/home/PublicGreenfireLoop';
import { CoreCapacitiesSection } from '../components/home/CoreCapacitiesSection';
import { StatusBadge, StatusNote } from '../components/StatusBadge';
import { usePageMeta } from '../lib/usePageMeta';
import { getServiceIcon } from '../lib/icons';

export function HomePage() {
  usePageMeta(siteConfig.seo.homeTitle, siteConfig.seo.homeDescription);

  return (
    <>
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

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="The Need" color="orange" />
          <SectionTitle title={needSection.headline} />
          {needSection.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="text-stone-400 leading-relaxed mb-4">{p}</p>
          ))}
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="What Greenfire Is" />
          <SectionTitle title={whatIsSection.headline} />
          {whatIsSection.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="text-stone-400 leading-relaxed mb-4">{p}</p>
          ))}
          <p className="mt-8 text-lg font-medium text-emerald-300 border-l-4 border-emerald-500/50 pl-6">
            {siteConfig.pullStatement}
          </p>
          <p className="mt-6 text-sm text-stone-500 leading-relaxed">{siteConfig.poweredByStatement}</p>
        </div>
      </section>

      <PublicGreenfireLoop />

      <CoreCapacitiesSection />

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SectionLabel text="Example Project" color="orange" />
            <StatusBadge item={exampleProject.status} />
          </div>
          <SectionTitle title={exampleProject.headline} />
          <p className="text-stone-400 mb-6"><strong className="text-white">{exampleProject.title}:</strong> {exampleProject.signal}</p>
          <div className="space-y-4">
            {exampleProject.steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-white/5 bg-neutral-950 p-4">
                <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
                <p className="text-sm text-stone-400">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Community Media" color="cyan" />
          <SectionTitle title={communityMediaSpaces.headline} />
          <p className="text-stone-400 mb-6 leading-relaxed">{communityMediaSpaces.intro}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {communityMediaSpaces.spaces.map((s) => (
              <span key={s} className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-stone-300">{s}</span>
            ))}
          </div>
          <BookButton subject={communityMediaSpaces.cta.subject}>{communityMediaSpaces.cta.label}</BookButton>
          <StatusNote item={communityMediaSpaces.status} />
        </div>
      </section>

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Participate" />
          <SectionTitle title="Ways to Participate" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participationPathways.map((path) => (
              <div key={path.id} className="rounded-2xl border border-white/10 bg-neutral-950 p-6 flex flex-col">
                <h3 className="font-bold text-white mb-2">{path.title}</h3>
                <p className="text-sm text-stone-400 flex-grow mb-4">{path.description}</p>
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
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Start Small" />
          <h2 className="text-2xl font-bold text-white mb-4">{condensedReplication.title}</h2>
          <p className="flex flex-wrap justify-center gap-2 text-sm text-emerald-300 font-medium mb-4">
            {condensedReplication.steps.map((s, i) => (
              <span key={s}>{s}{i < condensedReplication.steps.length - 1 ? ' →' : ''}</span>
            ))}
          </p>
          <p className="text-sm text-stone-500">{condensedReplication.note}</p>
        </div>
      </section>

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Offerings Preview" />
          <SectionTitle title={offeringsPreview.title} />
          <p className="text-stone-400 max-w-3xl mb-8 text-sm">{offeringsPreview.statement}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            {offeringsPreview.categories.map((cat) => {
              const Icon = getServiceIcon(cat.icon);
              return (
                <div key={cat.title} className="rounded-2xl border border-white/5 bg-neutral-950 p-4 text-center">
                  <Icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-stone-300">{cat.title}</p>
                </div>
              );
            })}
          </div>
          <Link
            to="/offerings"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300"
          >
            Explore All Offerings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SectionLabel text="Pilot" color="amber" />
            <StatusBadge item={pilotRoadmap.phases[0].status} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{pilotRoadmap.headline}</h2>
          <p className="text-stone-400 text-sm mb-4">{pilotRoadmap.intro}</p>
          <Link to="/pilot-roadmap" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
            View full pilot roadmap →
          </Link>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Open Source" />
          <h2 className="text-2xl font-bold text-white mb-3">{openSourceContent.headline}</h2>
          <p className="text-stone-400 text-sm mb-4">{openSourceContent.getStatusMessage()}</p>
          <Link to="/open-source" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
            Learn about the Creator Commons →
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-white mb-8">{finalCta.headline}</h2>
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
    </>
  );
}
