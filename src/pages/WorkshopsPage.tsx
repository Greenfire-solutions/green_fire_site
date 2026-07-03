import { SectionLabel, SectionTitle } from '../components/ui';
import { ContentButton } from '../components/ContentButton';
import { useSiteContent } from '../context/ContentContext';
import { getVisibleOfferings } from '../lib/contentHelpers';
import type { Page } from '../types';

type Props = { onNavigate: (page: Page) => void };

export function WorkshopsPage({ onNavigate }: Props) {
  const content = useSiteContent();
  const topics = getVisibleOfferings(content, 'workshop_topic');
  const audiences = getVisibleOfferings(content, 'workshop_audience');

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionLabel text="Workshops & Lessons" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">{content.pages.workshops.headline}</h1>
          <p className="max-w-2xl text-lg text-stone-400 leading-relaxed">{content.pages.workshops.intro}</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel text="Topics" color="purple" />
            <SectionTitle title="Available lessons & workshops" className="text-3xl md:text-4xl" />
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span key={topic.id} className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs font-medium text-stone-300">{topic.title}</span>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel text="Built For" color="orange" />
            <SectionTitle title="Who workshops serve" className="text-3xl md:text-4xl" />
            <div className="flex flex-wrap gap-2">
              {audiences.map((audience) => (
                <span key={audience.id} className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs font-medium text-orange-200">{audience.title}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-neutral-900/20 py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContentButton
              offering={{ id: 'ws-book', title: 'Workshop', description: '', price: '', category: 'contact_cta', includes: [], bestFor: [], addOns: [], buttonLabel: 'Book a Workshop', buttonActionType: 'contact_form', buttonSubject: 'Green Fire — Book a Workshop', featured: false, order: 0, visible: true }}
              onNavigate={onNavigate}
            />
            <ContentButton
              offering={{ id: 'lesson-book', title: 'Lesson', description: '', price: '', category: 'contact_cta', includes: [], bestFor: [], addOns: [], buttonLabel: 'Take a Private Lesson', buttonActionType: 'contact_form', buttonSubject: 'Green Fire — Private Lesson', featured: false, order: 1, visible: true }}
              onNavigate={onNavigate}
              variant="secondary"
            />
          </div>
        </div>
      </section>
    </>
  );
}
