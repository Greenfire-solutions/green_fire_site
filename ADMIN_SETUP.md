# Green Fire Admin CMS Setup

Private content editor at **`/admin`** on your live site.

## Required environment variables

### Admin login (server-side only — never commit)

| Variable | Where | Description |
|----------|--------|-------------|
| `ADMIN_PASSWORD` | Vercel + `.env.local` | Your private admin password |

Optional: `ADMIN_SESSION_SECRET` — separate secret for session tokens (defaults to `ADMIN_PASSWORD`).

### Contact form (client build-time)

| Variable | Where | Description |
|----------|--------|-------------|
| `VITE_WEB3FORMS_ACCESS_KEY` | Vercel + `.env.local` | Web3Forms key for contact submissions |

### Publish to live site (server-side only)

| Variable | Where | Description |
|----------|--------|-------------|
| `GITHUB_TOKEN` | Vercel only | Fine-grained PAT with **Contents: Read and write** on your repo |
| `GITHUB_REPO_OWNER` | Vercel only | GitHub username or org |
| `GITHUB_REPO_NAME` | Vercel only | Repository name (e.g. `Green_Fire`) |
| `GITHUB_BRANCH` | Vercel only | Branch to commit to (default: `main`) |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel only | Deploy hook URL from Vercel project settings |

## Local development

Create `.env.local` in the project root (never commit):

```env
ADMIN_PASSWORD=your_private_password_here
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

For **Publish Live** locally, also add GitHub + deploy hook vars, or use **Save Draft** (stores in browser localStorage only).

Run the dev server:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/admin`

> API routes (`/api/admin/*`) work on Vercel production. For full local API testing, run `npx vercel dev`.

## GitHub token setup

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens**
2. Create token with access to your Green Fire repository
3. Permission: **Contents** → Read and write
4. Add as `GITHUB_TOKEN` in Vercel

## Vercel Deploy Hook

1. Vercel project → **Settings** → **Git** → **Deploy Hooks**
2. Create hook for branch `main`
3. Copy URL → add as `VERCEL_DEPLOY_HOOK_URL` in Vercel env vars

## How publishing works

1. You edit content in `/admin`
2. **Save Draft** → validates + saves to browser localStorage
3. **Publish Live** → commits `src/data/siteContent.json` to GitHub via API → triggers Vercel redeploy
4. Live site updates after deploy completes (~1–2 min)

## Content file

All editable content lives in:

`src/data/siteContent.json`

The public site reads this file at build time. After publish + redeploy, changes appear on the live site.

## Security notes

- `ADMIN_PASSWORD` is verified **only on the server** — never put it in a `VITE_` variable
- Do not commit `.env.local` or your password to GitHub
- Admin session token is stored in browser localStorage (7-day expiry)
- Rotate `ADMIN_PASSWORD` if you suspect it was exposed

## Testing checklist

1. Open `/admin` → login with your password
2. Edit a package title → **Save Draft** → refresh → draft persists
3. **Publish Live** (with GitHub + deploy hook configured)
4. Wait for Vercel deploy → verify change on public site
5. Confirm `/admin` logout works
