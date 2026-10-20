#!/usr/bin/env node
/* ============================================================================
   GREEN FIRE SEO: THE GATE
   ----------------------------------------------------------------------------
   Every post and what stands between it and going live. The same checks the
   build runs, so a post that passes here cannot fail on Vercel.

     node scripts/seo/check.mjs            every post
     node scripts/seo/check.mjs <slug>     one post, exit 1 if it has errors
   ========================================================================== */

import { checkAll } from './lib.mjs'

const only = process.argv[2]
const { results, planErrors } = checkAll()
const shown = only ? results.filter(r => r.post.slug === only) : results
if (only && !shown.length) { console.error(`No post with slug ${only}`); process.exit(1) }

for (const m of planErrors) console.log(`\x1b[31mplan\x1b[0m ${m}`)
for (const r of shown) {
  const tag = r.errors.length ? '\x1b[31mBLOCKED\x1b[0m' : r.post.status === 'published' ? '\x1b[32mLIVE\x1b[0m' : '\x1b[36mREADY\x1b[0m'
  console.log(`${tag} ${r.post.slug} \x1b[90m(${r.post.status}, ${r.words} words)\x1b[0m`)
  for (const m of r.errors) console.log(`   \x1b[31merror\x1b[0m ${m}`)
  for (const m of r.warnings) console.log(`   \x1b[33mwarn\x1b[0m  ${m}`)
}
const bad = shown.filter(r => r.errors.length && (only || r.post.status === 'published'))
process.exit(planErrors.length || bad.length ? 1 : 0)
