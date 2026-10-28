import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { SectionLabel } from '../components/ui';
import data from '../data/startOffers.json';

/* /start: the one link Jordan sends anyone who is interested in AI work.
   Everything on it comes from startOffers.json, the same file the Greenfire
   operator and Pip read, so the page cannot quote a price the till disagrees with. */

type Offer = (typeof data.offers)[number] & {
  when?: string; terms?: string; book_url?: string; video?: string; poster?: string; video_len?: string;
  after?: string; step?: string; alt?: { label: string; offer: string };
};
const offers = data.offers as Offer[];
const hidden = (data.private_offers || []) as { id: string; checkout_url?: string; title: string }[];
const member = data.membership;

/* The intro film, rendered by _TOOLS/intro-videos/v2. The poster stands in
   until pressed so three films do not load with the page. */
function Intro({ o }: { o: Offer }) {
  const [on, setOn] = useState(false);
  const box = 'aspect-video w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-black shadow-[0_30px_80px_-30px_rgba(16,185,129,0.35)]';
  if (on) return <video src={o.video} poster={o.poster} controls autoPlay playsInline className={box} />;
  return (
    <button onClick={() => setOn(true)} aria-label={`Play the video: ${o.title}`} className={`group relative block ${box}`}>
      <img src={o.poster} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_50px_rgba(46,230,160,0.55)] transition group-hover:scale-105 group-hover:bg-emerald-400">
          <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-black"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </span>
      {o.video_len && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">Watch {o.video_len}</span>
      )}
    </button>
  );
}

/* One offer as a full row: the film big on one side, what you get and the
   button on the other. Rows alternate sides so the page reads as three steps. */
function OfferRow({ o, i, onAsk }: { o: Offer; i: number; onAsk: (id: string) => void }) {
  const alt = o.alt && hidden.find((h) => h.id === o.alt!.offer);
  return (
    <article id={o.id} className="grid scroll-mt-24 items-center gap-8 rounded-3xl border border-white/10 bg-neutral-950 p-5 md:p-8 lg:grid-cols-5 lg:gap-12">
      <div className={`lg:col-span-3 ${i % 2 ? 'lg:order-2' : ''}`}>{o.video ? <Intro o={o} /> : null}</div>
      <div className="lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {i + 1}. {o.step}
        </p>
        <h3 className="mt-2 text-3xl font-semibold text-white">{o.title}</h3>
        <p className="mt-3 text-4xl font-semibold text-emerald-300">{o.price_label}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">{o.unit}</p>
        {o.when && <p className="mt-3 text-sm text-orange-200">Next class: {o.when}</p>}
        <p className="mt-5 text-base text-stone-200">{o.for}</p>
        <ul className="mt-4 space-y-2 text-sm text-stone-300">
          {o.includes.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
        {o.terms && <p className="mt-4 text-xs text-stone-500">{o.terms}</p>}
        <div className="mt-6 flex flex-col gap-2">
          {o.checkout_url ? (
            <>
              {/* What happens after paying, and the name Stripe will show. The
                  checkout runs on the GMS Stripe account, so a buyer who was not
                  told sees a different business on the payment page and their
                  statement at the exact moment they decide whether to trust it. */}
              <a href={o.checkout_url} className="rounded-xl bg-emerald-500 px-5 py-4 text-center text-base font-semibold text-black hover:bg-emerald-400">
                {o.button}
              </a>
              {o.after && <p className="text-xs text-stone-300">{o.after}</p>}
            </>
          ) : (
            <button onClick={() => onAsk(o.id)} className="rounded-xl bg-emerald-500 px-5 py-4 text-base font-semibold text-black hover:bg-emerald-400">
              {o.button}
            </button>
          )}
          {alt?.checkout_url && (
            <a href={alt.checkout_url} className="text-sm text-emerald-300 underline decoration-emerald-500/40 hover:text-emerald-200">
              {o.alt!.label}
            </a>
          )}
          <button onClick={() => onAsk(o.id)} className="self-start text-xs text-stone-400 underline hover:text-stone-200">
            Questions first? Ask me
          </button>
        </div>
      </div>
    </article>
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
  /* /start#workshop: old Great Medicine Show links to the AI classes forward
     here (2026-10-24), so the page opens on the card they were about. */
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);
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
          <div className="mt-8 flex flex-wrap gap-3">
            {offers.map((o, i) => (
              <a key={o.id} href={`#${o.id}`} className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-stone-200 hover:bg-emerald-500/15">
                <span className="text-emerald-400">{i + 1}.</span> {o.title} <span className="text-emerald-300">{o.price_label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {offers.map((o, i) => (
            <OfferRow key={o.id} o={o} i={i} onAsk={ask} />
          ))}
          <p className="text-center text-[11px] leading-snug text-stone-500">{data.page.checkout_note}</p>
        </div>
      </section>

      <section id="course" className="scroll-mt-24 px-6 pb-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-white">{data.self_serve.title} <span className="text-emerald-300">{data.self_serve.price_label}</span></h2>
            <p className="mt-2 max-w-3xl text-stone-300">{data.self_serve.about}</p>
          </div>
          <a href={data.self_serve.url} className="shrink-0 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-300">
            {data.self_serve.button}
          </a>
        </div>
      </section>

      <section id="membership" className="scroll-mt-24 border-t border-white/5 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-neutral-950 to-emerald-500/10 p-6 md:p-10 lg:grid-cols-2">
          <div>
            <SectionLabel text="Keep building" color="orange" />
            <h2 className="text-3xl font-semibold text-white">{member.title}</h2>
            <p className="mt-2 text-3xl font-semibold text-orange-200">{member.price_label}</p>
            <p className="mt-4 text-stone-300">{member.about}</p>
            <a href={member.checkout_url} className="mt-6 inline-block rounded-xl bg-orange-400 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-300">
              {member.button}
            </a>
          </div>
          <ul className="space-y-3 self-center text-sm text-stone-200">
            {member.includes.map((x) => (
              <li key={x} className="flex gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-orange-300">✦</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
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
  /* A one to one buyer comes back with offer=onboarding, a private offer, and
     still needs its calendar link. */
  const o = [...offers, ...(hidden as Offer[])].find((x) => x.id === id);
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
        <a href={o ? `${data.intake_form_url}?for=${o.id}` : data.intake_form_url} className={`inline-block rounded-xl px-6 py-3 text-sm font-semibold ${o?.book_url ? 'border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>
          Fill in the intake form
        </a>
      </div>
      <p className="mt-6 text-sm text-stone-500">
        {o?.book_url
          ? 'The calendar link above shows my open times; your Google Meet link arrives with the booking.'
          : o?.id === 'workshop'
            ? 'Your confirmation with the date and time arrives by email within about 15 minutes, and the joining link comes before the day.'
            : 'I will email you within a day to set the time.'}{' '}
        Your receipt is on its way from Stripe.
      </p>
    </section>
  );
}
