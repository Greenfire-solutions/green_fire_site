#!/usr/bin/env node
/* ============================================================================
   GREEN FIRE SEO: INDEXNOW
   ----------------------------------------------------------------------------
   Tells Bing, Yandex, Seznam and Naver that pages exist or changed, so they
   crawl in minutes instead of weeks. Bing's index also answers ChatGPT search,
   Copilot and DuckDuckGo, so this is the fastest way into AI answers.

   Runs at the end of `npm run build`, but only sends on a Vercel production
   build: a local build or a preview never pings. The key in seo.json is
   public by design; public/<key>.txt proves the site owns it.

   It can never fail the build. A ping that does not land is a note in the
   log, and the next production build sends everything again.

     node scripts/seo/indexnow.mjs --force   send now, from this Mac
   ========================================================================== */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, readSeo } from './lib.mjs'

const force = process.argv.includes('--force')
if (!force && process.env.VERCEL_ENV !== 'production') process.exit(0)

const seo = readSeo()
const key = seo.indexNowKey
const sitemap = join(ROOT, 'dist', 'sitemap.xml')
if (!key || !existsSync(join(ROOT, 'public', `${key}.txt`)) || !existsSync(sitemap)) {
  console.log('indexnow: no key file or no sitemap, skipped')
  process.exit(0)
}
const urls = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
const host = new URL(seo.siteUrl).host
try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${seo.siteUrl.replace(/\/$/, '')}/${key}.txt`, urlList: urls }),
    signal: AbortSignal.timeout(15000)
  })
  /* 200 and 202 both mean accepted; 202 is "key not checked yet". */
  console.log(`indexnow: ${urls.length} URLs sent, HTTP ${res.status}${res.ok ? '' : ' ' + (await res.text()).slice(0, 200)}`)
} catch (err) {
  console.log(`indexnow: not sent (${err.message}); the next production build retries`)
}
