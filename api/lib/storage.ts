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
