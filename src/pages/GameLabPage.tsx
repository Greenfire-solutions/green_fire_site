import { useState, type FormEvent } from 'react';
import { Gamepad2, BookOpen, Box, Brain, Sparkles, type LucideIcon } from 'lucide-react';
import { SectionLabel } from '../components/ui';
import g from '../data/gameLab.json';

/* /games: the kids' Game Creator Lab. Every word, date and price comes from
   gameLab.json. Parents apply here (no Buy button for the first cohort): the
   application checks the computer can run Unity before anyone pays, because a
   Chromebook family is the likeliest way a paid seat goes wrong.
   Plans, curriculum and safety rules: _PLANS/08_Academy/Game_Creator_Lab. */

const ICONS: Record<string, LucideIcon> = { gamepad: Gamepad2, book: BookOpen, box: Box, brain: Brain, sparkles: Sparkles };

const box = 'w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-stone-500';

function ApplyForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    /* The kid's details travel inside the message so the lead store and the
       operator need no new columns; the parent is the lead. */
    const message = [
      `Kid's age: ${f.child_age || 'not given'}`,
      `Computer: ${f.computer || 'not given'}`,
      f.experience ? `Already made: ${f.experience}` : '',
      f.gift ? 'This seat is a gift, please send a gift card.' : '',
      f.note ? `Note: ${f.note}` : '',
    ].filter(Boolean).join('\n');
    setState('sending');
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: f.website, name: f.name, email: f.email, phone: f.phone,
          offer: 'game_lab', who: 'parent', where: 'online', message,
          child_age: f.child_age, computer: f.computer,
          source: new URLSearchParams(location.search).get('from') || 'games',
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not send that just now.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that just now.');
      setState('error');
    }
  }

  if (state === 'sent')
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <p className="text-xl font-semibold text-white">Got it, thank you.</p>
        <p className="mt-2 text-stone-300">I will write back within a day about the computer check and the next step. Check your inbox, and your spam just in case.</p>
        <a href={g.bible.url} className="mt-5 inline-block text-sm text-emerald-300 underline">While you wait: print the free Game Bible</a>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/40 p-6 md:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="text-xs text-stone-400 md:col-span-2">For parents and guardians. We ask for your details, not your kid's.</label>
      <input name="name" required placeholder="Your name (parent or guardian)" className={box} />
      <input name="email" type="email" required placeholder="Your email" className={box} />
      <select name="child_age" required defaultValue="" className={box}>
        <option value="" disabled>Your kid's age</option>
        {[10, 11, 12, 13, 14, 15, 16].map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select name="computer" required defaultValue="" className={box}>
        <option value="" disabled>Their computer</option>
        <option value="Mac">Mac</option>
        <option value="Windows">Windows PC</option>
        <option value="Chromebook">Chromebook</option>
        <option value="iPad or tablet">iPad or tablet</option>
        <option value="Not sure">Not sure</option>
      </select>
      <input name="experience" placeholder="Anything they have made already? (Minecraft builds, Scratch, Roblox...)" className={`${box} md:col-span-2`} />
      <input name="phone" placeholder="Phone (optional)" className={box} />
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-stone-300">
        <input type="checkbox" name="gift" value="yes" className="h-4 w-4 accent-emerald-500" /> This seat is a gift
      </label>
      <textarea name="note" rows={3} placeholder="Anything I should know? (Optional. The computer's make and model helps if you are not sure.)" className={`${box} md:col-span-2`} />
      {state === 'error' && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
      <button disabled={state === 'sending'} className="rounded-xl bg-emerald-500 px-4 py-4 text-base font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 md:col-span-2">
        {state === 'sending' ? 'Sending…' : g.button}
      </button>
      <p className="text-xs text-stone-500 md:col-span-2">{g.apply_note}</p>
    </form>
  );
}

function Facts() {
  const c = g.cohort;
  const rows = [
    ['Who', `${g.ages}`],
    ['Starts', c.starts],
    ['When', c.when],
    ['How long', `${c.sessions}, ending ${c.ends}`],
    ['Where', c.where],
    ['Group', `${g.seats} kids, one teacher`],
  ];
  return (
    <div className="rounded-3xl border border-emerald-500/25 bg-neutral-950/80 p-6 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.35)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">{c.label}</p>
      <p className="mt-2 text-5xl font-semibold text-emerald-300">{g.price_label}</p>
      <p className="mt-1 text-sm text-stone-400">{g.price_note}</p>
      <dl className="mt-5 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 border-t border-white/5 pt-2">
            <dt className="w-20 shrink-0 text-stone-500">{k}</dt>
            <dd className="text-stone-200">{v}</dd>
          </div>
        ))}
      </dl>
      <a href="#apply" className="mt-6 block rounded-xl bg-emerald-500 px-5 py-4 text-center text-base font-semibold text-black hover:bg-emerald-400">{g.button}</a>
      <p className="mt-3 text-xs text-stone-400">{g.gift}</p>
    </div>
  );
}

export function GameLabPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.16),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(249,115,22,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionLabel text={g.kicker} />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">{g.title}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white md:text-6xl">{g.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">{g.intro}</p>
            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              {['Game design', 'Characters', 'Worldbuilding', 'Game Bible', 'Blender', 'Unity', 'AI as a helper'].map((t) => (
                <span key={t} className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-stone-200">{t}</span>
              ))}
            </div>
            <p className="mt-6 text-sm text-stone-400">{g.ages}. {g.ages_note}</p>
          </div>
          <div className="lg:col-span-2"><Facts /></div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="What they leave with" color="orange" />
          <h2 className="mb-8 text-3xl font-semibold text-white">Not a toy app. A real game, and the skills behind it.</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {g.makes.map((m) => {
              const Icon = ICONS[m.icon] || Sparkles;
              return (
              <div key={m.title} className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300" aria-hidden="true"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-3 font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-sm text-stone-400">{m.text}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-neutral-900/20 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <SectionLabel text="Deeper than a coding class" />
            <h2 className="text-3xl font-semibold text-white">They learn what makes a game good</h2>
            {g.depth.map((p) => <p key={p} className="mt-4 text-stone-300">{p}</p>)}
          </div>
          <ol className="space-y-3">
            {g.weeks.map((w) => (
              <li key={w.n} className="flex gap-4 rounded-2xl border border-white/10 bg-neutral-950 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-semibold text-emerald-300">{w.n}</span>
                <div>
                  <p className="font-semibold text-white">Week {w.n}: {w.title}</p>
                  <p className="mt-1 text-sm text-stone-400">{w.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <figure className="mx-auto w-full max-w-md">
            <video src={g.teacher.video} poster={g.teacher.poster} autoPlay muted loop playsInline className="aspect-[3.5/4.5] w-full rounded-3xl border border-white/10 object-cover" />
            <figcaption className="mt-2 text-center text-xs text-stone-500">{g.teacher.caption}</figcaption>
          </figure>
          <div>
            <SectionLabel text="Your teacher" color="orange" />
            <h2 className="text-3xl font-semibold text-white">{g.teacher.name}</h2>
            <p className="mt-4 text-stone-300">{g.teacher.text}</p>
            <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6">
              <h3 className="text-xl font-semibold text-white">{g.ai_rule.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-300">
                {g.ai_rule.points.map((p) => <li key={p} className="flex gap-2"><span className="text-emerald-400">✓</span><span>{p}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Made by your teacher" color="orange" />
          <h2 className="text-3xl font-semibold text-white">{g.proof.title}</h2>
          <p className="mt-3 max-w-3xl text-stone-300">{g.proof.intro}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.proof.items.filter((p) => !('tall' in p)).map((p) => (
              <figure key={p.title} className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
                <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="none" className="aspect-video w-full object-cover" />
                <figcaption className="p-4">
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="mt-1 text-sm text-stone-400">{p.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-neutral-900/20 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {[g.computer, g.safety].map((s) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
              <h3 className="text-xl font-semibold text-white">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-300">
                {s.points.map((p) => <li key={p} className="flex gap-2"><span className="text-orange-300">•</span><span>{p}</span></li>)}
              </ul>
              {'note' in s && <p className="mt-3 text-xs text-stone-500">{(s as typeof g.computer).note}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-neutral-950 to-emerald-500/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-white">{g.bible.title}</h2>
            <p className="mt-2 max-w-3xl text-stone-300">{g.bible.text}</p>
          </div>
          <a href={g.bible.url} className="shrink-0 rounded-xl bg-orange-400 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-300">{g.bible.button}</a>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Questions parents ask" />
          <div className="mt-4 space-y-3">
            {g.faq.map((f) => (
              <details key={f.q} className="rounded-xl border border-white/10 bg-neutral-950 p-4">
                <summary className="cursor-pointer font-semibold text-white">{f.q}</summary>
                <p className="mt-2 text-sm text-stone-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 border-t border-white/5 bg-neutral-900/20 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text={`${g.cohort.label}, ${g.seats} seats`} color="orange" />
          <h2 className="mb-6 text-3xl font-semibold text-white">{g.button}</h2>
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
