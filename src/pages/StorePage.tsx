import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Box, Check, ChevronDown, Github, LayoutGrid, Link2, Loader2, Lock, Play, Search, Sparkles, X } from 'lucide-react';
import { createWorld, GENRE_COLOR, type Genre, type StoreApp, type World } from '../components/store/world';
import { search, suggestions } from '../lib/storeSearch';

/* THE GREENFIRE APP STORE (2026-10-26). Every app Jordan built, as an object
   on a floating island in a 3D night. The catalogue comes from /api/store,
   which only the Greenfire operator's App store tab writes: what is listed,
   its bio, film and price are all decided there, never typed into this file.

   Paying (2026-10-27): Get it and both plans are Stripe payment links the
   operator made (store-sell.mjs), carried in the catalogue as buy_url and
   plans. After paying, Stripe sends the buyer to /store/account, which
   checks the payment and hands over the download. An app or plan without a
   link yet falls back to the request form, so no button is ever dead.

   The sales shape (2026-10-27): what is ready, and its price, is visible
   before anyone clicks (the shelf); a visitor finds their apps by who they
   are, not by our island names; every app panel sets buying once beside the
   membership with the real difference in dollars; and a panel never ends in
   a dead end, it shows the rest of its island.

   Search (2026-10-27): the box under the headline takes plain words, what
   the visitor does or wants, and lists the apps as they type. The matching
   is lib/storeSearch.ts over each app's tags; see there. */

type Plans = { store?: string | null; builder?: string | null };
type Catalog = { apps: StoreApp[]; genres: Record<string, Genre>; at?: string; plans?: Plans };
type Want = { kind: 'app' | 'membership' | 'builder' | 'setup' | 'notify'; app?: StoreApp };

const usd = (n: number) => `$${n}`;
/* The checkout this browser last finished, so a buyer can find their apps again. */
const MINE = 'gf-store-account';
const savedAccount = () => {
  try {
    return localStorage.getItem(MINE);
  } catch {
    return null;
  }
};
const MEMBER = 20;
const BUILDER = 100;

/* Who each island is for, in the visitor's words. The catalogue's own label
   is used for any island not named here. */
const WHO: Record<string, string> = {
  music: 'I make music or perform',
  land: 'I work with land or build',
  events: 'I run events',
  business: 'I run a small business',
  ai: 'I want an AI workstation',
  story: 'I make stories for kids',
};

/* Ready to buy first, then free, then the ones still being made ready. */
const rank = (a: StoreApp) => (a.ready && !a.free ? 0 : a.free ? 1 : 2);
const byRank = (x: StoreApp, y: StoreApp) => rank(x) - rank(y) || y.price_usd - x.price_usd || x.title.localeCompare(y.title);

function webglOk(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function StorePage() {
  const [cat, setCat] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'3d' | 'list'>(() => (typeof window !== 'undefined' && (window.innerWidth < 700 || !webglOk()) ? 'list' : '3d'));
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [readyOnly, setReadyOnly] = useState(false);
  const [want, setWant] = useState<Want | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipAt = useRef({ x: 0, y: 0 });
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const headRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'App Store · Greenfire';
    fetch('/api/store')
      .then((r) => r.json())
      .then((j: Catalog) => setCat({ apps: j.apps || [], genres: j.genres || {}, at: j.at, plans: j.plans || {} }))
      .catch(() => setError('The store could not load. Please try again in a minute.'));
  }, []);

  const apps = cat?.apps || [];
  const byId = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);
  const genres = useMemo(() => Object.entries(cat?.genres || {}).filter(([g]) => apps.some((a) => a.genre === g)), [cat, apps]);
  /* Stable, so the search does not re-run every time the 3D hover moves. */
  const islandWords = useMemo(() => (g: string) => `${cat?.genres[g]?.label || ''} ${WHO[g] || ''}`, [cat]);

  /* Share links: /store#velvet-desk opens that app, /store?view=list the list.
     A link pressed while already on the store changes only the hash, so that
     is listened for too. */
  useEffect(() => {
    if (!cat) return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('view') === 'list') setView('list');
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && cat.apps.some((a) => a.id === id)) setTimeout(() => open(id), 400);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  /* Escape closes the form first, then the app. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (want) setWant(null);
      else if (selected) open(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want, selected]);

  useEffect(() => {
    if (view !== '3d' || !cat || !apps.length || !canvasRef.current) return;
    let w: World | null = null;
    try {
      w = createWorld(canvasRef.current, apps, cat.genres, {
        onHover: (id, x, y) => {
          setHover((h) => (h === id ? h : id));
          tipAt.current = { x, y };
          if (tipRef.current) tipRef.current.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
        },
        onSelect: (id) => select(id),
        /* Every frame: move the island labels in place, without React. */
        onLabels: (labels) => {
          /* A label under the header or the shelf would sit on their buttons. */
          const top = (headRef.current?.offsetHeight || 0) - 30;
          const bottom = shelfRef.current ? shelfRef.current.offsetTop + 30 : Infinity;
          for (const l of labels) {
            const el = labelRefs.current[l.genre];
            if (!el) continue;
            const show = l.visible && l.y - 26 > top && l.y < bottom;
            el.style.transform = `translate(-50%, -100%) translate(${l.x}px, ${l.y}px)`;
            el.style.opacity = show ? '1' : '0';
            el.style.pointerEvents = show ? 'auto' : 'none';
          }
        },
      });
    } catch {
      setView('list');
      return;
    }
    worldRef.current = w;
    const fit = () => w?.setInsets((headRef.current?.offsetHeight || 0) - 40, shelfRef.current ? shelfRef.current.offsetHeight - 30 : 0);
    fit();
    const ro = new ResizeObserver(fit);
    if (headRef.current) ro.observe(headRef.current);
    if (shelfRef.current) ro.observe(shelfRef.current);
    return () => {
      ro.disconnect();
      w?.dispose();
      worldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, cat, apps]);

  function select(id: string | null) {
    setSelected(id);
    const a = id ? byIdRef.current.get(id) : null;
    document.title = a ? `${a.title} · Greenfire App Store` : 'App Store · Greenfire';
    window.history.replaceState(null, '', id ? `#${id}` : window.location.pathname + window.location.search);
  }
  const byIdRef = useRef(byId);
  byIdRef.current = byId;
  function open(id: string | null) {
    select(id);
    worldRef.current?.focus(id);
  }
  const pickGenre = (g: string | null) => {
    setGenre(g);
    select(null);
    worldRef.current?.focusGenre(g);
  };

  const sel = selected ? byId.get(selected) || null : null;
  const hov = hover ? byId.get(hover) || null : null;
  const ready = apps.filter((a) => a.ready && !a.free).length;
  const soon = apps.filter((a) => !a.ready).length;
  const shown = (a: StoreApp) => (!genre || a.genre === genre) && (!readyOnly || a.ready);
  const shelf = apps.filter((a) => a.ready && !a.free && (!genre || a.genre === genre)).sort(byRank);
  const memberTop = Math.max(0, ...apps.filter((a) => a.ready && !a.free && a.access === 'member').map((a) => a.price_usd));
  const is3d = view === '3d';
  const plans = cat?.plans || {};
  const mine = savedAccount();
  /* A plan with a checkout goes to Stripe; without one, to the request form. */
  const join = (kind: 'membership' | 'builder', app?: StoreApp) => {
    const url = kind === 'membership' ? plans.store : plans.builder;
    if (url) window.location.href = url;
    else setWant({ kind, app });
  };

  return (
    <div className="relative">
      <section className={is3d ? 'relative h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-[#04110f]' : 'relative min-h-[calc(100vh-64px)] bg-[#04110f]'}>
        {is3d && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" style={{ cursor: 'grab' }} aria-label="The Greenfire app store in 3D. Use the list view for the same apps as text." />}

        {is3d &&
          genres.map(([g, info]) => (
            <button
              key={g}
              ref={(el) => (labelRefs.current[g] = el)}
              onClick={() => pickGenre(g)}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold tracking-wide text-white backdrop-blur-sm transition-opacity"
              style={{ borderColor: `${GENRE_COLOR[g]}80`, background: `${GENRE_COLOR[g]}22`, opacity: 0 }}
            >
              {info.label}
            </button>
          ))}

        {is3d && hov && !sel && (
          <div
            ref={tipRef}
            className="pointer-events-none absolute left-0 top-0 z-20 max-w-[260px] rounded-xl border border-white/10 bg-neutral-950/90 px-3 py-2 text-xs shadow-xl"
            style={{ transform: `translate(${tipAt.current.x + 14}px, ${tipAt.current.y + 14}px)` }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-white">{hov.title}</p>
              <PriceTag a={hov} />
            </div>
            <p className="mt-0.5 text-stone-300">{hov.line}</p>
          </div>
        )}

        {/* The header: over the world in 3D, in the page flow in the list. */}
        <div ref={headRef} className={is3d ? 'pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#04110f] via-[#04110f]/75 to-transparent px-4 pb-10 pt-6 md:px-8' : 'relative px-4 pb-2 pt-6 md:px-8'}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">Greenfire App Store</p>
              <h1 className="mt-1 text-2xl font-bold text-white md:text-4xl">Software you own, made for real work</h1>
              <p className="mt-1 max-w-2xl text-sm text-stone-300">
                Pay once and keep it, or take two apps a month for {usd(MEMBER)}. Everything runs on your own computer, so your files stay yours.
              </p>
              {apps.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-emerald-300/90">
                  {ready} ready to download today{soon ? `, ${soon} more on the way` : ''}.
                </p>
              )}
            </div>
            <div className="pointer-events-auto flex flex-wrap gap-2">
              {mine && (
                <a href={`/store/account?s=${encodeURIComponent(mine)}`} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/5">
                  My apps
                </a>
              )}
              <button onClick={() => join('membership')} className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-300">
                Membership, {usd(MEMBER)} a month
              </button>
              <a href="#pricing" className="rounded-full border border-emerald-400/50 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">
                Compare plans
              </a>
              <button
                onClick={() => { select(null); setView(is3d ? 'list' : '3d'); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-white/5"
                aria-label={is3d ? 'Show the apps as a list' : 'Show the 3D store'}
              >
                {is3d ? <LayoutGrid size={14} /> : <Box size={14} />}
                {is3d ? 'List' : '3D'}
              </button>
            </div>
          </div>
          {apps.length > 0 && (
            <StoreSearch apps={apps} genreLabel={islandWords} onOpen={open} onAsk={() => setWant({ kind: 'setup' })} />
          )}
          {genres.length > 0 && (
            <div className="pointer-events-auto mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-stone-400">Find yours:</span>
              <button onClick={() => pickGenre(null)} className={`rounded-full px-3 py-1 text-xs font-semibold ${genre === null ? 'bg-white text-neutral-950' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}>
                Everything
              </button>
              {genres.map(([g, info]) => (
                <button
                  key={g}
                  onClick={() => pickGenre(genre === g ? null : g)}
                  title={info.label}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={genre === g ? { background: GENRE_COLOR[g], color: '#0a0a0a' } : { background: `${GENRE_COLOR[g]}1a`, color: GENRE_COLOR[g] }}
                >
                  {WHO[g] || info.label} <span className="opacity-70">{apps.filter((a) => a.genre === g).length}</span>
                </button>
              ))}
              {!is3d && (
                <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-stone-300">
                  <input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} className="accent-emerald-400" />
                  Ready now only
                </label>
              )}
            </div>
          )}
        </div>

        {/* The shelf: what can be taken home today, with its price, before anyone has to find it on an island. */}
        {is3d && !sel && shelf.length > 0 && (
          <div ref={shelfRef} className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#04110f] via-[#04110f]/85 to-transparent px-4 pb-4 pt-10 md:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Ready to download today</p>
                <p className="hidden text-[11px] text-stone-400 sm:block">Drag to look around. Scroll to zoom. Click any object for its film and price.</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {shelf.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => open(a.id)}
                    onMouseEnter={() => setHover(null)}
                    className="group flex w-[230px] shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-neutral-950/80 p-2 text-left backdrop-blur transition hover:border-emerald-400/50"
                  >
                    <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                      {a.poster && <img src={a.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{a.title}</p>
                      <p className="text-xs font-semibold" style={{ color: GENRE_COLOR[a.genre] }}>
                        {usd(a.price_usd)} <span className="font-normal text-stone-400">or in a plan</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!cat && !error && (
          <div className="absolute inset-0 grid place-items-center text-stone-400">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {error && <div className="absolute inset-0 grid place-items-center px-6 text-center text-stone-300">{error}</div>}
        {cat && !apps.length && !error && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-stone-300">The shelves are being stocked. Come back soon.</div>
        )}

        {!is3d && apps.length > 0 && (
          <div className="px-4 pb-16 pt-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-10">
              {genres
                .filter(([g]) => apps.some((a) => a.genre === g && shown(a)))
                .map(([g, info]) => (
                  <div key={g}>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: GENRE_COLOR[g] }}>
                      {info.label}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {apps
                        .filter((a) => a.genre === g && shown(a))
                        .sort(byRank)
                        .map((a) => (
                          <button key={a.id} onClick={() => open(a.id)} className={`group overflow-hidden rounded-2xl border bg-white/[0.03] text-left transition hover:border-white/25 ${a.ready ? 'border-white/10' : 'border-white/5 opacity-80'}`}>
                            <div className="relative aspect-video bg-neutral-900">
                              {a.poster && <img src={a.poster} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />}
                              {a.video && (
                                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                                  <Play size={10} /> film
                                </span>
                              )}
                              {a.ready && !a.free && (
                                <span className="absolute right-2 top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-neutral-950">Ready now</span>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-white">{a.title}</p>
                                <PriceTag a={a} />
                              </div>
                              <p className="mt-1 text-sm text-stone-300">{a.line}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {sel && (
          <Panel
            a={sel}
            fixed={!is3d}
            onClose={() => open(null)}
            onWant={setWant}
            onJoin={join}
            onOpen={open}
            genreLabel={cat?.genres[sel.genre]?.label || ''}
            more={apps.filter((x) => x.genre === sel.genre && x.id !== sel.id).sort(byRank).slice(0, 3)}
          />
        )}
      </section>

      <section id="pricing" className="scroll-mt-20 border-t border-white/5 bg-neutral-950 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Three ways to get your tools</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-300">Every app is a clean copy made for you, with a start here guide, delivered as a download. Free apps are always free.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-white/10 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Buy one app</p>
              <p className="mt-2 text-3xl font-bold text-white">$50 to $200</p>
              <p className="text-xs text-stone-400">once, yours to keep</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <Tick>Pay once, no monthly bill</Tick>
                <Tick>Runs on your own computer</Tick>
                <Tick>A start here guide in the box</Tick>
              </ul>
              <button onClick={() => { pickGenre(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-auto pt-6 text-left text-xs font-bold text-emerald-300 hover:text-emerald-200">
                Pick an app &rarr;
              </button>
            </div>
            <div className="relative flex flex-col rounded-2xl border-2 border-emerald-400/70 bg-emerald-400/[0.06] p-6 shadow-[0_0_40px_-12px_rgba(52,211,153,0.5)]">
              <span className="absolute -top-3 left-6 rounded-full bg-emerald-400 px-3 py-0.5 text-[11px] font-bold text-neutral-950">Best value</span>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Store membership</p>
              <p className="mt-2 text-3xl font-bold text-white">{usd(MEMBER)}<span className="text-base font-semibold text-stone-300"> a month</span></p>
              <p className="text-xs text-stone-400">{memberTop > MEMBER ? `two apps a month that sell for up to ${usd(memberTop)} each` : 'two apps a month'}</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <Tick>Take any two member apps every month</Tick>
                <Tick>New apps land on the shelf as they are made ready</Tick>
                <Tick>Picks do not roll over, so use them</Tick>
              </ul>
              <button onClick={() => join('membership')} className="mt-6 rounded-full bg-emerald-400 px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                Join for {usd(MEMBER)} a month
              </button>
            </div>
            <div className="flex flex-col rounded-2xl border border-white/10 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Builder</p>
              <p className="mt-2 text-3xl font-bold text-white">{usd(BUILDER)}<span className="text-base font-semibold text-stone-300"> a month</span></p>
              <p className="text-xs text-stone-400">every app, nothing to choose</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                <Tick>Every app, including the bigger tools</Tick>
                <Tick>A new tool every week</Tick>
                <Tick>A monthly review of how you use them</Tick>
              </ul>
              <button onClick={() => join('builder')} className="mt-6 rounded-full border border-emerald-400/50 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-400/10">
                Become a Builder
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-white">Would rather not install anything yourself?</p>
              <p className="text-sm text-stone-300">Greenfire sets it up on your computer, connects your accounts and shows you how it works. From $500.</p>
            </div>
            <button onClick={() => setWant({ kind: 'setup' })} className="shrink-0 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
              Have it set up for me
            </button>
          </div>

          <div className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold text-white">Questions</h2>
            <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
              <Faq q="How do I get an app?">
                Press Get it and pay by card through Stripe. You land straight on your download page, and the same link comes by email so you never lose it. Every app arrives as a zip with a start here guide inside.
              </Faq>
              <Faq q="What do I need to run it?">
                A computer you can install things on. The start here guide walks you through it. If you would rather not, Greenfire will set it up for you, from $500.
              </Faq>
              <Faq q="How does the membership work?">
                {usd(MEMBER)} a month lets you pick any two member apps each month, from your membership page. Apps you pick stay yours. Picks you do not use do not roll over. Builder, at {usd(BUILDER)} a month, includes every app, the bigger tools too. Cancel any time by replying to your welcome email.
              </Faq>
              <Faq q="What does Coming soon mean?">
                The app is built, but the copy for other people is still being cleaned and checked so nothing private goes out with it. Press Tell me and you get one email when it is ready.
              </Faq>
              <Faq q="I lost my download link">
                <LostLink />
              </Faq>
              <Faq q="Does my information leave my computer?">
                The apps run on your own computer and keep their files there. Where an app can connect to an outside service, like email or AI, you choose whether to connect it.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      {want && <Reserve want={want} onClose={() => setWant(null)} />}
    </div>
  );
}

/* Examples that rotate in the empty box, so a visitor sees they can type a
   sentence and not just a product name. */
const EXAMPLES = ["I'm a DJ and need more gigs", 'make reels from my clips', 'plan my farm', 'run a festival', 'answer my booking emails', 'design my land'];

function StoreSearch({ apps, genreLabel, onOpen, onAsk }: { apps: StoreApp[]; genreLabel: (g: string) => string; onOpen: (id: string) => void; onAsk: () => void }) {
  /* /store?q=dj+gigs opens with that search typed and its results showing,
     so a search can be shared as a link. */
  const [q, setQ] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : ''));
  const [focus, setFocus] = useState(() => q.length > 0);
  const [active, setActive] = useState(0);
  const [example, setExample] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* On a near tie, what can be taken home today comes first. */
  const hits = useMemo(
    () => search(apps, q, genreLabel).map((h) => ({ ...h, score: h.score * (h.app.ready && !h.app.free ? 1.15 : 1) })).sort((x, y) => y.score - x.score).slice(0, 8),
    [apps, q, genreLabel],
  );
  const starts = useMemo(() => suggestions(apps, 7), [apps]);
  const typed = q.trim().length > 0;

  useEffect(() => {
    if (focus || typed) return;
    const t = setInterval(() => setExample((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, [focus, typed]);
  useEffect(() => setActive(0), [q]);
  /* A click anywhere else closes the results. */
  useEffect(() => {
    const away = (e: PointerEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocus(false); };
    window.addEventListener('pointerdown', away);
    return () => window.removeEventListener('pointerdown', away);
  }, []);
  /* "/" jumps to the box from anywhere on the store, as on most sites. */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const pick = (id: string) => { setFocus(false); inputRef.current?.blur(); onOpen(id); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); pick(hits[active].app.id); }
    else if (e.key === 'Escape') { e.stopPropagation(); if (q) setQ(''); else { setFocus(false); inputRef.current?.blur(); } }
  };
  const open = focus && (typed || starts.length > 0);

  return (
    <div ref={boxRef} className="pointer-events-auto relative mx-auto mt-5 max-w-7xl">
      <div className={`flex max-w-2xl items-center gap-3 rounded-2xl border bg-neutral-950/85 px-4 py-3 shadow-xl backdrop-blur transition ${focus ? 'border-emerald-400/70' : 'border-white/15'}`}>
        <Search size={18} className="shrink-0 text-emerald-300" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onKeyDown={onKey}
          placeholder={`Say what you do or need: "${EXAMPLES[example]}"`}
          aria-label="Search the apps by what you do or what you need"
          role="combobox"
          aria-expanded={open}
          aria-controls="store-search-results"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-stone-400 focus:outline-none md:text-base"
        />
        {q && (
          <button onClick={() => { setQ(''); inputRef.current?.focus(); }} className="rounded-full p-1 text-stone-400 hover:bg-white/10 hover:text-white" aria-label="Clear the search">
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div id="store-search-results" role="listbox" className="absolute left-0 top-full z-40 mt-2 max-h-[60vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur">
          {!typed ? (
            <div className="p-2">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">Start with who you are</p>
              <div className="flex flex-wrap gap-2">
                {starts.map((s) => (
                  <button key={s} onClick={() => { setQ(s); inputRef.current?.focus(); }} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-stone-200 hover:bg-emerald-400/15 hover:text-emerald-200">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length ? (
            <>
              <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                {hits.length === 1 ? 'One app fits' : `${hits.length} apps fit`}
              </p>
              {hits.map((h, i) => (
                <button
                  key={h.app.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(h.app.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left ${i === active ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                    {h.app.poster && <img src={h.app.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-bold text-white">{h.app.title}</p>
                      <PriceTag a={h.app} />
                    </div>
                    <p className="truncate text-xs text-stone-300">{h.app.line}</p>
                    {h.why.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {h.why.map((w) => (
                          <span key={w} className="rounded-full px-2 py-px text-[10px] font-semibold" style={{ background: `${GENRE_COLOR[h.app.genre] || '#8CC63F'}22`, color: GENRE_COLOR[h.app.genre] || '#8CC63F' }}>
                            {w}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="p-3 text-sm text-stone-300">
              <p>No app matches that yet.</p>
              <button onClick={() => { setFocus(false); onAsk(); }} className="mt-2 text-xs font-bold text-emerald-300 hover:text-emerald-200">
                Tell Greenfire what you need, and we can build or set it up for you &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />
      <span>{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
        {q}
        <ChevronDown size={16} className="shrink-0 text-stone-400 transition group-open:rotate-180" />
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-stone-300">{children}</div>
    </details>
  );
}

function PriceTag({ a }: { a: StoreApp }) {
  if (a.free) return <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">Free</span>;
  if (!a.ready) return <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-stone-300">Soon</span>;
  return <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white">{usd(a.price_usd)}</span>;
}

function Panel({ a, fixed, onClose, onWant, onJoin, onOpen, genreLabel, more }: {
  a: StoreApp; fixed: boolean; onClose: () => void; onWant: (w: Want) => void; onJoin: (kind: 'membership' | 'builder', app?: StoreApp) => void; onOpen: (id: string) => void; genreLabel: string; more: StoreApp[];
}) {
  const color = GENRE_COLOR[a.genre] || '#8CC63F';
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/store#${a.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked: the address bar already holds the same link. */
    }
  };
  const save = a.price_usd - MEMBER;
  return (
    <aside
      className={`${fixed ? 'fixed bottom-0 md:top-24' : 'absolute bottom-0 md:top-4'} inset-x-0 z-[55] max-h-[82%] overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur md:bottom-4 md:left-auto md:right-4 md:max-h-none md:w-[440px] md:rounded-3xl`}
      aria-label={a.title}
    >
      <div className="relative aspect-video overflow-hidden bg-black md:rounded-t-3xl">
        {a.video ? (
          <video key={a.video} src={a.video} poster={a.poster || undefined} controls muted autoPlay playsInline loop className="h-full w-full object-cover" />
        ) : a.poster ? (
          <img src={a.poster} alt={`${a.title} on screen`} className="h-full w-full object-cover" />
        ) : null}
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80" aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{genreLabel}</p>
          <button onClick={share} className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-white">
            <Link2 size={12} /> {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
        <h2 className="mt-1 text-2xl font-bold text-white">{a.title}</h2>
        <p className="mt-1 text-sm font-semibold text-stone-200">{a.line}</p>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">{a.bio}</p>

        <div className="mt-6 space-y-3">
          {a.free ? (
            <>
              <p className="text-sm text-stone-300"><b className="text-emerald-300">Free</b>, open source, for everyone.</p>
              {a.github && (
                <a href={a.github} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                  <Github size={16} /> Get it on GitHub
                </a>
              )}
            </>
          ) : a.ready ? (
            <>
              {a.buy_url ? (
                <a href={a.buy_url} className="block w-full rounded-full bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                  Get it, {usd(a.price_usd)} once
                </a>
              ) : (
                <button onClick={() => onWant({ kind: 'app', app: a })} className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                  Get it, {usd(a.price_usd)} once
                </button>
              )}
              {a.access === 'builder' ? (
                <button onClick={() => onJoin('builder', a)} className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.05] px-4 py-3 text-left hover:bg-emerald-400/10">
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-200"><Lock size={14} /> Or Builder, {usd(BUILDER)} a month</span>
                  <span className="mt-0.5 block text-xs text-stone-300">One of the bigger tools. Builder includes it and every other app.</span>
                </button>
              ) : (
                <button onClick={() => onJoin('membership', a)} className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.05] px-4 py-3 text-left hover:bg-emerald-400/10">
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-200"><Sparkles size={14} /> Or take it with the membership, {usd(MEMBER)} a month</span>
                  <span className="mt-0.5 block text-xs text-stone-300">
                    Pick this app plus one more this month{save > 0 ? `, ${usd(save)} less than buying this one alone` : ''}.
                  </span>
                </button>
              )}
              <ul className="space-y-1.5 pt-1 text-xs text-stone-300">
                <Tick>A clean copy made for you, with a start here guide</Tick>
                <Tick>Runs on your own computer</Tick>
                <Tick>Download straight after paying, by card through Stripe</Tick>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-300"><b className="text-white">Coming soon.</b> This one is being made ready for other people to use.</p>
              <button onClick={() => onWant({ kind: 'notify', app: a })} className="w-full rounded-full border border-emerald-400/50 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-400/10">
                Tell me when it is ready
              </button>
            </>
          )}
          <button onClick={() => onWant({ kind: 'setup', app: a })} className="w-full rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-white/5">
            Want it set up for you? From $500
          </button>
        </div>

        {more.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Also on this island</p>
            <div className="mt-2 space-y-2">
              {more.map((m) => (
                <button key={m.id} onClick={() => onOpen(m.id)} className="flex w-full items-center gap-3 rounded-xl border border-white/10 p-2 text-left hover:border-white/25">
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                    {m.poster && <img src={m.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{m.title}</p>
                    <p className="truncate text-xs text-stone-400">{m.line}</p>
                  </div>
                  <PriceTag a={m} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* Sends nothing here: the operator emails the links, and only to an
   address that has paid, so this cannot reveal who bought what. */
function LostLink() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    try {
      const r = await fetch('/api/store?action=resend', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), website: f.get('website') }) });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };
  if (state === 'done') return <span>Thank you. If that address bought something, its links are on the way by email, usually within the hour.</span>;
  return (
    <span className="block">
      Your download page link is in the email Greenfire sent after you paid. Cannot find it? Enter the email you paid with.
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input name="email" type="email" required autoComplete="email" placeholder="Email you paid with" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400/60 focus:outline-none" />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button disabled={state === 'sending'} className="shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-neutral-950 disabled:opacity-60">Send my links</button>
      </form>
      {state === 'error' && <span className="mt-2 block text-rose-300">That did not send. Please email civilizationexplorer@gmail.com.</span>}
    </span>
  );
}

function Reserve({ want, onClose }: { want: Want; onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const app = want.app;
  const title =
    want.kind === 'membership' ? `Store membership, ${usd(MEMBER)} a month`
      : want.kind === 'builder' ? `Builder, ${usd(BUILDER)} a month`
        : want.kind === 'setup' ? (app ? `Set up ${app.title} for me` : 'Set it up for me')
          : want.kind === 'notify' ? `${app?.title}: tell me when it is ready`
            : `${app?.title}, ${usd(app?.price_usd || 0)}`;
  const note =
    want.kind === 'setup' ? 'Greenfire installs it on your computer, connects your accounts and shows you how it works. Setup starts at $500.'
      : want.kind === 'notify' ? 'One email when it is ready to download. Nothing else.'
        : want.kind === 'membership' && app ? `Checkout is opening soon. Leave your details and you will be first in, starting with ${app.title}.`
          : want.kind === 'builder' && app ? `Checkout is opening soon. Leave your details and you will be first in, with ${app.title} and every other app.`
            : 'Checkout is opening soon. Leave your details and you will be the first to get it.';

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    try {
      const r = await fetch('/api/store?action=reserve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          email: f.get('email'),
          business: f.get('business'),
          website: f.get('website'),
          want: want.kind,
          app: app?.title || '',
          message: '',
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not send that.');
      setState('done');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not send that.');
      setState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-white/5" aria-label="Close"><X size={18} /></button>
        </div>
        {state === 'done' ? (
          <div className="mt-4">
            <p className="text-sm text-stone-200">
              {want.kind === 'notify' ? `Got it. You will get one email when ${app?.title} is ready.` : 'Got it. You are on the list, and Greenfire will write to you personally.'}
            </p>
            <button onClick={onClose} className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-neutral-950"><ArrowLeft size={14} /> Back to the store</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <p className="text-sm text-stone-300">{note}</p>
            <input name="name" required autoFocus autoComplete="name" placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400/60 focus:outline-none" />
            <input name="email" type="email" required autoComplete="email" placeholder="Email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400/60 focus:outline-none" />
            <input name="business" placeholder="Your business or project (optional)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400/60 focus:outline-none" />
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {state === 'error' && <p className="text-sm text-rose-300">{msg}</p>}
            <button disabled={state === 'sending'} className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-emerald-300 disabled:opacity-60">
              {state === 'sending' ? 'Sending...' : want.kind === 'notify' ? 'Tell me' : 'Count me in'}
            </button>
            <p className="text-center text-[11px] text-stone-500">No payment now. Your email is only used to reach you about this.</p>
          </form>
        )}
      </div>
    </div>
  );
}
