import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, signAdminToken } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({
      error: 'Admin login is not configured. Add ADMIN_PASSWORD in Vercel environment variables.',
    });
  }

  const { password } = req.body as { password?: string };
  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  try {
    const token = signAdminToken();
    return res.status(200).json({ success: true, token });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : 'Login failed.' });
  }
}
