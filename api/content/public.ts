import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readLiveContentJson } from '../lib/contentSource.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const json = await readLiveContentJson();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(json);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load content.',
    });
  }
}
