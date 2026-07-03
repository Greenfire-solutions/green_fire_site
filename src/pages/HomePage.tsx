import { Search, Hammer, Video, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Page } from '../types';
import { PageHero, SectionLabel, SectionTitle } from '../components/ui';
import { ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import { getServiceIcon } from '../lib/icons';

const STEP_ICONS = [Search, Hammer, Video, Network];

type Props = { onNavigate: (page: Page) => void };

export function HomePage({ onNavigate }: Props) {
  const content = useSiteContent();
  const { goToContact } = useContact();
  const { settings, pages } = content;
  const services = getVisibleOfferings(content, 'what_we_offer');
  const heroCtas = getVisibleOfferings(content, 'hero_cta');
  const combined = getVisibleOfferings(content, 'combined');

  return (
    <>
      <PageHero label={settings.heroLabel} title={settings.heroHeadline} subtitle={settings.heroSubheadline}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {heroCtas.map((cta) => (
            <ContentButton key={cta.id} offering={cta} onNavigate={onNavigate} variant={cta.order === 0 ? 'primary' : 'secondary'} showArrow={cta.order === 0} />
          ))}
        </div>
      </PageHero>

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="What We Offer" />
          <SectionTitle title={pages.home.whatWeOfferTitle} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-neutral-900/40 p-4 hover:border-emerald-500/20 transition-colors"
                >
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-stone-200">{service.title}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-neutral-900/20 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="How It Works" color="orange" />
          <SectionTitle title={pages.home.howItWorksTitle} />
          <div className="grid gap-8 md:grid-cols-4">
            {pages.home.howItWorksSteps.map((item, i) => {
              const Icon = STEP_ICONS[i] || Search;
              return (
                <div key={item.step} className="text-center md:text-left">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-neutral-950 text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Popular Paths" />
          <SectionTitle title={pages.home.combinedSectionTitle} />
          <div className="grid gap-6 md:grid-cols-2">
            {combined.map((pkg) => (
              <div key={pkg.id} className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-8">
                <h3 className="text-xl font-bold text-white mb-3">{pkg.title}</h3>
                <p className="text-stone-400 text-sm mb-4">{pkg.description}</p>
                <p className="text-sm text-stone-300 leading-relaxed">{pkg.includes.join(' ')}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button type="button" onClick={() => onNavigate('packages')} className="rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300">
              View All Packages
            </button>
            <ContentButton
              offering={{
                id: 'custom-inquiry',
                title: 'Custom Package',
                description: '',
                price: '',
                category: 'contact_cta',
                includes: [],
                bestFor: [],
                addOns: [],
                buttonLabel: 'Ask About a Custom Package',
                buttonActionType: 'contact_form',
                buttonSubject: 'Green Fire — Custom Package Inquiry',
                featured: false,
                order: 0,
                visible: true,
              }}
              onNavigate={onNavigate}
              variant="secondary"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">{pages.home.bottomCtaTitle}</h2>
          <p className="text-stone-400 mb-8 leading-relaxed">{pages.home.bottomCtaText}</p>
          {getVisibleOfferings(content, 'contact_cta').map((cta) => (
            <ContentButton key={cta.id} offering={cta} onNavigate={onNavigate} showArrow />
          ))}
        </div>
      </section>
    </>
  );
}
