#!/usr/bin/env node
/* Tests private/launch/index.html (greenfire.earth/launch, sent by api/store.ts after payment) the way students hit it.

   Part 1, the page, in real headless Chrome over a DevTools pipe:
     every business name that could break something x Mac and Windows x phone
     and desktop x every website choice. Walks every step, presses every copy
     and read-aloud button, checks the right computer's instructions show and
     the other's do not, nothing spills sideways on a phone, no {{ }} or
     "Your Business" leaks, no em dashes, every movie's targets exist, the
     movies play without errors, and progress survives a reload.
   Part 2, the commands, run for real in zsh in a throwaway home folder with a
     fake installer: the one-paste install (twice, so the PATH line is never
     doubled), install failure then fix 2, the npm fallback, and the `ai`
     shortcut for every tricky name, proving it lands in the right folder with
     the right flags.
   Part 3, every outside link still answers.

   node scripts/launch/test-launch.mjs [--quick]   (--quick skips links and the movie watch) */
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, chmodSync, existsSync, rmSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'private')
const PAGE = join(ROOT, 'launch', 'index.html')
const QUICK = process.argv.includes('--quick')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
let pass = 0
const fails = [], warns = []
const ok = (cond, what) => { if (cond) pass++; else fails.push(what) }

const NAMES = ['Sunrise Bakery', "Joe's Café & Bar", 'The "Best" Co!', 'Ünïcødé 🌿 Farm', '  spaced   out  ',
  'A'.repeat(80), 'a/b:c*d?', 'Price $5 `now`']
const SITES = ['Wix', 'Squarespace', 'WordPress', 'Shopify', 'GoDaddy', 'Webflow', 'other', 'none']
const cleanName = (s) => s.replace(/[\\/:*?"<>|`$!]/g, '').replace(/\s+/g, ' ').trim()

/* ---------------- static server: private/ with the /launch rewrite ---------------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css' }
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p === '/launch' || p === '/launch/') p = '/launch/index.html'
  const f = join(ROOT, p)
  if (!f.startsWith(ROOT) || !existsSync(f)) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}/launch`

/* ---------------- Chrome over a pipe (no debugging port) ---------------- */
const profile = mkdtempSync(join(tmpdir(), 'launch-test-'))
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', 'about:blank'],
{ stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] })
for (const sig of ['exit', 'SIGINT', 'SIGTERM']) process.on(sig, () => { try { chrome.kill('SIGKILL') } catch {} if (sig !== 'exit') process.exit(1) })
chrome.stderr.on('data', () => {})
const wr = chrome.stdio[3], rd = chrome.stdio[4]
let nextId = 0, buf = Buffer.alloc(0)
const pending = new Map(), errors = []
rd.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]); let i
  while ((i = buf.indexOf(0)) !== -1) {
    let m; try { m = JSON.parse(buf.subarray(0, i).toString()) } catch { m = null }
    buf = buf.subarray(i + 1); if (!m) continue
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result) }
    else if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text))
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console: ' + m.params.args.map((a) => a.value ?? a.description).join(' '))
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon|fonts\.g/.test(m.params.entry.url || m.params.entry.text)) errors.push('log: ' + m.params.entry.text)
  }
})
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++nextId; pending.set(id, { resolve, reject })
  wr.write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0')
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Runtime.enable', {}, S); await send('Page.enable', {}, S); await send('Log.enable', {}, S)
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, S)
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'evaluate failed')
  return r.result.value
}
async function viewport(w, h) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 }, S) }
async function load(url) {
  await send('Page.navigate', { url }, S)
  for (let i = 0; i < 100; i++) { await sleep(100); if (await evaluate('document.readyState==="complete" && !!window.__launch').catch(() => false)) return }
  throw new Error('page never became ready: ' + url)
}

/* Runs inside the page: one whole student journey. Returns { fails, notes, alias }. */
const JOURNEY = String(async function journey(o) {
  const F = [], $ = (id) => document.getElementById(id), all = (s, r) => [...(r || document).querySelectorAll(s)]
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const visible = (e) => !!(e && e.offsetParent !== null && e.getClientRects().length)
  let clip = null, spoken = null
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t) => { clip = t; return Promise.resolve() } } })
  if (window.speechSynthesis) speechSynthesis.speak = (u) => { spoken = u.text; setTimeout(() => u.onend && u.onend(), 0) }
  const on = () => document.querySelector('.step.on')
  const label = (what) => `[${o.os} ${o.w}px "${o.name}" site=${o.site}] ${what}`

  // Welcome: an empty name must not move on.
  if (on().dataset.id !== 'welcome') F.push(label('fresh load did not start on welcome'))
  on().querySelector('[data-next]').click(); await wait(50)
  if (o.cleaned === '' || true) { if ($('biz').value.trim() === '' && on().dataset.id !== 'welcome') F.push(label('empty name was allowed past welcome')) }
  $('biz').value = o.name; $('biz').dispatchEvent(new Event('input', { bubbles: true }))
  document.querySelector(`#ospick [data-pick=${o.os}]`).click()
  if (!document.body.classList.contains('os-' + o.os)) F.push(label('computer choice did not apply'))
  on().querySelector('[data-next]').click(); await wait(50)
  if (o.cleaned && on().dataset.id === 'welcome') F.push(label('valid name did not move past welcome'))
  if (!o.cleaned) return { fails: F, alias: '', stop: true }

  const other = o.os === 'mac' ? 'win' : 'mac'
  let guard = 0
  while (guard++ < 30) {
    const st = on(), id = st.dataset.id
    if (document.querySelectorAll('.step.on').length !== 1) F.push(label(id + ': not exactly one step showing'))
    if (document.documentElement.scrollWidth > innerWidth + 1) F.push(label(id + `: page scrolls sideways (${document.documentElement.scrollWidth} > ${innerWidth})`))
    for (const e of all('[data-os]', st)) if (e.dataset.os === other && visible(e)) F.push(label(id + ': shows ' + other + ' instructions'))
    const both = all('[data-os="mac"]', st).length && all('[data-os="win"]', st).length
    if (both && !all('[data-os="' + o.os + '"]', st).some(visible)) F.push(label(id + ': no ' + o.os + ' instructions visible'))
    if (id === 'website') {
      document.querySelector(`#sitepick [data-site="${o.site}"]`).click(); await wait(20)
      if (o.site !== 'none' && o.url) { $('siteurl').value = o.url; $('siteurl').dispatchEvent(new Event('input', { bubbles: true })) }
      if (o.site === 'none' && visible($('siteurlcard'))) F.push(label('website: address box shows with "No website yet"'))
    }
    const text = st.innerText
    if (/\{\{|\}\}/.test(text)) F.push(label(id + ': {{ }} placeholder visible'))
    if (/[–—]/.test(text)) F.push(label(id + ': en or em dash in the page'))
    if (!o.keepsDefault && /Your Business/.test(text)) F.push(label(id + ': still says "Your Business"'))
    for (const p of all('textarea.prompt', st)) {
      if (/\{\{|\}\}/.test(p.value)) F.push(label(id + ': {{ }} left in prompt #' + p.id))
      if (/[–—]/.test(p.value)) F.push(label(id + ': dash in prompt #' + p.id))
    }
    // every visible copy button copies exactly what it shows
    for (const b of all('[data-copy],[data-copy-name]', st).filter(visible)) {
      clip = null; b.click(); await wait(30)
      const src = b.hasAttribute('data-copy-name') ? null : $(b.dataset.copy)
      const want = src ? (src.tagName === 'TEXTAREA' ? src.value : src.textContent) : o.cleaned
      if (!clip) F.push(label(id + ': copy button "' + (b.dataset.label || b.textContent) + '" copied nothing'))
      else if (clip !== want) F.push(label(id + ': copy button copied something other than what it shows'))
      if (/^(briefPrompt|buildPrompt|githubPrompt)$/.test(src?.id || '') && !clip.includes(o.cleaned) && !(src.id === 'githubPrompt')) F.push(label(id + ': prompt #' + src.id + ' lacks the business name'))
    }
    // read it to me reads this step, and only this computer's lines
    const rb = st.querySelector('[data-read]')
    if (rb && window.speechSynthesis) {
      spoken = null; rb.click(); await wait(20)
      if (!spoken || spoken.length < 40) F.push(label(id + ': read-aloud said nothing'))
      if (spoken && o.os === 'mac' && /Windows key \+ H/.test(spoken)) F.push(label(id + ': read-aloud read the Windows lines on a Mac'))
      if (spoken && o.os === 'win' && /Command \+ V|fn key/.test(spoken)) F.push(label(id + ': read-aloud read the Mac lines on Windows'))
      rb.click()
    }
    // every visible link goes somewhere sane
    for (const a of all('a[href]', st).filter(visible)) {
      const h = a.getAttribute('href')
      if (!/^(https:\/\/|\/|x-apple\.systempreferences:)/.test(h)) F.push(label(id + ': odd link ' + h))
      if (/^https:/.test(h) && a.target !== '_blank') F.push(label(id + ': outside link opens over the guide ' + h))
    }
    // tap targets big enough for a thumb
    for (const b of all('.btn,.copy,.pick button', st).filter(visible)) { const r = b.getBoundingClientRect(); if (r.height < 40) F.push(label(id + ': button too small: ' + b.textContent.trim().slice(0, 30))) }
    // every movie's every target exists in its own scene
    const D = window.__launch.D()
    for (const [demo, scenes] of Object.entries(D)) scenes.forEach((sc, i) => {
      const box = document.createElement('div'); box.innerHTML = sc.html
      const acts = sc.act || window.__launch.TERM(demo) || []
      for (const a of acts) {
        if (a[0] === 'menu') { const m = document.createElement('div'); m.id = 'x-new'; box.appendChild(m) } // the right-click menu brings its own item
        if (/^(move|tap|type|set|on|count|menu)$/.test(a[0]) && typeof a[1] === 'string' && sc.kind !== 'term' && !box.querySelector('#' + a[1])) F.push(label(`movie ${demo} scene ${i + 1}: no #${a[1]}`))
        if (sc.kind === 'term' && a[0] === 'type' && !box.querySelector('#x-t')) F.push(label(`movie ${demo} scene ${i + 1}: terminal has nowhere to type`))
        if (sc.kind === 'term' && a[0] === 'out' && !box.querySelector('#x-out')) F.push(label(`movie ${demo} scene ${i + 1}: terminal has nowhere to print`))
        if (sc.kind === 'term' && a[0] === 'out' && /[–—]/.test(a[1])) F.push(label(`movie ${demo}: dash`))
        if (a[0] === 'cap' && /[–—]/.test(a[1])) F.push(label(`movie ${demo}: dash in caption`))
      }
    })
    if (id === 'done') break
    // back then forward lands on the same step
    const back = st.querySelector('[data-back]')
    if (back) { back.click(); await wait(10); on().querySelector('[data-next]').click(); await wait(10); if (on().dataset.id !== id) F.push(label(id + ': back then next did not return here')) }
    on().querySelector('[data-next]').click(); await wait(40)
  }
  const alias = $('aliasCmd').textContent
  if (o.os === 'mac' && !alias.includes('--dangerously-skip-permissions --model opus --chrome')) F.push(label('ai shortcut lacks the flags'))
  return { fails: F, alias, github: $('githubPrompt').value, site: $('sitePrompt').value }
})

/* ---------------- Part 1: the page ---------------- */
console.log('Part 1: the page in Chrome')
const aliases = new Map()
let n = 0
for (const name of NAMES) for (const os of ['mac', 'win']) {
  const w = (n % 2) ? 1280 : 390, site = SITES[n % SITES.length], url = n % 3 ? 'https://www.example-' + n + '.com/' : ''
  n++
  await viewport(w, w < 600 ? 844 : 900)
  await load(BASE); await evaluate('localStorage.clear()'); errors.length = 0; await load(BASE)
  const cleaned = cleanName(name)
  const r = await evaluate(`(${JOURNEY})(${JSON.stringify({ name, cleaned, os, w, site, url, keepsDefault: false })})`)
  r.fails.forEach((f) => fails.push(f)); pass += r.fails.length ? 0 : 1
  if (os === 'mac') aliases.set(cleaned, r.alias)
  if (site !== 'none') {
    ok(r.site.includes('built on: ' + (site === 'other' ? 'not sure' : site)), `site prompt names ${site}`)
    ok(url ? r.site.includes('My website: ' + url) : r.site.includes('(ask me for it)'), `site prompt carries the address (${site})`)
    if (site === 'WordPress' && url) ok(r.site.includes('https://www.example-' + (n - 1) + '.com/wp-admin'), 'WordPress login is the site\'s own /wp-admin')
  } else ok(/do not have a website yet/.test(r.site), 'no-website prompt builds a site')
  ok(r.github.includes(os === 'win' ? 'for Windows' : 'for Mac (macOS)'), `GitHub prompt names ${os}`)
  ok(/PRIVATE GitHub repository called [a-z0-9-]+ /.test(r.github), 'GitHub repo name is a clean slug for ' + JSON.stringify(name))
  errors.splice(0).forEach((e) => fails.push(`[${os} "${name}"] ${e}`))
  process.stdout.write('.')
}
// empty and whitespace-only names never get past welcome
for (const name of ['', '   ', '"*?']) {
  await load(BASE); await evaluate('localStorage.clear()'); await load(BASE)
  const r = await evaluate(`(${JOURNEY})(${JSON.stringify({ name, cleaned: cleanName(name), os: 'mac', w: 390, site: 'none' })})`)
  r.fails.forEach((f) => fails.push(f)); ok(r.stop, `unusable name ${JSON.stringify(name)} stops at welcome`)
}
// progress survives a reload, and a returning student lands where they left off
await load(BASE); await evaluate('localStorage.clear()'); await load(BASE)
await evaluate(`(async()=>{const b=document.getElementById('biz');b.value='Return Test';b.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#ospick [data-pick=win]').click();for(let i=0;i<5;i++){document.querySelector('.step.on [data-next]').click();await new Promise(r=>setTimeout(r,20))}})()`)
await load(BASE)
const back = await evaluate(`({id:document.querySelector('.step.on').dataset.id,name:document.getElementById('biz').value,win:document.body.classList.contains('os-win')})`)
ok(back.id === 'code' && back.name === 'Return Test' && back.win, 'reload keeps step, name and computer: ' + JSON.stringify(back))
// storage blocked (private window): the page must still work
await send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})" }, S)
errors.length = 0; await load(BASE + '?private')
const priv = await evaluate(`(async()=>{const b=document.getElementById('biz');b.value='Private';b.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.step.on [data-next]').click();await new Promise(r=>setTimeout(r,30));return document.querySelector('.step.on').dataset.id})()`)
ok(priv === 'claude' && !errors.length, 'works with storage blocked: ' + priv + ' ' + errors.join(' | '))
console.log()

/* the movies actually play: sit on each step and listen for errors */
if (!QUICK) {
  console.log('Part 1b: watching every movie play, both computers, every website choice')
  const ids = await evaluate(`[...document.querySelectorAll('.step')].map(s=>s.dataset.id)`)
  await send('Target.closeTarget', { targetId }).catch(() => {})
  const t2 = await send('Target.createTarget', { url: 'about:blank' }); const s2 = await send('Target.attachToTarget', { targetId: t2.targetId, flatten: true })
  Object.assign(globalThis, { __S2: s2.sessionId })
  await send('Runtime.enable', {}, s2.sessionId); await send('Log.enable', {}, s2.sessionId)
  const ev2 = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }, s2.sessionId)).result.value
  const runs = []
  for (const os of ['mac', 'win']) ids.forEach((id, at) => { if (id === 'website') SITES.forEach((site) => runs.push({ os, at, id, site })); else runs.push({ os, at, id, site: 'Wix' }) })
  for (const r of runs) {
    await send('Page.navigate', { url: 'about:blank' }, s2.sessionId); await sleep(50)
    await send('Page.navigate', { url: BASE }, s2.sessionId); await sleep(300)
    await ev2(`localStorage.setItem('gf-launch',JSON.stringify({biz:"Joe's Café",os:'${r.os}',at:${r.at},site:'${r.site}',siteurl:'joescafe.com'}))`)
    errors.length = 0
    await send('Page.navigate', { url: BASE + '?' + r.os + r.at + r.site }, s2.sessionId)
    await sleep(r.id === 'welcome' ? 300 : 9000)
    const shown = await ev2(`(()=>{const s=document.querySelector('.step.on .screen .body');return s?s.children.length:-1})()`)
    if (r.id !== 'welcome') ok(shown > 0, `${r.os} ${r.id} ${r.site}: movie shows something`)
    errors.splice(0).forEach((e) => fails.push(`movie ${r.os} ${r.id} ${r.site}: ${e}`))
    process.stdout.write('.')
  }
  console.log()
}

/* ---------------- Part 2: the commands, for real, in zsh ---------------- */
console.log('Part 2: running the commands in a throwaway home folder')
const html = readFileSync(PAGE, 'utf8')
const unhtml = (s) => s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
const cmd = (id) => unhtml(html.match(new RegExp(`<code id="${id}">([^<]*)</code>`))[1])
const stubs = mkdtempSync(join(tmpdir(), 'launch-stubs-'))
const write = (f, s) => { writeFileSync(f, s); chmodSync(f, 0o755) }
// a fake installer: what claude.ai/install.sh does, minus the download
write(join(stubs, 'curl'), `#!/bin/sh\nif [ -n "$FAIL_CURL" ]; then echo "curl: (6) Could not resolve host" >&2; exit 6; fi\ncat <<'EOS'\nmkdir -p "$HOME/.local/bin"\nprintf '#!/bin/sh\\necho "2.1.3 (Claude Code)"\\n' > "$HOME/.local/bin/claude"\nchmod +x "$HOME/.local/bin/claude"\necho "Claude Code installed"\nEOS\n`)
write(join(stubs, 'npm'), `#!/bin/sh\nif [ "$1" = config ]; then echo "$4" > "$HOME/.npmprefix"; exit 0; fi\nif [ "$1" = install ]; then P=$(cat "$HOME/.npmprefix"); mkdir -p "$P/bin"; printf '#!/bin/sh\\necho "2.1.3 (Claude Code)"\\n' > "$P/bin/claude"; chmod +x "$P/bin/claude"; exit 0; fi\n`)
const SYS = '/usr/bin:/bin:/usr/sbin:/sbin'
const zsh = (home, line, extra = {}, flags = ['-f', '-c']) => {
  try { return execFileSync('/bin/zsh', [...flags, line], { env: { HOME: home, PATH: stubs + ':' + SYS, TERM: 'dumb', ...extra }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 90000 }) }
  catch (e) { return (e.signal === 'SIGTERM' ? 'TIMED OUT (machine busy?) ' : '') + String(e.stdout || '') + String(e.stderr || '') }
}
const home = () => mkdtempSync(join(tmpdir(), 'launch-home-'))
const count = (f, s) => existsSync(f) ? readFileSync(f, 'utf8').split(s).length - 1 : 0
const PATHLINE = 'export PATH="$HOME/.local/bin:$PATH"'

{ const H = home(); const out = zsh(H, cmd('installMac'))
  ok(/\(Claude Code\)/.test(out), 'one-paste install ends with a working claude: ' + out.trim().split('\n').pop())
  ok(count(join(H, '.zshrc'), PATHLINE) === 1, 'install adds the PATH line once')
  zsh(H, cmd('installMac')); ok(count(join(H, '.zshrc'), PATHLINE) === 1, 'running the install twice does not double the PATH line')
  ok(/\(Claude Code\)/.test(zsh(H, 'claude --version', {}, ['-i', '-c'])), 'a NEW Warp window finds claude') }
{ const H = home(); writeFileSync(join(H, '.zshrc'), '# my stuff\n' + PATHLINE + '\n')
  zsh(H, cmd('installMac')); ok(count(join(H, '.zshrc'), PATHLINE) === 1, 'install leaves an existing PATH line alone') }
{ const H = home(); const out = zsh(H, cmd('installMac'), { FAIL_CURL: '1' })
  ok(/not found/.test(out) && !/\(Claude Code\)/.test(out), 'a failed download says so instead of pretending')
  zsh(H, cmd('installMac'))
  writeFileSync(join(H, '.zshrc'), '')
  ok(/\(Claude Code\)/.test(zsh(H, cmd('fixPath'))), 'fix 2 (PATH) works when the PATH line went missing')
  ok(/\(Claude Code\)/.test(zsh(H, 'claude --version', {}, ['-i', '-c'])), 'and a new window finds it after fix 2') }
{ const H = home(); const out = zsh(H, cmd('fixNpm'))
  ok(/\(Claude Code\)/.test(out), 'fix 3 (npm fallback) installs without admin: ' + out.trim().split('\n').pop()) }
{ const H = home(); const out = execFileSync('/bin/bash', ['-c', cmd('installMac')], { env: { HOME: H, PATH: stubs + ':' + SYS }, encoding: 'utf8' })
  ok(/\(Claude Code\)/.test(out), 'install also works if the student\'s window runs bash') }

// the `ai` shortcut, for every name, against a fake claude that reports where it ran
for (const [name, alias] of aliases) {
  const H = home(); mkdirSync(join(H, 'Desktop', name), { recursive: true }); mkdirSync(join(H, '.local', 'bin'), { recursive: true })
  write(join(H, '.local', 'bin', 'claude'), '#!/bin/sh\necho "PWD=$PWD"\necho "ARGS=$*"\n')
  writeFileSync(join(H, '.zshrc'), PATHLINE + '\n')
  const setup = zsh(H, alias)
  ok(/Ready\. Now type: ai/.test(setup), `"${name}": shortcut line runs clean ${setup.includes('Ready') ? '' : setup.trim()}`)
  const out = zsh(H, 'ai', {}, ['-i', '-c'])
  ok(out.includes('PWD=' + join(H, 'Desktop', name)), `"${name}": ai opens the business folder ${out.trim().replace(/\n/g, ' | ')}`)
  ok(out.includes('ARGS=--dangerously-skip-permissions --model opus --chrome'), `"${name}": ai starts Opus, full power, Chrome on`)
  zsh(H, alias); ok(/PWD=/.test(zsh(H, 'ai', {}, ['-i', '-c'])), `"${name}": pasting the shortcut twice still works`)
}
rmSync(stubs, { recursive: true, force: true })

/* ---------------- Part 3: outside links ---------------- */
if (!QUICK) {
  console.log('Part 3: every outside link')
  const links = [...new Set([...html.matchAll(/href="(https:\/\/[^"]+)"/g)].map((m) => m[1]))]
  const WALLED = /chatgpt\.com|claude\.ai|warp\.dev|github\.com\/signup/ // these answer bots with 403 but work in a browser
  for (const u of links) {
    let code = 0
    try { code = (await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36' }, signal: AbortSignal.timeout(15000) })).status } catch (e) { code = String(e.cause?.code || e.name) }
    if (code >= 200 && code < 400) pass++
    else if (WALLED.test(u) && (code === 403 || code === 429)) warns.push(`${u} answered ${code} to a script (normal for this site; opens fine in a browser)`)
    else fails.push(`link ${u} answered ${code}`)
  }
}

chrome.kill('SIGKILL'); server.close()
const uniq = [...new Set(fails)]; fails.length = 0; fails.push(...uniq)
console.log(`\n${pass} passed, ${fails.length} failed${warns.length ? `, ${warns.length} notes` : ''}`)
warns.forEach((w) => console.log('  NOTE ' + w))
fails.forEach((f) => console.log('  FAIL ' + f))
process.exit(fails.length ? 1 : 0)
