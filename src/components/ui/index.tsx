import React from 'react';

export function SectionLabel({
  text,
  color = 'emerald',
}: {
  text: string;
  color?: string;
}) {
  return (
    <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] text-${color}-400`}>
      {text}
    </p>
  );
}

export function SectionTitle({ title, className = '' }: { title: string; className?: string }) {
  return (
    <h2
      className={`text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.1] ${className}`}
    >
      {title}
    </h2>
  );
}

export function PageHero({
  label,
  title,
  subtitle,
  children,
}: {
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-emerald-900/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        {label && <SectionLabel text={label} />}
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-stone-300">{subtitle}</p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function XPChip({ points }: { points: number }) {
  return (
    <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 font-mono shadow-[0_0_10px_rgba(52,211,153,0.15)]">
      +{points} XP
    </span>
  );
}

export const inputClass =
  'h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30';

export const textareaClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-y min-h-[120px]';

export function PrimaryButton({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-8 py-4 text-base font-semibold text-neutral-950 transition-all hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl border border-emerald-500/30 bg-neutral-900/50 px-8 py-4 text-base font-semibold text-emerald-100 transition-all hover:bg-neutral-800 backdrop-blur-sm ${className}`}
    />
  );
}

export function PackageCard({
  title,
  price,
  description,
  includes,
  bestFor,
  cta,
  onBook,
  premium = false,
}: {
  title: string;
  price: string;
  description: string;
  includes: string[];
  bestFor?: string | string[];
  cta: string;
  onBook: () => void;
  premium?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border p-8 flex flex-col h-full transition-all hover:border-emerald-500/30 ${
        premium
          ? 'border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-neutral-950 shadow-[0_0_40px_rgba(251,146,60,0.08)]'
          : 'border-white/10 bg-neutral-950/80'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <span
          className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold ${
            premium ? 'bg-orange-400/10 text-orange-300 border border-orange-400/20' : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
          }`}
        >
          {price}
        </span>
      </div>
      <p className="text-stone-400 leading-relaxed mb-6">{description}</p>
      <div className="mb-6 flex-grow">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Includes</p>
        <ul className="space-y-2">
          {includes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-stone-300">
              <span className="text-emerald-400 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {bestFor && (
        <div className="mb-6 pt-4 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Best for</p>
          <p className="text-sm text-stone-400 leading-relaxed">
            {Array.isArray(bestFor) ? bestFor.join(', ') : bestFor}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onBook}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
          premium
            ? 'bg-orange-400 text-neutral-950 hover:bg-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.2)]'
            : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

import { useContact } from '../ContactProvider';

export function BookButton({
  subject,
  body,
  className,
  children,
  variant = 'primary',
}: {
  subject: string;
  body?: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'premium';
}) {
  const { goToContact } = useContact();

  const base =
    variant === 'premium'
      ? 'rounded-2xl bg-orange-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.2)]'
      : variant === 'secondary'
        ? 'rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10'
        : 'rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]';

  return (
    <button
      type="button"
      onClick={() => goToContact(subject, body)}
      className={`inline-flex items-center justify-center transition-all ${base} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
