// ═══════════════════════════════════════════════
// AD CREATOR — API Route: /api/generate
// Pollinations.ai — darmowe generowanie obrazów (bez klucza)
// ═══════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../auth/route'

const COOKIE_NAME = 'gen_session'

const TONE_MAP: Record<string, string> = {
  luxury:  'cinematic, premium, high-end, elegant, luxury',
  casual:  'friendly, approachable, warm, lifestyle, casual',
  bold:    'dynamic, strong, powerful, impactful, bold',
  minimal: 'clean, minimal, white space, refined, minimalist',
  neutral: 'professional, clean, balanced, commercial',
  playful: 'fun, colorful, energetic, vibrant, playful',
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? ''
  if (!verifyToken(token)) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  let body: { promptText: string; tone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  const { promptText, tone = 'neutral' } = body
  if (!promptText || promptText.trim().length < 5) {
    return NextResponse.json({ error: 'Prompt jest za krótki' }, { status: 400 })
  }

  const toneDesc  = TONE_MAP[tone] ?? TONE_MAP.neutral
  const fullPrompt = [
    'Advertisement background image.',
    promptText,
    `Style: ${toneDesc}.`,
    'No text, no logos, no letters.',
    'High quality commercial photography.',
  ].join(' ')

  try {
    const encoded = encodeURIComponent(fullPrompt)
    const seed    = Math.floor(Math.random() * 999999)
    const url     = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Pollinations błąd: HTTP ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const buffer      = await response.arrayBuffer()
    const base64      = Buffer.from(buffer).toString('base64')

    return NextResponse.json({
      dataUrl: `data:${contentType};base64,${base64}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
