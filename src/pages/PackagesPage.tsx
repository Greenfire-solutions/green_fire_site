import type { Page } from '../types';
import { SectionLabel, SectionTitle } from '../components/ui';
import { PublicPackageCard } from '../components/ContentButton';
import { ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import { useContact } from '../components/ContactProvider';

type Props = { onNavigate: (page: Page) => void };

export function PackagesPage({ onNavigate }: Props) {
  const content = useSiteContent();
  const { goToContact } = useContact();
  const packages = getVisibleOfferings(content, 'service_package');
  const combined = getVisibleOfferings(content, 'combined');

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionLabel text="Packages" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">{content.pages.packages.headline}</h1>
          <p className="max-w-2xl text-lg text-stone-400">{content.pages.packages.subheadline}</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-2">
          {packages.map((pkg) => (
            <PublicPackageCard
              key={pkg.id}
              offering={pkg}
              onBook={() => goToContact(pkg.buttonSubject || `Green Fire — ${pkg.title}`, pkg.buttonMessage)}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionLabel text="Combined Builds" color="cyan" />
          <SectionTitle title="Creative day packages" />
          <div className="grid gap-6 md:grid-cols-2">
            {combined.map((pkg) => (
              <PublicPackageCard
                key={pkg.id}
                offering={pkg}
                onBook={() => goToContact(pkg.buttonSubject || `Green Fire — ${pkg.title}`, pkg.buttonMessage)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
