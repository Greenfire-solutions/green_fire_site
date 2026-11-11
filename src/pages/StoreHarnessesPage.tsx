import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, LayoutDashboard, Smartphone, Sparkles, Users } from 'lucide-react';
import { AccessForm, StoreNav } from '../components/store/StoreNav';
import { BOTS } from '../data/bots';
import catalog from '../data/agentDecks.json';

/* /store/harnesses (2026-11-11): the agent deck store. Bright and bubbly on
   purpose, so it reads as its own shop inside the Greenfire store.

   Everything here comes from src/data/agentDecks.json, which
   scripts/sync-agent-decks.mjs writes from `Main projects/Agent Store` (the
   one home of the decks, their screenshots, prices and buy links). Never
   edit the JSON by hand: rebuild the Agent Store, then run the sync. A deck
   or the harness with no price shows Get first access (a lead through
   /api/store); with a price and a Stripe link, a Buy button. */

type Deck = (typeof catalog.decks)[number] & { images: Record<string, string> };
const DECKS = catalog.decks as Deck[];
const H = catalog.harness;

/* One soft colour per deck for its bubble and card. Unknown decks get pink. */
const TINT: Record<string, string> = {
  essential: '#94a3b8',
  federation: '#2dd4bf',
  fellowship: '#818cf8',
  'goddess-temple': '#f5c451',
  mosswood: '#86c06c',
  'neon-underground': '#e879f9',
  'petal-desk': '#f9a8d4',
  'pixel-hq': '#fb923c',
  'quiet-hours': '#c4b5fd',
};
const tint = (id: string) => TINT[id] || '#f472b6';
const VIEW_LABEL: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
  command: { label: 'Command', icon: LayoutDashboard },
  council: { label: 'Roster', icon: Users },
  phone: { label: 'Phone', icon: Smartphone },
};

export function StoreHarnessesPage() {
  const [pick, setPick] = useState(0);
  const [view, setView] = useState('command');
  const [ask, setAsk] = useState<{ item: string; note?: string } | null>(null);
  const deck = DECKS[pick];

  useEffect(() => { document.title = 'Harnesses and agent decks · Greenfire Store'; }, []);
  useEffect(() => { if (!deck.images[view]) setView('command'); }, [deck, view]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (ask || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') setPick((i) => (i + 1) % DECKS.length);
      if (e.key === 'ArrowLeft') setPick((i) => (i - 1 + DECKS.length) % DECKS.length);
      if (e.key === 'Escape') setAsk(null);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [ask]);

  const get = (name: string, url: string | null, note?: string) => (url ? () => { window.location.href = url; } : () => setAsk({ item: name, note }));
  const priceText = (p: number | null) => (p ? `$${p}` : 'Opening soon');
  const pieces = BOTS.filter((b) => b.in_harness);

  return (
    <div className="relative overflow-hidden bg-[#fff7fb] text-neutral-900">
      <style>{`
        @keyframes hbFloat { 0%,100% { transform: translate(0,0) } 50% { transform: translate(0,-14px) } }
        @keyframes hbIn { from { opacity: 0; transform: translateY(10px) scale(.985) } to { opacity: 1; transform: none } }
        .hb-in { animation: hbIn .55s cubic-bezier(.2,.8,.2,1) both; }
        .hb-pop { transition: transform .35s cubic-bezier(.3,1.6,.5,1), box-shadow .35s; }
        .hb-pop:hover { transform: translateY(-4px) scale(1.015); }
        @media (prefers-reduced-motion: reduce) { .hb-in, .hb-bubble { animation: none !important; } .hb-pop { transition: none; } }
      `}</style>
      <StoreNav current="harnesses" tone="light" />

      {/* HERO */}
      <section className="relative px-4 pb-10 pt-14 md:px-8 md:pt-20" style={{ background: 'radial-gradient(90% 70% at 15% 0%, #ffd9ea 0%, transparent 60%), radial-gradient(70% 60% at 90% 10%, #ddd6fe 0%, transparent 60%), radial-gradient(60% 50% at 60% 100%, #cffafe 0%, transparent 70%)' }}>
        {[{ s: 140, x: '4%', y: '18%', c: '#fbcfe8' }, { s: 70, x: '88%', y: '12%', c: '#ddd6fe' }, { s: 100, x: '80%', y: '62%', c: '#bae6fd' }, { s: 42, x: '46%', y: '8%', c: '#fde68a' }, { s: 56, x: '12%', y: '78%', c: '#bbf7d0' }].map((b, i) => (
          <span key={i} className="hb-bubble pointer-events-none absolute rounded-full" style={{ width: b.s, height: b.s, left: b.x, top: b.y, background: `radial-gradient(circle at 30% 30%, #ffffff, ${b.c} 60%)`, boxShadow: `inset -6px -8px 18px ${b.c}, 0 10px 30px -10px ${b.c}`, opacity: 0.8, animation: `hbFloat ${6 + i}s ease-in-out ${i * 0.5}s infinite` }} />
        ))}
        <div className="relative mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-pink-600 shadow-sm ring-1 ring-pink-200">
            <Sparkles size={13} /> Harnesses
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Your AI team,{' '}
            <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">finally fun to watch.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-neutral-600 md:text-lg">
            A harness keeps your agents inside the lines: nothing goes out without your yes. A deck turns their work into a world you actually want to open every morning. Pick a deck, or bring your own agents.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#decks" className="hb-pop inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-300/40">
              Meet the decks <ArrowRight size={16} />
            </a>
            <a href="#harness" className="hb-pop rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-900 shadow-md ring-1 ring-black/5">What the harness does</a>
          </div>
        </div>

        {/* SHOWCASE: one deck big, a bubble per deck to switch */}
        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="relative rounded-[36px] bg-white/70 p-3 shadow-[0_40px_100px_-40px_rgba(190,24,93,.45)] ring-1 ring-white backdrop-blur md:p-4" style={{ boxShadow: `0 40px 100px -40px ${tint(deck.id)}` }}>
            <div className="flex items-center gap-2 px-2 pb-3 pt-1">
              <span className="h-3 w-3 rounded-full bg-[#ff6b8b]" /><span className="h-3 w-3 rounded-full bg-[#ffc94d]" /><span className="h-3 w-3 rounded-full bg-[#5fd38d]" />
              <div className="ml-3 flex gap-1 rounded-full bg-neutral-100 p-1">
                {Object.keys(deck.images).map((v) => {
                  const V = VIEW_LABEL[v];
                  if (!V) return null;
                  return (
                    <button key={v} onClick={() => setView(v)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${view === v ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}>
                      <V.icon size={12} /> {V.label}
                    </button>
                  );
                })}
              </div>
              <span className="ml-auto hidden text-[11px] font-semibold text-neutral-400 sm:block">Sample business, made up for the demo</span>
            </div>
            <div className="relative overflow-hidden rounded-[26px] bg-neutral-100" style={{ aspectRatio: view === 'phone' ? undefined : '16 / 10' }}>
              <img key={deck.id + view} src={deck.images[view] || deck.images.command} alt={`${deck.name}, ${VIEW_LABEL[view]?.label || 'Command'} view`} className={`hb-in ${view === 'phone' ? 'mx-auto max-h-[640px] w-auto py-6' : 'h-full w-full object-cover object-top'}`} />
              <button onClick={() => setPick((pick - 1 + DECKS.length) % DECKS.length)} aria-label="Previous deck" className="hb-pop absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg"><ChevronLeft size={20} /></button>
              <button onClick={() => setPick((pick + 1) % DECKS.length)} aria-label="Next deck" className="hb-pop absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg"><ChevronRight size={20} /></button>
            </div>
            <div className="flex flex-col gap-4 px-3 pb-2 pt-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">{deck.name}</h2>
                <p className="mt-1 text-sm text-neutral-600 md:text-base">{deck.blurb}</p>
                <p className="mt-2 text-xs font-semibold text-neutral-400">{deck.meta}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-lg font-black">{priceText(deck.price_usd)}</span>
                <button onClick={get(deck.name, deck.buy_url, `${deck.name} opens soon. Leave your email and you will be first in, with one email when it opens.`)} className="hb-pop rounded-full px-5 py-3 text-sm font-bold text-neutral-900 shadow-md" style={{ background: tint(deck.id) }}>
                  {deck.buy_url ? 'Get this deck' : 'Get first access'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5" role="tablist" aria-label="Choose a deck">
            {DECKS.map((d, i) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={i === pick}
                onClick={() => setPick(i)}
                className={`hb-pop group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-xs font-bold shadow-sm ring-2 transition ${i === pick ? '' : 'ring-transparent opacity-80 hover:opacity-100'}`}
                style={i === pick ? { ['--tw-ring-color' as string]: tint(d.id) } : undefined}
              >
                <span className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white" style={{ background: tint(d.id) }}>
                  <img src={d.images.command} alt="" className="h-full w-full scale-[2.2] object-cover object-[35%_30%]" loading="lazy" />
                </span>
                {d.name.replace(/^The /, '')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* EVERY DECK */}
      <section id="decks" className="scroll-mt-16 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-500">The decks</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Pick the world your agents live in.</h2>
              <p className="mt-3 max-w-2xl text-neutral-600">Each deck shows your agents beside the mission they are working on, with anything that needs your decision right next to it. Decks work with the harness or with your own agent build. New designs arrive regularly.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DECKS.map((d, i) => (
              <article key={d.id} className="hb-pop group flex flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,.35)] ring-1 ring-black/5">
                <button onClick={() => { setPick(i); setView('command'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="relative m-2.5 overflow-hidden rounded-[24px]" style={{ background: tint(d.id) }} aria-label={`Show ${d.name} large`}>
                  <img src={d.images.command} alt={`${d.name} deck`} loading="lazy" className="aspect-[16/10] w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-700 shadow">v{d.version}</span>
                </button>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: tint(d.id) }} />
                    <h3 className="text-lg font-black tracking-tight">{d.name}</h3>
                  </div>
                  <p className="mt-1.5 flex-1 text-sm text-neutral-600">{d.blurb}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-black">{priceText(d.price_usd)}</span>
                    <button onClick={get(d.name, d.buy_url)} className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-700">
                      {d.buy_url ? 'Get this deck' : 'Get first access'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* THE HARNESS */}
      <section id="harness" className="scroll-mt-16 px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-neutral-950 px-6 py-14 text-white md:px-14 md:py-20" style={{ backgroundImage: 'radial-gradient(60% 80% at 100% 0%, rgba(244,114,182,.28), transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(167,139,250,.25), transparent 60%)' }}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-300">The harness under every deck</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Agents that stay inside the lines.</h2>
              <p className="mt-4 text-stone-300">{H.lede}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={get('The harness', H.buy_url)} className="hb-pop rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-6 py-3 text-sm font-black text-neutral-950 shadow-lg shadow-pink-500/20">
                  {H.buy_url ? `Get the harness, $${H.price_usd}` : 'Get first access'}
                </button>
                <span className="text-xs font-semibold text-stone-400">Version {H.version}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {H.points.map((p, i) => (
                <div key={p.title} className="rounded-3xl bg-white/[0.05] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.08]">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-xs font-black text-neutral-950">{i + 1}</span>
                  <h3 className="mt-3 font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm text-stone-300">{p.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ['Download and double-click', 'One folder on your own computer. Nothing to host.'],
              ['Answer a few questions', 'Your AI interviews you one question at a time and fills in your business facts.'],
              ['Give it a job', 'It proposes, you say yes, and the deck shows every step as it happens.'],
            ].map(([t, b], i) => (
              <div key={t} className="flex gap-4 rounded-3xl border border-white/10 p-5">
                <span className="text-4xl font-black text-white/15">0{i + 1}</span>
                <div>
                  <p className="font-bold">{t}</p>
                  <p className="mt-1 text-sm text-stone-400">{b}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-stone-500">Needs an AI tool that can work in a folder on your computer, such as Claude Code or Codex. A plain chat window in a browser cannot run it.</p>
        </div>
      </section>

      {/* PIECES, sold alone in Bots */}
      <section className="px-4 pb-24 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">Only need a piece?</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">The harness parts are sold alone in Bots.</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {pieces.map((b) => (
                <Link key={b.id} to={`/store/bots#${b.id}`} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100">{b.name}</Link>
              ))}
            </div>
          </div>
          <Link to="/store/bots" className="hb-pop inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white md:self-auto">
            Go to Bots <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {ask && <AccessForm item={ask.item} section="harness" note={ask.note} onClose={() => setAsk(null)} />}
    </div>
  );
}
