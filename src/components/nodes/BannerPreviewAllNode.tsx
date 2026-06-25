// ═══════════════════════════════════════════════
// AD CREATOR — BannerPreviewAllNode
// Renderuje WSZYSTKIE formaty i eksportuje
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS, PLATFORM_GROUPS } from '@/lib/constants'
import type {
  HeadlineData, CTAData, ImageData, BackgroundData, ThemeData,
  CopyGroupData, StyleData, HeadlineCTAVariant, NodeOutputs,
} from '@/types'

const ZOOM_OPTIONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5  },
  { label: '100%', value: 1   },
]
const PLATFORM_ICON: Record<string, string> = {
  fb: 'FB', ig: 'IG', li: 'LI', tt: 'TT', x: 'X', yt: 'YT', pn: 'PIN',
}
function platformBadge(id: string) {
  return PLATFORM_ICON[id.split('-')[0]] ?? id.split('-')[0].toUpperCase()
}
function scanOutputs<T>(nodeOutputs: Record<string, NodeOutputs>, key: keyof NodeOutputs): T | null {
  for (const out of Object.values(nodeOutputs)) {
    const val = out?.[key]
    if (val !== undefined && val !== null) return val as T
  }
  return null
}

// ── useResize ───────────────────────────────────────────────────────────
function useResize(initial: number, min: number, max: number, axis: 'x' | 'y'): [number, (e: React.MouseEvent) => void] {
  const [size, setSize] = useState(initial)
  const data = useRef<{ start: number; startSize: number } | null>(null)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    data.current = { start: axis === 'x' ? e.clientX : e.clientY, startSize: size }
    function onMove(ev: MouseEvent) {
      if (!data.current) return
      setSize(Math.max(min, Math.min(max, data.current.startSize + ((axis === 'x' ? ev.clientX : ev.clientY) - data.current.start))))
    }
    function onUp() { data.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [size, min, max, axis])
  return [size, onMouseDown]
}

// ── MiniCard ────────────────────────────────────────────────────────────
function MiniCard({
  nodeId, fmtId, headline, cta, imageUrl, bgColor, theme, thumbW,
}: {
  nodeId: string; fmtId: string
  headline: HeadlineData | null; cta: CTAData | null
  imageUrl: string | null; bgColor: string | null; theme: ThemeData | null
  thumbW: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fmt = AD_FORMATS.find(f => f.id === fmtId)!
  const thumbH = Math.round(fmt.h * (thumbW / fmt.w))
  const inputKey = JSON.stringify({ fmtId, headline, cta, imageUrl, bgColor, theme })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const effectiveBgColor = theme?.bgColor ?? bgColor ?? '#1a1a2e'
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta:      cta      ?? { text: '', style: 'primary' },
    } : null
    composeBanner(canvas, { copy, background: null, bgColor: effectiveBgColor, image: imageUrl || undefined, style, theme: theme ?? null })
      .catch(() => {
        canvas.width = Math.min(fmt.w, 1080); canvas.height = Math.min(fmt.h, 1080)
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.fillStyle = effectiveBgColor; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      })
  }, [inputKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function exportPng() {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `banner-${fmt.id}.png`; a.click()
  }

  return (
    <div style={{ background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderBottom: '1px solid var(--color-field-border)' }}>
        <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 3px', borderRadius: 3, background: 'var(--color-process)', color: '#fff', flexShrink: 0 }}>
          {platformBadge(fmt.id)}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmt.label}</span>
        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', flexShrink: 0 }}>{fmt.w}×{fmt.h}</span>
        <button onMouseDown={e => e.stopPropagation()} onClick={exportPng}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '1px 3px', fontSize: 10, lineHeight: 1, flexShrink: 0 }}
          title="Pobierz PNG">⬇</button>
      </div>
      <div style={{ background: '#0d0d0d', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: thumbH }}>
        <canvas ref={canvasRef} data-preview-canvas={`${nodeId}-${fmtId}`}
          style={{ width: thumbW, height: thumbH, display: 'block', flexShrink: 0 }} />
        {!headline && !cta && !imageUrl && !theme && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>brak danych</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── BannerPreviewAllNode ────────────────────────────────────────────────
export function BannerPreviewAllNode({ id }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)

  const headline         = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs)
                        ?? scanOutputs<HeadlineData>(nodeOutputs, 'headline')
  const cta              = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs)
                        ?? scanOutputs<CTAData>(nodeOutputs, 'cta')
  const image            = resolveInput<ImageData>(id, 'image', edges, nodeOutputs)
                        ?? scanOutputs<ImageData>(nodeOutputs, 'image')
  const background       = resolveInput<BackgroundData>(id, 'background', edges, nodeOutputs)
                        ?? scanOutputs<BackgroundData>(nodeOutputs, 'background')
  const theme            = resolveInput<ThemeData>(id, 'theme', edges, nodeOutputs)
                        ?? scanOutputs<ThemeData>(nodeOutputs, 'theme')
  const selectedVariants = resolveInput<HeadlineCTAVariant[]>(id, 'selectedVariants', edges, nodeOutputs)
                        ?? scanOutputs<HeadlineCTAVariant[]>(nodeOutputs, 'selectedVariants')

  const imageUrl = image?.url || background?.url || null
  const bgColor  = background?.color ?? null

  const [zoom,           setZoom]           = useState(0.25)
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null)
  const [downloading,    setDownloading]    = useState(false)

  const [nodeW,   startResizeW]  = useResize(420, 300, 1600, 'x')
  const [scrollH, startResizeH]  = useResize(560, 200, 2000, 'y')
  const seData = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)
  const [seW, setSeW] = useState(420)
  const [seH, setSeH] = useState(560)
  const effectiveW = Math.max(nodeW, seW)
  const effectiveH = Math.max(scrollH, seH)

  function startResizeSE(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    seData.current = { sx: e.clientX, sy: e.clientY, sw: effectiveW, sh: effectiveH }
    function onMove(ev: MouseEvent) {
      if (!seData.current) return
      setSeW(Math.max(300, Math.min(1600, seData.current.sw + (ev.clientX - seData.current.sx))))
      setSeH(Math.max(200, Math.min(2000, seData.current.sh + (ev.clientY - seData.current.sy))))
    }
    function onUp() { seData.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  const visibleFormats = filterPlatform
    ? AD_FORMATS.filter(f => PLATFORM_GROUPS.find(g => g.label === filterPlatform)?.ids.includes(f.id))
    : AD_FORMATS

  async function downloadAll() {
    setDownloading(true)
    for (const fmt of visibleFormats) {
      const canvas = document.querySelector<HTMLCanvasElement>(`[data-preview-canvas="${id}-${fmt.id}"]`)
      if (!canvas) continue
      const a = document.createElement('a')
      a.href     = canvas.toDataURL('image/png')
      a.download = `banner-${fmt.id}.png`
      a.click()
      await new Promise(r => setTimeout(r, 150))
    }
    setDownloading(false)
  }

  const btnBase: React.CSSProperties   = { fontSize: 9, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', fontWeight: 600 }
  const btnActive: React.CSSProperties = { ...btnBase, border: '1px solid var(--color-process)', background: 'rgba(124,92,245,0.12)', color: 'var(--color-process)' }
  const handleSt: React.CSSProperties  = { position: 'absolute', background: 'var(--color-field-border)', zIndex: 10, borderRadius: 2, opacity: 0.6 }

  return (
    <BaseNode id={id} nodeType="bannerPreviewAllNode">
      <div style={{ width: effectiveW, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterPlatform ?? ''} onChange={e => setFilterPlatform(e.target.value || null)}
            style={{ flex: 1, minWidth: 100, fontSize: 10, padding: '4px 6px', borderRadius: 5, border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)', color: 'var(--color-text)' }}>
            <option value="">Wszystkie ({AD_FORMATS.length})</option>
            {PLATFORM_GROUPS.map(g => <option key={g.label} value={g.label}>{g.label} ({g.ids.length})</option>)}
          </select>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {ZOOM_OPTIONS.map(opt => (
              <button key={opt.value} onMouseDown={e => e.stopPropagation()} onClick={() => setZoom(opt.value)} style={zoom === opt.value ? btnActive : btnBase}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onMouseDown={e => e.stopPropagation()} onClick={downloadAll} disabled={downloading}
            style={{ ...btnBase, borderColor: 'var(--color-output)', color: 'var(--color-output)', opacity: downloading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            {downloading ? '…pobieranie' : `⬇ Pobierz wszystkie (${visibleFormats.length})`}
          </button>
        </div>

        {/* 2-column grid */}
        <div onWheelCapture={e => e.stopPropagation()}
          style={{ maxHeight: effectiveH, overflowY: 'auto', overflowX: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, alignItems: 'start' }}>
          {visibleFormats.map((fmt, idx) => {
            const thumbW = Math.min(Math.round(fmt.w * zoom), Math.floor((effectiveW - 28) / 2))
            const variant = selectedVariants?.length ? selectedVariants[idx % selectedVariants.length] : null
            const cardHeadline: HeadlineData | null = variant ? { main: variant.headlineMain, sub: variant.headlineSub } : headline
            const cardCta: CTAData | null = variant ? { text: variant.ctaText, style: variant.ctaStyle } : cta
            return (
              <MiniCard key={fmt.id} nodeId={id} fmtId={fmt.id}
                headline={cardHeadline} cta={cardCta}
                imageUrl={imageUrl} bgColor={bgColor} theme={theme}
                thumbW={thumbW} />
            )
          })}
        </div>

        {/* Resize handles */}
        <div onMouseDown={startResizeW}  style={{ ...handleSt, right: -5, top: '10%', bottom: '10%', width: 4, cursor: 'ew-resize' }} />
        <div onMouseDown={startResizeH}  style={{ ...handleSt, bottom: -5, left: '10%', right: '10%', height: 4, cursor: 'ns-resize' }} />
        <div onMouseDown={startResizeSE} style={{ ...handleSt, bottom: -6, right: -6, width: 10, height: 10, borderRadius: 3, cursor: 'se-resize', opacity: 0.8 }} />
      </div>
    </BaseNode>
  )
}
