/* ============================================================================
   BLOG PHOTOS: A REAL PICTURE AT THE TOP OF EVERY POST, NEVER AN AI ONE
   ----------------------------------------------------------------------------
   Jordan's rule (2026-10-26): every post opens with a cool picture that is
   never AI and always a real photograph.

   The rule is held by a list, not by a promise. content/blog/photos.json is
   the only place a post's top picture may come from, and the gate (lib.mjs)
   refuses a published post whose `image` is not on it. Only two things ever
   go on the list:
     own      his photographs, added by hand from his own folders
     commons  a Wikimedia Commons file with a free licence AND the camera's
              own record (EXIF Make and Model) in the file. A generated image
              has no camera, so it cannot get on the list by this route.
   Nothing on this path makes a picture.

   Each picture is used by one published post only (he will not show the same
   picture twice), and a Commons picture carries its photographer and licence
   under it, which the licences require.

   This file is the same in Green_Fire and in the GMS site (50_Website). They
   are separate repos that deploy separately; change both.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const PHOTOS_PATH = join(ROOT, 'content', 'blog', 'photos.json')
export const PHOTO_DIR = join(ROOT, 'public', 'blog', 'photos')
const WEB_DIR = '/blog/photos/'

export const readPhotos = () => existsSync(PHOTOS_PATH) ? JSON.parse(readFileSync(PHOTOS_PATH, 'utf8')).photos : []
const writePhotos = photos => writeFileSync(PHOTOS_PATH, JSON.stringify({ comment: 'Real photographs only. See scripts/seo/photos.mjs before adding one.', photos }, null, 2) + '\n')

export const photoFor = (image, photos = readPhotos()) => photos.find(p => p.file === image)

/* The line under a picture. His own need none; a licence that asks for
   credit gets photographer, licence and the file's page. */
export const creditOf = photo => !photo || photo.source === 'own' ? '' : `Photo: ${photo.credit}, ${photo.license}, via Wikimedia Commons`

/** Gate errors for one published post's top picture. */
export function checkImage(post, posts, photos = readPhotos()) {
  const errors = []
  if (post.status !== 'published') return errors
  if (!post.image) return ['no top picture: a published post opens with a real photo from content/blog/photos.json']
  const photo = photoFor(post.image, photos)
  if (!photo) return [`top picture ${post.image} is not on content/blog/photos.json, the list of real photographs`]
  if (photo.source === 'commons' && !photo.camera) errors.push(`${post.image} has no camera record, so it cannot be shown as a real photograph`)
  if (!['own', 'commons'].includes(photo.source)) errors.push(`${post.image} has source "${photo.source}"; only own or commons are allowed`)
  if (!existsSync(join(ROOT, 'public', post.image))) errors.push(`${post.image} is on the list but the file is missing from public/`)
  const twin = posts.find(o => o.slug !== post.slug && o.status === 'published' && o.image === post.image)
  if (twin) errors.push(`${post.image} is already the picture on "${twin.title}"; each post gets its own`)
  return errors
}

/* --- picking ---------------------------------------------------------------- */

const STOP = new Set('a an and the of for to in on with your you my how what why is are it its at by from or ai'.split(' '))
const wordsOf = s => String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w))

function score(photo, want) {
  const tags = new Set(photo.tags.flatMap(wordsOf))
  return want.filter(w => tags.has(w)).length
}

/** The best unused photo on the list for a post, or null. */
export function bestOnList(post, posts, photos = readPhotos()) {
  const used = new Set(posts.filter(p => p.slug !== post.slug && p.image).map(p => p.image))
  const want = [...new Set([post.keyword, ...post.tags, post.cluster, post.title].flatMap(wordsOf))]
  return photos
    .filter(p => !used.has(p.file))
    .map(p => ({ p, s: score(p, want) + (p.source === 'own' ? 0.5 : 0) }))
    .filter(x => x.s >= 1)
    .sort((a, b) => b.s - a.s)[0]?.p || null
}

const UA = 'BlogPhotos/1.0 (real photographs for a small blog; one search a week)'
const curl = (args, opts = {}) => execFileSync('/usr/bin/curl', ['-sSL', '--max-time', '60', '-A', UA, ...args], { maxBuffer: 64 * 1024 * 1024, ...opts })

const FREE = /^(cc0|public domain|pd\b|pdm|cc by(-sa)? \d(\.\d)?( \w+)?)/i
const MADE = /\b(ai[- ]generated|artificial intelligence generated|midjourney|dall-?e|stable diffusion|generative ai|ai art|computer[- ]generated|render(ing)?s?\b|3d model)/i
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s*[\u2013\u2014]\s*/g, ', ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()

function commonsSearch(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '40',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata|metadata', iiurlwidth: '1600'
  })
  const d = JSON.parse(curl([url]).toString())
  return Object.values(d.query?.pages || {}).sort((a, b) => a.index - b.index)
}

/* A Commons file is a real photograph when its own EXIF names a camera, its
   licence is free, it is a big landscape JPEG, and nothing in its name,
   description or categories says it was generated or rendered. */
function asReal(page) {
  const ii = page.imageinfo?.[0]
  if (!ii || ii.mime !== 'image/jpeg' || ii.width < 1600 || ii.width < ii.height * 1.2) return null
  const exif = Object.fromEntries((ii.metadata || []).map(m => [m.name, m.value]))
  const make = String(exif.Make || '').trim(), model = String(exif.Model || '').trim()
  if (!make || !model) return null
  const e = ii.extmetadata || {}
  const license = strip(e.LicenseShortName?.value)
  if (!FREE.test(license)) return null
  const said = [page.title, strip(e.ImageDescription?.value), strip(e.Categories?.value), strip(e.Credit?.value)].join(' ')
  if (MADE.test(said)) return null
  return {
    title: page.title, thumb: ii.thumburl, page: ii.descriptionurl, license,
    credit: strip(e.Artist?.value).slice(0, 80) || 'unknown photographer',
    camera: `${make} ${model}`.replace(/\s+/g, ' '),
    description: strip(e.ImageDescription?.value).slice(0, 200) || page.title.replace(/^File:|\.[a-z]+$/gi, ''),
    quality: /quality images|featured pictures|valued images/i.test(strip(e.Categories?.value))
  }
}

/* Claude on this Mac (the same CLI the writers use). Two small jobs only:
   suggest what a good photo for the post would show, and look at the real
   candidates and choose. It never makes or edits a picture. */
function claudeBin() {
  for (const b of [join(process.env.HOME || '', '.local', 'bin', 'claude'), '/usr/local/bin/claude', '/opt/homebrew/bin/claude']) if (existsSync(b)) return b
  return 'claude'
}
function ask(prompt, { dir } = {}) {
  const args = ['-p', prompt, '--model', 'sonnet', '--allowedTools', 'Read']
  if (dir) args.push('--add-dir', dir)
  return execFileSync(claudeBin(), args, { cwd: dir || ROOT, encoding: 'utf8', timeout: 6 * 60000, maxBuffer: 8 * 1024 * 1024 }).trim()
}
const jsonIn = text => JSON.parse(text.slice(text.search(/[[{]/), Math.max(text.lastIndexOf(']'), text.lastIndexOf('}')) + 1))

function phrasesFor(post) {
  const out = ask(`A blog post needs a striking, REAL photograph at the top. It will be searched for on Wikimedia Commons, which holds real photographs of real places, people at work, nature, buildings and events, but little corporate stock.

Post title: ${post.title}
Description: ${post.description}
Keyword: ${post.keyword}

Give 5 short search phrases (2 to 4 plain words each, no quotes, no "AI") for photos that would look great at the top of this post and honestly fit it: real scenes, not diagrams or logos. Order best first. Answer with ONLY a JSON array of strings.`)
  return jsonIn(out).filter(x => typeof x === 'string').slice(0, 6)
}

/** Find one real photograph on Commons for a post and put it on the list. */
export function fetchFromCommons(post, { log = () => {} } = {}) {
  const have = new Set(readPhotos().map(p => p.page))
  let phrases = []
  try { phrases = phrasesFor(post) } catch (e) { log(`  could not get search phrases from Claude (${String(e.message).slice(0, 120)}); using the keyword and tags`) }
  phrases = [...new Set([...phrases, post.keyword, ...post.tags].filter(Boolean))]
  const seen = new Set(), pool = []
  for (const q of phrases) {
    for (const query of [`${q} incategory:Quality_images`, q]) {
      let found = []
      try { found = commonsSearch(query).map(asReal).filter(Boolean) } catch (e) { log(`  Commons search failed for "${query}": ${e.message}`) }
      for (const r of found) if (!have.has(r.page) && !seen.has(r.page)) { seen.add(r.page); pool.push({ ...r, q }) }
      if (pool.filter(r => r.q === q).length >= 3) break
    }
    if (pool.length >= 12) break
  }
  if (!pool.length) return null

  /* Look before choosing: small copies in a scratch folder, Claude reads
     them as images and picks the one that fits, or none. */
  const tmp = mkdtempSync(join(tmpdir(), 'blogphotos-'))
  try {
    const shots = pool.slice(0, 12).map((r, i) => {
      const f = join(tmp, `${i}.jpg`)
      try { curl(['-o', f, r.thumb.replace(/\/1600px-/, '/640px-')]) } catch {}
      return existsSync(f) && statSync(f).size > 5000 ? { ...r, f, i } : null
    }).filter(Boolean)
    if (!shots.length) return null
    const out = ask(`Choose the top photo for a blog post. Read each image file below and look at it.

Post title: ${post.title}
Description: ${post.description}

${shots.map(s => `${s.i}: ${s.f}  (${s.title.replace(/^File:/, '')})`).join('\n')}

Pick the ONE that (1) is plainly a real photograph, not an illustration, render, collage or AI image, (2) honestly fits what the post is about, so a reader would not find it odd, (3) looks good, the kind of picture that makes someone stop scrolling: sharp, well lit, a clear subject, works cropped to a wide 16:9 strip, (4) carries nothing that drags in a story the post is not about: no politicians or famous people, no soldiers or uniforms, no news events, no logos or brand names as the subject, no posed photo-ops, no children. If none fits well, answer -1. Do not settle for a poor fit.

Answer with ONLY JSON: {"pick": <number or -1>, "alt": "<one plain sentence saying what the photo shows, no dashes>"}`, { dir: tmp })
    const { pick, alt } = jsonIn(out)
    const chosen = shots.find(s => s.i === Number(pick))
    if (!chosen) { log(`  Claude looked at ${shots.length} real photos and none fit "${post.title}"`); return null }
    mkdirSync(PHOTO_DIR, { recursive: true })
    const name = `${post.slug}.jpg`
    const file = join(PHOTO_DIR, name)
    curl(['-o', file, chosen.thumb])
    if (!existsSync(file) || statSync(file).size < 30000) { log(`  download of ${chosen.title} came back empty`); return null }
    const photo = {
      file: WEB_DIR + name, source: 'commons', alt: strip(alt) || chosen.description, credit: chosen.credit, license: chosen.license,
      camera: chosen.camera, page: chosen.page, tags: [chosen.q, ...wordsOf(chosen.title)], added: new Date().toLocaleDateString('en-CA')
    }
    writePhotos([...readPhotos(), photo])
    log(`  found a real photo on Commons: ${chosen.title} (${chosen.camera}, ${chosen.license})`)
    return photo
  } finally { rmSync(tmp, { recursive: true, force: true }) }
}

/** Make sure a post has a real top picture. Returns the files to commit with it. */
export function ensurePhoto(post, posts, { log = () => {} } = {}) {
  if (post.image && photoFor(post.image)) return []
  const photo = bestOnList(post, posts) || fetchFromCommons(post, { log })
  if (!photo) throw new Error(`no real photograph found for "${post.title}"; add one of his own to content/blog/photos.json`)
  const text = readFileSync(post.file, 'utf8')
  const alt = photo.alt.replace(/"/g, "'")
  const fm = text.replace(/^image:.*\n|^image_alt:.*\n/gm, '').replace(/^(status:.*)$/m, `$1\nimage: ${photo.file}\nimage_alt: "${alt}"`)
  writeFileSync(post.file, fm)
  post.image = photo.file; post.imageAlt = alt
  log(`  top picture: ${photo.file} (${photo.source === 'own' ? 'his own photo' : photo.camera})`)
  return [PHOTOS_PATH, join(ROOT, 'public', photo.file)]
}
