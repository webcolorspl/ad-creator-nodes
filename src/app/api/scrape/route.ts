// ═══════════════════════════════════════════════
// AD CREATOR — API Route: /api/scrape
// Server-side URL scraper — tekst + obrazy
// ═══════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'

function getMeta(html: string, name: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
  return m ? m[1].trim() : ''
}

function getTag(html: string, tag: string, limit = 3): string[] {
  const re = new RegExp(`<${tag}[^>]*>([^<]{3,})</${tag}>`, 'gi')
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null && results.length < limit) {
    const text = m[1].replace(/\s+/g, ' ').trim()
    if (text.length > 3) results.push(text)
  }
  return results
}

function getImages(html: string, baseUrl: string, limit = 8): string[] {
  const found = new Set<string>()

  // og:image (highest quality)
  const ogImages = [...html.matchAll(/content=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)]
  for (const m of ogImages) {
    const u = m[1].startsWith('http') ? m[1] : new URL(m[1], baseUrl).href
    found.add(u)
    if (found.size >= limit) break
  }

  // <img src> z sensownymi rozmiarami
  if (found.size < limit) {
    const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["'][^>]*>/gi)]
    for (const m of imgs) {
      if (m[1].includes('icon') || m[1].includes('logo') || m[1].includes('pixel')) continue
      const u = m[1].startsWith('http') ? m[1] : new URL(m[1], baseUrl).href
      found.add(u)
      if (found.size >= limit) break
    }
  }

  return [...found].slice(0, limit)
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json() as { url?: string }
    url = (body.url ?? '').trim()
    if (!url) throw new Error('Brak URL')
    if (!url.startsWith('http')) url = 'https://' + url
    new URL(url) // validate
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdCreator/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pl,en;q=0.9',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Strona zwróciła HTTP ${res.status}` }, { status: 502 })
    }

    const html = await res.text()

    const title       = getMeta(html, 'og:title')       || getTag(html, 'title', 1)[0] || ''
    const description = getMeta(html, 'og:description') || getMeta(html, 'description') || ''
    const h1s         = getTag(html, 'h1', 2)
    const h2s         = getTag(html, 'h2', 3)
    const paragraphs  = getTag(html, 'p', 5)

    // Zbuduj prompt z pobranych treści
    const parts = [
      title       && `Strona: ${title}`,
      description && `Opis: ${description}`,
      h1s.length  && `Nagłówki: ${h1s.join(' | ')}`,
      h2s.length  && `Sekcje: ${h2s.slice(0, 2).join(' | ')}`,
      paragraphs.length && `Treść: ${paragraphs.slice(0, 2).join(' ')}`.slice(0, 400),
    ].filter(Boolean)

    const promptText = parts.join('\n').slice(0, 800)
    const images     = getImages(html, url)

    // Propozycje nagłówków: h1, h2, og:title, description
    const headlines = [
      ...h1s,
      ...h2s,
      title,
      description,
    ]
      .map(s => s.trim())
      .filter((s, i, arr) => s.length > 3 && s.length <= 80 && arr.indexOf(s) === i)
      .slice(0, 6)

    return NextResponse.json({
      title,
      description,
      promptText,
      headlines,
      images,
      url,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Nieznany błąd'
    return NextResponse.json(
      { error: `Nie można pobrać strony: ${msg}` },
      { status: 502 }
    )
  }
}
