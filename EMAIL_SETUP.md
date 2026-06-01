# Email setup (required for contact form)

The site sends messages to **civilizationexplorer@gmail.com** using [Web3Forms](https://web3forms.com). This takes about 2 minutes.

## Steps

1. Open **https://web3forms.com**
2. Enter your email: `civilizationexplorer@gmail.com`
3. Click **Create Access Key** and check your Gmail for the confirmation link if asked
4. Copy the **Access Key** (long string)

## Add the key to Vercel

1. Open your project on [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `WEB3FORMS_ACCESS_KEY`
   - **Value:** paste your access key
   - **Environments:** Production, Preview, Development (check all)
4. Click **Save**
5. Go to **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**

## Test

1. Visit your live site
2. Fill out **Get in touch** or click **Join Us** and submit the popup form
3. You should see **Message sent** and receive an email at `civilizationexplorer@gmail.com` within a minute (check spam if needed)

If you see **Email service is not configured**, the environment variable is missing or the site was not redeployed after adding it.
