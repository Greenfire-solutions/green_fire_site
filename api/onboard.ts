import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import { writeIntake, writeLead, readSettings } from './_lib/storage.js';
import { SECTIONS, ACTIVATION, type Question } from './_lib/onboardQuestions.js';
import { activatePage } from './_lib/activatePage.js';
import { esc, wizardPage } from './_lib/wizard.js';
import { notify } from './_lib/notify.js';
import { READINESS, READINESS_QUESTIONS, type RQ } from './_lib/readinessQuestions.js';
import { shows, analyse, type Given } from './_lib/readiness.js';

/* /onboard : the onboarding form. Jordan copies the link from the Clients tab
   of the Greenfire operator (or Pip sends it in a welcome) and the person
   fills it in on their phone. `?for=workshop|onboarding|build|team` picks the
   session up front.

   It replaces the Google Form: `intake_form_url` in startOffers.json points
   here, so /start/thanks, Pip and the Clients tab all send this page.

   Answers are sealed exactly like a /start sign-up (storage.ts) and read back
   only by /api/admin/intakes, behind the admin password.

   /activate is served here too (vercel.json adds ?form=activation): the AI
   Activation prep page in _lib/activatePage.ts. Its answers are stored the
   same way with offer `activation`. */

type Offer = { id: string; title: string; when?: string; unit?: string };

/* The page lists /start's offers plus any private one a /start card sells
   (the one to one way to take the $500 class, its `alt`), so that buyer can
   pick theirs. `all` adds every offer sold by hand, for checking a reply. */
function offers(all = false): Offer[] {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'src/data/startOffers.json'), 'utf8'));
    const sold = new Set((raw.offers || []).map((o: { alt?: { offer?: string } }) => o.alt?.offer).filter(Boolean));
    const priv = (raw.private_offers || []).filter((o: Offer) => all || sold.has(o.id));
    return [...(raw.offers || []), ...priv].map((o: Offer) => ({ id: o.id, title: o.title, when: o.when, unit: o.unit }));
  } catch {
    return [];
  }
}

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const line = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const text = (v: unknown, n: number) => String(v ?? '').replace(/\r/g, '').trim().slice(0, n);
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
    if (req.query.form === 'activation') {
      /* Short cache: the kit link changes from the operator without a deploy. */
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
      return res.status(200).send(req.method === 'HEAD' ? '' : activatePage(await readSettings()));
    }
    if (req.query.form === 'readiness') {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).send(req.method === 'HEAD' ? '' : readinessPage(offers()));
    }
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(req.method === 'HEAD' ? '' : page(offers()));
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let b: Record<string, unknown> = {};
  try {
    b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;
  } catch {
    return res.status(400).json({ error: 'That did not go through. Please try again.' });
  }
  if (line(b.website_hp, 200)) return res.status(200).json({ ok: true });
  if (b.form === 'readiness') return readiness(b, res);

  const name = line(b.name, 120);
  const email = line(b.email, 160).toLowerCase();
  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
  const activation = b.form === 'activation';
  const known = offers(true).map((o) => o.id);
  const offer = activation ? 'activation' : known.includes(String(b.offer)) ? String(b.offer) : 'unsure';
  if (activation && !line(b.business, 160)) return res.status(400).json({ error: 'Please add the name of your business or project.' });

  const given = (b.answers || {}) as Record<string, unknown>;

  /* The page sends this once, when someone finishes the second step. It is a
     sign-up in its own right: stored as a lead, so the operator puts the
     person in the pipeline even if they never finish the rest. */
  if (b.partial && !activation) {
    const all = SECTIONS.flatMap((s) => s.questions);
    const pick = (id: string) => { const q = all.find((x) => x.id === id); return q ? answerOf(q, given[id]) : ''; };
    const title = offers(true).find((o) => o.id === offer)?.title;
    const message = [
      'Started the onboarding form.',
      title ? `Interested in: ${title}.` : '',
      pick('timing') ? `Wants to start: ${pick('timing')}.` : '',
      pick('heard') ? `Found Greenfire through: ${pick('heard')}.` : '',
      pick('reach') ? `Best way to reach them: ${pick('reach')}.` : '',
    ].filter(Boolean).join(' ');
    try {
      await writeLead({
        at: new Date().toISOString(), name, email, offer, business: '', phone: line(b.phone, 40),
        message, who: 'individual', where: 'online', team_size: '', source: 'onboarding form',
      });
      await notify(`Onboarding form started: ${name}`, [`${name} <${email}>`, line(b.phone, 40) ? `Phone: ${line(b.phone, 40)}` : '', message, '', 'They are in your pipeline now. This is the early save; the full form may follow.'].filter((x) => x !== '').join('\n'));
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Could not save that just now.' });
    }
  }

  const questions = activation ? ACTIVATION : SECTIONS.flatMap((s) => s.questions);
  const answers = questions.map((q) => ({ id: q.id, label: q.label, value: answerOf(q, given[q.id]) }));
  const missing = questions.filter((q) => q.required && !answers.find((a) => a.id === q.id)?.value);
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
      source: activation ? 'activate' : 'onboard',
    });
    const say = (id: string) => String(answers.find((a) => a.id === id)?.value || '');
    await notify(`${activation ? 'Activation form' : 'Onboarding form'} finished: ${name}`, [
      `${name} <${email}>`, line(b.phone, 40) ? `Phone: ${line(b.phone, 40)}` : '', line(b.business, 160) ? `Business: ${line(b.business, 160)}` : '', line(b.site, 200) ? `Site: ${line(b.site, 200)}` : '',
      `Package: ${offer}`, say('timing') ? `Wants to start: ${say('timing')}` : '', say('heard') ? `Found you through: ${say('heard')}` : '', say('reach') ? `Best way to reach: ${say('reach')}` : '',
      say('one_task') ? `First job: ${say('one_task')}` : '', say('week') ? `Their work: ${say('week').slice(0, 400)}` : '', '', 'The full answers load into the Clients tab on your Mac.'].filter((x) => x !== '').join('\n'));
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Could not save that just now. Please try again in a minute, or email civilizationexplorer@gmail.com.' });
  }
}

/* The readiness form: filled in after a person has chosen a package. Every
   answer is cleaned against its own question, a question that did not show is
   never asked of the server either, and what comes back is the person's own
   to-do list. The whole picture (scores, tools, flags) is stored with the answers
   for the operator. */
const rClean = (q: RQ, v: unknown): string | string[] => {
  const ok = (q.choices || []).map((c) => c.v);
  if (q.kind === 'one') return ok.includes(String(v)) ? String(v) : '';
  if (q.kind === 'many') return (Array.isArray(v) ? v : []).map(String).filter((x) => ok.includes(x));
  return q.kind === 'long' ? text(v, 3000) : line(v, q.id === 'tz' ? 60 : 400);
};

async function readiness(b: Record<string, unknown>, res: VercelResponse) {
  const name = line(b.name, 120);
  const email = line(b.email, 160).toLowerCase();
  const business = line(b.business, 160);
  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please check your email address.' });
  if (!business) return res.status(400).json({ error: 'Please add the name of your business or project.' });
  const offer = String(b.offer);
  if (!offers().some((o) => o.id === offer)) return res.status(400).json({ error: 'Please tap the package you chose.' });

  const given = (b.answers || {}) as Record<string, unknown>;
  const clean: Given = {};
  const hidden = new Set<string>();
  const answers: { id: string; label: string; value: string | string[] }[] = [];
  for (const q of READINESS_QUESTIONS) {
    if (!shows(q, clean, hidden)) { hidden.add(q.id); continue; }
    const v = rClean(q, given[q.id]);
    clean[q.id] = v;
    const empty = Array.isArray(v) ? !v.length : !v;
    if (q.required && empty) return res.status(400).json({ error: `Please answer: ${q.label}` });
    if (!empty) answers.push({ id: q.id, label: q.label, value: v });
  }
  const analysis = analyse(clean);
  try {
    await writeIntake({ at: new Date().toISOString(), name, email, offer, phone: '', business, site: line(b.site, 200), answers, analysis, source: 'readiness' });
    await notify(`Readiness form finished: ${name}, ${analysis.pct}% (${analysis.tier})`, [
      `${name} <${email}>`, `Business: ${business}`, line(b.site, 200) ? `Site: ${line(b.site, 200)}` : '', `Package: ${offer}`, `Readiness: ${analysis.pct}%, ${analysis.tier}`,
      ...analysis.areas.map((a) => `  ${a.label}: ${a.pct}%`),
      analysis.flags.length ? `\nWatch:\n${analysis.flags.map((f) => '  ' + f).join('\n')}` : '',
      analysis.systems.length ? `\nCould connect: ${analysis.systems.map((x) => x.tool).join(', ')}` : '',
      '', 'The full report, tools and onboarding plan load onto their card in the Clients tab on your Mac.'].filter((x) => x !== '').join('\n'));
    return res.status(200).json({ ok: true, prep: analysis.prep, headline: analysis.headline, tier: analysis.tier });
  } catch {
    return res.status(500).json({ error: 'Could not save that just now. Please try again in a minute, or email civilizationexplorer@gmail.com.' });
  }
}

/* --- the pages ------------------------------------------------------------
   The look and the walking-through-steps live in _lib/wizard.ts. A form here only
   says what its steps contain and what to tell the person at the end. */

const HEADINGS: Record<string, string> = {
  You: "Let's get you started",
  'What you are after': 'What are you after?',
  'Your work': 'Tell me about your work',
  'Where you are starting from': 'Where you are starting from',
  'Your setup': 'Your setup',
  'Before we meet': 'Last step',
};

type FQ = { id: string; label: string; help?: string; kind: 'one' | 'many' | 'text' | 'long'; choices?: string[]; required?: boolean; placeholder?: string; hidden?: boolean; showIf?: unknown };
function field(q: FQ): string {
  if (q.hidden) return '';
  const cond = q.showIf ? ` data-showif="${esc(JSON.stringify(q.showIf))}" hidden` : '';
  const label = `<span class="q">${esc(q.label)}${q.required ? ' <i>*</i>' : ''}</span>${q.help ? `<small>${esc(q.help)}</small>` : ''}`;
  if (q.kind === 'one' || q.kind === 'many') {
    return `<div class="field" data-q="${q.id}" data-kind="${q.kind}"${q.required ? ' data-required' : ''}${cond}><div class="lbl">${label}</div>
      <div class="chips${(q.choices || []).every((c) => c.length <= 16) ? ' row' : ''}" role="group" aria-label="${esc(q.label)}">${(q.choices || []).map((c) => `<button type="button" class="chip" data-v="${esc(c)}" aria-pressed="false"><span class="mark" aria-hidden="true"></span><span class="t">${esc(c)}</span></button>`).join('')}</div><p class="msg" role="alert"></p></div>`;
  }
  const input = q.kind === 'long'
    ? `<textarea id="q-${q.id}" rows="3"></textarea>`
    : `<input type="text" id="q-${q.id}" placeholder="${esc(q.placeholder || '')}" enterkeyhint="next">`;
  return `<div class="field" data-q="${q.id}" data-kind="text"${q.required ? ' data-required' : ''}${cond}><label for="q-${q.id}">${label}</label>${input}<p class="msg" role="alert"></p></div>`;
}

const textField = (id: string, label: string, opts: { help?: string; required?: boolean; type?: string; ac?: string; mode?: string; ph?: string } = {}) =>
  `<div class="field" data-kind="text"${opts.required ? ' data-required' : ''}><label for="${id}"><span class="q">${esc(label)}${opts.required ? ' <i>*</i>' : ''}</span>${opts.help ? `<small>${esc(opts.help)}</small>` : ''}</label>
  <input type="${opts.type || 'text'}" id="${id}"${opts.ac ? ` autocomplete="${opts.ac}"` : ''}${opts.mode ? ` inputmode="${opts.mode}"` : ''}${opts.ph ? ` placeholder="${esc(opts.ph)}"` : ''} enterkeyhint="next"><p class="msg" role="alert"></p></div>`;


const offerChips = (list: Offer[], q: string, help: string, unsure: boolean) => `<div class="field offer" data-q="offer" data-kind="one"${unsure ? '' : ' data-required'}><div class="lbl"><span class="q">${esc(q)}${unsure ? '' : ' <i>*</i>'}</span><small>${esc(help)}</small></div>
    <div class="chips" role="group" aria-label="${esc(q)}">${list.map((o) => `<button type="button" class="chip" data-v="${esc(o.id)}" aria-pressed="false"><span class="mark" aria-hidden="true"></span><span class="t">${esc(o.title)}${o.when || o.unit ? `<small>${esc(o.when || o.unit)}</small>` : ''}</span></button>`).join('')}
    ${unsure ? '<button type="button" class="chip" data-v="unsure" aria-pressed="false"><span class="mark" aria-hidden="true"></span><span class="t">I am not sure yet<small>Tell me about your work and we will find the fit</small></span></button>' : ''}</div><p class="msg" role="alert"></p></div>`;

const safeNote = (t: string) => `<p class="safe"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z"/></svg>${t}</p>`;

function page(list: Offer[]): string {
  const contact = textField('name', 'Your name', { required: true, ac: 'name' })
    + textField('email', 'Email', { required: true, type: 'email', ac: 'email', mode: 'email' })
    + textField('phone', 'Phone', { help: 'Optional. Only used to text or call you.', type: 'tel', ac: 'tel', mode: 'tel' });
  const work = textField('business', 'Your business or project', { help: 'If you do not have one yet, the thing you want to start.' })
    + textField('site', 'Your website, if you have one', { mode: 'url', ph: 'yourname.com' });
  const top: Record<string, string> = { You: contact, 'What you are after': offerChips(list, 'Which would you like to talk about?', 'Pick the closest one. Nothing is booked or charged here.', true), 'Your work': work };
  const steps = SECTIONS.map((s, i) => `<section class="step" data-step="${i}" data-title="${esc(s.title)}" aria-labelledby="h-${i}"${i ? ' hidden' : ''}>
    <h1 id="h-${i}" tabindex="-1">${esc(HEADINGS[s.title] || s.title)}</h1>
    <p class="intro">${i === 0 ? 'Six short steps, about five minutes. Most answers are a tap.' : esc(s.help || '')}</p>
    ${top[s.title] || ''}${s.questions.map(field).join('')}
    ${i === 0 ? safeNote('Private. Only Jordan reads your answers. Never put passwords, API keys or customer records in here.') : ''}
  </section>`).join('\n');
  return wizardPage({
    key: 'gf-onboard-v2', title: 'Get started', ogTitle: "Let's get you started | Greenfire", ogDesc: 'A few short steps so our time is spent on your work, not on setup.',
    steps, n: SECTIONS.length, partialAt: 1, form: '', submit: 'Send to Jordan',
    doneIntro: 'I read every answer myself.',
    doneList: `<li><b>1</b><span><strong>I read your answers.</strong> Every one, so our time goes to your work and not to setup.</span></li>
    <li><b>2</b><span><strong id="reachline">I will reach out</strong> to set a time that suits you.</span></li>
    <li><b>3</b><span><strong>We meet.</strong> If anything is unclear I will write to you first.</span></li>`,
  });
}

/* /readiness: after they have chosen. Name, email, business, the package, then
   only the questions that matter for what they told us. */
function readinessPage(list: Offer[]): string {
  const you = textField('name', 'Your name', { required: true, ac: 'name' })
    + textField('email', 'Email', { required: true, type: 'email', ac: 'email', mode: 'email' })
    + textField('business', 'Your business or project', { required: true })
    + textField('site', 'Your website address, if you have one', { mode: 'url', ph: 'yourname.com' })
    + offerChips(list, 'Which package did you choose?', 'So I can plan the right build.', false);
  const steps = READINESS.map((s, i) => `<section class="step" data-step="${i}" data-title="${esc(s.title)}" aria-labelledby="h-${i}"${i ? ' hidden' : ''}>
    <h1 id="h-${i}" tabindex="-1">${esc(s.heading)}</h1>
    <p class="intro">${esc(s.help)}</p>
    ${i === 0 ? you : ''}${s.questions.map((q) => field({ ...q, choices: q.choices?.map((c) => c.v) })).join('')}
    ${i === 0 ? safeNote('Private. Only Jordan reads your answers. Never put a password or a key in here. I only ask who holds the logins, never the logins.') : ''}
  </section>`).join('\n');
  return wizardPage({
    key: 'gf-readiness-v1', title: 'Get your build ready', ogTitle: 'Get your AI build ready | Greenfire', ogDesc: 'A few minutes now, so we build your AI system on solid ground.',
    steps, n: READINESS.length, partialAt: -1, form: 'readiness', submit: 'Send to Jordan',
    doneIntro: 'Your answers are in.',
    doneList: `<li><b>1</b><span><strong>I read your answers.</strong> I look at your tools and what each one can connect to.</span></li>
    <li><b>2</b><span><strong>I reach out</strong> to set your first session.</span></li>
    <li><b>3</b><span><strong>We build on solid ground.</strong> Whatever is on your list above, tidy what you can before we meet.</span></li>`,
  });
}
