import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { SiteContent, OfferingItem, AdminSection } from '../types/content';
import {
  adminLogin, getAdminToken, clearAdminToken, publishSiteContent,
  saveDraftLocally, loadDraftLocally, clearDraftLocally, fetchPublishStatus,
} from '../lib/adminApi';
import { validateContent, newOfferingId, duplicateOffering, ensureMediaShowcases } from '../lib/contentHelpers';
import { PublicPackageCard, OfferingMedia } from '../components/ContentButton';
import { MediaField } from './MediaField';
import bundledContent from '../data/siteContent.json';
import { ICON_OPTIONS } from '../lib/icons';

const SECTIONS: { id: AdminSection; label: string; category?: OfferingItem['category'] }[] = [
  { id: 'settings', label: 'Global Settings' },
  { id: 'home', label: 'Offerings Hero / Home Copy' },
  { id: 'media_showcase', label: 'Media Showcase (YouTube)', category: 'media_showcase' },
  { id: 'packages', label: 'Packages', category: 'service_package' },
  { id: 'cinematic', label: 'Cinematic', category: 'cinematic' },
  { id: 'studio', label: 'Studio', category: 'studio_session' },
  { id: 'workshops', label: 'Workshops', category: 'workshop_topic' },
  { id: 'utah_bolt', label: 'Utah Bolt', category: 'utah_bolt_ideal' },
  { id: 'what_we_offer', label: 'Service Chips (legacy)', category: 'what_we_offer' },
  { id: 'program', label: 'How It Works / Program' },
  { id: 'contact', label: 'Contact / CTAs', category: 'contact_cta' },
];

const BTN_ACTIONS = [
  { value: 'contact_form', label: 'Open contact form' },
  { value: 'internal_page', label: 'Go to internal page' },
  { value: 'external_url', label: 'Open external URL' },
  { value: 'youtube', label: 'Open YouTube / video' },
  { value: 'email', label: 'Send email (mailto)' },
  { value: 'scroll_contact', label: 'Scroll to contact' },
];

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase text-stone-500">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-lg bg-rose-500/20 px-3 text-rose-300 text-sm">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="text-xs text-emerald-400 font-bold">+ Add item</button>
    </div>
  );
}

function OfferingEditor({
  item,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  preview,
}: {
  item: OfferingItem;
  onChange: (o: OfferingItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  preview?: boolean;
}) {
  const set = <K extends keyof OfferingItem>(key: K, val: OfferingItem[K]) => onChange({ ...item, [key]: val });

  if (preview) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 p-4 bg-neutral-900">
        <p className="text-xs text-emerald-400 mb-3 font-bold uppercase">Preview</p>
        <PublicPackageCard offering={item} onBook={() => {}} premium={item.premium} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h4 className="font-bold text-white">{item.title || 'Untitled offering'}</h4>
        <div className="flex gap-1 flex-wrap">
          <button type="button" onClick={onMoveUp} className="px-2 py-1 text-xs bg-white/5 rounded">↑</button>
          <button type="button" onClick={onMoveDown} className="px-2 py-1 text-xs bg-white/5 rounded">↓</button>
          <button type="button" onClick={onDuplicate} className="px-2 py-1 text-xs bg-white/5 rounded text-stone-300">Duplicate</button>
          <button type="button" onClick={onDelete} className="px-2 py-1 text-xs bg-rose-500/20 rounded text-rose-300">Delete</button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input type="checkbox" checked={item.visible} onChange={(e) => set('visible', e.target.checked)} />
        Visible on site
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <input placeholder="Title *" value={item.title} onChange={(e) => set('title', e.target.value)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <input placeholder="Price (e.g. Custom quote or $3,500)" value={item.price} onChange={(e) => set('price', e.target.value)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
      </div>
      <input placeholder="Subtitle" value={item.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
      <textarea placeholder="Description" value={item.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
      <div className="space-y-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <p className="text-xs font-bold uppercase text-emerald-400">Media (YouTube, image, or video link)</p>
        <MediaField
          label="YouTube URL"
          value={item.youtubeUrl || ''}
          onChange={(v) => set('youtubeUrl', v)}
          placeholder="https://www.youtube.com/watch?v=…"
          hint="Paste a YouTube link — it embeds on the Offerings page. Prefer this for Media Showcase."
          allowUpload={false}
        />
        <MediaField
          label="Thumbnail / Image"
          value={item.thumbnailUrl || ''}
          onChange={(v) => set('thumbnailUrl', v)}
          placeholder="https://… or Upload"
          hint="Upload an image (requires Vercel Blob) or paste an image URL."
          previewImage
        />
        <MediaField
          label="Direct video file URL"
          value={item.videoUrl || ''}
          onChange={(v) => set('videoUrl', v)}
          placeholder="https://….mp4"
          hint="Optional: MP4/WebM link or upload."
          accept="video/mp4,video/webm"
        />
      </div>
      {item.icon !== undefined && (
        <select value={item.icon || 'Video'} onChange={(e) => set('icon', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white">
          {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
        </select>
      )}
      <ListEditor label="Includes" items={item.includes} onChange={(v) => set('includes', v)} />
      <ListEditor label="Best for" items={item.bestFor} onChange={(v) => set('bestFor', v)} />
      <ListEditor label="Add-ons" items={item.addOns} onChange={(v) => set('addOns', v)} />
      <div className="border-t border-white/5 pt-4 space-y-3">
        <p className="text-xs font-bold uppercase text-stone-500">Button</p>
        <input placeholder="Button label" value={item.buttonLabel} onChange={(e) => set('buttonLabel', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <select value={item.buttonActionType} onChange={(e) => set('buttonActionType', e.target.value as OfferingItem['buttonActionType'])} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white">
          {BTN_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <input placeholder="Internal page (home, packages, cinematic, studio, workshops, utah-bolt, program, contact)" value={item.internalPage || ''} onChange={(e) => set('internalPage', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <input placeholder="External / video URL" value={item.buttonUrl || ''} onChange={(e) => set('buttonUrl', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <input placeholder="Email recipient" value={item.buttonEmail || ''} onChange={(e) => set('buttonEmail', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <input placeholder="Email subject" value={item.buttonSubject || ''} onChange={(e) => set('buttonSubject', e.target.value)} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <textarea placeholder="Email / contact message body" value={item.buttonMessage || ''} onChange={(e) => set('buttonMessage', e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white" />
      </div>
      {(item.thumbnailUrl || item.youtubeUrl) && (
        <div className="border-t border-white/5 pt-4">
          <OfferingMedia offering={item} />
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-neutral-900 p-8 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Private Admin</p>
          <h1 className="text-2xl font-bold text-white">Green Fire Media Hub</h1>
          <p className="text-sm text-stone-400 mt-2">Enter your admin password to edit site content.</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-400 py-3 font-bold text-neutral-950 disabled:opacity-60">
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p className="text-xs text-stone-500">Password is verified server-side via ADMIN_PASSWORD. Never commit it to the repo.</p>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const [content, setContent] = useState<SiteContent>(bundledContent as SiteContent);
  const [section, setSection] = useState<AdminSection>('settings');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [publishReady, setPublishReady] = useState<boolean | null>(null);
  const [setupSteps, setSetupSteps] = useState<string[]>([]);

  useEffect(() => {
    const draft = loadDraftLocally() as SiteContent | null;
    const base = draft || (bundledContent as SiteContent);
    setContent(ensureMediaShowcases(base));
  }, []);

  useEffect(() => {
    fetchPublishStatus()
      .then((status) => {
        setPublishReady(status.canPublish);
        setSetupSteps(status.setupSteps || []);
      })
      .catch(() => {
        setPublishReady(null);
      });
  }, []);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 8000);
  };

  const updateOffering = (id: string, next: OfferingItem) => {
    setContent((c) => ({ ...c, offerings: c.offerings.map((o) => (o.id === id ? next : o)) }));
  };

  const addOffering = (category: OfferingItem['category']) => {
    const maxOrder = Math.max(0, ...content.offerings.filter((o) => o.category === category).map((o) => o.order));
    const item: OfferingItem = {
      id: newOfferingId(),
      title: 'New Offering',
      description: '',
      price: 'Custom quote',
      category,
      includes: [],
      bestFor: [],
      addOns: [],
      buttonLabel: 'Book Now',
      buttonActionType: 'contact_form',
      internalPage: 'contact',
      featured: false,
      order: maxOrder + 1,
      visible: true,
    };
    setContent((c) => ({ ...c, offerings: [...c.offerings, item] }));
  };

  const deleteOffering = (id: string) => {
    if (!confirm('Delete this offering?')) return;
    setContent((c) => ({ ...c, offerings: c.offerings.filter((o) => o.id !== id) }));
  };

  const moveOffering = (id: string, dir: -1 | 1) => {
    const cat = content.offerings.find((o) => o.id === id)?.category;
    if (!cat) return;
    const list = getVisibleOfferings(content, cat).concat(content.offerings.filter((o) => o.category === cat && !o.visible)).sort((a, b) => a.order - b.order);
    const idx = list.findIndex((o) => o.id === id);
    const swap = list[idx + dir];
    if (!swap) return;
    setContent((c) => ({
      ...c,
      offerings: c.offerings.map((o) => {
        if (o.id === id) return { ...o, order: swap.order };
        if (o.id === swap.id) return { ...o, order: list[idx].order };
        return o;
      }),
    }));
  };

  const handleSave = useCallback(() => {
    const errors = validateContent(content);
    if (errors.length) {
      showMsg('err', errors.join(' '));
      return;
    }
    saveDraftLocally(content);
    showMsg('ok', 'Draft saved locally. Click Publish to push live via GitHub + Vercel.');
  }, [content]);

  const handlePublish = async () => {
    const errors = validateContent(content);
    if (errors.length) {
      showMsg('err', errors.join(' '));
      return;
    }
    setBusy(true);
    try {
      saveDraftLocally(content);
      const result = await publishSiteContent(content);
      clearDraftLocally();
      setPublishReady(true);
      setSetupSteps([]);
      showMsg('ok', result.message || 'Published successfully.');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Publish failed';
      showMsg('err', text);
      fetchPublishStatus()
        .then((status) => {
          setPublishReady(status.canPublish);
          setSetupSteps(status.setupSteps || []);
        })
        .catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    clearAdminToken();
    window.location.href = '/admin';
  };

  const currentSection = SECTIONS.find((s) => s.id === section)!;
  const categoryOfferings = currentSection.category
    ? content.offerings.filter((o) => o.category === currentSection.category).sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 flex flex-col md:flex-row">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-neutral-900 p-4 shrink-0">
        <p className="text-xs font-bold uppercase text-emerald-400 mb-1">CMS</p>
        <p className="font-bold text-white mb-6">Green Fire Admin</p>
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${section === s.id ? 'bg-emerald-500/15 text-emerald-300' : 'text-stone-400 hover:bg-white/5'}`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          <button type="button" onClick={handleSave} className="w-full rounded-lg bg-white/10 py-2 text-sm font-bold">Save Draft</button>
          <button type="button" onClick={handlePublish} disabled={busy} className="w-full rounded-lg bg-emerald-400 py-2 text-sm font-bold text-neutral-950 disabled:opacity-60">
            {busy ? 'Publishing…' : 'Publish Live'}
          </button>
          <button type="button" onClick={logout} className="w-full rounded-lg border border-white/10 py-2 text-sm text-stone-400">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto max-h-screen">
        {publishReady === false && setupSteps.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100 space-y-2">
            <p className="font-bold text-amber-200">One-time setup required to publish live</p>
            {setupSteps.map((step) => (
              <p key={step} className="text-amber-100/90 leading-relaxed">{step}</p>
            ))}
          </div>
        )}
        {message && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${message.type === 'ok' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
            {message.text}
          </div>
        )}

        {section === 'settings' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Global Settings</h2>
            <p className="text-sm text-stone-400">
              Site name, Offerings page hero text, contact email, and footer. Social links appear in the footer when added.
            </p>
            {(['siteTitle', 'siteTagline', 'heroLabel', 'heroHeadline', 'heroSubheadline', 'contactEmail', 'defaultBookingEmail', 'footerTagline', 'footerCopy'] as const).map((key) => (
              <div key={key}>
                <label className="text-xs text-stone-500 uppercase font-bold">{key}</label>
                <input
                  value={content.settings[key]}
                  onChange={(e) => setContent({ ...content, settings: { ...content.settings, [key]: e.target.value } })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
                />
              </div>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-xs font-bold uppercase text-stone-500">Social / external links</p>
              {(content.settings.socialLinks || []).map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Label (e.g. Instagram)"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...content.settings.socialLinks];
                      next[i] = { ...next[i], label: e.target.value };
                      setContent({ ...content, settings: { ...content.settings, socialLinks: next } });
                    }}
                    className="w-1/3 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
                  />
                  <input
                    placeholder="https://…"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...content.settings.socialLinks];
                      next[i] = { ...next[i], url: e.target.value };
                      setContent({ ...content, settings: { ...content.settings, socialLinks: next } });
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setContent({
                        ...content,
                        settings: {
                          ...content.settings,
                          socialLinks: content.settings.socialLinks.filter((_, j) => j !== i),
                        },
                      })
                    }
                    className="rounded-lg bg-rose-500/20 px-3 text-rose-300 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    settings: {
                      ...content.settings,
                      socialLinks: [...(content.settings.socialLinks || []), { label: '', url: '' }],
                    },
                  })
                }
                className="text-xs font-bold text-emerald-400"
              >
                + Add link
              </button>
            </div>
          </div>
        )}

        {section === 'media_showcase' && (
          <div className="mb-6 max-w-3xl rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-stone-300 space-y-2">
            <p className="font-bold text-emerald-300">Media Showcase — Offerings page videos</p>
            <p>
              Edit the three spots: <strong className="text-white">Social Media</strong>,{' '}
              <strong className="text-white">Brand Building</strong>, and{' '}
              <strong className="text-white">Cinematic Production</strong>. Paste a YouTube URL for each,
              update the description, and set Book Now. Then Save Draft → Publish Live.
            </p>
          </div>
        )}

        {section === 'home' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">Offerings / Home CMS Copy</h2>
            <p className="text-sm text-stone-400">
              Offerings page hero uses <strong className="text-stone-300">Global Settings</strong> (heroLabel, heroHeadline, heroSubheadline).
              Section titles below appear on the Offerings page. The public homepage vision story is edited in code data files — see CONTENT_STATUS.md.
            </p>
            {(['whatWeOfferTitle', 'howItWorksTitle', 'combinedSectionTitle', 'bottomCtaTitle', 'bottomCtaText'] as const).map((key) => (
              <div key={key}>
                <label className="text-xs text-stone-500 uppercase font-bold">{key}</label>
                <input
                  value={content.pages.home[key]}
                  onChange={(e) => setContent({ ...content, pages: { ...content.pages, home: { ...content.pages.home, [key]: e.target.value } } })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
                />
              </div>
            ))}
            <h3 className="font-bold text-white pt-4">Hero CTA Buttons</h3>
            {content.offerings.filter((o) => o.category === 'hero_cta').sort((a, b) => a.order - b.order).map((item) => (
              <OfferingEditor key={item.id} item={item} onChange={(n) => updateOffering(item.id, n)} onDelete={() => deleteOffering(item.id)} onDuplicate={() => setContent((c) => ({ ...c, offerings: [...c.offerings, duplicateOffering(item)] }))} onMoveUp={() => moveOffering(item.id, -1)} onMoveDown={() => moveOffering(item.id, 1)} preview={previewId === item.id} />
            ))}
          </div>
        )}

        {section === 'program' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-white">Program Page</h2>
            <input value={content.pages.program.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" placeholder="Headline" />
            <ListEditor label="Intro paragraphs" items={content.pages.program.introParagraphs} onChange={(v) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, introParagraphs: v } } })} />
            <ListEditor label="Built around" items={content.pages.program.builtAround} onChange={(v) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, builtAround: v } } })} />
            <ListEditor label="Closing lines" items={content.pages.program.closingLines} onChange={(v) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, closingLines: v } } })} />
            <input value={content.pages.program.deepDiveTitle} onChange={(e) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, deepDiveTitle: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" placeholder="Deep dive title" />
            <textarea value={content.pages.program.deepDiveSubtitle} onChange={(e) => setContent({ ...content, pages: { ...content.pages, program: { ...content.pages.program, deepDiveSubtitle: e.target.value } } })} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" placeholder="Deep dive subtitle" />
          </div>
        )}

        {section === 'contact' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-white">Contact Page</h2>
            <input value={content.pages.contact.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, contact: { ...content.pages.contact, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <textarea value={content.pages.contact.intro || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, contact: { ...content.pages.contact, intro: e.target.value } } })} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <ListEditor label="Booking options" items={content.pages.contact.bookingOptions} onChange={(v) => setContent({ ...content, pages: { ...content.pages, contact: { ...content.pages.contact, bookingOptions: v } } })} />
            <ListEditor label="Project types" items={content.pages.contact.projectTypes} onChange={(v) => setContent({ ...content, pages: { ...content.pages, contact: { ...content.pages.contact, projectTypes: v } } })} />
            <textarea value={content.pages.contact.pricingNote || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, contact: { ...content.pages.contact, pricingNote: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <h3 className="font-bold text-white">Contact CTAs</h3>
            {content.offerings.filter((o) => o.category === 'contact_cta').map((item) => (
              <OfferingEditor key={item.id} item={item} onChange={(n) => updateOffering(item.id, n)} onDelete={() => deleteOffering(item.id)} onDuplicate={() => setContent((c) => ({ ...c, offerings: [...c.offerings, duplicateOffering(item)] }))} onMoveUp={() => moveOffering(item.id, -1)} onMoveDown={() => moveOffering(item.id, 1)} />
            ))}
          </div>
        )}

        {['packages', 'cinematic'].includes(section) && (
          <div className="mb-4 max-w-3xl space-y-3">
            <h2 className="text-2xl font-bold text-white">{currentSection.label} Page Copy</h2>
            {section === 'packages' && (
              <>
                <input value={content.pages.packages.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, packages: { ...content.pages.packages, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" placeholder="Headline" />
                <textarea value={content.pages.packages.subheadline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, packages: { ...content.pages.packages, subheadline: e.target.value } } })} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
              </>
            )}
            {section === 'cinematic' && (
              <>
                <input value={content.pages.cinematic.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, cinematic: { ...content.pages.cinematic, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
                <textarea value={content.pages.cinematic.cinematicIntro || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, cinematic: { ...content.pages.cinematic, cinematicIntro: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
                <textarea value={content.pages.cinematic.boltAdvantage || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, cinematic: { ...content.pages.cinematic, boltAdvantage: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
              </>
            )}
          </div>
        )}

        {section === 'studio' && (
          <div className="space-y-3 max-w-2xl mb-6">
            <h2 className="text-2xl font-bold text-white">Studio Page</h2>
            <input value={content.pages.studio.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, studio: { ...content.pages.studio, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <textarea value={content.pages.studio.intro || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, studio: { ...content.pages.studio, intro: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
          </div>
        )}

        {section === 'workshops' && (
          <div className="space-y-3 max-w-2xl mb-6">
            <h2 className="text-2xl font-bold text-white">Workshops Page</h2>
            <input value={content.pages.workshops.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, workshops: { ...content.pages.workshops, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <textarea value={content.pages.workshops.intro || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, workshops: { ...content.pages.workshops, intro: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <h3 className="font-bold text-white pt-2">Workshop audiences</h3>
            {content.offerings.filter((o) => o.category === 'workshop_audience').map((item) => (
              <OfferingEditor key={item.id} item={item} onChange={(n) => updateOffering(item.id, n)} onDelete={() => deleteOffering(item.id)} onDuplicate={() => setContent((c) => ({ ...c, offerings: [...c.offerings, duplicateOffering(item)] }))} onMoveUp={() => moveOffering(item.id, -1)} onMoveDown={() => moveOffering(item.id, 1)} />
            ))}
          </div>
        )}

        {section === 'utah_bolt' && (
          <div className="space-y-3 max-w-2xl mb-6">
            <h2 className="text-2xl font-bold text-white">Utah Bolt Page</h2>
            <input value={content.pages.utahBolt.headline || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, utahBolt: { ...content.pages.utahBolt, headline: e.target.value } } })} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <textarea value={content.pages.utahBolt.intro || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, utahBolt: { ...content.pages.utahBolt, intro: e.target.value } } })} rows={3} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
            <textarea value={content.pages.utahBolt.travelNote || ''} onChange={(e) => setContent({ ...content, pages: { ...content.pages, utahBolt: { ...content.pages.utahBolt, travelNote: e.target.value } } })} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" />
          </div>
        )}

        {currentSection.category && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <h2 className="text-xl font-bold text-white">{currentSection.label} Offerings</h2>
              <button type="button" onClick={() => addOffering(currentSection.category!)} className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-neutral-950">+ Add Offering</button>
            </div>
            {section === 'cinematic' && (
              <div className="mb-6">
                <h3 className="font-bold text-stone-300 mb-3">Cinematic Add-ons</h3>
                {content.offerings.filter((o) => o.category === 'cinematic_addon').map((item) => (
                  <OfferingEditor key={item.id} item={item} onChange={(n) => updateOffering(item.id, n)} onDelete={() => deleteOffering(item.id)} onDuplicate={() => setContent((c) => ({ ...c, offerings: [...c.offerings, duplicateOffering(item)] }))} onMoveUp={() => moveOffering(item.id, -1)} onMoveDown={() => moveOffering(item.id, 1)} />
                ))}
              </div>
            )}
            {categoryOfferings.map((item) => (
              <div key={item.id}>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setPreviewId(previewId === item.id ? null : item.id)} className="text-xs text-emerald-400 font-bold">
                    {previewId === item.id ? 'Hide Preview' : 'Preview Card'}
                  </button>
                </div>
                <OfferingEditor item={item} onChange={(n) => updateOffering(item.id, n)} onDelete={() => deleteOffering(item.id)} onDuplicate={() => setContent((c) => ({ ...c, offerings: [...c.offerings, duplicateOffering(item)] }))} onMoveUp={() => moveOffering(item.id, -1)} onMoveDown={() => moveOffering(item.id, 1)} preview={previewId === item.id} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminGate() {
  const [authed, setAuthed] = useState(Boolean(getAdminToken()));

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard />;
}

export function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<AdminGate />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
