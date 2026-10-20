import crypto from 'crypto';
import { put, list } from '@vercel/blob';

const BLOB_PATHNAME = 'site-content.json';

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function writeContentToBlob(json: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Blob storage is not configured.');
  }

  const blob = await put(BLOB_PATHNAME, json, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });

  return blob.url;
}

export async function readContentFromBlob(): Promise<string | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  try {
    const { blobs } = await list({
      prefix: BLOB_PATHNAME,
      limit: 10,
      token,
    });

    const match = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!match) return null;

    const res = await fetch(match.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- leads
   Somebody who asked for something on /start. Stored one blob each under
   `leads/`, ENCRYPTED, because this package only makes public blobs and a
   lead is a stranger's name, email and words. The key is derived from the
   admin secret, so only the server (and the admin route behind the password)
   can read one back; a blob URL that leaks is unreadable bytes. */
const LEAD_PREFIX = 'leads/';

function leadKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured on the server.');
  return crypto.createHash('sha256').update(`greenfire-leads:${secret}`).digest();
}

export async function writeLead(lead: Record<string, unknown>): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('Blob storage is not configured.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', leadKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(lead), 'utf8'), cipher.final()]);
  const sealed = [iv, cipher.getAuthTag(), body].map((b) => b.toString('base64')).join('.');
  await put(`${LEAD_PREFIX}${String(lead.at).replace(/[^0-9TZ]/g, '')}.txt`, sealed, {
    access: 'public',
    contentType: 'text/plain',
    addRandomSuffix: true,
    token,
  });
}

export async function readLeads(limit = 500): Promise<Record<string, unknown>[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];
  const { blobs } = await list({ prefix: LEAD_PREFIX, limit, token });
  const key = leadKey();
  const out: Record<string, unknown>[] = [];
  for (const b of blobs) {
    try {
      const sealed = await (await fetch(b.url, { cache: 'no-store' })).text();
      const [iv, tag, body] = sealed.split('.').map((s) => Buffer.from(s, 'base64'));
      const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
      d.setAuthTag(tag);
      out.push({ ...JSON.parse(Buffer.concat([d.update(body), d.final()]).toString('utf8')), id: b.pathname });
    } catch {
      /* One unreadable blob is skipped, never a reason to lose the rest. */
    }
  }
  return out;
}
