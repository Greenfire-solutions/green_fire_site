import { useState } from 'react';
import { Flame, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../../types';
import { NAV_ITEMS } from '../../types';
import { useSiteContent } from '../../context/ContentContext';

type SiteLayoutProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
};

export function SiteLayout({ currentPage, onNavigate, children }: SiteLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteContent();
  const contactEmail = settings.contactEmail;

  const go = (page: Page) => {
    setMobileOpen(false);
    onNavigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => go('home')}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="rounded-full bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/30 transition-all group-hover:bg-emerald-500/20">
              <Flame className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold tracking-wide text-white leading-tight">{settings.siteTitle.split(' ')[0]} {settings.siteTitle.split(' ').slice(1).join(' ') || 'Media Hub'}</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">{settings.siteTagline.split('•')[0]?.trim() || 'Media Hub'}</span>
            </div>
          </button>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  currentPage === item.id
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'text-stone-400 hover:text-emerald-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => go('contact')}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-300 transition-colors shrink-0"
          >
            Book Now
          </button>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden rounded-lg p-2 text-stone-300 hover:bg-white/5"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t border-white/5 bg-neutral-950 px-4 py-4"
            >
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={`rounded-xl px-3 py-3 text-left text-sm font-medium ${
                      currentPage === item.id
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'text-stone-300 bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go('contact')}
                className="mt-3 w-full rounded-xl bg-emerald-400 py-3 text-sm font-bold text-neutral-950"
              >
                Book Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-12 text-center text-sm text-stone-500">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Flame className="h-6 w-6 text-emerald-500/50" />
            <span className="text-lg font-semibold text-stone-300 tracking-wide">{settings.siteTitle}</span>
          </div>
          <p className="uppercase tracking-widest text-xs font-bold text-emerald-500/50 mb-6">{settings.footerTagline}</p>
          <p className="mb-4">
            <a href={`mailto:${contactEmail}`} className="text-emerald-400/80 hover:text-emerald-300 transition-colors inline-flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" /> {contactEmail}
            </a>
          </p>
          <p>© {new Date().getFullYear()} {settings.footerCopy}</p>
        </div>
      </footer>
    </div>
  );
}
