# Email setup (required — 2 minutes)

Messages are sent to **civilizationexplorer@gmail.com** using [Web3Forms](https://web3forms.com).  
Submissions must run **in the visitor’s browser** (Web3Forms free plan does not allow server-side sending).

## 1. Get your access key

1. Open **https://web3forms.com**
2. Enter: `civilizationexplorer@gmail.com`
3. Create your **Access Key** and confirm via Gmail if asked
4. Copy the key (a long UUID string)

## 2. Add it in Vercel (exact name matters)

1. Vercel → your project → **Settings** → **Environment Variables**
2. Add:

| Name | Value |
|------|--------|
| `VITE_WEB3FORMS_ACCESS_KEY` | paste your Web3Forms access key |

3. Enable for **Production**, **Preview**, and **Development**
4. **Save**
5. **Deployments** → latest deployment → **⋯** → **Redeploy** (required after adding env vars)

> If you previously added `WEB3FORMS_ACCESS_KEY` only, add **`VITE_WEB3FORMS_ACCESS_KEY`** as well (or instead). The site reads **`VITE_`** at build time.

## 3. Allow your domain (if Web3Forms asks)

In the Web3Forms dashboard, add your live domain (e.g. `your-site.vercel.app` and your custom domain).

## 4. Test

1. Open your **live** Vercel URL (not just local files)
2. Submit the contact form or click **Join Us** and send the popup
3. You should see **Message sent**
4. Check **civilizationexplorer@gmail.com** and spam within 1–2 minutes

## Local testing

Create `.env.local` in the project root (do not commit this file):

```
VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
```

Then run:

```bash
npm run dev
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| “Contact email is not configured” | Add `VITE_WEB3FORMS_ACCESS_KEY` in Vercel and **redeploy** |
| Worked locally, not on Vercel | Redeploy after adding the env var |
| “Message sent” but no email | Check spam; confirm key is tied to `civilizationexplorer@gmail.com` at web3forms.com |
| Domain error from Web3Forms | Add your Vercel URL in Web3Forms domain settings |
