import { useState, type FormEvent } from 'react';
import { PageHero, SectionLabel } from '../components/ui';
import data from '../data/investData.json';

/* /invest: the page investors, funders and landowners are sent to. Every word
   and number comes from investData.json, which mirrors the private canon in
   _PLANS/00_Current/GREENFIRE_CANON.md. Contact is a plain email on purpose:
   /api/lead feeds the AI services follow up, and an investor must never get an
   AI workshop nudge. */

/* The data room is a private page at /p/<code>, served from Blob storage
   (api/share.ts), never from this public repo. Jordan gives an investor the
   code; this box only turns it into that address. A wrong code shows the
   share page's own "This link is not active" message. */
function AccessBox() {
  const [code, setCode] = useState('');
  function go(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (c.length >= 12) window.location.href = `/p/${c}`;
  }
  return (
    <form onSubmit={go} className="mx-auto mt-10 flex max-w-md flex-col gap-3 border-t border-emerald-500/20 pt-8 sm:flex-row">
      <label htmlFor="access" className="sr-only">Investor access code</label>
      <input id="access" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Have an access code?" autoComplete="off"
        className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none" />
      <button className="h-12 rounded-xl border border-emerald-500/40 px-6 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10">Open the data room</button>
    </form>
  );
}

const mailto = `mailto:${data.contact.email}?subject=${encodeURIComponent(data.contact.subject)}`;

function Section({ label, title, intro, children, tint = false }: { label?: string; title: string; intro?: string; children: React.ReactNode; tint?: boolean }) {
  return (
    <section className={`px-6 py-16 ${tint ? 'border-y border-white/5 bg-neutral-900/20' : ''}`}>
      <div className="mx-auto max-w-6xl">
        {label && <SectionLabel text={label} />}
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        {intro && <p className="mb-10 max-w-3xl text-lg leading-relaxed text-stone-400">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

function List({ items, mark, tone }: { items: string[]; mark: string; tone: string }) {
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-stone-300">
          <span className={`mt-0.5 shrink-0 ${tone}`}>{mark}</span>
          {i}
        </li>
      ))}
    </ul>
  );
}

export function InvestPage() {
  const { hero, status, loop, campus, location, academy, phases, model, money, impact, ways, contact } = data;
  return (
    <>
      <PageHero label={hero.label} title={hero.title} subtitle={hero.subtitle}>
        <a href="#contact" className="inline-block rounded-2xl bg-emerald-400 px-8 py-4 text-base font-semibold text-neutral-950 shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:bg-emerald-300">
          {hero.cta}
        </a>
      </PageHero>

      <Section label="Status" title={status.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <p className="mb-4 font-semibold text-emerald-300">What is real today</p>
            <List items={status.have} mark="●" tone="text-emerald-400" />
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
            <p className="mb-4 font-semibold text-orange-200">What is not in place yet</p>
            <List items={status.not_yet} mark="○" tone="text-orange-300" />
          </div>
        </div>
      </Section>

      <Section label="The model" title={loop.title} intro={loop.intro} tint>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loop.steps.map(([name, what], n) => (
            <li key={name} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <p className="font-mono text-xs text-emerald-500">{String(n + 1).padStart(2, '0')}</p>
              <p className="mt-1 font-semibold text-white">{name}</p>
              <p className="mt-2 text-sm text-stone-400">{what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section label="The campus" title={campus.title} intro={campus.intro}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campus.zones.map(([name, what]) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
              <p className="font-semibold text-white">{name}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">{what}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Location" title={location.title} intro={location.intro} tint>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold text-stone-200">How we score a site</p>
            <List items={location.criteria} mark="✓" tone="text-emerald-400" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <p className="mb-3 font-semibold text-stone-200">Candidate regions</p>
            <p className="text-sm leading-relaxed text-stone-400">{location.candidates}</p>
          </div>
        </div>
      </Section>

      <Section label="Education" title={academy.title} intro={academy.intro}>
        <List items={academy.points} mark="●" tone="text-emerald-400" />
      </Section>

      <Section label="Capital" title={phases.title} intro={phases.intro} tint>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-emerald-500/10 text-xs uppercase tracking-wider text-emerald-300">
              <tr><th className="px-4 py-3">Phase</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Timing</th><th className="px-4 py-3">Capital</th><th className="px-4 py-3">What it proves</th></tr>
            </thead>
            <tbody>
              {phases.rows.map(([p, stage, when, ask, proves]) => (
                <tr key={p} className="border-t border-white/5 align-top">
                  <td className="px-4 py-3 font-mono text-emerald-400">{p}</td>
                  <td className="px-4 py-3 font-semibold text-white">{stage}</td>
                  <td className="px-4 py-3 text-stone-400">{when}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-300">{ask}</td>
                  <td className="px-4 py-3 text-stone-400">{proves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section label="Financials" title={model.title} intro={model.note}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-500/10 text-xs uppercase tracking-wider text-emerald-300">
                <tr><th className="px-4 py-3">Base case</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Expenses</th><th className="px-4 py-3">Net</th></tr>
              </thead>
              <tbody>
                {model.rows.map(([y, rev, exp, net]) => (
                  <tr key={y} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{y}</td>
                    <td className="px-4 py-3 text-stone-300">{rev}</td>
                    <td className="px-4 py-3 text-stone-300">{exp}</td>
                    <td className={`px-4 py-3 font-semibold ${net.startsWith('+') ? 'text-emerald-300' : 'text-orange-300'}`}>{net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed text-stone-400">{model.streams}</p>
        </div>
      </Section>

      <Section label="Discipline" title={money.title} tint>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold text-stone-200">{money.split_title}</p>
            <div className="space-y-3">
              {money.split.map(([name, pct]) => (
                <div key={name as string}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-stone-300">{name}</span><span className="font-mono text-emerald-300">{pct}%</span></div>
                  <div className="h-2 rounded-full bg-white/5"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {money.structure.map(([name, what]) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
                <p className="font-semibold text-white">{name}</p>
                <p className="mt-1 text-sm text-stone-400">{what}</p>
              </div>
            ))}
            <p className="text-sm leading-relaxed text-stone-400">{money.credits}</p>
          </div>
        </div>
      </Section>

      {impact.targets.length > 0 && (
        <Section label="Impact" title={impact.title} intro={impact.intro}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(impact.targets as string[][]).map(([what, target]) => (
              <div key={what} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
                <p className="text-sm text-stone-400">{what}</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">{target}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section label="Take part" title={ways.title} tint>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ways.items.map(([who, what]) => (
            <div key={who} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
              <p className="font-semibold text-white">{who}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">{what}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-stone-500">{ways.legal}</p>
      </Section>

      <section id="contact" className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
          <SectionLabel text="Next step" />
          <h2 className="text-3xl font-semibold text-white">{contact.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-300">{contact.body}</p>
          <a href={mailto} className="mt-8 inline-block rounded-2xl bg-emerald-400 px-8 py-4 text-base font-semibold text-neutral-950 hover:bg-emerald-300">
            Email Jordan
          </a>
          <p className="mt-4 text-sm text-stone-500">{contact.email}</p>
          <AccessBox />
        </div>
      </section>
    </>
  );
}
