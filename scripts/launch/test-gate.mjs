#!/usr/bin/env node
/* Tests the /launch payment gate in api/store.ts (action=launch): who gets the
   course page and who gets the sales page. Stripe is faked (global fetch), so
   nothing leaves the machine. Every kind of key a visitor can arrive with:
   none, made up, unpaid, paid, a 100% off code, Builder active and ended, the
   $20 Store plan, an app purchase, Stripe saying not found, Stripe down, and a
   cookie that has gone stale.

   npx tsx scripts/launch/test-gate.mjs   (npm run test:gate) */
import { readFileSync } from 'node:fs'

process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
Object.assign(process.env, { R2_ACCOUNT_ID: 'acct', R2_BUCKET: 'bkt', R2_ACCESS_KEY_ID: 'k', R2_SECRET_ACCESS_KEY: 's', R2_PUBLIC_BASE: 'https://files.test', STORE_SHELF_SECRET: 'shh', ADMIN_SESSION_SECRET: 'adm' })
const { default: handler } = await import('../../api/store.ts')

const COURSE_MARK = 'window.__launch'
const sid = (n) => `cs_test_${n.padEnd(24, 'x')}`
const course = (payment_status = 'paid', status = 'complete') => ({ status, payment_status, customer_details: { email: 'a@b.co' }, line_items: { data: [{ price: { product: { metadata: { gf_course: 'launch' } } } }] } })
const plan = (slug, subStatus) => ({ status: 'complete', payment_status: 'paid', customer_details: { email: 'a@b.co' }, subscription: { id: 'sub_1', status: subStatus, current_period_start: 1, current_period_end: 2, items: { data: [{}] } }, line_items: { data: [{ price: { product: { metadata: { gms_slug: slug } } } }] } })
const SESSIONS = {
  [sid('paid')]: course(),
  [sid('free')]: course('no_payment_required'),
  [sid('unpaid')]: course('unpaid', 'open'),
  [sid('builder')]: plan('greenfire-member-builder', 'active'),
  [sid('ended')]: plan('greenfire-member-builder', 'canceled'),
  [sid('store')]: plan('greenfire-member-store', 'active'),
  [sid('app')]: { status: 'complete', payment_status: 'paid', customer_details: {}, line_items: { data: [{ price: { product: { metadata: { gf_store_app: 'orbit' } } } }] } },
}
let stripeDown = false
const R2 = new Map()
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  if (u.startsWith('https://files.test/')) {
    const k = decodeURIComponent(u.slice(19).split('?')[0])
    return R2.has(k) ? new Response(R2.get(k)) : new Response('', { status: 404 })
  }
  if (u.startsWith('https://acct.r2.cloudflarestorage.com/bkt')) {
    const path = decodeURIComponent(u.split('/bkt/')[1] || '').split('?')[0]
    if (init.method === 'PUT') { R2.set(path, Buffer.from(init.body).toString()); return new Response('') }
    const prefix = decodeURIComponent(new URL(u).searchParams.get('prefix') || '')
    return new Response(`<r>${[...R2.keys()].filter((k) => k.startsWith(prefix)).map((k) => `<Contents><Key>${k}</Key><Size>1</Size></Contents>`).join('')}</r>`)
  }
  if (!u.startsWith('https://api.stripe.com/')) return new Response('{}', { status: 404 })
  if (stripeDown) return new Response('{"error":{"message":"down"}}', { status: 500 })
  const id = decodeURIComponent(u.split('/checkout/sessions/')[1].split('?')[0])
  return SESSIONS[id] ? new Response(JSON.stringify(SESSIONS[id])) : new Response('{"error":{"message":"No such checkout.session"}}', { status: 404 })
}

async function hit({ s, cookie, action = 'launch', method = 'GET', body: reqBody = {}, auth } = {}) {
  const headers = {}
  let status = 0, body = ''
  const res = {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; return res },
    status: (n) => { status = n; return res },
    send: (b) => { body = String(b); return res },
    json: (j) => { body = JSON.stringify(j); return res },
  }
  await handler({ method, query: { action, ...(s ? { s } : {}) }, headers: { ...(cookie ? { cookie } : {}), ...(auth ? { authorization: auth } : {}) }, body: reqBody }, res)
  return { status, body, headers }
}

let pass = 0
const fails = []
const ok = (c, what) => { if (c) pass++; else fails.push(what) }
const opens = (r) => r.body.includes(COURSE_MARK)
const locked = (r, note) => !opens(r) && r.body.includes('Get the course') && (!note || r.body.includes(note))

let r = await hit()
ok(locked(r) && !r.headers['set-cookie'], 'no key: sales page, no cookie')
ok(r.headers['cache-control'] === 'private, no-store', 'never cached')
ok(!/\{\{|—/.test(r.body), 'sales page: no unfilled slot, no em dash')
ok(r.body.includes('https://buy.stripe.com/7sY8wR2r43rh8NW0Np1kA0H') && r.body.includes('https://buy.stripe.com/14A6oJghU5zpfckfIj1kA0n'), 'sales page: both checkout links')

r = await hit({ s: sid('paid') })
ok(opens(r) && /gf_launch=cs_test_paid.*HttpOnly; Secure/.test(r.headers['set-cookie'] || ''), 'paid: course + key cookie')
ok(r.body.includes('history.replaceState'), 'paid: key is taken out of the address bar')
ok(opens(await hit({ cookie: `other=1; gf_launch=${sid('paid')}` })), 'paid key in the cookie: course on bare /launch')
ok(opens(await hit({ s: sid('free') })), '100% off code: course')
ok(locked(await hit({ s: sid('unpaid') }), 'not finished yet'), 'unpaid: sales page, says wait')
ok(opens(await hit({ s: sid('builder') })), 'Builder active: course')
ok(locked(await hit({ s: sid('ended') }), 'not active'), 'Builder ended: locked, says rejoin')
ok(locked(await hit({ s: sid('store') }), 'Store membership does not include'), 'Store plan: locked, says Builder includes it')
ok(locked(await hit({ s: sid('app') }), 'not for this course'), 'app purchase: locked')
ok(locked(await hit({ s: 'cs_live_<script>' }), 'not complete'), 'made up key: locked, says incomplete')
ok(locked(await hit({ s: sid('nobody') }), 'not found'), 'unknown checkout: locked, says not found')
r = await hit({ cookie: `gf_launch=${sid('ended')}` })
ok(locked(r) && /Max-Age=0/.test(r.headers['set-cookie'] || ''), 'stale cookie: locked and cleared')
stripeDown = true
ok(locked(await hit({ s: sid('paid') }), 'refresh in a minute'), 'Stripe down: locked, says try again, not "not paid"')
stripeDown = false

r = await hit({ action: 'account', s: sid('builder') })
ok(JSON.parse(r.body).course === true, 'account: Builder shows the course')
r = await hit({ action: 'account', s: sid('store') })
ok(JSON.parse(r.body).course === false, 'account: Store plan does not')
r = await hit({ action: 'account', s: sid('paid') })
ok(JSON.parse(r.body).kind === 'course', 'account: a course key says so (the account page sends it to /launch)')

// a student's record: only what Jordan needs to help, and only for a real course key
const C = `gf_launch=${sid('paid')}`
r = await hit({ method: 'POST', action: 'progress', body: { step: 'code', n: 5, total: 13, os: 'mac' } })
ok(r.status === 403, 'progress with no key: refused')
ok((await hit({ method: 'POST', action: 'progress', cookie: `gf_launch=${sid('store')}`, body: { step: 'code', n: 5 } })).status === 403, 'progress from a Store plan: refused')
ok((await hit({ method: 'POST', action: 'progress', cookie: C, body: { step: 'code', n: 5, total: 13, os: 'mac' } })).status === 200, 'progress saved')
await hit({ method: 'POST', action: 'progress', cookie: C, body: { step: 'start', n: 6, total: 13, os: 'mac' } })
await hit({ method: 'POST', action: 'progress', cookie: C, body: { step: 'code', n: 5, total: 13, os: 'mac' } })
ok((await hit({ method: 'POST', action: 'help', cookie: C, body: { step: 'code', message: '' } })).status === 400, 'an empty help message: refused')
ok((await hit({ method: 'POST', action: 'help', cookie: C, body: { step: 'code', message: 'Warp says command not found' } })).status === 200, 'help saved')
ok((await hit({ method: 'POST', action: 'feedback', cookie: C, body: { result: 'maybe' } })).status === 400, 'feedback needs a real answer')
ok((await hit({ method: 'POST', action: 'feedback', cookie: C, body: { result: 'yes', text: 'works' } })).status === 200, 'feedback saved')
ok((await hit({ method: 'POST', action: 'progress', cookie: `gf_launch=${sid('builder')}`, body: { step: 'claude', n: 1, total: 13, os: 'win' } })).status === 200, 'a Builder member is tracked too')
ok((await hit({ action: 'students' })).status === 401, 'the student list needs the admin key')
const { signAdminToken: createAdminToken } = await import('../../api/_lib/auth.ts')
r = await hit({ action: 'students', auth: `Bearer ${createAdminToken()}` })
const list = JSON.parse(r.body).students || []
const me = list.find((x) => x.kind === 'course')
ok(list.length === 2 && list.some((x) => x.kind === 'builder' && x.os === 'win'), `admin sees both students (${list.length})`)
ok(me && me.email === 'a@b.co' && me.step === 'code' && me.max_n === 6 && me.trail.length === 3, 'record: email, current step, furthest step, trail: ' + JSON.stringify(me && { step: me.step, max: me.max_n, trail: me.trail.length }))
ok(me && me.help[0]?.message === 'Warp says command not found' && me.help[0].step === 'code' && me.feedback?.result === 'yes', 'record keeps help with its step, and feedback')
ok(![...R2.keys()].some((k) => k.includes('cs_test')), 'the checkout key is never part of a stored name')

const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
ok(vercel.rewrites.some((x) => x.source === '/launch' && x.destination === '/api/store?action=launch'), 'vercel.json: /launch goes through the gate')
ok(vercel.functions['api/store.ts']?.includeFiles === 'private/launch/**', 'vercel.json: the function carries the course files')

console.log(`\n${pass} passed, ${fails.length} failed`)
for (const f of fails) console.log('  FAIL ' + f)
process.exit(fails.length ? 1 : 0)
