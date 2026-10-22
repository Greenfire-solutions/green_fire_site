#!/usr/bin/env node
/* ============================================================================
   GREEN FIRE SEO: MOVE THE SITE TO ITS OWN DOMAIN
   ----------------------------------------------------------------------------
     node scripts/seo/switch-domain.mjs greenfire.earth

   Rewrites the site's address everywhere a visitor or a crawler reads it
   (seo.json siteUrl, which drives canonicals, the sitemap, the feed and the
   IndexNow host; the short links on /start; the onboarding form footer) and
   adds permanent redirects so every old green-fire-site.vercel.app link, and
   www, lands on the same path at the new domain. Old links in emails, videos
   and the operator keep working through those redirects, so they are left alone.

   It edits files only. Attaching the domain in Vercel, committing and pushing
   are done by whoever runs it (watch-domain.sh does all three).
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib.mjs'

const domain = (process.argv[2] || '').toLowerCase()
if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) { console.error('usage: switch-domain.mjs <domain>'); process.exit(1) }
const OLD_HOST = 'green-fire-site.vercel.app'
const NEW = `https://${domain}`

const edit = (rel, fn) => {
  const file = join(ROOT, rel)
  const before = readFileSync(file, 'utf8')
  const after = fn(before)
  if (after !== before) { writeFileSync(file, after); console.log(`updated ${rel}`) }
}

edit('src/config/seo.json', s => s.replace(/"siteUrl": "[^"]+"/, `"siteUrl": "${NEW}"`))
edit('src/data/startOffers.json', s => s.split(`https://${OLD_HOST}`).join(NEW))
edit('api/onboard.ts', s => s.split(`${OLD_HOST}/start`).join(`${domain}/start`))

edit('vercel.json', s => {
  const cfg = JSON.parse(s)
  cfg.redirects = (cfg.redirects || []).filter(r => !(r.has || []).some(h => h.type === 'host'))
  /* Host redirects go first so an old address is moved before any path rule
     runs. /api/ is left out: a webhook or a form posting to the old address
     would not follow a redirect, and both hosts serve the same functions. */
  cfg.redirects.unshift(
    ...[OLD_HOST, `www.${domain}`].map(host => ({ source: '/:path((?!api/).*)', has: [{ type: 'host', value: host }], destination: `${NEW}/:path`, permanent: true }))
  )
  return JSON.stringify(cfg, null, 2) + '\n'
})
