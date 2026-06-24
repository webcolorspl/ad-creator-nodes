// ═══════════════════════════════════════════════
// AD CREATOR — BannerGridNode
// Podgląd banerów we wszystkich formatach
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import type { HeadlineData, CTAData, ImageData, ThemeData, CopyGroupData, StyleData } from '@/types'

const DEFAULT_FORMATS = ['ig-square', 'fb-feed', 'tt-video']

// Platform prefixes for display
const PLATFORM_ICON: Record<string, string> = {
  fb: 'FB', ig: 'IG', li: 'LI', tt: 'TT', x: 'X', yt: 'YT', pn: 'PIN',
  gd: 'GDN', pg: 'PG',
}
function platformBadge(id: string) {
  const prefix = id.split('-')[0]
  return PLATFORM_ICON[prefix] ?? prefix.toUpperCase()
}

// Visual proportion swatch (aspect ratio box)
function AspectSwatch({ w, h, size = 28 }: { w: number; h: number; size?: number }) {
  const ratio = w / h
  const sw = ratio >= 1 ? size : Math.round(size * ratio)
  const sh = ratio < 1 ? size : Math.round(size / ratio)
  return (
    <div style={{
      width: sw, height: sh,
      background: 'var(--color-border)',
      borderRadius: 2,
      flexShrink: 0,
    }} />
  )
}

// ── FormatCard ─────────────────────────────────────────────────────────
interface FormatCardProps {
  uid: string          // unique key (fmtId + index)
  formatId: string
  nodeId: string
  headline: HeadlineData | null
  cta: CTAData | null
  image: ImageData | null
  theme: ThemeData | null
  onRemove: () => void
  onDuplicate: () => void
  onChangeFormat: (newId: string) => void
  allActive: string[]
}

function FormatCard({ uid, formatId, nodeId, headline, cta, image, theme, onRemove, onDuplicate, onChangeFormat, allActive }: FormatCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fmt = AD_FORMATS.find(f => f.id === formatId)

  // Serializujemy wejścia żeby efekt odpyalał się tylko gdy dane się zmieniają
  const inputKey = JSON.stringify({ formatId, headline, cta, imageUrl: image?.url, theme })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !fmt) return

    const style: StyleData = { format: fmt.id, width: fmt.w, height: fmt.h }
    const copy: CopyGroupData | null = (headline || cta) ? {
      prompt: { text: '', tone: 'neutral', lang: 'pl' },
      headline: headline ?? { main: '' },
      cta: cta ?? { text: '', style: 'primary' },
    } : null

    composeBanner(canvas, {
      copy,
      background: null,
      bgColor: theme?.bgColor ?? '#1a1a2e',
      image: image?.url ?? null,
      style,
      theme: theme ?? null,
    }).catch(() => {
      // fallback: przynajmniej narysuj tło
      canvas.width  = Math.min(fmt.w, 1080)
      canvas.height = Math.min(fmt.h, 1080)
      const ctx = canvas.getContext('2d')
      if (ctx) { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
    })
  }, [inputKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!fmt) return null

  const THUMB_W = 200
  const THUMB_H = Math.round(fmt.h * (THUMB_W / fmt.w))

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
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 8px', borderBottom:'1px solid var(--color-field-border)' }}>
        <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:3, background:'var(--color-process)', color:'#fff' }}>
          {platformBadge(fmt.id)}
        </span>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--color-text)', flex:1 }}>{fmt.label}</span>
        <span style={{ fontSize:9, color:'var(--color-text-muted)', fontFamily:'monospace' }}>{fmt.w}×{fmt.h}</span>
        {/* Format picker toggle */}
        <button
          onMouseDown={e => { e.stopPropagation(); setPickerOpen(v => !v) }}
          style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:10, padding:'2px 4px' }}
          title="Zmień format"
        >⋯</button>
        {/* Duplicate */}
        <button
          onMouseDown={e => { e.stopPropagation(); onDuplicate() }}
          style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:11, padding:'2px 4px' }}
          title="Duplikuj"
        >⧉</button>
        {/* Remove */}
        <button
          onMouseDown={e => { e.stopPropagation(); onRemove() }}
          style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:12, padding:'2px 4px', lineHeight:1 }}
          title="Usuń"
        >×</button>
      </div>

      {/* Format picker dropdown */}
      {pickerOpen && (
        <div style={{
          position:'absolute', top:32, right:8, zIndex:10,
          background:'var(--color-surface-2, #1e1e2a)',
          border:'1px solid var(--color-field-border)',
          borderRadius:6, padding:6, minWidth:180,
          maxHeight:220, overflowY:'auto',
          boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {AD_FORMATS.map(f => (
            <div
              key={f.id}
              onMouseDown={e => { e.stopPropagation(); onChangeFormat(f.id); setPickerOpen(false) }}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 6px', borderRadius:4, cursor:'pointer',
                background: f.id === formatId ? 'rgba(124,92,245,0.15)' : 'transparent',
                transition:'background .1s',
              }}
            >
              <AspectSwatch w={f.w} h={f.h} size={24} />
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--color-text)' }}>{f.label}</div>
                <div style={{ fontSize:8, color:'var(--color-text-muted)', fontFamily:'monospace' }}>{f.w}×{f.h}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, padding:'1px 4px', borderRadius:3, background:'var(--color-border)', color:'var(--color-text-muted)' }}>
                {platformBadge(f.id)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div style={{ background:'#111', display:'flex', justifyContent:'center', alignItems:'center' }}>
        <canvas
          ref={canvasRef}
          data-banner-canvas={`${nodeId}-${uid}`}
          style={{ width: THUMB_W, height: THUMB_H, display:'block' }}
        />
      </div>

      {/* Export */}
      <div style={{ padding:'6px 8px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onMouseDown={e => { e.stopPropagation(); exportPng() }}
          style={{ width:'100%', justifyContent:'center', fontSize:10 }}
        >
          ⬇ Export PNG
        </button>
      </div>
    </div>
  )
}

// ── BannerGridNode ─────────────────────────────────────────────────────
export function BannerGridNode({ id }: NodeProps) {
  const edges       = useAppStore(s => s.edges)
  const nodeOutputs = useAppStore(s => s.nodeOutputs)

  const headline = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs)
  const cta      = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs)
  const image    = resolveInput<ImageData>(id, 'image', edges, nodeOutputs)
  const theme    = resolveInput<ThemeData>(id, 'theme', edges, nodeOutputs)

  // Each entry: { uid: string, formatId: string }
  const [cards, setCards] = useState(() =>
    DEFAULT_FORMATS.map((f, i) => ({ uid: `${f}-${i}`, formatId: f }))
  )

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

  return (
    <BaseNode id={id} nodeType="bannerGridNode">
      <div style={{ width: 240 }} onMouseDown={e => e.stopPropagation()}>

        {/* Add format */}
        <select
          onChange={e => { if (e.target.value) { addFormat(e.target.value); e.target.value = '' } }}
          defaultValue=""
          style={{
            width:'100%', fontSize:10, padding:'5px 7px', borderRadius:5,
            border:'1px solid var(--color-field-border)',
            background:'var(--color-field-bg)', color:'var(--color-text)',
            marginBottom: 8,
          }}
        >
          <option value="">+ Dodaj format…</option>
          {AD_FORMATS.map(f => (
            <option key={f.id} value={f.id}>
              {platformBadge(f.id)} · {f.label} ({f.w}×{f.h})
            </option>
          ))}
        </select>

        {/* Cards — 1 column */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {cards.length === 0 ? (
            <div style={{ height:60, display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed var(--color-field-border)', borderRadius:6, color:'var(--color-text-muted)', fontSize:10 }}>
              Dodaj format powyżej
            </div>
          ) : cards.map(card => (
            <FormatCard
              key={card.uid}
              uid={card.uid}
              formatId={card.formatId}
              nodeId={id}
              headline={headline}
              cta={cta}
              image={image}
              theme={theme}
              onRemove={() => removeCard(card.uid)}
              onDuplicate={() => duplicateCard(card.uid)}
              onChangeFormat={(newId) => changeFormat(card.uid, newId)}
              allActive={cards.map(c => c.formatId)}
            />
          ))}
        </div>

        {/* Export all */}
        {cards.length > 1 && (
          <button
            className="btn btn-primary btn-sm"
            onMouseDown={e => { e.stopPropagation(); exportAll() }}
            style={{ width:'100%', justifyContent:'center', marginTop:10, fontSize:10 }}
          >
            ⬇ Export wszystko ({cards.length})
          </button>
        )}
      </div>
    </BaseNode>
  )
}
