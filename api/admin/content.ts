import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../lib/auth.js';
import { readLiveContentJson } from '../lib/contentSource.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method === 'GET') {
    try {
      const json = await readLiveContentJson();
      return res.status(200).json(JSON.parse(json));
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load content.' });
    }
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const { content } = req.body as { content?: unknown };
    if (!content) {
      return res.status(400).json({ error: 'Missing content body.' });
    }
    return res.status(200).json({ success: true, message: 'Draft saved in session. Use Publish to push live.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
