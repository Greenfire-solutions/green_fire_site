import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Radio, Waves, Ear, HelpCircle, Hammer, Shield, Instagram, Youtube, MessageCircle, Download,
  HeartHandshake, Music2, Store, Lock, X, ChevronLeft, ChevronRight, Play,
} from 'lucide-react';
import d from '../data/rootsignal.json';
import './rootsignal.css';

/* /rootsignal: the ROOTSIGNAL game page. Lore, the build, the community
   platforms and the playtest sign-up. Every word lives in rootsignal.json
   (lore drawn from Root_Signal/docs, approved canon only). Sign-ups and
   feedback go to /api/playtest, NOT /api/lead, so a playtester is never
   followed up as a sales lead. */

const field = 'w-full rounded-xl border border-[#f0c26a]/20 bg-[#0b1510] px-4 py-3 text-sm text-[#efe6d2] placeholder-[#efe6d2]/40 focus:border-[#f0c26a]/60 focus:outline-none';

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#f0c26a]/50 sm:w-32" />
      <svg width="44" height="22" viewBox="0 0 44 22">
        <circle cx="22" cy="11" r="5" fill="#f0c26a" />
        <g stroke="#f0c26a" strokeWidth="1.2">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="22" y1="11" x2={22 + 10 * Math.cos((a * Math.PI) / 180)} y2={11 + 10 * Math.sin((a * Math.PI) / 180)} opacity="0.6" />)}</g>
        <path d="M2 11c6-6 10-6 13 0M42 11c-6-6-10-6-13 0" stroke="#7fbf6a" strokeWidth="1.4" fill="none" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#f0c26a]/50 sm:w-32" />
    </div>
  );
}

function Kicker({ text }: { text: string }) {
  return <p className="rs-display text-xs uppercase tracking-[0.3em] text-[#7fbf6a]">{text}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="rs-serif mt-2 text-3xl font-semibold leading-tight text-[#f4e7c8] md:text-5xl">{children}</h2>;
}

/* Hand-drawn glyphs for the Bio-Weave kit; lucide covers the rest. */
function Glyph({ name }: { name: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const svg = (p: ReactNode) => <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">{p}</svg>;
  switch (name) {
    case 'tendril': return svg(<g {...s}><path d="M4 28c6-2 8-8 6-13s2-10 8-10 9 5 6 9-8 3-8-1 4-4 5-2" /><path d="M12 19c2 1 4 0 5-2" /></g>);
    case 'staff': return svg(<g {...s}><path d="M7 27 25 5" /><path d="M24 3c3 1 4 4 3 6-3-1-4-3-3-6z" /><path d="M9 21c-2-1-4 0-5 2 2 1 4 0 5-2z" /></g>);
    case 'fist': return svg(<g {...s}><path d="M9 14v-3a2 2 0 0 1 4 0v2m0-3a2 2 0 0 1 4 0v3m0-2a2 2 0 0 1 4 0v3m0-1a2 2 0 0 1 4 0v5c0 5-4 9-9 9h-1c-4 0-7-3-7-7v-3a2 2 0 0 1 4 0" /><path d="M3 9 6 11M4 4l4 4M9 2l1 4" /></g>);
    case 'bloom': return svg(<g {...s}><circle cx="16" cy="16" r="3" /><path d="M16 4c3 4 3 6 0 9-3-3-3-5 0-9zM16 28c3-4 3-6 0-9-3 3-3 5 0 9zM4 16c4-3 6-3 9 0-3 3-5 3-9 0zM28 16c-4-3-6-3-9 0 3 3 5 3 9 0z" /><circle cx="16" cy="16" r="13" opacity="0.4" strokeDasharray="2 3" /></g>);
    case 'glider': return svg(<g {...s}><path d="M16 12c-5-6-11-7-14-5 4 1 7 4 8 8 2-1 4-2 6-3zM16 12c5-6 11-7 14-5-4 1-7 4-8 8-2-1-4-2-6-3z" /><path d="M16 12v14M13 22h6" /></g>);
    case 'hammer': return <Hammer className="h-8 w-8" aria-hidden="true" />;
    case 'shield': return <Shield className="h-8 w-8" aria-hidden="true" />;
    case 'radio': return <Radio className="h-7 w-7" aria-hidden="true" />;
    case 'waves': return <Waves className="h-7 w-7" aria-hidden="true" />;
    case 'ear': return <Ear className="h-7 w-7" aria-hidden="true" />;
    default: return <HelpCircle className="h-7 w-7" aria-hidden="true" />;
  }
}

const PLATFORM_ICON: Record<string, ReactNode> = {
  itch: <Download className="h-6 w-6" />,
  crowdfund: <HeartHandshake className="h-6 w-6" />,
  discord: <MessageCircle className="h-6 w-6" />,
  instagram: <Instagram className="h-6 w-6" />,
  tiktok: <Music2 className="h-6 w-6" />,
  youtube: <Youtube className="h-6 w-6" />,
  steam: <Store className="h-6 w-6" />,
};

function source() {
  try { return new URLSearchParams(location.search).get('from') || 'rootsignal'; } catch { return 'rootsignal'; }
}

async function post(body: Record<string, unknown>) {
  const r = await fetch('/api/playtest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, source: source() }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Could not send that just now.');
}

function SignupForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState('sending');
    try {
      await post({ kind: 'signup', website: f.website, name: f.name, email: f.email, platform: f.platform, input: f.input, loves: f.loves, found: f.found, updates: f.updates === 'yes' });
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that just now.');
      setState('error');
    }
  }
  if (state === 'sent')
    return (
      <div className="rs-frame p-8 text-center">
        <p className="rs-serif text-3xl font-semibold text-[#f0c26a]">{d.playtest.sent_title}</p>
        <p className="mt-3 text-[#efe6d2]/80">{d.playtest.sent_text}</p>
      </div>
    );
  return (
    <form onSubmit={submit} className="rs-frame grid gap-4 p-6 md:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="name" required placeholder="Your name or gamer tag" aria-label="Your name or gamer tag" className={field} />
      <input name="email" type="email" required placeholder="Your email" aria-label="Your email" className={field} />
      <select name="platform" required defaultValue="" aria-label="Your computer" className={field}>
        <option value="" disabled>What do you play on?</option>
        {['Mac', 'Windows', 'Linux', 'Steam Deck', 'Not sure'].map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <select name="input" required defaultValue="" aria-label="How you play" className={field}>
        <option value="" disabled>How do you play?</option>
        {['Mouse and keyboard', 'Controller', 'Laptop keyboard only', 'Not sure'].map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <input name="loves" placeholder="Games you love (helps me pick testers)" aria-label="Games you love" className={`${field} md:col-span-2`} />
      <input name="found" placeholder="How did you find ROOTSIGNAL? (optional)" aria-label="How you found ROOTSIGNAL" className={`${field} md:col-span-2`} />
      <label className="flex items-start gap-3 text-sm text-[#efe6d2]/80 md:col-span-2">
        <input type="checkbox" name="updates" value="yes" defaultChecked className="mt-0.5 h-4 w-4 accent-[#7fbf6a]" />
        Also email me devlogs and launch news. (Rarely. Unsubscribe any time.)
      </label>
      {state === 'error' && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
      <button disabled={state === 'sending'} className="rs-display rounded-xl bg-gradient-to-b from-[#f6d48a] to-[#e8913f] px-5 py-4 text-base font-semibold uppercase tracking-[0.18em] text-[#2a1606] shadow-[0_10px_30px_-10px_rgba(232,145,63,0.7)] hover:brightness-110 disabled:opacity-60 md:col-span-2">
        {state === 'sending' ? 'Sending…' : d.playtest.button}
      </button>
      <p className="text-xs text-[#efe6d2]/50 md:col-span-2">{d.playtest.note} Your email is only used for ROOTSIGNAL.</p>
    </form>
  );
}

function FeedbackForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fun, setFun] = useState(0);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState('sending');
    try {
      await post({ kind: 'feedback', website: f.website, name: f.name, email: f.email, fun, best: f.best, worst: f.worst, bugs: f.bugs, minutes: f.minutes });
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that just now.');
      setState('error');
    }
  }
  if (state === 'sent')
    return <div className="rs-frame p-8 text-center"><p className="rs-serif text-2xl font-semibold text-[#f0c26a]">Thank you. That goes straight into the next build.</p></div>;
  return (
    <form onSubmit={submit} className="rs-frame grid gap-4 p-6">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <p className="text-sm text-[#efe6d2]/80">How fun was it?</p>
        <div className="mt-2 flex gap-2" role="radiogroup" aria-label="How fun was it, 1 to 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={fun === n} onClick={() => setFun(n)}
              className={`h-11 w-11 rounded-full border text-lg transition ${fun >= n ? 'border-[#f0c26a] bg-[#f0c26a]/20 text-[#f0c26a]' : 'border-[#f0c26a]/20 text-[#efe6d2]/40 hover:border-[#f0c26a]/50'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea name="best" rows={2} placeholder="Best moment" aria-label="Best moment" className={field} />
      <textarea name="worst" rows={2} placeholder="Where you got stuck, bored or confused" aria-label="Where you got stuck" className={field} />
      <textarea name="bugs" rows={2} placeholder="Anything that broke" aria-label="Anything that broke" className={field} />
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="minutes" placeholder="Minutes played" aria-label="Minutes played" className={field} />
        <input name="name" placeholder="Name (optional)" aria-label="Name" className={field} />
        <input name="email" type="email" placeholder="Email (optional)" aria-label="Email" className={field} />
      </div>
      {state === 'error' && <p className="text-sm text-red-300">{error}</p>}
      <button disabled={state === 'sending'} className="rs-display rounded-xl border border-[#7fbf6a]/60 bg-[#7fbf6a]/10 px-5 py-3 text-sm uppercase tracking-[0.18em] text-[#cfe9c3] hover:bg-[#7fbf6a]/20 disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : d.feedback.button}
      </button>
    </form>
  );
}

function AtlasCard({ s }: { s: (typeof d.atlas.species)[number] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped} aria-label={`${s.name}. Turn the card over`}
      className={`rs-flip h-[300px] w-full text-left ${flipped ? 'is-flipped' : ''}`}>
      <div className="rs-flip-inner">
        <div className="rs-flip-face rs-parch flex flex-col p-3">
          <img src={`/rootsignal/atlas/${s.id}.jpg`} alt="" loading="lazy" className="h-[190px] w-full rounded-lg object-cover" />
          <p className="rs-serif mt-3 text-xl font-bold leading-tight">{s.name}</p>
          <p className="rs-serif text-sm italic opacity-70">{s.sci}</p>
          <p className="mt-auto text-[10px] uppercase tracking-[0.2em] opacity-60">{s.kind}</p>
        </div>
        <div className="rs-flip-face rs-flip-back rs-parch flex flex-col p-5">
          <p className="rs-display text-[11px] uppercase tracking-[0.2em] text-[#5d7d3a]">Ecology</p>
          <p className="rs-serif mt-1 text-base leading-snug">{s.fact}</p>
          <p className="rs-display mt-4 text-[11px] uppercase tracking-[0.2em] text-[#9a5a22]">In Greenhaven</p>
          <p className="rs-serif mt-1 text-base leading-snug">{s.greenhaven}</p>
          <p className="rs-serif mt-auto text-sm italic opacity-60">{s.sci}</p>
        </div>
      </div>
    </button>
  );
}

function Lightbox({ i, close, go }: { i: number; close: () => void; go: (n: number) => void }) {
  const shots = d.gallery.shots;
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go((i + 1) % shots.length);
      if (e.key === 'ArrowLeft') go((i - 1 + shots.length) % shots.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [i, close, go, shots.length]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label={shots[i].alt} onClick={close}>
      <img src={shots[i].src} alt={shots[i].alt} className="max-h-[85vh] max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
      <p className="absolute bottom-4 left-0 right-0 px-4 text-center text-sm text-[#efe6d2]/80">{shots[i].alt}</p>
      <button type="button" aria-label="Close" onClick={close} className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"><X className="h-6 w-6" /></button>
      <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go((i - 1 + shots.length) % shots.length); }} className="absolute left-2 rounded-full bg-black/60 p-2 text-white"><ChevronLeft className="h-7 w-7" /></button>
      <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); go((i + 1) % shots.length); }} className="absolute right-2 rounded-full bg-black/60 p-2 text-white"><ChevronRight className="h-7 w-7" /></button>
    </div>
  );
}

export function RootsignalPage() {
  const [shot, setShot] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    /* A shared link like /rootsignal#atlas: the section exists only after this render. */
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    fetch('/api/playtest').then((r) => (r.ok ? r.json() : { count: 0 })).then((j) => setCount(Number(j.count) || 0)).catch(() => {});
  }, []);

  return (
    <div className="rs overflow-x-hidden">
      {/* ------------------------------------------------------------ hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img src="/rootsignal/key-commons.jpg" alt="Rook running through a solarpunk village at sunset" className="rs-hero-img absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1510] via-[#0b1510]/55 to-[#0b1510]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(11,21,16,0.9),transparent_60%)]" />
        {[[12, 30, 18], [78, 22, 12], [64, 48, 22], [30, 60, 10], [88, 58, 16]].map(([x, y, r], k) => (
          <span key={k} className="rs-orb" style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, animationDelay: `${k * 1.7}s` }} />
        ))}
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 md:pb-24">
          <p className="rs-display text-xs uppercase tracking-[0.35em] text-[#cfe9c3] [text-shadow:0_2px_12px_rgba(0,0,0,0.9)] sm:text-sm">A solarpunk action RPG</p>
          <h1 className="rs-wordmark mt-3 text-5xl leading-none sm:text-7xl md:text-8xl">{d.title}</h1>
          <p className="rs-serif mt-4 text-2xl italic text-[#f4e7c8] md:text-3xl">{d.tagline}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#efe6d2]/85 md:text-lg">{d.pitch}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#playtest" className="rs-display rounded-xl bg-gradient-to-b from-[#f6d48a] to-[#e8913f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#2a1606] shadow-[0_10px_30px_-10px_rgba(232,145,63,0.8)] hover:brightness-110">Join the playtest</a>
            <a href="#build" className="rs-display inline-flex items-center gap-2 rounded-xl border border-[#f4e7c8]/40 bg-black/30 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#f4e7c8] backdrop-blur hover:bg-black/50"><Play className="h-4 w-4" /> Watch it move</a>
          </div>
          <p className="mt-6 text-sm text-[#efe6d2]/60">
            {d.status}
            {count >= 10 && <> <span className="text-[#f0c26a]">{count} people</span> have signed up to play.</>}
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- story */}
      <section id="story" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Kicker text={d.story.kicker} />
            <H2>{d.story.title}</H2>
            <div className="rs-serif mt-6 space-y-4 text-xl leading-relaxed text-[#efe6d2]/90">
              {d.story.paragraphs.map((p, k) => <p key={k} className={k === 0 ? 'rs-dropcap' : ''}>{p}</p>)}
            </div>
          </div>
          <figure className="rs-frame overflow-hidden p-2">
            <img src="/rootsignal/key-rook.jpg" alt="Rook leaping through a waterfall with living vines" loading="lazy" className="w-full rounded-xl" />
          </figure>
        </div>
      </section>

      <Divider />

      {/* -------------------------------------------- the Root Signal + Chorus */}
      <section id="signal" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <Kicker text={d.meanings.kicker} />
          <H2>{d.meanings.title}</H2>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {d.meanings.items.map((m) => (
              <div key={m.title} className="rs-frame p-6">
                <span className="text-[#f0c26a]"><Glyph name={m.icon} /></span>
                <h3 className="rs-serif mt-3 text-2xl font-semibold text-[#f4e7c8]">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#efe6d2]/75">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="relative mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-[#f0c26a]/20 bg-[radial-gradient(circle_at_50%_0%,rgba(240,194,106,0.18),transparent_60%)] px-6 py-12">
            {[[15, 25, 14], [80, 30, 20], [50, 70, 10], [25, 75, 16], [70, 80, 12]].map(([x, y, r], k) => (
              <span key={k} className="rs-orb" style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, animationDelay: `${k * 1.3}s` }} />
            ))}
            <Kicker text={d.spirits.kicker} />
            <h3 className="rs-wordmark mt-2 text-4xl md:text-5xl">{d.spirits.title}</h3>
            <p className="rs-serif relative mt-5 text-xl leading-relaxed text-[#efe6d2]/90">{d.spirits.text}</p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- world */}
      <section id="world" className="scroll-mt-20 border-y border-[#f0c26a]/10 bg-[linear-gradient(180deg,#0b1510,#102118_40%,#0b1510)] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Kicker text={d.world.kicker} />
            <H2>{d.world.title}</H2>
            <p className="mx-auto mt-4 max-w-2xl text-[#efe6d2]/75">{d.world.intro}</p>
          </div>
          <ol className="relative mt-12 space-y-6 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-gradient-to-b before:from-[#7fbf6a] before:via-[#8fb9c9] before:to-[#c8572e] md:before:left-1/2">
            {d.world.districts.map((w, k) => (
              <li key={w.name} className={`relative flex gap-5 md:w-1/2 ${k % 2 ? 'md:ml-auto md:pl-10' : 'md:flex-row-reverse md:pr-10 md:text-right'}`}>
                <span className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f0c26a]/50 bg-[#0b1510] rs-display text-sm text-[#f0c26a] md:absolute md:top-0 ${k % 2 ? 'md:-left-5' : 'md:-right-5'}`}>{k + 1}</span>
                <div className="rs-frame flex-1 p-5">
                  <h3 className="rs-serif text-2xl font-semibold text-[#f4e7c8]">{w.name}</h3>
                  <p className="mt-1 text-sm text-[#efe6d2]/75">{w.text}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#7fbf6a]">Heal it: {w.change}</p>
                </div>
              </li>
            ))}
            <li className="relative flex gap-5 md:mx-auto md:w-1/2 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[#f0c26a]/50 bg-[#0b1510] text-[#f0c26a]"><Lock className="h-4 w-4" /></span>
              <div className="flex-1 rounded-2xl border border-dashed border-[#f0c26a]/25 p-5">
                <h3 className="rs-serif text-2xl font-semibold italic text-[#f0c26a]">{d.world.hidden.name}</h3>
                <p className="mt-1 text-sm text-[#efe6d2]/70">{d.world.hidden.text}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ cast */}
      <section id="cast" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Kicker text={d.cast.kicker} />
          <H2>{d.cast.title}</H2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {d.cast.people.map((p) => {
              const foe = 'foe' in p && p.foe;
              const img = 'img' in p ? p.img : '';
              return (
                <article key={p.name} className={`rs-frame flex gap-4 p-4 ${foe ? '!border-[#c8572e]/50' : ''}`}>
                  {img ? (
                    <img src={img} alt="" loading="lazy" className="h-28 w-24 shrink-0 rounded-xl object-cover" style={{ objectPosition: 'pos' in p ? p.pos : 'center' }} />
                  ) : (
                    <span className={`rs-display flex h-28 w-24 shrink-0 items-center justify-center rounded-xl border text-3xl ${foe ? 'border-[#c8572e]/50 bg-[#c8572e]/10 text-[#e8913f]' : 'border-[#7fbf6a]/30 bg-[#7fbf6a]/5 text-[#7fbf6a]'}`} aria-hidden="true">
                      {p.name.split(' ').slice(-2).map((w) => w[0]).join('')}
                    </span>
                  )}
                  <div>
                    <h3 className="rs-serif text-xl font-semibold text-[#f4e7c8]">{p.name}</h3>
                    <p className={`text-[11px] uppercase tracking-[0.18em] ${foe ? 'text-[#e8913f]' : 'text-[#7fbf6a]'}`}>{p.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#efe6d2]/75">{p.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#7fbf6a]/30 bg-[#7fbf6a]/[0.04] p-6">
              <p className="rs-display text-sm uppercase tracking-[0.25em] text-[#7fbf6a]">The commons</p>
              {d.factions.commons.map((f) => <div key={f.name} className="mt-4"><p className="rs-serif text-xl font-semibold text-[#f4e7c8]">{f.name}</p><p className="text-sm text-[#efe6d2]/70">{f.text}</p></div>)}
            </div>
            <div className="rounded-2xl border border-[#c8572e]/40 bg-[#c8572e]/[0.05] p-6">
              <p className="rs-display text-sm uppercase tracking-[0.25em] text-[#e8913f]">The corridor</p>
              {d.factions.corridor.map((f) => <div key={f.name} className="mt-4"><p className="rs-serif text-xl font-semibold text-[#f4e7c8]">{f.name}</p><p className="text-sm text-[#efe6d2]/70">{f.text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* --------------------------------------------------------- arsenal */}
      <section id="arsenal" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <Kicker text={d.arsenal.kicker} />
              <H2>{d.arsenal.title}</H2>
            </div>
            <div className="lg:col-span-2">
              <p className="text-[#efe6d2]/75">{d.arsenal.intro}</p>
              <div className="mt-4 rounded-full border border-[#7fbf6a]/30 bg-black/40 p-1" aria-hidden="true">
                <div className="rs-flux h-3 w-[72%] rounded-full" />
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#7fbf6a]">Vital Flux</p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {d.arsenal.items.map((it) => (
              <div key={it.name} className="rs-frame group p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(127,191,106,0.45)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f0c26a]/30 bg-[radial-gradient(circle,rgba(240,194,106,0.2),transparent_70%)] text-[#f0c26a] transition group-hover:text-[#fff3c9]">
                  <Glyph name={it.icon} />
                </span>
                <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-[#7fbf6a]">{it.kind}</p>
                <h3 className="rs-serif text-2xl font-semibold text-[#f4e7c8]">{it.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#efe6d2]/75">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- build */}
      <section id="build" className="scroll-mt-20 border-y border-[#f0c26a]/10 bg-[#102118] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Kicker text={d.gallery.kicker} />
          <H2>{d.gallery.title}</H2>
          <p className="mt-3 text-sm text-[#efe6d2]/60">{d.gallery.note}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
            <figure className="mx-auto w-full max-w-[320px]">
              <video src={d.gallery.reel.src} poster={d.gallery.reel.poster} controls muted playsInline preload="none" className="aspect-[9/16] w-full rounded-2xl border border-[#f0c26a]/25 bg-black object-cover" />
              <figcaption className="mt-2 text-center text-xs text-[#efe6d2]/55">{d.gallery.reel.caption}</figcaption>
            </figure>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {d.gallery.shots.map((s, k) => (
                <button key={s.src} type="button" onClick={() => setShot(k)} className={`group relative overflow-hidden rounded-xl border border-[#f0c26a]/15 ${k === 0 ? 'col-span-2 row-span-2' : ''}`} aria-label={`Open screenshot: ${s.alt}`}>
                  <img src={s.src} alt={s.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {d.gallery.concepts.map((c) => (
              <figure key={c.src} className="rs-frame overflow-hidden p-2">
                <img src={c.src} alt={c.alt} loading="lazy" className="w-full rounded-xl" />
                <figcaption className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-[#efe6d2]/55">Concept: {c.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      {shot !== null && <Lightbox i={shot} close={() => setShot(null)} go={setShot} />}

      {/* ----------------------------------------------------------- atlas */}
      <section id="atlas" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Kicker text={d.atlas.kicker} />
            <H2>{d.atlas.title}</H2>
            <p className="mx-auto mt-4 max-w-2xl text-[#efe6d2]/75">{d.atlas.intro}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {d.atlas.species.map((s) => <AtlasCard key={s.id} s={s} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* --------------------------------------------------------- roadmap */}
      <section id="devlog" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Kicker text={d.roadmap.kicker} />
          <H2>{d.roadmap.title}</H2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {d.roadmap.columns.map((c) => {
              const tone = c.tone === 'done' ? 'text-[#7fbf6a] border-[#7fbf6a]/40' : c.tone === 'now' ? 'text-[#f0c26a] border-[#f0c26a]/40' : 'text-[#8fb9c9] border-[#8fb9c9]/40';
              return (
                <div key={c.label} className="rs-frame p-6">
                  <p className={`rs-display inline-block rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${tone}`}>{c.label}</p>
                  <ul className="mt-4 space-y-2 text-sm text-[#efe6d2]/85">
                    {c.items.map((it) => <li key={it} className="flex gap-2"><span className={tone.split(' ')[0]}>{c.tone === 'done' ? '✦' : c.tone === 'now' ? '◐' : '○'}</span><span>{it}</span></li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- community */}
      <section id="community" className="scroll-mt-20 border-y border-[#f0c26a]/10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(240,194,106,0.12),transparent_60%)] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Kicker text={d.community.kicker} />
            <H2>{d.community.title}</H2>
            <p className="mx-auto mt-4 max-w-2xl text-[#efe6d2]/75">{d.community.intro}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.community.platforms.map((p) => {
              const live = p.live && p.url;
              const inner = (
                <>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${live ? 'border-[#f0c26a]/50 text-[#f0c26a]' : 'border-[#efe6d2]/15 text-[#efe6d2]/40'}`}>{PLATFORM_ICON[p.id]}</span>
                  <div className="min-w-0">
                    <p className="rs-serif text-xl font-semibold text-[#f4e7c8]">{p.name}</p>
                    <p className="text-xs text-[#efe6d2]/65">{p.text}</p>
                    <p className={`mt-2 text-[10px] uppercase tracking-[0.22em] ${live ? 'text-[#7fbf6a]' : 'text-[#efe6d2]/40'}`}>{live ? 'Open ↗' : 'Coming soon'}</p>
                  </div>
                </>
              );
              return live ? (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="rs-frame flex gap-4 p-5 transition hover:-translate-y-1">{inner}</a>
              ) : (
                <div key={p.id} className="flex gap-4 rounded-[18px] border border-dashed border-[#efe6d2]/15 p-5">{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- playtest */}
      <section id="playtest" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Kicker text={d.playtest.kicker} />
            <H2>{d.playtest.title}</H2>
            <p className="mt-4 text-[#efe6d2]/80">{d.playtest.intro}</p>
            <div className="mt-8"><SignupForm /></div>
          </div>
          <div id="feedback" className="scroll-mt-20 lg:col-span-2">
            <h3 className="rs-serif text-3xl font-semibold text-[#f4e7c8]">{d.feedback.title}</h3>
            <p className="mt-2 text-sm text-[#efe6d2]/70">{d.feedback.intro}</p>
            <div className="mt-6"><FeedbackForm /></div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-16 text-center sm:px-6">
        <Divider />
        <p className="rs-wordmark mt-6 text-3xl">{d.title}</p>
        <p className="rs-serif mt-2 italic text-[#efe6d2]/60">{d.tagline} A Greenfire game.</p>
      </footer>
    </div>
  );
}
