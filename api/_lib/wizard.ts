/* THE WIZARD: the one look and the one behaviour of every Greenfire form that
   walks a person through steps (/onboard, /readiness). A form hands this file
   its steps and what to say at the end; it never draws its own chrome. Branching
   lives here too: a field with data-showif shows only for the answers it names.
   No em dashes: Jordan reads them as machine written. */

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export type WizardCfg = {
  key: string;        // localStorage key, so two forms never share a half-filled draft
  title: string; ogTitle: string; ogDesc: string;
  steps: string;      // the <section class="step"> blocks
  n: number;          // how many steps
  partialAt: number;  // finishing this step (0 based) sends an early save; -1 for none
  form: string;       // sent with every post so the handler knows which form this is
  submit: string;     // the last button
  doneIntro: string; doneList: string;
};

export const wizardCss = `
:root{color-scheme:dark;--bg:#060807;--ink:#ecf1ee;--soft:#c3cdc8;--mute:#8d9a93;--line:rgba(255,255,255,.09);--line2:rgba(255,255,255,.16);
 --g:#34d399;--g2:#10b981;--lime:#a3e635;--glass:rgba(255,255,255,.035);--bad:#fda4a4;--r:16px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;min-height:100dvh;background:var(--bg);color:var(--ink);font:16px/1.55 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
 -webkit-font-smoothing:antialiased;padding:0 16px calc(120px + env(safe-area-inset-bottom))}
.aura{position:fixed;inset:0;z-index:-1;pointer-events:none;
 background:radial-gradient(700px 420px at 12% -8%,rgba(16,185,129,.20),transparent 62%),radial-gradient(620px 380px at 105% 8%,rgba(163,230,53,.09),transparent 60%),radial-gradient(900px 500px at 50% 120%,rgba(16,185,129,.10),transparent 60%)}
.shell{max-width:640px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(18px + env(safe-area-inset-top)) 0 14px}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:#fff}
.brand img{width:42px;height:42px;display:block;filter:drop-shadow(0 0 14px rgba(52,211,153,.45))}
.brand b{font-size:17px;font-weight:700;letter-spacing:-.01em;line-height:1.1}
.brand span{display:block;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--g)}
.lock{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mute);border:1px solid var(--line);border-radius:999px;padding:6px 11px;white-space:nowrap}
.lock svg{color:var(--g)}
.prog{display:flex;gap:6px;margin:6px 0 10px}
.prog i{flex:1;height:5px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;position:relative}
.prog i::after{content:"";position:absolute;inset:0;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,var(--g2),var(--lime));transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.prog i.on::after{transform:scaleX(1)}
.stepno{margin:0 0 18px;font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
.stepno b{color:var(--g);font-weight:700}
.card{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border-radius:24px;padding:26px 22px 22px;
 box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -30px rgba(0,0,0,.7);backdrop-filter:blur(6px)}
.card{position:relative}
.card::before{content:"";position:absolute;left:28px;right:28px;top:-1px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--g),var(--lime),transparent);opacity:.75}
.step{animation:rise .42s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
h1{font-size:clamp(26px,6.6vw,34px);line-height:1.12;letter-spacing:-.025em;margin:0 0 8px;color:#fff;font-weight:800;outline:none}
.intro{color:var(--soft);margin:0 0 6px;font-size:16px}
.safe{display:flex;gap:8px;align-items:flex-start;color:var(--mute);font-size:13.5px;margin:22px 0 0;padding-top:16px;border-top:1px solid var(--line)}
.safe svg{flex:none;margin-top:3px;color:var(--g)}
.field{margin:22px 0 0}
.lbl,label{display:block}
.q{display:block;font-weight:600;font-size:15.5px;color:#fff;letter-spacing:-.005em}
.q i{color:var(--g);font-style:normal}
small{display:block;color:var(--mute);font-size:13.5px;margin:3px 0 0;font-weight:400}
input[type=text],input[type=email],input[type=tel],textarea{width:100%;margin-top:10px;font:16px Inter,system-ui,sans-serif;color:var(--ink);
 background:rgba(0,0,0,.32);border:1px solid var(--line2);border-radius:14px;padding:15px 15px;min-height:54px;transition:border-color .15s,box-shadow .15s,background .15s}
textarea{resize:vertical;min-height:96px;line-height:1.5}
input::placeholder,textarea::placeholder{color:#5f6b65}
input:focus,textarea:focus{outline:none;border-color:var(--g);box-shadow:0 0 0 4px rgba(52,211,153,.16);background:rgba(0,0,0,.45)}
.chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}
.chip{display:inline-flex;align-items:center;gap:10px;min-height:50px;border:1px solid var(--line2);background:rgba(0,0,0,.28);color:var(--ink);border-radius:14px;padding:11px 15px 11px 12px;
 font:500 15.5px/1.3 Inter,system-ui,sans-serif;cursor:pointer;text-align:left;transition:transform .12s,border-color .15s,background .15s,box-shadow .15s}
.chip:hover{border-color:rgba(52,211,153,.5)}
.chip:active{transform:scale(.985)}
.chip:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(52,211,153,.22);border-color:var(--g)}
.chip .t{flex:1}
.chips.row .chip{flex:1 1 0;min-width:0;justify-content:flex-start}
@media (max-width:560px){.chips:not(.row) .chip{width:100%}}
.chip small{color:var(--mute);margin-top:2px;font-size:13px}
.mark{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid #4b5750;display:grid;place-items:center;transition:all .15s}
[data-kind=many] .mark{border-radius:7px}
.mark::after{content:"";width:10px;height:6px;border-left:2.5px solid #04130c;border-bottom:2.5px solid #04130c;transform:rotate(-45deg) translate(1px,-1px) scale(0);transition:transform .15s}
.chip[aria-pressed=true]{background:linear-gradient(135deg,rgba(52,211,153,.2),rgba(163,230,53,.10));border-color:var(--g);box-shadow:0 0 0 1px rgba(52,211,153,.35),0 8px 24px -10px rgba(16,185,129,.55)}
.chip[aria-pressed=true] .mark{background:linear-gradient(135deg,var(--g),var(--lime));border-color:transparent}
.chip[aria-pressed=true] .mark::after{transform:rotate(-45deg) translate(1px,-1px) scale(1)}
.chip[aria-pressed=true] small{color:var(--soft)}
.offer .chip{width:100%;border-radius:16px;padding:14px 15px 14px 13px}
.offer .chip .t{font-weight:600}
.msg{color:var(--bad);font-size:13.5px;font-weight:600;margin:8px 0 0;min-height:0}
.msg:empty{display:none}
.field.missing input,.field.missing textarea{border-color:#f87171;box-shadow:0 0 0 4px rgba(248,113,113,.14)}
.field.missing .chip{border-color:rgba(248,113,113,.55)}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:5;padding:26px 16px calc(14px + env(safe-area-inset-bottom));
 background:linear-gradient(to top,var(--bg) 58%,rgba(6,8,7,0))}
.bar div{max-width:640px;margin:0 auto;display:flex;gap:10px}
.btn{font:700 16.5px Inter,system-ui,sans-serif;min-height:56px;border-radius:16px;border:1px solid var(--line2);cursor:pointer;color:var(--ink);background:rgba(255,255,255,.06);padding:0 22px;transition:transform .12s,filter .15s,opacity .15s}
.btn:active{transform:scale(.98)}
.btn.go{flex:1;border:0;color:#04130c;background:linear-gradient(135deg,#34d399 0%,#10b981 52%,#84cc16 100%);box-shadow:0 10px 30px -8px rgba(16,185,129,.55),0 1px 0 rgba(255,255,255,.35) inset}
.btn.go:hover{filter:brightness(1.07)}
.btn:disabled{opacity:.6;cursor:default}
.btn:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(52,211,153,.3)}
.btn.back[hidden]{display:none}
.done{text-align:center;padding:30px 4px 8px;animation:rise .5s cubic-bezier(.2,.8,.2,1) both}
.ring{width:92px;height:92px;margin:0 auto 20px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(52,211,153,.28),rgba(52,211,153,.04) 70%);box-shadow:0 0 60px rgba(52,211,153,.35)}
.ring svg{width:46px;height:46px;stroke:var(--g);stroke-width:3.2;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:50;stroke-dashoffset:50;animation:draw .7s .25s ease-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.next{list-style:none;margin:26px 0 0;padding:0;text-align:left;display:grid;gap:10px}
.next li{display:flex;gap:13px;align-items:flex-start;border:1px solid var(--line);background:rgba(0,0,0,.22);border-radius:16px;padding:14px 15px}
.next b{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13.5px;color:#04130c;background:linear-gradient(135deg,var(--g),var(--lime))}
.next span{color:var(--soft);font-size:15px}
.next span strong{color:#fff;font-weight:600}
.foot{margin:26px 0 0;font-size:12.5px;color:#6b776f;text-align:center}
.foot a{color:var(--g);text-decoration:none}
noscript p{color:var(--bad);text-align:center;margin:30px 0}
@media (min-width:700px){body{padding-top:14px}.card{padding:34px 34px 30px}.chip:hover{transform:translateY(-1px)}}
@media (max-width:380px){.lock{display:none}.card{padding:22px 16px 18px;border-radius:20px}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition:none!important}}

.field[hidden]{display:none}
.group{margin:30px 0 0;padding-top:20px;border-top:1px solid var(--line);font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g)}
.group:first-of-type{margin-top:24px;padding-top:0;border-top:0}
.prepbox{margin:26px 0 0;text-align:left}
.prepbox h2{font-size:17px;margin:0 0 10px;color:#fff;letter-spacing:-.01em}
.prep{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.prep li{position:relative;padding:12px 14px 12px 40px;border:1px solid var(--line);background:rgba(0,0,0,.22);border-radius:14px;color:var(--soft);font-size:15px}
.prep li::before{content:"";position:absolute;left:14px;top:15px;width:14px;height:14px;border-radius:5px;border:2px solid var(--g)}
`;

export function wizardPage(cfg: WizardCfg): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#060807">
<title>${esc(cfg.title)} | Greenfire</title>
<meta name="robots" content="noindex">
<meta property="og:title" content="${esc(cfg.ogTitle)}">
<meta property="og:description" content="${esc(cfg.ogDesc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://greenfire.earth/og-default.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>${wizardCss}</style></head><body>
<div class="aura"></div>
<main class="shell">
<header class="top">
  <a class="brand" href="https://greenfire.earth" aria-label="Greenfire"><img src="/brand/greenfire-logo-128.png" width="42" height="42" alt=""><div><b>Greenfire</b><span>AI</span></div></a>
  <div class="lock"><svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z"/></svg>Private</div>
</header>
<div id="wrap">
<div class="prog" id="prog" role="progressbar" aria-valuemin="1" aria-valuemax="${cfg.n}" aria-valuenow="1" aria-label="Progress">${Array.from({ length: cfg.n }, () => '<i></i>').join('')}</div>
<p class="stepno" id="stepno" aria-live="polite"></p>
<form id="f" class="card" novalidate autocomplete="on">
${cfg.steps}
<div class="hp" aria-hidden="true"><label>Website<input type="text" id="website_hp" tabindex="-1" autocomplete="off"></label></div>
<p class="msg" id="err" role="alert"></p>
</form>
</div>
<div class="card done" id="done" hidden>
  <div class="ring"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
  <h1 id="doneh" tabindex="-1">Thank you</h1>
  <p class="intro" id="donep">${cfg.doneIntro}</p>
  <div class="prepbox" id="prepbox" hidden><h2>Before we start, gather these</h2><ul class="prep" id="prep"></ul></div>
  <ol class="next">${cfg.doneList}</ol>
</div>
<noscript><p>This form needs JavaScript. Please email civilizationexplorer@gmail.com instead.</p></noscript>
<p class="foot">Greenfire &middot; <a href="https://greenfire.earth">greenfire.earth</a></p>
</main>
<nav class="bar" id="bar" aria-label="Form navigation"><div><button type="button" class="btn back" id="back" hidden>Back</button><button type="button" class="btn go" id="next">Continue</button></div></nav>
<script>
(function () {
  var N = ${cfg.n}, KEY = ${JSON.stringify(cfg.key)}, PARTIAL_AT = ${cfg.partialAt}, FORM = ${JSON.stringify(cfg.form)}, SUBMIT = ${JSON.stringify(cfg.submit)}
  var steps = [].slice.call(document.querySelectorAll('.step'))
  var segs = [].slice.call(document.querySelectorAll('#prog i'))
  var cur = 0, partialSent = false, busy = false
  var $ = function (id) { return document.getElementById(id) }
  var val = function (id) { var e = $(id); return e ? e.value.trim() : '' }
  var EMAIL = /^[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]{2,}$/

  /* A field can carry data-showif='{"q":"id","in":[..]}' (or "notin"): it shows only for those answers. */
  function rule(f) { try { return JSON.parse(f.getAttribute('data-showif') || 'null') } catch (e) { return null } }
  function applyShow() {
    ;[].forEach.call(document.querySelectorAll('[data-showif]'), function (f) {
      var r = rule(f), c = r && fieldOf(r.q), p = c && !c.hidden ? picked(c) : [], show = false
      if (r && p.length) show = p.some(function (x) { return r.in ? r.in.indexOf(x) > -1 : r.notin.indexOf(x) < 0 })
      f.hidden = !show
    })
  }
  function picked(f) { return [].slice.call(f.querySelectorAll('.chip[aria-pressed=true]')).map(function (b) { return b.getAttribute('data-v') }) }
  function fieldOf(id) { return document.querySelector('.field[data-q="' + id + '"]') }
  function chosen(id) { var f = fieldOf(id); return f ? picked(f)[0] || '' : '' }

  /* ---- keep what they typed, in case the tab closes or the page reloads */
  function snap() {
    var s = { step: cur, partialSent: partialSent, text: {}, chips: {} }
    ;['name', 'email', 'phone', 'business', 'site'].forEach(function (id) { s.text[id] = val(id) })
    ;[].forEach.call(document.querySelectorAll('.field[data-q]'), function (f) {
      var id = f.getAttribute('data-q')
      if (f.getAttribute('data-kind') === 'text') s.text['q-' + id] = f.querySelector('input,textarea').value
      else s.chips[id] = picked(f)
    })
    return s
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(snap())) } catch (e) {} }
  function restore() {
    var s = null
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null') } catch (e) {}
    if (!s) return 0
    Object.keys(s.text || {}).forEach(function (id) { var e = $(id); if (e && s.text[id]) e.value = s.text[id] })
    Object.keys(s.chips || {}).forEach(function (id) {
      var f = fieldOf(id); if (!f) return
      ;[].forEach.call(f.querySelectorAll('.chip'), function (b) { b.setAttribute('aria-pressed', (s.chips[id] || []).indexOf(b.getAttribute('data-v')) > -1 ? 'true' : 'false') })
    })
    partialSent = !!s.partialSent
    applyShow()
    return Math.min(Math.max(s.step || 0, 0), N - 1)
  }

  /* ---- a link can carry the person's details: /onboard?for=learn&name=Maya&email=maya@x.com */
  var q = new URLSearchParams(location.search)
  var want = (q.get('for') || '').toLowerCase()
  var start = restore()
  if (q.get('name') && !val('name')) $('name').value = q.get('name').slice(0, 120)
  if (q.get('email') && !val('email')) $('email').value = q.get('email').slice(0, 160)
  if (want && !chosen('offer')) [].forEach.call(document.querySelectorAll('.offer .chip'), function (b) { if (b.getAttribute('data-v') === want) b.setAttribute('aria-pressed', 'true') })

  function show(i, focus) {
    cur = i
    steps.forEach(function (s, k) { s.hidden = k !== i })
    segs.forEach(function (s, k) { s.className = k <= i ? 'on' : '' })
    $('prog').setAttribute('aria-valuenow', String(i + 1))
    $('stepno').innerHTML = 'Step <b>' + (i + 1) + '</b> of ' + N + ' &middot; ' + steps[i].getAttribute('data-title')
    $('back').hidden = i === 0
    $('next').textContent = i === N - 1 ? SUBMIT : 'Continue'
    $('err').textContent = ''
    if (i === 0) { var n = val('name').split(' ')[0]; $('h-0').textContent = n ? 'Hi ' + n + ', let\\u2019s get started' : 'Let\\u2019s get you started' }
    window.scrollTo(0, 0)
    if (focus) { var h = $('h-' + i); if (h) h.focus({ preventScroll: true }) }
    save()
  }

  function msg(f, t) { var m = f.querySelector('.msg'); if (m) m.textContent = t || '' ; f.classList[t ? 'add' : 'remove']('missing') }
  function check(i) {
    var first = null, bad = function (f, t) { msg(f, t); first = first || f }
    ;[].forEach.call(steps[i].querySelectorAll('.field'), function (f) {
      msg(f, '')
      if (f.hidden || !f.hasAttribute('data-required')) return
      var kind = f.getAttribute('data-kind'), empty
      if (kind === 'text') empty = !f.querySelector('input,textarea').value.trim()
      else empty = !picked(f).length
      if (empty) bad(f, kind === 'text' ? 'This one is needed.' : 'Please tap an answer.')
    })
    if (i === 0) {
      var ef = $('email').closest('.field')
      if (val('email') && !EMAIL.test(val('email'))) bad(ef, 'That email does not look right. Please check it.')
      var r = chosen('reach')
      if ((r === 'Text' || r === 'A call') && !val('phone')) bad($('phone').closest('.field'), 'Add a phone number so I can ' + (r === 'Text' ? 'text' : 'call') + ' you.')
    }
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); var inp = first.querySelector('input,textarea'); if (inp) setTimeout(function () { inp.focus({ preventScroll: true }) }, 350) }
    return !first
  }

  function answers() {
    var a = {}
    ;[].forEach.call(document.querySelectorAll('.field[data-q]'), function (f) {
      var id = f.getAttribute('data-q'), kind = f.getAttribute('data-kind')
      if (id === 'offer' || f.hidden) return
      a[id] = kind === 'text' ? f.querySelector('input,textarea').value.trim() : kind === 'one' ? (picked(f)[0] || '') : picked(f)
    })
    try { a.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch (e) { a.tz = '' }
    return a
  }
  function body(extra) {
    var o = { name: val('name'), email: val('email'), phone: val('phone'), business: val('business'), site: val('site'),
      offer: chosen('offer') || 'unsure', answers: answers(), website_hp: val('website_hp'), form: FORM }
    for (var k in extra) o[k] = extra[k]
    return JSON.stringify(o)
  }
  function post(b, keep) {
    return fetch('/api/onboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: b, keepalive: !!keep })
  }

  $('next').addEventListener('click', function () {
    if (busy || !check(cur)) return
    if (cur === N - 1) return send()
    if (cur === PARTIAL_AT && !partialSent) { partialSent = true; post(body({ partial: true }), true).catch(function () { partialSent = false }) }
    show(cur + 1, true)
  })
  $('back').addEventListener('click', function () { if (cur > 0) show(cur - 1, true) })
  $('f').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); $('next').click() }
  })
  $('f').addEventListener('submit', function (e) { e.preventDefault() })
  $('f').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.chip') : null; if (!b) return
    var f = b.closest('.field'), on = b.getAttribute('aria-pressed') === 'true'
    if (f.getAttribute('data-kind') === 'one') [].forEach.call(f.querySelectorAll('.chip'), function (x) { x.setAttribute('aria-pressed', 'false') })
    b.setAttribute('aria-pressed', on && f.getAttribute('data-kind') === 'many' ? 'false' : 'true')
    if (f.hasAttribute('data-q')) msg(f, '')
    applyShow(); save()
  })
  $('f').addEventListener('input', function (e) { var f = e.target.closest ? e.target.closest('.field') : null; if (f && f.classList.contains('missing')) msg(f, ''); save() })

  function send() {
    busy = true; var n = $('next'); n.disabled = true; n.textContent = 'Sending...'
    post(body({}), false)
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'That did not go through. Please try again.'); return j }) })
      .then(function (j) {
        try { localStorage.removeItem(KEY) } catch (e) {}
        var first = val('name').split(' ')[0], r = chosen('reach')
        $('doneh').textContent = first ? 'Thank you, ' + first : 'Thank you'
        $('donep').textContent = 'Your answers are in.'
        if ($('reachline')) $('reachline').textContent = r === 'Text' ? 'I will text you' : r === 'A call' ? 'I will call you' : 'I will email you'
        if (j && j.prep && j.prep.length) { $('prep').innerHTML = ''; j.prep.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; $('prep').appendChild(li) }); $('prepbox').hidden = false }
        if (j && j.headline) $('donep').textContent = j.headline
        $('wrap').hidden = true; $('bar').hidden = true; $('done').hidden = false
        window.scrollTo(0, 0); $('doneh').focus({ preventScroll: true })
      })
      .catch(function (x) { $('err').textContent = x.message; n.disabled = false; n.textContent = SUBMIT; busy = false })
  }

  applyShow()
  show(start, false)
  document.documentElement.setAttribute('data-ready', '1')
})()
</script></body></html>`;
}
