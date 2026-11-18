import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Cpu,
  Hammer,
  Leaf,
  Music,
  Sparkles,
  Users,
  Workflow,
  Check,
} from 'lucide-react';
import offers from '../data/startOffers.json';
import { ROUTES, NAV_GROUPS, isStaticPath } from '../lib/routes';
import { useContact } from '../components/ContactProvider';
import { inputClass, textareaClass } from '../components/ui';

/* The landing page, since 2026-11-18. It leads with the Greenfire Collective
   (builders, artists, land stewards) and Jordan's AI work, and sends people to
   three places: hire him (/start), join (/join), or look around.
   The old home page (council, Elders, the Creator Commons model) lives on
   whole at /vision. Prices and checkout links come from startOffers.json,
   the one home for the AI offers, so nothing here can drift from /start. */

function AnyLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return isStaticPath(to)
    ? <a href={to} className={className}>{children}</a>
    : <Link to={to} className={className}>{children}</Link>;
}

const PILLARS = [
  {
    id: 'builders',
    icon: Cpu,
    title: 'Builders',
    body: 'People who make software, AI agents, 3D worlds and tools. We build for clients, for each other, and for the commons.',
    image: '/store/decks/fellowship-council.webp',
    links: [
      { to: ROUTES.store, label: 'The store' },
      { to: ROUTES.tech, label: 'Tech and 3D' },
      { to: ROUTES.openSource, label: 'Open source' },
    ],
  },
  {
    id: 'artists',
    icon: Music,
    title: 'Artists',
    body: 'Musicians, filmmakers, game makers and performers. AI does the busywork so the art gets made and gets seen.',
    image: '/medixn/medixn-torus.webp',
    links: [
      { to: ROUTES.medixn, label: 'MEDIXN synth' },
      { to: ROUTES.rootsignal, label: 'ROOTSIGNAL game' },
      { to: ROUTES.offeringsStudio, label: 'Studio' },
    ],
  },
  {
    id: 'land',
    icon: Leaf,
    title: 'Land Stewards',
    body: 'Farmers, permaculture people and land projects. Maps, plans and tools that help land and the people on it do well.',
    image: '/blog/photos/interactive-3d-maps-for-land-projects.jpg',
    links: [
      { to: ROUTES.vision, label: 'The vision' },
      { to: ROUTES.pilotRoadmap, label: 'Pilot roadmap' },
      { to: ROUTES.invest, label: 'Funders and land' },
    ],
  },
] as const;

const AI_POINTS = [
  { icon: Bot, text: 'Agents that answer, follow up and keep your work moving' },
  { icon: Workflow, text: 'Your email, calendar, site and tools hooked up and talking to each other' },
  { icon: Sparkles, text: 'A command center on your own computer, so it stays yours' },
];

export function CollectiveHomePage() {
  const steps = offers.offers;

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,197,94,0.18),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(251,146,60,0.14),transparent_45%)]" />
        <img
          src="/brand/greenfire-hero-emblem.png"
          alt=""
          aria-hidden="true"
          width={640}
          height={640}
          className="pointer-events-none absolute right-[2%] top-1/2 hidden w-[26rem] -translate-y-1/2 opacity-90 xl:block 2xl:right-[8%] 2xl:w-[30rem]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            <Users className="h-3.5 w-3.5" /> The Greenfire Collective
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Builders, artists and land stewards,{' '}
            <span className="text-emerald-300">building with AI.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">
            I build advanced AI systems and get them running inside your work: agents, dashboards and every tool you use, hooked up and working together. Around that work is a collective of people making real things, from apps and music to gardens and land projects.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={ROUTES.start}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-400 px-7 py-4 text-base font-bold text-neutral-950 shadow-[0_0_24px_rgba(251,146,60,0.25)] hover:bg-orange-300"
            >
              Get AI set up for you <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.join}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-7 py-4 text-base font-bold text-neutral-950 shadow-[0_0_24px_rgba(52,211,153,0.2)] hover:bg-emerald-300"
            >
              Join the Collective
            </Link>
            <a
              href="#explore"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-semibold text-white hover:bg-white/10"
            >
              Look around
            </a>
          </div>
        </div>
      </section>

      {/* ——— Three doors ——— */}
      <section className="border-b border-white/5 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Link to={ROUTES.start} className="group rounded-2xl border border-orange-400/25 bg-orange-400/5 p-6 transition-colors hover:border-orange-300/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-300/80">Hire me</p>
            <h2 className="mt-2 text-xl font-bold text-white">AI built and hooked up for you</h2>
            <p className="mt-2 text-sm text-stone-400">Learn it, have it built, or build it together.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-200 group-hover:gap-2 transition-all">See the services <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <Link to={ROUTES.join} className="group rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 transition-colors hover:border-emerald-400/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300/80">Join</p>
            <h2 className="mt-2 text-xl font-bold text-white">Become part of the Collective</h2>
            <p className="mt-2 text-sm text-stone-400">Free to join. Tell us what you make and what you need.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 group-hover:gap-2 transition-all">Sign up <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <Link to={ROUTES.store} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Explore</p>
            <h2 className="mt-2 text-xl font-bold text-white">See what we have made</h2>
            <p className="mt-2 text-sm text-stone-400">Apps, agents, games and tools you can use today.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-stone-200 group-hover:gap-2 transition-all">Open the store <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>
      </section>

      {/* ——— Who we are ——— */}
      <section className="border-b border-white/5 px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">Who we are</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold text-white md:text-4xl">One collective, three kinds of people</h2>
          <p className="mt-4 max-w-2xl text-stone-400">
            Greenfire brings together people who build, people who create and people who care for land. Each one makes the others stronger.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <article key={p.id} className="flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950">
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                    <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <span className="rounded-xl bg-emerald-500/15 p-2 ring-1 ring-emerald-400/30">
                        <Icon className="h-5 w-5 text-emerald-300" />
                      </span>
                      <h3 className="text-2xl font-bold text-white">{p.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex-1 text-sm leading-relaxed text-stone-400">{p.body}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.links.map((l) => (
                        <AnyLink key={l.to} to={l.to} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:border-emerald-400/40 hover:text-emerald-300">
                          {l.label}
                        </AnyLink>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— AI services ——— */}
      <section className="relative overflow-hidden border-b border-white/5 bg-neutral-900/30 px-4 py-16 sm:px-6 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(251,146,60,0.10),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-300/80">AI services</p>
              <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Advanced AI, set up inside your real work</h2>
              <p className="mt-4 text-stone-400">
                Not a chatbot in a tab. I build the whole system on your own computer, connect it to the tools you already use, and teach you how to run it.
              </p>
              <ul className="mt-6 space-y-3">
                {AI_POINTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-stone-300">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((o, i) => (
                <Link
                  key={o.id}
                  to={ROUTES.start}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-orange-300/40"
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">{i + 1}. {o.step}</span>
                  <span className="mt-2 text-2xl font-bold text-white">{o.price_label}</span>
                  <span className="mt-2 flex-1 text-sm text-stone-400">{o.for}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-200 group-hover:gap-2 transition-all">Details <ArrowRight className="h-4 w-4" /></span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.start} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-400 px-7 py-4 text-sm font-bold text-neutral-950 hover:bg-orange-300">
              Order a service <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={offers.intake_form_url} className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white hover:bg-white/10">
              Not sure yet? Tell me about your work
            </a>
          </div>
        </div>
      </section>

      {/* ——— How it works ——— */}
      <section className="border-b border-white/5 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">How it works</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-white">Three steps, no guesswork</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Tell us about you', d: 'Join the Collective or fill in the short intake. What you make, what takes your hours.' },
              { t: 'We find the fit', d: 'I reply within a few days with the right path: a service, the membership, or a project to join.' },
              { t: 'Build and keep going', d: 'Your system gets built, you learn to run it, and the Collective keeps you moving.' },
            ].map((s, i) => (
              <li key={s.t} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-300 ring-1 ring-emerald-500/30">{i + 1}</span>
                <h3 className="mt-4 font-bold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-stone-400">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Join ——— */}
      <JoinSection />

      {/* ——— Everything on the site ——— */}
      <section id="explore" className="scroll-mt-24 border-b border-white/5 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Find your way around</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_GROUPS.map((g) => (
              <div key={g.label} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">{g.label}</h3>
                <ul className="mt-3 space-y-1">
                  {g.items.map((item) => (
                    <li key={item.path}>
                      <AnyLink to={item.path} className="group block rounded-lg px-2 py-2 hover:bg-white/5">
                        <span className="block text-sm font-semibold text-white group-hover:text-emerald-300">{item.label}</span>
                        {item.note && <span className="block text-xs text-stone-500">{item.note}</span>}
                      </AnyLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Closing ——— */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">Come build with us.</h2>
          <p className="mt-4 text-stone-400">Hire me for AI, join the Collective, or both. Most people start with one and end up doing the other.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={ROUTES.start} className="inline-flex items-center justify-center rounded-2xl bg-orange-400 px-7 py-4 text-sm font-bold text-neutral-950 hover:bg-orange-300">Get AI set up for you</Link>
            <Link to={ROUTES.join} className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-7 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300">Join the Collective</Link>
          </div>
          <p className="mt-8 text-sm text-stone-500">
            Want the bigger picture of the Green Fire Research and Innovation Center?{' '}
            <Link to={ROUTES.vision} className="font-semibold text-emerald-400 hover:text-emerald-300">Read the vision</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

const ROLES = [
  { id: 'builder', label: 'Builder', hint: 'Code, AI, 3D, tools' },
  { id: 'artist', label: 'Artist', hint: 'Music, film, games, performance' },
  { id: 'land', label: 'Land steward', hint: 'Farms, gardens, land projects' },
  { id: 'business', label: 'Business owner', hint: 'I want AI working for my business' },
] as const;

/** The free Collective sign-up. It goes to Jordan's inbox through the same
    contact sender as Get Involved, so no new server function is needed. */
export function JoinSection({ standalone = false }: { standalone?: boolean }) {
  const { submitMessage, isSubmitting } = useContact();
  const [roles, setRoles] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', email: '', location: '', make: '', need: '' });
  const [sent, setSent] = useState(false);
  const m = offers.membership;

  const toggle = (id: string) => setRoles((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabels = ROLES.filter((r) => roles.includes(r.id)).map((r) => r.label).join(', ') || 'Not chosen';
    const ok = await submitMessage({
      name: form.name,
      email: form.email,
      subject: `Greenfire Collective: new member (${roleLabels})`,
      message: [
        `I am a: ${roleLabels}`,
        `Where: ${form.location || 'Not given'}`,
        '',
        'What I make or do:',
        form.make || 'Not given',
        '',
        'What I would love help with:',
        form.need || 'Not given',
      ].join('\n'),
    });
    if (ok) setSent(true);
  };

  return (
    <section id="join" className={`scroll-mt-24 border-b border-white/5 px-4 sm:px-6 ${standalone ? 'py-12 md:py-16' : 'py-16 md:py-20'}`}>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">Join the Collective</p>
          <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Free to join. Start where you are.</h2>
          <p className="mt-4 text-stone-400">
            Tell us who you are and what you are working on. You will hear about projects, gatherings and tools from the Collective, and I will reach out if there is a fit.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Member</p>
              <p className="mt-1 text-2xl font-bold text-white">Free</p>
              <p className="mt-2 text-sm text-stone-400">Projects to join, open tools, people to build with. Fill in the form.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">{m.title}</p>
              <p className="mt-1 text-2xl font-bold text-white">{m.price_label}</p>
              <ul className="mt-3 space-y-1.5">
                {m.includes.slice(0, 4).map((i) => (
                  <li key={i} className="flex gap-2 text-xs text-stone-400"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{i}</li>
                ))}
              </ul>
              <a href={m.checkout_url} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-200 hover:text-orange-100">
                {m.button} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            Rather give your time than money? Say so in the form. Crew members join by building with us on Greenfire projects.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 md:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">
                <Check className="h-6 w-6 text-emerald-300" />
              </span>
              <h3 className="mt-4 text-2xl font-bold text-white">Welcome to the Collective</h3>
              <p className="mt-2 text-stone-400">Your sign-up is in. I will write back soon. While you wait, have a look around.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to={ROUTES.store} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">The store</Link>
                <Link to={ROUTES.start} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">AI services</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-white">I am a... <span className="font-normal text-stone-500">(pick any)</span></legend>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const on = roles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(r.id)}
                        className={`rounded-xl border px-3 py-3 text-left transition-colors ${on ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
                      >
                        <span className={`block text-sm font-semibold ${on ? 'text-emerald-200' : 'text-white'}`}>{r.label}</span>
                        <span className="block text-xs text-stone-500">{r.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-stone-300">Name
                  <input required className={`${inputClass} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </label>
                <label className="block text-sm text-stone-300">Email
                  <input required type="email" className={`${inputClass} mt-1`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </label>
              </div>
              <label className="block text-sm text-stone-300">Where are you based?
                <input className={`${inputClass} mt-1`} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, state or region" />
              </label>
              <label className="block text-sm text-stone-300">What do you make or do?
                <textarea className={`${textareaClass} mt-1`} rows={3} value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
              </label>
              <label className="block text-sm text-stone-300">What would you love help with?
                <textarea className={`${textareaClass} mt-1`} rows={3} value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300 disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Join the Collective, free'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function JoinPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            <Hammer className="h-3.5 w-3.5" /> The Greenfire Collective
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">Join builders, artists and land stewards</h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-300">One short form. Free. Tell us what you make and what you need, and we will take it from there.</p>
        </div>
      </section>
      <JoinSection standalone />
    </>
  );
}
