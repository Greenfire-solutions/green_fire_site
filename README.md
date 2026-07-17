# Greenfire Innovation Center Website

Public site for **Greenfire Innovation Center**, powered by the **Greenfire Creator Commons** operating model. Built with React, Vite, and Tailwind CSS.

## What is what

| Name | Role |
|------|------|
| **Greenfire Innovation Center** | Public organization and hub (navigation, hero, CTAs) |
| **Greenfire Creator Commons** | Open operating model / methodology |
| **Greenfire Sessions** | Public events and activations |

## Site structure

| Route | Page |
|-------|------|
| `/` | New vision homepage |
| `/how-it-works` | Ten-stage system + Program deep dive |
| `/offerings` | Creative services hub (former homepage content) |
| `/offerings/packages` … | Studio, cinematic, workshops, Utah Bolt |
| `/open-source` | Creator Commons open-source framework |
| `/get-involved` | Participation pathways + intake form |
| `/pilot-roadmap` | Pilot milestones |
| `/contact` | Full booking form |
| `/admin` | CMS |

## Editing content

| What | Where |
|------|--------|
| Vision homepage copy | `src/data/homepageData.ts`, `greenfireLoopData.ts`, etc. |
| Offerings / packages | CMS at `/admin` → `src/data/siteContent.json` |
| Status labels (Active/Pilot/Planned/Vision) | `src/config/statusConfig.ts` |
| External links (donation, repo) | `src/config/linksConfig.ts` |
| Official naming & SEO | `src/config/siteConfig.ts` |

See [CONTENT_STATUS.md](./CONTENT_STATUS.md) before publishing — it lists verified vs pilot vs planned claims.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), import the repository.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

## Admin CMS

Edit packages, pricing, media, and site copy at **`/admin`**.

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for password, GitHub, and Vercel deploy hook configuration.

## Contact form email (required)

Submissions are sent to `civilizationexplorer@gmail.com` via Web3Forms.

**You must add `VITE_WEB3FORMS_ACCESS_KEY` in Vercel and redeploy** — see [EMAIL_SETUP.md](./EMAIL_SETUP.md).
