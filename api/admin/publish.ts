import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../lib/auth.js';
import {
  writeContentToGitHub,
  triggerVercelDeploy,
  isGitHubConfigured,
  isDeployHookConfigured,
  getGitHubConfigStatus,
} from '../lib/github.js';
import { writeContentToBlob, isBlobConfigured } from '../lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  const { content } = req.body as { content?: Record<string, unknown> };
  if (!content) {
    return res.status(400).json({ error: 'Missing content to publish.' });
  }

  const blobReady = isBlobConfigured();
  const githubReady = isGitHubConfigured();

  if (!blobReady && !githubReady) {
    const gh = getGitHubConfigStatus();
    return res.status(503).json({
      error: 'Publishing is not configured yet.',
      setupSteps: [
        '1. Vercel → your project → Storage → Blob → Create / Connect (recommended — updates go live immediately).',
        '2. Redeploy the site after connecting Blob.',
        '3. Try Publish Live again.',
        gh.hasToken
          ? 'GitHub token is set but repo could not be detected — ensure this project is linked to GitHub on Vercel.'
          : 'Optional: add GITHUB_TOKEN in Vercel for a Git backup (owner/repo auto-detect from Vercel).',
      ],
    });
  }

  const json = JSON.stringify(content, null, 2) + '\n';
  const publishedVia: string[] = [];
  let deployTriggered = false;

  try {
    if (blobReady) {
      await writeContentToBlob(json);
      publishedVia.push('blob');
    }

    if (githubReady) {
      await writeContentToGitHub(json, 'Update site content via Green Fire admin');
      publishedVia.push('github');
      if (isDeployHookConfigured()) {
        await triggerVercelDeploy();
        deployTriggered = true;
      }
    }

    let message: string;
    if (publishedVia.includes('blob')) {
      message =
        'Published live! Your site updates immediately — refresh the public site to see changes.';
      if (publishedVia.includes('github')) {
        message += ' A backup was also saved to GitHub.';
      }
    } else {
      message = deployTriggered
        ? 'Published to GitHub and Vercel redeploy triggered. Your site will update in a few minutes.'
        : 'Published to GitHub. Vercel will redeploy automatically from Git, or add VERCEL_DEPLOY_HOOK_URL.';
    }

    return res.status(200).json({
      success: true,
      message,
      publishedVia,
      deployTriggered,
    });
  } catch (err) {
    return res.status(502).json({ error: err instanceof Error ? err.message : 'Publish failed.' });
  }
}
