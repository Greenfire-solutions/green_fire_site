import { readFileSync } from 'fs';
import { join } from 'path';
import { readContentFromBlob } from './storage.js';
import { readContentFromGitHub } from './github.js';

function readBundledContent(): string {
  try {
    const path = join(process.cwd(), 'src/data/siteContent.json');
    return readFileSync(path, 'utf8');
  } catch {
    return '{}';
  }
}

/** Live content: Blob (published) → GitHub → bundled file */
export async function readLiveContentJson(): Promise<string> {
  const blob = await readContentFromBlob();
  if (blob) return blob;

  const github = await readContentFromGitHub();
  if (github?.content) return github.content;

  return readBundledContent();
}
