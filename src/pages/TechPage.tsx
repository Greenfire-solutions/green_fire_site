import {
  Activity,
  Boxes,
  Cpu,
  Gauge,
  HardHat,
  Layers3,
  Map as MapIcon,
  MonitorSmartphone,
  Sparkles,
  Tent,
  TrendingUp,
} from 'lucide-react';
import { BookButton, SectionLabel, SectionTitle } from '../components/ui';
import { WireTerrain } from '../components/tech/WireTerrain';
import { ParcelViewer } from '../components/tech/ParcelViewer';

const CAPABILITIES = [
  {
    icon: MapIcon,
    title: 'Land and parcel viewers',
    body: 'Boundaries, contours, water and access on a model anyone can spin. For landowners, stewardship groups and anyone who has to explain a piece of ground to people who have never walked it.',
  },
  {
    icon: HardHat,
    title: 'Construction and phasing',
    body: 'Massing, sequencing and site logistics broken out by phase, so the board, the crew and the neighbour are all looking at the same thing on the same day.',
  },
  {
    icon: Tent,
    title: 'Festival and event sites',
    body: 'Stages, camping, vendors, gates and crowd flow laid out to scale before the first truck arrives. Share it with production, with the city, or with ticket holders.',
  },
  {
    icon: TrendingUp,
    title: 'Fundraising and campaigns',
    body: 'A page where the thing you are raising for is visible and explorable, and where progress is tied to what actually gets built rather than a bar that fills up.',
  },
  {
    icon: Cpu,
    title: 'Custom AI and UX',
    body: 'Operator dashboards, agent tooling and interfaces that put a working system in front of a person who is not technical and does not want to become technical.',
  },
  {
    icon: Activity,
    title: 'Live data and sensors',
    body: 'Readings, budgets, bookings or field data pulled into the same scene and updating on their own, so nobody has to rebuild the model to tell the truth.',
  },
];

const SECTORS = [
  'Land projects',
  'Construction',
  'Festivals and events',
  'Fundraising campaigns',
  'Research and community',
];

const PROCESS = [
  {
    step: '01',
    title: 'Source',
    body: 'Survey files, CAD, GIS exports, drone scans, site photos or a sketch on paper. I start from whatever already exists.',
  },
  {
    step: '02',
    title: 'Model',
    body: 'Terrain, structures and context built to scale, then cut down until it opens fast on a phone in a field with one bar.',
  },
  {
    step: '03',
    title: 'Interaction',
    body: 'Layers, phases and hotspots named the way your team already talks, not the way software usually names things.',
  },
  {
    step: '04',
    title: 'Package',
    body: 'One link to send, plus an embed for your own site. Desktop, tablet and phone, with a flat fallback for locked down devices.',
  },
  {
    step: '05',
    title: 'Handover',
    body: 'Source files and a short walkthrough, so the thing is yours to keep and change rather than rented back to you.',
  },
];

const INCLUDED = [
  'Interactive 3D scene on a link you own',
  'Layer and phase controls in your language',
  'Hotspots carrying your copy, photos and documents',
  'Mobile, tablet and low power fallback',
  'Embed snippet for your existing site',
  'Source files and project handover',
  'Optional live data feed or 360 stills',
  'Optional flythrough video for social and press',
];

const AI_WORK = [
  {
    icon: Layers3,
    title: 'Operator tools',
    body: 'One screen that shows what needs doing today and then does it, instead of nine browser tabs and a spreadsheet nobody trusts.',
  },
  {
    icon: Sparkles,
    title: 'Agents that stay in their lane',
    body: 'Assistants scoped to one real job, with gates that stop them acting outside it. Useful beats impressive every time.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Interfaces for non technical teams',
    body: 'The hard part was never the model. It is making the thing pressable by somebody who did not build it and has ten minutes.',
  },
];

export function TechPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-emerald-900/40">
        <WireTerrain className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,10,0.96),rgba(10,10,10,0.72)_42%,rgba(10,10,10,0.18)_78%,rgba(10,10,10,0.05))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.85),rgba(10,10,10,0.1)_45%,rgba(10,10,10,0.9))]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionLabel text="Technology" />
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            Interactive 3D for projects people have to understand before they exist.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">
            I build lightweight 3D packages for land, construction, festivals and fundraising, plus
            the custom AI and interface work behind them. Everything runs in a browser, on a phone,
            with no app to install and nothing for anyone&rsquo;s IT department to approve.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <BookButton
              subject="Green Fire: 3D and technology project"
              body={
                'Hi Green Fire,\n\nI have a project I would like to see in 3D.\n\n' +
                'Type of project (land, construction, festival, fundraising, other):\n' +
                'What exists already (survey, CAD, drone footage, photos, nothing yet):\n' +
                'Who needs to see it:\n' +
                'Rough timeline:\n\n'
              }
            >
              Start a project
            </BookButton>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Try the live demo
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {['Runs in any browser', 'No app, no plugin', 'Opens on a phone', 'Yours to keep'].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-neutral-950/60 px-4 py-2 text-xs font-semibold text-stone-400 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="What gets built" />
          <SectionTitle title="Six things this work usually turns into" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <div
                key={item.title}
                className="group rounded-[1.75rem] border border-white/10 bg-neutral-950/80 p-7 transition-all hover:border-emerald-500/30"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-400/20 transition-colors group-hover:bg-emerald-500/20">
                  <item.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-400">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-600">
              Built for
            </span>
            {SECTORS.map((sector) => (
              <span
                key={sector}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-200/80"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="scroll-mt-24 border-y border-white/5 bg-white/[0.02] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <SectionLabel text="Live demo" color="cyan" />
            <SectionTitle title="This is running on your device right now" />
            <p className="text-lg leading-relaxed text-stone-400">
              Not a video and not a screenshot. Drag the model, switch layers off, open a hotspot.
              It is a stand-in site rather than a client&rsquo;s, and it is the same kind of package
              a landowner, a build team or a festival production crew gets sent as a single link.
            </p>
          </div>
          <ParcelViewer />
        </div>
      </section>

      {/* Process */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="How it comes together" />
          <SectionTitle title="Five steps, start to handover" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6"
              >
                <span className="font-mono text-xs font-bold text-emerald-400">{item.step}</span>
                <h3 className="mb-2 mt-3 text-base font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is in a package */}
      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionLabel text="The package" />
            <SectionTitle
              title="What you get, and what you keep"
              className="text-3xl md:text-4xl"
            />
            <p className="mb-8 leading-relaxed text-stone-400">
              Scope is set per project, because a five acre parcel and a three stage festival are
              not the same job. What does not change is the handover: you finish owning the files
              and the link, not a subscription to look at your own site.
            </p>
            <BookButton
              subject="Green Fire: 3D package scope and quote"
              body={
                'Hi Green Fire,\n\nI would like a scope and quote for a 3D package.\n\n' +
                'Project:\nSite size:\nWhat exists already:\nWho it needs to reach:\nTimeline:\n\n'
              }
            >
              Ask for a scope and quote
            </BookButton>
          </div>
          <div className="rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.06] to-neutral-950 p-8">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              <Boxes className="h-4 w-4" /> Included
            </p>
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-stone-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI and UX */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Beyond 3D" color="orange" />
          <SectionTitle title="Custom AI and interface work" />
          <p className="mb-10 max-w-2xl leading-relaxed text-stone-400">
            Most of the systems I build are not 3D at all. They are the operator side: the tool that
            runs the thing once the pretty picture has done its job of getting everyone to say yes.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {AI_WORK.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-neutral-950/80 p-7">
                <div className="mb-5 inline-flex rounded-2xl bg-orange-500/10 p-3 ring-1 ring-orange-400/20">
                  <item.icon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weight */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 md:p-12">
          <div className="mb-5 inline-flex rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-400/20">
            <Gauge className="h-6 w-6 text-emerald-400" />
          </div>
          <SectionTitle title="Light on purpose" className="text-3xl md:text-4xl" />
          <p className="leading-relaxed text-stone-400">
            Both scenes on this page use no 3D engine, no downloaded models and no video. The
            geometry is generated in code and drawn straight by your graphics card, and the whole
            lot adds about twelve kilobytes to the page, measured on the built site. It matters
            more than it sounds: the people who most need to see a site plan are usually standing
            near it, on a phone, on bad signal.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Added to this page, gzipped', value: '~12 kB' },
              { label: '3D engine or library', value: 'None' },
              { label: 'Models, videos, apps', value: 'Zero' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-2xl font-bold text-emerald-300">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle title="Tell me about the project" />
          <p className="mb-8 leading-relaxed text-stone-400">
            Land, build, festival, campaign or something with no name yet. Send what you have, even
            if what you have is a rough idea and a photo of a field.
          </p>
          <BookButton
            subject="Green Fire: technology and 3D enquiry"
            body={'Hi Green Fire,\n\nHere is what I am working on:\n\n'}
          >
            Start the conversation
          </BookButton>
        </div>
      </section>
    </>
  );
}
