// ═══════════════════════════════════════════════
// AD CREATOR — BannerGridNode
// Master/slave bannery z per-card overrides
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type {
  HeadlineData, CTAData, ImageData, BackgroundData, ThemeData,
  CopyGroupData, StyleData, HeadlineCTAVariant, NodeOutputs,
  BannerCard, BannerCardOverrides, BannerLayoutOptions, VerticalPosition,
} from '@/types'

const DEFAULT_FORMATS = ['ig-square', 'fb-feed', 'tt-video']
const ZOOM_OPTIONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5  },
  { label: '100%', value: 1   },
]
const PLATFORM_ICON: Record<string, string> = {
  fb: 'FB', ig: 'IG', li: 'LI', tt: 'TT', x: 'X', yt: 'YT', pn: 'PIN', gd: 'GDN', pg: 'PG',
}
function platformBadge(id: string) {
  return PLATFORM_ICON[id.split('-')[0]] ?? id.split('-')[0].toUpperCase()
}
function AspectSwatch({ w, h, size = 24 }: { w: number; h: number; size?: number }) {
  const ratio = w / h
  const sw = ratio >= 1 ? size : Math.round(size * ratio)
  const sh = ratio < 1 ? size : Math.round(size / ratio)
  return <div style={{ width: sw, height: sh, background: 'var(--color-border)', borderRadius: 2, flexShrink: 0 }} />
}

// ── OverridePanel ───────────────────────────────────────────────────────
function OverridePanel({
  isMaster, overrides, masterOverrides, onChange, onReset,
}: {
  isMaster: boolean
  overrides: BannerCardOverrides
  masterOverrides: BannerCardOverrides
  onChange: (patch: Partial<BannerCardOverrides>) => void
  onReset: () => void
}) {
  const posOptions: { val: VerticalPosition; icon: string; title: string }[] = [
    { val: 'top',    icon: '↑', title: 'Góra'   },
    { val: 'center', icon: '⊡', title: 'Środek' },
    { val: 'bottom', icon: '↓', title: 'Dół'    },
  ]

  const effectiveTextPos  = overrides.textPosition ?? masterOverrides.textPosition ?? 'center'
  const effectiveCtaVisible = overrides.ctaVisible  ?? masterOverrides.ctaVisible  ?? true
  const effectiveBgColor  = overrides.bgColor    ?? masterOverrides.bgColor    ?? '#1a1a2e'
  const effectiveMainColor = overrides.mainColor  ?? masterOverrides.mainColor  ?? '#ffffff'
  const effectiveSubColor  = overrides.subColor   ?? masterOverrides.subColor   ?? '#cccccc'

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
      {isMaster && (
        <div style={{ fontSize: 9, color: '#E7A800', fontWeight: 700 }}>★ Master — ustawienia dziedziczone przez slave</div>
      )}

      {/* Text position */}
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

      {/* CTA visible */}
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

      {/* Color overrides */}
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

      {!isMaster && (
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onReset}
          style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', alignSelf: 'flex-start' }}>
          Resetuj do mastera
        </button>
      )}
    </div>
  )
}

// ── hasCustomOverrides ──────────────────────────────────────────────────
function hasCustomOverrides(o: BannerCardOverrides): boolean {
  return Object.values(o).some(v => v !== undefined)
}

// ── FormatCard ──────────────────────────────────────────────────────────
interface FormatCardProps {
  uid: string; formatId: string; nodeId: string
  headline: HeadlineData | null; cta: CTAData | null
  imageUrl: string | null; bgColor?: string | null; theme: ThemeData | null
  thumbW: number
  isMaster: boolean
  resolvedOverrides: BannerCardOverrides
  masterOverrides: BannerCardOverrides
  onSetMaster: () => void
  onOverrideChange: (patch: Partial<BannerCardOverrides>) => void
  onResetOverrides: () => void
  onRemove: () => void; onDuplicate: () => void; onChangeFormat: (id: string) => void
}

function FormatCard({
  uid, formatId, nodeId, headline, cta, imageUrl, bgColor, theme, thumbW,
  isMaster, resolvedOverrides, masterOverrides,
  onSetMaster, onOverrideChange, onResetOverrides, onRemove, onDuplicate, onChangeFormat,
}: FormatCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pickerOpen,   setPickerOpen]   = useState(false)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const fmt = AD_FORMATS.find(f => f.id === formatId)

  // Build effective copy with color overrides
  const effectiveHeadline: HeadlineData | null = headline ? {
    ...headline,
    mainColor: resolvedOverrides.mainColor ?? headline.mainColor,
    subColor:  resolvedOverrides.subColor  ?? headline.subColor,
  } : null
  const effectiveBgColor = resolvedOverrides.bgColor ?? theme?.bgColor ?? bgColor ?? '#1a1a2e'
  const layout: BannerLayoutOptions = {
    textPosition: resolvedOverrides.textPosition ?? 'center',
    ctaVisible:   resolvedOverrides.ctaVisible   ?? true,
  }

  const inputKey = JSON.stringify({ formatId, headline, cta, imageUrl, bgColor, theme, resolvedOverrides })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !fmt) return
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
  }, [inputKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!fmt) return null
  const thumbH = Math.round(fmt.h * (thumbW / fmt.w))

  function exportPng() {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `banner-${fmt!.id}.png`; a.click()
  }

  const hasOwn = hasCustomOverrides(
    Object.fromEntries(Object.entries(resolvedOverrides).filter(([k]) => !(masterOverrides as Record<string,unknown>)[k])) as BannerCardOverrides
  )

  const iconBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }
  const borderColor = isMaster ? '#E7A800' : 'var(--color-field-border)'
  const borderW     = isMaster ? 2 : 1

  return (
    <div style={{ background: 'var(--color-field-bg)', border: `${borderW}px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderBottom: '1px solid var(--color-field-border)' }}>
        <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: isMaster ? '#E7A800' : 'var(--color-process)', color: isMaster ? '#000' : '#fff', flexShrink: 0 }}>
          {isMaster ? '★' : platformBadge(fmt.id)}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>{fmt.label}</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>· {fmt.w}×{fmt.h}</span>
        {!isMaster && hasOwn && (
          <span title="Własne ustawienia" style={{ fontSize: 9, color: 'var(--color-process)', marginLeft: 2 }}>≠</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <button onMouseDown={e => e.stopPropagation()} onClick={onSetMaster}
            style={{ ...iconBtn, fontSize: 10, color: isMaster ? '#E7A800' : undefined }}
            title={isMaster ? 'To jest master' : 'Ustaw jako master'}>
            {isMaster ? '★' : '☆'}
          </button>
          <button onMouseDown={e => { e.stopPropagation(); setOverrideOpen(v => !v) }}
            style={{ ...iconBtn, fontSize: 10, color: overrideOpen ? 'var(--color-process)' : undefined }}
            title="Ustawienia bannera">⚙</button>
          <button onMouseDown={e => { e.stopPropagation(); setPickerOpen(v => !v) }} style={{ ...iconBtn, fontSize: 10 }} title="Zmień format">⋯</button>
          <button onMouseDown={e => { e.stopPropagation(); onDuplicate() }} style={{ ...iconBtn, fontSize: 11 }} title="Duplikuj">⧉</button>
          <button onMouseDown={e => { e.stopPropagation(); exportPng() }} style={{ ...iconBtn, fontSize: 11 }} title="Export PNG">⬇</button>
          <button onMouseDown={e => { e.stopPropagation(); onRemove() }} style={{ ...iconBtn, fontSize: 13 }} title="Usuń">×</button>
        </div>
      </div>

      {/* Format picker */}
      {pickerOpen && (
        <div style={{ position: 'absolute', top: 30, right: 8, zIndex: 20, background: 'var(--color-surface)', border: '1px solid var(--color-field-border)', borderRadius: 6, padding: 6, minWidth: 180, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          {AD_FORMATS.map(f => (
            <div key={f.id} onMouseDown={e => { e.stopPropagation(); onChangeFormat(f.id); setPickerOpen(false) }}
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
      {overrideOpen && (
        <OverridePanel
          isMaster={isMaster}
          overrides={resolvedOverrides}
          masterOverrides={masterOverrides}
          onChange={onOverrideChange}
          onReset={onResetOverrides}
        />
      )}

      {/* Canvas */}
      <div style={{ background: '#0d0d0d', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: thumbH }}>
        <canvas ref={canvasRef} data-banner-canvas={`${nodeId}-${uid}`} style={{ width: thumbW, height: thumbH, display: 'block', flexShrink: 0 }} />
        {!headline && !cta && !imageUrl && !theme && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, pointerEvents: 'none' }}>
            <span style={{ fontSize: 20, opacity: 0.25 }}>🖼</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4 }}>Podłącz<br />Headline + CTA</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Resize hook ─────────────────────────────────────────────────────────
function useResize(initial: number, min: number, max: number, axis: 'x' | 'y'): [number, (e: React.MouseEvent) => void] {
  const [size, setSize] = useState(initial)
  const data = useRef<{ start: number; startSize: number } | null>(null)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    data.current = { start: axis === 'x' ? e.clientX : e.clientY, startSize: size }
    function onMove(ev: MouseEvent) {
      if (!data.current) return
      const delta = (axis === 'x' ? ev.clientX : ev.clientY) - data.current.start
      setSize(Math.max(min, Math.min(max, data.current.startSize + delta)))
    }
    function onUp() { data.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [size, min, max, axis])
  return [size, onMouseDown]
}

// ── scanOutputs fallback ────────────────────────────────────────────────
function scanOutputs<T>(nodeOutputs: Record<string, NodeOutputs>, key: keyof NodeOutputs): T | null {
  for (const out of Object.values(nodeOutputs)) {
    const val = out?.[key]
    if (val !== undefined && val !== null) return val as T
  }
  return null
}

// ── BannerGridNode ──────────────────────────────────────────────────────
export function BannerGridNode({ id }: NodeProps) {
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

  const [cards, setCards] = useState<BannerCard[]>(() =>
    DEFAULT_FORMATS.map((f, i) => ({ uid: `${f}-${i}`, formatId: f, overrides: {} }))
  )
  const [masterUid, setMasterUid] = useState<string>(() => `${DEFAULT_FORMATS[0]}-0`)
  const [zoom, setZoom] = useState(0.25)

  const [nodeW,    startResizeW]  = useResize(360, 280, 1400, 'x')
  const [scrollH,  startResizeH]  = useResize(480, 200, 2000, 'y')
  const seData = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)
  const [seW, setSeW] = useState(360)
  const [seH, setSeH] = useState(480)
  const effectiveW = Math.max(nodeW, seW)
  const effectiveH = Math.max(scrollH, seH)

  function startResizeSE(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    seData.current = { sx: e.clientX, sy: e.clientY, sw: effectiveW, sh: effectiveH }
    function onMove(ev: MouseEvent) {
      if (!seData.current) return
      setSeW(Math.max(280, Math.min(1400, seData.current.sw + (ev.clientX - seData.current.sx))))
      setSeH(Math.max(200, Math.min(2000, seData.current.sh + (ev.clientY - seData.current.sy))))
    }
    function onUp() { seData.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  // Master overrides (used as fallback for slaves)
  const masterCard = cards.find(c => c.uid === masterUid)
  const masterOverrides: BannerCardOverrides = masterCard?.overrides ?? {}

  function resolveOverrides(card: BannerCard): BannerCardOverrides {
    return {
      textPosition: card.overrides.textPosition ?? masterOverrides.textPosition ?? 'center',
      ctaVisible:   card.overrides.ctaVisible   ?? masterOverrides.ctaVisible   ?? true,
      bgColor:      card.overrides.bgColor      ?? masterOverrides.bgColor      ?? undefined,
      mainColor:    card.overrides.mainColor     ?? masterOverrides.mainColor    ?? undefined,
      subColor:     card.overrides.subColor      ?? masterOverrides.subColor     ?? undefined,
    }
  }

  function updateOverrides(uid: string, patch: Partial<BannerCardOverrides>) {
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, overrides: { ...c.overrides, ...patch } } : c))
  }
  function resetOverrides(uid: string) {
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, overrides: {} } : c))
  }

  function addFormat(fmtId: string) { setCards(prev => [...prev, { uid: `${fmtId}-${Date.now()}`, formatId: fmtId, overrides: {} }]) }
  function removeCard(uid: string)  { setCards(prev => prev.filter(c => c.uid !== uid)) }
  function duplicateCard(uid: string) {
    const card = cards.find(c => c.uid === uid); if (!card) return
    const newUid = `${card.formatId}-${Date.now()}`
    setCards(prev => { const idx = prev.findIndex(c => c.uid === uid); const next = [...prev]; next.splice(idx + 1, 0, { uid: newUid, formatId: card.formatId, overrides: { ...card.overrides } }); return next })
  }
  function changeFormat(uid: string, newId: string) { setCards(prev => prev.map(c => c.uid === uid ? { ...c, formatId: newId } : c)) }

  function exportAll() {
    cards.forEach(({ uid }) => {
      const canvas = document.querySelector<HTMLCanvasElement>(`[data-banner-canvas="${id}-${uid}"]`); if (!canvas) return
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `banner-${uid}.png`; a.click()
    })
  }

  const btnBase: React.CSSProperties   = { fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer', border: '1px solid var(--color-field-border)', background: 'transparent', color: 'var(--color-text-muted)', fontWeight: 600 }
  const btnActive: React.CSSProperties = { ...btnBase, border: '1px solid var(--color-process)', background: 'rgba(124,92,245,0.12)', color: 'var(--color-process)' }
  const handleSt: React.CSSProperties  = { position: 'absolute', background: 'var(--color-field-border)', zIndex: 10, borderRadius: 2, opacity: 0.6, transition: 'opacity .15s, background .15s' }

  return (
    <BaseNode id={id} nodeType="bannerGridNode">
      <div style={{ width: effectiveW, position: 'relative' }} onMouseDown={e => e.stopPropagation()}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
          <select onChange={e => { if (e.target.value) { addFormat(e.target.value); e.target.value = '' } }} defaultValue=""
            style={{ flex: 1, fontSize: 10, padding: '4px 6px', borderRadius: 5, border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)', color: 'var(--color-text)' }}>
            <option value="">+ Dodaj format…</option>
            {AD_FORMATS.map(f => <option key={f.id} value={f.id}>{platformBadge(f.id)} · {f.label} ({f.w}×{f.h})</option>)}
          </select>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {ZOOM_OPTIONS.map(opt => (
              <button key={opt.value} onMouseDown={e => e.stopPropagation()} onClick={() => setZoom(opt.value)} style={zoom === opt.value ? btnActive : btnBase}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable cards */}
        <div onWheelCapture={e => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: effectiveH, overflowY: 'auto', overflowX: 'hidden' }}>
          {cards.length === 0 ? (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-field-border)', borderRadius: 6, color: 'var(--color-text-muted)', fontSize: 10 }}>
              Dodaj format powyżej
            </div>
          ) : cards.map((card, cardIdx) => {
            const fmt = AD_FORMATS.find(f => f.id === card.formatId)
            const thumbW = fmt ? Math.min(Math.round(fmt.w * zoom), effectiveW - 16) : effectiveW - 16
            const variant = selectedVariants?.length ? selectedVariants[cardIdx % selectedVariants.length] : null
            const cardHeadline: HeadlineData | null = variant ? { main: variant.headlineMain, sub: variant.headlineSub } : headline
            const cardCta: CTAData | null = variant ? { text: variant.ctaText, style: variant.ctaStyle } : cta
            const isMaster = card.uid === masterUid
            const resolved = resolveOverrides(card)

            return (
              <FormatCard
                key={card.uid} uid={card.uid} formatId={card.formatId} nodeId={id}
                headline={cardHeadline} cta={cardCta} imageUrl={imageUrl} bgColor={bgColor} theme={theme}
                thumbW={thumbW}
                isMaster={isMaster}
                resolvedOverrides={resolved}
                masterOverrides={masterOverrides}
                onSetMaster={() => setMasterUid(card.uid)}
                onOverrideChange={patch => updateOverrides(card.uid, patch)}
                onResetOverrides={() => resetOverrides(card.uid)}
                onRemove={() => removeCard(card.uid)}
                onDuplicate={() => duplicateCard(card.uid)}
                onChangeFormat={newId => changeFormat(card.uid, newId)}
              />
            )
          })}
        </div>

        {cards.length > 1 && (
          <button className="btn btn-primary btn-sm" onMouseDown={e => { e.stopPropagation(); exportAll() }}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: 10 }}>
            ⬇ Export wszystko ({cards.length})
          </button>
        )}

        {/* Resize handles */}
        <div onMouseDown={startResizeW}  style={{ ...handleSt, right: -5, top: '10%', bottom: '10%', width: 4, cursor: 'ew-resize' }} title="Zmień szerokość" />
        <div onMouseDown={startResizeH}  style={{ ...handleSt, bottom: -5, left: '10%', right: '10%', height: 4, cursor: 'ns-resize' }} title="Zmień wysokość" />
        <div onMouseDown={startResizeSE} style={{ ...handleSt, bottom: -6, right: -6, width: 10, height: 10, borderRadius: 3, cursor: 'se-resize', opacity: 0.8 }} title="Zmień rozmiar" />
      </div>
    </BaseNode>
  )
}
