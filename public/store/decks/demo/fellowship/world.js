// Agent Decks living world. One small file that every living deck copies byte for byte (like sound.js).
// It turns (the feed, the viewer's clock, the choices saved on this screen, the deck's "living" block, URL settings)
// into one world state: { living, phase, daylight, dark, glow, season, weather, intensity, stage, art_stage, progress, next_label, reached_at, private, levels }.
// Authority, highest first: a URL setting, the choice saved on this screen, the feed, the clock, the base look.
// It reads nothing but what it is handed, fetches nothing, and writes only this screen's own choices to localStorage.
// A deck sets window.DECK_WORLD = { key: 'deck-name', living: the same block as in deck.json } before loading this file.
// URL settings: ?phase=day|night|dawn|dusk &season=spring|summer|autumn|winter &stage=1..10 &weather=off &private=on &living=off
(function () {
  'use strict'
  var PHASES = ['dawn', 'day', 'dusk', 'night'], SEASONS = ['spring', 'summer', 'autumn', 'winter'], WEATHER = ['clear', 'cloudy', 'rain', 'storm', 'snow', 'fog', 'wind']
  var HOUR = 3600000, DAY = 86400000, STALE_WEATHER = 3 * HOUR, STALE_SUN = 36 * HOUR
  function isObj(v) { return v != null && typeof v === 'object' && !Array.isArray(v) }
  function whole(v, min, max) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= min && v <= max }
  function has(list, v) { return Array.isArray(list) && list.indexOf(v) >= 0 }
  function first() { for (var i = 0; i < arguments.length; i++) if (arguments[i] != null) return arguments[i]; return null }
  function word(list, v, allowed) { if (typeof v !== 'string') return null; v = v.trim().toLowerCase(); return list.indexOf(v) >= 0 && (!allowed || has(allowed, v)) ? v : null }
  function onOff(v) { if (v === true) return true; if (v === false) return false; if (typeof v !== 'string') return null; v = v.trim().toLowerCase(); return v === 'off' || v === '0' || v === 'false' ? false : v === 'on' || v === 'auto' || v === '1' || v === 'true' ? true : null }
  function when(v) { if (typeof v !== 'string') return null; var t = Date.parse(v); return isFinite(t) ? t : null }
  function settings(q) {
    var out = {}, k
    if (isObj(q)) { for (k in q) if (typeof q[k] === 'string' || typeof q[k] === 'number') out[String(k).toLowerCase()] = String(q[k]); return out }
    if (typeof q !== 'string') return out
    q.replace(/^[?#]/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i < 1) return; try { out[decodeURIComponent(kv.slice(0, i)).toLowerCase()] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')) } catch (e) {} })
    return out
  }
  // the clock: a number of milliseconds, a Date, or { now, hour, month } where hour and month are the viewer's local ones
  function clockOf(c) {
    var now = typeof c === 'number' ? c : c instanceof Date ? c.getTime() : isObj(c) && typeof c.now === 'number' ? c.now : Date.now()
    if (!isFinite(now)) now = Date.now()
    var d = new Date(now), hour = d.getHours() + d.getMinutes() / 60, month = d.getMonth()
    if (isObj(c) && typeof c.hour === 'number' && c.hour >= 0 && c.hour < 24) hour = c.hour
    if (isObj(c) && whole(c.month, 0, 11)) month = c.month
    return { now: now, hour: hour, month: month }
  }
  // one hour either side of sunrise is dawn, one hour either side of sunset is dusk. With the fixed hours (6 and 18)
  // that gives dawn 5 to 7, day 7 to 17, dusk 17 to 19, night 19 to 5.
  function light(t, rise, set) {
    var a = (t - (rise - 1)) / 2, b = (t - (set - 1)) / 2
    if (a <= 0 || b >= 1) return { phase: 'night', daylight: 0 }
    if (a < 1) return { phase: 'dawn', daylight: a }
    if (b <= 0) return { phase: 'day', daylight: 1 }
    return { phase: 'dusk', daylight: 1 - b }
  }
  function sunOf(sun, now) {
    if (!isObj(sun)) return null
    var rise = when(sun.rise), set = when(sun.set)
    if (rise == null || set == null || !(rise < set) || Math.abs(now - rise) > STALE_SUN) return null
    var k = Math.round((now - (rise + set) / 2) / DAY)
    return { rise: rise + k * DAY, set: set + k * DAY }
  }
  function seasonByDate(month, hemisphere) {
    if ((hemisphere !== 'north' && hemisphere !== 'south') || !whole(month, 0, 11)) return null
    var i = Math.floor(((month + 10) % 12) / 3)
    return SEASONS[hemisphere === 'south' ? (i + 2) % 4 : i]
  }
  function base() { return { living: false, phase: null, daylight: null, dark: null, glow: 0, season: null, weather: null, intensity: null, stage: 1, art_stage: 1, stage_source: 'base', progress: null, next_label: null, reached_at: null, private: false, levels: {} } }
  function build(input) {
    var feed = isObj(input.feed) ? input.feed : {}, w = isObj(feed.world) ? feed.world : {}, decl = isObj(input.living) ? input.living : null
    var url = settings(input.url), saved = isObj(input.saved) ? input.saved : {}, c = clockOf(input.clock), out = base()
    if (!decl) return out
    var live = first(onOff(url.living), onOff(saved.living), w.evolve === 'off' ? false : null, true)
    out.living = live
    // time of day. An explicit Day or Night is a choice of look, so it holds even when the world is still.
    if (has(decl.phase, 'day') || has(decl.phase, 'night')) {
      var want = first(word(PHASES, url.phase, decl.phase), word(PHASES, saved.phase, decl.phase))
      if (!live && want !== 'day' && want !== 'night') want = null
      var l = want ? { phase: want, daylight: want === 'day' ? 1 : want === 'night' ? 0 : 0.5 } : null
      if (!l && live) { var sun = sunOf(w.sun, c.now); l = sun ? light(c.now / HOUR, sun.rise / HOUR, sun.set / HOUR) : light(c.hour, 6, 18) }
      if (l && !has(decl.phase, l.phase)) { l.daylight = l.daylight >= 0.5 ? 1 : 0; l.phase = l.daylight ? 'day' : 'night'; if (!has(decl.phase, l.phase)) l = null }
      if (l) { out.phase = l.phase; out.daylight = l.daylight; out.dark = l.daylight < 0.5; out.glow = 1 - Math.abs(2 * l.daylight - 1) }
    }
    if (!live) return out
    // season: the feed says it, or the date plus the hemisphere does. With neither, the season stays off.
    if (Array.isArray(decl.season)) out.season = first(word(SEASONS, url.season, decl.season), word(SEASONS, saved.season, decl.season), word(SEASONS, w.season, decl.season), word(SEASONS, seasonByDate(c.month, w.hemisphere), decl.season))
    // weather: only what the feed observed in the last three hours
    var x = isObj(w.weather) ? w.weather : {}, seenAt = when(x.observed_at), cond = word(WEATHER, x.condition)
    if (cond && seenAt != null && Math.abs(c.now - seenAt) <= STALE_WEATHER && onOff(url.weather) !== false && onOff(saved.weather) !== false) { out.weather = cond; out.intensity = typeof x.intensity === 'number' && x.intensity >= 0 && x.intensity <= 1 ? x.intensity : 0.5 }
    // growth: the stage comes only from the feed (or a URL setting for kiosks and screenshots). Stage 1 is the deck as shipped.
    var max = whole(decl.stages, 1, 10) ? decl.stages : 1, g = isObj(w.growth) ? w.growth : {}
    if (max > 1) {
      var fromUrl = /^\d{1,2}$/.test(url.stage || '') && whole(Number(url.stage), 1, 10) ? Number(url.stage) : null, fromFeed = whole(g.stage, 1, 10) ? g.stage : null
      out.stage = first(fromUrl, fromFeed, 1); out.stage_source = fromUrl ? 'url' : fromFeed ? 'feed' : 'base'; out.art_stage = Math.min(out.stage, max)
      out.private = first(onOff(url.private), onOff(saved.private), g.private === true ? true : null, false)
      if (out.stage_source === 'feed') {
        if (when(g.reached_at) != null) out.reached_at = g.reached_at
        if (!out.private && typeof g.progress === 'number' && g.progress >= 0 && g.progress <= 1) out.progress = g.progress
        if (!out.private && typeof g.next_label === 'string' && g.next_label.trim()) out.next_label = g.next_label.trim().slice(0, 80)
      }
    }
    // levels: a count of finished work the owner accepted. Nothing else.
    if (decl.agent_levels === true && Array.isArray(feed.agents)) feed.agents.forEach(function (a) { if (isObj(a) && typeof a.id === 'string' && whole(a.level, 1, 5)) out.levels[a.id] = { level: a.level, accepted: whole(a.accepted, 0, 9007199254740991) ? a.accepted : null } })
    return out
  }
  // The pure part. Never throws: anything it cannot read gives the base look.
  function compute(input) { try { return build(isObj(input) ? input : {}) } catch (e) { return base() } }
  // Which stage, if any, should get its one moment on this screen. seen is the highest stage already celebrated here.
  function moment(state, seen) {
    if (!isObj(state) || !state.living || state.stage_source !== 'feed' || !state.reached_at || !whole(state.art_stage, 2, 10)) return 0
    return state.art_stage > (whole(seen, 1, 10) ? seen : 1) ? state.art_stage : 0
  }
  var root = typeof globalThis !== 'undefined' ? globalThis : this
  var api = root.DeckWorld = { compute: compute, moment: moment, settings: settings, PHASES: PHASES, SEASONS: SEASONS, WEATHER: WEATHER, state: base() }
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  // ---- in the browser: keep the state fresh, mark the page, remember this screen's choices, and offer one small control
  var cfg = null, feed = null, store = {}, subs = [], tick = null, CHOICES = ['phase', 'season', 'living', 'weather', 'private'], NOTES = ['seen', 'last_season']
  function read() { try { var v = JSON.parse(localStorage.getItem('deck-world:' + cfg.key) || '{}'); store = isObj(v) ? v : {} } catch (e) { store = {} } }
  function write() { try { localStorage.setItem('deck-world:' + cfg.key, JSON.stringify(store)) } catch (e) {} }
  function mark(el, name, value) { if (value == null) el.removeAttribute(name); else el.setAttribute(name, String(value)) }
  function refresh() {
    if (!cfg) return api.state
    var prev = api.state, s = compute({ feed: feed, clock: typeof cfg.clock === 'function' ? cfg.clock() : Date.now(), saved: store, living: cfg.living, url: location.search }), el = cfg.root || document.documentElement
    api.state = s
    mark(el, 'data-living', s.living ? 'on' : 'off'); mark(el, 'data-phase', s.phase); mark(el, 'data-season', s.season)
    mark(el, 'data-stage', isObj(cfg.living) && cfg.living.stages ? s.art_stage : null); mark(el, 'data-weather', isObj(cfg.living) && has(cfg.living.weather, s.weather) ? s.weather : null)
    el.style.setProperty('--daylight', s.daylight == null ? '1' : s.daylight.toFixed(3)); el.style.setProperty('--glow', s.glow.toFixed(3))
    subs.forEach(function (f) { try { f(s, prev) } catch (e) { if (window.console) console.error(e) } })
    paint()
    return s
  }
  function run() { clearInterval(tick); if (!document.hidden) tick = setInterval(refresh, 60000) }
  api.start = function (c) { if (!isObj(c) || typeof c.key !== 'string') return api.state; cfg = c; read(); run(); if (c.control !== false) { if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount) } return refresh() }
  api.feed = function (f) { feed = isObj(f) ? f : null; return refresh() }
  api.on = function (f) { if (typeof f !== 'function') return; subs.push(f); if (cfg) try { f(api.state, null) } catch (e) { if (window.console) console.error(e) } }
  api.choose = function (name, value) { if (!cfg || CHOICES.indexOf(name) < 0) return api.state; if (value == null) delete store[name]; else store[name] = String(value); write(); return refresh() }
  api.choice = function (name) { return CHOICES.indexOf(name) >= 0 && store[name] != null ? store[name] : null }
  api.note = function (name, value) { if (!cfg || NOTES.indexOf(name) < 0) return; if (value == null) delete store[name]; else store[name] = value; write() }
  api.noted = function (name) { return NOTES.indexOf(name) >= 0 && store[name] != null ? store[name] : null }
  api.pending = function () { return moment(api.state, store.seen) }
  document.addEventListener('visibilitychange', function () { if (!cfg) return; run(); if (!document.hidden) refresh() })

  // the World control: season (when the deck has seasons) and Still. Same look as the sound pill, bottom left.
  var box = null, panel = null, pill = null, open = false
  var PILL = 'font:600 12px ui-sans-serif,-apple-system,Segoe UI,sans-serif;border-radius:999px;padding:6px 11px;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:rgba(18,18,24,.82);color:#fff;white-space:nowrap;backdrop-filter:blur(8px)'
  function make(tag, text, css) { var e = document.createElement(tag); if (text != null) e.textContent = text; if (css) e.style.cssText = css; return e }
  function button(text, pressed, act) { var b = make('button', text, PILL + (pressed ? ';background:#fff;color:#15151b;border-color:#fff' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(!!pressed)); b.onclick = function (e) { e.stopPropagation(); act() }; return b }
  function row(label, buttons) { var r = make('div', null, 'display:flex;flex-wrap:wrap;gap:6px;align-items:center'); r.appendChild(make('span', label, 'font:600 11px ui-sans-serif,-apple-system,Segoe UI,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.7);min-width:54px')); buttons.forEach(function (b) { r.appendChild(b) }); return r }
  function paint() {
    if (!box) return
    var s = api.state, seasons = isObj(cfg.living) && Array.isArray(cfg.living.season) ? cfg.living.season.filter(function (x) { return SEASONS.indexOf(x) >= 0 }) : [], still = store.living === 'off'
    pill.textContent = s.living ? 'World' : 'World: still'; pill.setAttribute('aria-expanded', String(open)); panel.style.display = open ? 'grid' : 'none'
    while (panel.firstChild) panel.removeChild(panel.firstChild)
    if (!open) return
    if (seasons.length && s.living) panel.appendChild(row('Season', [button('Auto', !store.season, function () { api.choose('season', null) })].concat(seasons.map(function (x) { return button(x.charAt(0).toUpperCase() + x.slice(1), store.season === x, function () { api.choose('season', x) }) }))))
    panel.appendChild(row('Motion', [button('Living', !still, function () { api.choose('living', null) }), button('Still', still, function () { api.choose('living', 'off') })]))
    if (!s.living && !still) panel.appendChild(make('span', 'The world is held still for this screen.', 'font:12px ui-sans-serif,-apple-system,Segoe UI,sans-serif;color:rgba(255,255,255,.75)'))
  }
  function mount() {
    if (box || !cfg) return
    box = make('div', null, 'position:fixed;left:12px;bottom:12px;z-index:2147482000;display:flex;flex-direction:column;gap:6px;align-items:flex-start;max-width:calc(100vw - 24px)')
    box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'World')
    panel = make('div', null, 'display:none;gap:8px;padding:10px 12px;border-radius:16px;background:rgba(18,18,24,.9);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px);max-width:min(340px,calc(100vw - 24px))')
    pill = make('button', 'World', PILL); pill.type = 'button'; pill.onclick = function (e) { e.stopPropagation(); open = !open; paint() }
    box.appendChild(panel); box.appendChild(pill); document.body.appendChild(box)
    document.addEventListener('pointerdown', function (e) { if (open && !box.contains(e.target)) { open = false; paint() } })
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') { open = false; paint(); pill.focus() } })
    paint()
  }
  if (isObj(window.DECK_WORLD)) api.start(window.DECK_WORLD)
})()
