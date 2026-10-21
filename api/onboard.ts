import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import { writeIntake } from './_lib/storage.js';
import { SECTIONS, type Question } from './_lib/onboardQuestions.js';

/* /onboard : the onboarding form. Jordan copies the link from the Clients tab
   of the Greenfire operator (or Pip sends it in a welcome) and the person
   fills it in on their phone. `?for=workshop|onboarding|build|team` picks the
   session up front.

   It replaces the Google Form: `intake_form_url` in startOffers.json points
   here, so /start/thanks, Pip and the Clients tab all send this page.

   Answers are sealed exactly like a /start sign-up (storage.ts) and read back
   only by /api/admin/intakes, behind the admin password. */

type Offer = { id: string; title: string; when?: string; unit?: string };

function offers(): Offer[] {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'src/data/startOffers.json'), 'utf8'));
    return (raw.offers || []).map((o: Offer) => ({ id: o.id, title: o.title, when: o.when, unit: o.unit }));
  } catch {
    return [];
  }
}

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const line = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const text = (v: unknown, n: number) => String(v ?? '').replace(/\r/g, '').trim().slice(0, n);
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/* One answer, cleaned against its own question. A choice that is not on the
   list is dropped, so the page cannot be used to store arbitrary text. */
function answerOf(q: Question, v: unknown): string {
  if (q.kind === 'one') return q.choices?.includes(String(v)) ? String(v) : '';
  if (q.kind === 'many') return (Array.isArray(v) ? v : []).map(String).filter((x) => q.choices?.includes(x)).join(', ');
  return q.kind === 'long' ? text(v, 3000) : line(v, 400);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(req.method === 'HEAD' ? '' : page(offers()));
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;
  if (line(b.website_hp, 200)) return res.status(200).json({ ok: true });

  const name = line(b.name, 120);
  const email = line(b.email, 160).toLowerCase();
  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
  const known = offers().map((o) => o.id);
  const offer = known.includes(String(b.offer)) ? String(b.offer) : 'unsure';

  const given = (b.answers || {}) as Record<string, unknown>;
  const answers = SECTIONS.flatMap((s) => s.questions).map((q) => ({ id: q.id, label: q.label, value: answerOf(q, given[q.id]) }));
  const missing = SECTIONS.flatMap((s) => s.questions).filter((q) => q.required && !answers.find((a) => a.id === q.id)?.value);
  if (missing.length) return res.status(400).json({ error: `Please answer: ${missing[0].label}` });

  try {
    await writeIntake({
      at: new Date().toISOString(),
      name,
      email,
      offer,
      phone: line(b.phone, 40),
      business: line(b.business, 160),
      site: line(b.site, 200),
      answers,
      source: 'onboard',
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Could not save that just now. Please try again in a minute, or email civilizationexplorer@gmail.com.' });
  }
}

/* --- the page ------------------------------------------------------------ */

function field(q: Question): string {
  const label = `<span class="q">${esc(q.label)}${q.required ? ' <i>*</i>' : ''}</span>${q.help ? `<small>${esc(q.help)}</small>` : ''}`;
  if (q.kind === 'one' || q.kind === 'many') {
    return `<div class="field" data-q="${q.id}" data-kind="${q.kind}"${q.required ? ' data-required' : ''}>${label}
      <div class="chips">${(q.choices || []).map((c) => `<button type="button" class="chip" aria-pressed="false">${esc(c)}</button>`).join('')}</div></div>`;
  }
  const input = q.kind === 'long'
    ? `<textarea id="q-${q.id}" rows="3"></textarea>`
    : `<input type="text" id="q-${q.id}" placeholder="${esc(q.placeholder || '')}">`;
  return `<div class="field" data-q="${q.id}" data-kind="text"${q.required ? ' data-required' : ''}><label for="q-${q.id}">${label}</label>${input}</div>`;
}

function page(list: Offer[]): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Get ready for your session | Greenfire</title>
<meta name="robots" content="noindex">
<meta property="og:title" content="Get ready for your AI session">
<meta property="og:description" content="A few questions so our time is spent on your work, not on setup.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<style>
:root{color-scheme:dark;--g:#10b981;--ink:#e7e5e4;--mute:#a8a29e;--card:#1c1917;--line:#292524}
*{box-sizing:border-box}
body{margin:0;background:#0c0a09;color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;padding:20px 16px 60px;
 background-image:radial-gradient(800px 480px at 20% -10%,rgba(16,185,129,.12),transparent 60%)}
main{max-width:600px;margin:0 auto}
.tag{color:var(--g);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
h1{font-size:28px;line-height:1.2;margin:6px 0 8px;color:#fff}
.lead{color:#d6d3d1;margin:0 0 6px}
.safe{color:var(--mute);font-size:14px;margin:0 0 20px}
section{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:18px 16px;margin:0 0 14px;min-width:0}
h2{font-size:17px;margin:0 0 2px;color:#fff}
section>p{color:var(--mute);font-size:14px;margin:0 0 6px}
.field{margin:16px 0 0}
.q{display:block;font-weight:600;font-size:15px}
.q i{color:var(--g);font-style:normal}
small{display:block;color:var(--mute);font-size:13px;margin:2px 0 0}
label{display:block}
input[type=text],input[type=email],input[type=tel],textarea{width:100%;margin-top:8px;font:16px Inter,sans-serif;color:var(--ink);
 background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:12px}
input:focus,textarea:focus{outline:2px solid var(--g);outline-offset:1px;border-color:transparent}
textarea{resize:vertical;min-height:80px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.chip{border:1px solid #44403c;background:#0c0a09;color:var(--ink);border-radius:999px;padding:9px 14px;font:15px Inter,sans-serif;cursor:pointer;text-align:left}
.chip[aria-pressed=true]{background:var(--g);border-color:var(--g);color:#052e1f;font-weight:600}
.offer .chip{border-radius:12px;width:100%}
.offer .chip small{color:inherit;opacity:.8}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
button.send{width:100%;margin-top:8px;padding:16px;border:0;border-radius:12px;background:var(--g);color:#052e1f;font:700 17px Inter,sans-serif;cursor:pointer}
button.send:disabled{opacity:.6}
.err{color:#fca5a5;font-weight:600;min-height:1.4em;margin:12px 0 0}
.field.missing .q{color:#fca5a5}
.done{text-align:center;padding:48px 8px}
.foot{margin-top:24px;font-size:12.5px;color:#78716c;text-align:center}
.foot a{color:var(--g)}
</style></head><body><main>
<div id="wrap">
<div class="tag">Greenfire AI</div>
<h1>Get ready for your session</h1>
<p class="lead">A few questions so our time is spent on your work, not on setup. About five minutes. Most answers are a tap.</p>
<p class="safe">Never put passwords, API keys or customer records in here. You will never need to send me one.</p>
<form id="f" novalidate>
<section>
  <h2>You</h2>
  <div class="field" data-kind="text" data-required><label for="name"><span class="q">Your name <i>*</i></span></label><input type="text" id="name" autocomplete="name"></div>
  <div class="field" data-kind="text" data-required><label for="email"><span class="q">Email <i>*</i></span></label><input type="email" id="email" autocomplete="email" inputmode="email"></div>
  <div class="field"><label for="phone"><span class="q">Phone</span><small>For a text if something changes on the day</small></label><input type="tel" id="phone" autocomplete="tel" inputmode="tel"></div>
  <div class="field"><label for="business"><span class="q">Your business or project</span><small>If you do not have one yet, the thing you want to start</small></label><input type="text" id="business"></div>
  <div class="field"><label for="site"><span class="q">Your website, if you have one</span></label><input type="text" id="site" inputmode="url" placeholder="yourname.com"></div>
</section>
<section>
  <h2>Which session is this for?</h2>
  <div class="field offer" data-q="offer" data-kind="one">
    <div class="chips">${list.map((o) => `<button type="button" class="chip" data-id="${esc(o.id)}" aria-pressed="false">${esc(o.title)}${o.when || o.unit ? `<small>${esc(o.when || o.unit)}</small>` : ''}</button>`).join('')}
    <button type="button" class="chip" data-id="unsure" aria-pressed="false">Not sure yet</button></div>
  </div>
</section>
${SECTIONS.map((s) => `<section><h2>${esc(s.title)}</h2>${s.help ? `<p>${esc(s.help)}</p>` : ''}${s.questions.map(field).join('')}</section>`).join('\n')}
<div class="hp" aria-hidden="true"><label>Website<input type="text" id="website_hp" tabindex="-1" autocomplete="off"></label></div>
<button class="send" type="submit" id="send">Send to Jordan</button>
<p class="err" id="err" role="alert"></p>
</form>
</div>
<div class="done" id="done" hidden>
  <div class="tag">All set</div>
  <h1>Thank you</h1>
  <p class="lead">I read every answer and shape our time around it. If anything is unclear I will write to you before we meet.</p>
</div>
<p class="foot">Greenfire &middot; <a href="/start">green-fire-site.vercel.app/start</a><br>Your answers go only to Jordan and are never shared.</p>
</main>
<script>
(function () {
  var want = (new URLSearchParams(location.search).get('for') || '').toLowerCase()
  var offerBtns = [].slice.call(document.querySelectorAll('.offer .chip'))
  offerBtns.forEach(function (b) { if (b.getAttribute('data-id') === want) b.setAttribute('aria-pressed', 'true') })
  document.getElementById('f').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return
    var f = b.closest('.field'), on = b.getAttribute('aria-pressed') === 'true'
    if (f.getAttribute('data-kind') === 'one') [].forEach.call(f.querySelectorAll('.chip'), function (x) { x.setAttribute('aria-pressed', 'false') })
    b.setAttribute('aria-pressed', on && f.getAttribute('data-kind') === 'many' ? 'false' : 'true')
    f.classList.remove('missing')
  })
  function picked(f) {
    return [].slice.call(f.querySelectorAll('.chip[aria-pressed=true]')).map(function (b) { return b.getAttribute('data-id') || b.childNodes[0].textContent.trim() })
  }
  var v = function (id) { return document.getElementById(id).value.trim() }
  var err = document.getElementById('err')
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault(); err.textContent = ''
    var answers = {}, first = null
    ;[].forEach.call(document.querySelectorAll('.field[data-q]'), function (f) {
      var id = f.getAttribute('data-q'), kind = f.getAttribute('data-kind')
      if (id === 'offer') return
      var val = kind === 'text' ? f.querySelector('input,textarea').value.trim() : kind === 'one' ? (picked(f)[0] || '') : picked(f)
      answers[id] = val
      var empty = Array.isArray(val) ? !val.length : !val
      if (f.hasAttribute('data-required') && empty) { f.classList.add('missing'); first = first || f }
    })
    ;['name', 'email'].forEach(function (id) {
      var f = document.getElementById(id).closest('.field')
      if (!v(id)) { f.classList.add('missing'); first = first || f } else f.classList.remove('missing')
    })
    if (first) { err.textContent = 'A few answers marked * are still empty.'; first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    var offer = picked(document.querySelector('.offer'))[0] || 'unsure'
    var send = document.getElementById('send'); send.disabled = true; send.textContent = 'Sending...'
    fetch('/api/onboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      name: v('name'), email: v('email'), phone: v('phone'), business: v('business'), site: v('site'),
      offer: offer, answers: answers, website_hp: v('website_hp')
    }) }).then(function (r) { return r.json().catch(function () { return {} }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'That did not go through. Please try again.') }) })
      .then(function () { document.getElementById('wrap').hidden = true; document.getElementById('done').hidden = false; window.scrollTo(0, 0) })
      .catch(function (x) { err.textContent = x.message; send.disabled = false; send.textContent = 'Send to Jordan' })
  })
})()
</script></body></html>`;
}
