// ═══════════════════════════════════════════════
// AD CREATOR — API Route: /api/brief
// Gemini text generation — warianty haseł
// ═══════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'gemini-1.5-flash-latest'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Brak GEMINI_API_KEY w środowisku' }, { status: 500 })
  }

  let body: {
    campaign: { type: string; goals: string[]; groups: string[]; headline?: string; audience?: string }
    product: string
    keywords: string
    url?: string
    age?: string
    gender?: string
    tone?: string
    count?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const { campaign, product, keywords, url, age, gender, tone, count = 4 } = body

  const TYPE_LABELS: Record<string, string> = {
    brand: 'Brand Awareness (zasięg i wizerunek)',
    performance: 'Performance (konwersja i sprzedaż)',
    leads: 'Lead Generation (zapisy, formularze)',
    launch: 'Product Launch (nowy produkt)',
    seasonal: 'Seasonal (promocja sezonowa)',
    remarketing: 'Remarketing (retargeting)',
  }

  const prompt = `Jesteś ekspertem od copywritingu reklamowego. Na podstawie poniższego briefu wygeneruj dokładnie ${count} różne warianty reklamy.

KONTEKST KAMPANII:
Typ: ${TYPE_LABELS[campaign.type] ?? campaign.type}
Cele: ${campaign.goals.join(', ')}
Grupy docelowe: ${campaign.groups.join(', ')}
${campaign.headline ? `Hasło wstępne: ${campaign.headline}` : ''}
${campaign.audience ? `Odbiorcy: ${campaign.audience}` : ''}

BRIEF:
Produkt / Marka: ${product}
Słowa kluczowe: ${keywords}
${url ? `URL: ${url}` : ''}
${age ? `Wiek odbiorców: ${age}` : ''}
${gender ? `Płeć: ${gender}` : ''}
${tone ? `Ton komunikacji: ${tone}` : ''}

Odpowiedz WYŁĄCZNIE jako obiekt JSON (żadnego tekstu poza JSON):
{
  "variants": [
    { "headlineMain": "...", "headlineSub": "...", "ctaText": "...", "ctaStyle": "primary" },
    ...
  ]
}

Zasady:
- headlineMain: chwytliwe główne hasło, do 150 znaków
- headlineSub: opcjonalne pod-hasło do 100 znaków (może być pustym stringiem "")
- ctaText: call-to-action, 2-50 znaków, zorientowany na działanie
- ctaStyle: jeden z: "primary", "outline", "ghost", "text"
- Każdy wariant musi mieć inny styl, podejście i emocję
- Język: polski
- Wygeneruj dokładnie ${count} warianty`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Gemini błąd: ${res.status} — ${err.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    // Strip markdown code fences if present (```json ... ```)
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    let parsed: { variants: Array<{ headlineMain: string; headlineSub: string; ctaText: string; ctaStyle: string }> }

    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Gemini zwrócił nieprawidłowy JSON', raw: text.slice(0, 500) }, { status: 502 })
    }

    if (!Array.isArray(parsed.variants)) {
      return NextResponse.json({ error: 'Brak tablicy variants w odpowiedzi', raw: text.slice(0, 500) }, { status: 502 })
    }

    const variants = parsed.variants.map((v, i) => ({
      id: `ai-${Date.now()}-${i}`,
      headlineMain: String(v.headlineMain ?? ''),
      headlineSub:  String(v.headlineSub  ?? ''),
      ctaText:      String(v.ctaText      ?? ''),
      ctaStyle:     (['primary','outline','ghost','text'].includes(v.ctaStyle) ? v.ctaStyle : 'primary') as 'primary' | 'outline' | 'ghost' | 'text',
    }))

    return NextResponse.json({ variants })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
