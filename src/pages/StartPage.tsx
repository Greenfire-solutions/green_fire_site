import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { SectionLabel } from '../components/ui';
import data from '../data/startOffers.json';

/* /start: the one link Jordan sends anyone who is interested in AI work.
   Everything on it comes from startOffers.json, the same file the Greenfire
   operator and Pip read, so the page cannot quote a price the till disagrees with. */

type Offer = (typeof data.offers)[number] & { when?: string; terms?: string; book_url?: string; video?: string; poster?: string };
const offers = data.offers as Offer[];

/* The 25 second intro, rendered by _TOOLS/intro-videos/render.py. The poster
   stands in until pressed so four videos do not load with the page. */
function Intro({ o }: { o: Offer }) {
  const [on, setOn] = useState(false);
  const box = 'mb-5 aspect-video w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-black';
  if (on) return <video src={o.video} poster={o.poster} controls autoPlay playsInline className={box} />;
  return (
    <button onClick={() => setOn(true)} aria-label={`Play: ${o.title} in 25 seconds`} className={`group relative block ${box}`}>
      <img src={o.poster} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
      <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-emerald-500 py-1 pl-2 pr-3 text-xs font-semibold text-black shadow-[0_0_24px_rgba(46,230,160,0.4)] transition group-hover:bg-emerald-400">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-black"><path d="M8 5v14l11-7z" /></svg>
        Watch 0:25
      </span>
    </button>
  );
}

function OfferCard({ o, onAsk }: { o: Offer; onAsk: (id: string) => void }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-neutral-950 p-6">
      {o.video && <Intro o={o} />}
      <h3 className="text-xl font-semibold text-white">{o.title}</h3>
      <p className="mt-1 text-2xl font-semibold text-emerald-300">{o.price_label}</p>
      <p className="text-xs uppercase tracking-wider text-stone-500">{o.unit}</p>
      {o.when && <p className="mt-2 text-sm text-orange-200">Next: {o.when}</p>}
      <p className="mt-4 text-sm text-stone-300">{o.for}</p>
      <ul className="mt-4 space-y-1 text-sm text-stone-400">
        {o.includes.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
      {o.terms && <p className="mt-3 text-xs text-stone-500">{o.terms}</p>}
      <div className="mt-auto pt-6 flex flex-col gap-2">
        {o.checkout_url ? (
          <a href={o.checkout_url} className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-emerald-400">
            {o.button}
          </a>
        ) : (
          <button onClick={() => onAsk(o.id)} className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400">
            {o.button}
          </button>
        )}
        <button onClick={() => onAsk(o.id)} className="text-xs text-stone-400 underline hover:text-stone-200">
          Questions first? Ask me
        </button>
      </div>
    </div>
  );
}

function AskForm({ offer, setOffer }: { offer: string; setOffer: (s: string) => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [who, setWho] = useState('small_business');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState('sending');
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, offer, source: new URLSearchParams(location.search).get('from') || 'start' }) });
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
        <p className="mt-2 text-stone-300">I will write back within a day with the next step. Check your inbox, and your spam just in case.</p>
      </div>
    );

  const box = 'w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-stone-500';
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/40 p-6 md:grid-cols-2">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="name" required placeholder="Your name" className={box} />
      <input name="email" type="email" required placeholder="Email" className={box} />
      <select name="who" value={who} onChange={(e) => setWho(e.target.value)} className={box}>
        {data.audiences.map((a) => (
          <option key={a.id} value={a.id}>{a.label}</option>
        ))}
      </select>
      <input name="business" placeholder={who === 'artist' ? 'Your project or artist name' : 'Business or company name'} className={box} />
      <select name="offer" value={offer} onChange={(e) => setOffer(e.target.value)} className={box}>
        {offers.map((o) => (
          <option key={o.id} value={o.id}>{o.title}</option>
        ))}
        <option value="unsure">Not sure yet, help me pick</option>
      </select>
      <select name="where" defaultValue="online" className={box}>
        <option value="online">Online</option>
        <option value="in_person">In person</option>
        <option value="either">Either</option>
      </select>
      {who === 'company' && <input name="team_size" placeholder="How many people on the team?" className={box} />}
      <input name="phone" placeholder="Phone (optional)" className={box} />
      <textarea name="message" rows={4} placeholder="What would you love AI to take off your plate?" className={`${box} md:col-span-2`} />
      {state === 'error' && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
      <button disabled={state === 'sending'} className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 md:col-span-2">
        {state === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}

export function StartPage() {
  const [offer, setOffer] = useState('unsure');
  const ask = (id: string) => {
    setOffer(id);
    document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionLabel text="AI with Greenfire" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">{data.page.headline}</h1>
          <p className="max-w-2xl text-lg text-stone-400 leading-relaxed">{data.page.intro}</p>
        </div>
      </section>

      <section className="py-14 px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {offers.map((o) => (
            <OfferCard key={o.id} o={o} onAsk={ask} />
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-7xl rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
          <p className="font-semibold text-orange-200">{data.care_plan.title}: {data.care_plan.price_label}</p>
          <p className="mt-1 text-sm text-stone-300">{data.care_plan.about}</p>
        </div>
      </section>

      <section id="ask" className="border-t border-white/5 bg-neutral-900/20 py-14 px-6">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Not sure which?" color="orange" />
          <h2 className="mb-6 text-3xl font-semibold text-white">Tell me what you need</h2>
          <AskForm offer={offer} setOffer={setOffer} />
        </div>
      </section>
    </>
  );
}

/* Where Stripe sends a buyer after paying. */
export function StartThanksPage() {
  const id = new URLSearchParams(useLocation().search).get('offer') || '';
  const o = offers.find((x) => x.id === id);
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <SectionLabel text="Payment received" />
      <h1 className="text-4xl font-semibold text-white">Thank you, you are in.</h1>
      <p className="mt-4 text-stone-300">
        {o ? `${o.title} is booked.` : 'Your booking is in.'} One step left: tell me about your work in the short intake form, so the time we spend is about your business and not setup.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {o?.book_url && (
          <a href={o.book_url} className="inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400">
            Pick your time
          </a>
        )}
        <a href={data.intake_form_url} className={`inline-block rounded-xl px-6 py-3 text-sm font-semibold ${o?.book_url ? 'border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>
          Fill in the intake form
        </a>
      </div>
      <p className="mt-6 text-sm text-stone-500">
        {o?.book_url ? 'The calendar link above shows my open times; your Google Meet link arrives with the booking.' : 'I will email you within a day to set the time.'} Your receipt is on its way from Stripe.
      </p>
    </section>
  );
}
