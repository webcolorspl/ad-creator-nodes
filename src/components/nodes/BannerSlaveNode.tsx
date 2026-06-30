// ═══════════════════════════════════════════════
// AD CREATOR — BannerSlaveNode
// Podgląd banera slave z pills bar (visible on select)
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import {
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Trash2, RectangleHorizontal, Pencil, SlidersHorizontal, Download,
} from 'lucide-react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type {
  CopyGroupData, StyleData, BannerCardOverrides, BannerLayoutOptions,
  BannerMasterData, HeadlineData, CTAData, VerticalPosition,
} from '@/types'
import { BannerEditorModal } from '@/components/ui/BannerEditorModal'

// ── Platform helpers ───────────────────────────
const PLATFORM_COLOR: Record<string, string> = {
  fb: '#1877F2', ig: '#E1306C', li: '#0A66C2',
  tt: '#69C9D0', x: '#8899AA', yt: '#FF0000', pn: '#E60023',
}
const PLATFORM_SHORT: Record<string, string> = {
  fb: 'FB', ig: 'IG', li: 'LI', tt: 'TT', x: 'X', yt: 'YT', pn: 'PN',
}
function platformPrefix(id: string) { return id.split('-')[0] }

function PlatformBadge({ formatId }: { formatId: string }) {
  const prefix = platformPrefix(formatId)
  const color  = PLATFORM_COLOR[prefix] ?? '#7A8AB0'
  const short  = PLATFORM_SHORT[prefix] ?? prefix.toUpperCase()
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
      padding: '2px 6px', borderRadius: 4,
      background: `${color}22`, color,
      border: `1px solid ${color}55`, flexShrink: 0,
    }}>{short}</span>
  )
}

// ── Pills button ────────────────────────────────
function PillBtn({
  icon, onClick, title, active = false, danger = false,
}: {
  icon: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
  danger?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseDown={e => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
      style={{
        background: danger && hover
          ? 'rgba(239,68,68,0.28)'
          : active || hover
            ? 'rgba(255,255,255,0.2)'
            : 'rgba(255,255,255,0.09)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 7,
        padding: '5px 9px',
        color: danger && hover ? '#ef4444' : active ? '#fff' : 'rgba(255,255,255,0.82)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.1s, border-color 0.1s, color 0.1s',
        lineHeight: 1,
      }}
    >
      {icon}
    </button>
  )
}

// ── Thumb size ─────────────────────────────────
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

// Corner resize grip
function ResizeGrip() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ display: 'block' }}>
      <circle cx="10" cy="10" r="1.5"/>
      <circle cx="10" cy="5.5" r="1.5"/>
      <circle cx="5.5" cy="10" r="1.5"/>
    </svg>
  )
}

// ── Main component ─────────────────────────────
export function BannerSlaveNode({ id, data }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)
  const selectedId  = useAppStore(s => s.selectedId)
  const { deleteElements } = useReactFlow()

  const isSelected = selectedId === id
  const masterData = resolveInput<BannerMasterData>(id, 'masterData', edges, nodeOutputs)

  const [formatId,         setFormatId]         = useState((data as { formatId?: string }).formatId ?? 'ig-square')
  const version = (data as { version?: number }).version ?? 1
  const [overrides,        setOverrides]        = useState<BannerCardOverrides>({})
  const [headlineOverride, setHeadlineOverride] = useState<HeadlineData | null>(null)
  const [ctaOverride,      setCtaOverride]      = useState<CTAData | null>(null)
  const [showFmtPicker,    setShowFmtPicker]    = useState(false)
  const [showOverrides,    setShowOverrides]    = useState(false)
  const [editorOpen,       setEditorOpen]       = useState(false)

  const fmt = AD_FORMATS.find(f => f.id === formatId) ?? AD_FORMATS[0]
  const { w: minW, h: minH } = thumbSize(fmt)

  const [displayW, setDisplayW] = useState(minW)
  const [displayH, setDisplayH] = useState(minH)

  useEffect(() => {
    const { w, h } = thumbSize(fmt)
    setDisplayW(w); setDisplayH(h)
  }, [formatId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close panels when deselected
  useEffect(() => {
    if (!isSelected) { setShowFmtPicker(false); setShowOverrides(false) }
  }, [isSelected])

  const nodeW = Math.max(220, displayW + 24)

  const headline: HeadlineData | null = masterData?.headline ? {
    ...masterData.headline,
    ...(headlineOverride ?? {}),
    mainColor: overrides.mainColor ?? headlineOverride?.mainColor ?? masterData.overrides?.mainColor ?? masterData.headline.mainColor,
    subColor:  overrides.subColor  ?? headlineOverride?.subColor  ?? masterData.overrides?.subColor  ?? masterData.headline.subColor,
  } : null
  const cta = ctaOverride
    ? { ...(masterData?.cta ?? { text: '', style: 'primary' as const }), ...ctaOverride }
    : masterData?.cta ?? null
  const effectiveImageUrl = overrides.imageUrl ?? masterData?.imageUrl ?? null
  const effectiveBg       = overrides.bgColor ?? masterData?.overrides?.bgColor ?? masterData?.bgColor ?? masterData?.theme?.bgColor ?? '#1a1a2e'
  const theme             = masterData?.theme ?? null
  const layout: BannerLayoutOptions = {
    textPosition: overrides.textPosition ?? masterData?.overrides?.textPosition ?? 'center',
    ctaVisible:   overrides.ctaVisible   ?? masterData?.overrides?.ctaVisible   ?? true,
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasKey = JSON.stringify({ formatId, headline, cta, effectiveImageUrl, effectiveBg, theme, overrides, masterData })
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta:      cta ?? { text: '', style: 'primary' },
    } : null
    composeBanner(canvas, {
      copy, background: null, bgColor: effectiveBg,
      image: effectiveImageUrl || undefined,
      style, theme: theme ?? null, layout,
      bgFit:          overrides.bgFit,
      bgOffsetX:      overrides.bgOffsetX,
      bgOffsetY:      overrides.bgOffsetY,
      bgScale:        overrides.bgScale,
      overlayOpacity: overrides.overlayOpacity,
    }).catch(() => {
      canvas.width  = Math.min(fmt.w, 1080)
      canvas.height = Math.min(fmt.h, 1080)
      const ctx = canvas.getContext('2d')
      if (ctx) { ctx.fillStyle = effectiveBg; ctx.fillRect(0, 0, canvas.width, canvas.height) }
    })
  }, [canvasKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function exportPng() {
    const c = canvasRef.current; if (!c) return
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `banner-${fmt.id}.png`
    a.click()
  }

  function deleteNode() { deleteElements({ nodes: [{ id }] }) }

  // Corner drag resize
  function onResizeStart(e: React.PointerEvent) {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX, startW = displayW
    const ratio  = fmt.h / fmt.w, maxW = fmt.w

    function onMove(ev: PointerEvent) {
      const newW = Math.max(minW, Math.min(maxW, startW + (ev.clientX - startX)))
      setDisplayW(newW); setDisplayH(Math.round(newW * ratio))
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const noMaster     = !masterData
  const scalePercent = Math.round((displayW / fmt.w) * 100)
  const atMaxScale   = displayW >= fmt.w - 1

  // Override panel helpers
  const posOpts: { val: VerticalPosition; Icon: typeof AlignVerticalJustifyStart }[] = [
    { val: 'top',    Icon: AlignVerticalJustifyStart  },
    { val: 'center', Icon: AlignVerticalJustifyCenter },
    { val: 'bottom', Icon: AlignVerticalJustifyEnd    },
  ]
  const lbl: React.CSSProperties = {
    fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
  }
  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '5px 0', cursor: 'pointer', borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${active ? 'rgba(124,92,245,0.7)' : 'rgba(255,255,255,0.12)'}`,
    background: active ? 'rgba(124,92,245,0.25)' : 'rgba(255,255,255,0.06)',
    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
  })

  return (
    <BaseNode
      id={id}
      nodeType="bannerSlaveNode"
      titleOverride={`${fmt.w}×${fmt.h}`}
      badgeContent={<PlatformBadge formatId={formatId} />}
    >
      <div style={{ width: nodeW, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* No master placeholder */}
        {noMaster ? (
          <div style={{
            minHeight: 160, background: '#0d0d0d',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 24, opacity: 0.12 }}>◈</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
              Podłącz<br />Banner Master
            </span>
          </div>
        ) : (
          <div style={{ background: '#0d0d0d', position: 'relative', lineHeight: 0 }}>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              data-banner-canvas={`${id}-slave`}
              style={{ width: displayW, height: displayH, display: 'block' }}
            />

            {/* Empty state */}
            {!headline && !cta && !effectiveImageUrl && !theme && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>Oczekuje na dane…</span>
              </div>
            )}

            {/* ── Pills bar — visible when selected ─────── */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              padding: '10px 8px 20px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, transparent 100%)',
              opacity: isSelected ? 1 : 0,
              transform: isSelected ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              pointerEvents: isSelected ? 'auto' : 'none',
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex', gap: 4,
                background: 'rgba(8,8,18,0.72)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 10,
                padding: '5px 7px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}>
                <PillBtn
                  icon={<Pencil size={14} strokeWidth={1.75} />}
                  onClick={() => setEditorOpen(true)}
                  title="Edytor bannera"
                  active={editorOpen}
                />
                <PillBtn
                  icon={<RectangleHorizontal size={14} strokeWidth={1.75} />}
                  onClick={() => { setShowFmtPicker(v => !v); setShowOverrides(false) }}
                  title="Zmień format"
                  active={showFmtPicker}
                />
                <PillBtn
                  icon={<SlidersHorizontal size={14} strokeWidth={1.75} />}
                  onClick={() => { setShowOverrides(v => !v); setShowFmtPicker(false) }}
                  title="Ustawienia"
                  active={showOverrides}
                />
                <PillBtn
                  icon={<Download size={14} strokeWidth={1.75} />}
                  onClick={exportPng}
                  title="Pobierz PNG"
                />
                <PillBtn
                  icon={<Trash2 size={14} strokeWidth={1.75} />}
                  onClick={deleteNode}
                  title="Usuń baner"
                  danger
                />
              </div>
            </div>

            {/* ── Format picker panel ───────────────────── */}
            {showFmtPicker && (
              <div
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 52, left: 8, right: 8, zIndex: 30,
                  background: 'rgba(12,12,24,0.96)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 6,
                  maxHeight: 220,
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                {AD_FORMATS.map(f => (
                  <div
                    key={f.id}
                    onMouseDown={e => { e.stopPropagation(); setFormatId(f.id); setShowFmtPicker(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                      background: f.id === formatId ? 'rgba(255,159,74,0.15)' : 'transparent',
                    }}
                  >
                    <div style={{
                      width:  f.w >= f.h ? 16 : Math.round(16 * f.w / f.h),
                      height: f.h >= f.w ? 16 : Math.round(16 * f.h / f.w),
                      background: f.id === formatId ? '#FF9F4A' : 'rgba(255,255,255,0.2)',
                      borderRadius: 2, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', flex: 1 }}>{f.label}</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{f.w}×{f.h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Override panel ────────────────────────── */}
            {showOverrides && (
              <div
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 52, left: 0, right: 0, zIndex: 30,
                  background: 'rgba(12,12,24,0.96)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  margin: '0 8px',
                  padding: '10px 12px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: '#FF9F4A', fontWeight: 700, letterSpacing: '0.05em' }}>USTAWIENIA</span>
                  {hasOwn(overrides) && (
                    <button
                      onClick={() => setOverrides({})}
                      onMouseDown={e => e.stopPropagation()}
                      style={{
                        fontSize: 8, padding: '2px 6px', borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                      }}
                    >
                      Resetuj
                    </button>
                  )}
                </div>

                {/* Text position */}
                <div>
                  <div style={lbl}>Pozycja tekstu</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {posOpts.map(({ val, Icon }) => (
                      <button
                        key={val}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => setOverrides(prev => ({ ...prev, textPosition: val }))}
                        style={seg(layout.textPosition === val)}
                      >
                        <Icon size={15} strokeWidth={1.75} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={layout.ctaVisible}
                    onChange={e => setOverrides(prev => ({ ...prev, ctaVisible: e.target.checked }))}
                    onMouseDown={e => e.stopPropagation()}
                    style={{ margin: 0, accentColor: '#c4b5fd' }}
                  />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>Pokaż CTA</span>
                </label>

                {/* Color pickers */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {([
                    { key: 'bgColor'    as const, label: 'Tło',   def: effectiveBg },
                    { key: 'mainColor'  as const, label: 'Nagł.', def: headline?.mainColor ?? '#ffffff' },
                    { key: 'subColor'   as const, label: 'Sub',   def: headline?.subColor  ?? '#cccccc' },
                  ] as const).map(({ key, label, def }) => (
                    <div key={key}>
                      <div style={{ ...lbl, color: overrides[key] ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                        {label}{!overrides[key] ? ' ·M' : ''}
                      </div>
                      <input
                        type="color"
                        value={overrides[key] ?? def}
                        onChange={e => setOverrides(prev => ({ ...prev, [key]: e.target.value }))}
                        onMouseDown={e => e.stopPropagation()}
                        style={{ width: 28, height: 22, padding: 1, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Version badge */}
            {version > 1 && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                background: 'rgba(124,92,245,0.55)', color: '#e9d5ff',
                border: '1px solid rgba(124,92,245,0.4)', pointerEvents: 'none',
              }}>v{version}</div>
            )}

            {/* Override indicator */}
            {hasOwn(overrides) && (
              <div style={{
                position: 'absolute', top: version > 1 ? 26 : 6, right: 6,
                fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                background: 'rgba(124,92,245,0.4)', color: '#c4b5fd',
                pointerEvents: 'none',
              }}>≠</div>
            )}

            {/* Scale label */}
            <div style={{
              position: 'absolute', bottom: 18, left: 6,
              fontSize: 8, color: 'rgba(255,255,255,0.25)',
              pointerEvents: 'none', fontFamily: 'monospace',
            }}>
              {scalePercent}%{atMaxScale ? ' max' : ''}
            </div>

            {/* Resize handle */}
            <div
              onPointerDown={onResizeStart}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20,
                cursor: atMaxScale ? 'default' : 'se-resize',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                padding: 4,
                color: atMaxScale ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)',
              }}
            >
              <ResizeGrip />
            </div>
          </div>
        )}
      </div>

      <BannerEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        formatId={formatId}
        masterData={masterData ?? null}
        overrides={overrides}
        onApply={(newOverrides, hl, cta) => {
          setOverrides(newOverrides)
          setHeadlineOverride(hl)
          setCtaOverride(cta)
        }}
      />
    </BaseNode>
  )
}
