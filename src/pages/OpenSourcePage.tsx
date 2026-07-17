import { Link } from 'react-router-dom';
import { openSourceContent } from '../data/openSourceData';
import { linksConfig } from '../config/linksConfig';
import { siteConfig } from '../config/siteConfig';
import { PageHero, SectionLabel, BookButton } from '../components/ui';
import { StatusBadge, StatusNote } from '../components/StatusBadge';
import { usePageMeta } from '../lib/usePageMeta';

export function OpenSourcePage() {
  usePageMeta(siteConfig.seo.openSourceTitle, openSourceContent.intro);

  return (
    <>
      <PageHero
        label="Greenfire Creator Commons"
        title={openSourceContent.headline}
        subtitle={openSourceContent.intro}
      >
        <StatusBadge item={openSourceContent.status} />
      </PageHero>

      <section className="border-b border-white/5 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-lg text-emerald-300 font-medium mb-8">{openSourceContent.getStatusMessage()}</p>
          <StatusNote item={openSourceContent.status} />

          <SectionLabel text="Planned Materials" />
          <ul className="grid sm:grid-cols-2 gap-2 mt-4 mb-12">
            {openSourceContent.mayInclude.map((item) => (
              <li key={item} className="text-sm text-stone-400 rounded-xl border border-white/5 bg-neutral-950 px-4 py-3">• {item}</li>
            ))}
          </ul>

          <SectionLabel text="Earned Revenue" color="orange" />
          <p className="text-stone-400 text-sm mb-4">{openSourceContent.revenueNote}</p>
          <div className="flex flex-wrap gap-2 mb-12">
            {openSourceContent.supportLanguage.map((s) => (
              <span key={s} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-stone-300">{s}</span>
            ))}
          </div>

          <SectionLabel text="Replication Pathway" color="cyan" />
          <div className="space-y-3 mb-12">
            {openSourceContent.replicationPathway.map((step, i) => (
              <div key={step.step} className="flex gap-4 rounded-xl border border-white/5 bg-neutral-950 p-4">
                <span className="text-emerald-400 font-bold text-sm shrink-0">{i + 1}. {step.step}</span>
                <p className="text-sm text-stone-400">{step.detail}</p>
              </div>
            ))}
          </div>

          {linksConfig.repositoryUrl ? (
            <a href={linksConfig.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold">
              View repository →
            </a>
          ) : (
            <p className="text-sm text-stone-500">Repository URL will be published when the open-source release is ready.</p>
          )}

          <div className="mt-12 pt-8 border-t border-white/5">
            <BookButton subject="Greenfire — Open Source Adaptation Inquiry">
              Start a Local Adaptation Conversation
            </BookButton>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 text-center border-t border-white/5">
        <Link to="/how-it-works" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Back to How It Works
        </Link>
      </section>
    </>
  );
}
