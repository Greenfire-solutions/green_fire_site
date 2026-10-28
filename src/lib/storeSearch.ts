/* STORE SEARCH (2026-10-27). A visitor types what they do or what they want,
   in their own words ("I'm a DJ and need more gigs", "make reels from my
   clips", "run my farm"), and the matching apps come up while they type.

   Runs entirely in the browser over the catalogue already loaded: no server
   call, so it is instant and costs no Vercel function. The words it matches
   come from each app's tags (who it is for, what it does, the plain phrases
   people search), written by the operator's store-tags.mjs from the app's
   README, plus its title, line and bio.

   How a match is scored:
     a whole tag phrase found in the query   strongest (two words or more)
     a word matching a word                  weighted by where it was found
     a word still being typed (prefix)       a little less
     a word one typo away                    less again
   Words are compared by a rough stem, so booking, booked and bookings all
   meet "book", and a short list of everyday synonyms widens the query. */

export type Tags = { who?: string[]; does?: string[]; words?: string[] };
export type Searchable = { id: string; title: string; line: string; bio: string; genre: string; tags?: Tags | null };
export type Hit<T> = { app: T; score: number; why: string[] };

/* Words that carry no meaning in a search like "I need an app to help me ...". */
const STOP = new Set(
  'i im i\'m me my mine we our us you your a an the and or but to for of in on at by with from into about as is are am be been being do does did have has had can could would should will want wants need needs needing looking look help helps something some thing things app apps tool tools software program way get got make makes making stuff really just like so that this it its who what how where when which run running'
    .split(' '),
);
/* "get" and "make" are stop words alone, but count inside a tag phrase
   ("get gigs", "make reels"), which is matched before words are dropped. */

/* Everyday words mapped to the words the tags use. Kept short on purpose:
   the tags already carry most synonyms, this only bridges the gaps. */
const SYN: Record<string, string[]> = {
  gig: ['booking', 'show', 'event'],
  gigs: ['booking', 'show', 'event'],
  reel: ['video', 'instagram', 'short'],
  reels: ['video', 'instagram', 'short'],
  tiktok: ['video', 'short'],
  clip: ['video'],
  clips: ['video'],
  film: ['video'],
  edit: ['video', 'editing'],
  post: ['posting', 'social'],
  posts: ['posting', 'social'],
  social: ['posting', 'instagram'],
  song: ['music', 'track'],
  songs: ['music', 'track'],
  beat: ['music', 'beat sync'],
  beats: ['music', 'beat sync'],
  producer: ['music', 'producer'],
  band: ['musician'],
  singer: ['musician'],
  farm: ['farmer', 'grow', 'crop'],
  garden: ['grow', 'permaculture'],
  land: ['property', 'site'],
  house: ['home', 'build'],
  construction: ['builder', 'contractor', 'site'],
  festival: ['event', 'festival'],
  party: ['event'],
  wedding: ['event'],
  retreat: ['retreat', 'event'],
  money: ['invoice', 'payments', 'pricing'],
  pay: ['payments', 'invoice'],
  paid: ['payments', 'invoice'],
  email: ['email', 'inbox'],
  emails: ['email', 'inbox'],
  ai: ['ai', 'assistant', 'claude'],
  chatgpt: ['ai', 'assistant'],
  kid: ['kids', 'children', 'story'],
  kids: ['children', 'story'],
  airbnb: ['rental', 'host', 'guest'],
  rental: ['host', 'guest'],
  customers: ['clients'],
  customer: ['clients'],
  schedule: ['scheduling', 'calendar'],
  calendar: ['scheduling'],
  website: ['site', 'page'],
};

/* A rough stem: enough to make plural, -ing and -ed forms meet. */
export function stem(w: string): string {
  let s = w.toLowerCase();
  if (s.length > 5 && s.endsWith('ings')) s = s.slice(0, -4);
  else if (s.length > 4 && s.endsWith('ing')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.length > 4 && s.endsWith('ers')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('er')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith('es') && /(ss|sh|ch|x)es$/.test(s)) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  return s;
}

const words = (t: string) => t.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const stems = (t: string) => words(t).map(stem);

/* One typo: a letter added, dropped or changed, or two letters swapped. */
function oneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const d = [...a].flatMap((c, i) => (c === b[i] ? [] : [i]));
    if (d.length === 2 && d[1] === d[0] + 1 && a[d[0]] === b[d[1]] && a[d[1]] === b[d[0]]) return true;
  }
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

type Field = { w: number; label: boolean; phrases: { text: string; stems: string[] }[]; bag: Set<string> };

/* Where a word was found decides how much it counts. Tags are labelled so a
   phrase match can be shown as the reason an app came up. */
function index(a: Searchable, genreLabel: string): Field[] {
  const f = (w: number, label: boolean, list: string[]): Field => {
    const phrases = list.filter(Boolean).map((text) => ({ text, stems: stems(text) }));
    return { w, label, phrases, bag: new Set(phrases.flatMap((p) => p.stems)) };
  };
  const t = a.tags || {};
  return [
    f(7, false, [a.title]),
    f(5, true, t.who || []),
    f(4, true, t.does || []),
    f(3, true, t.words || []),
    f(2, false, [genreLabel, a.line]),
    f(1, false, [a.bio]),
  ];
}

const cache = new WeakMap<object, Field[]>();

export function search<T extends Searchable>(apps: T[], query: string, genreLabel: (g: string) => string = () => ''): Hit<T>[] {
  const all = stems(query);
  if (!all.length) return [];
  const qs = ` ${all.join(' ')} `;
  /* The query words that mean something, widened by synonyms (a synonym
     counts for a little less than the word itself). */
  const core = [...new Set(words(query).filter((w) => !STOP.has(w)))];
  const terms: { s: string; weight: number; last: boolean }[] = [];
  const lastWord = words(query).at(-1) || '';
  const typing = !/\s$/.test(query);
  for (const w of core) {
    terms.push({ s: stem(w), weight: 1, last: typing && w === lastWord });
    for (const syn of SYN[w] || SYN[stem(w)] || []) for (const s of stems(syn)) terms.push({ s, weight: 0.6, last: false });
  }
  const seen = new Set<string>();
  const uniq = terms.filter((t) => (seen.has(t.s) ? false : (seen.add(t.s), true)));
  const wanted = core.length;

  const hits: Hit<T>[] = [];
  for (const a of apps) {
    let fields = cache.get(a);
    if (!fields) cache.set(a, (fields = index(a, genreLabel(a.genre))));
    let score = 0;
    const why: { text: string; w: number }[] = [];

    /* Whole tag phrases inside the query: "beat sync", "get more gigs". Only
       phrases of two words or more: a one-word tag is already counted word
       by word, and doubling it let "podcaster" outrank Podcast Booking. */
    for (const f of fields) {
      if (!f.label) continue;
      for (const p of f.phrases) {
        if (p.stems.length < 2) continue;
        const allStop = p.stems.every((s) => STOP.has(s));
        if (allStop) continue;
        if (qs.includes(` ${p.stems.join(' ')} `)) {
          const bonus = f.w * (1 + p.stems.length * 0.5);
          score += bonus;
          why.push({ text: p.text, w: bonus });
        }
      }
    }

    /* Word by word: each meaningful query word takes its best field. */
    let matched = 0;
    for (const t of uniq) {
      let best = 0, bestWhy = '';
      for (const f of fields) {
        let m = 0;
        if (f.bag.has(t.s)) m = f.w;
        else if (t.last && t.s.length >= 2) { for (const b of f.bag) if (b.startsWith(t.s)) { m = f.w * 0.7; break; } }
        if (!m && t.s.length >= 5) { for (const b of f.bag) if (b.length >= 5 && oneEdit(t.s, b)) { m = f.w * 0.5; break; } }
        if (m > best) {
          best = m;
          bestWhy = f.label ? f.phrases.find((p) => p.stems.some((s) => s === t.s || s.startsWith(t.s) || (t.s.length >= 5 && oneEdit(t.s, s))))?.text || '' : '';
        }
      }
      if (best) {
        score += best * t.weight;
        if (t.weight === 1) matched++;
        if (bestWhy) why.push({ text: bestWhy, w: best * t.weight });
      }
    }
    if (!score) continue;
    /* An app that answers every part of the query beats one that answers one
       part loudly. */
    if (wanted > 1) score *= 0.5 + (0.5 * matched) / wanted;
    const reasons = [...new Map(why.sort((x, y) => y.w - x.w).map((r) => [r.text, r])).keys()].slice(0, 3);
    hits.push({ app: a, score, why: reasons });
  }
  hits.sort((x, y) => y.score - x.score);
  if (!hits.length) return hits;
  /* Drop the long tail: anything far below the best match is noise. */
  const floor = Math.max(2, hits[0].score * 0.18);
  return hits.filter((h) => h.score >= floor);
}

/* Starting points to show under an empty box: real tags, most common first. */
export function suggestions(apps: Searchable[], n = 6): string[] {
  const count = new Map<string, number>();
  for (const a of apps) for (const t of a.tags?.who || []) count.set(t, (count.get(t) || 0) + 1);
  return [...count.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, n).map(([t]) => t);
}
