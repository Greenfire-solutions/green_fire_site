import { Bot, BookCheck, Cable, CircleCheckBig, Filter, Fingerprint, HeartPulse, MonitorCheck, MousePointerClick, PenLine, Ruler, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react';

/* The icons data/bots.ts may name. Listed one by one so only these ship. */
const ICONS: Record<string, LucideIcon> = { BookCheck, Cable, CircleCheckBig, Filter, Fingerprint, HeartPulse, MonitorCheck, MousePointerClick, PenLine, Ruler, ShieldCheck, Wrench };
export const botIcon = (name: string): LucideIcon => ICONS[name] || Bot;
