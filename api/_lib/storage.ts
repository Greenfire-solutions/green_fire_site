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

/* One sealing for everything a stranger sends: leads/ from /start and
   intakes/ from /onboard. Same key, same format, so one reader opens both. */
async function writeSealed(prefix: string, record: Record<string, unknown>): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('Blob storage is not configured.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', leadKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()]);
  const sealed = [iv, cipher.getAuthTag(), body].map((b) => b.toString('base64')).join('.');
  await put(`${prefix}${String(record.at).replace(/[^0-9TZ]/g, '')}.txt`, sealed, {
    access: 'public',
    contentType: 'text/plain',
    addRandomSuffix: true,
    token,
  });
}

async function readSealed(prefix: string, limit: number): Promise<Record<string, unknown>[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];
  const { blobs } = await list({ prefix, limit, token });
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

export const writeLead = (lead: Record<string, unknown>) => writeSealed(LEAD_PREFIX, lead);
export const readLeads = (limit = 500) => readSealed(LEAD_PREFIX, limit);

/* ------------------------------------------------------------- intakes
   The onboarding form at /onboard: everything Jordan needs before a
   workshop or a session. Sealed exactly like a lead. */
const INTAKE_PREFIX = 'intakes/';
export const writeIntake = (intake: Record<string, unknown>) => writeSealed(INTAKE_PREFIX, intake);
export const readIntakes = (limit = 500) => readSealed(INTAKE_PREFIX, limit);

/* ------------------------------------------------------------ settings
   Small values Jordan changes from the operator without a deploy, such as
   the Beginners Kit download link shown on /activate. Public JSON on
   purpose: everything in here is shown on a public page anyway. */
const SETTINGS_PATHNAME = 'settings/onboarding.json';

export type OnboardSettings = { kit_url?: string; kit_updated_at?: string };

export async function readSettings(): Promise<OnboardSettings> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return {};
  try {
    const { blobs } = await list({ prefix: SETTINGS_PATHNAME, limit: 5, token });
    const match = blobs.find((b) => b.pathname === SETTINGS_PATHNAME);
    if (!match) return {};
    const res = await fetch(`${match.url}?v=${Date.parse(String(match.uploadedAt)) || Date.now()}`, { cache: 'no-store' });
    return res.ok ? ((await res.json()) as OnboardSettings) : {};
  } catch {
    return {};
  }
}

export async function writeSettings(next: OnboardSettings): Promise<OnboardSettings> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('Blob storage is not configured.');
  const merged = { ...(await readSettings()), ...next };
  await put(SETTINGS_PATHNAME, JSON.stringify(merged), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    token,
  });
  return merged;
}
