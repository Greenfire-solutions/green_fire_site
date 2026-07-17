import type { StatusItem } from '../config/statusConfig';
import { STATUS_STYLES } from '../config/statusConfig';

export function StatusBadge({ item, className = '' }: { item: StatusItem; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[item.status]} ${className}`}
      title={item.description}
    >
      {item.statusLabel}
    </span>
  );
}

export function StatusNote({ item }: { item: StatusItem }) {
  if (!item.description) return null;
  return (
    <p className="mt-3 text-xs text-stone-500 leading-relaxed flex flex-wrap items-center gap-2">
      <StatusBadge item={item} />
      <span>{item.description}</span>
    </p>
  );
}
