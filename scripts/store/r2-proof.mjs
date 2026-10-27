// The store, lead, admin and private-page functions, bundled as deployed,
// run against the REAL R2 bucket under a throwaway prefix, with Stripe
// answered by a fake. Nothing public is touched.
//   node scripts/store/r2-proof.mjs     (R2_* from the environment, or the
//   music site's .env.r2 on this Mac)
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const SITE = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
const OUT = join(process.env.TMPDIR || "/tmp", "greenfire-store-proof"); mkdirSync(OUT, { recursive: true });
const envf = process.env.R2_ACCOUNT_ID ? "" : (() => { try { return readFileSync('/Users/jordanlarsen/Desktop/Main projects/The Great Medicine Show/50_Website/.env.r2', "utf8"); } catch { return ""; } })();
for (const l of envf.split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ''); }
process.env.R2_PREFIX = `greenfire/site-test-${crypto.randomBytes(3).toString('hex')}`;
process.env.STORE_SHELF_SECRET = 'test-shelf-secret';
process.env.ADMIN_PASSWORD = 'test-admin-password';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
console.log('prefix', process.env.R2_PREFIX);
const files = ['api/store.ts', 'api/share.ts', 'api/lead.ts', 'api/onboard.ts', 'api/admin/leads.ts', 'api/admin/intakes.ts', 'api/admin/upload.ts', 'api/admin/publish.ts', 'api/_lib/auth.ts', 'api/_lib/onboardQuestions.ts'];
execFileSync(join(SITE, 'node_modules/.bin/esbuild'), [...files.map(f => join(SITE, f)), '--bundle', '--platform=node', '--format=esm', '--target=node20', `--outdir=${OUT}`, '--log-level=warning', '--outbase=' + join(SITE, 'api')]);
const load = async f => (await import(join(OUT, f))).default;
const store = await load('store.js'), share = await load('share.js'), lead = await load('lead.js'), onboard = await load('onboard.js');
const adminLeads = await load('admin/leads.js'), adminIntakes = await load('admin/intakes.js'), adminUpload = await load('admin/upload.js'), adminPublish = await load('admin/publish.js');
const { signAdminToken } = await import(join(OUT, '_lib/auth.js'));
const ADMIN = `Bearer ${signAdminToken()}`;

// ---- fake Stripe
const realFetch = globalThis.fetch;
const APP = 'orbit-performer-desk';
const sessions = {
  cs_test_paidapp0000000: { status: 'complete', payment_status: 'paid', customer_details: { email: 'buyer@example.com' }, line_items: { data: [{ price: { product: { metadata: { gf_store_app: APP } } } }] } },
  cs_test_unpaidapp00000: { status: 'open', payment_status: 'unpaid', customer_details: { email: 'nope@example.com' }, line_items: { data: [{ price: { product: { metadata: { gf_store_app: APP } } } }] } },
  cs_test_storeplan00000: { status: 'complete', payment_status: 'paid', customer_details: { email: 'member@example.com' }, line_items: { data: [{ price: { product: { metadata: { gms_slug: 'greenfire-member-store' } } } }] }, subscription: { id: 'sub_test_1', status: 'active', items: { data: [{ current_period_start: 1700000000, current_period_end: 1702592000 }] } } },
  cs_test_builder0000000: { status: 'complete', payment_status: 'paid', customer_details: { email: 'builder@example.com' }, line_items: { data: [{ price: { product: { metadata: { gms_slug: 'greenfire-member-builder' } } } }] }, subscription: { id: 'sub_test_2', status: 'active', items: { data: [{ current_period_start: 1700000000, current_period_end: 1702592000 }] } } },
};
let stripeCalls = 0;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u.startsWith('https://api.stripe.com/v1/checkout/sessions/')) {
    stripeCalls++;
    const id = decodeURIComponent(u.split('/sessions/')[1].split('?')[0]);
    const s = sessions[id];
    return new Response(JSON.stringify(s || { error: { message: 'No such checkout.session' } }), { status: s ? 200 : 404 });
  }
  if (u.startsWith('https://api.stripe.com')) return new Response('{}', { status: 500 });
  return realFetch(url, init);
};

// ---- fake req/res
function req({ method = 'GET', query = {}, body, headers = {} } = {}) { return { method, query, body, headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])) }; }
function res() {
  const r = { statusCode: 200, headers: {}, body: undefined, redirected: null };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; return r; };
  r.status = c => { r.statusCode = c; return r; };
  r.json = o => { r.body = o; return r; };
  r.send = t => { r.body = t; return r; };
  r.end = () => r;
  r.redirect = (c, u) => { r.statusCode = c; r.redirected = u; return r; };
  return r;
}
async function call(h, opts) { const r = res(); await h(req(opts), r); return r; }
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; console.log(`  ok   ${name}`); } else { fail++; console.log(`  FAIL ${name} ${extra}`); } };
const J = r => (r.body === undefined ? `(no body) -> ${r.redirected}` : JSON.stringify(r.body).slice(0, 160));

console.log('catalogue');
let r = await call(store, {});
ok(r.statusCode === 200 && JSON.parse(r.body).apps.length === 0, 'an empty shelf answers an empty catalogue, not an error', J(r));
const cat = { apps: [{ id: APP, title: 'Orbit', access: 'member', free: false, ready: true, price_usd: 99, builds: [{ arch: 'intel', label: 'Intel Mac' }, { arch: 'silicon', label: 'Apple Silicon' }] }, { id: 'other-app', title: 'Other', access: 'member', free: false, ready: true, price_usd: 50 }, { id: 'big-tool', title: 'Big', access: 'builder', free: false, ready: true, price_usd: 200 }], genres: {} };
r = await call(store, { method: 'POST', query: { action: 'publish' }, body: { catalog: cat } });
ok(r.statusCode === 401, 'publish without the admin token is refused', J(r));
r = await call(store, { method: 'POST', query: { action: 'publish' }, body: { catalog: cat }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.apps === 3, 'the operator publishes the catalogue', J(r));
r = await call(store, {});
ok(r.statusCode === 200 && JSON.parse(r.body).apps.length === 3, 'the catalogue reads back from R2', J(r));

console.log('shelf');
const zips = {};
for (const v of ['1.1.0-intel', '1.1.0-silicon']) {
  r = await call(store, { method: 'POST', query: { action: 'upload-token' }, body: { app: APP, version: v }, headers: { authorization: ADMIN } });
  ok(r.statusCode === 200 && r.body.url?.includes('X-Amz-Signature') && r.body.pathname.includes(v), `upload pass for ${v}`, J(r));
  zips[v] = Buffer.from(`PK-fake-zip-${v}-${crypto.randomBytes(8).toString('hex')}`);
  const up = await realFetch(r.body.url, { method: 'PUT', headers: { ...r.body.headers, 'content-length': String(zips[v].length) }, body: zips[v] });
  ok(up.ok, `the zip uploads straight to R2 with the pass (${up.status})`);
  r = await call(store, { method: 'POST', query: { action: 'shelve' }, body: { app: APP, version: v }, headers: { authorization: ADMIN } });
  ok(r.statusCode === 200 && r.body.ok && r.body.bytes === zips[v].length, `shelve ${v} records the real size`, J(r));
}
r = await call(store, { method: 'POST', query: { action: 'shelve' }, body: { app: APP, version: '9.9.9' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 409, 'shelving a zip that never arrived is refused', J(r));
r = await call(store, { method: 'POST', query: { action: 'upload-token' }, body: { app: 'Bad App!', version: '1' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 400, 'a bad app name gets no pass', J(r));
r = await call(store, { method: 'POST', query: { action: 'upload-token' }, body: { app: APP, version: '1' } });
ok(r.statusCode === 401, 'no pass without the admin token', J(r));
r = await call(store, { method: 'POST', query: { action: 'shelve' }, body: { app: APP, version: '1.1.0-intel' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.zips === 2, 'shelving the same version again replaces, never duplicates', J(r));

console.log('buying');
r = await call(store, { query: { action: 'account', s: 'cs_test_paidapp0000000' } });
ok(r.statusCode === 200 && r.body.kind === 'purchase' && r.body.owned.includes(APP), 'a paid checkout owns its app', J(r));
r = await call(store, { query: { action: 'account', s: 'cs_test_unpaidapp00000' } });
ok(r.statusCode === 200 && r.body.owned.length === 0, 'an unpaid checkout owns nothing', J(r));
r = await call(store, { query: { action: 'account', s: 'cs_test_nothere000000' } });
ok(r.statusCode === 404, 'an unknown session is a 404 with a plain message', J(r));
r = await call(store, { query: { action: 'account', s: 'garbage' } });
ok(r.statusCode === 400, 'a malformed session id is refused before Stripe is asked', J(r));
for (const arch of ['intel', 'silicon']) {
  r = await call(store, { query: { action: 'download', s: 'cs_test_paidapp0000000', app: APP, arch } });
  ok(r.statusCode === 302 && r.redirected?.includes(`1.1.0-${arch}.zip`), `download for ${arch} redirects to that Mac's zip`, `${r.statusCode} ${r.redirected} ${J(r)}`);
  const got = r.redirected ? await realFetch(r.redirected) : null;
  ok(got?.ok && Buffer.from(await got.arrayBuffer()).equals(zips[`1.1.0-${arch}`]), `the ${arch} bytes come back exactly`);
}
r = await call(store, { query: { action: 'download', s: 'cs_test_paidapp0000000', app: APP } });
ok(r.statusCode === 302 && /1\.1\.0-(intel|silicon)\.zip/.test(r.redirected || ''), 'no arch asked: the newest zip', r.redirected);
r = await call(store, { query: { action: 'download', s: 'cs_test_paidapp0000000', app: 'other-app' } });
ok(r.statusCode === 403, 'a paid checkout cannot download a different app', J(r));
r = await call(store, { query: { action: 'download', s: 'cs_test_unpaidapp00000', app: APP } });
ok(r.statusCode === 403, 'an unpaid checkout downloads nothing', J(r));
r = await call(store, { query: { action: 'download', s: 'cs_test_builder0000000', app: 'other-app' } });
ok(r.statusCode === 404 && /being prepared/.test(r.body?.error || ''), 'an owned app with nothing on its shelf says it is being prepared', J(r));

console.log('membership picks');
r = await call(store, { query: { action: 'account', s: 'cs_test_storeplan00000' } });
ok(r.statusCode === 200 && r.body.kind === 'plan' && r.body.picks_left === 2 && r.body.owned.length === 0, 'a Store member starts with two picks', J(r));
r = await call(store, { method: 'POST', query: { action: 'claim' }, body: { s: 'cs_test_storeplan00000', app: APP } });
ok(r.statusCode === 200 && r.body.picks_left === 1 && r.body.owned.includes(APP), 'the first pick is kept and counted', J(r));
r = await call(store, { method: 'POST', query: { action: 'claim' }, body: { s: 'cs_test_storeplan00000', app: APP } });
ok(r.statusCode === 200 && r.body.picks_left === 1, 'picking the same app again costs nothing', J(r));
r = await call(store, { method: 'POST', query: { action: 'claim' }, body: { s: 'cs_test_storeplan00000', app: 'big-tool' } });
ok(r.statusCode === 403, 'a builder-only tool is not a Store pick', J(r));
r = await call(store, { method: 'POST', query: { action: 'claim' }, body: { s: 'cs_test_storeplan00000', app: 'other-app' } });
ok(r.statusCode === 200 && r.body.picks_left === 0, 'the second pick uses the month up', J(r));
r = await call(store, { method: 'POST', query: { action: 'claim' }, body: { s: 'cs_test_storeplan00000', app: 'nope' } });
ok(r.statusCode === 404 || r.statusCode === 409, 'a third pick, or an unknown app, is refused', J(r));
r = await call(store, { query: { action: 'download', s: 'cs_test_storeplan00000', app: APP, arch: 'intel' } });
ok(r.statusCode === 302, 'a picked app downloads', J(r));
r = await call(store, { query: { action: 'account', s: 'cs_test_builder0000000' } });
ok(r.statusCode === 200 && r.body.plan === 'builder' && r.body.owned.length === 3, 'Builder owns every ready app', J(r));

console.log('leads and intakes');
r = await call(lead, { method: 'POST', body: { name: 'Test Person', email: 'lead@example.com', offer: 'workshop', message: 'hello' } });
ok(r.statusCode === 200 && r.body.ok, 'a lead from /start is saved', J(r));
r = await call(store, { method: 'POST', query: { action: 'reserve' }, body: { email: 'store-lead@example.com', name: 'S', app: APP, want: 'setup' } });
ok(r.statusCode === 200, 'a store reservation is saved', J(r));
r = await call(adminLeads, { method: 'GET', headers: { authorization: ADMIN } });
const emails = (r.body?.leads || []).map(l => l.email);
ok(r.statusCode === 200 && emails.includes('lead@example.com') && emails.includes('store-lead@example.com'), 'the admin reads both leads back, decrypted', `${r.statusCode} ${emails}`);
const { SECTIONS } = await import(join(OUT, '_lib/onboardQuestions.js'));
const answers = Object.fromEntries(SECTIONS.flatMap(s => s.questions).filter(q => q.required).map(q => [q.id, q.kind === 'one' ? q.choices[0] : q.kind === 'many' ? [q.choices[0]] : 'test answer']));
r = await call(onboard, { method: 'POST', body: { name: 'Intake Person', email: 'intake@example.com', offer: 'workshop', answers } });
ok(r.statusCode === 200, 'an onboarding intake is saved', `${r.statusCode} ${String(r.body).slice(0, 100)}`);
r = await call(adminIntakes, { method: 'POST', body: { kit_url: 'https://example.com/kit.zip' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.settings?.kit_url === 'https://example.com/kit.zip', 'the kit link setting saves', J(r));
r = await call(adminIntakes, { method: 'GET', headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.intakes?.some(i => i.email === 'intake@example.com') && r.body.settings?.kit_url, 'intakes and settings read back', J(r));

console.log('admin content and uploads');
r = await call(adminPublish, { method: 'POST', body: { content: { hero: 'Hello R2' } }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200, 'site content publishes to the file store', J(r));
const { readLiveContentJson } = await import(join(OUT, '_lib/contentSource.js')).catch(() => ({}));
const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
r = await call(adminUpload, { method: 'POST', body: { filename: 'test image.png', contentType: 'image/png', data: png.toString('base64') }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.url?.includes('/uploads/'), 'an admin image upload lands and returns its address', J(r));
const img = r.body?.url ? await realFetch(r.body.url) : null;
ok(img?.ok && img.headers.get('content-type') === 'image/png', 'the uploaded image serves with its type');

console.log('private pages');
r = await call(share, { query: { t: 'no-such-page-token-1' } });
ok(r.statusCode === 404, 'an unknown private page is a 404', String(r.body).slice(0, 60));
r = await call(share, { method: 'POST', body: { pathname: 'shares/testclient-abc123/index.html', contentType: 'text/html' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 200 && r.body.url && r.body.publicUrl, 'the admin gets an upload address for a page', J(r));
const html = '<!doctype html><title>Private</title><p>For one client only.';
const pu = r.body?.url ? await realFetch(r.body.url, { method: 'PUT', headers: { ...r.body.headers }, body: html }) : null;
ok(pu?.ok, `the page uploads with the pass (${pu?.status})`);
r = await call(share, { query: { t: 'testclient-abc123' } });
ok(r.statusCode === 200 && r.body === html && r.headers['x-robots-tag']?.includes('noindex'), 'the private page serves, out of search', `${r.statusCode}`);
r = await call(share, { method: 'POST', body: { pathname: '../etc/passwd', contentType: 'text/html' }, headers: { authorization: ADMIN } });
ok(r.statusCode === 400, 'a path outside shares/ gets no pass', J(r));
r = await call(share, { method: 'POST', body: { pathname: 'shares/testclient-abc123/index.html', contentType: 'text/html' } });
ok(r.statusCode === 401, 'no pass without the admin token', J(r));

console.log('without the file store');
const saved = process.env.R2_ACCOUNT_ID; delete process.env.R2_ACCOUNT_ID;
r = await call(store, {});
ok(r.statusCode === 200 && JSON.parse(r.body).apps.length === 0, 'catalogue is empty, not an error', J(r));
r = await call(lead, { method: 'POST', body: { name: 'X', email: 'x@example.com' } });
ok(r.statusCode === 500 && /email/.test(r.body?.error || ''), 'a lead gets a plain message with an email to use instead', J(r));
process.env.R2_ACCOUNT_ID = saved;

console.log(`\n${pass} passed, ${fail} failed   (Stripe asked ${stripeCalls} times, all faked)`);
process.exit(fail ? 1 : 0);
