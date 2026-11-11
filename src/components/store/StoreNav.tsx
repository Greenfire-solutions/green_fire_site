import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppWindow, Bot, Layers, X } from 'lucide-react';

/* The store's three sections (2026-11-11). One list, read by the lobby's
   doors and by the switcher at the top of every section, so a fourth
   section is one line here. */
export const STORE_SECTIONS = [
  { key: 'apps', path: '/store/apps', label: 'Apps', icon: AppWindow, accent: '#34d399', line: 'Whole working apps, as code you own' },
  { key: 'harnesses', path: '/store/harnesses', label: 'Harnesses', icon: Layers, accent: '#f472b6', line: 'Agent decks: a harness and a beautiful command center' },
  { key: 'bots', path: '/store/bots', label: 'Bots', icon: Bot, accent: '#38bdf8', line: 'Single agents, skills and tools' },
] as const;
export type StoreSectionKey = (typeof STORE_SECTIONS)[number]['key'];

export function StoreNav({ current, tone = 'dark' }: { current: StoreSectionKey; tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <div className={`relative z-20 border-b px-4 md:px-8 ${light ? 'border-black/5 bg-white/60 backdrop-blur' : 'border-white/5 bg-neutral-950'}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto py-2.5 [scrollbar-width:none]">
        <Link to="/store" className={`shrink-0 text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-neutral-500 hover:text-neutral-900' : 'text-stone-500 hover:text-white'}`}>
          Store
        </Link>
        <span className={light ? 'text-neutral-300' : 'text-stone-700'}>/</span>
        <nav className={`flex shrink-0 gap-1 rounded-full p-1 ${light ? 'bg-black/[0.04]' : 'bg-white/[0.04]'}`} aria-label="Store sections">
          {STORE_SECTIONS.map((s) => {
            const on = s.key === current;
            const Icon = s.icon;
            return (
              <Link
                key={s.key}
                to={s.path}
                aria-current={on ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  on ? (light ? 'bg-white text-neutral-900 shadow-sm' : 'bg-white text-neutral-950') : light ? 'text-neutral-500 hover:text-neutral-900' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Icon size={14} style={on ? { color: s.accent } : undefined} />
                {s.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* "Get first access" for anything without a checkout yet. It files a lead
   through the same /api/store reserve action the app store uses, so it lands
   in the Greenfire operator like every other store request. */
export function AccessForm({ item, section, note, onClose }: { item: string; section: 'harness' | 'bot'; note?: string; onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    try {
      const r = await fetch('/api/store?action=reserve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: f.get('name'), email: f.get('email'), business: f.get('business'), website: f.get('website'), want: 'notify', app: `${section}: ${item}`, message: '' }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not send that.');
      setState('done');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not send that.');
      setState('error');
    }
  };
  const field = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-white/40 focus:outline-none';
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${item}: first access`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-white">{item}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-white/5" aria-label="Close"><X size={18} /></button>
        </div>
        {state === 'done' ? (
          <div className="mt-4">
            <p className="text-sm text-stone-200">You are on the list. One email when {item} opens, nothing else.</p>
            <button onClick={onClose} className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-950">Back to the store</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <p className="text-sm text-stone-300">{note || 'Opening soon. Leave your email and you will be first in, with one email when it opens.'}</p>
            <input name="name" required autoFocus autoComplete="name" placeholder="Your name" className={field} />
            <input name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
            <input name="business" placeholder="Your business or project (optional)" className={field} />
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {state === 'error' && <p className="text-sm text-rose-300">{msg}</p>}
            <button disabled={state === 'sending'} className="w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-stone-200 disabled:opacity-60">
              {state === 'sending' ? 'Sending...' : 'Get first access'}
            </button>
            <p className="text-center text-[11px] text-stone-500">No payment now. Your email is only used to reach you about this.</p>
          </form>
        )}
      </div>
    </div>
  );
}
