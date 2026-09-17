import { MapPin } from 'lucide-react';
import { SectionLabel, SectionTitle } from '../components/ui';
import { PublicPackageCard, ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import { useContact } from '../components/ContactProvider';

const STUDIO_LOCATIONS = [
  { city: 'Austin', region: 'Texas' },
  { city: 'Salt Lake City', region: 'Utah' },
  { city: 'San Diego', region: 'California' },
];

export function CinematicPage() {
  const content = useSiteContent();
  const { goToContact } = useContact();
  const packages = getVisibleOfferings(content, 'cinematic');
  const addons = getVisibleOfferings(content, 'cinematic_addon');
  const cine = content.pages.cinematic;

  return (
    <>
      <section className="relative border-b border-orange-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_50%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionLabel text="Cinematic Production" color="orange" />
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight">{cine.headline}</h1>
          <p className="max-w-3xl text-lg text-stone-300 leading-relaxed mb-6">{cine.cinematicIntro}</p>
          <p className="inline-flex items-center rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-bold text-orange-200">
            Packages start at $10,000 — priced to your needs
          </p>
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

      <section className="border-t border-white/5 py-16 px-6 bg-neutral-900/20">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Studios" color="cyan" />
          <SectionTitle title="Where we produce" className="text-3xl md:text-4xl" />
          <p className="text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {cine.studioLocations ||
              'We have studios in Austin, Texas; Salt Lake City, Utah; and San Diego, California — plus on-location production when the project needs it.'}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {STUDIO_LOCATIONS.map((loc) => (
              <div
                key={loc.city}
                className="rounded-2xl border border-white/10 bg-neutral-950 p-6 flex flex-col items-center gap-2"
              >
                <MapPin className="h-6 w-6 text-emerald-400" />
                <p className="font-bold text-white">{loc.city}</p>
                <p className="text-sm text-stone-500">{loc.region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Add-ons" color="orange" />
          <SectionTitle title="Expand your production" className="text-3xl md:text-4xl" />
          <ul className="space-y-3">
            {addons.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-neutral-900/40 px-5 py-4 text-stone-300"
              >
                <span className="text-orange-400">+</span> {item.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-orange-500/10 bg-gradient-to-b from-orange-500/5 to-neutral-950 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Ready to create" color="orange" />
          <h2 className="text-3xl font-semibold text-white mb-6">Book cinematic production</h2>
          <p className="text-stone-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            Tell us your vision, preferred studio city, timeline, and deliverables. We will quote a package starting at
            $10,000 based on what the project needs.
          </p>
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
              buttonMessage:
                'Hi Green Fire team,\n\nI am interested in cinematic production (from $10,000).\nPreferred studio: Austin / Salt Lake City / San Diego / On location\n\n',
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
