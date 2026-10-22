import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifyAdminToken } from './_lib/auth.js';

/* A private page made for one client, at /p/<token>. The page and its films
   live in Blob storage under `shares/<token>/`, never in this public repo,
   so the only way to it is the link Jordan sends. Kept out of search.
   POST is how the page gets there: an admin-signed upload straight from the
   Mac to Blob, because a film is bigger than a function may receive. */
const TOKEN = /^[a-z0-9-]{12,80}$/;
const SHARE_FILE = /^shares\/[a-z0-9-]{12,80}\/(index\.html|(img|films)\/[a-z0-9-]+\.(jpg|mp4))$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'POST') return upload(req, res);
  const t = String(req.query.t ?? '');
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!TOKEN.test(t) || !token) return notFound(res);

  try {
    const name = `shares/${t}/index.html`;
    const { blobs } = await list({ prefix: name, limit: 5, token });
    const match = blobs.find((b) => b.pathname === name);
    if (!match) return notFound(res);
    const page = await fetch(match.url, { cache: 'no-store' });
    if (!page.ok) return notFound(res);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).send(await page.text());
  } catch {
    return res.status(502).send('This page could not be loaded just now. Please try again in a minute.');
  }
}

async function upload(req: VercelRequest, res: VercelResponse) {
  try {
    const out = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!verifyAdminToken(clientPayload ?? undefined)) throw new Error('Admin login required.');
        if (!SHARE_FILE.test(pathname)) throw new Error('Not a share file.');
        return {
          allowedContentTypes: ['text/html', 'video/mp4', 'image/jpeg'],
          maximumSizeInBytes: 40 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload refused.' });
  }
}

function notFound(res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res
    .status(404)
    .send('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><p style="font-family:sans-serif;padding:24px">This link is not active. Ask Jordan for a new one.</p>');
}
