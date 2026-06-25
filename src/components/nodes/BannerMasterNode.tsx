// ═══════════════════════════════════════════════
// AD CREATOR — BannerMasterNode
// Duże okno mastera + przycisk "+" do slave'ów
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

const MAX_CANVAS = 300

const PLATFORM_LABEL: Record<string, string> = {
  fb: 'Facebook', ig: 'Instagram', li: 'LinkedIn',
  tt: 'TikTok', x: 'X / Twitter', yt: 'YouTube', pn: 'Pinterest',
}
function platformLabel(id: string) {
  const prefix = id.split('-')[0]
  return PLATFORM_LABEL[prefix] ?? prefix.toUpperCase()
}

function scanOutputs<T>(nodeOutputs: Record<string, NodeOutputs>, key: keyof NodeOutputs): T | null {
  for (const out of Object.values(nodeOutputs)) {
    const val = out?.[key]
    if (val !== undefined && val !== null) return val as T
  }
  return null
}

function thumbSize(fmt: { w: number; h: number }, maxSide = MAX_CANVAS) {
  const ratio = fmt.w / fmt.h
  const w = ratio >= 1 ? maxSide : Math.round(maxSide * ratio)
  const h = ratio < 1 ? maxSide : Math.round(maxSide / ratio)
  return { w, h }
}

// ── OverridePanel ───────────────────────────────────────────────────────
function OverridePanel({ overrides, onChange }: {
  overrides: BannerCardOverrides
  onChange: (p: Partial<BannerCardOverrides>) => void
}) {
  const pos: { val: VerticalPosition; icon: string }[] = [
    { val: 'top', icon: '↑' }, { val: 'center', icon: '⊡' }, { val: 'bottom', icon: '↓' },
  ]
  const cur = overrides.textPosition ?? 'center'
  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '4px 0', fontSize: 13, cursor: 'pointer', borderRadius: 4, textAlign: 'center',
    border: `1px solid ${active ? '#E7A800' : 'var(--color-field-border)'}`,
    background: active ? 'rgba(231,168,0,0.15)' : 'transparent',
    color: active ? '#E7A800' : 'var(--color-text-muted)',
  })
  const lbl: React.CSSProperties = { fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
  const ci: React.CSSProperties  = { width: 28, height: 20, padding: 1, border: '1px solid var(--color-field-border)', borderRadius: 3, cursor: 'pointer', background: 'none' }

  return (
    <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(231,168,0,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}
      onMouseDown={e => e.stopPropagation()}>
      <div style={{ fontSize: 9, color: '#E7A800', fontWeight: 700, letterSpacing: '0.05em' }}>★ MASTER SETTINGS</div>
      <div>
        <div style={lbl}>Pozycja tekstu</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {pos.map(o => (
            <button key={o.val} onClick={() => onChange({ textPosition: o.val })}
              onMouseDown={e => e.stopPropagation()} style={seg(cur === o.val)}>{o.icon}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={lbl}>CTA</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={overrides.ctaVisible ?? true}
            onChange={e => onChange({ ctaVisible: e.target.checked })}
            onMouseDown={e => e.stopPropagation()} style={{ margin: 0 }} />
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>widoczne</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { key: 'bgColor' as const,   label: 'Tło',   def: '#1a1a2e' },
          { key: 'mainColor' as const, label: 'Nagł.', def: '#ffffff' },
          { key: 'subColor' as const,  label: 'Sub',   def: '#cccccc' },
        ].map(({ key, label, def }) => (
          <div key={key}>
            <div style={lbl}>{label}</div>
            <input type="color" value={overrides[key] ?? def}
              onChange={e => onChange({ [key]: e.target.value })}
              onMouseDown={e => e.stopPropagation()} style={ci} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SlaveFormatPicker ────────────────────────────────────────────────────
function SlaveFormatPicker({ onSelect, onClose }: {
  onSelect: (fmtId: string) => void
  onClose: () => void
}) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, background: 'var(--color-surface)',
      border: '1px solid #FF9F4A', borderRadius: 10,
      padding: 10, minWidth: 220, maxHeight: 360, overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }} onMouseDown={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: '#FF9F4A', fontWeight: 700 }}>Wybierz format slave</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
      </div>
      {PLATFORM_GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 4px', marginBottom: 2 }}>
            {group.label}
          </div>
          {group.ids.map(fmtId => {
            const f = AD_FORMATS.find(af => af.id === fmtId)
            if (!f) return null
            return (
              <div key={f.id}
                onMouseDown={e => { e.stopPropagation(); onSelect(f.id) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 5, cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,159,74,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: f.w >= f.h ? 20 : Math.round(20 * f.w / f.h),
                    height: f.h >= f.w ? 20 : Math.round(20 * f.h / f.w),
                    background: 'var(--color-border)', borderRadius: 2,
                  }} />
                </div>
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
  )
}

// ── BannerMasterNode ─────────────────────────────────────────────────────
export function BannerMasterNode({ id }: NodeProps) {
  const edges        = useAppStore(s => s.edges)
  const nodeOutputs  = useAppStore(s => s.nodeOutputs)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)

  const headline         = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs) ?? scanOutputs<HeadlineData>(nodeOutputs, 'headline')
  const cta              = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs) ?? scanOutputs<CTAData>(nodeOutputs, 'cta')
  const image            = resolveInput<ImageData>(id, 'image', edges, nodeOutputs) ?? scanOutputs<ImageData>(nodeOutputs, 'image')
  const background       = resolveInput<BackgroundData>(id, 'background', edges, nodeOutputs) ?? scanOutputs<BackgroundData>(nodeOutputs, 'background')
  const theme            = resolveInput<ThemeData>(id, 'theme', edges, nodeOutputs) ?? scanOutputs<ThemeData>(nodeOutputs, 'theme')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sv = resolveInput<HeadlineCTAVariant[]>(id, 'selectedVariants', edges, nodeOutputs)

  const imageUrl = image?.url || background?.url || null
  const bgColor  = background?.color ?? null

  const [formatId,   setFormatId]   = useState('ig-square')
  const [overrides,  setOverrides]  = useState<BannerCardOverrides>({})
  const [showOverride, setShowOverride] = useState(false)
  const [showSlavePicker, setShowSlavePicker] = useState(false)
  const [showFmtPicker,   setShowFmtPicker]   = useState(false)

  const masterKey = JSON.stringify({ headline, cta, imageUrl, bgColor, theme, overrides })
  useEffect(() => {
    setNodeOutput(id, { masterData: { headline, cta, imageUrl, bgColor, theme, overrides } as BannerMasterData })
  }, [masterKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fmt       = AD_FORMATS.find(f => f.id === formatId) ?? AD_FORMATS[0]
  const { w: thumbW, h: thumbH } = thumbSize(fmt)
  const nodeW = Math.max(240, thumbW + 24)

  const layout: BannerLayoutOptions = {
    textPosition: overrides.textPosition ?? 'center',
    ctaVisible:   overrides.ctaVisible   ?? true,
  }
  const effectiveBgColor = overrides.bgColor ?? theme?.bgColor ?? bgColor ?? '#1a1a2e'
  const effectiveHeadline: HeadlineData | null = headline ? {
    ...headline,
    mainColor: overrides.mainColor ?? headline.mainColor,
    subColor:  overrides.subColor  ?? headline.subColor,
  } : null

  const canvasKey = JSON.stringify({ formatId, headline, cta, imageUrl, bgColor, theme, overrides })
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (effectiveHeadline || cta) ? {
      prompt: { text: '', tone: 'neutral', lang: 'pl' },
      headline: effectiveHeadline ?? { main: '' },
      cta: cta ?? { text: '', style: 'primary' },
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
    const masterNode = getNode(id); if (!masterNode) return
    const slaveCount = getEdges().filter(e => e.source === id && e.sourceHandle === 'masterData').length
    const newId = `slave-${Date.now()}`
    addNodes([{ id: newId, type: 'bannerSlaveNode', position: {
      x: masterNode.position.x + nodeW + 60,
      y: masterNode.position.y + slaveCount * 360,
    }, data: { formatId: fmtId } }])
    addEdges([{
      id: `${id}-${newId}`, source: id, sourceHandle: 'masterData',
      target: newId, targetHandle: 'masterData', type: 'bezier', animated: false,
      style: { stroke: PORT_COLORS['banner_master'] ?? '#FF9F4A', strokeWidth: 1.5, opacity: 0.7 },
    }])
    setShowSlavePicker(false)
  }

  function exportPng() {
    const c = canvasRef.current; if (!c) return
    const a = document.createElement('a'); a.href = c.toDataURL('image/png')
    a.download = `master-${fmt.id}.png`; a.click()
  }

  return (
    <BaseNode id={id} nodeType="bannerMasterNode">
      <div style={{ width: nodeW, position: 'relative', paddingBottom: 20 }} onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
          borderBottom: '1px solid rgba(231,168,0,0.3)',
          background: 'rgba(231,168,0,0.06)',
        }}>
          <span style={{ fontSize: 11 }}>★</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#E7A800', lineHeight: 1 }}>Master</div>
            <div style={{ fontSize: 8, color: 'var(--color-text-muted)', marginTop: 1 }}>{fmt.label} · {fmt.w}×{fmt.h}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onMouseDown={e => { e.stopPropagation(); setShowFmtPicker(v => !v) }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: '2px 4px' }} title="Zmień format">⋯</button>
            <button onMouseDown={e => { e.stopPropagation(); setShowOverride(v => !v) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: '2px 4px', color: showOverride ? '#E7A800' : 'var(--color-text-muted)' }} title="Ustawienia">⚙</button>
            <button onMouseDown={e => { e.stopPropagation(); exportPng() }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: '2px 4px' }} title="Export PNG">⬇</button>
          </div>
        </div>

        {/* Format picker (master) */}
        {showFmtPicker && (
          <div style={{ position: 'absolute', top: 36, right: 8, zIndex: 40, background: 'var(--color-surface)', border: '1px solid var(--color-field-border)', borderRadius: 8, padding: 6, minWidth: 180, maxHeight: 240, overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {AD_FORMATS.map(f => (
              <div key={f.id} onMouseDown={e => { e.stopPropagation(); setFormatId(f.id); setShowFmtPicker(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 4, cursor: 'pointer', background: f.id === formatId ? 'rgba(231,168,0,0.15)' : 'transparent' }}>
                <div style={{
                  width: f.w >= f.h ? 18 : Math.round(18 * f.w / f.h),
                  height: f.h >= f.w ? 18 : Math.round(18 * f.h / f.w),
                  background: 'var(--color-border)', borderRadius: 2, flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: 'var(--color-text)' }}>{f.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{f.w}×{f.h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Override panel */}
        {showOverride && (
          <OverridePanel overrides={overrides} onChange={p => setOverrides(prev => ({ ...prev, ...p }))} />
        )}

        {/* Canvas */}
        <div style={{ background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: thumbH, position: 'relative' }}>
          <canvas ref={canvasRef} data-banner-canvas={`${id}-master`}
            style={{ width: thumbW, height: thumbH, display: 'block' }} />
          {!headline && !cta && !imageUrl && !theme && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
              <span style={{ fontSize: 28, opacity: 0.15 }}>★</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>Podłącz Headline + CTA<br />do mastera</span>
            </div>
          )}
        </div>

        {/* "+" button — spawns slave */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, position: 'relative' }}>
          <button
            onMouseDown={e => { e.stopPropagation(); setShowSlavePicker(v => !v) }}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: showSlavePicker ? '#FF9F4A' : 'var(--color-field-bg)',
              border: `2px solid ${showSlavePicker ? '#FF9F4A' : 'var(--color-field-border)'}`,
              color: showSlavePicker ? '#000' : 'var(--color-text-muted)',
              fontSize: 20, fontWeight: 300, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              transition: 'all .15s',
              boxShadow: showSlavePicker ? '0 0 0 3px rgba(255,159,74,0.25)' : 'none',
            }}
            title="Dodaj slave baner">
            +
          </button>
          {showSlavePicker && (
            <SlaveFormatPicker onSelect={spawnSlave} onClose={() => setShowSlavePicker(false)} />
          )}
        </div>
      </div>
    </BaseNode>
  )
}
