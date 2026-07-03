# Green Fire Website

Innovation lab and media hub marketing site built with React, Vite, and Tailwind CSS.

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
