import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Download, Loader2, Lock } from 'lucide-react';

/* WHERE A BUYER LANDS (2026-10-27). Stripe sends every store checkout here
   with ?s={CHECKOUT_SESSION_ID}. The page asks /api/store what that checkout
   bought (the server asks Stripe), then shows the downloads: one app for a
   purchase, every app for Builder, and for the $20 Store plan this month's
   two picks. The session id is the buyer's key, so it is also kept in this
   browser and emailed to them by the operator (store-sell.mjs). */

type App = { id: string; title: string; line: string; poster: string | null; access: 'member' | 'builder' | null; free: boolean; ready: boolean; price_usd: number; builds?: { arch: string; label: string }[] | null };
type Account = {
  kind: 'purchase' | 'plan' | 'course' | 'unpaid' | 'unknown';
  email?: string | null;
  plan?: 'store' | 'builder';
  status?: string;
  active?: boolean;
  cancelling?: boolean;
  period_end?: number;
  picks_left?: number;
  owned: string[];
  paid?: boolean;
  course?: boolean;
};

const MINE = 'gf-store-account';
const remember = (s: string) => {
  try {
    localStorage.setItem(MINE, s);
  } catch {
    /* Private window: the email still has the link. */
  }
};
const recall = () => {
  try {
    return localStorage.getItem(MINE) || '';
  } catch {
    return '';
  }
};
const day = (t?: number) => (t ? new Date(t * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : '');

export function StoreAccountPage() {
  const [s] = useState(() => new URLSearchParams(window.location.search).get('s') || recall());
  const [acct, setAcct] = useState<Account | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [error, setError] = useState('');
  const [asking, setAsking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Your apps · Greenfire App Store';
    if (!s) {
      setError('This page needs the link from your email or from the page you landed on after paying.');
      return;
    }
    fetch(`/api/store?action=account&s=${encodeURIComponent(s)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Could not check that checkout.');
        return j as Account;
      })
      .then((j) => {
        /* A course checkout's page is the course itself. */
        if (j.kind === 'course') return window.location.replace(`/launch?s=${encodeURIComponent(s)}`);
        setAcct(j);
        if (j.kind === 'purchase' || j.kind === 'plan') {
          remember(s);
          /* Keep the key, drop it from the address bar so a screenshot does not share it. */
          window.history.replaceState(null, '', '/store/account');
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not check that checkout.'));
    fetch('/api/store')
      .then((r) => r.json())
      .then((j) => setApps(j.apps || []))
      .catch(() => {});
  }, [s]);

  const pick = async (id: string) => {
    setBusy(true);
    try {
      const r = await fetch('/api/store?action=claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ s, app: id }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not pick that one.');
      setAcct(j);
      setAsking(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not pick that one.');
    } finally {
      setBusy(false);
    }
  };

  const byId = new Map(apps.map((a) => [a.id, a]));
  const owned = (acct?.owned || []).map((id) => byId.get(id) || ({ id, title: id, line: '', poster: null, access: null, free: false, ready: true, price_usd: 0 } as App));
  const canPick = acct?.plan === 'store' && acct.active ? apps.filter((a) => a.ready && !a.free && !acct.owned.includes(a.id)) : [];
  const dl = (id: string, arch?: string) => `/api/store?action=download&s=${encodeURIComponent(s)}&app=${encodeURIComponent(id)}${arch ? `&arch=${arch}` : ''}`;
  /* Some apps come ready-made, one zip per kind of Mac, with everything inside. */
  const anyBuilds = owned.some((a) => a.builds?.length);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04110f] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <a href="/store" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-white">
          <ArrowLeft size={14} /> Back to the store
        </a>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">Greenfire App Store</p>

        {!acct && !error && (
          <div className="mt-16 grid place-items-center text-stone-400">
            <Loader2 className="animate-spin" />
            <p className="mt-3 text-sm">Checking your payment with Stripe...</p>
          </div>
        )}

        {error && !acct && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">We could not open your apps</h1>
            <p className="mt-2 text-sm text-stone-300">{error}</p>
            <p className="mt-4 text-sm text-stone-300">
              Paid but lost the link? At the bottom of the <a href="/store#pricing" className="text-emerald-300 underline">store page</a>, under Questions, enter the email you paid with and the links are sent again.
            </p>
          </div>
        )}

        {acct && (acct.kind === 'unpaid' || acct.kind === 'unknown' || (acct.kind === 'purchase' && !acct.paid)) && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">{acct.kind === 'unknown' ? 'That checkout is not for the app store' : 'The payment is not finished yet'}</h1>
            <p className="mt-2 text-sm text-stone-300">
              {acct.kind === 'unknown'
                ? 'This link belongs to a different Greenfire purchase. Check your email for the right one.'
                : 'Stripe has not confirmed this payment. If you just paid, wait a minute and reload this page. If it was a bank payment, it can take a few days, and the link arrives by email when it clears.'}
            </p>
          </div>
        )}

        {acct && (acct.kind === 'purchase' ? acct.paid : acct.kind === 'plan') && (
          <>
            <h1 className="mt-1 text-3xl font-bold text-white">
              {acct.kind === 'purchase' ? 'Thank you. Your app is ready.' : acct.plan === 'builder' ? 'Builder: every app is yours' : 'Your Store membership'}
            </h1>
            {acct.kind === 'plan' && (
              <p className="mt-2 text-sm text-stone-300">
                {!acct.active
                  ? acct.status === 'past_due'
                    ? 'Your last payment did not go through, so the membership is paused. Apps you already picked are still yours below. Reply to your welcome email to sort it out.'
                    : 'Your membership has ended. Apps you picked are still yours below.'
                  : acct.plan === 'builder'
                    ? `Download any of them, as often as you like${acct.period_end ? `. Your next payment is on ${day(acct.period_end)}` : ''}.`
                    : `${acct.picks_left === 0 ? 'Both picks are used this month' : `You have ${acct.picks_left} pick${acct.picks_left === 1 ? '' : 's'} left this month`}${acct.period_end ? `. New picks arrive on ${day(acct.period_end)}` : ''}. Apps you pick stay yours.`}
                {acct.cancelling && acct.active ? ' Your membership is set to end at the close of this month.' : ''}
              </p>
            )}
            {acct.course && (
              <a href={`/launch?s=${encodeURIComponent(s)}`} className="mt-4 block rounded-2xl border border-emerald-400/50 bg-emerald-400/10 p-4 text-white hover:bg-emerald-400/15">
                <span className="block font-bold">Launch your AI Command Center</span>
                <span className="block text-sm text-stone-300">Your Builder membership includes the step by step setup course. Open it here.</span>
              </a>
            )}
            <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-3 text-xs text-emerald-100">
              This page is your key to your apps. The same link is in the email sent to {acct.email || 'you'}, and this browser remembers it under My apps on the store.
            </p>

            {owned.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">{acct.kind === 'purchase' ? 'Your download' : 'Your apps'}</h2>
                <div className="mt-3 space-y-3">
                  {owned.map((a) => (
                    <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
                      <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-900">{a.poster && <img src={a.poster} alt="" className="h-full w-full object-cover" />}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white">{a.title}</p>
                        <p className="text-sm text-stone-300">{a.line}</p>
                      </div>
                      {a.builds?.length ? (
                        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                          {a.builds.map((b) => (
                            <a key={b.arch} href={dl(a.id, b.arch)} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                              <Download size={16} /> {b.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <a href={dl(a.id)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
                          <Download size={16} /> Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                {anyBuilds && (
                  <p className="mt-3 text-xs text-stone-300">
                    Ready-made apps have everything inside: unzip, drag the folder into Applications, double-click Start. Which Mac do you have? Apple menu, About This Mac: a line that says <b>Chip</b> (Apple M1, M2...) means Apple Silicon; <b>Processor</b> (Intel Core) means Intel Mac.
                  </p>
                )}
                <p className="mt-3 text-xs text-stone-400">Open GREENFIRE_START_HERE.md inside the zip first. Something not working? Reply to your email.</p>
              </div>
            )}

            {canPick.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">{acct.picks_left ? 'Pick your apps' : 'More apps, next month'}</h2>
                {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {canPick.map((a) => {
                    const builderOnly = a.access !== 'member';
                    return (
                      <div key={a.id} className={`rounded-2xl border border-white/10 bg-white/[0.03] p-3 ${builderOnly || !acct.picks_left ? 'opacity-60' : ''}`}>
                        <div className="aspect-video overflow-hidden rounded-lg bg-neutral-900">{a.poster && <img src={a.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}</div>
                        <p className="mt-2 font-bold text-white">{a.title}</p>
                        <p className="text-xs text-stone-300">{a.line}</p>
                        {builderOnly ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400"><Lock size={12} /> A bigger tool, included with Builder</p>
                        ) : !acct.picks_left ? null : asking === a.id ? (
                          <div className="mt-2 flex items-center gap-2">
                            <button disabled={busy} onClick={() => pick(a.id)} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-neutral-950 disabled:opacity-60">
                              {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Yes, use a pick
                            </button>
                            <button onClick={() => setAsking(null)} className="text-xs font-semibold text-stone-400 hover:text-white">Not this one</button>
                          </div>
                        ) : (
                          <button onClick={() => { setError(''); setAsking(a.id); }} className="mt-2 rounded-full border border-emerald-400/50 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/10">
                            Pick this one
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
