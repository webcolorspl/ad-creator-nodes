// ═══════════════════════════════════════════════
// AD CREATOR — BannerSlaveNode
// Podgląd banera slave z resizable canvas i delete
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import {
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Trash2, RectangleHorizontal,
} from 'lucide-react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type {
  CopyGroupData, StyleData, BannerCardOverrides, BannerLayoutOptions,
  BannerMasterData, HeadlineData, VerticalPosition,
} from '@/types'

const PLATFORM_LABEL: Record<string, string> = {
  fb: 'Facebook', ig: 'Instagram', li: 'LinkedIn',
  tt: 'TikTok', x: 'X / Twitter', yt: 'YouTube', pn: 'Pinterest',
}
function platformLabel(id: string) {
  const prefix = id.split('-')[0]
  return PLATFORM_LABEL[prefix] ?? prefix.toUpperCase()
}

function thumbSize(fmt: { w: number; h: number }) {
  let w = Math.round(fmt.w * 0.5)
  let h = Math.round(fmt.h * 0.5)
  const MAX_W = 400, MAX_H = 560
  if (w > MAX_W) { const r = MAX_W / w; w = MAX_W; h = Math.round(h * r) }
  if (h > MAX_H) { const r = MAX_H / h; h = MAX_H; w = Math.round(w * r) }
  return { w, h }
}

function hasOwn(o: BannerCardOverrides): boolean {
  return Object.values(o).some(v => v !== undefined)
}

// Corner resize grip SVG
function ResizeGrip() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ display: 'block' }}>
      <circle cx="10" cy="10" r="1.5"/>
      <circle cx="10" cy="5.5" r="1.5"/>
      <circle cx="5.5" cy="10" r="1.5"/>
    </svg>
  )
}

export function BannerSlaveNode({ id, data }: NodeProps) {
  const edges        = useAppStore(s => s.edges)
  const nodeOutputs  = useAppStore(s => s.nodeOutputs)
  const { deleteElements } = useReactFlow()

  const masterData = resolveInput<BannerMasterData>(id, 'masterData', edges, nodeOutputs)

  const [formatId,  setFormatId]  = useState((data as { formatId?: string }).formatId ?? 'ig-square')
  const version = (data as { version?: number }).version ?? 1
  const [overrides, setOverrides] = useState<BannerCardOverrides>({})
  const [showFmtPicker,     setShowFmtPicker]     = useState(false)
  const [showOverridePanel, setShowOverridePanel] = useState(false)

  const fmt = AD_FORMATS.find(f => f.id === formatId) ?? AD_FORMATS[0]
  const { w: minW, h: minH } = thumbSize(fmt)

  // Resize state — starts at 50% scale, max = real banner dimensions
  const [displayW, setDisplayW] = useState(minW)
  const [displayH, setDisplayH] = useState(minH)

  // Reset display size when format changes
  useEffect(() => {
    const { w, h } = thumbSize(fmt)
    setDisplayW(w)
    setDisplayH(h)
  }, [formatId]) // eslint-disable-line react-hooks/exhaustive-deps

  const nodeW = Math.max(220, displayW + 24)

  const headline: HeadlineData | null = masterData?.headline ? {
    ...masterData.headline,
    mainColor: overrides.mainColor ?? masterData.overrides?.mainColor ?? masterData.headline.mainColor,
    subColor:  overrides.subColor  ?? masterData.overrides?.subColor  ?? masterData.headline.subColor,
  } : null
  const cta         = masterData?.cta ?? null
  const imageUrl    = masterData?.imageUrl ?? null
  const effectiveBg = overrides.bgColor ?? masterData?.overrides?.bgColor ?? masterData?.bgColor ?? masterData?.theme?.bgColor ?? '#1a1a2e'
  const theme       = masterData?.theme ?? null
  const layout: BannerLayoutOptions = {
    textPosition: overrides.textPosition ?? masterData?.overrides?.textPosition ?? 'center',
    ctaVisible:   overrides.ctaVisible   ?? masterData?.overrides?.ctaVisible   ?? true,
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasKey = JSON.stringify({ formatId, headline, cta, imageUrl, effectiveBg, theme, overrides, masterData })
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta:      cta ?? { text: '', style: 'primary' },
    } : null
    composeBanner(canvas, { copy, background: null, bgColor: effectiveBg, image: imageUrl || undefined, style, theme: theme ?? null, layout })
      .catch(() => {
        canvas.width = Math.min(fmt.w, 1080); canvas.height = Math.min(fmt.h, 1080)
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.fillStyle = effectiveBg; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      })
  }, [canvasKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function exportPng() {
    const c = canvasRef.current; if (!c) return
    const a = document.createElement('a'); a.href = c.toDataURL('image/png')
    a.download = `banner-${fmt.id}.png`; a.click()
  }

  function deleteNode() {
    deleteElements({ nodes: [{ id }] })
  }

  // Corner drag resize (maintains aspect ratio, se-resize)
  function onResizeStart(e: React.PointerEvent) {
    e.preventDefault(); e.stopPropagation()
    const startX  = e.clientX
    const startW  = displayW
    const ratio   = fmt.h / fmt.w
    const maxW    = fmt.w
    const clampedMinW = minW

    function onMove(ev: PointerEvent) {
      const newW = Math.max(clampedMinW, Math.min(maxW, startW + (ev.clientX - startX)))
      setDisplayW(newW)
      setDisplayH(Math.round(newW * ratio))
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const posOpts: { val: VerticalPosition; Icon: typeof AlignVerticalJustifyStart }[] = [
    { val: 'top',    Icon: AlignVerticalJustifyStart  },
    { val: 'center', Icon: AlignVerticalJustifyCenter },
    { val: 'bottom', Icon: AlignVerticalJustifyEnd    },
  ]
  const lbl: React.CSSProperties = { fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '5px 0', cursor: 'pointer', borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${active ? 'var(--color-process)' : 'var(--color-field-border)'}`,
    background: active ? 'rgba(124,92,245,0.15)' : 'transparent',
    color: active ? 'var(--color-process)' : 'var(--color-text-muted)',
  })

  const noMaster = !masterData
  // Scale label: show % of real size
  const scalePercent = Math.round((displayW / fmt.w) * 100)
  const atMaxScale   = displayW >= fmt.w - 1

  return (
    <BaseNode id={id} nodeType="bannerSlaveNode">
      <div style={{ width: nodeW, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
          borderBottom: '1px solid var(--color-field-border)',
          borderTop: `2px solid ${noMaster ? 'var(--color-field-border)' : '#FF9F4A'}`,
          background: noMaster ? 'transparent' : 'rgba(255,159,74,0.04)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, lineHeight: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: noMaster ? 'var(--color-text-muted)' : 'var(--color-text)', letterSpacing: '-0.02em' }}>
                {fmt.w}×{fmt.h}
              </span>
              {version > 1 && (
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                  background: 'rgba(124,92,245,0.2)', color: 'var(--color-process)',
                  border: '1px solid rgba(124,92,245,0.35)', letterSpacing: '0.02em',
                }}>v{version}</span>
              )}
              {hasOwn(overrides) && <span style={{ fontSize: 8, color: 'var(--color-process)' }}>≠</span>}
            </div>
            <div style={{ fontSize: 8, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {platformLabel(fmt.id)} · {fmt.label}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Format picker */}
            <button onMouseDown={e => { e.stopPropagation(); setShowFmtPicker(v => !v) }}
              style={{ background: showFmtPicker ? 'rgba(255,159,74,0.12)' : 'none', border: 'none', color: showFmtPicker ? '#FF9F4A' : 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 4, padding: '3px', display: 'flex', alignItems: 'center' }}
              title="Zmień format">
              <RectangleHorizontal size={14} />
            </button>
            <button onMouseDown={e => { e.stopPropagation(); setShowOverridePanel(v => !v) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: '2px 3px', color: showOverridePanel ? 'var(--color-process)' : 'var(--color-text-muted)' }} title="Ustawienia">⚙</button>
            <button onMouseDown={e => { e.stopPropagation(); exportPng() }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: '2px 3px' }} title="Pobierz PNG">⬇</button>
            {/* Delete */}
            <button
              onMouseDown={e => { e.stopPropagation(); deleteNode() }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 4, padding: '3px', display: 'flex', alignItems: 'center', transition: 'color .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
              title="Usuń baner">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Format picker dropdown */}
        {showFmtPicker && (
          <div style={{ position: 'absolute', top: 36, right: 8, zIndex: 40, background: 'var(--color-surface)', border: '1px solid var(--color-field-border)', borderRadius: 8, padding: 6, minWidth: 190, maxHeight: 260, overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {AD_FORMATS.map(f => (
              <div key={f.id} onMouseDown={e => { e.stopPropagation(); setFormatId(f.id); setShowFmtPicker(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 4, cursor: 'pointer', background: f.id === formatId ? 'rgba(255,159,74,0.15)' : 'transparent' }}>
                <div style={{
                  width: f.w >= f.h ? 18 : Math.round(18 * f.w / f.h),
                  height: f.h >= f.w ? 18 : Math.round(18 * f.h / f.w),
                  background: f.id === formatId ? 'rgba(255,159,74,0.4)' : 'var(--color-border)', borderRadius: 2, flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: 'var(--color-text)', flex: 1 }}>{f.label}</span>
                <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{f.w}×{f.h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Override panel */}
        {showOverridePanel && (
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,159,74,0.2)', display: 'flex', flexDirection: 'column', gap: 10 }}
            onMouseDown={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9, color: '#FF9F4A', fontWeight: 700, letterSpacing: '0.05em' }}>◈ SLAVE SETTINGS</span>
              {hasOwn(overrides) && (
                <button onClick={() => setOverrides({})} onMouseDown={e => e.stopPropagation()}
                  style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  Resetuj
                </button>
              )}
            </div>
            <div>
              <div style={lbl}>Pozycja tekstu</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {posOpts.map(({ val, Icon }) => (
                  <button key={val} onMouseDown={e => e.stopPropagation()}
                    onClick={() => setOverrides(prev => ({ ...prev, textPosition: val }))}
                    style={seg(layout.textPosition === val)}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
              {!overrides.textPosition && (
                <div style={{ fontSize: 7, color: 'var(--color-text-muted)', marginTop: 2, opacity: 0.6 }}>z mastera</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={lbl}>CTA</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={layout.ctaVisible}
                  onChange={e => setOverrides(prev => ({ ...prev, ctaVisible: e.target.checked }))}
                  onMouseDown={e => e.stopPropagation()} style={{ margin: 0 }} />
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                  widoczne{!overrides.ctaVisible ? ' (z mastera)' : ''}
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { key: 'bgColor' as const,   label: 'Tło',   def: effectiveBg },
                { key: 'mainColor' as const, label: 'Nagł.', def: headline?.mainColor ?? '#ffffff' },
                { key: 'subColor' as const,  label: 'Sub',   def: headline?.subColor  ?? '#cccccc' },
              ].map(({ key, label, def }) => (
                <div key={key}>
                  <div style={{ ...lbl, color: overrides[key] ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {label}{!overrides[key] ? ' (M)' : ''}
                  </div>
                  <input type="color" value={overrides[key] ?? def}
                    onChange={e => setOverrides(prev => ({ ...prev, [key]: e.target.value }))}
                    onMouseDown={e => e.stopPropagation()}
                    style={{ width: 28, height: 20, padding: 1, border: '1px solid var(--color-field-border)', borderRadius: 3, cursor: 'pointer', background: 'none' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        {noMaster ? (
          <div style={{ minHeight: 160, background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, opacity: 0.12 }}>◈</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
              Podłącz<br />Banner Master
            </span>
          </div>
        ) : (
          <div style={{ background: '#0d0d0d', position: 'relative', lineHeight: 0 }}>
            <canvas ref={canvasRef} data-banner-canvas={`${id}-slave`}
              style={{ width: displayW, height: displayH, display: 'block' }} />

            {!headline && !cta && !imageUrl && !theme && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>Oczekuje na dane…</span>
              </div>
            )}

            {/* Scale label */}
            <div style={{ position: 'absolute', bottom: 18, left: 6, fontSize: 8, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontFamily: 'monospace' }}>
              {scalePercent}%{atMaxScale ? ' (max)' : ''}
            </div>

            {/* Resize handle — bottom-right corner */}
            <div
              onPointerDown={onResizeStart}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20,
                cursor: atMaxScale ? 'default' : 'se-resize',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                padding: 4,
                color: atMaxScale ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
              }}
              title={atMaxScale ? 'Maksymalna skala (1:1)' : `Przeciągnij aby zmienić rozmiar (${scalePercent}% → ${Math.round((fmt.w / displayW) * scalePercent)}%)`}
            >
              <ResizeGrip />
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  )
}
