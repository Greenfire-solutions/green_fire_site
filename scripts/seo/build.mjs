#!/usr/bin/env node
/* ============================================================================
   GREEN FIRE SEO: THE BUILD
   ----------------------------------------------------------------------------
   Runs after `vite build` (see package.json) and writes into dist/:

     blog/index.html                 every published post, newest first
     blog/<slug>/index.html          each post, full HTML, zero JavaScript
     blog/topic/<cluster>/index.html each topic hub, pillar post first
     blog/feed.xml                   RSS, for readers and for aggregators
     <topic>/index.html              each topic page (content/pages/*.md), the
                                     evergreen hubs for solarpunk, bioregional
                                     AI and the rest, at a short address
     <route>/index.html              a real HTML file per SPA page, with its own
                                     title, description, canonical and heading,
                                     so a crawler that runs no JavaScript sees
                                     the right page instead of an empty div
     sitemap.xml, robots.txt, llms.txt, 404.html

   Vercel serves a file that exists before it applies the SPA rewrite, so all
   of these win over index.html with no other configuration.

   A published post with an error FAILS THE BUILD. Vercel then keeps serving
   the last good deploy, which is the safe direction: a broken post never goes
   out, and nothing already live disappears. Drafts are never written, except
   by the local preview below.
   ========================================================================== */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { checkAll, renderMarkdown, readingMinutes, esc, ROOT } from './lib.mjs'

const DIST = join(ROOT, 'dist')
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html is missing. Run `vite build` first (npm run build does both).')
  process.exit(1)
}

const { seo, plan, results, pageResults, planErrors } = checkAll()
const SITE = seo.siteUrl.replace(/\/$/, '')
const abs = p => SITE + p

const failing = results.filter(r => r.post.status === 'published' && r.errors.length)
const failingPages = pageResults.filter(r => r.page.status === 'published' && r.errors.length)
if (planErrors.length || failing.length || failingPages.length) {
  for (const m of planErrors) console.error('plan: ' + m)
  for (const r of failing) for (const m of r.errors) console.error(`${r.post.slug}: ${m}`)
  for (const r of failingPages) for (const m of r.errors) console.error(`${r.page.url}: ${m}`)
  console.error('\nBlog build refused. Fix the above, or set the post back to `status: draft`.')
  process.exit(1)
}

/* BLOG_DRAFTS=1 (npm run blog:preview) also writes drafts that pass the gate,
   marked noindex with a DRAFT banner, so Jordan can read one in the browser
   before saying yes. Refused on Vercel, so a draft can never reach the live site. */
const withDrafts = process.env.BLOG_DRAFTS === '1'
if (withDrafts && process.env.VERCEL) { console.error('BLOG_DRAFTS is for local preview only; refusing on Vercel.'); process.exit(1) }
const published = results.filter(r => r.post.status === 'published' || (withDrafts && !r.errors.length)).map(r => r.post)
const isDraft = p => p.status !== 'published'
const live = published.filter(p => !isDraft(p))
const topics = pageResults.filter(r => r.page.status === 'published' || (withDrafts && !r.errors.length)).map(r => r.page)
const liveTopics = topics.filter(t => t.status === 'published')
const clusterOf = id => plan.clusters.find(c => c.id === id)
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

const write = (rel, content) => {
  const file = join(DIST, rel)
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, content)
}

/* --- the page shell, shared by every blog page --------------------------- */

const CSS = `
:root{--bg:#0a0a0a;--panel:#141414;--line:rgba(255,255,255,.08);--text:#f5f5f4;--soft:#d6d3d1;--dim:#a8a29e;--faint:#78716c;--accent:#34d399;--accent-soft:rgba(52,211,153,.12);color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:17px/1.7 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-underline-offset:3px}a:hover{color:#6ee7b7}
.top{position:sticky;top:0;z-index:5;border-bottom:1px solid var(--line);background:rgba(10,10,10,.92);backdrop-filter:blur(10px)}
.top .in{max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.02em;margin-right:auto}
.brand i{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(52,211,153,.3);font-style:normal}
.top nav{display:flex;gap:4px;flex-wrap:wrap}
@media(max-width:640px){.top nav{flex-wrap:nowrap;overflow-x:auto;width:100%;margin:0 -4px;scrollbar-width:none}.top nav::-webkit-scrollbar{display:none}.top nav a{white-space:nowrap}.crumbs{overflow-wrap:anywhere}}
.top nav a{color:var(--dim);text-decoration:none;font-size:13px;font-weight:600;padding:6px 11px;border-radius:999px}
.top nav a:hover,.top nav a.on{color:#6ee7b7;background:var(--accent-soft)}
.wrap{max-width:720px;margin:0 auto;padding:40px 16px 72px}
.wide{max-width:1000px}
.crumbs{font-size:13px;color:var(--faint);margin:0 0 18px}.crumbs a{color:var(--dim);text-decoration:none}
.kicker{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
h1{font-size:clamp(30px,5vw,44px);line-height:1.15;margin:0 0 14px;letter-spacing:-.01em}
.lede{font-size:19px;color:var(--soft);margin:0 0 18px}
.meta{font-size:14px;color:var(--faint);margin:0 0 30px}
article h2{font-size:26px;line-height:1.3;margin:44px 0 12px}
article h3{font-size:20px;margin:30px 0 8px}
article p,article li{color:var(--soft)}article strong{color:var(--text)}
article img{max-width:100%;height:auto;border-radius:12px}
article blockquote{margin:24px 0;padding:4px 20px;border-left:3px solid var(--accent);color:var(--dim)}
article code{background:var(--panel);padding:2px 6px;border-radius:6px;font-size:.9em}
article pre{background:var(--panel);padding:16px;border-radius:12px;overflow-x:auto}article pre code{padding:0;background:none}
article table{border-collapse:collapse;width:100%;display:block;overflow-x:auto}article th,article td{border:1px solid var(--line);padding:8px 10px;text-align:left}
.toc{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:0 0 30px;font-size:15px}
.toc b{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:6px}
.toc ol{margin:0;padding-left:20px}.toc a{color:var(--soft);text-decoration:none}.toc a:hover{color:var(--accent)}
.cta{margin:48px 0 0;padding:26px;border-radius:18px;background:linear-gradient(135deg,rgba(52,211,153,.14),rgba(52,211,153,.04));border:1px solid rgba(52,211,153,.25)}
.cta h2{margin:0 0 8px;font-size:22px}.cta p{margin:0 0 16px;color:var(--soft)}
.btn{display:inline-block;background:var(--accent);color:#0a0a0a;font-weight:700;text-decoration:none;padding:11px 20px;border-radius:999px;font-size:15px}.btn:hover{background:#6ee7b7;color:#0a0a0a}
.author{display:flex;gap:16px;margin:40px 0 0;padding:22px 0 0;border-top:1px solid var(--line);font-size:15px;color:var(--dim)}
.author b{color:var(--text);display:block}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:20px 0 0}
.card{display:block;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px;text-decoration:none;color:var(--text)}
.card:hover{border-color:rgba(52,211,153,.4)}.card h3{margin:6px 0 8px;font-size:19px;line-height:1.35}.card p{margin:0;color:var(--dim);font-size:15px}
.card small{color:var(--faint);font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.topics{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}
.topics a{font-size:13px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);color:var(--soft);text-decoration:none}.topics a:hover,.topics a.on{border-color:var(--accent);color:var(--accent)}
.empty{color:var(--dim);background:var(--panel);border-radius:14px;padding:20px}
footer{border-top:1px solid var(--line);color:var(--faint);font-size:13px}footer .in{max-width:1100px;margin:0 auto;padding:28px 16px;display:flex;flex-wrap:wrap;gap:10px 20px}
footer a{color:var(--dim);text-decoration:none}footer a:hover{color:var(--accent)}
footer span{margin-right:auto}
`

const NAV = [['/', 'Home'], ['/start', 'AI Help'], ['/tech', 'Tech'], ['/open-source', 'Open Source'], ['/blog/', 'Blog'], ['/get-involved', 'Get Involved']]
/* Every static page's footer carries every topic, so each topic page is one
   link from anywhere a crawler lands. */
const topicFooter = () => liveTopics.map(t => `<a href="${t.url}">${esc(t.nav)}</a>`).join('')

function page({ path, title, description, body, head = '', graph = [], type = 'website', image, noindex = false }) {
  const img = abs(image || seo.defaultImage)
  const ld = graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>` : ''
  const nav = NAV.map(([h, l]) => `<a href="${h}"${(h === '/blog/' && path.startsWith('/blog')) ? ' class="on" aria-current="page"' : ''}>${l}</a>`).join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(abs(path))}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="${esc(seo.siteName)} blog" href="/blog/feed.xml">
<meta property="og:site_name" content="${esc(seo.siteName)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(abs(path))}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
${head}${ld}
<style>${CSS.replace(/\n/g, '')}</style>
</head>
<body>
<header class="top"><div class="in"><a class="brand" href="/"><i aria-hidden="true">&#128293;</i>${esc(seo.siteName)}</a><nav aria-label="Primary">${nav}</nav></div></header>
${body}
<footer><div class="in"><span>&copy; ${new Date().getFullYear()} ${esc(seo.organization)}</span>${topicFooter()}<a href="/blog/">Blog</a><a href="/blog/feed.xml">RSS</a><a href="/how-it-works">About</a><a href="/contact">Contact</a></div></footer>
</body>
</html>
`
}

/* --- shared JSON-LD pieces ----------------------------------------------- */

const ORG = { '@type': 'Organization', '@id': abs('/#org'), name: seo.organization, alternateName: seo.alternateNames, url: abs('/'), logo: abs(seo.defaultImage), description: seo.routes['/'].description, knowsAbout: seo.knowsAbout, sameAs: seo.organizationSameAs, founder: { '@id': abs('/#author') } }
const PERSON = { '@type': 'Person', '@id': abs('/#author'), name: seo.author.name, jobTitle: seo.author.role, description: seo.author.bio, sameAs: seo.author.sameAs, worksFor: { '@id': abs('/#org') } }
const crumbs = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) }))
})
const crumbHtml = items => `<p class="crumbs">${items.map(([n, p], i) => i === items.length - 1 ? esc(n) : `<a href="${p}">${esc(n)}</a>`).join(' / ')}</p>`

/* What each post asks the reader to do next. The wording lives here once;
   a post only names which one. */
const CTAS = {
  start: { h: 'Want this working in your business?', p: 'Take a seat at the AI workshop, book a one to one dashboard session, or have the dashboard built for you.', href: '/start', btn: 'See the AI options' },
  tech: { h: 'Show people the project before it exists', p: 'Interactive 3D maps and walkthroughs for land projects, builds, festivals and fundraising.', href: '/tech', btn: 'See the 3D work' },
  'open-source': { h: 'Bring it to your community', p: 'The Greenfire Creator Commons and BioRegional OS are open for any community to adapt.', href: '/open-source', btn: 'Explore the open source work' },
  land: { h: 'Bring your land project in', p: 'Tell us about the land, the people and what you want to build. We will show you the map, the software and the first steps.', href: '/contact', btn: 'Start a land project conversation' },
  contact: { h: 'Talk it through', p: 'Tell us what you are working on and we will point you to the right help.', href: '/contact', btn: 'Get in touch' }
}
const ctaHtml = key => { const c = CTAS[key] || CTAS.contact; return `<aside class="cta"><h2>${esc(c.h)}</h2><p>${esc(c.p)}</p><a class="btn" href="${c.href}">${esc(c.btn)}</a></aside>` }

const cardHtml = p => {
  const c = clusterOf(p.cluster)
  return `<a class="card" href="${p.url}"><small>${esc(c ? c.name : '')} · ${esc(fmtDate(p.date))}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></a>`
}

/* --- posts --------------------------------------------------------------- */

for (const p of published) {
  const c = clusterOf(p.cluster)
  const { html, headings } = renderMarkdown(p.body)
  const h2s = headings.filter(h => h.depth === 2)
  const toc = h2s.length >= 3 ? `<nav class="toc" aria-label="Contents"><b>In this post</b><ol>${h2s.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>` : ''
  const related = published.filter(o => o.slug !== p.slug && o.cluster === p.cluster)
    .concat(published.filter(o => o.slug !== p.slug && o.cluster !== p.cluster)).slice(0, 3)
  const path = p.url
  const trail = [['Home', '/'], ['Blog', '/blog/'], [c.name, `/blog/topic/${c.id}/`], [p.title, path]]
  const updated = p.updated && p.updated !== p.date ? ` · Updated ${fmtDate(p.updated)}` : ''
  const body = `<main class="wrap">
${isDraft(p) ? '<p style="background:#78350f;color:#fef3c7;padding:10px 14px;border-radius:10px;font-weight:700">DRAFT preview. Not on the live site until it is set to published.</p>' : ''}
${crumbHtml(trail)}
<article>
<p class="kicker"><a href="/blog/topic/${c.id}/" style="text-decoration:none">${esc(c.name)}</a></p>
<h1>${esc(p.title)}</h1>
<p class="lede">${esc(p.description)}</p>
<p class="meta">By ${esc(seo.author.name)} · <time datetime="${p.date}">${fmtDate(p.date)}</time>${updated} · ${readingMinutes(p.body)} min read</p>
${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="1200" height="630">` : ''}
${toc}
${html}
${ctaHtml(p.cta || c.cta)}
<div class="author"><div><b>${esc(seo.author.name)}</b>${esc(seo.author.bio)}</div></div>
</article>
${related.length ? `<h2 style="margin:56px 0 0;font-size:22px">Keep reading</h2><div class="cards">${related.map(cardHtml).join('')}</div>` : ''}
</main>`
  const graph = [
    {
      '@type': 'BlogPosting', '@id': abs(path) + '#post', headline: p.title, description: p.description,
      datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: abs(path),
      author: { '@id': abs('/#author') }, publisher: { '@id': abs('/#org') },
      image: abs(p.image || seo.defaultImage), articleSection: c.name,
      keywords: [p.keyword, ...p.tags].filter(Boolean).join(', '), wordCount: results.find(r => r.post === p).words,
      inLanguage: 'en-US'
    },
    crumbs(trail), PERSON, ORG
  ]
  const head = `<meta property="article:published_time" content="${p.date}">\n<meta property="article:modified_time" content="${p.updated || p.date}">\n<meta name="author" content="${esc(seo.author.name)}">\n`
  write(`blog/${p.slug}/index.html`, page({ path, title: `${p.title} | ${seo.siteName}`, description: p.description, body, head, graph, type: 'article', image: p.image, noindex: isDraft(p) }))
}

/* --- topic pages ---------------------------------------------------------- */

/* "## Common questions" with "### question" under it becomes FAQPage data,
   read from the same text the reader sees, so the two can never disagree. */
function faqOf(md) {
  const m = md.match(/^## Common questions\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m)
  if (!m) return []
  return m[1].split(/^### /m).slice(1).map(chunk => {
    const [q, ...rest] = chunk.split('\n')
    const a = rest.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()
    return { '@type': 'Question', name: q.trim(), acceptedAnswer: { '@type': 'Answer', text: a } }
  }).filter(x => x.name && x.acceptedAnswer.text)
}

for (const t of topics) {
  const { html, headings } = renderMarkdown(t.body)
  const h2s = headings.filter(h => h.depth === 2)
  const toc = h2s.length >= 3 ? `<nav class="toc" aria-label="Contents"><b>On this page</b><ol>${h2s.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>` : ''
  const trail = [['Home', '/'], [t.nav, t.url]]
  const others = topics.filter(o => o.slug !== t.slug)
  const related = live.filter(p => (t.tags || []).some(tag => [p.keyword, ...p.tags].join(' ').toLowerCase().includes(tag.toLowerCase()))).slice(0, 3)
  const faq = faqOf(t.body)
  const body = `<main class="wrap">
${t.status !== 'published' ? '<p style="background:#78350f;color:#fef3c7;padding:10px 14px;border-radius:10px;font-weight:700">DRAFT preview. Not on the live site until it is set to published.</p>' : ''}
${crumbHtml(trail)}
<article>
${t.kicker ? `<p class="kicker">${esc(t.kicker)}</p>` : ''}
<h1>${esc(t.h1)}</h1>
<p class="lede">${esc(t.description)}</p>
<p class="meta">By ${esc(seo.author.name)} · Updated <time datetime="${t.updated || t.date}">${fmtDate(t.updated || t.date)}</time></p>
${toc}
${html}
${ctaHtml(t.cta)}
<div class="author"><div><b>${esc(seo.author.name)}</b>${esc(seo.author.bio)}</div></div>
</article>
${others.length ? `<h2 style="margin:56px 0 0;font-size:22px">More from Green Fire</h2><div class="cards">${others.map(o => `<a class="card" href="${o.url}"><small>${esc(o.kicker || 'Topic')}</small><h3>${esc(o.h1)}</h3><p>${esc(o.description)}</p></a>`).join('')}</div>` : ''}
${related.length ? `<h2 style="margin:40px 0 0;font-size:22px">From the blog</h2><div class="cards">${related.map(cardHtml).join('')}</div>` : ''}
</main>`
  const graph = [
    {
      '@type': 'WebPage', '@id': abs(t.url) + '#page', url: abs(t.url), name: t.title, headline: t.h1, description: t.description,
      datePublished: t.date, dateModified: t.updated || t.date, inLanguage: 'en-US',
      about: (t.tags || []).map(name => ({ '@type': 'Thing', name })), keywords: [t.keyword, ...t.tags].filter(Boolean).join(', '),
      author: { '@id': abs('/#author') }, publisher: { '@id': abs('/#org') }, isPartOf: { '@id': abs('/#site') },
      breadcrumb: crumbs(trail)
    },
    ...(faq.length ? [{ '@type': 'FAQPage', '@id': abs(t.url) + '#faq', mainEntity: faq }] : []),
    PERSON, ORG
  ]
  const head = `<meta name="author" content="${esc(seo.author.name)}">\n${t.tags.length ? `<meta name="keywords" content="${esc([t.keyword, ...t.tags].filter(Boolean).join(', '))}">\n` : ''}`
  write(`${t.slug}/index.html`, page({ path: t.url, title: t.title, description: t.description, body, head, graph, noindex: t.status !== 'published' }))
}

/* --- blog index and topic hubs ------------------------------------------- */

const topicNav = on => `<nav class="topics" aria-label="Topics"><a href="/blog/"${on ? '' : ' class="on"'}>All</a>${plan.clusters.map(c => `<a href="/blog/topic/${c.id}/"${on === c.id ? ' class="on"' : ''}>${esc(c.name)}</a>`).join('')}</nav>`
const BLOG_DESC = 'Field notes from Green Fire on putting AI to work in small businesses and music, interactive 3D for land and events, and open source tools for community.'

write('blog/index.html', page({
  path: '/blog/', title: `Blog | ${seo.siteName}`, description: BLOG_DESC,
  graph: [{ '@type': 'Blog', '@id': abs('/blog/#blog'), name: `${seo.siteName} blog`, description: BLOG_DESC, url: abs('/blog/'), publisher: { '@id': abs('/#org') }, blogPost: published.map(p => ({ '@id': abs(p.url) + '#post' })) }, crumbs([['Home', '/'], ['Blog', '/blog/']]), ORG],
  body: `<main class="wrap wide">${crumbHtml([['Home', '/'], ['Blog', '/blog/']])}<h1>The Green Fire blog</h1><p class="lede">${esc(BLOG_DESC)}</p>${topicNav()}
${published.length ? `<div class="cards">${published.map(cardHtml).join('')}</div>` : '<p class="empty">The first posts are being written.</p>'}</main>`
}))

for (const c of plan.clusters) {
  const posts = published.filter(p => p.cluster === c.id)
  posts.sort((a, b) => (b.slug === c.pillar) - (a.slug === c.pillar))
  const path = `/blog/topic/${c.id}/`
  const trail = [['Home', '/'], ['Blog', '/blog/'], [c.name, path]]
  write(`blog/topic/${c.id}/index.html`, page({
    path, title: `${c.name} | ${seo.siteName} blog`, description: c.intro, noindex: !posts.some(p => !isDraft(p)),
    graph: [{ '@type': 'CollectionPage', name: c.name, description: c.intro, url: abs(path), hasPart: posts.map(p => ({ '@id': abs(p.url) + '#post' })) }, crumbs(trail), ORG],
    body: `<main class="wrap wide">${crumbHtml(trail)}<h1>${esc(c.name)}</h1><p class="lede">${esc(c.intro)}</p>${topicNav(c.id)}
${posts.length ? `<div class="cards">${posts.map(cardHtml).join('')}</div>` : '<p class="empty">Posts on this are being written.</p>'}${ctaHtml(c.cta)}</main>`
  }))
}

/* --- a real HTML file for every SPA route -------------------------------- */

/* The built index.html, with this route's head and a plain heading inside
   #root. React's createRoot replaces whatever is in #root on its first render,
   so visitors see the app as before, and a crawler that never runs the app
   still reads the same title, description and heading the app would show. */
const shell = readFileSync(join(DIST, 'index.html'), 'utf8')
const routeLinks = [...NAV, ['/offerings', 'Offerings'], ['/contact', 'Contact'], ...liveTopics.map(t => [t.url, t.nav])]
for (const [route, m] of Object.entries(seo.routes)) {
  const graph = route === '/'
    ? [ORG, { '@type': 'WebSite', '@id': abs('/#site'), name: seo.siteName, alternateName: seo.alternateNames, url: abs('/'), publisher: { '@id': abs('/#org') }, about: seo.knowsAbout }, PERSON]
    : [crumbs([['Home', '/'], [m.h1, route]]), ORG]
  const head = `<link rel="canonical" href="${esc(abs(route))}">
    <meta property="og:site_name" content="${esc(seo.siteName)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(m.title)}">
    <meta property="og:description" content="${esc(m.description)}">
    <meta property="og:url" content="${esc(abs(route))}">
    <meta property="og:image" content="${esc(abs(seo.defaultImage))}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="alternate" type="application/rss+xml" title="${esc(seo.siteName)} blog" href="/blog/feed.xml">
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
  </head>`
  const fallback = `<div id="root"><div style="background:#0a0a0a;color:#f5f5f4;min-height:100vh;padding:48px 16px;font-family:system-ui,sans-serif"><div style="max-width:720px;margin:0 auto"><h1 style="font-size:32px;line-height:1.2">${esc(m.h1)}</h1><p style="color:#d6d3d1;font-size:18px">${esc(m.description)}</p>${(m.about || []).map(t => `<p style="color:#a8a29e;font-size:16px;line-height:1.7">${esc(t)}</p>`).join('')}<nav aria-label="Site" style="display:flex;flex-wrap:wrap;gap:8px 16px">${routeLinks.map(([h, l]) => `<a href="${h}" style="color:#34d399">${l}</a>`).join('')}</nav></div></div></div>`
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace('</head>', head)
    .replace('<div id="root"></div>', fallback)
  if (!html.includes(fallback)) { console.error('Could not find <div id="root"></div> in dist/index.html; the route shells would be empty.'); process.exit(1) }
  write(route === '/' ? 'index.html' : `${route.slice(1)}/index.html`, html)
}

/* --- sitemap, robots, feed, llms.txt, 404 -------------------------------- */

const urls = [
  ...Object.keys(seo.routes).filter(r => !seo.noindex.includes(r)).map(r => ({ loc: abs(r) })),
  ...liveTopics.map(t => ({ loc: abs(t.url), lastmod: t.updated || t.date })),
  { loc: abs('/blog/'), lastmod: live[0]?.updated || live[0]?.date },
  ...plan.clusters.filter(c => live.some(p => p.cluster === c.id)).map(c => ({ loc: abs(`/blog/topic/${c.id}/`) })),
  ...live.map(p => ({ loc: abs(p.url), lastmod: p.updated || p.date }))
]
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`)

/* AI answer engines are welcome: being quoted by ChatGPT, Claude and
   Perplexity is a way in for the same people search would send. Only the
   admin and the API are closed. */
write('robots.txt', `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${abs('/sitemap.xml')}
`)

const rfc822 = d => new Date(d + 'T12:00:00Z').toUTCString()
write('blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(seo.siteName)} blog</title>
<link>${abs('/blog/')}</link>
<atom:link href="${abs('/blog/feed.xml')}" rel="self" type="application/rss+xml"/>
<description>${esc(BLOG_DESC)}</description>
<language>en-us</language>
${live.slice(0, 30).map(p => `<item><title>${esc(p.title)}</title><link>${abs(p.url)}</link><guid isPermaLink="true">${abs(p.url)}</guid><pubDate>${rfc822(p.date)}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}
</channel>
</rss>
`)

write('llms.txt', `# ${seo.organization}

> ${seo.routes['/'].description}

${seo.author.bio}

## Pages
${Object.entries(seo.routes).filter(([r]) => !seo.noindex.includes(r)).map(([r, m]) => `- [${m.h1}](${abs(r)}): ${m.description}`).join('\n')}

## Topics
${liveTopics.map(t => `- [${t.h1}](${abs(t.url)}): ${t.description}`).join('\n') || '- None yet.'}

## Blog
${live.map(p => `- [${p.title}](${abs(p.url)}): ${p.description}`).join('\n') || '- No posts yet.'}
`)

write('404.html', page({
  path: '/404', title: `Not found | ${seo.siteName}`, description: 'This page does not exist.', noindex: true,
  body: `<main class="wrap"><h1>That page is not here</h1><p class="lede">It may have moved. The blog and the rest of the site are one click away.</p><p><a class="btn" href="/blog/">Go to the blog</a></p></main>`
}))

const drafts = results.filter(r => r.post.status !== 'published')
console.log(`blog: ${live.length} published, ${drafts.length} draft${drafts.length === 1 ? '' : 's'} ${withDrafts ? 'previewed (noindex)' : 'held back'}; ${liveTopics.length} topic pages; ${Object.keys(seo.routes).length} route pages; sitemap ${urls.length} URLs`)
