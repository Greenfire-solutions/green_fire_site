/* ============================================================================
   GREEN FIRE SEO: SHARED GROUND
   ----------------------------------------------------------------------------
   Reading posts, checking them, and turning them into HTML. The build
   (build.mjs), the gate (check.mjs) and the operator's SEO tab all import this
   file, so "is this post ready" has exactly one answer.

   WHY THE BLOG IS STATIC HTML AND NOT A REACT PAGE. The rest of the site is a
   client rendered SPA: every URL serves the same empty <div id="root">. Google
   renders JavaScript eventually, but GPTBot, ClaudeBot and PerplexityBot read
   the HTML the server sends and stop there, so to them the site is blank.
   A blog that exists to be found cannot ship blank, so every post is written
   to its own index.html at build time, with no JavaScript at all.

   Posts live in content/blog/*.md. The plan (clusters, money pages, the
   phrases each post is for) lives in content/blog/plan.json. Site address and
   author live in src/config/seo.json. Nothing here carries its own copy.
   ========================================================================== */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import { checkImage } from './photos.mjs'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const POSTS_DIR = join(ROOT, 'content', 'blog')
export const PLAN_PATH = join(POSTS_DIR, 'plan.json')
export const SEO_PATH = join(ROOT, 'src', 'config', 'seo.json')
/* Topic pages: one evergreen page per subject Green Fire wants to be found
   for (solarpunk, bioregional AI, eco village technology...), served at a
   short top level address like /solarpunk. Unlike a post they have no date
   in the URL and no cluster; they are the hubs the blog clusters point at. */
export const PAGES_DIR = join(ROOT, 'content', 'pages')

export const readSeo = () => JSON.parse(readFileSync(SEO_PATH, 'utf8'))
export const readPlan = () => JSON.parse(readFileSync(PLAN_PATH, 'utf8'))

export const today = () => new Date().toISOString().slice(0, 10)

export const esc = s =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const slugify = s =>
  String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* --- reading ------------------------------------------------------------- */

/* Frontmatter is deliberately tiny: `key: value` lines and `[a, b]` lists.
   Not YAML, so there is no YAML parser to surprise anyone with "no" turning
   into false or a date turning into an object. */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: text, error: 'no frontmatter block (--- at the top and bottom)' }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    } else {
      val = val.replace(/^["']|["']$/g, '')
    }
    data[key] = val
  }
  return { data, body: m[2] }
}

export function readPosts() {
  if (!existsSync(POSTS_DIR)) return []
  return readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const file = join(POSTS_DIR, f)
      const { data, body, error } = parseFrontmatter(readFileSync(file, 'utf8'))
      const slug = data.slug || basename(f, '.md')
      return {
        file, slug, body, parseError: error,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        updated: data.updated || '',
        status: data.status || 'draft',
        cluster: data.cluster || '',
        keyword: data.keyword || '',
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        cta: data.cta || '',
        image: data.image || '',
        imageAlt: data.image_alt || '',
        url: `/blog/${slug}/`
      }
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.slug.localeCompare(b.slug))
}

export function readPages() {
  if (!existsSync(PAGES_DIR)) return []
  return readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const file = join(PAGES_DIR, f)
      const { data, body, error } = parseFrontmatter(readFileSync(file, 'utf8'))
      const slug = data.slug || basename(f, '.md')
      return {
        file, slug, body, parseError: error,
        title: data.title || '',
        description: data.description || '',
        h1: data.h1 || data.title || '',
        kicker: data.kicker || '',
        date: data.date || '',
        updated: data.updated || '',
        status: data.status || 'draft',
        keyword: data.keyword || '',
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        cta: data.cta || 'contact',
        url: `/${slug}`
      }
    })
}

/* Order and short label come from seo.json `topics`, the list the app's
   footer also reads, so there is one place to add a topic to the site. */
export function orderPages(pages, seo) {
  const at = path => { const i = (seo.topics || []).findIndex(t => t.path === path); return i < 0 ? 999 : i }
  return pages
    .map(p => ({ ...p, nav: (seo.topics || []).find(t => t.path === p.url)?.label || p.h1 }))
    .sort((a, b) => at(a.url) - at(b.url) || a.slug.localeCompare(b.slug))
}

export const words = md => md.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length
export const readingMinutes = md => Math.max(1, Math.round(words(md) / 230))

/* --- rendering ----------------------------------------------------------- */

/* One Marked instance per render so heading ids never leak between posts. */
export function renderMarkdown(md) {
  const seen = new Map()
  const headings = []
  const marked = new Marked({ gfm: true })
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens)
        let id = slugify(html) || 'section'
        const n = seen.get(id) || 0
        seen.set(id, n + 1)
        if (n) id += '-' + n
        if (depth === 2 || depth === 3) headings.push({ depth, id, text: html.replace(/<[^>]+>/g, '') })
        return `<h${depth} id="${id}">${html}</h${depth}>\n`
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href)
        const t = title ? ` title="${esc(title)}"` : ''
        return `<a href="${esc(href)}"${t}${external ? ' rel="noopener"' : ''}>${text}</a>`
      },
      image({ href, title, text }) {
        return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`
      }
    }
  })
  const html = marked.parse(md)
  return { html, headings }
}

/* Every link in a post, from the token stream rather than a regex over the
   text, so a URL inside a code block is never mistaken for a link. */
export function linksIn(md) {
  const out = []
  const walk = toks => {
    for (const t of toks || []) {
      if (t.type === 'link') out.push(t.href)
      if (t.type === 'image') out.push({ image: t.href, alt: t.text })
      if (t.tokens) walk(t.tokens)
      if (t.items) walk(t.items)
    }
  }
  walk(new Marked({ gfm: true }).lexer(md))
  return out
}

/* --- the gate ------------------------------------------------------------ */

/* Paths a post may link to on this site. A link to anything else is a dead
   link the moment it ships, so it is an error, not a warning. */
export function knownPaths(seo, posts, plan, pages = readPages()) {
  const set = new Set(Object.keys(seo.routes))
  for (const p of pages) { set.add(p.url); set.add(p.url + '/') }
  set.add('/blog/')
  set.add('/blog')
  for (const p of posts) { set.add(p.url); set.add(p.url.slice(0, -1)) }
  for (const c of plan.clusters) { set.add(`/blog/topic/${c.id}/`); set.add(`/blog/topic/${c.id}`) }
  return set
}

const DASHES = /[–—]/

/**
 * Every problem with one post. `errors` stop it going live; `warnings` are
 * worth fixing but do not. Draft posts are checked too, so the operator can
 * say "2 problems before this one can go out" while it is still a draft.
 */
export function checkPost(post, { seo, plan, posts }) {
  const errors = [], warnings = []
  const e = m => errors.push(m), w = m => warnings.push(m)
  if (post.parseError) e(post.parseError)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug)) e(`slug "${post.slug}" must be lowercase words joined by hyphens`)
  if (posts.filter(p => p.slug === post.slug).length > 1) e(`slug "${post.slug}" is used by more than one post`)
  if (!['draft', 'published'].includes(post.status)) e(`status must be draft or published, not "${post.status}"`)

  if (!post.title) e('no title')
  else {
    if (post.title.length < 20) w(`title is ${post.title.length} characters; under 20 rarely says enough`)
    if (post.title.length > 65) w(`title is ${post.title.length} characters; Google cuts it near 60`)
  }
  if (!post.description) e('no description (it is the snippet Google and AI answers show)')
  else if (post.description.length < 70 || post.description.length > 160) e(`description is ${post.description.length} characters; keep it 70 to 160`)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) e('date must be YYYY-MM-DD')
  else if (post.status === 'published' && post.date > today()) e(`dated ${post.date}, in the future; the build has no scheduler, so set today's date when it goes out`)
  if (post.updated && !/^\d{4}-\d{2}-\d{2}$/.test(post.updated)) e('updated must be YYYY-MM-DD')

  const cluster = plan.clusters.find(c => c.id === post.cluster)
  if (!cluster) e(`cluster "${post.cluster}" is not in content/blog/plan.json (${plan.clusters.map(c => c.id).join(', ')})`)
  if (!post.keyword) w('no keyword: the one phrase a stranger would type to need this post')

  for (const [where, text] of [['title', post.title], ['description', post.description], ['body', post.body]]) {
    if (DASHES.test(text)) e(`em or en dash in the ${where}: Jordan reads it as "a machine wrote this". Use a comma or a full stop`)
  }
  if (/\b(TODO|TK|XXX|lorem ipsum)\b|\{\{|\[\[/i.test(post.body)) e('placeholder text left in the body (TODO, TK, {{ or [[)')

  const n = words(post.body)
  if (n < 600) e(`${n} words; under 600 is a thin page, which is the one kind Google's scaled content policy targets`)
  if (!/^##\s/m.test(post.body)) w('no ## sections; long posts without headings are hard to skim and to quote')

  const known = knownPaths(seo, posts, plan)
  const links = linksIn(post.body)
  const internal = links.filter(l => typeof l === 'string' && l.startsWith('/'))
  for (const l of internal) {
    const path = l.split('#')[0].split('?')[0]
    if (!known.has(path)) e(`dead internal link ${l}`)
  }
  if (cluster && !internal.some(l => l.split('#')[0].replace(/\/$/, '') === cluster.moneyPage.replace(/\/$/, '') || cluster.moneyPage === '/')) {
    e(`never links to ${cluster.moneyPage}, the page this cluster exists to send people to`)
  }
  if (internal.length < 2) w(`${internal.length} internal link${internal.length === 1 ? '' : 's'}; two or more help both readers and crawlers`)
  for (const img of links.filter(l => typeof l === 'object')) {
    if (!img.alt) e(`image ${img.image} has no alt text`)
  }
  if (post.image && !post.imageAlt) e('image is set but image_alt is not')
  for (const m of checkImage(post, posts)) e(m)
  return { errors, warnings, words: n }
}

/* A topic page is held to a higher bar than a post: it is the page meant to
   rank for a whole subject, so it must be long enough to answer it, must link
   on to the other topics (a hub that links nowhere is a doorway page), and
   must not reuse an address the app or the blog already owns. */
export function checkPage(page, { seo, plan, posts, pages }) {
  const errors = [], warnings = []
  const e = m => errors.push(m), w = m => warnings.push(m)
  if (page.parseError) e(page.parseError)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug)) e(`slug "${page.slug}" must be lowercase words joined by hyphens`)
  if (seo.routes[page.url] || page.slug === 'blog' || page.slug === 'api' || page.slug === 'admin') e(`${page.url} is already an app route; pick another slug`)
  if (pages.filter(p => p.slug === page.slug).length > 1) e(`slug "${page.slug}" is used by more than one page`)
  if (!['draft', 'published'].includes(page.status)) e(`status must be draft or published, not "${page.status}"`)
  if (!page.title) e('no title')
  else if (page.title.length > 65) w(`title is ${page.title.length} characters; Google cuts it near 60`)
  if (!page.description) e('no description')
  else if (page.description.length < 70 || page.description.length > 160) e(`description is ${page.description.length} characters; keep it 70 to 160`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(page.date)) e('date must be YYYY-MM-DD')
  if (!page.keyword) w('no keyword')
  for (const [where, text] of [['title', page.title], ['description', page.description], ['h1', page.h1], ['body', page.body]]) {
    if (DASHES.test(text)) e(`em or en dash in the ${where}: Jordan reads it as "a machine wrote this". Use a comma or a full stop`)
  }
  if (/\b(TODO|TK|XXX|lorem ipsum)\b|\{\{|\[\[/i.test(page.body)) e('placeholder text left in the body (TODO, TK, {{ or [[)')
  const n = words(page.body)
  if (n < 900) e(`${n} words; a topic page has to answer the whole subject, 900 at least`)
  const known = knownPaths(seo, posts, plan, pages)
  const internal = linksIn(page.body).filter(l => typeof l === 'string' && l.startsWith('/'))
  for (const l of internal) if (!known.has(l.split('#')[0].split('?')[0])) e(`dead internal link ${l}`)
  const others = new Set(internal.map(l => l.split('#')[0].replace(/\/$/, '')).filter(l => pages.some(p => p.url === l && p.slug !== page.slug)))
  if (pages.length > 1 && others.size < 2) e(`links to ${others.size} other topic page${others.size === 1 ? '' : 's'}; link to at least two so the topics hold each other up`)
  return { errors, warnings, words: n }
}

export function checkAll() {
  const seo = readSeo(), plan = readPlan(), posts = readPosts(), pages = orderPages(readPages(), seo)
  const results = posts.map(p => ({ post: p, ...checkPost(p, { seo, plan, posts }) }))
  const pageResults = pages.map(p => ({ page: p, ...checkPage(p, { seo, plan, posts, pages }) }))
  const planErrors = []
  for (const c of plan.clusters) {
    if (!seo.routes[c.moneyPage] && c.moneyPage !== '/' && !pages.some(p => p.url === c.moneyPage && p.status === 'published')) planErrors.push(`cluster ${c.id}: money page ${c.moneyPage} is not a route in seo.json or a published topic page`)
  }
  for (const t of seo.topics || []) {
    if (!pages.some(p => p.url === t.path && p.status === 'published')) planErrors.push(`seo.json topics lists ${t.path}, which is not a published page in content/pages; the footer would link to nothing`)
  }
  for (const p of pages) {
    if (p.status === 'published' && !(seo.topics || []).some(t => t.path === p.url)) planErrors.push(`${p.url} is published but missing from seo.json topics, so no page links to it`)
  }
  return { seo, plan, posts, pages, results, pageResults, planErrors }
}
