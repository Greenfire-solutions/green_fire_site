import { SectionLabel, SectionTitle } from '../components/ui';
import { PublicPackageCard, ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import { useContact } from '../components/ContactProvider';

export function CinematicPage() {
  const content = useSiteContent();
  const { goToContact } = useContact();
  const packages = getVisibleOfferings(content, 'cinematic');
  const addons = getVisibleOfferings(content, 'cinematic_addon');

  return (
    <>
      <section className="relative border-b border-orange-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_50%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionLabel text="Cinematic Production" color="orange" />
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight">{content.pages.cinematic.headline}</h1>
          <p className="max-w-3xl text-lg text-stone-300 leading-relaxed">{content.pages.cinematic.cinematicIntro}</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PublicPackageCard
              key={pkg.id}
              offering={pkg}
              premium
              onBook={() => goToContact(pkg.buttonSubject || `Green Fire — ${pkg.title}`, pkg.buttonMessage)}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Add-ons" color="orange" />
          <SectionTitle title="Expand your production" className="text-3xl md:text-4xl" />
          <ul className="space-y-3">
            {addons.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-neutral-900/40 px-5 py-4 text-stone-300">
                <span className="text-orange-400">+</span> {item.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-orange-500/10 bg-gradient-to-b from-orange-500/5 to-neutral-950 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Bolt Motion Advantage" color="orange" />
          <h2 className="text-3xl font-semibold text-white mb-6">Precision camera movement</h2>
          <p className="text-stone-300 leading-relaxed mb-8">{content.pages.cinematic.boltAdvantage}</p>
          <ContentButton
            offering={{
              id: 'cine-book',
              title: 'Book Cinematic Production',
              description: '',
              price: '',
              category: 'contact_cta',
              includes: [],
              bestFor: [],
              addOns: [],
              buttonLabel: 'Book Cinematic Production',
              buttonActionType: 'contact_form',
              buttonSubject: 'Green Fire — Cinematic Production Inquiry',
              featured: false,
              order: 0,
              visible: true,
            }}
            variant="premium"
          />
        </div>
      </section>
    </>
  );
}
