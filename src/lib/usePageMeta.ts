import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seo from '../config/seo.json';

type RouteMeta = { title: string; description: string; h1: string };
const routes = seo.routes as Record<string, RouteMeta>;

function setMeta(selector: string, attr: 'name' | 'property' | 'rel', key: string, value: string, field = 'content') {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attr === 'rel' ? 'link' : 'meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(field, value);
}

/**
 * Title, description, canonical and robots for the current route, from
 * src/config/seo.json, the same file the build writes each route's static
 * HTML from. Called once, in SiteLayout, so no page carries its own copy.
 */
export function usePageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname !== '/' ? pathname.replace(/\/$/, '') : '/';
    const meta = routes[path];
    if (meta) {
      document.title = meta.title;
      setMeta('meta[name="description"]', 'name', 'description', meta.description);
      setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
      setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
    }
    setMeta('link[rel="canonical"]', 'rel', 'canonical', seo.siteUrl + path, 'href');
    const hidden = seo.noindex.some((p) => path === p || path.startsWith(`${p}/`));
    setMeta('meta[name="robots"]', 'name', 'robots', hidden ? 'noindex' : 'index,follow');
  }, [pathname]);
}
