import React, { createContext, useContext, useMemo } from 'react';
import type { SiteContent } from '../types/content';
import bundledContent from '../data/siteContent.json';

const ContentContext = createContext<SiteContent>(bundledContent as SiteContent);

export function ContentProvider({
  children,
  content,
}: {
  children: React.ReactNode;
  content?: SiteContent;
}) {
  const value = useMemo(() => content || (bundledContent as SiteContent), [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  return useContext(ContentContext);
}
