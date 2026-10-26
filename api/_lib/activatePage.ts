import { ACTIVATION, type Question } from './onboardQuestions.js';
import type { OnboardSettings } from './storage.js';

/* /activate : the AI Activation prep page. Jordan copies the link from the
   Clients tab (with the session time in it) and texts it. Part one is a few
   questions, part two is the seven things to have done before the session,
   with the master prompt that writes their project brief. One send at the
   bottom lands it on the Clients tab like any /onboard form.

   Every box has a microphone (the browser's own speech recognition, so no
   audio leaves their browser for us). Browsers without it simply show no mic.

   Served by api/onboard.ts (vercel.json rewrites /activate there), because
   Vercel Hobby allows 12 functions. No em dashes: Jordan reads them as
   machine written. */

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const mic = '<button type="button" class="mic" aria-label="Speak your answer" title="Tap and speak"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 1 0-7 0v6A3.5 3.5 0 0 0 12 15Zm6-3.5a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V20H8.5a1 1 0 1 0 0 2h7a1 1 0 1 0 0-2H13v-2.59a6 6 0 0 0 5-5.91Z"/></svg></button>';

function box(id: string, type: string, extra = '', long = false): string {
  const el = long
    ? `<textarea id="${id}" rows="3"${extra}></textarea>`
    : `<input type="${type}" id="${id}"${extra}>`;
  return `<div class="say${long ? ' long' : ''}">${el}${mic}</div>`;
}

function field(q: Question): string {
  const label = `<span class="q">${esc(q.label)}${q.required ? ' <i>*</i>' : ''}</span>${q.help ? `<small>${esc(q.help)}</small>` : ''}`;
  if (q.kind === 'one' || q.kind === 'many') {
    return `<div class="field" id="f-${q.id}" data-q="${q.id}" data-kind="${q.kind}"${q.required ? ' data-required' : ''}>${label}
      <div class="chips">${(q.choices || []).map((c) => `<button type="button" class="chip" aria-pressed="false">${esc(c)}</button>`).join('')}</div></div>`;
  }
  return `<div class="field" data-q="${q.id}" data-kind="text"${q.required ? ' data-required' : ''}><label for="q-${q.id}">${label}</label>${box(`q-${q.id}`, 'text', q.placeholder ? ` placeholder="${esc(q.placeholder)}"` : '', q.kind === 'long')}</div>`;
}

function step(n: number, name: string, title: string, mins: string, body: string): string {
  return `<section class="step" id="step-${n}"><div class="sh"><span class="num">${n}</span><div><h2>${title}</h2><small>${mins}</small></div></div>
  ${body}
  <button type="button" class="tick" data-step="${esc(name)}" aria-pressed="false">Mark done</button></section>`;
}

/* The master prompt. {{P}} becomes their project name in the browser. */
const PROMPT = `I am about to have an AI dashboard and a team of AI agents built for my project, {{P}}. The builder is Claude Code, which will work from a folder on my computer named "{{P}}". The document you write now is the first thing it will read, so it needs to hold everything about this project.

Please be my research partner and write the most complete project brief you can.

1. First use everything you already know about me and {{P}}: our past conversations, your memory of me, any files or projects I have shared with you, and anything public you can find (my website, social pages, listings, articles).
2. If something important is missing, ask me up to ten short questions in one list and wait for my answers. Then write the document.

Write it with these sections, in plain words, as detailed as you possibly can:

1. Summary: what {{P}} is in one paragraph
2. Mission, vision and values: why it exists and what it stands for
3. What it offers: every product, service, event or program, with prices if known
4. Who it is for: customers, audience and community, and what they need
5. How it runs today: a normal week, who does what, and the tools and apps used (names only)
6. Money: how it earns now, what it costs to run, any numbers I have shared
7. Goals: the next 90 days, one year, and three to five years
8. Plans and strategy: business plans, marketing, partnerships, launches coming up
9. People: team, partners, collaborators and key contacts, by role
10. Brand: voice and tone, colours, fonts, logo, look and feel, words to use and avoid
11. What already exists: documents, spreadsheets, photos, videos, websites, accounts and links
12. Bottlenecks: the repeat tasks that eat time, and what keeps getting dropped
13. Jobs for the AI dashboard and agents: everything it could take off my plate, ranked by impact
14. Rules: what the AI must never do, and what always needs my approval before it happens
15. Open questions: anything unclear, undecided or that you guessed
16. Names and terms: a short glossary of the people, places and words specific to {{P}}

Mark anything you are not sure of with (guess) so I can check it. Never include passwords, API keys, bank details or private customer records.

When it is done, give it to me as one document I can download, a Word document or PDF if you can make files, otherwise one block of text I can copy. Title it: {{P}} Project Brief`;

export function activatePage(settings: OnboardSettings): string {
  const kit = settings.kit_url && /^https:\/\//.test(settings.kit_url) ? settings.kit_url : '';
  const shown = ACTIVATION.filter((q) => !q.hidden);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Get ready for your AI Activation | Greenfire</title>
<meta name="robots" content="noindex">
<meta property="og:title" content="Get ready for your AI Activation">
<meta property="og:description" content="A few quick questions and seven setup steps, so our session goes straight to building.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<style>
:root{color-scheme:dark;--g:#10b981;--ink:#e7e5e4;--mute:#a8a29e;--card:#1c1917;--line:#292524}
*{box-sizing:border-box}
body{margin:0;background:#0c0a09;color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;padding:20px 16px 60px;
 background-image:radial-gradient(800px 480px at 20% -10%,rgba(16,185,129,.12),transparent 60%)}
main{max-width:640px;margin:0 auto}
a{color:var(--g)}
.tag{color:var(--g);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
h1{font-size:28px;line-height:1.2;margin:6px 0 8px;color:#fff}
.lead{color:#d6d3d1;margin:0 0 8px}
.safe{color:var(--mute);font-size:14px;margin:0 0 18px}
.when{border:1px solid rgba(16,185,129,.45);background:rgba(16,185,129,.08);border-radius:14px;padding:14px 16px;margin:0 0 16px}
.when b{color:#fff;font-size:17px}
.when small{display:block;color:var(--mute);font-size:13px;margin-top:2px}
section{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:18px 16px;margin:0 0 14px;min-width:0}
h2{font-size:17px;margin:0 0 2px;color:#fff}
.part{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g);margin:28px 0 10px}
.field{margin:16px 0 0}
.field:first-of-type{margin-top:6px}
.q{display:block;font-weight:600;font-size:15px}
.q i{color:var(--g);font-style:normal}
small{display:block;color:var(--mute);font-size:13px;margin:2px 0 0}
label{display:block}
.say{position:relative;margin-top:8px}
input[type=text],input[type=email],input[type=tel],textarea{width:100%;font:16px Inter,sans-serif;color:var(--ink);
 background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:12px}
.can-speak .say input,.can-speak .say textarea{padding-right:52px}
input:focus,textarea:focus{outline:2px solid var(--g);outline-offset:1px;border-color:transparent}
textarea{resize:vertical;min-height:84px;display:block}
.mic{display:none;position:absolute;right:6px;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:999px;border:1px solid #44403c;
 background:#1c1917;color:var(--g);cursor:pointer;align-items:center;justify-content:center;padding:0}
.say.long .mic{top:8px;transform:none}
.can-speak .mic{display:flex}
.mic.on{background:#dc2626;border-color:#dc2626;color:#fff;animation:pulse 1.2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(220,38,38,.6)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}
.miclead{display:none}.can-speak .miclead{display:inline}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.chip{border:1px solid #44403c;background:#0c0a09;color:var(--ink);border-radius:999px;padding:9px 14px;font:15px Inter,sans-serif;cursor:pointer}
.chip[aria-pressed=true]{background:var(--g);border-color:var(--g);color:#052e1f;font-weight:600}
.field.missing .q,.field.missing label .q{color:#fca5a5}
.step .sh{display:flex;gap:12px;align-items:flex-start;margin-bottom:8px}
.num{flex:none;width:32px;height:32px;border-radius:999px;background:rgba(16,185,129,.15);color:var(--g);font-weight:700;display:flex;align-items:center;justify-content:center}
.step.is-done{border-color:rgba(16,185,129,.55)}
.step.is-done .num{background:var(--g);color:#052e1f}
.step ol,.step ul{margin:8px 0 0;padding-left:22px}
.step li{margin:6px 0}
.go{display:inline-block;margin:10px 0 2px;padding:11px 16px;border-radius:10px;background:var(--g);color:#052e1f;font-weight:700;text-decoration:none}
.go.ghost{background:transparent;color:var(--g);border:1px solid var(--g)}
code,.cmd{font:14px ui-monospace,Menlo,Consolas,monospace}
.cmd{display:flex;gap:8px;align-items:stretch;margin:8px 0}
.cmd code{flex:1;min-width:0;overflow-x:auto;white-space:nowrap;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:11px 12px;color:#fff}
.copy{flex:none;border:1px solid var(--g);background:transparent;color:var(--g);border-radius:10px;padding:0 14px;font:600 14px Inter,sans-serif;cursor:pointer}
.copy.big{width:100%;padding:13px;margin-top:8px;background:var(--g);color:#052e1f;font-size:16px}
.prompt{width:100%;height:220px;font:13.5px/1.5 ui-monospace,Menlo,monospace;color:#e7e5e4;background:#0c0a09;border:1px solid #44403c;border-radius:10px;padding:12px;margin-top:8px}
.note{background:#0c0a09;border-left:3px solid var(--g);padding:10px 12px;border-radius:0 10px 10px 0;margin:10px 0 0;font-size:14.5px;color:#d6d3d1}
.warn{border-left-color:#f59e0b}
.tick{margin-top:14px;border:1px solid #44403c;background:#0c0a09;color:var(--ink);border-radius:10px;padding:10px 14px;font:600 15px Inter,sans-serif;cursor:pointer}
.tick[aria-pressed=true]{background:var(--g);border-color:var(--g);color:#052e1f}
.tick[aria-pressed=true]::before{content:"\\2713  "}
.pname{color:#fff;font-weight:700}
[data-os]{display:none}
body.os-mac [data-os=mac],body.os-win [data-os=win]{display:block}
body.os-mac li[data-os=mac],body.os-win li[data-os=win]{display:list-item}
.step .tick{display:block}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
button.send{width:100%;margin-top:8px;padding:16px;border:0;border-radius:12px;background:var(--g);color:#052e1f;font:700 17px Inter,sans-serif;cursor:pointer}
button.send:disabled{opacity:.6}
.err{color:#fca5a5;font-weight:600;min-height:1.4em;margin:12px 0 0}
.sent{border:1px solid var(--g);background:rgba(16,185,129,.1);border-radius:14px;padding:14px 16px;margin:12px 0 0}
.foot{margin-top:24px;font-size:12.5px;color:#78716c;text-align:center}
</style></head><body class="os-mac"><main>
<div class="tag">Greenfire AI Activation</div>
<h1>Get ready for your AI Activation</h1>
<p class="lead">Two parts: a few quick questions about you and your project (about three minutes), then seven setup steps to finish before we meet, so our session goes straight to building your dashboard and agents. <span class="miclead">Tap the microphone in any box to speak your answer instead of typing.</span></p>
<p class="safe">Never put passwords, API keys or customer records in here. You will never need to send me one. Your answers save on this device as you go, so you can come back later.</p>
<div class="when" id="when" hidden></div>

<form id="f" novalidate>
<div class="part">Part 1 &middot; You and your project</div>
<section>
  <div class="field" data-kind="text" data-required><label for="name"><span class="q">Your name <i>*</i></span></label>${box('name', 'text', ' autocomplete="name"')}</div>
  <div class="field" data-kind="text" data-required><label for="email"><span class="q">Email <i>*</i></span></label>${box('email', 'email', ' autocomplete="email" inputmode="email" data-email')}</div>
  <div class="field"><label for="phone"><span class="q">Phone</span><small>For a text if anything changes on the day</small></label>${box('phone', 'tel', ' autocomplete="tel" inputmode="tel"')}</div>
  <div class="field" data-kind="text" data-required><label for="business"><span class="q">The business or project we are setting up <i>*</i></span><small>Its name. This also becomes the name of your project folder in step 5.</small></label>${box('business', 'text', ' autocomplete="organization"')}</div>
  <div class="field"><label for="site"><span class="q">Website or social links</span><small>Anything public about it</small></label>${box('site', 'text', ' inputmode="url" placeholder="yourproject.com, instagram.com/yourproject"')}</div>
  ${shown.map(field).join('\n  ')}
</section>

<div class="part">Part 2 &middot; Seven steps before we start</div>
<p class="safe" style="margin-top:-4px">Do them in order. Each one says how long it takes. Tap <b>Mark done</b> as you go, and if one gets stuck, leave it and we will finish it together.</p>

${step(1, 'Claude Pro', 'Get Claude Pro', 'About 5 minutes. $20 a month (or $17 a month paid yearly). Claude Code comes with it.', `
  <ol>
    <li>Go to <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a> and sign up with your email or your Google account. Use the email you want your business to run on.</li>
    <li>Once you are in, open <a href="https://claude.ai/upgrade" target="_blank" rel="noopener">claude.ai/upgrade</a>.</li>
    <li>Choose <b>Pro</b>, pick monthly or yearly, and pay with your card.</li>
    <li>You will land back in Claude with Pro on your account. That is it.</li>
  </ol>
  <a class="go" href="https://claude.ai/upgrade" target="_blank" rel="noopener">Open Claude Pro</a>
  <p class="note">The free plan does not include Claude Code, which is what builds your dashboard. Pro is the one you need. See all plans at <a href="https://claude.com/pricing" target="_blank" rel="noopener">claude.com/pricing</a>.</p>`)}

${step(2, 'Warp', 'Install Warp, your terminal', 'About 5 minutes. Free.', `
  <p style="margin:0">A terminal is a window where you type instructions to your computer. Warp is a friendly one, and it is where Claude Code will live.</p>
  <ol>
    <li>Go to <a href="https://www.warp.dev/download" target="_blank" rel="noopener">warp.dev/download</a> and download it for your computer.</li>
    <li data-os="mac">Open the downloaded file and drag <b>Warp</b> into your <b>Applications</b> folder. Then open Warp from Applications. If your Mac asks "Are you sure you want to open it?", click <b>Open</b>.</li>
    <li data-os="win">Open the downloaded installer and click through it. Then open Warp from the Start menu.</li>
    <li>Warp may ask you to sign in. You can sign in with Google or skip it, either is fine.</li>
    <li>Leave Warp open. You need it for the next step.</li>
  </ol>
  <a class="go" href="https://www.warp.dev/download" target="_blank" rel="noopener">Download Warp</a>`)}

${step(3, 'Claude Code', 'Install Claude Code', 'About 5 minutes. Done inside Warp.', `
  <p style="margin:0">Showing the steps for <b class="osname">Mac</b>. <a href="#" id="osflip">Using the other kind of computer?</a></p>
  <div data-os="mac">
    <p class="note warn">Your Mac needs macOS 13 or newer. Check under the Apple menu, then <b>About This Mac</b>. If it is older, tell me in the last box of part 1 and we will sort it out.</p>
    <ol>
      <li>Copy this line, paste it into Warp, and press <b>Enter</b>:</li>
    </ol>
    <div class="cmd"><code>curl -fsSL https://claude.ai/install.sh | bash</code><button type="button" class="copy">Copy</button></div>
  </div>
  <div data-os="win">
    <ol>
      <li>Warp opens in PowerShell on Windows. Copy this line, paste it into Warp, and press <b>Enter</b>:</li>
    </ol>
    <div class="cmd"><code>irm https://claude.ai/install.ps1 | iex</code><button type="button" class="copy">Copy</button></div>
    <p class="note">Also install <a href="https://git-scm.com/downloads/win" target="_blank" rel="noopener">Git for Windows</a> (click through the installer with the normal choices). Claude Code works better with it.</p>
  </div>
  <ol start="2">
    <li>Wait until it finishes. It shows little progress while it downloads, so give it a minute or two.</li>
    <li>Close Warp completely and open it again.</li>
    <li>Type <code>claude</code> and press <b>Enter</b>.</li>
    <li>When it asks how to log in, choose your <b>Claude account with subscription</b>. Your browser opens. Click <b>Authorize</b>, then go back to Warp.</li>
    <li>When you see Claude waiting for you to type, it worked. Type <code>/exit</code> and press Enter to close it for now.</li>
  </ol>
  <p class="note">If Warp says <code>command not found: claude</code>, close Warp, open it again and try <code>claude</code> once more. Still stuck? Mark this step for later and we will fix it in the first five minutes.</p>
  <a class="go ghost" href="https://code.claude.com/docs/en/setup" target="_blank" rel="noopener">Official install guide</a>`)}

${step(4, 'GitHub', 'Make a free GitHub account', 'About 5 minutes. Free.', `
  <p style="margin:0">GitHub keeps a safe copy of everything we build, with every version, so nothing gets lost.</p>
  <ol>
    <li>Go to <a href="https://github.com/signup" target="_blank" rel="noopener">github.com/signup</a>.</li>
    <li>Enter your email, make a password, and pick a username. Your project name works well as a username.</li>
    <li>Solve the little puzzle, then type the code GitHub emails you.</li>
    <li>If it asks about plans, choose <b>Free</b>. Skip any questions about teams.</li>
    <li>Keep your password in a safe place. Never send it to anyone, including me.</li>
  </ol>
  <a class="go" href="https://github.com/signup" target="_blank" rel="noopener">Open GitHub sign up</a>`)}

${step(5, 'Project folder', 'Make your project folder and fill it', 'About 10 minutes, longer if you have lots of files. This one matters most.', `
  <p style="margin:0">Claude Code builds your AI app <b>from this folder</b>. The more it holds, the better it understands your project.</p>
  <ol>
    <li data-os="mac">On your Desktop, right click an empty spot and choose <b>New Folder</b>.</li>
    <li data-os="win">On your Desktop, right click an empty spot and choose <b>New</b>, then <b>Folder</b>.</li>
    <li>Name it after your project: <span class="pname">Your Project</span></li>
    <li>Inside it, make these folders:
      <ul><li><b>Plans and documents</b>: business plans, pitch decks, price lists, notes, spreadsheets</li>
      <li><b>Photos</b></li><li><b>Videos</b></li>
      <li><b>Brand</b>: logos, colours, fonts, flyers</li>
      <li><b>Everything else</b>: anything that does not fit above</li></ul></li>
    <li>Now gather. Drag in copies of everything about this project from your computer, Google Drive, phone and email. Do not worry about it being tidy. More is better than perfect.</li>
  </ol>
  <p class="note warn">Leave out passwords, bank details and private customer records. If a document has any of those, skip it.</p>`)}

${step(6, 'Project brief in the folder', 'Have your AI write your project brief', 'About 15 minutes.', `
  <p style="margin:0">This prompt asks an AI to pull together everything about your project into one full document. Use the AI that knows you best, the one you have talked with most (ChatGPT, Claude, Gemini or another).</p>
  <ol>
    <li>Tap <b>Copy the prompt</b>.</li>
    <li>Open your AI, start a new chat, paste it and send.</li>
    <li>Answer any questions it asks. Speak or type, and be generous with detail.</li>
    <li>When it gives you the document, download it (Word or PDF). If it only gives you text, copy it into a Google Doc or Word document and download that.</li>
    <li>Name the file <span class="pname">Your Project</span> <b>Project Brief</b> and drop it into your <span class="pname">Your Project</span> folder from step 5.</li>
  </ol>
  <textarea class="prompt" id="prompt" readonly></textarea>
  <button type="button" class="copy big" id="copyprompt">Copy the prompt</button>
  <p class="note">This brief is what Claude Code reads first. A detailed brief means a dashboard and agents that fit your project from day one.</p>`)}

${step(7, 'Business Kit downloaded', 'Download the Greenfire Business Kit', 'About 2 minutes.', kit ? `
  <p style="margin:0">Every tool we build your dashboard from: the command center, its seven agents, and the skills, workflows and automations behind them. Nothing in it belongs to anyone else; it fills in with your business.</p>
  <ol>
    <li>Tap <b>Download the kit</b>. It saves a small zip file to your <b>Downloads</b> folder.</li>
    <li>Double click it to unzip it. You get a folder called <b>Greenfire Business Kit</b>.</li>
    <li>Drag that folder into your <span class="pname">Your Project</span> folder, next to your Project Brief from step 6.</li>
    <li>Do not set anything up yet. In our session, Claude Code reads your brief and this kit and builds your dashboard with us.</li>
  </ol>
  <a class="go" href="${esc(kit)}" target="_blank" rel="noopener">Download the kit</a>` : `
  <p class="note">The download link goes here before your session. Check back on this page, or I will text it to you.</p>`)}

<div class="part">Last &middot; Send it to me</div>
<section>
  <p style="margin:0">Send now, even if some steps are not done yet. You can come back and send again later, and I will see the update.</p>
  <div class="hp" aria-hidden="true"><label>Website<input type="text" id="website_hp" tabindex="-1" autocomplete="off"></label></div>
  <button class="send" type="submit" id="send">Send to Jordan</button>
  <p class="err" id="err" role="alert"></p>
  <div class="sent" id="sent" hidden><b>Sent. Thank you.</b> I read every answer and shape our time around it. Keep working through the steps, and press send again whenever you finish more of them.</div>
</section>
</form>
<p class="foot">Greenfire &middot; Your answers go only to Jordan and are never shared.</p>
</main>
<template id="prompt-t">${esc(PROMPT)}</template>
<script>
(function () {
  var $ = function (id) { return document.getElementById(id) }
  var all = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)) }
  var qs = new URLSearchParams(location.search)
  var KEY = 'gf-activate'
  var store = { get: function () { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { return {} } },
    set: function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch (e) {} } }

  /* Their computer: guessed from the browser, then whatever they tap. */
  var os = /Win/i.test(navigator.platform || navigator.userAgent) ? 'win' : 'mac'
  function setOs(v) { os = v; document.body.className = document.body.className.replace(/os-\\w+/, '') + ' os-' + v
    all('.osname').forEach(function (e) { e.textContent = v === 'win' ? 'Windows' : 'Mac' }) }
  $('osflip').addEventListener('click', function (e) { e.preventDefault(); setOs(os === 'mac' ? 'win' : 'mac') })

  /* The session time, from the link Jordan sent: shown in THEIR time zone. */
  var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch (e) {}
  var seen = ''
  var when = new Date(qs.get('when') || '')
  if (!isNaN(when)) {
    var fmt = function (zone) { var o = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }
      if (zone) o.timeZone = zone; try { return when.toLocaleString(undefined, o) } catch (e) { return when.toString() } }
    seen = fmt()
    var jz = qs.get('jz') || ''
    $('when').innerHTML = '<span class="tag">Our session</span><br><b></b><small></small>'
    $('when').querySelector('b').textContent = seen
    $('when').querySelector('small').textContent = 'That is in your time zone' + (tz ? ' (' + tz.replace(/_/g, ' ') + ')' : '') + (jz ? '. For Jordan it is ' + fmt(jz) + '.' : '.') + ' If that is not right, tap "I need a different time" below.'
    $('when').hidden = false
  } else {
    var t = $('f-time_ok'); if (t) t.hidden = true
  }

  /* Project name flows into the folder name and the prompt. */
  var tpl = $('prompt-t').content.textContent
  function project() { return ($('business').value.trim().replace(/[\\\\\\/:*?"<>|]/g, '').replace(/\\s+/g, ' ')) || '' }
  function paint() {
    var p = project()
    all('.pname').forEach(function (e) { e.textContent = p || 'Your Project' })
    $('prompt').value = tpl.split('{{P}}').join(p || 'my project')
  }

  /* Chips and step ticks. */
  $('f').addEventListener('click', function (e) {
    var b = e.target.closest('.chip')
    if (b) {
      var f = b.closest('.field'), on = b.getAttribute('aria-pressed') === 'true', many = f.getAttribute('data-kind') === 'many'
      if (!many) all('.chip', f).forEach(function (x) { x.setAttribute('aria-pressed', 'false') })
      b.setAttribute('aria-pressed', on && many ? 'false' : 'true')
      f.classList.remove('missing')
      if (f.getAttribute('data-q') === 'computer') { var t = b.textContent.trim(); if (t === 'Windows') setOs('win'); else if (t === 'Mac') setOs('mac') }
      save(); return
    }
    var k = e.target.closest('.tick')
    if (k) { var now = k.getAttribute('aria-pressed') !== 'true'; k.setAttribute('aria-pressed', String(now)); k.textContent = now ? 'Done' : 'Mark done'
      k.closest('.step').classList.toggle('is-done', now); save() }
  })

  /* Copy buttons. */
  function copy(text, btn, label) {
    var ok = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label }, 1600) }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { fallback() })
    else fallback()
    function fallback() { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok() } catch (e) {} t.remove() }
  }
  all('.cmd .copy').forEach(function (b) { b.addEventListener('click', function () { copy(b.previousElementSibling.textContent, b, 'Copy') }) })
  $('copyprompt').addEventListener('click', function () { paint(); copy($('prompt').value, $('copyprompt'), 'Copy the prompt') })

  /* Speak into any box. The browser does the listening; nothing is recorded by us. */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition
  var live = null
  if (SR) document.body.classList.add('can-speak')
  function asEmail(s) { return s.toLowerCase().replace(/\\s+at\\s+/g, '@').replace(/\\s+dot\\s+/g, '.').replace(/\\s+/g, '') }
  all('.mic').forEach(function (m) {
    m.addEventListener('click', function () {
      var el = m.parentNode.querySelector('input,textarea')
      if (live) { var was = live.btn; live.rec.stop(); if (was === m) return }
      var rec = new SR(), base = el.value
      rec.lang = navigator.language || 'en-US'; rec.continuous = true; rec.interimResults = true
      rec.onresult = function (e) {
        var said = ''
        for (var i = 0; i < e.results.length; i++) said += e.results[i][0].transcript
        said = said.trim()
        if (el.hasAttribute('data-email')) said = asEmail(said)
        else if (said && !base) said = said.charAt(0).toUpperCase() + said.slice(1)
        el.value = base ? base.replace(/\\s*$/, '') + (el.hasAttribute('data-email') ? '' : ' ') + said : said
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      rec.onerror = function (e) { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') $('err').textContent = 'Your browser blocked the microphone. Allow it in the browser settings, or type instead.' }
      rec.onend = function () { m.classList.remove('on'); if (live && live.rec === rec) live = null; save() }
      try { rec.start(); m.classList.add('on'); live = { rec: rec, btn: m }; el.focus() } catch (e) {}
    })
  })

  /* Keep their answers on this device, so coming back later picks up where they were. */
  function collect() {
    var answers = {}
    all('.field[data-q]').forEach(function (f) {
      var id = f.getAttribute('data-q'), kind = f.getAttribute('data-kind')
      var picked = all('.chip[aria-pressed=true]', f).map(function (b) { return b.textContent.trim() })
      answers[id] = kind === 'text' ? f.querySelector('input,textarea').value.trim() : kind === 'one' ? (picked[0] || '') : picked
    })
    answers.tz = tz; answers.session_seen = seen
    answers.steps_done = all('.tick[aria-pressed=true]').map(function (k) { return k.getAttribute('data-step') })
    return answers
  }
  var basics = ['name', 'email', 'phone', 'business', 'site']
  function save() {
    var d = { answers: collect() }; basics.forEach(function (id) { d[id] = $(id).value })
    store.set(d)
  }
  function restore() {
    var d = store.get(); if (!d.answers) return
    basics.forEach(function (id) { if (d[id]) $(id).value = d[id] })
    all('.field[data-q]').forEach(function (f) {
      var v = d.answers[f.getAttribute('data-q')]; if (v == null) return
      if (f.getAttribute('data-kind') === 'text') f.querySelector('input,textarea').value = v
      else all('.chip', f).forEach(function (b) { var on = Array.isArray(v) ? v.indexOf(b.textContent.trim()) >= 0 : v === b.textContent.trim(); b.setAttribute('aria-pressed', String(on))
        if (on && f.getAttribute('data-q') === 'computer') { if (b.textContent.trim() === 'Windows') os = 'win'; else if (b.textContent.trim() === 'Mac') os = 'mac' } })
    })
    all('.tick').forEach(function (k) { if ((d.answers.steps_done || []).indexOf(k.getAttribute('data-step')) >= 0) { k.setAttribute('aria-pressed', 'true'); k.textContent = 'Done'; k.closest('.step').classList.add('is-done') } })
  }
  restore(); setOs(os); paint()
  $('f').addEventListener('input', function (e) { if (e.target.id === 'business') paint(); var f = e.target.closest('.field'); if (f) f.classList.remove('missing'); save() })

  /* Send. */
  var err = $('err')
  $('f').addEventListener('submit', function (e) {
    e.preventDefault(); err.textContent = ''
    var answers = collect(), first = null
    all('.field[data-required]').forEach(function (f) {
      var inp = f.querySelector('input,textarea'), q = f.getAttribute('data-q')
      var val = q ? answers[q] : inp.value.trim()
      var empty = Array.isArray(val) ? !val.length : !val
      f.classList.toggle('missing', empty); if (empty) first = first || f
    })
    if (first) { err.textContent = 'A few answers marked * in part 1 are still empty.'; first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    var send = $('send'); send.disabled = true; send.textContent = 'Sending...'
    var v = function (id) { return $(id).value.trim() }
    fetch('/api/onboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      form: 'activation', name: v('name'), email: v('email'), phone: v('phone'), business: v('business'), site: v('site'),
      answers: answers, website_hp: v('website_hp')
    }) }).then(function (r) { return r.json().catch(function () { return {} }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'That did not go through. Please try again.') }) })
      .then(function () { $('sent').hidden = false; send.disabled = false; send.textContent = 'Send an update' })
      .catch(function (x) { err.textContent = x.message; send.disabled = false; send.textContent = 'Send to Jordan' })
  })
})()
</script></body></html>`;
}
