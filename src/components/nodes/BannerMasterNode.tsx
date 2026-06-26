// ═══════════════════════════════════════════════
// AD CREATOR — BannerMasterNode
// Duże okno mastera + przycisk "+" do slave'ów
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeFloatingPanel } from '@/components/ui/NodeFloatingPanel'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS, PLATFORM_GROUPS, PORT_COLORS } from '@/lib/constants'
import type {
  HeadlineData, CTAData, ImageData, BackgroundData, ThemeData,
  CopyGroupData, StyleData, HeadlineCTAVariant, NodeOutputs,
  BannerCardOverrides, BannerLayoutOptions, VerticalPosition, BannerMasterData,
} from '@/types'

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

function thumbSize(fmt: { w: number; h: number }) {
  let w = Math.round(fmt.w * 0.5)
  let h = Math.round(fmt.h * 0.5)
  const MAX_W = 400, MAX_H = 560
  if (w > MAX_W) { const r = MAX_W / w; w = MAX_W; h = Math.round(h * r) }
  if (h > MAX_H) { const r = MAX_H / h; h = MAX_H; w = Math.round(w * r) }
  return { w, h }
}

// ── OverridePanel ───────────────────────────────────────────────────────
function OverridePanel({ overrides, onChange }: {
  overrides: BannerCardOverrides
  onChange: (p: Partial<BannerCardOverrides>) => void
}) {
  const pos: { val: VerticalPosition; Icon: typeof AlignVerticalJustifyStart }[] = [
    { val: 'top',    Icon: AlignVerticalJustifyStart  },
    { val: 'center', Icon: AlignVerticalJustifyCenter },
    { val: 'bottom', Icon: AlignVerticalJustifyEnd    },
  ]
  const cur = overrides.textPosition ?? 'center'
  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '5px 0', cursor: 'pointer', borderRadius: 4, textAlign: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          {pos.map(({ val, Icon }) => (
            <button key={val} onClick={() => onChange({ textPosition: val })}
              onMouseDown={e => e.stopPropagation()} style={seg(cur === val)}>
              <Icon size={16} />
            </button>
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
function FormatThumb({ w, h, color }: { w: number; h: number; color: string }) {
  const BOX = 36
  const ratio = w / h
  const tw = ratio >= 1 ? BOX : Math.round(BOX * ratio)
  const th = ratio < 1  ? BOX : Math.round(BOX / ratio)
  return (
    <div style={{
      width: BOX, height: BOX, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: tw, height: th, borderRadius: 3,
        background: `${color}22`,
        border: `1.5px solid ${color}88`,
      }} />
    </div>
  )
}

function SlaveFormatPicker({ onSelect, onClose }: {
  onSelect: (fmtId: string) => void
  onClose: () => void
}) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1.5px solid #FF9F4A',
      borderRadius: 12,
      width: 320,
      maxHeight: 520,
      overflowY: 'auto',
      boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
    }} onMouseDown={e => e.stopPropagation()}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,159,74,0.2)',
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FF9F4A' }}>Dodaj baner</div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 1 }}>Wybierz format i rozmiar</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px',
        }}>×</button>
      </div>

      {/* Platform sections */}
      <div style={{ padding: '8px 10px' }}>
        {PLATFORM_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 14 }}>
            {/* Platform header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 4px 6px',
              borderBottom: `1px solid ${group.color}33`,
              marginBottom: 6,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 800, color: group.color,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{group.label}</span>
            </div>

            {/* Format grid — 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {group.ids.map(fmtId => {
                const f = AD_FORMATS.find(af => af.id === fmtId)
                if (!f) return null
                return (
                  <div key={f.id}
                    onMouseDown={e => { e.stopPropagation(); onSelect(f.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 8px', borderRadius: 7, cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'background .12s, border-color .12s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = `${group.color}12`
                      el.style.borderColor = `${group.color}44`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.borderColor = 'transparent'
                    }}>
                    <FormatThumb w={f.w} h={f.h} color={group.color} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{f.label}</div>
                      <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{f.w}×{f.h}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
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

  const { addNodes, addEdges, getNode, getEdges, getNodes } = useReactFlow()

  function spawnSlave(fmtId: string) {
    const masterNode = getNode(id); if (!masterNode) return
    const masterW = (masterNode as { measured?: { width?: number } }).measured?.width ?? nodeW
    const slaveEdges = getEdges().filter(e => e.source === id && e.sourceHandle === 'masterData')

    // Find lowest Y among existing slave nodes to stack below the last one
    let nextY = masterNode.position.y
    if (slaveEdges.length > 0) {
      const allNodes = getNodes()
      for (const e of slaveEdges) {
        const sn = allNodes.find(n => n.id === e.target)
        if (!sn) continue
        const snH = (sn as { measured?: { height?: number } }).measured?.height ?? 300
        nextY = Math.max(nextY, sn.position.y + snH + 20)
      }
    }

    const newId = `slave-${Date.now()}`
    addNodes([{ id: newId, type: 'bannerSlaveNode', position: {
      x: masterNode.position.x + masterW + 60,
      y: nextY,
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
      <NodeFloatingPanel nodeId={id} open={showSlavePicker} onClose={() => setShowSlavePicker(false)} placement="right" nodeWidth={nodeW}>
        <SlaveFormatPicker onSelect={spawnSlave} onClose={() => setShowSlavePicker(false)} />
      </NodeFloatingPanel>
      {/* "+" button — floats on right edge, vertically centered */}
      <button
        className="nodrag"
        onMouseDown={e => { e.stopPropagation(); setShowSlavePicker(v => !v) }}
        style={{
          position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%', zIndex: 10,
          background: showSlavePicker ? '#FF7A00' : '#FF9F4A',
          border: '3px solid var(--color-surface)',
          color: '#fff', fontSize: 22, fontWeight: 300, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          boxShadow: showSlavePicker
            ? '0 0 0 3px rgba(255,159,74,0.35), 0 4px 16px rgba(255,159,74,0.5)'
            : '0 2px 10px rgba(255,159,74,0.35)',
          transition: 'all .15s',
        }}
        title="Dodaj baner slave"
      >+</button>

      <div style={{ width: nodeW, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

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

      </div>
    </BaseNode>
  )
}
