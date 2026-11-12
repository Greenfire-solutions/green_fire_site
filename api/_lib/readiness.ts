/* READINESS, worked out from the answers. One pure function, no storage, so the
   page's server, the operator's test and Jordan's report all read one result.
   The rules are on the questions themselves (readinessQuestions.ts): this file only
   adds them up. */
import { AREAS, READINESS_QUESTIONS, type AreaKey, type RQ, type ShowIf, type Effort } from './readinessQuestions.js';

export type Given = Record<string, string | string[] | undefined>;
export type Tier = 'ready' | 'almost' | 'foundation';
export type AreaScore = { key: AreaKey; label: string; score: number; max: number; pct: number };
export type Analysis = {
  pct: number;
  tier: Tier;
  headline: string;
  areas: AreaScore[];
  prep: string[];                                    // what they are told to gather, most important first
  systems: { tool: string; what: string; effort: Effort }[]; // what could be connected
  facts: Record<string, string>;                     // plain answers the onboarding plan is built from
  flags: string[];                                   // for Jordan: what to watch
};

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v ? [String(v)] : []);

/** Does this answer satisfy a showIf rule? A hidden question counts as unanswered. */
export function shows(q: RQ, given: Given, hidden: Set<string>): boolean {
  const r: ShowIf | undefined = q.showIf;
  if (!r) return true;
  if (hidden.has(r.q)) return false;
  const p = arr(given[r.q]);
  if (!p.length) return false;
  return p.some((x) => (r.in ? r.in.includes(x) : !(r.notin || []).includes(x)));
}

/** The questions this person actually sees, in order. */
export function visible(given: Given): RQ[] {
  const hidden = new Set<string>();
  const out: RQ[] = [];
  for (const q of READINESS_QUESTIONS) {
    if (shows(q, given, hidden)) out.push(q);
    else hidden.add(q.id);
  }
  return out;
}

const WEIGHT: AreaKey[] = ['web', 'foundation', 'tools', 'money', 'people', 'ready'];

export function analyse(given: Given): Analysis {
  const seen = visible(given);
  const sums = new Map<AreaKey, { score: number; max: number }>();
  const todos: { text: string; area: number }[] = [];
  const sys = new Map<string, { tool: string; what: string; effort: Effort }>();
  const facts: Record<string, string> = {};
  const add = (a: AreaKey, score: number, max: number) => {
    const s = sums.get(a) || { score: 0, max: 0 };
    sums.set(a, { score: s.score + score, max: s.max + max });
  };
  const want = (text: string, area?: AreaKey) => { if (!todos.some((t) => t.text === text)) todos.push({ text, area: area ? WEIGHT.indexOf(area) : 9 }); };

  for (const q of seen) {
    const picked = arr(given[q.id]);
    if (q.fact && picked.length) facts[q.fact] = picked.join(', ');
    if (!q.choices) continue;
    const chosen = q.choices.filter((c) => picked.includes(c.v));
    for (const c of chosen) {
      if (c.todo) want(c.todo, q.area);
      if (c.sys) sys.set(c.v, { tool: c.v, what: c.sys.what, effort: c.sys.effort });
    }
    if (q.area && picked.length) {
      if (q.kind === 'one') add(q.area, chosen[0]?.s ?? 0, 3);
      else {
        const positive = chosen.reduce((n, c) => n + (c.s || 0), 0);
        add(q.area, Math.min(3, positive), 3);
        if (q.fewTodo && q.fewBelow && positive < q.fewBelow && !chosen.some((c) => c.todo)) want(q.fewTodo, q.area);
      }
    }
  }

  const areas: AreaScore[] = WEIGHT.filter((k) => sums.has(k)).map((k) => {
    const s = sums.get(k)!;
    return { key: k, label: AREAS[k], score: s.score, max: s.max, pct: s.max ? Math.round((s.score / s.max) * 100) : 0 };
  });
  const total = areas.reduce((n, a) => n + a.score, 0), max = areas.reduce((n, a) => n + a.max, 0);
  const pct = max ? Math.round((total / max) * 100) : 0;
  /* One area at nothing holds the whole build back, however good the rest is. */
  const hole = areas.some((a) => a.pct === 0);
  const tier: Tier = pct >= 75 && !hole ? 'ready' : pct >= 50 ? 'almost' : 'foundation';
  const headline = tier === 'ready' ? 'You are in good shape to build. Here is what to have to hand.'
    : tier === 'almost' ? 'You are close. A few things to tidy first will make the build smooth.'
      : 'Good news: we will organise the foundation first, so what we build holds.';

  const flags: string[] = [];
  if (facts.has_site === 'No website yet') flags.push('No website: a domain and a simple site come before anything AI.');
  if (/cannot find|Someone else holds|do not know/i.test(facts.domain_access || '')) flags.push('Domain access is not theirs yet: sort this before connecting anything.');
  if (facts.hours === 'Under one hour') flags.push('Under an hour a week: the timeline will stretch, say so now.');
  if (facts.when === 'Within a month' && pct < 60) flags.push('Wants it within a month but is not ready: reset the expectation.');
  if (facts.budget === 'Not decided yet') flags.push('No budget decided: only Jordan quotes, so shape the options on the call.');
  if (/partner|board/i.test(facts.decider || '')) flags.push('Others decide too: get them into the first session.');
  if (/None of these are written down/.test(facts.docs || '')) flags.push('Nothing written down: start with a foundation pass.');
  if (areas.find((a) => a.key === 'tools')?.pct === 0 || /Nowhere/.test(facts.customers || '')) flags.push('No customer list anywhere: the first build may be the list itself.');
  if (facts.public_ok === 'I would rather you did not') flags.push('Asked you not to look at their public pages.');

  return {
    pct, tier, headline, areas,
    prep: todos.sort((a, b) => a.area - b.area).map((t) => t.text).slice(0, 7),
    systems: [...sys.values()].sort((a, b) => ['easy', 'medium', 'manual'].indexOf(a.effort) - ['easy', 'medium', 'manual'].indexOf(b.effort)),
    facts, flags,
  };
}
