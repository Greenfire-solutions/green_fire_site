import { Link } from 'react-router-dom';
import { coreCapacities } from '../../data/capacitiesData';
import { SectionLabel, SectionTitle } from '../ui';
import { StatusNote } from '../StatusBadge';

export function CoreCapacitiesSection({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <>
      {!embedded && <SectionLabel text="Core Capacities" />}
      {!embedded && <SectionTitle title="Four Connected Capacities" />}
      {!embedded && (
        <p className="text-stone-400 max-w-3xl mb-12 leading-relaxed">
          Greenfire is organized around four capacities — not disconnected departments.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {coreCapacities.map((cap) => (
          <article key={cap.id} className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8">
            <h3 className="text-xl font-bold text-white mb-3">{cap.title}</h3>
            <p className="text-sm text-stone-400 leading-relaxed mb-4">{cap.purpose}</p>
            {cap.pullQuote && (
              <p className="text-sm text-emerald-300/90 italic border-l-2 border-emerald-500/40 pl-4 mb-4">{cap.pullQuote}</p>
            )}
            <p className="text-xs font-bold uppercase text-stone-500 mb-2">May include</p>
            <ul className="text-sm text-stone-400 space-y-1 mb-4">
              {cap.mayInclude.slice(0, 5).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <StatusNote item={cap.status} />
          </article>
        ))}
      </div>
      {!embedded && (
        <div className="mt-8 text-center">
          <Link to="/how-it-works#capacities" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
            See full operating model →
          </Link>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="border-b border-white/5 py-20 px-6">
      <div className="mx-auto max-w-7xl">{content}</div>
    </section>
  );
}
