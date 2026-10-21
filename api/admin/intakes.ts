import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../_lib/auth.js';
import { readIntakes } from '../_lib/storage.js';

/* Every onboarding form filled in at /onboard, for the Greenfire operator. Behind the admin password. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ intakes: await readIntakes() });
}
