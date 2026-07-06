const CONTENT_PATH = 'src/data/siteContent.json';

type GitHubFileResponse = {
  sha: string;
  content?: string;
};

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner =
    process.env.GITHUB_REPO_OWNER ||
    process.env.VERCEL_GIT_REPO_OWNER ||
    '';
  const repo =
    process.env.GITHUB_REPO_NAME ||
    process.env.VERCEL_GIT_REPO_SLUG ||
    '';
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    'main';

  if (!token || !owner || !repo) {
    return null;
  }
  return { token, owner, repo, branch };
}

export function getGitHubConfigStatus() {
  const cfg = githubConfig();
  return {
    configured: Boolean(cfg),
    hasToken: Boolean(process.env.GITHUB_TOKEN),
    owner: cfg?.owner || process.env.VERCEL_GIT_REPO_OWNER || null,
    repo: cfg?.repo || process.env.VERCEL_GIT_REPO_SLUG || null,
    branch: cfg?.branch || process.env.VERCEL_GIT_COMMIT_REF || 'main',
    autoDetectedRepo: Boolean(
      !process.env.GITHUB_REPO_OWNER &&
        !process.env.GITHUB_REPO_NAME &&
        process.env.VERCEL_GIT_REPO_OWNER &&
        process.env.VERCEL_GIT_REPO_SLUG,
    ),
  };
}

async function githubFetch(path: string, init?: RequestInit) {
  const cfg = githubConfig();
  if (!cfg) {
    throw new Error('GitHub is not configured. Set GITHUB_TOKEN in Vercel (repo is auto-detected).');
  }
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${cfg.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers || {}),
    },
  });
  return res;
}

export async function readContentFromGitHub(): Promise<{ content: string; sha?: string } | null> {
  const cfg = githubConfig();
  if (!cfg) return null;
  const res = await githubFetch(CONTENT_PATH);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub read failed: ${err}`);
  }
  const data = (await res.json()) as GitHubFileResponse;
  const decoded = data.content
    ? Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')
    : '';
  return { content: decoded, sha: data.sha };
}

export async function writeContentToGitHub(contentJson: string, message: string) {
  const cfg = githubConfig();
  if (!cfg) {
    throw new Error('GitHub is not configured. Set GITHUB_TOKEN in Vercel (repo is auto-detected).');
  }

  let sha: string | undefined;
  const existing = await readContentFromGitHub();
  if (existing?.sha) sha = existing.sha;

  const body = {
    message,
    content: Buffer.from(contentJson, 'utf8').toString('base64'),
    branch: cfg.branch,
    ...(sha ? { sha } : {}),
  };

  const res = await githubFetch(CONTENT_PATH, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write failed: ${err}`);
  }

  return res.json();
}

export async function triggerVercelDeploy() {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    throw new Error('VERCEL_DEPLOY_HOOK_URL is not configured.');
  }
  const res = await fetch(hook, { method: 'POST' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Deploy hook failed: ${err}`);
  }
}

export function isGitHubConfigured(): boolean {
  return Boolean(githubConfig());
}

export function isDeployHookConfigured(): boolean {
  return Boolean(process.env.VERCEL_DEPLOY_HOOK_URL);
}
