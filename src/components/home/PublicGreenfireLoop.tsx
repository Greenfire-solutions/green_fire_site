import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { publicLoop } from '../../data/greenfireLoopData';
import { SectionLabel, SectionTitle } from '../ui';
import { StatusBadge } from '../StatusBadge';

export function PublicGreenfireLoop({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <>
      {!embedded && <SectionLabel text="The Process" color="cyan" />}
      {!embedded && <SectionTitle title={publicLoop.title} />}
      <p className="text-stone-400 max-w-3xl mb-12 leading-relaxed">{publicLoop.intro}</p>

      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {publicLoop.stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="relative rounded-[2rem] border border-white/10 bg-neutral-950 p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm ring-1 ring-emerald-500/20">
                {i + 1}
              </span>
              <StatusBadge item={stage.status} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{stage.title}</h3>
            <p className="text-sm text-stone-400 leading-relaxed">{stage.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="lg:hidden space-y-4">
        {publicLoop.stages.map((stage, i) => (
          <div key={stage.id} className="relative">
            <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-emerald-400 font-bold text-sm">{i + 1}. {stage.title}</span>
                <StatusBadge item={stage.status} />
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">{stage.description}</p>
            </div>
            {i < publicLoop.stages.length - 1 && (
              <div className="flex justify-center py-2 text-stone-600" aria-hidden>↓</div>
            )}
          </div>
        ))}
        <p className="text-center text-xs text-emerald-400/80 pt-2">↻ Returns to Listen — the cycle repeats</p>
      </div>

      <div className="mt-10">
        <Link
          to={publicLoop.linkPath}
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {publicLoop.linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="border-b border-white/5 bg-neutral-900/20 py-20 px-6">
      <div className="mx-auto max-w-7xl">{content}</div>
    </section>
  );
}
