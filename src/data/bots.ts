/* The Bots shelf on /store/bots (2026-11-11): single agents, skills and
   tools, sold one at a time.

   Agents and skills come from src/data/botsCatalog.json, which the
   operator writes (_TOOLS/operator/store-bots.mjs catalog) from the generic
   bot sources in _TOOLS/bots/src. Never edit that JSON by hand. A bot gets a
   buy_url only when its zip is on the download shelf AND its Stripe link
   charges exactly its price, so nothing is sold that cannot be delivered.
   Prices (Jordan, 2026-11-11): skills $19, agents $29, every bot $99.

   Tools are the harness's own parts. They are listed here, not sold alone
   yet (they belong to the harness build), so they show Get first access. */
import catalog from './botsCatalog.json';

export type BotKind = 'agent' | 'skill' | 'tool';
export type BotItem = {
  id: string;
  kind: BotKind;
  name: string;
  line: string;
  does: string[];
  works_with: string;
  icon: string;
  price_usd?: number | null;
  buy_url?: string | null;
  /* Also inside the harness on /store/harnesses. */
  in_harness?: boolean;
};

export const BOT_KINDS: Record<BotKind, { label: string; plural: string; blurb: string; color: string }> = {
  agent: { label: 'Agent', plural: 'Agents', blurb: 'A specialist you hand a job to. It works, checks itself and reports back with a clear verdict.', color: '#38bdf8' },
  skill: { label: 'Skill', plural: 'Skills', blurb: 'Know-how your AI loads when the task calls for it, so it does that kind of work the proven way.', color: '#a78bfa' },
  tool: { label: 'Tool', plural: 'Tools', blurb: 'The harness parts, one small program each. Sold alone soon; today they come inside the harness.', color: '#fbbf24' },
};

const TOOLS: BotItem[] = [
  { id: 'approval-gateway', kind: 'tool', name: 'Approval Gateway', line: 'Your agent can only propose. Nothing goes out until you say yes.', does: ['Each yes is tied to the exact content', 'Approvals expire and run once', 'A plain owner tool to say yes or no'], works_with: 'Any agent build', icon: 'CircleCheckBig', in_harness: true },
  { id: 'fact-record', kind: 'tool', name: 'Fact Record', line: 'One file of what is true: prices, dates, links. Stale values get caught before work ships.', does: ['One place for every business fact', 'A check names any stale value', 'Agents read it instead of guessing'], works_with: 'Any agent build', icon: 'BookCheck', in_harness: true },
  { id: 'self-heal-watcher', kind: 'tool', name: 'Self-Heal Watcher', line: 'Finds what really happened when an answer got lost, and repairs what is safe to repair.', does: ['Restores a broken record from backup', 'Expires stale approvals', 'Never approves, sends or retries on its own'], works_with: 'Any agent build', icon: 'Wrench', in_harness: true },
  { id: 'deck-feed', kind: 'tool', name: 'Deck Feed', line: 'Connects your own agents to any agent deck, so you can watch them work.', does: ['One small read-only feed', 'Works with every deck in the store', 'Rejects anything that looks like a secret'], works_with: 'Any agent build', icon: 'Cable', in_harness: true },
];

export const BOTS: BotItem[] = [...(catalog.bots as BotItem[]), ...TOOLS];
export const BUNDLE = catalog.bundle as { name: string; line: string; price_usd: number; count: number; buy_url: string | null };
