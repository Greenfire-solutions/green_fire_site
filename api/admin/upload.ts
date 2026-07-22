import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { handleOptions, requireAdmin } from '../lib/auth.js';
import { isBlobConfigured } from '../lib/storage.js';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  if (!isBlobConfigured()) {
    return res.status(503).json({
      error: 'Image upload requires Vercel Blob. Connect Blob storage in Vercel, then redeploy.',
    });
  }

  const body = req.body as {
    filename?: string;
    contentType?: string;
    data?: string;
  };

  if (!body.filename || !body.contentType || !body.data) {
    return res.status(400).json({ error: 'filename, contentType, and data (base64) are required.' });
  }

  if (!ALLOWED.has(body.contentType)) {
    return res.status(400).json({
      error: 'Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WebM.',
    });
  }

  try {
    const base64 = body.data.includes(',') ? body.data.split(',')[1] : body.data;
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large. Max size is 8MB.' });
    }

    const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const pathname = `uploads/${Date.now()}-${safeName}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: body.contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (err) {
    return res.status(502).json({
      error: err instanceof Error ? err.message : 'Upload failed.',
    });
  }
}
