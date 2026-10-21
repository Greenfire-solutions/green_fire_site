import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../_lib/auth.js';
import { readIntakes, readSettings, writeSettings } from '../_lib/storage.js';

/* Every onboarding form filled in at /onboard and /activate, for the Greenfire operator. Behind the admin password.
   POST sets the onboarding settings (the Beginners Kit link on /activate). It lives here, not in its own file,
   because Vercel Hobby allows 12 functions and the site is close to that. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({ intakes: await readIntakes(), settings: await readSettings() });
  }
  if (req.method === 'POST') {
    const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;
    const kit = String(b.kit_url ?? '').trim();
    if (kit && !/^https:\/\/[^\s<>"']+$/.test(kit)) return res.status(400).json({ error: 'The kit link must start with https://' });
    try {
      const settings = await writeSettings({ kit_url: kit, kit_updated_at: new Date().toISOString() });
      return res.status(200).json({ ok: true, settings });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Could not save.' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
