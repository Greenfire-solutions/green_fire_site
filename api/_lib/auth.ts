import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function signAdminToken(): string {
  const secret = getSessionSecret();
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured on the server.');
  const payload = Buffer.from(
    JSON.stringify({ admin: true, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number };
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function getBearerToken(req: VercelRequest): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const token = getBearerToken(req);
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized. Please log in again.' });
    return false;
  }
  return true;
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
