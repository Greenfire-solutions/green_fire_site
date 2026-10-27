/* Cloudflare R2, the site's file store (2026-10-27).

   Why not Vercel Blob any more: on the Hobby plan Blob allows 2,000 "advanced
   operations" a month (every upload, copy and list), and the site burned
   through them (a list on each download, each lead, each content read).
   Vercel then suspended the store: the catalogue went blank, leads were
   refused and downloads stopped. R2's free tier allows a million such calls.

   Same bucket the operator already uploads store films to, under one prefix
   (R2_PREFIX, default greenfire/site). Reads are plain GETs on the public
   r2.dev address: no credentials, no counted operation. Writes are S3-style
   signed PUTs, about sixty lines of node:crypto, so nothing is installed.
   Private things are kept at unguessable addresses (random or HMAC names),
   exactly as Blob's random suffixes did; the public address never lists.

   Two R2 quirks: region is the literal string "auto", and the upload host
   (<account>.r2.cloudflarestorage.com) is not the read host (pub-*.r2.dev). */
import crypto from 'crypto';

type Conf = { accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string; publicBase: string; prefix: string };

export function r2Config(): Conf | null {
  const e = process.env;
  if (!e.R2_ACCOUNT_ID || !e.R2_BUCKET || !e.R2_ACCESS_KEY_ID || !e.R2_SECRET_ACCESS_KEY || !e.R2_PUBLIC_BASE) return null;
  return {
    accountId: e.R2_ACCOUNT_ID, bucket: e.R2_BUCKET, accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY,
    publicBase: e.R2_PUBLIC_BASE.replace(/\/+$/, ''), prefix: (e.R2_PREFIX || 'greenfire/site').replace(/^\/+|\/+$/g, ''),
  };
}
export const r2Configured = () => r2Config() !== null;

/* `as never`: this project's @types/node and TypeScript disagree about Buffer
   being BinaryLike; the runtime has never cared. */
const sha256hex = (b: Buffer | string) => crypto.createHash('sha256').update(b as never).digest('hex');
const hmac = (key: Buffer | string, data: string) => crypto.createHmac('sha256', key as never).update(data).digest();
/* Every path segment encoded, the slashes kept: encoding the whole key turns
   "a/b.zip" into "a%2Fb.zip" and R2 answers 403 with no useful message. */
const encodeKey = (key: string) => key.split('/').map(encodeURIComponent).join('/');
const fullKey = (c: Conf, key: string) => `${c.prefix}/${key.replace(/^\/+/, '')}`;

function signingKey(secret: string, date: string) {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, date), 'auto'), 's3'), 'aws4_request');
}
function amz() {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}
function sign(c: Conf, method: string, canonicalUri: string, query: string, headers: Record<string, string>, payloadHash: string) {
  const { amzDate, dateStamp } = amz();
  const h: Record<string, string> = { ...headers, host: `${c.accountId}.r2.cloudflarestorage.com`, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
  const names = Object.keys(h).sort();
  const canonical = [method, canonicalUri, query, names.map((n) => `${n}:${h[n].trim()}\n`).join(''), names.join(';'), payloadHash].join('\n');
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonical)].join('\n');
  const signature = crypto.createHmac('sha256', signingKey(c.secretAccessKey, dateStamp) as never).update(toSign).digest('hex');
  return { ...h, Authorization: `AWS4-HMAC-SHA256 Credential=${c.accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}` };
}

/** The public address of a key. Reading it costs nothing and needs no key. */
export function r2PublicUrl(key: string): string {
  const c = r2Config();
  if (!c) throw new Error('File storage is not configured (R2).');
  return `${c.publicBase}/${encodeKey(fullKey(c, key))}`;
}

/** Store bytes. Overwrites. Returns the public address. */
export async function r2Put(key: string, body: Buffer | string, contentType: string, cacheSeconds = 0): Promise<string> {
  const c = r2Config();
  if (!c) throw new Error('File storage is not configured (R2).');
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
  const uri = `/${encodeKey(c.bucket)}/${encodeKey(fullKey(c, key))}`;
  const headers = sign(c, 'PUT', uri, '', { 'content-length': String(buf.length), 'content-type': contentType, 'cache-control': cacheSeconds ? `public, max-age=${cacheSeconds}` : 'no-store' }, sha256hex(buf));
  const r = await fetch(`https://${c.accountId}.r2.cloudflarestorage.com${uri}`, { method: 'PUT', headers, body: buf as unknown as BodyInit });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`R2 put failed ${r.status} ${(t.match(/<Code>([^<]+)<\/Code>/) || [])[1] || ''}`);
  }
  return r2PublicUrl(key);
}

/** Read text at a key, or null when it is not there. A fresh read every time. */
export async function r2GetText(key: string): Promise<string | null> {
  const c = r2Config();
  if (!c) return null;
  const r = await fetch(`${r2PublicUrl(key)}?v=${Date.now()}`, { cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`R2 read failed ${r.status}`);
  return await r.text();
}

/** Keys under a prefix (newest-named last is up to the caller). Signed list. */
export async function r2List(prefix: string, limit = 1000): Promise<{ key: string; size: number; at: string }[]> {
  const c = r2Config();
  if (!c) return [];
  const out: { key: string; size: number; at: string }[] = [];
  let token = '';
  const full = fullKey(c, prefix);
  while (out.length < limit) {
    const q = [`list-type=2`, `max-keys=${Math.min(1000, limit - out.length)}`, `prefix=${encodeURIComponent(full)}`, ...(token ? [`continuation-token=${encodeURIComponent(token)}`] : [])].sort().join('&');
    const uri = `/${encodeKey(c.bucket)}`;
    const headers = sign(c, 'GET', uri, q, {}, sha256hex(''));
    const r = await fetch(`https://${c.accountId}.r2.cloudflarestorage.com${uri}?${q}`, { headers });
    const xml = await r.text();
    if (!r.ok) throw new Error(`R2 list failed ${r.status} ${(xml.match(/<Code>([^<]+)<\/Code>/) || [])[1] || ''}`);
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = (m[1].match(/<Key>([^<]+)<\/Key>/) || [])[1] || '';
      out.push({ key: key.slice(c.prefix.length + 1), size: +((m[1].match(/<Size>(\d+)<\/Size>/) || [])[1] || 0), at: (m[1].match(/<LastModified>([^<]+)<\/LastModified>/) || [])[1] || '' });
    }
    token = (xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/) || [])[1] || '';
    if (!token) break;
  }
  return out;
}

/** A PUT address the Mac can upload straight to, for files bigger than a
    function may receive. Good for `seconds`; the content type is pinned. */
export function r2PresignPut(key: string, contentType: string, seconds = 900): { url: string; headers: Record<string, string>; publicUrl: string } {
  const c = r2Config();
  if (!c) throw new Error('File storage is not configured (R2).');
  const { amzDate, dateStamp } = amz();
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const host = `${c.accountId}.r2.cloudflarestorage.com`;
  const uri = `/${encodeKey(c.bucket)}/${encodeKey(fullKey(c, key))}`;
  const signed = 'content-type;host';
  const params: Record<string, string> = { 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': `${c.accessKeyId}/${scope}`, 'X-Amz-Date': amzDate, 'X-Amz-Expires': String(seconds), 'X-Amz-SignedHeaders': signed };
  const query = Object.keys(params).sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const canonical = ['PUT', uri, query, `content-type:${contentType}\nhost:${host}\n`, signed, 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonical)].join('\n');
  const signature = crypto.createHmac('sha256', signingKey(c.secretAccessKey, dateStamp) as never).update(toSign).digest('hex');
  return { url: `https://${host}${uri}?${query}&X-Amz-Signature=${signature}`, headers: { 'content-type': contentType }, publicUrl: r2PublicUrl(key) };
}

/** A name nobody can guess for a private thing, from a server-side secret. */
export function secretName(kind: string, ...parts: string[]): string {
  const secret = process.env.STORE_SHELF_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!secret) throw new Error('STORE_SHELF_SECRET is not configured on the server.');
  return crypto.createHmac('sha256', secret).update(`${kind}:${parts.join('|')}`).digest('hex').slice(0, 40);
}
