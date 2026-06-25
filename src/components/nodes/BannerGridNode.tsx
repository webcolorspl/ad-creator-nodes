// ═══════════════════════════════════════════════
// AD CREATOR — BannerGridNode
// Podgląd banerów z resize, zoomem i scrollem
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type { HeadlineData, CTAData, ImageData, BackgroundData, ThemeData, CopyGroupData, StyleData, HeadlineCTAVariant } from '@/types'

const DEFAULT_FORMATS = ['ig-square', 'fb-feed', 'tt-video']
const ZOOM_OPTIONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5  },
  { label: '100%', value: 1   },
]

const PLATFORM_ICON: Record<string, string> = {
  fb: 'FB', ig: 'IG', li: 'LI', tt: 'TT', x: 'X', yt: 'YT', pn: 'PIN',
  gd: 'GDN', pg: 'PG',
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

// ── FormatCard ──────────────────────────────────────────────────────────
interface FormatCardProps {
  uid: string
  formatId: string
  nodeId: string
  headline: HeadlineData | null
  cta: CTAData | null
  imageUrl: string | null
  theme: ThemeData | null
  thumbW: number           // CSS display width (zoom-controlled)
  isMaster?: boolean
  onSetMaster?: () => void
  onRemove: () => void
  onDuplicate: () => void
  onChangeFormat: (newId: string) => void
}

function FormatCard({
  uid, formatId, nodeId, headline, cta, imageUrl, theme, thumbW,
  isMaster, onSetMaster, onRemove, onDuplicate, onChangeFormat,
}: FormatCardProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fmt = AD_FORMATS.find(f => f.id === formatId)

  const inputKey = JSON.stringify({ formatId, headline, cta, imageUrl, theme })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !fmt) return

    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt: { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta: cta ?? { text: '', style: 'primary' },
    } : null

    document.fonts.ready.then(() => {
      composeBanner(canvas, {
        copy,
        background: null,
        bgColor: theme?.bgColor ?? '#1a1a2e',
        image: imageUrl,
        style,
        theme: theme ?? null,
      }).catch(() => {
        canvas.width  = Math.min(fmt.w, 1080)
        canvas.height = Math.min(fmt.h, 1080)
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.fillStyle = theme?.bgColor ?? '#1a1a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      })
    })
  }, [inputKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!fmt) return null

  const thumbH = Math.round(fmt.h * (thumbW / fmt.w))

  function exportPng() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `banner-${fmt!.id}.png`
    a.click()
  }

  return (
    <div style={{
      background: 'var(--color-field-bg)',
      border: '1px solid var(--color-field-border)',
      borderRadius: 8, overflow: 'hidden', position: 'relative',
    }}>
      {/* Header — compact inline */}
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 8px', borderBottom:'1px solid var(--color-field-border)' }}>
        <span style={{ fontSize:8, fontWeight:700, padding:'1px 4px', borderRadius:3, background:'var(--color-process)', color:'#fff', flexShrink:0 }}>
          {platformBadge(fmt.id)}
        </span>
        <span style={{ fontSize:10, fontWeight:600, color:'var(--color-text)' }}>{fmt.label}</span>
        <span style={{ fontSize:9, color:'var(--color-text-muted)' }}>· {fmt.w}×{fmt.h}</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:2, alignItems:'center' }}>
          {onSetMaster && (
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={onSetMaster}
              title={isMaster ? 'To jest Master' : 'Ustaw jako Master'}
              style={{
                background: isMaster ? 'rgba(231,168,0,0.15)' : 'none',
                border: `1px solid ${isMaster ? 'rgba(231,168,0,0.5)' : 'transparent'}`,
                color: isMaster ? '#E7A800' : 'var(--color-text-muted)',
                fontSize: 9, fontWeight: isMaster ? 700 : 400,
                borderRadius: 4, padding: '1px 5px', cursor: 'pointer',
              }}
            >{isMaster ? '★ Master' : '☆'}</button>
          )}
          <button onMouseDown={e => { e.stopPropagation(); setPickerOpen(v => !v) }}
            style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:10, padding:'2px 4px' }}
            title="Zmień format">⋯</button>
          <button onMouseDown={e => { e.stopPropagation(); onDuplicate() }}
            style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:11, padding:'2px 4px' }}
            title="Duplikuj">⧉</button>
          <button onMouseDown={e => { e.stopPropagation(); exportPng() }}
            style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:11, padding:'2px 4px' }}
            title="Eksportuj PNG">⬇</button>
          <button onMouseDown={e => { e.stopPropagation(); onRemove() }}
            style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:12, padding:'2px 4px', lineHeight:1 }}
            title="Usuń">×</button>
        </div>
      </div>

      {/* Format picker */}
      {pickerOpen && (
        <div style={{
          position:'absolute', top:30, right:8, zIndex:20,
          background:'var(--color-surface-2, var(--color-surface))',
          border:'1px solid var(--color-field-border)',
          borderRadius:6, padding:6, minWidth:180,
          maxHeight:220, overflowY:'auto',
          boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {AD_FORMATS.map(f => (
            <div key={f.id}
              onMouseDown={e => { e.stopPropagation(); onChangeFormat(f.id); setPickerOpen(false) }}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 6px',
                borderRadius:4, cursor:'pointer',
                background: f.id === formatId ? 'rgba(124,92,245,0.15)' : 'transparent',
              }}
            >
              <AspectSwatch w={f.w} h={f.h} />
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--color-text)' }}>{f.label}</div>
                <div style={{ fontSize:8, color:'var(--color-text-muted)', fontFamily:'monospace' }}>{f.w}×{f.h}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:8, fontWeight:700, padding:'1px 4px', borderRadius:3, background:'var(--color-border)', color:'var(--color-text-muted)' }}>
                {platformBadge(f.id)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Canvas preview */}
      <div style={{
        background:'#0d0d0d',
        display:'flex', justifyContent:'center', alignItems:'center',
        position:'relative', minHeight: thumbH,
        overflow: 'hidden',
      }}>
        <canvas
          ref={canvasRef}
          data-banner-canvas={`${nodeId}-${uid}`}
          style={{ width: thumbW, height: thumbH, display:'block', flexShrink:0 }}
        />
        {!headline && !cta && !imageUrl && !theme && (
          <div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:5, pointerEvents:'none',
          }}>
            <span style={{ fontSize:20, opacity:0.3 }}>🖼</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:1.4 }}>
              Podłącz<br/>Headline + CTA
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── BannerGridNode ──────────────────────────────────────────────────────
export function BannerGridNode({ id }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)

  const headline         = resolveInput<HeadlineData>(id,          'headline',         edges, nodeOutputs)
  const cta              = resolveInput<CTAData>(id,               'cta',              edges, nodeOutputs)
  const image            = resolveInput<ImageData>(id,             'image',            edges, nodeOutputs)
  const background       = resolveInput<BackgroundData>(id,        'background',       edges, nodeOutputs)
  const theme            = resolveInput<ThemeData>(id,             'theme',            edges, nodeOutputs)
  const selectedVariants = resolveInput<HeadlineCTAVariant[]>(id,  'selectedVariants', edges, nodeOutputs)

  const imageUrl = image?.url ?? background?.url ?? null

  const [cards,     setCards]     = useState(() => DEFAULT_FORMATS.map((f, i) => ({ uid: `${f}-${i}`, formatId: f })))
  const [masterUid, setMasterUid] = useState<string | null>(null)
  const [zoom,      setZoom]      = useState(0.25)
  const [nodeWidth, setNodeWidth] = useState(340)

  // ── Resize handle ──────────────────────────────────────────────────
  const resizeData = useRef<{ startX: number; startW: number } | null>(null)

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    resizeData.current = { startX: e.clientX, startW: nodeWidth }

    function onMove(ev: MouseEvent) {
      if (!resizeData.current) return
      const dx = ev.clientX - resizeData.current.startX
      setNodeWidth(Math.max(260, Math.min(1400, resizeData.current.startW + dx)))
    }
    function onUp() {
      resizeData.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Card management ────────────────────────────────────────────────
  function addFormat(fmtId: string) {
    setCards(prev => [...prev, { uid: `${fmtId}-${Date.now()}`, formatId: fmtId }])
  }
  function removeCard(uid: string) {
    setCards(prev => prev.filter(c => c.uid !== uid))
  }
  function duplicateCard(uid: string) {
    const card = cards.find(c => c.uid === uid)
    if (!card) return
    const newUid = `${card.formatId}-${Date.now()}`
    setCards(prev => {
      const idx = prev.findIndex(c => c.uid === uid)
      const next = [...prev]
      next.splice(idx + 1, 0, { uid: newUid, formatId: card.formatId })
      return next
    })
  }
  function changeFormat(uid: string, newFmtId: string) {
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, formatId: newFmtId } : c))
  }
  function exportAll() {
    cards.forEach(({ uid }) => {
      const canvas = document.querySelector<HTMLCanvasElement>(`[data-banner-canvas="${id}-${uid}"]`)
      if (!canvas) return
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `banner-${uid}.png`
      a.click()
    })
  }

  const btnBase: React.CSSProperties = {
    fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
    border: '1px solid var(--color-field-border)',
    background: 'transparent', color: 'var(--color-text-muted)',
    fontWeight: 600,
  }
  const btnActive: React.CSSProperties = {
    ...btnBase,
    border: '1px solid var(--color-process)',
    background: 'rgba(124,92,245,0.12)',
    color: 'var(--color-process)',
  }

  return (
    <BaseNode id={id} nodeType="bannerGridNode">
      <div
        style={{ width: nodeWidth, position: 'relative' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* ── Toolbar ── */}
        <div style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center' }}>
          <select
            onChange={e => { if (e.target.value) { addFormat(e.target.value); e.target.value = '' } }}
            defaultValue=""
            style={{
              flex: 1, fontSize:10, padding:'4px 6px', borderRadius:5,
              border:'1px solid var(--color-field-border)',
              background:'var(--color-field-bg)', color:'var(--color-text)',
            }}
          >
            <option value="">+ Dodaj format…</option>
            {AD_FORMATS.map(f => (
              <option key={f.id} value={f.id}>{platformBadge(f.id)} · {f.label} ({f.w}×{f.h})</option>
            ))}
          </select>

          {/* Zoom controls */}
          <div style={{ display:'flex', gap:2, flexShrink:0 }}>
            {ZOOM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setZoom(opt.value)}
                style={zoom === opt.value ? btnActive : btnBase}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable cards ── */}
        <div
          onWheelCapture={e => { e.stopPropagation() }}
          style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:600, overflowY:'auto', overflowX:'hidden' }}
        >
          {cards.length === 0 ? (
            <div style={{
              height:60, display:'flex', alignItems:'center', justifyContent:'center',
              border:'1px dashed var(--color-field-border)', borderRadius:6,
              color:'var(--color-text-muted)', fontSize:10,
            }}>
              Dodaj format powyżej
            </div>
          ) : cards.map((card, cardIdx) => {
            const fmt = AD_FORMATS.find(f => f.id === card.formatId)
            // thumbW = zoom % of real size, but capped to nodeWidth - 16 so it always fits
            const thumbW = fmt
              ? Math.min(Math.round(fmt.w * zoom), nodeWidth - 16)
              : nodeWidth - 16

            const variant = selectedVariants?.length
              ? selectedVariants[cardIdx % selectedVariants.length]
              : null
            const cardHeadline: HeadlineData | null = variant
              ? { main: variant.headlineMain, sub: variant.headlineSub }
              : headline
            const cardCta: CTAData | null = variant
              ? { text: variant.ctaText, style: variant.ctaStyle }
              : cta

            return (
              <FormatCard
                key={card.uid}
                uid={card.uid}
                formatId={card.formatId}
                nodeId={id}
                headline={cardHeadline}
                cta={cardCta}
                imageUrl={imageUrl}
                theme={theme}
                thumbW={thumbW}
                isMaster={masterUid === card.uid}
                onSetMaster={() => setMasterUid(prev => prev === card.uid ? null : card.uid)}
                onRemove={() => removeCard(card.uid)}
                onDuplicate={() => duplicateCard(card.uid)}
                onChangeFormat={newId => changeFormat(card.uid, newId)}
              />
            )
          })}
        </div>

        {/* ── Export all ── */}
        {cards.length > 1 && (
          <button
            className="btn btn-primary btn-sm"
            onMouseDown={e => { e.stopPropagation(); exportAll() }}
            style={{ width:'100%', justifyContent:'center', marginTop:8, fontSize:10 }}
          >
            ⬇ Export wszystko ({cards.length})
          </button>
        )}

        {/* ── Resize handle ── */}
        <div
          onMouseDown={startResize}
          title="Przeciągnij aby zmienić szerokość"
          style={{
            position: 'absolute',
            bottom: -4, right: -12,
            width: 18, height: 18,
            cursor: 'ew-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 11, opacity: 0.5,
            userSelect: 'none',
          }}
        >
          ⇔
        </div>
      </div>
    </BaseNode>
  )
}
