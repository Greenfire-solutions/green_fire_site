import {
  Video, Scissors, Mic, Music, Palette, Image, Globe, Settings, Layout,
  Compass, Radio, Film, Bot, GraduationCap, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Video, Scissors, Mic, Music, Palette, Image, Globe, Settings, Layout,
  Compass, Radio, Film, Bot, GraduationCap,
};

export function getServiceIcon(name?: string): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Video;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);
