// ═══════════════════════════════════════════════
// AD CREATOR — API Route: /api/generate-image
// Gemini 2.0 Flash Experimental — image generation
// Ten sam klucz GEMINI_API_KEY co do tekstu
// ═══════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'

// gemini-2.0-flash-exp obsługuje generowanie obrazów przez generateContent
const MODEL = 'gemini-2.0-flash-exp'

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

  const { prompt } = body
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Brak prompta' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt.trim() }],
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
        signal: AbortSignal.timeout(60_000),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { error: `Gemini Image błąd: ${res.status} — ${err.slice(0, 300)}` },
        { status: 502 }
      )
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
            inlineData?: { data: string; mimeType: string }
          }>
        }
      }>
    }

    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: 'Brak obrazu w odpowiedzi Gemini', raw: JSON.stringify(data).slice(0, 400) },
        { status: 502 }
      )
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
