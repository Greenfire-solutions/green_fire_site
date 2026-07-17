import { useNavigate } from 'react-router-dom';
import type { OfferingItem } from '../types/content';
import { resolveButtonAction, youtubeToEmbedUrl, getOfferingPrice } from '../lib/contentHelpers';
import { useSiteContent } from '../context/ContentContext';
import { useContact } from './ContactProvider';
import { ArrowRight } from 'lucide-react';

type Props = {
  offering: OfferingItem;
  variant?: 'primary' | 'secondary' | 'premium';
  className?: string;
  showArrow?: boolean;
};

export function ContentButton({ offering, variant = 'primary', className = '', showArrow }: Props) {
  const content = useSiteContent();
  const { goToContact } = useContact();
  const navigate = useNavigate();
  const action = resolveButtonAction(offering, {
    email: content.settings.defaultBookingEmail || content.settings.contactEmail,
    internalPage: content.settings.defaultInternalPage || 'contact',
  });

  const base =
    variant === 'premium'
      ? 'rounded-2xl bg-orange-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.2)]'
      : variant === 'secondary'
        ? 'rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10'
        : 'rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-bold text-neutral-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]';

  const label = offering.buttonLabel || offering.title;

  const handleClick = () => {
    if (action.type === 'external_url' || action.type === 'youtube') {
      if (action.href) window.open(action.href, '_blank', 'noopener,noreferrer');
      return;
    }
    if (action.type === 'email' && action.href) {
      window.location.href = action.href;
      return;
    }
    if (action.type === 'internal_page' && action.path) {
      navigate(action.path);
      window.scrollTo(0, 0);
      return;
    }
    if (action.type === 'scroll_contact' || action.type === 'contact_form') {
      if (action.contactSubject || action.contactMessage) {
        goToContact(action.contactSubject || `Greenfire — ${offering.title}`, action.contactMessage);
      } else if (action.path) {
        navigate(action.path);
        window.scrollTo(0, 0);
      }
      return;
    }
    goToContact(`Greenfire — ${offering.title}`);
  };

  if (!label) return null;

  return (
    <button type="button" onClick={handleClick} className={`inline-flex items-center justify-center transition-all ${base} ${className}`}>
      {label}
      {showArrow && <ArrowRight className="ml-2 h-5 w-5" />}
    </button>
  );
}

export function OfferingMedia({ offering }: { offering: OfferingItem }) {
  const embed = youtubeToEmbedUrl(offering.youtubeUrl);
  if (embed) {
    return (
      <div className="mb-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          title={offering.title}
          src={embed}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (offering.thumbnailUrl) {
    return (
      <img
        src={offering.thumbnailUrl}
        alt={offering.title}
        className="mb-6 h-48 w-full rounded-2xl border border-white/10 object-cover"
      />
    );
  }
  if (offering.videoUrl) {
    return (
      <video src={offering.videoUrl} controls className="mb-6 w-full rounded-2xl border border-white/10" />
    );
  }
  return null;
}

export function PublicPackageCard({
  offering,
  onBook,
  premium,
}: {
  offering: OfferingItem;
  onBook: () => void;
  premium?: boolean;
}) {
  const isPremium = premium ?? offering.premium;
  return (
    <div
      className={`rounded-[2rem] border p-8 flex flex-col h-full transition-all hover:border-emerald-500/30 ${
        isPremium
          ? 'border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-neutral-950 shadow-[0_0_40px_rgba(251,146,60,0.08)]'
          : 'border-white/10 bg-neutral-950/80'
      }`}
    >
      <OfferingMedia offering={offering} />
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-2xl font-bold text-white">{offering.title}</h3>
        <span
          className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold ${
            isPremium ? 'bg-orange-400/10 text-orange-300 border border-orange-400/20' : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
          }`}
        >
          {getOfferingPrice(offering.price)}
        </span>
      </div>
      {offering.subtitle && <p className="text-emerald-300/80 text-sm mb-2">{offering.subtitle}</p>}
      <p className="text-stone-400 leading-relaxed mb-6">{offering.description}</p>
      {offering.includes.length > 0 && (
        <div className="mb-6 flex-grow">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Includes</p>
          <ul className="space-y-2">
            {offering.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-stone-300">
                <span className="text-emerald-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {offering.bestFor.length > 0 && (
        <div className="mb-6 pt-4 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Best for</p>
          <p className="text-sm text-stone-400 leading-relaxed">{offering.bestFor.join(', ')}</p>
        </div>
      )}
      {offering.addOns.length > 0 && (
        <div className="mb-6 pt-4 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Add-ons</p>
          <ul className="space-y-1 text-sm text-stone-400">
            {offering.addOns.map((a) => (
              <li key={a}>+ {a}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={onBook}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
          isPremium
            ? 'bg-orange-400 text-neutral-950 hover:bg-orange-300'
            : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300'
        }`}
      >
        {offering.buttonLabel || 'Book Now'}
      </button>
    </div>
  );
}
