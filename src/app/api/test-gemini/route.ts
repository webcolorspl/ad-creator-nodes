import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Brak GEMINI_API_KEY' })

  // Sprawdź dostępne modele
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { signal: AbortSignal.timeout(8000) }
  ).catch(e => ({ ok: false, error: e.message }))

  if (!('json' in res)) return NextResponse.json({ error: (res as { error: string }).error })
  if (!res.ok) return NextResponse.json({ error: `HTTP ${res.status}` })

  const data = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> }
  const imageModels = (data.models ?? [])
    .filter(m => m.name.includes('image') || m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name)

  return NextResponse.json({ imageModels, total: data.models?.length })
}
