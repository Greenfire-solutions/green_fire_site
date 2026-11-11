#!/usr/bin/env node
/* Pull the harness and agent deck catalogue into the Greenfire site, for
   /store/harnesses. (2026-11-11)

   The one home of the decks is `Main projects/Agent Store`: its build.mjs
   checks every deck, screenshots it and writes site/index.html, and
   store.json holds the prices and buy links Jordan sets. This script only
   READS that folder. It writes:
     src/data/agentDecks.json      what the page shows
     public/store/decks/*.webp     the screenshots (already through the
                                   Agent Store privacy gate)

   Run after any Agent Store build, or after a price is set in store.json:
     node scripts/sync-agent-decks.mjs
   A deck with no price shows "Get first access", which files a lead through
   the existing /api/store reserve action. A deck with price_usd and buy_url
   shows a Buy button. Nothing here invents a price. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const store = process.env.AGENT_STORE || path.resolve(site, '../Agent Store');
const out = path.join(site, 'src/data/agentDecks.json');
const imgDir = path.join(site, 'public/store/decks');

const read = (p) => fs.readFileSync(path.join(store, p), 'utf8');
const html = read('site/index.html');
const cfg = JSON.parse(read('store.json'));
const versions = JSON.parse(read('site/versions.json'));
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const dash = /[–—]/;

/* The harness: its lede and its numbered points. */
const hStart = html.indexOf('<h2>AgentSet');
const hEnd = html.indexOf('<h2>Decks');
if (hStart < 0 || hEnd < 0) throw new Error('Agent Store page layout changed: harness or decks heading not found');
const hBlock = html.slice(hStart, hEnd);
const lede = text((hBlock.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '');
const points = [...hBlock.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => ({ title: text(m[1]), body: text(m[2]) }));

/* The decks, in the order the Agent Store lists them. */
const decks = [];
for (const m of html.slice(hEnd).matchAll(/<article class="deck">([\s\S]*?)<\/article>/g)) {
  const a = m[1];
  const id = (a.match(/data-demo="demo\/([^/"]+)\//) || [])[1];
  if (!id) continue;
  const c = cfg.decks?.[id] || {};
  if (c.listed === false) continue;
  const body = a.match(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/);
  const meta = text((a.match(/<p class="meta">([\s\S]*?)<\/p>/) || [])[1] || '');
  const views = ['command', 'council', 'phone'].filter((v) => fs.existsSync(path.join(store, 'site/assets', `${id}-${v}.webp`)));
  decks.push({
    id,
    name: text(body?.[1] || id),
    blurb: text(body?.[2] || ''),
    meta,
    version: versions.decks?.[id] || '',
    price_usd: typeof c.price_usd === 'number' && c.price_usd > 0 ? c.price_usd : null,
    buy_url: c.price_usd > 0 && /^https:\/\//.test(c.buy_url || '') ? c.buy_url : null,
    images: Object.fromEntries(views.map((v) => [v, `/store/decks/${id}-${v}.webp`])),
  });
}
if (!decks.length) throw new Error('No decks found on the Agent Store page; refusing to write an empty catalogue');

const h = cfg.harness || {};
const b = cfg.bundle || {};
const data = {
  synced: new Date().toISOString(),
  harness: {
    version: versions.harness || '',
    lede,
    points,
    price_usd: h.price_usd > 0 ? h.price_usd : null,
    buy_url: h.price_usd > 0 && /^https:\/\//.test(h.buy_url || '') ? h.buy_url : null,
  },
  bundle: { price_usd: b.price_usd > 0 ? b.price_usd : null, buy_url: b.price_usd > 0 && /^https:\/\//.test(b.buy_url || '') ? b.buy_url : null },
  decks,
};

/* Public copy: no long dashes (Jordan's rule) and no local paths. */
const flat = JSON.stringify(data);
if (dash.test(flat)) throw new Error('A long dash is in the deck copy; fix it in Agent Decks and rebuild the Agent Store first');
if (/\/Users\/|jordanlarsen/i.test(flat)) throw new Error('A local path is in the deck copy; refusing');

fs.mkdirSync(imgDir, { recursive: true });
let copied = 0;
for (const d of decks) for (const v of Object.keys(d.images)) {
  fs.copyFileSync(path.join(store, 'site/assets', `${d.id}-${v}.webp`), path.join(imgDir, `${d.id}-${v}.webp`));
  copied++;
}
fs.writeFileSync(out, JSON.stringify(data, null, 1) + '\n');
console.log(`synced ${decks.length} decks, harness ${data.harness.version}, ${copied} images -> ${path.relative(site, out)}`);
