import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { botIcon } from '../components/store/botIcons';
import { STORE_SECTIONS } from '../components/store/StoreNav';
import { BOTS, BOT_KINDS } from '../data/bots';
import decks from '../data/agentDecks.json';

/* /store, the lobby (2026-11-11). Three doors: Apps (the 3D app store that
   used to live here, now /store/apps), Harnesses (agent decks) and Bots
   (single agents, skills, tools). Every old /store link still lands where it
   meant to: a #app-id, ?q= or ?view= is forwarded to /store/apps intact. */

type Poster = { id: string; title: string; poster: string | null; ready: boolean; free: boolean; genre: string };
const MINE = 'gf-store-account';

export function StoreLobbyPage() {
  const legacy = typeof window !== 'undefined' && (window.location.hash.length > 1 || /[?&](q|view)=/.test(window.location.search));
  const [apps, setApps] = useState<Poster[]>([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const mine = (() => { try { return localStorage.getItem(MINE); } catch { return null; } })();

  useEffect(() => {
    if (legacy) return;
    document.title = 'Store · Greenfire';
    fetch('/api/store')
      .then((r) => r.json())
      .then((j) => setApps(Array.isArray(j.apps) ? j.apps : []))
      .catch(() => setApps([]));
  }, [legacy]);

  if (legacy) return <Navigate to={`/store/apps${window.location.search}${window.location.hash}`} replace />;

  const [appsDoor, harnessDoor, botsDoor] = STORE_SECTIONS;
  const posters = apps.filter((a) => a.poster).sort((x, y) => Number(y.ready && !y.free) - Number(x.ready && !x.free)).slice(0, 12);
  const forSale = apps.filter((a) => a.ready && !a.free).length;

  return (
    <div className="relative overflow-hidden bg-[#050807]">
      <style>{`
        @keyframes gfFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes gfDrift { from { transform: translateY(0) } to { transform: translateY(-50%) } }
        .gf-door { transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s, border-color .5s; }
        .gf-door:hover { transform: translateY(-6px); }
        .gf-door:hover .gf-door-art { transform: scale(1.04); }
        .gf-door-art { transition: transform .9s cubic-bezier(.2,.8,.2,1); }
        @media (prefers-reduced-motion: reduce) { .gf-door, .gf-door-art, .gf-anim { animation: none !important; transition: none !important; } }
      `}</style>
      {/* soft light behind the doors */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,.35), rgba(244,114,182,.18), transparent)' }} />

      <section className="relative px-4 pb-6 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400">The Greenfire Store</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">Everything we build, ready for yours.</h1>
          <p className="mt-4 max-w-2xl text-base text-stone-300 md:text-lg">Whole apps, agent decks that make your AI team a joy to watch, and single bots that do one job well. Pick a door.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/store/apps${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); }}
            className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur transition focus-within:border-emerald-400/60"
          >
            <Search size={18} className="shrink-0 text-emerald-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you do? Try “I run a festival”" className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-stone-500 focus:outline-none" aria-label="Search the apps" />
            <button className="shrink-0 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-bold text-neutral-950 hover:bg-emerald-300">Search</button>
          </form>
        </div>
      </section>

      <section className="relative px-4 pb-20 pt-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {/* APPS: the library, as a wall of the real app posters */}
          <Door to={appsDoor.path} accent={appsDoor.accent} label="Apps" count={forSale ? `${forSale} ready today` : 'The app library'} line={appsDoor.line} cta="Browse the apps">
            <div className="absolute inset-0 bg-[#04110f]">
              <div className="gf-door-art absolute -inset-6 grid rotate-[-6deg] grid-cols-3 gap-2 p-2">
                {(posters.length ? posters : Array.from({ length: 12 }, () => null)).map((a, i) => (
                  <div key={a?.id || i} className="aspect-square overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                    {a?.poster && <img src={a.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/40 to-transparent" />
            </div>
          </Door>

          {/* HARNESSES: bubbly, the real deck screenshots fanned out */}
          <Door to={harnessDoor.path} accent={harnessDoor.accent} label="Harnesses" count={`${decks.decks.length} agent decks`} line={harnessDoor.line} cta="Meet the decks">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 20% 10%, #ffd6e8 0%, #f9a8d4 30%, #c4b5fd 62%, #7dd3fc 100%)' }}>
              {[{ s: 90, x: '8%', y: '12%', d: 0 }, { s: 46, x: '78%', y: '8%', d: 1.2 }, { s: 64, x: '70%', y: '52%', d: 0.6 }, { s: 30, x: '18%', y: '58%', d: 1.8 }, { s: 22, x: '52%', y: '6%', d: 2.4 }].map((b, i) => (
                <span key={i} className="gf-anim absolute rounded-full bg-white/40 ring-1 ring-white/60 backdrop-blur-sm" style={{ width: b.s, height: b.s, left: b.x, top: b.y, animation: `gfFloat ${5 + i}s ease-in-out ${b.d}s infinite` }} />
              ))}
              <div className="gf-door-art absolute inset-x-0 top-10 h-56">
                {decks.decks.slice(0, 3).map((d, i) => (
                  <img
                    key={d.id}
                    src={(d.images as Record<string, string>).command}
                    alt=""
                    loading="lazy"
                    className="absolute left-1/2 top-0 w-[70%] rounded-2xl shadow-[0_20px_40px_-12px_rgba(80,20,80,.45)] ring-4 ring-white/80"
                    style={{ transform: `translateX(-50%) translateX(${(i - 1) * 22}%) rotate(${(i - 1) * 7}deg) translateY(${Math.abs(i - 1) * 14}px)`, zIndex: i === 1 ? 2 : 1 }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/30 to-transparent" />
            </div>
          </Door>

          {/* BOTS: a grid of glowing tool tiles */}
          <Door to={botsDoor.path} accent={botsDoor.accent} label="Bots" count={`${BOTS.length} agents, skills and tools`} line={botsDoor.line} cta="See the bots">
            <div className="absolute inset-0 bg-[#060b14]" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
              <div className="gf-door-art absolute inset-x-6 top-8 grid grid-cols-4 gap-3">
                {BOTS.slice(0, 12).map((b, i) => {
                  const Icon = botIcon(b.icon);
                  const c = BOT_KINDS[b.kind].color;
                  return (
                    <div key={b.id} className="gf-anim grid aspect-square place-items-center rounded-2xl ring-1" style={{ background: `${c}14`, color: c, boxShadow: `0 0 24px -8px ${c}`, ['--tw-ring-color' as string]: `${c}40`, animation: `gfFloat ${6 + (i % 4)}s ease-in-out ${(i % 5) * 0.4}s infinite` }}>
                      <Icon size={22} />
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/40 to-transparent" />
            </div>
          </Door>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5">
          <p className="text-sm text-stone-300">
            <span className="font-bold text-white">How they fit together.</span> An app is a whole working program. A harness keeps your AI agents inside the lines and its deck shows them at work. A bot is one piece you add to whatever you already run.
          </p>
          {mine ? (
            <a href={`/store/account?s=${encodeURIComponent(mine)}`} className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/5">My downloads</a>
          ) : (
            <Link to="/start" className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/5">Want it set up for you?</Link>
          )}
        </div>
      </section>
    </div>
  );
}

function Door({ to, accent, label, count, line, cta, children }: { to: string; accent: string; label: string; count: string; line: string; cta: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="gf-door group relative flex h-[440px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/10 md:h-[520px]"
      style={{ boxShadow: `0 30px 80px -40px ${accent}` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}99`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      {children}
      <div className="relative p-6 md:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>{count}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">{label}</h2>
        <p className="mt-1.5 text-sm text-stone-300">{line}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-neutral-950 transition group-hover:gap-3" style={{ background: accent }}>
          {cta} <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
