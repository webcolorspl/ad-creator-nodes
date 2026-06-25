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

  const data = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[]; description?: string }> }
  const all = data.models ?? []

  const textModels = all
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name)

  // Szukaj modeli mogących generować obrazy (po nazwie)
  const imageModels = all
    .filter(m => m.name.toLowerCase().includes('image') || m.name.toLowerCase().includes('imagen'))
    .map(m => ({ name: m.name, methods: m.supportedGenerationMethods }))

  return NextResponse.json({ textModels, imageModels, allNames: all.map(m => m.name), total: all.length })
}
