// ═══════════════════════════════════════════════
// AD CREATOR — API Route: /api/generate-image
// Imagen 4 (imagen-4.0-generate-001) via Gemini API key
// Endpoint: v1beta predict (inny niż generateContent)
// ═══════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'imagen-4.0-generate-001'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Brak GEMINI_API_KEY w środowisku' }, { status: 500 })
  }

  let body: { prompt: string; aspectRatio?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const { prompt, aspectRatio = '1:1' } = body
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Brak prompta' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt.trim() }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
          },
        }),
        signal: AbortSignal.timeout(60_000),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { error: `Imagen 4 błąd: ${res.status} — ${err.slice(0, 300)}` },
        { status: 502 }
      )
    }

    const data = await res.json() as {
      predictions?: Array<{
        bytesBase64Encoded?: string
        mimeType?: string
      }>
    }

    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded
    const mimeType    = data.predictions?.[0]?.mimeType ?? 'image/png'

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Brak obrazu w odpowiedzi', raw: JSON.stringify(data).slice(0, 300) },
        { status: 502 }
      )
    }

    return NextResponse.json({ imageBase64, mimeType })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
