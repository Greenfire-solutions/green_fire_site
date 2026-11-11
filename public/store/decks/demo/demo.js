// Agent Decks live demo. Load this BEFORE a deck's own scripts and the deck plays a simulated business day:
// agents change state, missions move, a decision waits for the visitor's yes. Nothing is real and nothing leaves the page.
// It works by answering the deck's own request for feed.json, so the deck's files are exactly the ones that ship.
(function () {
  'use strict'
  function makeDemo(clock) {
    var now = clock || function () { return Date.now() }
    var iso = function (t) { return new Date(t).toISOString() }
    var t0 = now(), s
    function reset() {
      t0 = now()
      s = {
        step: 0, caption: '', waiting: null, done: 4, failed: 0, cost: 0.62,
        agents: {
          'owner-agent': ['Juniper', 'Strategy, runs the day'], content: ['Wren', 'Creative: posts and flyers'], books: ['Abacus', 'Finance and bookkeeping'],
          inbox: ['Pip', 'Communications: inbox'], growth: ['Lark', 'Growth and outreach'], research: ['Sage', 'Research']
        },
        state: {}, approvals: [
          { id: 'P13', kind: 'calendar_event', summary: 'Call with Dana, Tue 10:00 to 11:00', status: 'executed', proposed_at: iso(t0 - 5 * 3600000), expires_at: null },
          { id: 'P12', kind: 'social_post', summary: 'Instagram: behind the scenes of the spring menu', status: 'rejected', proposed_at: iso(t0 - 20 * 3600000), expires_at: null }
        ],
        activity: [
          { at: iso(t0 - 5 * 3600000), agent: 'owner-agent', kind: 'executed', text: 'Booked the call with Dana', level: 'ok' },
          { at: iso(t0 - 20 * 3600000), agent: 'content', kind: 'refused', text: 'A clip was skipped: no signed consent for the person on camera', level: 'warn' }
        ],
        health: { Calendar: ['healthy', 'Read only'], Mail: ['healthy', 'Connected'], 'Bookkeeping export': ['healthy', 'Updated this morning'], Contacts: ['healthy', 'Read only'] },
        missions: [
          { id: 'm1', title: 'Launch the spring menu', status: 'active', progress: 0.5, lead: 'content', agents: ['content', 'owner-agent', 'research', 'growth'], steps: [{ text: 'Menu photos chosen', done: true }, { text: 'Prices compared nearby', done: false }, { text: 'Tasting clip cut', done: false }, { text: 'Your approval to post', done: false }] },
          { id: 'm2', title: 'Collect overdue invoices', status: 'active', progress: 0.25, lead: 'books', agents: ['books', 'owner-agent'], steps: [{ text: 'Overdue invoices found', done: true }, { text: 'Reminders written', done: false }, { text: 'Your approval', done: false }, { text: 'Reminders saved to send', done: false }] },
          { id: 'm3', title: 'Answer the inbox', status: 'active', progress: 0.4, lead: 'inbox', agents: ['inbox'], steps: [{ text: 'New messages sorted', done: true }, { text: 'Replies drafted', done: false }] }
        ]
      }
      for (var id in s.agents) s.state[id] = ['idle', null, t0 - 40 * 60000]
      STORY[0]()
    }
    var set = function (id, state, current) { s.state[id] = [state, current || null, now()] }
    var say = function (agent, level, text, kind) { s.activity.unshift({ at: iso(now()), agent: agent, kind: kind || 'work', text: text, level: level }); s.activity.length = Math.min(s.activity.length, 12) }
    var mission = function (id, status, progress, doneSteps) { var m = s.missions.filter(function (x) { return x.id === id })[0]; m.status = status; m.progress = progress; m.steps.forEach(function (st, i) { st.done = i < doneSteps }) }
    var propose = function (id, kind, summary) { s.approvals.unshift({ id: id, kind: kind, summary: summary, status: 'pending_approval', proposed_at: iso(now()), expires_at: iso(now() + 3 * 86400000) }) }
    var settle = function (id, status) { s.approvals.forEach(function (a) { if (a.id === id) a.status = status }) }
    var STORY = [
      function () { s.caption = 'A normal morning. Everyone has a job.'
        set('owner-agent', 'working', 'Planning the day'); set('content', 'working', "Cutting Saturday's tasting clip"); set('books', 'working', 'Finding overdue invoices')
        set('inbox', 'working', 'Sorting 14 new messages'); set('growth', 'working', 'Testing two offers with past customers'); set('research', 'working', 'Mapping what nearby bakeries charge')
        say('content', 'info', "Started Saturday's tasting clip") },
      function () { s.caption = 'Sage finishes the research and rests.'
        set('research', 'idle'); mission('m1', 'active', 0.62, 2); s.done++; s.cost += 0.21; say('research', 'ok', 'Price map finished: 6 bakeries compared', 'done') },
      function () { s.caption = 'Abacus writes the payment reminders.'
        set('books', 'working', 'Writing 3 payment reminders'); mission('m2', 'active', 0.5, 2); s.cost += 0.14; say('books', 'info', 'Found 3 overdue invoices, $1,236.00 in total') },
      function () { s.caption = 'A connection drops. Pip stops and says so.'
        set('inbox', 'blocked', 'The mail connection needs you to sign in again'); s.health.Mail = ['reconnect_required', 'Sign in again to resume']; mission('m3', 'blocked', 0.4, 1)
        say('inbox', 'warn', 'Mail sign-in expired. Stopped and waiting for you.', 'connection') },
      function () { s.caption = 'Nothing is sent without your yes. Press Say yes.'; s.waiting = 'P14'
        set('books', 'idle'); set('owner-agent', 'waiting_on_owner', 'Three payment reminders are ready for your yes'); mission('m2', 'waiting_on_owner', 0.66, 2)
        propose('P14', 'payment_reminder', 'Reminder to Blue Heron Studio for invoice 2003, $412.00'); say('owner-agent', 'info', 'Proposed 3 payment reminders', 'proposed') },
      function () { s.caption = 'You said yes. The work carries on.'; s.waiting = null
        settle('P14', 'executed'); set('owner-agent', 'working', 'Saving the approved reminders to your outbox'); mission('m2', 'active', 0.88, 3); s.done++; s.cost += 0.09
        say('owner-agent', 'ok', 'You approved 3 payment reminders', 'executed') },
      function () { s.caption = 'Mail is back. Pip picks up where it stopped.'
        s.health.Mail = ['healthy', 'Connected']; set('inbox', 'working', 'Drafting replies to 5 customers'); mission('m3', 'active', 0.7, 1); mission('m2', 'done', 1, 4); set('owner-agent', 'working', 'Checking the spring menu page')
        s.done++; say('inbox', 'ok', 'Mail reconnected. Picking up where it stopped.', 'connection') },
      function () { s.caption = 'A file will not open. Lark reports it and does not guess.'
        set('growth', 'error', 'A source file could not be read'); s.failed++; say('growth', 'error', 'A source file could not be read. Stopped and reported.', 'error') },
      function () { s.caption = 'The clip is ready. It waits for your yes.'; s.waiting = 'P15'
        set('growth', 'working', 'Carrying on with the second offer'); set('content', 'waiting_on_owner', 'The tasting clip is ready for your yes'); mission('m1', 'waiting_on_owner', 0.85, 3)
        propose('P15', 'social_post', 'Post the tasting clip on Saturday at 9:00'); say('content', 'info', 'Proposed the tasting clip for Saturday', 'proposed') },
      function () { s.caption = 'Approved. The spring menu is launched.'; s.waiting = null
        settle('P15', 'executed'); set('content', 'idle'); mission('m1', 'done', 1, 4); s.done += 2; s.cost += 0.18; say('content', 'ok', 'You approved the tasting clip', 'executed') },
      function () { s.caption = 'The day winds down. Then it starts again.'
        set('owner-agent', 'idle'); set('growth', 'idle'); set('inbox', 'idle'); mission('m3', 'done', 1, 2); s.done++; say('inbox', 'ok', 'Replies drafted for 5 customers', 'done') }
    ]
    function next() { if (s.step + 1 >= STORY.length) reset(); else { s.step++; STORY[s.step]() } return s.step }
    function frame() {
      var pend = s.approvals.filter(function (a) { return a.status === 'pending_approval' }).length
      return {
        contract: 'agent-deck/1', updated_at: iso(now()), business: { name: 'Harbor & Pine Bakery' },
        agents: Object.keys(s.agents).map(function (id) { return { id: id, name: s.agents[id][0], role: s.agents[id][1], state: s.state[id][0], current: s.state[id][1], since: iso(s.state[id][2]) } }),
        approvals: s.approvals.map(function (a) { return Object.assign({}, a) }), activity: s.activity.map(function (a) { return Object.assign({}, a) }),
        metrics: { done_today: s.done, waiting_on_owner: pend, failed_today: s.failed, cost_usd_today: Math.round(s.cost * 100) / 100 },
        health: Object.keys(s.health).map(function (n) { return { name: n, state: s.health[n][0], note: s.health[n][1] } }),
        missions: s.missions.map(function (m) { return Object.assign({}, m, { agents: m.agents.slice(), steps: m.steps.map(function (x) { return { text: x.text, done: x.done } }) }) })
      }
    }
    reset()
    return { next: next, frame: frame, reset: reset, steps: STORY.length, get step() { return s.step }, get caption() { return s.caption }, get waiting() { return s.waiting } }
  }
  var root = typeof globalThis !== 'undefined' ? globalThis : this
  root.AgentDeckDemo = { makeDemo: makeDemo }
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  // ---- in the browser: answer feed.json, quicken the deck's own polling, and show a small control bar
  var demo = makeDemo(), realFetch = window.fetch.bind(window), realInterval = window.setInterval.bind(window)
  window.fetch = function (u, o) {
    if (/(^|\/)feed\.json(\?|$)/.test(String(u && u.url ? u.url : u))) return Promise.resolve(new Response(JSON.stringify(demo.frame()), { status: 200, headers: { 'content-type': 'application/json' } }))
    return realFetch(u, o)
  }
  window.setInterval = function (f, ms) { var rest = Array.prototype.slice.call(arguments, 2); return realInterval.apply(window, [f, ms >= 3000 ? 1000 : ms].concat(rest)) }
  var PACE = 5200, HOLD = 16000, playing = true, timer = null, bar, cap, yes, play, dots
  function schedule() { clearTimeout(timer); if (playing) timer = setTimeout(function () { demo.next(); paint(); schedule() }, demo.waiting ? HOLD : PACE) }
  function el(tag, text, css) { var e = document.createElement(tag); if (text != null) e.textContent = text; if (css) e.style.cssText = css; return e }
  function paint() {
    if (!bar) return
    cap.textContent = demo.caption; yes.style.display = demo.waiting ? '' : 'none'; play.textContent = playing ? 'Pause' : 'Play'
    dots.textContent = (demo.step + 1) + ' of ' + demo.steps
  }
  function mount() {
    if (bar || /[?&]bar=0/.test(location.search)) return
    var btn = 'font:600 12px ui-sans-serif,-apple-system,Segoe UI,sans-serif;border-radius:999px;padding:6px 12px;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.08);color:#fff;white-space:nowrap'
    bar = el('div', null, 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;justify-content:center;max-width:calc(100vw - 20px);padding:8px 12px;border-radius:18px;background:rgba(16,16,20,.9);color:#fff;font:13px/1.35 ui-sans-serif,-apple-system,Segoe UI,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.4);backdrop-filter:blur(8px)')
    bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Live demo controls')
    var tagEl = el('span', 'Live demo', 'font:700 10px ui-sans-serif,-apple-system,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#ffd27a;white-space:nowrap')
    cap = el('span', '', 'min-width:0;overflow-wrap:anywhere'); cap.setAttribute('aria-live', 'polite'); dots = el('span', '', 'opacity:.6;font-size:11px;white-space:nowrap')
    yes = el('button', 'Say yes', btn + ';background:#ffd27a;color:#1c1608;border-color:#ffd27a'); yes.type = 'button'
    yes.onclick = function () { demo.next(); paint(); schedule() }
    play = el('button', 'Pause', btn); play.type = 'button'; play.onclick = function () { playing = !playing; paint(); schedule() }
    var nx = el('button', 'Next', btn); nx.type = 'button'; nx.onclick = function () { demo.next(); paint(); schedule() }
    bar.append(tagEl, cap, yes, dots, play, nx); document.body.appendChild(bar); paint()
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount)
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else schedule() })
  schedule()
})()
