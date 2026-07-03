import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, requireAdmin } from '../lib/auth.js';
import { writeContentToGitHub, triggerVercelDeploy, isGitHubConfigured, isDeployHookConfigured } from '../lib/github.js';

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

  if (!isGitHubConfigured()) {
    return res.status(503).json({
      error: 'Publishing requires GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME in Vercel.',
    });
  }

  try {
    const json = JSON.stringify(content, null, 2) + '\n';
    await writeContentToGitHub(json, 'Update site content via Green Fire admin');

    let deployTriggered = false;
    if (isDeployHookConfigured()) {
      await triggerVercelDeploy();
      deployTriggered = true;
    }

    return res.status(200).json({
      success: true,
      message: deployTriggered
        ? 'Content published to GitHub and Vercel redeploy triggered. Your site will update in a few minutes.'
        : 'Content published to GitHub. Add VERCEL_DEPLOY_HOOK_URL to auto-redeploy.',
      deployTriggered,
    });
  } catch (err) {
    return res.status(502).json({ error: err instanceof Error ? err.message : 'Publish failed.' });
  }
}
