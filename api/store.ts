import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { requireAdmin } from './_lib/auth.js';
import { writeLead } from './_lib/storage.js';

/* THE APP STORE (2026-10-26). The one function the store gets: Vercel Hobby
   allows 12 and every other one is taken, so everything the /store page needs
   is here, chosen by ?action=.

     GET                         the public catalogue (what /store draws)
     GET  ?action=account&s=     what a checkout bought: one app, or a plan
     GET  ?action=download&s=&app=   the download, after the payment is checked
     POST ?action=claim          a Store member takes one of this month's 2 picks
     POST ?action=reserve        a visitor asks for a setup, or to be told
     POST ?action=resend         "I lost my link": the operator emails it
     POST ?action=publish        the operator pushes a new catalogue (admin only)
     POST ?action=upload-token   the operator uploads a clean copy (admin only)

   PAYING (2026-10-27). Every Buy and Join button is a Stripe payment link the
   operator made (store-checkout.mjs). After paying, Stripe sends the buyer to
   /store/account?s={CHECKOUT_SESSION_ID}, and that session id is their key:
   this file asks Stripe whether it was paid and what for, every time, so a
   made-up or unpaid id gets nothing. What a product is lives in its Stripe
   metadata: gf_store_app on an app, gms_slug greenfire-member-store or
   greenfire-member-builder on a plan.

   The zips are public blobs with a random name under store/private/apps/,
   found only by listing with the server's token. Nobody is ever shown one
   before Stripe says the session was paid. */
const CATALOG = 'store/catalog.json';
const APPS = 'store/private/apps/';
const CLAIMS = 'store/private/claims/';
const PICKS = 2;
const PLAN_SLUG: Record<string, 'store' | 'builder'> = { 'greenfire-member-store': 'store', 'greenfire-member-builder': 'builder' };
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const SESSION = /^cs_(live|test)_[A-Za-z0-9]{10,200}$/;
const field = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

type App = { id: string; title: string; access: string | null; free: boolean; ready: boolean; price_usd: number; builds?: { arch: string; label: string }[] | null };
type Claim = { app: string; at: string; period: number };

async function readBlob(token: string, pathname: string): Promise<string | null> {
  const { blobs } = await list({ prefix: pathname, limit: 5, token });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return null;
  const r = await fetch(`${match.url}?v=${Date.parse(String(match.uploadedAt)) || Date.now()}`, { cache: 'no-store' });
  return r.ok ? await r.text() : null;
}

async function stripe(path: string, init?: { method?: string; body?: URLSearchParams }) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw Object.assign(new Error('Checkout is not switched on yet.'), { status: 503 });
  const r = await fetch(`https://api.stripe.com/v1${path}`, { method: init?.method || 'GET', body: init?.body, headers: { authorization: `Bearer ${key}` } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j?.error?.message || `Stripe ${r.status}`), { status: r.status === 404 ? 404 : 502 });
  return j;
}

/* Everything one checkout session entitles its holder to, asked of Stripe
   fresh each time. A Store plan's month is the subscription's own billing
   period, so the two picks reset on the day they pay, not on the 1st. */
async function entitlement(sid: string) {
  if (!SESSION.test(sid)) throw Object.assign(new Error('That link is not complete. Use the whole link from your email or the page you landed on.'), { status: 400 });
  const qs = new URLSearchParams();
  qs.append('expand[]', 'line_items.data.price.product');
  qs.append('expand[]', 'subscription');
  const s = await stripe(`/checkout/sessions/${encodeURIComponent(sid)}?${qs}`);
  const product = s.line_items?.data?.[0]?.price?.product || {};
  const meta = (product.metadata || {}) as Record<string, string>;
  const email = s.customer_details?.email || null;
  if (s.status !== 'complete') return { kind: 'unpaid' as const, email };
  if (meta.gf_store_app) {
    return { kind: 'purchase' as const, email, paid: s.payment_status === 'paid', app: meta.gf_store_app };
  }
  const plan = PLAN_SLUG[meta.gms_slug || ''];
  const sub = s.subscription && typeof s.subscription === 'object' ? s.subscription : null;
  if (!plan || !sub) return { kind: 'unknown' as const, email };
  const item = sub.items?.data?.[0] || {};
  const start = Number(sub.current_period_start ?? item.current_period_start ?? 0);
  const end = Number(sub.current_period_end ?? item.current_period_end ?? 0);
  return {
    kind: 'plan' as const, email, plan, sub: String(sub.id), status: String(sub.status),
    active: ['active', 'trialing'].includes(sub.status), period: start, period_end: end, cancelling: Boolean(sub.cancel_at_period_end || sub.cancel_at),
  };
}

async function readClaims(token: string, sub: string): Promise<Claim[]> {
  try {
    const j = JSON.parse((await readBlob(token, `${CLAIMS}${sub}.json`)) || '{}');
    return Array.isArray(j.claims) ? j.claims : [];
  } catch {
    return [];
  }
}

async function catalogApps(token: string): Promise<App[]> {
  try {
    return (JSON.parse((await readBlob(token, CATALOG)) || '{}').apps || []) as App[];
  } catch {
    return [];
  }
}

/* What this session may download now, and for a Store member, what is left.
   Apps a member picked stay theirs after they stop paying, like a purchase. */
async function account(token: string, sid: string) {
  const e = await entitlement(sid);
  if (e.kind === 'purchase') return { ...e, owned: e.paid ? [e.app] : [] };
  if (e.kind !== 'plan') return { ...e, owned: [] as string[] };
  const claims = await readClaims(token, e.sub);
  const used = claims.filter((c) => c.period === e.period).length;
  const all = e.plan === 'builder' && e.active ? (await catalogApps(token)).filter((a) => a.ready && !a.free).map((a) => a.id) : [];
  return {
    kind: e.kind, email: e.email, plan: e.plan, status: e.status, active: e.active, cancelling: e.cancelling, period_end: e.period_end,
    picks_left: e.plan === 'store' && e.active ? Math.max(0, PICKS - used) : 0,
    owned: [...new Set([...claims.map((c) => c.app), ...all])],
  };
}

/* The newest zip on the shelf for this app. An app with ready builds has one
   zip per Mac, uploaded as <version>-intel and <version>-silicon (2026-10-27);
   asked for an arch, only those count, so Intel never gets the Apple Silicon
   build. With no arch, or none of that kind, the newest of all. */
async function newestZip(token: string, app: string, arch = '') {
  const { blobs } = await list({ prefix: `${APPS}${app}/`, limit: 100, token });
  const newest = (xs: typeof blobs) => xs.sort((a, b) => Date.parse(String(b.uploadedAt)) - Date.parse(String(a.uploadedAt)))[0] || null;
  const mine = arch ? blobs.filter((b) => b.pathname.includes(`-${arch}`)) : [];
  return (mine.length ? newest(mine) : null) || newest(blobs);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const action = String(req.query.action || '');
  const fail = (e: unknown) => {
    const status = (e as { status?: number })?.status || 500;
    return res.status(status).json({ error: status === 404 ? 'That checkout was not found. Use the whole link from your email.' : e instanceof Error ? e.message : 'Something went wrong.' });
  };

  if (req.method === 'GET' && action === 'account') {
    res.setHeader('Cache-Control', 'no-store');
    try {
      return res.status(200).json(await account(token, String(req.query.s || '')));
    } catch (e) {
      return fail(e);
    }
  }

  if (req.method === 'GET' && action === 'download') {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const app = field(req.query.app, 80);
      const a = await account(token, String(req.query.s || ''));
      if (!a.owned.includes(app)) return res.status(403).json({ error: 'This checkout does not include that app.' });
      const arch = /^(intel|silicon)$/.test(String(req.query.arch || '')) ? String(req.query.arch) : '';
      const zip = await newestZip(token, app, arch);
      if (!zip) return res.status(404).json({ error: 'The download is being prepared. Greenfire has been told and will email it to you.' });
      return res.redirect(302, zip.downloadUrl || zip.url);
    } catch (e) {
      return fail(e);
    }
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    try {
      const json = token ? await readBlob(token, CATALOG) : null;
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(json || '{"apps":[],"genres":{}}');
    } catch {
      return res.status(200).json({ apps: [], genres: {} });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  if (action === 'claim') {
    try {
      const sid = field(b.s, 300);
      const app = field(b.app, 80);
      const e = await entitlement(sid);
      if (e.kind !== 'plan' || e.plan !== 'store') return res.status(400).json({ error: 'Picks are part of the Store membership.' });
      if (!e.active) return res.status(402).json({ error: 'Your membership is not active right now, so there are no picks this month.' });
      const target = (await catalogApps(token)).find((x) => x.id === app);
      if (!target || !target.ready || target.free) return res.status(404).json({ error: 'That app cannot be picked right now.' });
      if (target.access !== 'member') return res.status(403).json({ error: 'That one is a bigger tool, included with Builder.' });
      const claims = await readClaims(token, e.sub);
      if (!claims.some((c) => c.app === app)) {
        if (claims.filter((c) => c.period === e.period).length >= PICKS) return res.status(409).json({ error: 'Both picks are used this month. New picks arrive with your next payment.' });
        claims.push({ app, at: new Date().toISOString(), period: e.period });
        await put(`${CLAIMS}${e.sub}.json`, JSON.stringify({ claims }), { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60, token });
      }
      return res.status(200).json(await account(token, sid));
    } catch (e) {
      return fail(e);
    }
  }

  if (action === 'publish') {
    if (!requireAdmin(req, res)) return;
    const cat = b.catalog as { apps?: unknown[] } | undefined;
    if (!cat || !Array.isArray(cat.apps)) return res.status(400).json({ error: 'No catalogue sent.' });
    if (!token) return res.status(503).json({ error: 'Blob storage is not configured.' });
    await put(CATALOG, JSON.stringify(cat), { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60, token });
    return res.status(200).json({ ok: true, apps: cat.apps.length });
  }

  /* A pass for one upload, straight from the operator to Blob: a clean copy
     can be 20 MB and a function only takes 4.5. The pass names the one path
     it may write, under the app's own folder, and lasts 15 minutes. */
  if (action === 'upload-token') {
    if (!requireAdmin(req, res)) return;
    const app = field(b.app, 80).toLowerCase();
    const version = field(b.version, 60);
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(app) || !/^[A-Za-z0-9._-]+$/.test(version)) return res.status(400).json({ error: 'Bad app or version.' });
    const pathname = `${APPS}${app}/${version}.zip`;
    const clientToken = await generateClientTokenFromReadWriteToken({
      token, pathname, addRandomSuffix: true, allowedContentTypes: ['application/zip'], maximumSizeInBytes: 500 * 1024 * 1024, validUntil: Date.now() + 15 * 60e3,
    });
    return res.status(200).json({ pathname, clientToken });
  }

  /* The hidden box only a bot fills. Answered as a success so it learns nothing. */
  if ((action === 'reserve' || action === 'resend') && field(b.website, 200)) return res.status(200).json({ ok: true });

  if (action === 'resend') {
    const email = field(b.email, 160).toLowerCase();
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
    try {
      await writeLead({ at: new Date().toISOString(), name: email, email, offer: 'unsure', message: 'Store: asked for their download links again.', who: 'individual', where: 'online', source: 'store:resend' });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Could not save that just now. Please email civilizationexplorer@gmail.com.' });
    }
  }

  if (action === 'reserve') {
    const email = field(b.email, 160).toLowerCase();
    const name = field(b.name, 120);
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
    if (!name) return res.status(400).json({ error: 'Please add your name.' });
    const want = field(b.want, 40) || 'app';
    const app = field(b.app, 80);
    try {
      await writeLead({
        at: new Date().toISOString(),
        name,
        email,
        offer: 'unsure',
        business: field(b.business, 160),
        message: `Store: ${
          want === 'membership' ? `wants the $20 Store membership${app ? `, starting with ${app}` : ''}`
            : want === 'builder' ? `wants the $100 Builder membership${app ? `, for ${app}` : ''}`
              : want === 'setup' ? `wants it set up for them${app ? `: ${app}` : ''}`
                : want === 'notify' ? `asked for one email when ${app} is ready (not a purchase yet)`
                  : `wants to buy the app ${app}`
        }. ${String(b.message ?? '').trim().slice(0, 1000)}`.trim(),
        who: 'individual',
        where: 'online',
        source: `store:${want}${app ? ':' + app : ''}`.slice(0, 60),
      });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Could not save that just now. Please email civilizationexplorer@gmail.com.' });
    }
  }

  return res.status(400).json({ error: 'Unknown action.' });
}
