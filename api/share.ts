import type { VercelRequest, VercelResponse } from '@vercel/node';
import { r2GetText, r2PresignPut, r2Configured } from './_lib/r2.js';
import { requireAdmin } from './_lib/auth.js';

/* A private page made for one client, at /p/<token>. The page and its films
   live in R2 under `shares/<token>/` (api/_lib/r2.ts), never in this public
   repo, so the only way to it is the link Jordan sends. Kept out of search.
   POST is how the page gets there: the admin asks for a signed address for
   one file and uploads straight from the Mac, because a film is bigger than
   a function may receive. The answer carries the file's public address, so
   a page can refer to its own films. */
const TOKEN = /^[a-z0-9-]{12,80}$/;
const SHARE_FILE = /^shares\/[a-z0-9-]{12,80}\/(index\.html|(img|films)\/[a-z0-9-]+\.(jpg|mp4)|docs\/[a-z0-9-]+\.(docx|xlsx|pptx|pdf))$/;
/* Documents for an investor data room: Word, Excel, PowerPoint and PDF. */
const DOC_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'POST') return upload(req, res);
  const t = String(req.query.t ?? '');
  if (!TOKEN.test(t) || !r2Configured()) return notFound(res);

  try {
    const page = await r2GetText(`shares/${t}/index.html`);
    if (page === null) return notFound(res);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).send(page);
  } catch {
    return res.status(502).send('This page could not be loaded just now. Please try again in a minute.');
  }
}

async function upload(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;
  if (!r2Configured()) return res.status(503).json({ error: 'File storage is not configured.' });
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as { pathname?: string; contentType?: string };
  const pathname = String(b.pathname || '');
  const contentType = String(b.contentType || '');
  if (!SHARE_FILE.test(pathname)) return res.status(400).json({ error: 'Not a share file.' });
  if (!['text/html', 'video/mp4', 'image/jpeg', ...DOC_TYPES].includes(contentType)) return res.status(400).json({ error: 'Not a share file type.' });
  const pass = r2PresignPut(pathname, contentType, 15 * 60);
  return res.status(200).json({ pathname, url: pass.url, headers: pass.headers, publicUrl: pass.publicUrl });
}

function notFound(res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res
    .status(404)
    .send('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><p style="font-family:sans-serif;padding:24px">This link is not active. Ask Jordan for a new one.</p>');
}
