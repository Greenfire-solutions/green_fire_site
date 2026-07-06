import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../lib/auth.js';
import { isBlobConfigured } from '../lib/storage.js';
import { getGitHubConfigStatus, isDeployHookConfigured } from '../lib/github.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const github = getGitHubConfigStatus();
  const blob = isBlobConfigured();
  const deployHook = isDeployHookConfigured();

  const canPublish = blob || github.configured;

  let publishMethod: string | null = null;
  if (blob) publishMethod = 'blob';
  else if (github.configured) publishMethod = 'github';

  const setupSteps: string[] = [];
  if (!canPublish) {
    setupSteps.push(
      'Recommended: Vercel → your project → Storage → Create Blob Store → Connect to project (adds BLOB_READ_WRITE_TOKEN automatically).',
      'Then redeploy and try Publish Live again.',
      'Optional backup: add GITHUB_TOKEN in Vercel env vars (repo owner/name are auto-detected from your Vercel Git connection).',
    );
  } else if (!blob && github.configured && !deployHook) {
    setupSteps.push(
      'Publishing commits to GitHub. Add VERCEL_DEPLOY_HOOK_URL for faster redeploys, or wait for Vercel’s automatic Git deploy.',
    );
  }

  return res.status(200).json({
    canPublish,
    publishMethod,
    blob,
    github,
    deployHook,
    setupSteps,
  });
}
