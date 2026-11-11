/* The Bots shelf on /store/bots (2026-11-11): single agents, skills and
   tools, sold one at a time. This is the one home of the list: edit an entry
   here and the page and the lobby follow.

   Every entry is something Jordan already runs on his own projects. None has
   a price yet, so each shows "Get first access", which files a lead through
   /api/store. When one is priced, set price_usd and buy_url (a Stripe
   payment link) and it shows a Buy button. Never type a price that Jordan
   has not set. Public copy: no long dashes. */

export type BotKind = 'agent' | 'skill' | 'tool';
export type BotItem = {
  id: string;
  kind: BotKind;
  name: string;
  line: string;
  does: string[];
  works_with: string;
  icon: string; // a lucide icon name, mapped in StoreBotsPage
  price_usd?: number | null;
  buy_url?: string | null;
  /* Also inside the harness on /store/harnesses. */
  in_harness?: boolean;
};

export const BOT_KINDS: Record<BotKind, { label: string; plural: string; blurb: string; color: string }> = {
  agent: { label: 'Agent', plural: 'Agents', blurb: 'A specialist you hand a job to. It works, checks itself and reports back with a clear verdict.', color: '#38bdf8' },
  skill: { label: 'Skill', plural: 'Skills', blurb: 'Know-how your AI loads when the task calls for it, so it does that kind of work the proven way.', color: '#a78bfa' },
  tool: { label: 'Tool', plural: 'Tools', blurb: 'One small program that does one thing well, for any agent build or none at all.', color: '#fbbf24' },
};

export const BOTS: BotItem[] = [
  {
    id: 'button-prover',
    kind: 'agent',
    name: 'Button Prover',
    line: 'Presses every button in your web app and tells you which ones do nothing.',
    does: ['Clicks every control in a real browser', 'Checks the change reached the server and came back', 'Works on a copy, never your live data'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'MousePointerClick',
  },
  {
    id: 'change-warden',
    kind: 'agent',
    name: 'Change Warden',
    line: 'Reads every change before you trust it and answers Block, Fix first or Pass.',
    does: ['Diffs what changed against what used to work', 'Hunts the mistakes your project has already paid for', 'Changes no files, only reports'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'ShieldCheck',
  },
  {
    id: 'health-check',
    kind: 'agent',
    name: 'Health Check',
    line: 'Checks what really ran against what was supposed to run, every morning.',
    does: ['Reads the real logs, not a green dot', 'Finds the jobs that quietly stopped', 'Plain report: working, degraded or broken'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'HeartPulse',
  },
  {
    id: 'filter-reviewer',
    kind: 'agent',
    name: 'Filter Reviewer',
    line: 'Finds the filter that silently throws away your best leads.',
    does: ['Runs every filter against your real records', 'Shows what it dropped that it should have kept', 'Catches gates that are open by default'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'Filter',
  },
  {
    id: 'human-voice',
    kind: 'skill',
    name: 'Human Voice',
    line: 'The last pass on anything your AI writes, so it reads like you typed it.',
    does: ['Strips the tells that say a machine wrote it', 'Never changes a fact, price, date or link', 'Runs on emails, captions, posts and pages'],
    works_with: 'Any AI that can load a skill file',
    icon: 'PenLine',
  },
  {
    id: 'prove-the-page',
    kind: 'skill',
    name: 'Prove the Page Runs',
    line: 'Your AI stops saying "it works" until the page has actually loaded and rendered.',
    does: ['Opens the page in a real headless browser', 'Fails on blank screens and console errors', 'Checks every inline script compiles'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'MonitorCheck',
  },
  {
    id: 'measured-not-inferred',
    kind: 'skill',
    name: 'Measured, Not Guessed',
    line: 'Keeps the numbers your AI measured apart from the ones it estimated.',
    does: ['Every figure says where it came from', 'Refuses a number too thin to support', 'Made for reports, pitches and prices'],
    works_with: 'Any AI that can load a skill file',
    icon: 'Ruler',
  },
  {
    id: 'service-identity',
    kind: 'skill',
    name: 'Right App, Every Time',
    line: 'Stops your tools from talking to the wrong app when several run on one computer.',
    does: ['Each local app proves who it is first', 'Tests can never hit your live data by mistake', 'Ships a probe and a test that proves it'],
    works_with: 'Claude Code and similar agent tools',
    icon: 'Fingerprint',
  },
  {
    id: 'approval-gateway',
    kind: 'tool',
    name: 'Approval Gateway',
    line: 'Your agent can only propose. Nothing goes out until you say yes.',
    does: ['Each yes is tied to the exact content', 'Approvals expire and run once', 'A plain owner tool to say yes or no'],
    works_with: 'Any agent build',
    icon: 'CircleCheckBig',
    in_harness: true,
  },
  {
    id: 'fact-record',
    kind: 'tool',
    name: 'Fact Record',
    line: 'One file of what is true: prices, dates, links. Stale values get caught before work ships.',
    does: ['One place for every business fact', 'A check names any stale value', 'Agents read it instead of guessing'],
    works_with: 'Any agent build',
    icon: 'BookCheck',
    in_harness: true,
  },
  {
    id: 'self-heal-watcher',
    kind: 'tool',
    name: 'Self-Heal Watcher',
    line: 'Finds what really happened when an answer got lost, and repairs what is safe to repair.',
    does: ['Restores a broken record from backup', 'Expires stale approvals', 'Never approves, sends or retries on its own'],
    works_with: 'Any agent build',
    icon: 'Wrench',
    in_harness: true,
  },
  {
    id: 'deck-feed',
    kind: 'tool',
    name: 'Deck Feed',
    line: 'Connects your own agents to any agent deck, so you can watch them work.',
    does: ['One small read-only feed', 'Works with every deck in the store', 'Rejects anything that looks like a secret'],
    works_with: 'Any agent build',
    icon: 'Cable',
    in_harness: true,
  },
];
