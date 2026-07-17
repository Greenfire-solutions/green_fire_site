import { participationPathways, youthSection } from '../data/participationData';
import { siteConfig } from '../config/siteConfig';
import { PageHero, SectionLabel, SectionTitle, BookButton, inputClass, textareaClass } from '../components/ui';
import { StatusNote } from '../components/StatusBadge';
import { usePageMeta } from '../lib/usePageMeta';
import { useContact } from '../components/ContactProvider';
import { useState } from 'react';
import { linksConfig } from '../config/linksConfig';

export function GetInvolvedPage() {
  usePageMeta(siteConfig.seo.getInvolvedTitle, 'Bring a need, offer a skill, partner, support a project, or explore adapting Greenfire in your community.');
  const { submitMessage, isSubmitting } = useContact();
  const [form, setForm] = useState({ name: '', email: '', type: 'need', message: '' });
  const [sent, setSent] = useState(false);

  const subjects: Record<string, string> = {
    need: 'Greenfire — Community Need',
    skill: 'Greenfire — Offer a Skill',
    partner: 'Greenfire — Partnership Inquiry',
    support: 'Greenfire — Project Support',
    media: 'Greenfire — Community Media Space Inquiry',
    youth: 'Greenfire — Youth Program Interest (Guardian/Organization)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitMessage({
      name: form.name,
      email: form.email,
      subject: subjects[form.type] || subjects.need,
      message: `[${form.type}]\n\n${form.message}`,
    });
    if (ok) {
      setSent(true);
      setForm({ name: '', email: '', type: 'need', message: '' });
    }
  };

  return (
    <>
      <PageHero
        label="Get Involved"
        title="Join the Greenfire Innovation Center"
        subtitle="Every pathway starts with a conversation. Choose how you'd like to participate."
      />

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl grid sm:grid-cols-2 gap-4 mb-16">
          {participationPathways.map((path) => (
            <div key={path.id} id={path.id === 'need' ? 'bring-a-need' : path.id === 'skill' ? 'offer-a-skill' : path.id === 'partner' ? 'host-partner' : path.id === 'support' ? 'support' : undefined} className="rounded-2xl border border-white/10 bg-neutral-950 p-6 scroll-mt-24">
              <h3 className="font-bold text-white mb-2">{path.title}</h3>
              <p className="text-sm text-stone-400">{path.description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-xl">
          <SectionLabel text="Intake Form" />
          <SectionTitle title="Share Your Interest" className="text-2xl md:text-3xl" />

          {!linksConfig.forms.communityIntakeConfigured && (
            <p className="text-amber-300/90 text-sm mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              Email delivery requires VITE_WEB3FORMS_ACCESS_KEY in Vercel. Until configured, use{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline">{siteConfig.contactEmail}</a>.
            </p>
          )}

          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Do not submit sensitive cultural information, sacred recordings, youth medical records, or private community knowledge through this form.
            Information is collected to respond to your inquiry. {siteConfig.contactEmail} will receive your message.
          </p>

          {sent ? (
            <p className="text-emerald-300 font-medium">Thank you — your message was sent. We will respond to your email.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
                aria-label="Participation type"
              >
                <option value="need">Bring a Need</option>
                <option value="skill">Offer a Skill</option>
                <option value="partner">Host or Partner</option>
                <option value="support">Support a Project</option>
                <option value="media">Community Media Space</option>
                <option value="youth">Youth Interest (Guardian/Organization)</option>
              </select>
              <input type="text" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              <input type="email" required placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              <textarea required rows={6} placeholder="Tell us about your need, skill, partnership idea, or interest..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={textareaClass} />
              <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-emerald-400 py-4 font-bold text-neutral-950 disabled:opacity-60">
                {isSubmitting ? 'Sending…' : 'Submit'}
              </button>
            </form>
          )}

          <div className="mt-8 rounded-xl border border-white/5 bg-neutral-900/50 p-4">
            <p className="text-xs font-bold uppercase text-stone-500 mb-2">Youth pathways</p>
            <p className="text-sm text-stone-400">{youthSection.note}</p>
            <StatusNote item={youthSection.status} />
          </div>
        </div>
      </section>
    </>
  );
}
