// Agent Decks sound pack player. A deck that ships sound sets window.DECK_SOUND before loading this file:
//   { label: 'Lo-fi', volume: 0.22, tracks: [ one entry per song, each with file (a path under sound/), title and by ] }
// Sound is quiet by design, starts only after the first click or key press (browsers require that), and one button turns it
// off for good: the choice is remembered. Nothing is fetched from anywhere but the deck's own folder.
(function () {
  'use strict'
  var cfg = window.DECK_SOUND; if (!cfg || !cfg.tracks || !cfg.tracks.length || typeof Audio === 'undefined') return
  var KEY = 'deck-sound:' + (cfg.label || 'on'), want = true, started = false, at = 0, fade = null
  try { var saved = localStorage.getItem(KEY); if (saved === 'off') want = false } catch (e) {}
  var MAX = Math.min(0.5, Math.max(0.02, cfg.volume || 0.2)), audio = new Audio(); audio.preload = 'none'; audio.volume = 0
  // start on a different track each visit, then play in order and loop
  at = Math.floor(Math.random() * cfg.tracks.length)
  function el(tag, text, css) { var e = document.createElement(tag); if (text != null) e.textContent = text; if (css) e.style.cssText = css; return e }
  var pill = 'font:600 12px ui-sans-serif,-apple-system,Segoe UI,sans-serif;border-radius:999px;padding:6px 11px;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:rgba(18,18,24,.82);color:#fff;white-space:nowrap;backdrop-filter:blur(8px)'
  var box = el('div', null, 'position:fixed;right:12px;bottom:12px;z-index:2147482000;display:flex;gap:6px;align-items:center;max-width:calc(100vw - 24px)')
  var toggle = el('button', '', pill), title = el('span', '', 'font:12px ui-sans-serif,-apple-system,Segoe UI,sans-serif;color:#fff;background:rgba(18,18,24,.7);border-radius:999px;padding:5px 10px;max-width:42vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:none'), next = el('button', 'Next', pill)
  toggle.type = 'button'; next.type = 'button'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Sound')
  function paint() {
    var t = cfg.tracks[at], playing = want && started
    toggle.textContent = want ? (started ? 'Sound on' : 'Sound: click anywhere') : 'Sound off'; toggle.setAttribute('aria-pressed', String(want))
    title.textContent = t.title + (t.by ? ' · ' + t.by : ''); title.style.display = playing ? '' : 'none'; next.style.display = playing && cfg.tracks.length > 1 ? '' : 'none'
  }
  function ramp(to, done) { clearInterval(fade); fade = setInterval(function () { var v = audio.volume + (to > audio.volume ? 0.012 : -0.02); if ((to > audio.volume && v >= to) || (to <= audio.volume && v <= to)) { audio.volume = to; clearInterval(fade); if (done) done() } else audio.volume = Math.max(0, Math.min(1, v)) }, 60) }
  function play() { if (!want) return; var src = cfg.tracks[at].file; if (!audio.src || audio.src.indexOf(src) < 0) audio.src = src; var p = audio.play(); if (p && p.then) p.then(function () { started = true; ramp(MAX); paint() }).catch(function () { started = false; paint() }); else { started = true; ramp(MAX); paint() } }
  function stop() { ramp(0, function () { audio.pause() }); started = false; paint() }
  function step() { at = (at + 1) % cfg.tracks.length; if (want) { audio.volume = 0; play() } paint() }
  audio.addEventListener('ended', step); audio.addEventListener('error', function () { if (cfg.tracks.length > 1 && want) setTimeout(step, 1500) })
  toggle.onclick = function (e) { e.stopPropagation(); want = !want; try { localStorage.setItem(KEY, want ? 'on' : 'off') } catch (x) {} if (want) play(); else stop() }
  next.onclick = function (e) { e.stopPropagation(); step() }
  function first() { if (want && !started) play() }
  document.addEventListener('pointerdown', first); document.addEventListener('keydown', first)
  function mount() { box.append(title, next, toggle); document.body.appendChild(box); paint(); if (want) play() }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount)
})()
