// ═══════════════════════════════════════════════
// AD CREATOR — BannerGridNode
// Podgląd banerów we wszystkich formatach
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type { HeadlineData, CTAData, ImageData, ThemeData, CopyGroupData } from '@/types'

const DEFAULT_FORMATS = ['ig-square', 'fb-feed', 'tt-video']

// ── FormatCard ────────────────────────────────────────────────────────
interface FormatCardProps {
  formatId: string
  nodeId: string
  headline: HeadlineData | null
  cta: CTAData | null
  image: ImageData | null
  theme: ThemeData | null
  onRemove: () => void
}

function FormatCard({ formatId, nodeId, headline, cta, image, theme, onRemove }: FormatCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fmt = AD_FORMATS.find(f => f.id === formatId)

  const render = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !fmt) return

    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt: { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta: cta ?? { text: '', style: 'primary' },
    } : null

    await composeBanner(canvas, {
      copy,
      background: null,
      bgColor: theme?.bgColor ?? '#111',
      image: image?.url ?? null,
      style: null,
      theme: theme ?? null,
    })
  }, [fmt, headline, cta, image, theme]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    render()
  }, [render])

  if (!fmt) return null

  const maxW = 100
  const dispW = maxW
  const dispH = Math.round(fmt.h * (maxW / fmt.w))

  function handleExport() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `banner-${fmt!.id}.png`
    a.click()
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      background: 'var(--color-field-bg)',
      border: '1px solid var(--color-field-border)',
      borderRadius: 6,
      padding: 6,
      position: 'relative',
    }}>
      {/* Remove button */}
      <button
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: 3,
          right: 3,
          width: 16,
          height: 16,
          fontSize: 10,
          lineHeight: '16px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.4)',
          border: 'none',
          borderRadius: 3,
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: 0,
          zIndex: 1,
        }}
      >
        ×
      </button>

      {/* Canvas preview */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: dispH + 4 }}>
        <canvas
          ref={canvasRef}
          data-banner-canvas={`${nodeId}-${formatId}`}
          style={{
            width: dispW,
            height: dispH,
            borderRadius: 3,
            display: 'block',
            background: '#111',
          }}
        />
      </div>

      {/* Label */}
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.2 }}>
        {fmt.label}
      </div>
      <div style={{ fontSize: 8, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        {fmt.w}×{fmt.h}
      </div>

      {/* Export PNG */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={handleExport}
        style={{ fontSize: 9, padding: '2px 6px', width: '100%', justifyContent: 'center' }}
      >
        PNG
      </button>
    </div>
  )
}

// ── BannerGridNode ────────────────────────────────────────────────────
export function BannerGridNode({ id }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)

  const headline = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs)
  const cta      = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs)
  const image    = resolveInput<ImageData>(id, 'image', edges, nodeOutputs)
  const theme    = resolveInput<ThemeData>(id, 'theme', edges, nodeOutputs)

  const [activeFormats, setActiveFormats] = useState<string[]>(DEFAULT_FORMATS)

  const availableToAdd = AD_FORMATS.filter(f => !activeFormats.includes(f.id))

  function handleAddFormat(e: React.ChangeEvent<HTMLSelectElement>) {
    const fmtId = e.target.value
    if (!fmtId) return
    setActiveFormats(prev => [...prev, fmtId])
    e.target.value = ''
  }

  function handleRemoveFormat(fmtId: string) {
    setActiveFormats(prev => prev.filter(f => f !== fmtId))
  }

  function handleExportAll() {
    activeFormats.forEach(fmtId => {
      const canvas = document.querySelector<HTMLCanvasElement>(`[data-banner-canvas="${id}-${fmtId}"]`)
      if (!canvas) return
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `banner-${fmtId}.png`
      a.click()
    })
  }

  return (
    <BaseNode id={id} nodeType="bannerGridNode">
      <div style={{ minWidth: 280 }} onMouseDown={e => e.stopPropagation()}>

        {/* Format selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <select
            onChange={handleAddFormat}
            defaultValue=""
            style={{
              flex: 1,
              fontSize: 10,
              padding: '4px 6px',
              borderRadius: 5,
              border: '1px solid var(--color-field-border)',
              background: 'var(--color-field-bg)',
              color: 'var(--color-text)',
            }}
          >
            <option value="">+ Dodaj format…</option>
            {availableToAdd.map(f => (
              <option key={f.id} value={f.id}>{f.label} ({f.w}×{f.h})</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {activeFormats.length === 0 ? (
          <div style={{
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--color-field-border)',
            borderRadius: 6,
            color: 'var(--color-text-muted)',
            fontSize: 10,
          }}>
            Brak formatów — dodaj powyżej
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {activeFormats.map(fmtId => (
              <FormatCard
                key={fmtId}
                formatId={fmtId}
                nodeId={id}
                headline={headline}
                cta={cta}
                image={image}
                theme={theme}
                onRemove={() => handleRemoveFormat(fmtId)}
              />
            ))}
          </div>
        )}

        {/* Export all */}
        {activeFormats.length > 0 && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleExportAll}
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, fontSize: 10 }}
          >
            Export wszystko ({activeFormats.length})
          </button>
        )}
      </div>
    </BaseNode>
  )
}
