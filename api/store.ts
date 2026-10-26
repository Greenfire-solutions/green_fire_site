import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';
import { requireAdmin } from './_lib/auth.js';
import { writeLead } from './_lib/storage.js';

/* THE APP STORE (2026-10-26). The one function the store gets: Vercel Hobby
   allows 12 and every other one is taken, so everything the /store page needs
   is here, chosen by ?action=.

     GET                      the public catalogue (what /store draws)
     POST ?action=publish     the operator pushes a new catalogue (admin only)
     POST ?action=reserve     a visitor asks for an app or a membership

   The catalogue is public JSON in Blob: it is written only by the Greenfire
   operator's App store tab, which decides what may be shown. Checkout and the
   Drive delivery will be added here as more actions. */
const CATALOG = 'store/catalog.json';
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const field = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

async function readCatalog(token: string): Promise<string | null> {
  const { blobs } = await list({ prefix: CATALOG, limit: 5, token });
  const match = blobs.find((b) => b.pathname === CATALOG);
  if (!match) return null;
  const r = await fetch(`${match.url}?v=${Date.parse(String(match.uploadedAt)) || Date.now()}`, { cache: 'no-store' });
  return r.ok ? await r.text() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const action = String(req.query.action || '');

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    try {
      const json = token ? await readCatalog(token) : null;
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(json || '{"apps":[],"genres":{}}');
    } catch {
      return res.status(200).json({ apps: [], genres: {} });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  if (action === 'publish') {
    if (!requireAdmin(req, res)) return;
    const cat = b.catalog as { apps?: unknown[] } | undefined;
    if (!cat || !Array.isArray(cat.apps)) return res.status(400).json({ error: 'No catalogue sent.' });
    if (!token) return res.status(503).json({ error: 'Blob storage is not configured.' });
    await put(CATALOG, JSON.stringify(cat), { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60, token });
    return res.status(200).json({ ok: true, apps: cat.apps.length });
  }

  if (action === 'reserve') {
    /* The hidden box only a bot fills. Answered as a success so it learns nothing. */
    if (field(b.website, 200)) return res.status(200).json({ ok: true });
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
        message: `Store: wants ${want === 'membership' ? 'the $20 Store membership' : want === 'builder' ? 'the $100 Builder membership' : want === 'setup' ? `it set up for them: ${app}` : `the app ${app}`}. ${String(b.message ?? '').trim().slice(0, 1000)}`.trim(),
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
