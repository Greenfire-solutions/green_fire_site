import type { VercelRequest, VercelResponse } from '@vercel/node';
import { writeLead } from './lib/storage.js';

/* A person asking for something on /start. Kept on the site (encrypted) and
   pulled into the Greenfire operator, where Pip follows it through. */
const OFFERS = new Set(['workshop', 'onboarding', 'build', 'team', 'unsure']);
const WHO = new Set(['artist', 'small_business', 'company', 'individual']);
const WHERE = new Set(['online', 'in_person', 'either']);
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const field = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  /* The hidden box only a bot fills. Answered as a success so it learns nothing. */
  if (field(b.website, 200)) return res.status(200).json({ ok: true });

  const email = field(b.email, 160).toLowerCase();
  const name = field(b.name, 120);
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  const offer = OFFERS.has(String(b.offer)) ? String(b.offer) : 'unsure';

  try {
    await writeLead({
      at: new Date().toISOString(),
      name,
      email,
      offer,
      business: field(b.business, 160),
      phone: field(b.phone, 40),
      message: String(b.message ?? '').trim().slice(0, 2000),
      who: WHO.has(String(b.who)) ? String(b.who) : 'individual',
      where: WHERE.has(String(b.where)) ? String(b.where) : 'online',
      team_size: field(b.team_size, 20),
      source: field(b.source, 60) || 'start',
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Could not save that just now. Please email civilizationexplorer@gmail.com.' });
  }
}
