import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Layers } from 'lucide-react';
import { AccessForm, StoreNav } from '../components/store/StoreNav';
import { botIcon } from '../components/store/botIcons';
import { BOTS, BOT_KINDS, type BotItem, type BotKind } from '../data/bots';

/* /store/bots (2026-11-11): single agents, skills and tools. The list is
   src/data/bots.ts; see there for how an item gets a price. /store/bots#id
   opens with that bot lit up, so any bot can be shared as a link. */

const KINDS = Object.keys(BOT_KINDS) as BotKind[];

export function StoreBotsPage() {
  const [kind, setKind] = useState<BotKind | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const [ask, setAsk] = useState<BotItem | null>(null);

  useEffect(() => { document.title = 'Bots: agents, skills and tools · Greenfire Store'; }, []);
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!BOTS.some((b) => b.id === id)) return;
      setKind(null);
      setLit(id);
      setTimeout(() => document.getElementById(`bot-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const shown = BOTS.filter((b) => !kind || b.kind === kind);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      <style>{`
        @keyframes btScan { from { transform: translateY(-100%) } to { transform: translateY(100%) } }
        .bt-card { transition: transform .4s cubic-bezier(.2,.8,.2,1), border-color .4s, background .4s; }
        .bt-card:hover { transform: translateY(-4px); }
        @media (prefers-reduced-motion: reduce) { .bt-card { transition: none; } .bt-scan { display: none; } }
      `}</style>
      <StoreNav current="bots" />
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.06) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(80% 60% at 50% 0%, black, transparent)' }} />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(56,189,248,.45), rgba(167,139,250,.2), transparent)' }} />

      <section className="relative px-4 pb-8 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-400">Bots</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">Hire one specialist at a time.</h1>
          <p className="mt-4 max-w-2xl text-base text-stone-300 md:text-lg">Single agents, skills and tools, pulled out of the systems Greenfire runs every day. Add one to the AI you already use, no new platform to learn.</p>

          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Kind of bot">
            <Chip on={kind === null} onClick={() => setKind(null)} color="#ffffff" label="Everything" n={BOTS.length} />
            {KINDS.map((k) => (
              <Chip key={k} on={kind === k} onClick={() => setKind(kind === k ? null : k)} color={BOT_KINDS[k].color} label={BOT_KINDS[k].plural} n={BOTS.filter((b) => b.kind === k).length} />
            ))}
          </div>
          {kind && <p className="mt-3 max-w-2xl text-sm text-stone-400">{BOT_KINDS[kind].blurb}</p>}
        </div>
      </section>

      <section className="relative px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((b) => {
            const Icon = botIcon(b.icon);
            const k = BOT_KINDS[b.kind];
            const on = lit === b.id;
            return (
              <article
                id={`bot-${b.id}`}
                key={b.id}
                className="bt-card group relative flex flex-col overflow-hidden rounded-3xl border bg-white/[0.025] p-5 backdrop-blur"
                style={{ borderColor: on ? k.color : 'rgba(255,255,255,.08)', boxShadow: on ? `0 0 0 1px ${k.color}, 0 20px 60px -20px ${k.color}` : undefined }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${k.color}80`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = on ? k.color : 'rgba(255,255,255,.08)')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl" style={{ background: `${k.color}18`, color: k.color, boxShadow: `0 0 30px -8px ${k.color}` }}>
                    <span className="bt-scan pointer-events-none absolute inset-x-0 h-1/2 opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(transparent, ${k.color}30, transparent)`, animation: 'btScan 1.6s linear infinite' }} />
                    <Icon size={26} />
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${k.color}18`, color: k.color }}>{k.label}</span>
                </div>
                <h2 className="mt-4 text-lg font-bold tracking-tight">{b.name}</h2>
                <p className="mt-1 text-sm text-stone-300">{b.line}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {b.does.map((d) => (
                    <li key={d} className="flex gap-2 text-xs text-stone-400"><Check size={14} className="mt-px shrink-0" style={{ color: k.color }} />{d}</li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] text-stone-500">Works with: {b.works_with}</p>
                {b.in_harness && (
                  <Link to="/store/harnesses#harness" className="mt-2 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-pink-300 hover:text-pink-200">
                    <Layers size={12} /> Also inside the harness
                  </Link>
                )}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                  <span className="text-sm font-bold">{b.price_usd ? `$${b.price_usd}` : 'Opening soon'}</span>
                  {b.buy_url ? (
                    <a href={b.buy_url} className="rounded-full px-4 py-2 text-xs font-bold text-neutral-950" style={{ background: k.color }}>Get it</a>
                  ) : (
                    <button onClick={() => setAsk(b)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:border-white/40 hover:bg-white/5">Get first access</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative px-4 pb-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
          <Link to="/store/harnesses" className="bt-card group flex items-center justify-between gap-6 rounded-3xl border border-white/10 p-7 hover:border-pink-300/50" style={{ background: 'linear-gradient(120deg, rgba(244,114,182,.12), rgba(167,139,250,.08))' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-pink-300">Want the whole team?</p>
              <p className="mt-1 text-xl font-bold">A harness puts these together, with a deck to watch them work.</p>
            </div>
            <ArrowRight className="shrink-0 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/start" className="bt-card group flex items-center justify-between gap-6 rounded-3xl border border-white/10 p-7 hover:border-emerald-300/50" style={{ background: 'linear-gradient(120deg, rgba(52,211,153,.1), rgba(56,189,248,.06))' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Need one that does not exist yet?</p>
              <p className="mt-1 text-xl font-bold">Greenfire builds bots around your business.</p>
            </div>
            <ArrowRight className="shrink-0 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {ask && <AccessForm item={ask.name} section="bot" onClose={() => setAsk(null)} />}
    </div>
  );
}

function Chip({ on, onClick, color, label, n }: { on: boolean; onClick: () => void; color: string; label: string; n: number }) {
  return (
    <button
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className="rounded-full px-4 py-2 text-xs font-bold transition"
      style={on ? { background: color, color: '#05080f' } : { background: `${color}14`, color }}
    >
      {label} <span className="opacity-60">{n}</span>
    </button>
  );
}
