import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Download, Headphones, Image as ImageIcon, Monitor, ShieldCheck, Sparkles, Waves } from 'lucide-react';
import { MEDIXN_GUMROAD_URL, MEDIXN_PRICE_USD } from '../data/medixn';

/* /medixn: the landing page for MEDIXN, the laser synthesizer plugin.
   Bought on Gumroad only (see data/medixn.ts). The words follow
   Cymatic Laser/store/listing.md and the plugin's README; nothing here
   claims a feature the plugin does not have. The title, description and
   share picture come from src/config/seo.json like every other route. */

/* MEDIXN's own colours: neon green, jade, purple and gold on near black. */
const C = { green: '#5CFF8A', jade: '#45F5C0', purple: '#A86CFF', gold: '#E6C069', ink: '#07060d' };

/* The demo video. The master is Cymatic Laser/store/video/medixn-demo-1920x1080.mp4
   (70 MB, too heavy for the repo); public/medixn/medixn-demo.mp4 is a web copy
   made from it (1280x720, H.264 CRF 28, AAC 128k, faststart):
     ffmpeg -i medixn-demo-1920x1080.mp4 -vf scale=1280:720 -c:v libx264 -preset slow \
       -crf 28 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart medixn-demo.mp4
   To swap in a new cut, replace that file (same name), or point this at a
   public R2 URL. The section only shows when a real video answers here: a
   missing file comes back as the site's HTML, and then nothing is shown. */
const DEMO_VIDEO_SRC = '/medixn/medixn-demo.mp4';
const DEMO_POSTER = '/medixn/medixn-demo-poster.jpg';

const TUNINGS = ['Solfeggio', 'Cosmic Octave', 'Chakra', 'Schumann', 'A = 432 Hz'];
const SHAPES = ['Lissajous figures', 'Flower of Life', "Metatron's Cube", 'Spinning Merkaba'];
const ENGINE = [
  'Unison, sub, colour oscillator, FM growl and grit',
  '10 filter types, including comb, formant and flanger',
  'Distortion, OTT, hyper, phaser, delay and reverb',
  'Two drawable LFOs, three envelopes, a mod matrix and 4 macros',
  'Wobble gate that cuts clean even under heavy compression',
];
const PRESETS = ['basses', 'wobbles', 'growls', 'pads', 'leads', 'plucks', 'FX', 'sacred geometry'];
const DAWS = ['Ableton Live 10, 11 and 12', 'FL Studio', 'Logic Pro', 'Bitwig', 'Reaper', 'Studio One', 'Cubase'];

function BuyButton({ big = false, label = `Get MEDIXN, $${MEDIXN_PRICE_USD}` }: { big?: boolean; label?: string }) {
  return (
    <a
      href={MEDIXN_GUMROAD_URL}
      data-buy="medixn"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold text-[#07060d] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5CFF8A]/40 ${big ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-sm'}`}
      style={{ background: `linear-gradient(135deg, ${C.green}, ${C.jade})`, boxShadow: `0 0 40px -8px ${C.green}99` }}
    >
      <Download className={big ? 'h-5 w-5' : 'h-4 w-4'} /> {label}
    </a>
  );
}

/* A drawn Lissajous figure and a Flower of Life, the kind of line MEDIXN plays. */
function Lissajous({ a = 3, b = 2, color = C.green, className = '' }: { a?: number; b?: number; color?: string; className?: string }) {
  const pts: string[] = [];
  for (let i = 0; i <= 720; i++) {
    const t = (i / 720) * Math.PI * 2;
    pts.push(`${(50 + 44 * Math.sin(a * t + Math.PI / 2)).toFixed(2)},${(50 + 44 * Math.sin(b * t)).toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="0.8" style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
    </svg>
  );
}
function FlowerOfLife({ color = C.purple, className = '' }: { color?: string; className?: string }) {
  const r = 14;
  const centers: [number, number][] = [[50, 50]];
  for (let k = 0; k < 6; k++) centers.push([50 + r * Math.cos((k * Math.PI) / 3), 50 + r * Math.sin((k * Math.PI) / 3)]);
  for (let k = 0; k < 6; k++) centers.push([50 + 2 * r * Math.cos((k * Math.PI) / 3), 50 + 2 * r * Math.sin((k * Math.PI) / 3)]);
  for (let k = 0; k < 6; k++) centers.push([50 + Math.sqrt(3) * r * Math.cos((k * Math.PI) / 3 + Math.PI / 6), 50 + Math.sqrt(3) * r * Math.sin((k * Math.PI) / 3 + Math.PI / 6)]);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r={3 * r} fill="none" stroke={color} strokeWidth="0.6" opacity="0.8" />
      {centers.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="0.5" opacity="0.75" style={{ filter: `drop-shadow(0 0 1.5px ${color})` }} />
      ))}
    </svg>
  );
}

function Eyebrow({ children, color = C.jade }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color }}>
      {children}
    </p>
  );
}

function Bullet({ children, color = C.green }: { children: React.ReactNode; color?: string }) {
  return (
    <li className="flex gap-3">
      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      <span>{children}</span>
    </li>
  );
}

/* Shows the demo only when the file is really a video. preload="none" plus
   the poster, so nothing heavy downloads until the visitor presses play
   (with sound: they chose to press it). */
function DemoVideo() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(DEMO_VIDEO_SRC, { method: 'HEAD' })
      .then((r) => { if (live && r.ok && (r.headers.get('content-type') || '').startsWith('video/')) setOk(true); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  if (!ok) return null;
  return (
    <section id="demo" className="relative scroll-mt-20 px-4 pb-6 md:px-8" aria-label="MEDIXN demo video">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black" style={{ boxShadow: `0 0 80px -30px ${C.purple}` }}>
          <video src={DEMO_VIDEO_SRC} poster={DEMO_POSTER} controls playsInline preload="none" className="aspect-video w-full" />
        </div>
        <p className="mt-3 text-center text-sm text-stone-400">Hear it before you buy. Press play with the sound up.</p>
      </div>
    </section>
  );
}

export function MedixnPage() {
  return (
    <div className="relative overflow-hidden text-stone-200" style={{ background: C.ink }}>
      {/* Night glow behind everything. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(60% 40% at 20% 0%, ${C.purple}26, transparent 70%), radial-gradient(50% 35% at 90% 10%, ${C.green}14, transparent 70%)` }} />

      {/* Hero */}
      <section className="relative px-4 pb-10 pt-12 md:px-8 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <Eyebrow>Greenfire Audio · Laser synthesizer plugin</Eyebrow>
            <h1 className="mt-3 font-serif text-5xl font-bold tracking-[0.12em] text-white md:text-7xl" style={{ textShadow: `0 0 30px ${C.green}55` }}>
              MEDIXN
            </h1>
            <p className="mt-3 text-xl font-semibold md:text-2xl" style={{ color: C.gold }}>
              See your sound. Play your shapes.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300 md:text-lg">
              MEDIXN is a laser synthesizer. Every note draws a shape, and every shape makes a sound. Under the shapes is a full bass and sound design engine built for heavy music.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <BuyButton big />
              <a href="#demo" className="inline-flex items-center gap-1 px-2 py-3 text-sm font-semibold text-stone-300 hover:text-white">
                Watch the demo <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-stone-400">
              Mac and Windows. VST3, Audio Unit and standalone app. Pay once, free 1.x updates.
            </p>
            <p className="mt-1 text-xs text-stone-500">Checkout and instant download through Gumroad.</p>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] opacity-60 blur-3xl" style={{ background: `radial-gradient(closest-side, ${C.green}33, transparent)` }} />
            <picture>
              <source srcSet="/medixn/medixn-torus.webp" type="image/webp" />
              <img
                src="/medixn/medixn-torus.png"
                alt="A glowing green torus drawn by the MEDIXN laser, with the MEDIXN name"
                width={1280}
                height={720}
                className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
                fetchPriority="high"
              />
            </picture>
          </div>
        </div>
      </section>

      <DemoVideo />

      {/* Shapes */}
      <section id="shapes" className="relative scroll-mt-20 px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow color={C.green}>Shapes</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Sacred geometry you can play. Your logo becomes sound.</h2>
            <p className="mt-4 leading-relaxed text-stone-300">
              Play a chord and watch it become a Lissajous figure, a Flower of Life, a Metatron's Cube or a spinning Merkaba. Drop in your own image, logo or drawing and MEDIXN traces it into a clean line you can play on the keyboard. You can also draw on the pad, type a word, or import an SVG or a 3D object.
            </p>
            <p className="mt-4 leading-relaxed text-stone-300">
              What you see on screen is the sound itself: the left and right channels draw the picture, the same way a real laser or oscilloscope would.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <li key={s} className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: `${C.green}55`, color: C.green, background: `${C.green}10` }}>
                  {s}
                </li>
              ))}
              <li className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: `${C.gold}66`, color: C.gold, background: `${C.gold}10` }}>
                <ImageIcon className="h-3 w-3" /> Your own logo
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl border border-white/10 bg-black/40 p-4">
              <Lissajous className="h-full w-full" />
            </div>
            <div className="aspect-square rounded-2xl border border-white/10 bg-black/40 p-4">
              <FlowerOfLife className="h-full w-full" />
            </div>
            <div className="col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <picture>
                <source srcSet="/medixn/medixn-plugin.webp" type="image/webp" />
                <img src="/medixn/medixn-plugin.png" alt="The MEDIXN plugin window: a laser shape above the sound engine panels, the tuning menu and the keyboard" width={1280} height={720} loading="lazy" className="aspect-video w-full object-cover" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* Cymatics */}
      <section className="relative border-y border-white/5 bg-white/[0.015] px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow color={C.jade}>Cymatics</Eyebrow>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold text-white md:text-4xl">Three ways to see the same sound</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: 'Laser', c: C.green, d: 'The real output as an XY beam. Fast jumps glow dim and slow curves glow bright, like a real laser.' },
              { t: 'Cymatics', c: C.jade, d: 'A square plate shaken by the real output, with sand gathering where the plate stands still. Switch to Math to see the exact pattern.' },
              { t: 'Air 3D', c: C.purple, d: 'The true shape of the sound moving in air between your two speakers, slowed right down. Drag to turn it.' },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <Waves className="h-6 w-6" style={{ color: v.c }} />
                <h3 className="mt-3 text-lg font-bold text-white">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sacred tunings and binaural beats */}
      <section className="relative px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border p-7" style={{ borderColor: `${C.gold}40`, background: `linear-gradient(160deg, ${C.gold}12, transparent 60%)` }}>
            <Sparkles className="h-6 w-6" style={{ color: C.gold }} />
            <Eyebrow color={C.gold}>Sacred tunings</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Retune the whole keyboard with one click</h2>
            <p className="mt-3 leading-relaxed text-stone-300">Play in any of these tunings straight from the menu next to the keyboard:</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {TUNINGS.map((t) => (
                <li key={t} className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ color: C.gold, background: `${C.gold}18` }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border p-7" style={{ borderColor: `${C.purple}45`, background: `linear-gradient(160deg, ${C.purple}18, transparent 60%)` }}>
            <Headphones className="h-6 w-6" style={{ color: C.purple }} />
            <Eyebrow color={C.purple}>Binaural beats</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Pick a brainwave state</h2>
            <p className="mt-3 leading-relaxed text-stone-300">
              Choose a state from the Binaural menu and MEDIXN tunes the left and right ears apart for you. Best heard on headphones.
            </p>
          </div>
        </div>
      </section>

      {/* Heavy bass engine */}
      <section className="relative border-y border-white/5 bg-white/[0.015] px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow color={C.green}>Heavy bass engine</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">A full sound design engine under the shapes</h2>
            <ul className="mt-6 space-y-3 text-stone-300">
              {ENGINE.map((e) => (
                <Bullet key={e}>{e}</Bullet>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-7">
            <p className="text-5xl font-bold text-white" style={{ textShadow: `0 0 24px ${C.green}66` }}>91</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: C.jade }}>presets to start from</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <li key={p} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-stone-300">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What you get and system requirements */}
      <section id="get" className="relative scroll-mt-20 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">One purchase, both computers</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <Monitor className="h-6 w-6" style={{ color: C.green }} />
              <h3 className="mt-3 font-bold text-white">Mac</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">Apple Silicon and Intel. VST3, Audio Unit and standalone app. macOS 10.13 or newer (Apple Silicon needs macOS 11).</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <Monitor className="h-6 w-6" style={{ color: C.jade }} />
              <h3 className="mt-3 font-bold text-white">Windows</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">Windows 10 and 11, 64-bit. VST3 and standalone app.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <Sparkles className="h-6 w-6" style={{ color: C.gold }} />
              <h3 className="mt-3 font-bold text-white">Updates</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">Free 1.x updates.</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="font-bold text-white">Works with</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              {DAWS.join(', ')}, and any DAW that loads VST3 or AU.
            </p>
          </div>
        </div>
      </section>

      {/* Mac install note */}
      <section className="relative px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border p-6 md:p-7" style={{ borderColor: `${C.jade}40`, background: `${C.jade}0a` }}>
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0" style={{ color: C.jade }} />
            <div className="text-sm leading-relaxed text-stone-300">
              <h3 className="text-base font-bold text-white">Installing on a Mac takes about a minute</h3>
              <p className="mt-2">
                MEDIXN is not signed with an Apple Developer ID yet, so the first time you open the installer your Mac asks you to confirm it. Open System Settings, then Privacy and Security, scroll to the message about MEDIXN and click Open Anyway. You only do this once, and the installer guide in the download walks you through it.
              </p>
              <p className="mt-2 text-stone-400">On Windows, if it says "Windows protected your PC", click More info, then Run anyway.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Last call */}
      <section className="relative border-t border-white/5 px-4 py-16 text-center md:px-8">
        <div className="mx-auto max-w-2xl">
          <Lissajous a={5} b={4} color={C.jade} className="mx-auto h-24 w-24 opacity-90" />
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">See your sound. Play your shapes.</h2>
          <p className="mt-3 text-stone-300">MEDIXN for Mac and Windows, ${MEDIXN_PRICE_USD}.</p>
          <div className="mt-7">
            <BuyButton big />
          </div>
          <p className="mt-6 text-sm text-stone-400">
            Questions? Email <a href="mailto:civilizationexplorer@gmail.com" className="underline decoration-white/30 hover:text-white">civilizationexplorer@gmail.com</a>.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Looking for Greenfire's apps instead? <Link to="/store" className="underline decoration-white/30 hover:text-white">Open the App Store</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
