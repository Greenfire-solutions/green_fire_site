import { useState } from 'react';
import { SectionLabel, SectionTitle, BookButton } from '../components/ui';
import { homeSectors } from '../data/programData';
import { ProgramDeepDive } from '../program/ProgramDeepDive';
import { useSiteContent } from '../context/ContentContext';
import type { Page } from '../types';

type Props = { onNavigate: (page: Page) => void };

export function ProgramPage({ onNavigate }: Props) {
  const content = useSiteContent();
  const { program } = content.pages;
  const [openSection, setOpenSection] = useState<string | null>('vision');
  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  return (
    <>
      <section className="relative border-b border-emerald-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_45%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
          <SectionLabel text="Program" />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-8 leading-tight">{program.headline}</h1>
          <div className="space-y-5 text-stone-300 leading-relaxed">
            {program.introParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 py-16 px-6 bg-neutral-900/20">
        <div className="mx-auto max-w-4xl">
          <SectionLabel text="Built Around" color="orange" />
          <div className="flex flex-wrap gap-2 mb-10">
            {program.builtAround.map((item) => (
              <span key={item} className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs font-medium text-stone-300">{item}</span>
            ))}
          </div>
          <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-8 text-stone-300 leading-relaxed space-y-4">
            {program.closingLines.map((line, i) => (
              <p key={i} className={i === program.closingLines.length - 1 ? 'text-emerald-300' : i === 0 ? 'text-lg text-white font-medium' : ''}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 border-b border-white/5">
        <div className="mx-auto max-w-4xl space-y-3">
          {program.accordionSections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden">
              <button type="button" onClick={() => toggle(section.id)} className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-white hover:bg-white/5">
                {section.title}
                <span className="text-emerald-400 text-xl">{openSection === section.id ? '−' : '+'}</span>
              </button>
              {openSection === section.id && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4 text-stone-400 text-sm leading-relaxed">
                  <p>{section.content}</p>
                  {section.id === 'sectors' && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                      {homeSectors.map((sector) => {
                        const Icon = sector.icon;
                        return (
                          <div key={sector.title} className="rounded-2xl border border-white/5 bg-neutral-900 p-4">
                            <Icon className="h-6 w-6 text-emerald-400 mb-2" />
                            <h4 className="font-bold text-white text-sm">{sector.title}</h4>
                            <p className="text-xs text-stone-400 mt-1">{sector.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {section.id === 'join' && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <BookButton subject="Green Fire Program — Join Founding Circle" variant="secondary">Join Founding Circle</BookButton>
                      <BookButton subject="Green Fire Program — Submit a Community Need">Submit a Community Need</BookButton>
                      <BookButton subject="Green Fire Program — Donate to Pilot" variant="secondary">Support the Pilot</BookButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 border-b border-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel text="Deep Dive" color="cyan" />
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">{program.deepDiveTitle}</h2>
          <p className="text-stone-400 text-sm max-w-2xl mx-auto">{program.deepDiveSubtitle}</p>
        </div>
      </section>

      <ProgramDeepDive />
    </>
  );
}
