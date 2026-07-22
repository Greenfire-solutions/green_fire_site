# Green Fire Admin CMS Setup

Private content editor at **`/admin`** on your live site.

## Publish live (required one-time setup)

**Recommended — Vercel Blob (instant updates, no GitHub token):**

1. [vercel.com](https://vercel.com) → your **Green Fire** project
2. **Storage** tab → **Create Database** → **Blob** → **Continue**
3. Name it (e.g. `green-fire-content`) → **Create**
4. **Connect to Project** → select your site → **Connect**
5. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically
6. **Deployments** → **Redeploy** the latest deployment
7. Go to `/admin` → **Publish Live** — changes appear immediately on the public site

No GitHub token needed for this path.

---

## Optional: GitHub backup

Commits `src/data/siteContent.json` to your repo when you publish.

| Variable | Where | Description |
|----------|--------|-------------|
| `GITHUB_TOKEN` | Vercel only | Fine-grained PAT with **Contents: Read and write** |
| `GITHUB_REPO_OWNER` | Optional | Auto-detected from Vercel (`VERCEL_GIT_REPO_OWNER`) |
| `GITHUB_REPO_NAME` | Optional | Auto-detected from Vercel (`VERCEL_GIT_REPO_SLUG`) |
| `VERCEL_DEPLOY_HOOK_URL` | Optional | Faster redeploy after GitHub commit |

Your repo: **Greenfire-solutions/green_fire_site**

### GitHub token

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens**
2. Repository access: **green_fire_site**
3. Permission: **Contents** → Read and write
4. Add as `GITHUB_TOKEN` in Vercel → **Redeploy**

---

## Admin login

| Variable | Where |
|----------|--------|
| `ADMIN_PASSWORD` | Vercel + `.env.local` |

Optional: `ADMIN_SESSION_SECRET`

---

## Contact form

| Variable | Where |
|----------|--------|
| `VITE_WEB3FORMS_ACCESS_KEY` | Vercel + `.env.local` |

See [EMAIL_SETUP.md](./EMAIL_SETUP.md).

---

## Media Showcase (Offerings YouTube spots)

1. Open `/admin` → **Media Showcase (YouTube)**
2. For each of the three cards (Social Media, Brand Building, Cinematic Production):
   - Paste a **YouTube URL**
   - Edit title, description, Book Now button text
   - Optional: upload a thumbnail image
3. **Save Draft** → **Publish Live**

Image upload uses the same Vercel Blob store as publish. If upload fails, connect Blob storage first.

## How publishing works

1. Edit content in `/admin`
2. **Save Draft** → saves to browser (local backup)
3. **Publish Live** → writes to **Vercel Blob** (live site reads this immediately)
4. If `GITHUB_TOKEN` is set → also commits to GitHub as backup

The public site loads content from `/api/content/public` (Blob → GitHub → bundled file).

---

## Local development

```env
# .env.local (never commit)
ADMIN_PASSWORD=your_password
VITE_WEB3FORMS_ACCESS_KEY=your_key
```

For full API + publish testing locally:

```bash
npx vercel dev
```

Plain `npm run dev` serves the UI but API routes need `vercel dev` or production deploy.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Publishing requires GITHUB_TOKEN… | Connect **Vercel Blob** (see above) and redeploy |
| Published but site unchanged | Hard-refresh the public site; Blob updates are instant |
| Login fails | Set `ADMIN_PASSWORD` in Vercel and redeploy |
| API 404 locally | Use `npx vercel dev` instead of `npm run dev` |
