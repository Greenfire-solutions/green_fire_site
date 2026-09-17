import { Mic, Video, MapPin } from 'lucide-react';
import { SectionLabel, SectionTitle } from '../components/ui';
import { ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';

const STUDIO_LOCATIONS = [
  { city: 'Austin', region: 'Texas' },
  { city: 'Salt Lake City', region: 'Utah' },
  { city: 'San Diego', region: 'California' },
];

export function StudioPage() {
  const content = useSiteContent();
  const sessions = getVisibleOfferings(content, 'studio_session');

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionLabel text="Studio" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">{content.pages.studio.headline}</h1>
          <p className="max-w-2xl text-lg text-stone-400 leading-relaxed mb-8">{content.pages.studio.intro}</p>
          <div className="flex flex-wrap gap-3">
            {STUDIO_LOCATIONS.map((loc) => (
              <span
                key={loc.city}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
              >
                <MapPin className="h-4 w-4 text-emerald-400" />
                {loc.city}, {loc.region}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <SectionLabel text="Studio Sessions" color="cyan" />
            <SectionTitle title="What you can do in the studio" className="text-3xl md:text-4xl" />
            <div className="grid gap-3 sm:grid-cols-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-900/40 px-4 py-3 text-sm text-stone-300">
                  <span className="text-emerald-400">•</span> {session.title}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-emerald-500/20 bg-neutral-950 p-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl bg-emerald-500/10 p-6 text-center">
                <Mic className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">Record</p>
              </div>
              <div className="rounded-2xl bg-orange-500/10 p-6 text-center">
                <Video className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">Film</p>
              </div>
            </div>
            <ContentButton
              offering={{
                id: 'studio-book',
                title: 'Book Studio Time',
                description: '',
                price: '',
                category: 'contact_cta',
                includes: [],
                bestFor: [],
                addOns: [],
                buttonLabel: 'Book Studio Time',
                buttonActionType: 'contact_form',
                buttonSubject: 'Green Fire — Book Studio Time',
                buttonMessage: "Hi Green Fire team,\n\nI'd like to book studio time.\n\n",
                featured: false,
                order: 0,
                visible: true,
              }}
              className="w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
