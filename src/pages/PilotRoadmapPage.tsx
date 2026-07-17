import { pilotRoadmap } from '../data/pilotRoadmapData';
import { siteConfig } from '../config/siteConfig';
import { PageHero, SectionLabel } from '../components/ui';
import { StatusBadge } from '../components/StatusBadge';
import { usePageMeta } from '../lib/usePageMeta';

export function PilotRoadmapPage() {
  usePageMeta('Pilot Roadmap | Greenfire Innovation Center', pilotRoadmap.intro);

  return (
    <>
      <PageHero label="Pilot Development" title={pilotRoadmap.headline} subtitle={pilotRoadmap.intro} />

      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          {pilotRoadmap.phases.map((phase) => (
            <article key={phase.title}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <SectionLabel text={phase.title} color="amber" />
                <StatusBadge item={phase.status} />
              </div>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-stone-400 rounded-xl border border-white/5 bg-neutral-950 px-4 py-3">
                    <span className="text-emerald-400 shrink-0">○</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
