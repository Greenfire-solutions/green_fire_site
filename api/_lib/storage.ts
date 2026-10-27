/* What the site keeps outside its code: the published content, every lead
   and intake (sealed), and a few settings. All of it in R2 (see r2.ts);
   the function names kept their Blob-era shape so the routes did not move. */
import crypto from 'crypto';
import { r2Configured, r2Put, r2GetText, r2List } from './r2.js';

const CONTENT_KEY = 'site-content.json';

/** True when files can be stored. The name is historical: it means R2 now. */
export function isBlobConfigured(): boolean {
  return r2Configured();
}

export async function writeContentToBlob(json: string): Promise<string> {
  return r2Put(CONTENT_KEY, json, 'application/json');
}

export async function readContentFromBlob(): Promise<string | null> {
  try {
    return await r2GetText(CONTENT_KEY);
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- leads
   Somebody who asked for something on /start. Stored one file each under
   `leads/`, ENCRYPTED, because the store serves public addresses and a lead
   is a stranger's name, email and words. The key is derived from the admin
   secret, so only the server (and the admin route behind the password) can
   read one back; an address that leaks is unreadable bytes. */
const LEAD_PREFIX = 'leads/';
function leadKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured on the server.');
  return crypto.createHash('sha256').update(`greenfire-leads:${secret}`).digest();
}

/* One sealing for everything a stranger sends: leads/ from /start and
   intakes/ from /onboard. Same key, same format, so one reader opens both. */
async function writeSealed(prefix: string, record: Record<string, unknown>): Promise<void> {
  if (!r2Configured()) throw new Error('File storage is not configured.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', leadKey() as never, iv as never);
  const body = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()] as never[]);
  const sealed = [iv, cipher.getAuthTag(), body].map((b) => b.toString('base64')).join('.');
  const name = `${String(record.at).replace(/[^0-9TZ]/g, '')}-${crypto.randomBytes(6).toString('hex')}.txt`;
  await r2Put(`${prefix}${name}`, sealed, 'text/plain');
}

async function readSealed(prefix: string, limit: number): Promise<Record<string, unknown>[]> {
  if (!r2Configured()) return [];
  const files = (await r2List(prefix, limit)).sort((a, b) => (a.key < b.key ? 1 : -1));
  const key = leadKey();
  const out: Record<string, unknown>[] = [];
  for (const f of files) {
    try {
      const sealed = (await r2GetText(f.key)) || '';
      const [iv, tag, body] = sealed.split('.').map((s) => Buffer.from(s, 'base64'));
      const d = crypto.createDecipheriv('aes-256-gcm', key as never, iv as never);
      d.setAuthTag(tag as never);
      out.push({ ...JSON.parse(Buffer.concat([d.update(body as never), d.final()] as never[]).toString('utf8')), id: f.key });
    } catch {
      /* One unreadable file is skipped, never a reason to lose the rest. */
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
const SETTINGS_KEY = 'settings/onboarding.json';
export type OnboardSettings = { kit_url?: string; kit_updated_at?: string };

export async function readSettings(): Promise<OnboardSettings> {
  try {
    const t = await r2GetText(SETTINGS_KEY);
    return t ? (JSON.parse(t) as OnboardSettings) : {};
  } catch {
    return {};
  }
}

export async function writeSettings(next: OnboardSettings): Promise<OnboardSettings> {
  if (!r2Configured()) throw new Error('File storage is not configured.');
  const merged = { ...(await readSettings()), ...next };
  await r2Put(SETTINGS_KEY, JSON.stringify(merged), 'application/json');
  return merged;
}
