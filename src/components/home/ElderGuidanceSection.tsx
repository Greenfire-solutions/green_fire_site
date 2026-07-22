import { Link } from 'react-router-dom';
import { elderGuidance } from '../../data/elderGuidanceData';
import { SectionLabel, SectionTitle, BookButton } from '../ui';
import { StatusBadge, StatusNote } from '../StatusBadge';

export function ElderGuidanceSection({ embedded = false }: { embedded?: boolean }) {
  const { howWeBringElders, whatGuidanceShapes, supportCommitments } = elderGuidance;

  const content = (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SectionLabel text="Forefront Guidance" color="amber" />
        <StatusBadge item={elderGuidance.status} />
      </div>
      {!embedded && <SectionTitle title={elderGuidance.headline} />}
      <p className={`text-stone-300 leading-relaxed max-w-3xl mb-6 ${embedded ? 'text-sm' : 'text-lg'}`}>
        {elderGuidance.subheadline}
      </p>
      <p className="text-emerald-300 italic border-l-4 border-emerald-500/50 pl-6 mb-12 max-w-3xl">
        {elderGuidance.pullQuote}
      </p>

      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        {howWeBringElders.pathways.map((path) => (
          <article key={path.title} className="rounded-[2rem] border border-amber-500/20 bg-neutral-950 p-6">
            <h3 className="font-bold text-white mb-3">{path.title}</h3>
            <p className="text-sm text-stone-400 leading-relaxed">{path.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-10">
        <div className="rounded-[2rem] border border-white/10 bg-neutral-900/40 p-8">
          <h3 className="text-lg font-bold text-white mb-3">{whatGuidanceShapes.title}</h3>
          <p className="text-sm text-stone-400 mb-4 leading-relaxed">{whatGuidanceShapes.intro}</p>
          <ul className="space-y-2">
            {whatGuidanceShapes.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-stone-300">
                <span className="text-emerald-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-neutral-900/40 p-8">
          <h3 className="text-lg font-bold text-white mb-3">{supportCommitments.title}</h3>
          <p className="text-sm text-stone-400 mb-4 leading-relaxed">{supportCommitments.intro}</p>
          <ul className="space-y-2">
            {supportCommitments.commitments.slice(0, 5).map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-stone-300">
                <span className="text-amber-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StatusNote item={elderGuidance.status} />
      <div className="mt-8 flex flex-wrap gap-4 items-center">
        <BookButton subject={elderGuidance.cta.subject} body={elderGuidance.cta.body}>
          {elderGuidance.cta.label}
        </BookButton>
        <Link
          to="/how-it-works#elder-guidance"
          className="text-sm font-bold text-emerald-400 hover:text-emerald-300"
        >
          Read the full Elder guidance protocol →
        </Link>
      </div>
    </>
  );

  if (embedded) {
    return <div className="relative">{content}</div>;
  }

  return (
    <section className="border-b border-white/5 py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">{content}</div>
    </section>
  );
}
