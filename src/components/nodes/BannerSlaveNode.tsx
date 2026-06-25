// ═══════════════════════════════════════════════
// AD CREATOR — BannerSlaveNode
// Slave banner: dziedziczy z mastera, własny format
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type {
  CopyGroupData, StyleData, BannerCardOverrides, BannerLayoutOptions,
  BannerMasterData, HeadlineData,
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

function AspectSwatch({ w, h, size = 20 }: { w: number; h: number; size?: number }) {
  const ratio = w / h
  const sw = ratio >= 1 ? size : Math.round(size * ratio)
  const sh = ratio < 1 ? size : Math.round(size / ratio)
  return <div style={{ width: sw, height: sh, background: 'var(--color-border)', borderRadius: 2, flexShrink: 0 }} />
}

function hasCustomOverrides(o: BannerCardOverrides): boolean {
  return Object.values(o).some(v => v !== undefined)
}

export function BannerSlaveNode({ id, data }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)

  const masterData = resolveInput<BannerMasterData>(id, 'masterData', edges, nodeOutputs)

  const [formatId, setFormatId]           = useState((data as { formatId?: string }).formatId ?? 'ig-square')
  const [overrides, setOverrides]         = useState<BannerCardOverrides>({})
  const [zoom, setZoom]                   = useState(0.5)
  const [showFormatPicker, setShowFormatPicker]   = useState(false)
  const [showOverridePanel, setShowOverridePanel] = useState(false)

  const headline: HeadlineData | null = masterData?.headline ? {
    ...masterData.headline,
    mainColor: overrides.mainColor ?? masterData.overrides?.mainColor ?? masterData.headline.mainColor,
    subColor:  overrides.subColor  ?? masterData.overrides?.subColor  ?? masterData.headline.subColor,
  } : null
  const cta = masterData?.cta ?? null
  const imageUrl = masterData?.imageUrl ?? null
  const bgColor = overrides.bgColor ?? masterData?.overrides?.bgColor ?? masterData?.bgColor ?? null
  const theme = masterData?.theme ?? null
  const effectiveBgColor = bgColor ?? theme?.bgColor ?? '#1a1a2e'

  const layout: BannerLayoutOptions = {
    textPosition: overrides.textPosition ?? masterData?.overrides?.textPosition ?? 'center',
    ctaVisible: overrides.ctaVisible ?? masterData?.overrides?.ctaVisible ?? true,
  }

  const fmt = AD_FORMATS.find(f => f.id === formatId) ?? AD_FORMATS[0]

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasKey = JSON.stringify({ formatId, headline, cta, imageUrl, bgColor, theme, overrides, masterData })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta:      cta ?? { text: '', style: 'primary' },
    } : null
    composeBanner(canvas, { copy, background: null, bgColor: effectiveBgColor, image: imageUrl || undefined, style, theme: theme ?? null, layout })
      .catch(() => {
        canvas.width = Math.min(fmt.w, 1080); canvas.height = Math.min(fmt.h, 1080)
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.fillStyle = effectiveBgColor; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      })
  }, [canvasKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function exportPng() {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `banner-slave-${fmt.id}.png`; a.click()
  }

  const thumbW = Math.min(Math.round(fmt.w * zoom), 300 - 16)
  const thumbH = Math.round(fmt.h * (thumbW / fmt.w))

  const iconBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }
  const btnBase: React.CSSProperties = { fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', fontWeight: 600 }
  const btnActive: React.CSSProperties = { ...btnBase, border: '1px solid var(--color-process)', background: 'rgba(124,92,245,0.12)', color: 'var(--color-process)' }
  const lbl: React.CSSProperties = { fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }
  const colorInput: React.CSSProperties = { width: 28, height: 20, padding: 1, border: '1px solid var(--color-field-border)', borderRadius: 3, cursor: 'pointer', background: 'none' }

  const hasOwn = hasCustomOverrides(overrides)

  const posOptions: { val: 'top' | 'center' | 'bottom'; icon: string; title: string }[] = [
    { val: 'top',    icon: '↑', title: 'Góra'   },
    { val: 'center', icon: '⊡', title: 'Środek' },
    { val: 'bottom', icon: '↓', title: 'Dół'    },
  ]
  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '3px 0', fontSize: 13, cursor: 'pointer', borderRadius: 4,
    border: `1px solid ${active ? 'var(--color-process)' : 'var(--color-field-border)'}`,
    background: active ? 'rgba(124,92,245,0.18)' : 'transparent',
    color: active ? 'var(--color-process)' : 'var(--color-text-muted)',
    textAlign: 'center' as const,
  })

  return (
    <BaseNode id={id} nodeType="bannerSlaveNode">
      <div style={{ width: 300, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderBottom: '1px solid var(--color-field-border)', borderTop: `2px solid ${masterData ? '#FF9F4A' : 'var(--color-field-border)'}`, background: masterData ? 'rgba(255,159,74,0.04)' : 'transparent' }}>
          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'var(--color-process)', color: '#fff', flexShrink: 0 }}>◈</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>Slave</span>
          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'var(--color-border)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {platformBadge(fmt.id)}
          </span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>· {fmt.w}×{fmt.h}</span>
          {hasOwn && (
            <span title="Własne ustawienia" style={{ fontSize: 9, color: 'var(--color-process)', marginLeft: 2 }}>≠</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
            {ZOOM_OPTIONS.map(opt => (
              <button key={opt.value} onMouseDown={e => e.stopPropagation()} onClick={() => setZoom(opt.value)} style={zoom === opt.value ? { ...btnActive, padding: '1px 4px' } : { ...btnBase, padding: '1px 4px' }}>
                {opt.label}
              </button>
            ))}
            <button onMouseDown={e => { e.stopPropagation(); setShowFormatPicker(v => !v) }} style={{ ...iconBtn, fontSize: 10 }} title="Zmień format">⋯</button>
            <button onMouseDown={e => { e.stopPropagation(); setShowOverridePanel(v => !v) }} style={{ ...iconBtn, fontSize: 10, color: showOverridePanel ? 'var(--color-process)' : undefined }} title="Slave settings">⚙</button>
            <button onMouseDown={e => { e.stopPropagation(); exportPng() }} style={{ ...iconBtn, fontSize: 11 }} title="Export PNG">⬇</button>
          </div>
        </div>

        {/* Format picker */}
        {showFormatPicker && (
          <div style={{ position: 'absolute', top: 30, right: 8, zIndex: 20, background: 'var(--color-surface)', border: '1px solid var(--color-field-border)', borderRadius: 6, padding: 6, minWidth: 180, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            {AD_FORMATS.map(f => (
              <div key={f.id} onMouseDown={e => { e.stopPropagation(); setFormatId(f.id); setShowFormatPicker(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 4, cursor: 'pointer', background: f.id === formatId ? 'rgba(124,92,245,0.15)' : 'transparent' }}>
                <AspectSwatch w={f.w} h={f.h} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>{f.label}</div>
                  <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{f.w}×{f.h}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>{platformBadge(f.id)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Override panel */}
        {showOverridePanel && (
          <div style={{ padding: '8px 10px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-field-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
            onMouseDown={e => e.stopPropagation()}>
            <div style={{ fontSize: 9, color: 'var(--color-process)', fontWeight: 700 }}>◈ Slave Settings</div>

            <div>
              <div style={lbl}>Pozycja tekstu</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {posOptions.map(o => (
                  <button key={o.val} title={o.title}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setOverrides(prev => ({ ...prev, textPosition: o.val }))}
                    style={seg(layout.textPosition === o.val)}>
                    {o.icon}
                  </button>
                ))}
              </div>
              {!overrides.textPosition && masterData?.overrides?.textPosition && (
                <div style={{ fontSize: 8, color: 'var(--color-text-muted)', marginTop: 2 }}>z mastera</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={lbl}>CTA</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={layout.ctaVisible}
                  onChange={e => setOverrides(prev => ({ ...prev, ctaVisible: e.target.checked }))}
                  onMouseDown={e => e.stopPropagation()}
                  style={{ margin: 0 }} />
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                  widoczne{!overrides.ctaVisible !== undefined && masterData?.overrides?.ctaVisible !== undefined && !overrides.ctaVisible ? '' : ''}
                  {overrides.ctaVisible === undefined && masterData?.overrides?.ctaVisible !== undefined ? ' (z mastera)' : ''}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div>
                <div style={{ ...lbl, color: overrides.bgColor ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  Tło{overrides.bgColor ? '' : ' (M)'}
                </div>
                <input type="color" value={bgColor ?? '#1a1a2e'}
                  onChange={e => setOverrides(prev => ({ ...prev, bgColor: e.target.value }))}
                  onMouseDown={e => e.stopPropagation()}
                  style={colorInput} />
              </div>
              <div>
                <div style={{ ...lbl, color: overrides.mainColor ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  Nagłówek{overrides.mainColor ? '' : ' (M)'}
                </div>
                <input type="color" value={headline?.mainColor ?? '#ffffff'}
                  onChange={e => setOverrides(prev => ({ ...prev, mainColor: e.target.value }))}
                  onMouseDown={e => e.stopPropagation()}
                  style={colorInput} />
              </div>
              <div>
                <div style={{ ...lbl, color: overrides.subColor ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  Sub{overrides.subColor ? '' : ' (M)'}
                </div>
                <input type="color" value={headline?.subColor ?? '#cccccc'}
                  onChange={e => setOverrides(prev => ({ ...prev, subColor: e.target.value }))}
                  onMouseDown={e => e.stopPropagation()}
                  style={colorInput} />
              </div>
            </div>

            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setOverrides({})}
              style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Resetuj do mastera
            </button>
          </div>
        )}

        {/* Canvas or no-master placeholder */}
        {!masterData ? (
          <div style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--color-text-muted)', fontSize: 10, background: '#0d0d0d' }}>
            <span style={{ fontSize: 20, opacity: 0.25 }}>◈</span>
            <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.4 }}>Podłącz Banner Master</span>
          </div>
        ) : (
          <div style={{ background: '#0d0d0d', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: thumbH }}>
            <canvas ref={canvasRef} data-banner-canvas={`${id}-slave`} style={{ width: thumbW, height: thumbH, display: 'block', flexShrink: 0 }} />
            {!headline && !cta && !imageUrl && !theme && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, pointerEvents: 'none' }}>
                <span style={{ fontSize: 20, opacity: 0.25 }}>◈</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4 }}>Brak danych<br />z mastera</span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  )
}
