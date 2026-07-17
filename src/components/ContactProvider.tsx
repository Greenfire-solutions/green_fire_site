import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Mail, X, AlertCircle, Loader2 } from 'lucide-react';
import { CONTACT_EMAIL } from '../lib/email';
import { sendContact, type ContactPayload } from '../lib/contact';

type ToastState =
  | { type: 'success'; title: string; detail: string }
  | { type: 'error'; title: string; detail: string }
  | null;

export type ContactPrefill = {
  subject: string;
  message: string;
};

type ContactContextValue = {
  openContact: (subject: string, defaultMessage?: string) => void;
  goToContact: (subject: string, defaultMessage?: string) => void;
  contactPrefill: ContactPrefill | null;
  clearContactPrefill: () => void;
  submitMessage: (payload: ContactPayload) => Promise<boolean>;
  isSubmitting: boolean;
};

const ContactContext = createContext<ContactContextValue | null>(null);

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    throw new Error('useContact must be used within ContactProvider');
  }
  return ctx;
}

type ContactProviderProps = {
  children: ReactNode;
};

export function ContactProvider({ children }: ContactProviderProps) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [contactPrefill, setContactPrefill] = useState<ContactPrefill | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next) {
      window.setTimeout(() => setToast(null), 5000);
    }
  }, []);

  const resetModalForm = useCallback(() => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setFormError(null);
  }, []);

  const clearContactPrefill = useCallback(() => {
    setContactPrefill(null);
  }, []);

  const submitMessage = useCallback(
    async (payload: ContactPayload): Promise<boolean> => {
      setIsSubmitting(true);
      const result = await sendContact(payload);
      setIsSubmitting(false);

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Message sent',
          detail: `We received your message and will reply to ${payload.email}.`,
        });
        return true;
      }

      showToast({
        type: 'error',
        title: 'Could not send',
        detail: result.error,
      });
      return false;
    },
    [showToast],
  );

  const openContact = useCallback((subject: string, defaultMessage = '') => {
    setForm({
      name: '',
      email: '',
      subject,
      message: defaultMessage,
    });
    setFormError(null);
    setModalOpen(true);
  }, []);

  const goToContact = useCallback(
    (subject: string, defaultMessage = '') => {
      const message =
        defaultMessage ||
        `Hi Green Fire team,\n\nI'm reaching out about: ${subject}\n\n`;
      setContactPrefill({ subject, message });
      navigate('/contact');
      window.setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    },
    [navigate],
  );

  const submitModal = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const ok = await submitMessage({
      name: form.name,
      email: form.email,
      subject: form.subject || 'Green Fire — website message',
      message: form.message,
    });

    if (ok) {
      setModalOpen(false);
      resetModalForm();
    } else {
      setFormError('Could not send. Check your connection or try again.');
    }
  };

  return (
    <ContactContext.Provider
      value={{
        openContact,
        goToContact,
        contactPrefill,
        clearContactPrefill,
        submitMessage,
        isSubmitting,
      }}
    >
      {children}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100'
                : 'border-rose-500/30 bg-rose-950/90 text-rose-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            )}
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="text-xs opacity-80">{toast.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => !isSubmitting && setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-neutral-950 p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                disabled={isSubmitting}
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 pr-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Reach Out</p>
                <h3 className="text-2xl font-semibold text-white">Send a message</h3>
                <p className="mt-2 text-sm text-stone-400">
                  Your message goes directly to {CONTACT_EMAIL}.
                </p>
              </div>

              <form onSubmit={submitModal} className="space-y-4">
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
                <textarea
                  required
                  rows={5}
                  placeholder="Your message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-y min-h-[120px]"
                />
                {formError && (
                  <p className="text-sm text-rose-400" role="alert">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-8 py-4 text-base font-bold text-neutral-950 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send Message <Mail className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContactContext.Provider>
  );
}

export function ContactButton({
  subject,
  body,
  className,
  children,
}: {
  subject: string;
  body?: string;
  className: string;
  children: React.ReactNode;
}) {
  const { openContact } = useContact();

  return (
    <button type="button" onClick={() => openContact(subject, body)} className={className}>
      {children}
    </button>
  );
}
