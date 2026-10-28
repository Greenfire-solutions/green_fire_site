#!/usr/bin/env node
/* Store search check: real visitor sentences against the LIVE catalogue,
   each must bring up the app a person typing it needs, and the adult app
   must never appear unless named. Run after changing src/lib/storeSearch.ts
   or the operator's tags:  node scripts/store/search-check.mjs [catalogue url or json file] */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL, fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../..', import.meta.url))
const out = join(mkdtempSync(join(tmpdir(), 'gf-search-')), 'storeSearch.mjs')
execFileSync('npx', ['esbuild', join(root, 'src/lib/storeSearch.ts'), '--format=esm', '--outfile=' + out, '--log-level=warning'], { cwd: root, stdio: 'inherit' })
const { search, suggestions } = await import(pathToFileURL(out).href)
const src = process.argv[2] || 'https://greenfire.earth/api/store?v=' + Date.now()
const cat = /^https?:/.test(src) ? await (await fetch(src)).json() : JSON.parse(readFileSync(src, 'utf8'))
const label = g => cat.genres[g]?.label || ''
const cases = [
  ["I'm a DJ and need more gigs", 'headliner-dj-desk'],
  ['make reels from my clips', 'content-wizard'],
  ['plan my farm', null],
  ['hemp', 'canopy-os'],
  ['run a festival', 'festival-os'],
  ['answer my booking emails', null],
  ['design my land', 'permascape-3d'],
  ['fire dancer', 'orbit-performer-desk'],
  ['press kit', 'greenfire-epk-builder'],
  ['airbnb', 'airbnb-operator'],
  ['bedtime story for my kids', 'storyforge-odyssey'],
  ['i make beats and sell licences', 'producer-operating-system'],
  ['contractor job sites', 'groundwork'],
  ['captoins', 'content-wizard'],
  ['tik', null],
  ['podcast', 'podcast-booking'],
  ['register my songs for royalties', 'musicians-automation-app'],
  ['xyzzy plumbing', null],
  ['candel vidoes', 'content-wizard'],
  ['I sell candles', 'content-wizard'],
  ['visualiser', 'content-wizard'],
  ['visualizer', 'content-wizard'],
  ['visualiser for my track', 'content-wizard'],
  ['escort', 'velvet-desk'],
  ['pro domme bookings', 'velvet-desk'],
]
let bad = 0
for (const [q, want] of cases) {
  const h = search(cat.apps, q, label)
  const top = h.slice(0, 4).map(x => `${x.app.id}${x.why.length ? ' [' + x.why.join(', ') + ']' : ''}`)
  const ok = want === null || h.slice(0, 3).some(x => x.app.id === want)
  if (!ok) bad++
  console.log(`${ok ? 'ok ' : 'BAD'} "${q}" -> ${top.join(' | ') || '(nothing)'}`)
}
console.log('suggestions:', suggestions(cat.apps, 7).join(', '))
const t = performance.now(); for (let i = 0; i < 200; i++) search(cat.apps, 'i am a dj and want gigs ' + i, label); console.log(`ms per search: ${((performance.now() - t) / 200).toFixed(2)}`)
const NO = ['make my shop videos look professional', 'visualiser for my track', 'professional', 'book clients', 'private business software']
for (const q of NO) { const h = search(cat.apps, q, label); const v = h.some(x => x.app.id === 'velvet-desk'); if (v) bad++; console.log(`${v ? 'BAD' : 'ok '} no adult app for "${q}" -> ${h.slice(0, 3).map(x => x.app.id).join(' | ')}`) }
process.exitCode = bad ? 1 : 0
