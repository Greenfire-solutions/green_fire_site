import { Bot } from 'lucide-react';
import { SectionLabel, SectionTitle } from '../components/ui';
import { ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';

export function UtahBoltPage() {
  const content = useSiteContent();
  const idealFor = getVisibleOfferings(content, 'utah_bolt_ideal');

  return (
    <>
      <section className="relative border-b border-orange-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-2xl bg-orange-500/10 p-4 ring-1 ring-orange-500/30">
              <Bot className="h-10 w-10 text-orange-400" />
            </div>
            <SectionLabel text="Utah Bolt Studio" color="orange" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">{content.pages.utahBolt.headline}</h1>
          <p className="max-w-3xl text-lg text-stone-300 leading-relaxed">{content.pages.utahBolt.intro}</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel text="Ideal For" color="cyan" />
            <SectionTitle title="Premium motion-controlled content" className="text-3xl md:text-4xl" />
            <div className="grid gap-2 sm:grid-cols-2">
              {idealFor.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/5 bg-neutral-900/40 px-4 py-3 text-sm text-stone-300">{item.title}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-neutral-950 p-8">
            <h3 className="text-xl font-bold text-white mb-4">Travel & custom packages</h3>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">{content.pages.utahBolt.travelNote}</p>
            <p className="text-sm text-orange-200/80 mb-8">Cinematic Bolt robot productions begin at <strong className="text-orange-300">$3,500</strong> and are based in Utah.</p>
            <ContentButton
              offering={{
                id: 'bolt-book',
                title: 'Utah Bolt',
                description: '',
                price: '',
                category: 'contact_cta',
                includes: [],
                bestFor: [],
                addOns: [],
                buttonLabel: 'Ask About Utah Studio Production',
                buttonActionType: 'contact_form',
                buttonSubject: 'Green Fire — Utah Bolt Studio Production',
                featured: false,
                order: 0,
                visible: true,
              }}
              variant="premium"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
