import type { VercelRequest, VercelResponse } from '@vercel/node';
import { writePlaytester, writeFeedback, countPlaytesters, readPlaytesters, readFeedback } from './storage.js';
import { requireAdmin } from './auth.js';

/* /rootsignal: a playtest sign-up (kind "signup") or a tester's notes after
   playing (kind "feedback"). Kept apart from /api/lead so nobody who signs up
   to play a game is ever treated as a sales lead. GET returns only a count;
   GET ?all=1 behind the admin password returns every sign-up and note. (Not its own
   function: the Hobby plan allows 12 and the site already uses all 12, so
   vercel.json rewrites /api/playtest to /api/lead?game=rootsignal and lead.ts
   hands the request here. The storage stays separate from leads.) */
const PLATFORMS = new Set(['Mac', 'Windows', 'Linux', 'Steam Deck', 'Not sure']);
const INPUTS = new Set(['Mouse and keyboard', 'Controller', 'Laptop keyboard only', 'Not sure']);
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const field = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const text = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function playtest(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (req.query.all) {
      if (!requireAdmin(req, res)) return;
      res.setHeader('Cache-Control', 'no-store');
      const [playtesters, feedback] = await Promise.all([readPlaytesters(), readFeedback()]);
      return res.status(200).json({ playtesters, feedback });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    try { return res.status(200).json({ count: await countPlaytesters() }); }
    catch { return res.status(200).json({ count: 0 }); }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  /* The hidden box only a bot fills. Answered as a success so it learns nothing. */
  if (field(b.website, 200)) return res.status(200).json({ ok: true });

  const at = new Date().toISOString();
  const email = field(b.email, 160).toLowerCase();
  const source = field(b.source, 60) || 'rootsignal';

  try {
    if (b.kind === 'feedback') {
      if (email && !EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address, or leave it empty.' });
      const fun = Math.max(0, Math.min(5, Number(b.fun) || 0));
      const best = text(b.best, 1000), worst = text(b.worst, 1000), bugs = text(b.bugs, 2000);
      if (!fun && !best && !worst && !bugs) return res.status(400).json({ error: 'Tell me at least one thing about your play.' });
      await writeFeedback({ at, email, name: field(b.name, 120), fun, best, worst, bugs, build: field(b.build, 40), minutes: field(b.minutes, 20), source });
      return res.status(200).json({ ok: true });
    }
    const name = field(b.name, 120);
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
    if (!name) return res.status(400).json({ error: 'Please add your name.' });
    await writePlaytester({
      at, name, email,
      platform: PLATFORMS.has(String(b.platform)) ? String(b.platform) : 'Not sure',
      input: INPUTS.has(String(b.input)) ? String(b.input) : 'Not sure',
      loves: field(b.loves, 300),
      found: field(b.found, 120),
      updates: b.updates === true || b.updates === 'yes',
      source,
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Could not save that just now. Please email civilizationexplorer@gmail.com.' });
  }
}
