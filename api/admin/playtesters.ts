import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../_lib/auth.js';
import { readPlaytesters, readFeedback } from '../_lib/storage.js';

/* ROOTSIGNAL playtest sign-ups and tester feedback from /rootsignal. Behind the admin password. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  const [playtesters, feedback] = await Promise.all([readPlaytesters(), readFeedback()]);
  return res.status(200).json({ playtesters, feedback });
}
