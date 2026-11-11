import {
  BadgeCheck, BookCheck, Bot, Cable, CircleCheckBig, Clapperboard, Copy, EyeOff, Film, Filter, Fingerprint, HeartPulse, Lock, Megaphone,
  MonitorCheck, Mouse, MousePointerClick, Music, PenLine, Presentation, Radar, Route, Ruler, Scissors, ShieldCheck, Shirt, Telescope,
  UserRoundSearch, Video, Wrench, type LucideIcon,
} from 'lucide-react';

/* The icons a bot may name (bot.json "icon"). Listed one by one so only these
   ship; a name not listed here shows the plain bot icon. */
const ICONS: Record<string, LucideIcon> = {
  BadgeCheck, BookCheck, Cable, CircleCheckBig, Clapperboard, Copy, EyeOff, Film, Filter, Fingerprint, HeartPulse, Lock, Megaphone,
  MonitorCheck, Mouse, MousePointerClick, Music, PenLine, Presentation, Radar, Route, Ruler, Scissors, ShieldCheck, Shirt, Telescope,
  UserRoundSearch, Video, Wrench,
};
export const botIcon = (name: string): LucideIcon => ICONS[name] || Bot;
