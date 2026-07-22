import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Panel = {
  id: string;
  title: string;
  summary?: string;
  children: ReactNode;
};

export function LearnMorePanel({ panels }: { panels: Panel[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="border-b border-white/5 py-16 px-6 bg-neutral-900/20" aria-label="Learn more">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Want more detail?</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Learn more</h2>
        <p className="text-stone-400 text-sm mb-8 max-w-2xl leading-relaxed">
          The overview above is the whole idea. Open any section below for deeper detail — nothing has been removed.
        </p>
        <div className="space-y-3">
          {panels.map((panel) => {
            const open = openId === panel.id;
            return (
              <div
                key={panel.id}
                className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : panel.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div>
                    <span className="block font-semibold text-white">{panel.title}</span>
                    {panel.summary && (
                      <span className="block text-xs text-stone-500 mt-1">{panel.summary}</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-emerald-400 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <div className="border-t border-white/5 px-5 py-6 text-stone-400 text-sm leading-relaxed">
                    {panel.children}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
