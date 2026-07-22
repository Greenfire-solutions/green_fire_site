import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SiteContent } from '../types/content';
import bundledContent from '../data/siteContent.json';
import { ensureMediaShowcases } from '../lib/contentHelpers';

const ContentContext = createContext<SiteContent>(
  ensureMediaShowcases(bundledContent as SiteContent),
);

export function ContentProvider({
  children,
  content,
}: {
  children: React.ReactNode;
  content?: SiteContent;
}) {
  const [liveContent, setLiveContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (content) return;

    fetch('/api/content/public', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setLiveContent(ensureMediaShowcases(data as SiteContent));
        }
      })
      .catch(() => {
        /* bundled fallback stays in use */
      });
  }, [content]);

  const value = useMemo(
    () => ensureMediaShowcases(content || liveContent || (bundledContent as SiteContent)),
    [content, liveContent],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  return useContext(ContentContext);
}
