import { Link } from 'react-router-dom';
import { Search, Hammer, Video, Network } from 'lucide-react';
import { PageHero, SectionLabel, SectionTitle } from '../components/ui';
import { ContentButton, OfferingMedia } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import { offeringsStatement } from '../data/offeringsData';
import { siteConfig } from '../config/siteConfig';
import { usePageMeta } from '../lib/usePageMeta';
import { ROUTES } from '../lib/routes';
import { useContact } from '../components/ContactProvider';

const STEP_ICONS = [Search, Hammer, Video, Network];

export function OfferingsPage() {
  usePageMeta(
    siteConfig.seo.offeringsTitle,
    'Social media, brand building, and cinematic production from Green Fire Media.',
  );

  const content = useSiteContent();
  const { goToContact } = useContact();
  const { settings, pages } = content;
  const heroCtas = getVisibleOfferings(content, 'hero_cta');
  const showcases = getVisibleOfferings(content, 'media_showcase');
  const combined = getVisibleOfferings(content, 'combined');

  return (
    <>
      <PageHero
        label={settings.heroLabel || 'Media & Story Production'}
        title={settings.heroHeadline}
        subtitle={settings.heroSubheadline}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {heroCtas.map((cta) => (
            <ContentButton
              key={cta.id}
              offering={cta}
              variant={cta.order === 0 ? 'primary' : 'secondary'}
              showArrow={cta.order === 0}
            />
          ))}
        </div>
      </PageHero>

      <section className="border-b border-white/5 py-12 px-6 bg-emerald-500/5">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-stone-300 leading-relaxed text-sm md:text-base">{offeringsStatement}</p>
        </div>
      </section>

      {/* Three admin-editable media showcases with YouTube */}
      <section className="border-b border-white/5 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Media & Story Production" />
          <SectionTitle title="See the work. Book the path." />
          <p className="text-stone-400 max-w-2xl mb-12 text-sm leading-relaxed">
            Three ways we help you show up on screen — social media, brand building, and cinematic production.
            Paste a YouTube link in Admin → Media Showcase to feature your latest examples.
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            {showcases.map((item) => (
              <article
                key={item.id}
                className={`rounded-[2rem] border p-6 flex flex-col ${
                  item.premium
                    ? 'border-orange-500/25 bg-gradient-to-b from-orange-500/5 to-neutral-950'
                    : 'border-white/10 bg-neutral-950'
                }`}
              >
                <OfferingMedia offering={item} />
                {!item.youtubeUrl && !item.thumbnailUrl && !item.videoUrl && (
                  <div className="mb-6 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/15 bg-neutral-900 text-center px-4">
                    <p className="text-xs text-stone-500">
                      Add a YouTube URL in Admin → Media Showcase to show a video here.
                    </p>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-emerald-300/80 text-sm mb-3">{item.subtitle}</p>
                )}
                <p className="text-sm text-stone-400 leading-relaxed mb-4 flex-grow">{item.description}</p>
                {item.includes.length > 0 && (
                  <ul className="text-xs text-stone-500 space-y-1 mb-6">
                    {item.includes.slice(0, 4).map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() =>
                    goToContact(
                      item.buttonSubject || `Green Fire — ${item.title}`,
                      item.buttonMessage,
                    )
                  }
                  className={`w-full rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${
                    item.premium
                      ? 'bg-orange-400 text-neutral-950 hover:bg-orange-300'
                      : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300'
                  }`}
                >
                  {item.buttonLabel || 'Book Now'}
                </button>
              </article>
            ))}
          </div>

          {showcases.length === 0 && (
            <p className="text-stone-500 text-sm">
              No media showcases yet. Add them in Admin → Media Showcase, then Publish Live.
            </p>
          )}
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
          <SectionLabel text="Packages" />
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
            <Link
              to={ROUTES.offeringsPackages}
              className="rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300"
            >
              View All Packages
            </Link>
            <Link
              to={ROUTES.offeringsCinematic}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10"
            >
              Cinematic Packages
            </Link>
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
            <ContentButton key={cta.id} offering={cta} showArrow />
          ))}
        </div>
      </section>
    </>
  );
}
