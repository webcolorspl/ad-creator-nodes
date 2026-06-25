// ═══════════════════════════════════════════════
// AD CREATOR — BannerMasterNode
// Master banner: ustawienia dziedziczone przez slave'ów
// Przycisk "+" tworzy slave node via useReactFlow
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS, PLATFORM_GROUPS, PORT_COLORS } from '@/lib/constants'
import type {
  HeadlineData, CTAData, ImageData, BackgroundData, ThemeData,
  CopyGroupData, StyleData, HeadlineCTAVariant, NodeOutputs,
  BannerCardOverrides, BannerLayoutOptions, VerticalPosition, BannerMasterData,
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

function scanOutputs<T>(nodeOutputs: Record<string, NodeOutputs>, key: keyof NodeOutputs): T | null {
  for (const out of Object.values(nodeOutputs)) {
    const val = out?.[key]
    if (val !== undefined && val !== null) return val as T
  }
  return null
}

function OverridePanel({
  overrides,
  onChange,
}: {
  overrides: BannerCardOverrides
  onChange: (patch: Partial<BannerCardOverrides>) => void
}) {
  const posOptions: { val: VerticalPosition; icon: string; title: string }[] = [
    { val: 'top',    icon: '↑', title: 'Góra'   },
    { val: 'center', icon: '⊡', title: 'Środek' },
    { val: 'bottom', icon: '↓', title: 'Dół'    },
  ]

  const effectiveTextPos   = overrides.textPosition ?? 'center'
  const effectiveCtaVisible = overrides.ctaVisible  ?? true
  const effectiveBgColor   = overrides.bgColor    ?? '#1a1a2e'
  const effectiveMainColor = overrides.mainColor  ?? '#ffffff'
  const effectiveSubColor  = overrides.subColor   ?? '#cccccc'

  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '3px 0', fontSize: 13, cursor: 'pointer', borderRadius: 4,
    border: `1px solid ${active ? 'var(--color-process)' : 'var(--color-field-border)'}`,
    background: active ? 'rgba(124,92,245,0.18)' : 'transparent',
    color: active ? 'var(--color-process)' : 'var(--color-text-muted)',
    textAlign: 'center' as const,
  })
  const lbl: React.CSSProperties = { fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }
  const colorInput: React.CSSProperties = { width: 28, height: 20, padding: 1, border: '1px solid var(--color-field-border)', borderRadius: 3, cursor: 'pointer', background: 'none' }

  return (
    <div style={{ padding: '8px 10px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-field-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
      onMouseDown={e => e.stopPropagation()}>
      <div style={{ fontSize: 9, color: '#E7A800', fontWeight: 700 }}>★ Master Settings — dziedziczone przez wszystkie slave'y</div>

      <div>
        <div style={lbl}>Pozycja tekstu</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {posOptions.map(o => (
            <button key={o.val} title={o.title}
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onChange({ textPosition: o.val })}
              style={seg(effectiveTextPos === o.val)}>
              {o.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={lbl}>CTA</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={effectiveCtaVisible}
            onChange={e => onChange({ ctaVisible: e.target.checked })}
            onMouseDown={e => e.stopPropagation()}
            style={{ margin: 0 }} />
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>widoczne</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div>
          <div style={lbl}>Tło</div>
          <input type="color" value={effectiveBgColor}
            onChange={e => onChange({ bgColor: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            style={colorInput} />
        </div>
        <div>
          <div style={lbl}>Nagłówek</div>
          <input type="color" value={effectiveMainColor}
            onChange={e => onChange({ mainColor: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            style={colorInput} />
        </div>
        <div>
          <div style={lbl}>Sub</div>
          <input type="color" value={effectiveSubColor}
            onChange={e => onChange({ subColor: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            style={colorInput} />
        </div>
      </div>
    </div>
  )
}

export function BannerMasterNode({ id }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedVariants = resolveInput<HeadlineCTAVariant[]>(id, 'selectedVariants', edges, nodeOutputs)
                        ?? scanOutputs<HeadlineCTAVariant[]>(nodeOutputs, 'selectedVariants')

  const imageUrl = image?.url || background?.url || null
  const bgColor  = background?.color ?? null

  const [formatId, setFormatId]               = useState('ig-square')
  const [overrides, setOverrides]             = useState<BannerCardOverrides>({})
  const [zoom, setZoom]                       = useState(0.5)
  const [showFormatPicker, setShowFormatPicker]           = useState(false)
  const [showSlaveFormatPicker, setShowSlaveFormatPicker] = useState(false)
  const [showOverridePanel, setShowOverridePanel]         = useState(false)

  const masterKey = JSON.stringify({ headline, cta, imageUrl, bgColor, theme, overrides })
  useEffect(() => {
    const masterData: BannerMasterData = { headline, cta, imageUrl, bgColor, theme, overrides }
    setNodeOutput(id, { masterData })
  }, [masterKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fmt = AD_FORMATS.find(f => f.id === formatId) ?? AD_FORMATS[0]

  const layout: BannerLayoutOptions = {
    textPosition: overrides.textPosition ?? 'center',
    ctaVisible: overrides.ctaVisible ?? true,
  }
  const effectiveBgColor = overrides.bgColor ?? theme?.bgColor ?? bgColor ?? '#1a1a2e'
  const effectiveHeadline: HeadlineData | null = headline ? {
    ...headline,
    mainColor: overrides.mainColor ?? headline.mainColor,
    subColor:  overrides.subColor  ?? headline.subColor,
  } : null

  const canvasKey = JSON.stringify({ formatId, headline, cta, imageUrl, bgColor, theme, overrides })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (effectiveHeadline || cta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: effectiveHeadline ?? { main: '' },
      cta:      cta ?? { text: '', style: 'primary' },
    } : null
    composeBanner(canvas, { copy, background: null, bgColor: effectiveBgColor, image: imageUrl || undefined, style, theme: theme ?? null, layout })
      .catch(() => {
        canvas.width = Math.min(fmt.w, 1080); canvas.height = Math.min(fmt.h, 1080)
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.fillStyle = effectiveBgColor; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      })
  }, [canvasKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const { addNodes, addEdges, getNode, getEdges } = useReactFlow()

  function spawnSlave(fmtId: string) {
    const masterNode = getNode(id)
    if (!masterNode) return
    const existingSlaves = getEdges().filter(e => e.source === id && e.sourceHandle === 'masterData').length
    const newId = `slave-${Date.now()}`
    addNodes([{
      id: newId,
      type: 'bannerSlaveNode',
      position: {
        x: masterNode.position.x + 440,
        y: masterNode.position.y + existingSlaves * 340,
      },
      data: { formatId: fmtId },
    }])
    addEdges([{
      id: `${id}-to-${newId}`,
      source: id,
      sourceHandle: 'masterData',
      target: newId,
      targetHandle: 'masterData',
      type: 'bezier',
      animated: false,
      style: { stroke: PORT_COLORS['banner_master'] ?? '#FF9F4A', strokeWidth: 1.5, opacity: 0.7 },
    }])
    setShowSlaveFormatPicker(false)
  }

  function exportPng() {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `banner-master-${fmt.id}.png`; a.click()
  }

  const thumbW = Math.min(Math.round(fmt.w * zoom), 300 - 16)
  const thumbH = Math.round(fmt.h * (thumbW / fmt.w))

  const iconBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }
  const btnBase: React.CSSProperties = { fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', fontWeight: 600 }
  const btnActive: React.CSSProperties = { ...btnBase, border: '1px solid var(--color-process)', background: 'rgba(124,92,245,0.12)', color: 'var(--color-process)' }

  return (
    <BaseNode id={id} nodeType="bannerMasterNode">
      <div style={{ width: 300, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderBottom: '1px solid var(--color-field-border)', borderTop: '2px solid #E7A800', background: 'rgba(231,168,0,0.06)' }}>
          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: '#E7A800', color: '#000', flexShrink: 0 }}>★</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>Banner Master</span>
          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'var(--color-border)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {platformBadge(fmt.id)}
          </span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>· {fmt.w}×{fmt.h}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
            {ZOOM_OPTIONS.map(opt => (
              <button key={opt.value} onMouseDown={e => e.stopPropagation()} onClick={() => setZoom(opt.value)} style={zoom === opt.value ? { ...btnActive, padding: '1px 4px' } : { ...btnBase, padding: '1px 4px' }}>
                {opt.label}
              </button>
            ))}
            <button onMouseDown={e => { e.stopPropagation(); setShowFormatPicker(v => !v) }} style={{ ...iconBtn, fontSize: 10 }} title="Zmień format mastera">⋯</button>
            <button onMouseDown={e => { e.stopPropagation(); setShowOverridePanel(v => !v) }} style={{ ...iconBtn, fontSize: 10, color: showOverridePanel ? 'var(--color-process)' : undefined }} title="Master settings">⚙</button>
            <button onMouseDown={e => { e.stopPropagation(); exportPng() }} style={{ ...iconBtn, fontSize: 11 }} title="Export PNG">⬇</button>
            <button
              onMouseDown={e => { e.stopPropagation(); setShowSlaveFormatPicker(v => !v) }}
              style={{ ...iconBtn, fontSize: 14, color: showSlaveFormatPicker ? '#FF9F4A' : undefined }}
              title="Dodaj Slave banner">
              +
            </button>
          </div>
        </div>

        {/* Master format picker */}
        {showFormatPicker && (
          <div style={{ position: 'absolute', top: 30, right: 8, zIndex: 30, background: 'var(--color-surface)', border: '1px solid var(--color-field-border)', borderRadius: 6, padding: 6, minWidth: 180, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
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

        {/* Slave format picker */}
        {showSlaveFormatPicker && (
          <div style={{ position: 'absolute', top: 30, right: 8, zIndex: 30, background: 'var(--color-surface)', border: '1px solid #FF9F4A', borderRadius: 6, padding: 6, minWidth: 200, maxHeight: 300, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 9, color: '#FF9F4A', fontWeight: 700, padding: '2px 4px 6px 4px', borderBottom: '1px solid var(--color-field-border)', marginBottom: 4 }}>
              ◈ Wybierz format slave bannera
            </div>
            {PLATFORM_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, padding: '2px 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{group.label}</div>
                {group.ids.map(fmtId => {
                  const f = AD_FORMATS.find(af => af.id === fmtId)
                  if (!f) return null
                  return (
                    <div key={f.id} onMouseDown={e => { e.stopPropagation(); spawnSlave(f.id) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4, cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,159,74,0.12)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                      <AspectSwatch w={f.w} h={f.h} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>{f.label}</div>
                        <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{f.w}×{f.h}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* Override panel */}
        {showOverridePanel && (
          <OverridePanel
            overrides={overrides}
            onChange={patch => setOverrides(prev => ({ ...prev, ...patch }))}
          />
        )}

        {/* Canvas */}
        <div style={{ background: '#0d0d0d', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: thumbH }}>
          <canvas ref={canvasRef} data-banner-canvas={`${id}-master`} style={{ width: thumbW, height: thumbH, display: 'block', flexShrink: 0 }} />
          {!headline && !cta && !imageUrl && !theme && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, pointerEvents: 'none' }}>
              <span style={{ fontSize: 20, opacity: 0.25 }}>★</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4 }}>Podłącz<br />Headline + CTA</span>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  )
}
