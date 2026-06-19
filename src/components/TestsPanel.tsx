'use client'
import { useEffect, useCallback, useState } from 'react'
import type { Edge } from '@xyflow/react'
import { useAppStore } from '@/store/appStore'
import { validatePromptNode, validateHeadlineNode, validateCTANode } from '@/lib/validation'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS, PORT_COLORS, NODE_REGISTRY } from '@/lib/constants'
import { PORT_TYPES } from '@/types'
import type { NodeOutputs } from '@/types'

interface TestResult { name: string; status: 'pass' | 'fail'; err?: string; dur: number }

async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = []
  const test = async (name: string, fn: () => void | Promise<void>) => {
    const t0 = performance.now()
    try { await fn(); results.push({ name, status: 'pass', dur: performance.now() - t0 }) }
    catch (e) { results.push({ name, status: 'fail', err: (e as Error).message, dur: performance.now() - t0 }) }
  }
  await test('VAL: promptNode rejects short text', () => { if (!validatePromptNode({ text: 'hi' }).length) throw new Error('Brak błędu') })
  await test('VAL: promptNode accepts valid text', () => { if (validatePromptNode({ text: 'Kampania letnia dla marki odzieżowej' }).length) throw new Error('Błąd przy poprawnym') })
  await test('VAL: promptNode rejects >800 chars', () => { if (!validatePromptNode({ text: 'a'.repeat(801) }).length) throw new Error('Brak błędu') })
  await test('VAL: headlineNode rejects empty main', () => { if (!validateHeadlineNode({ main: '' }).length) throw new Error('Brak błędu') })
  await test('VAL: headlineNode rejects >60 chars', () => { if (!validateHeadlineNode({ main: 'a'.repeat(61) }).length) throw new Error('Brak błędu') })
  await test('VAL: ctaNode rejects empty text', () => { if (!validateCTANode({ text: '' }).length) throw new Error('Brak błędu') })
  await test('VAL: ctaNode accepts valid text', () => { if (validateCTANode({ text: 'Kup teraz' }).length) throw new Error('Błąd przy poprawnym') })
  await test('RESOLVER: null for no edge', () => { if (resolveInput<unknown>('n1', 'prompt', [], {}) !== null) throw new Error('Oczekiwano null') })
  await test('RESOLVER: finds connected output', () => {
    const edges = [{ id:'e1', source:'s', sourceHandle:'prompt', target:'t', targetHandle:'prompt' }] as Edge[]
    const outputs: Record<string, NodeOutputs> = { s: { prompt: { text: 'test', tone: 'neutral', lang: 'pl' } } }
    const r = resolveInput<{ text: string }>('t', 'prompt', edges, outputs)
    if (!r || r.text !== 'test') throw new Error(`Oczekiwano {text:'test'}, dostał ${JSON.stringify(r)}`)
  })
  await test('RESOLVER: null when no source output', () => {
    const edges = [{ id:'e1', source:'s', sourceHandle:'prompt', target:'t', targetHandle:'prompt' }] as Edge[]
    if (resolveInput<unknown>('t', 'prompt', edges, {}) !== null) throw new Error('Oczekiwano null')
  })
  await test('FORMATS: all within 2000px', () => { AD_FORMATS.forEach(f => { if (f.w > 2000 || f.h > 2000) throw new Error(`${f.id} > 2000px`) }) })
  await test('FORMATS: 1:1 is square', () => { const f = AD_FORMATS.find(x => x.id === '1:1')!; if (f.w !== f.h) throw new Error('Nie kwadrat') })
  await test('PORT_COLORS: all PT types have color', () => { Object.values(PORT_TYPES).forEach(pt => { if (!PORT_COLORS[pt]) throw new Error(`Brak koloru: ${pt}`) }) })
  await test('REGISTRY: all nodes have category', () => { Object.entries(NODE_REGISTRY).forEach(([k, v]) => { if (!v.cat) throw new Error(`${k}: brak kategorii`) }) })
  await test('CANVAS: 1:1 = 1080×1080', async () => {
    const c = document.createElement('canvas')
    await composeBanner(c, { style: { format: '1:1', width: 1080, height: 1080 } })
    if (c.width !== 1080 || c.height !== 1080) throw new Error(`Got ${c.width}×${c.height}`)
  })
  await test('CANVAS: 9:16 correct ratio', async () => {
    const c = document.createElement('canvas')
    await composeBanner(c, { style: { format: '9:16', width: 1080, height: 1920 } })
    if (Math.abs(c.height / c.width - 1920 / 1080) > 0.01) throw new Error(`Zły ratio`)
  })
  await test('CANVAS: never exceeds 2000px', async () => {
    const c = document.createElement('canvas')
    await composeBanner(c, { style: { format: '16:9', width: 1920, height: 1080 } })
    if (c.width > 2000 || c.height > 2000) throw new Error('Przekroczono 2000px')
  })
  return results
}

export function TestsPanel() {
  const setShowTests = useAppStore(s => s.setShowTests)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [running, setRunning] = useState(false)

  const run = useCallback(async () => {
    setRunning(true); setResults(null)
    const r = await runAllTests()
    setResults(r); setRunning(false)
  }, [])

  useEffect(() => { void run() }, [run])

  const pass  = results?.filter(t => t.status === 'pass').length ?? 0
  const fail  = results?.filter(t => t.status === 'fail').length ?? 0
  const total = results?.length ?? 0

  return (
    <div className="tests-panel" onClick={() => setShowTests(false)}>
      <div className="tests-box" onClick={e => e.stopPropagation()}>
        <div className="tests-header">
          <span className="tests-title">🧪 Unit Tests — Sprint 6</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTests(false)}>✕</button>
        </div>
        <div className="tests-body">
          {running && <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 0', justifyContent:'center' }}><div className="gen-spinner"/><span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-text-muted)' }}>Uruchamianie...</span></div>}
          {results?.map((t, i) => (
            <div key={i} className={`test-row test-${t.status}`}>
              <span style={{ fontSize:13, flexShrink:0 }}>{t.status === 'pass' ? '✓' : '✗'}</span>
              <span className="test-name">{t.name}</span>
              {t.err && <span style={{ fontSize:10, color:'#FF6B6B', fontFamily:'var(--font-mono)', maxWidth:180, textAlign:'right' }}>{t.err}</span>}
              <span className="test-dur">{t.dur?.toFixed(1)}ms</span>
            </div>
          ))}
        </div>
        <div className="tests-footer">
          <span className="tests-summary" style={{ color: fail > 0 ? '#FF6B6B' : 'var(--color-gen)' }}>
            {running ? 'Running...' : `${pass}/${total} passed${fail > 0 ? ` · ${fail} failed` : ''}`}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={run} disabled={running}>↻ Ponów</button>
        </div>
      </div>
    </div>
  )
}
