import { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { SectionLabel, inputClass, textareaClass } from '../components/ui';
import { useContact } from '../components/ContactProvider';
import { useSiteContent } from '../context/ContentContext';

const initialForm = {
  name: '', email: '', phone: '', projectType: '', helpNeeded: '', interestArea: '',
  studioTime: '', utahBolt: '', timeline: '', budget: '', notes: '',
};

export function ContactPage() {
  const content = useSiteContent();
  const { contact } = content.pages;
  const email = content.settings.contactEmail;
  const [form, setForm] = useState(initialForm);
  const { submitMessage, isSubmitting, contactPrefill, clearContactPrefill } = useContact();

  useEffect(() => {
    if (!contactPrefill) return;
    setForm((prev) => ({
      ...prev,
      helpNeeded: contactPrefill.message,
      projectType: contactPrefill.subject.replace('Green Fire — ', '').replace('Green Fire Booking — ', ''),
    }));
    clearContactPrefill();
  }, [contactPrefill, clearContactPrefill]);

  const buildMessage = () => [
    `Project type: ${form.projectType || 'Not specified'}`,
    `Phone: ${form.phone || 'Not provided'}`,
    '', 'What they need help with:', form.helpNeeded,
    '', `Interest areas: ${form.interestArea || 'Not specified'}`,
    `Studio time needed: ${form.studioTime || 'Not specified'}`,
    `Utah Bolt interest: ${form.utahBolt || 'Not specified'}`,
    `Timeline: ${form.timeline || 'Not specified'}`,
    `Estimated budget: ${form.budget || 'Not specified'}`,
    '', 'Additional notes:', form.notes || 'None',
  ].join('\n');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitMessage({
      name: form.name,
      email: form.email,
      subject: `Green Fire Booking — ${form.projectType || form.name}`,
      message: buildMessage(),
    });
    if (ok) setForm(initialForm);
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 md:py-20">
          <SectionLabel text="Contact" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">{contact.headline}</h1>
          <p className="text-lg text-stone-400">{contact.intro}</p>
        </div>
      </section>

      <section id="contact" className="py-16 px-6 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex flex-wrap gap-2">
            {contact.bookingOptions.map((opt) => (
              <span key={opt} className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-1.5 text-xs text-stone-400">{opt}</span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8 shadow-2xl">
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" required placeholder="Name *" value={form.name} onChange={set('name')} className={inputClass} />
              <input type="email" required placeholder="Email *" value={form.email} onChange={set('email')} className={inputClass} />
            </div>
            <input type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} className={inputClass} />
            <select required value={form.projectType} onChange={set('projectType')} className={inputClass}>
              <option value="">Project type *</option>
              {contact.projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea required rows={4} placeholder="What do you need help with? *" value={form.helpNeeded} onChange={set('helpNeeded')} className={textareaClass} />
            <select value={form.interestArea} onChange={set('interestArea')} className={inputClass}>
              <option value="">Media production, music, branding, web, workshops, or cinematic?</option>
              {contact.interestAreas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={form.studioTime} onChange={set('studioTime')} className={inputClass}>
                <option value="">Do you need studio time?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe / not sure</option>
              </select>
              <select value={form.utahBolt} onChange={set('utahBolt')} className={inputClass}>
                <option value="">Interested in Utah Bolt robot studio?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Learn more">I'd like to learn more</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Ideal timeline" value={form.timeline} onChange={set('timeline')} className={inputClass} />
              <input type="text" placeholder="Estimated budget" value={form.budget} onChange={set('budget')} className={inputClass} />
            </div>
            <textarea rows={3} placeholder="Additional notes" value={form.notes} onChange={set('notes')} className={textareaClass} />
            <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-8 py-4 text-base font-bold text-neutral-950 hover:bg-emerald-300 disabled:opacity-60">
              {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</> : <>Send Booking Request <Mail className="h-5 w-5" /></>}
            </button>
            <p className="text-center text-xs text-stone-500">
              Messages go to <a href={`mailto:${email}`} className="text-emerald-400 hover:text-emerald-300">{email}</a>
            </p>
          </form>

          {contact.pricingNote && (
            <div className="mt-10 rounded-2xl border border-white/5 bg-neutral-900/30 p-6 text-sm text-stone-400 leading-relaxed">
              <p><strong className="text-stone-300">Pricing note:</strong> {contact.pricingNote}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
