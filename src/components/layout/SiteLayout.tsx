import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/ContentContext';
import { siteConfig } from '../../config/siteConfig';
import { PRIMARY_NAV, FOOTER_NAV, ROUTES } from '../../lib/routes';

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteContent();
  const location = useLocation();
  const contactEmail = settings.contactEmail || siteConfig.contactEmail;

  const isActive = (path: string) => {
    if (path === ROUTES.home) return location.pathname === '/';
    if (path === ROUTES.offerings) {
      return location.pathname === '/offerings' || location.pathname.startsWith('/offerings/');
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to={ROUTES.home} className="flex items-center gap-3 group shrink-0">
            <div className="rounded-full bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/30 transition-all group-hover:bg-emerald-500/20">
              <Flame className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="block text-sm md:text-lg font-bold tracking-wide text-white leading-tight">
                {siteConfig.organizationName}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 hidden sm:block">
                {siteConfig.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'text-stone-400 hover:text-emerald-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to={ROUTES.getInvolved}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-300 transition-colors shrink-0"
          >
            Share a Need
          </Link>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden rounded-lg p-2 text-stone-300 hover:bg-white/5"
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
              className="lg:hidden border-t border-white/5 bg-neutral-950 px-4 py-4"
            >
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3 py-3 text-left text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'text-stone-300 bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link
                to={ROUTES.getInvolved}
                onClick={() => setMobileOpen(false)}
                className="mt-3 block w-full rounded-xl bg-emerald-400 py-3 text-center text-sm font-bold text-neutral-950"
              >
                Share a Need
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/5 bg-neutral-950 px-6 py-12 text-sm text-stone-500">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Flame className="h-6 w-6 text-emerald-500/50" />
                <span className="text-lg font-semibold text-stone-300">{siteConfig.organizationName}</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-emerald-500/50 mb-2">{settings.footerTagline}</p>
              <p className="text-xs text-stone-600 max-w-sm">{siteConfig.poweredByStatement}</p>
            </div>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2" aria-label="Footer">
              {FOOTER_NAV.map((item) => (
                <Link key={`${item.path}-${item.label}`} to={item.path} className="text-stone-400 hover:text-emerald-300 text-xs">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-white/5 pt-6 text-center">
            {(settings.socialLinks || []).filter((l) => l.label && l.url).length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {settings.socialLinks
                  .filter((l) => l.label && l.url)
                  .map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-400/80 hover:text-emerald-300"
                    >
                      {link.label}
                    </a>
                  ))}
              </div>
            )}
            <p className="mb-4">
              <a href={`mailto:${contactEmail}`} className="text-emerald-400/80 hover:text-emerald-300 inline-flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> {contactEmail}
              </a>
            </p>
            <p>© {new Date().getFullYear()} {settings.footerCopy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
