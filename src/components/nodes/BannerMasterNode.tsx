// ═══════════════════════════════════════════════
// AD CREATOR — BannerMasterNode
// Duże okno mastera + przycisk "+" do slave'ów
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { useReactFlow } from '@xyflow/react'
import { AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, RectangleHorizontal, MousePointer2, Combine, SlidersHorizontal, Download } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { NodeFloatingPanel } from '@/components/ui/NodeFloatingPanel'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS, PLATFORM_GROUPS, PORT_COLORS } from '@/lib/constants'
import { computeGridLayout } from '@/lib/groupLayout'
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
  let w = fmt.w
  let h = fmt.h
  const MAX_W = 600, MAX_H = 840
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
    border: `1px solid ${active ? '#E7A800' : 'rgba(255,255,255,0.15)'}`,
    background: active ? 'rgba(231,168,0,0.15)' : 'transparent',
    color: active ? '#E7A800' : 'rgba(255,255,255,0.45)',
  })
  const lbl: React.CSSProperties = { fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
  const ci: React.CSSProperties  = { width: 28, height: 20, padding: 1, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, cursor: 'pointer', background: 'none' }

  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}
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
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>widoczne</span>
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
function FormatThumb({ w, h, color, selected }: { w: number; h: number; color: string; selected: boolean }) {
  const BOX = 32
  const ratio = w / h
  const tw = ratio >= 1 ? BOX : Math.round(BOX * ratio)
  const th = ratio < 1  ? BOX : Math.round(BOX / ratio)
  return (
    <div style={{ width: BOX, height: BOX, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{
        width: tw, height: th, borderRadius: 3,
        background: selected ? `${color}44` : `${color}18`,
        border: `1.5px solid ${selected ? color : `${color}66`}`,
        transition: 'all .12s',
      }} />
    </div>
  )
}

function SlaveFormatPicker({ onSelect, onClose }: {
  onSelect: (fmtIds: string[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(fmtId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(fmtId)) next.delete(fmtId); else next.add(fmtId)
      return next
    })
  }

  function toggleGroup(ids: string[]) {
    setSelected(prev => {
      const allOn = ids.every(id => prev.has(id))
      const next = new Set(prev)
      if (allOn) ids.forEach(id => next.delete(id))
      else       ids.forEach(id => next.add(id))
      return next
    })
  }

  function confirm() {
    if (selected.size === 0) return
    onSelect([...selected])
  }

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1.5px solid #FF9F4A',
      borderRadius: 12,
      width: 340,
      maxHeight: 540,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 12px 48px rgba(0,0,0,0.65)',
    }} onMouseDown={e => e.stopPropagation()}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,159,74,0.2)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FF9F4A' }}>Dodaj banery</div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 1 }}>Zaznacz formaty i kliknij Dodaj</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Scrollable format list */}
      <div style={{ overflowY: 'auto', padding: '8px 10px', flex: 1 }}>
        {PLATFORM_GROUPS.map(group => {
          const groupSelected = group.ids.every(id => selected.has(id))
          const groupPartial  = !groupSelected && group.ids.some(id => selected.has(id))
          return (
            <div key={group.label} style={{ marginBottom: 14 }}>
              {/* Platform header + select all */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '3px 4px 6px',
                borderBottom: `1px solid ${group.color}33`,
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: group.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {group.label}
                </span>
                <button
                  onClick={() => toggleGroup(group.ids)}
                  style={{
                    fontSize: 8, padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${group.color}55`,
                    background: groupSelected ? `${group.color}22` : 'transparent',
                    color: group.color, fontWeight: 600,
                  }}>
                  {groupSelected ? 'Odznacz' : groupPartial ? 'Zaznacz rest.' : 'Zaznacz wszystkie'}
                </button>
              </div>

              {/* Format grid — 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {group.ids.map(fmtId => {
                  const f = AD_FORMATS.find(af => af.id === fmtId)
                  if (!f) return null
                  const isSelected = selected.has(f.id)
                  return (
                    <div key={f.id}
                      onMouseDown={e => { e.stopPropagation(); toggle(f.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? group.color : 'transparent'}`,
                        background: isSelected ? `${group.color}10` : 'transparent',
                        transition: 'all .1s',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = `${group.color}08` }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: `1.5px solid ${isSelected ? group.color : 'var(--color-field-border)'}`,
                        background: isSelected ? group.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .1s',
                      }}>
                        {isSelected && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <FormatThumb w={f.w} h={f.h} color={group.color} selected={isSelected} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--color-text)' : 'var(--color-text)', lineHeight: 1.2 }}>{f.label}</div>
                        <div style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{f.w}×{f.h}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer — confirm button */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid rgba(255,159,74,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
          {selected.size === 0 ? 'Nic nie zaznaczono' : `Zaznaczono: ${selected.size} format${selected.size > 1 ? 'y' : ''}`}
        </span>
        <button
          onClick={confirm}
          disabled={selected.size === 0}
          style={{
            padding: '6px 16px', borderRadius: 6, cursor: selected.size === 0 ? 'default' : 'pointer',
            background: selected.size === 0 ? 'rgba(255,159,74,0.2)' : '#FF9F4A',
            border: 'none', color: selected.size === 0 ? 'rgba(255,159,74,0.5)' : '#000',
            fontSize: 11, fontWeight: 700, transition: 'all .12s',
          }}>
          Dodaj {selected.size > 0 ? `(${selected.size})` : ''}
        </button>
      </div>
    </div>
  )
}

// ── MasterPillBtn ────────────────────────────────────────────────────────
function MasterPillBtn({ icon: Icon, title, active, onClick }: {
  icon: React.ElementType
  title: string
  active?: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.stopPropagation(); onClick(e) }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
        border: `1px solid ${active ? 'rgba(231,168,0,0.6)' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(231,168,0,0.18)' : 'rgba(20,20,30,0.72)',
        color: active ? '#E7A800' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        transition: 'all .13s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(40,40,55,0.85)'
          ;(e.currentTarget as HTMLElement).style.color = '#fff'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(20,20,30,0.72)'
          ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
        }
      }}
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  )
}

// ── BannerMasterNode ─────────────────────────────────────────────────────
export function BannerMasterNode({ id }: NodeProps) {
  const edges        = useAppStore(s => s.edges)
  const nodeOutputs  = useAppStore(s => s.nodeOutputs)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const selectedId   = useAppStore(s => s.selectedId)

  const headline         = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs) ?? scanOutputs<HeadlineData>(nodeOutputs, 'headline')
  const cta              = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs) ?? scanOutputs<CTAData>(nodeOutputs, 'cta')
  const image            = resolveInput<ImageData>(id, 'image', edges, nodeOutputs) ?? scanOutputs<ImageData>(nodeOutputs, 'image')
  const background       = resolveInput<BackgroundData>(id, 'background', edges, nodeOutputs) ?? scanOutputs<BackgroundData>(nodeOutputs, 'background')
  const theme            = resolveInput<ThemeData>(id, 'theme', edges, nodeOutputs) ?? scanOutputs<ThemeData>(nodeOutputs, 'theme')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sv = resolveInput<HeadlineCTAVariant[]>(id, 'selectedVariants', edges, nodeOutputs)

  const imageUrl = image?.url || background?.url || null
  const bgColor  = background?.color ?? null

  const isSelected = selectedId === id

  const [formatId,   setFormatId]   = useState('ig-square')
  const [overrides,  setOverrides]  = useState<BannerCardOverrides>({})
  const [showOverride, setShowOverride] = useState(false)
  const [showSlavePicker, setShowSlavePicker] = useState(false)
  const [showFmtPicker,   setShowFmtPicker]   = useState(false)

  useEffect(() => {
    if (!isSelected) {
      setShowFmtPicker(false)
      setShowOverride(false)
    }
  }, [isSelected])

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

  const { addNodes, addEdges, getNode, getEdges, getNodes, setNodes, fitView } = useReactFlow()

  // Platform preset colors matching PRESETS in BannerGroupNode
  const PLATFORM_PRESET: Record<string, number> = {
    fb: 3, ig: 4, li: 3, tt: 0, x: 0, yt: 4, pn: 4,
  }

  function slaveEstH(fmtId: string) {
    const f = AD_FORMATS.find(af => af.id === fmtId)
    if (!f) return 320
    let h = Math.round(f.h * 0.5)
    if (h > 560) h = Math.round(560 * (f.w / f.h < 1 ? 1 : f.h / f.w))
    return h + 60
  }

  function slaveEstW(fmtId: string) {
    const f = AD_FORMATS.find(af => af.id === fmtId)
    if (!f) return 300
    let w = Math.round(f.w * 0.5)
    let h = Math.round(f.h * 0.5)
    const MAX_W = 400, MAX_H = 560
    if (w > MAX_W) { const r = MAX_W / w; w = MAX_W; h = Math.round(h * r) }
    if (h > MAX_H) { const r = MAX_H / h; h = MAX_H; w = Math.round(w * r) }
    // nodeW = max(220, w+24); actual card = nodeW + 24px node-body padding, min 300
    return Math.max(300, Math.max(220, w + 24) + 24)
  }

  function spawnSlaves(fmtIds: string[]) {
    const masterNode = getNode(id); if (!masterNode) return
    const masterW = (masterNode as { measured?: { width?: number } }).measured?.width ?? nodeW
    const allNodes = getNodes()
    const slaveEdges = getEdges().filter(e => e.source === id && e.sourceHandle === 'masterData')

    // Count existing slaves by formatId for versioning
    const existingByFormat = new Map<string, number>()
    for (const e of slaveEdges) {
      const sn = allNodes.find(n => n.id === e.target)
      if (!sn) continue
      const fid = (sn.data as { formatId?: string }).formatId ?? ''
      existingByFormat.set(fid, (existingByFormat.get(fid) ?? 0) + 1)
    }

    // Group new fmtIds by platform, preserving PLATFORM_GROUPS order
    const platformOrder = PLATFORM_GROUPS.map(g => g.ids[0].split('-')[0])
    const byPlatform = new Map<string, string[]>()
    for (const fmtId of fmtIds) {
      const prefix = fmtId.split('-')[0]
      if (!byPlatform.has(prefix)) byPlatform.set(prefix, [])
      byPlatform.get(prefix)!.push(fmtId)
    }
    const sortedPlatforms = [...byPlatform.entries()].sort(
      ([a], [b]) => platformOrder.indexOf(a) - platformOrder.indexOf(b)
    )

    const slaveX = masterNode.position.x + masterW + 60
    const PAD = 20, TOP = 44, GAP = 16

    // Find bottom-most Y of existing groups tied to this master
    const slaveIds = new Set(slaveEdges.map(e => e.target))
    let nextAbsY = masterNode.position.y
    for (const n of allNodes) {
      if (n.type === 'bannerGroupNode') {
        const mIds = (n.data as { memberIds?: string[] }).memberIds ?? []
        if (mIds.some(mid => slaveIds.has(mid))) {
          const gh = (n as { height?: number }).height ?? (n as { measured?: { height?: number } }).measured?.height ?? 400
          nextAbsY = Math.max(nextAbsY, n.position.y + gh + 40)
        }
      } else if (slaveIds.has(n.id)) {
        const nh = (n as { measured?: { height?: number } }).measured?.height ?? 300
        nextAbsY = Math.max(nextAbsY, n.position.y + nh + 20)
      }
    }

    const newNodes: Parameters<typeof addNodes>[0] = []
    const newEdges: Parameters<typeof addEdges>[0] = []
    const groupUpdates: { id: string; memberIds: string[]; width: number; height: number }[] = []

    let isFirst = true
    for (const [prefix, ids] of sortedPlatforms) {
      if (!isFirst) nextAbsY += 40
      const platformInfo = PLATFORM_GROUPS.find(g => g.ids.some(fid => fid.startsWith(prefix + '-')))

      // Assign versions
      const slaveBatch = ids.map(fmtId => {
        const count = existingByFormat.get(fmtId) ?? 0
        existingByFormat.set(fmtId, count + 1)
        return { fmtId, version: count + 1, estH: slaveEstH(fmtId), estW: slaveEstW(fmtId) }
      })
      const maxEstW = Math.max(...slaveBatch.map(s => s.estW))

      // Check if a group for this platform already exists
      const existingGroup = allNodes.find(n =>
        n.type === 'bannerGroupNode' && (n.data as { platform?: string }).platform === prefix
      )

      if (existingGroup) {
        // Find existing members' bottom
        const existingMemberIds = (existingGroup.data as { memberIds?: string[] }).memberIds ?? []
        const existingMembers = allNodes.filter(n => existingMemberIds.includes(n.id))

        let nextSlaveY = existingGroup.position.y + TOP + PAD
        for (const m of existingMembers) {
          const mH = (m as { measured?: { height?: number } }).measured?.height ?? slaveEstH((m.data as { formatId?: string }).formatId ?? '')
          nextSlaveY = Math.max(nextSlaveY, m.position.y + mH + GAP)
        }

        const newSlaveIds: string[] = []
        for (const { fmtId, version, estH, estW: _estW } of slaveBatch) {
          const newId = `slave-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          newNodes.push({
            id: newId, type: 'bannerSlaveNode',
            position: { x: existingGroup.position.x + PAD, y: nextSlaveY },
            data: { formatId: fmtId, version },
          })
          newEdges.push({
            id: `${id}-${newId}`, source: id, sourceHandle: 'masterData',
            target: newId, targetHandle: 'masterData', type: 'bezier', animated: false,
            style: { stroke: PORT_COLORS['banner_master'] ?? '#FF9F4A', strokeWidth: 1.5, opacity: 0.7 },
          })
          newSlaveIds.push(newId)
          nextSlaveY += estH + GAP
        }

        // Expand group
        const allMemberIds = [...existingMemberIds, ...newSlaveIds]
        const newGW = Math.max((existingGroup as { width?: number }).width ?? 0, maxEstW + PAD * 2)
        const newGH = nextSlaveY - existingGroup.position.y + PAD
        groupUpdates.push({ id: existingGroup.id, memberIds: allMemberIds, width: newGW, height: newGH })

      } else {
        // New group — slaves stacked vertically, absolute positions
        const groupId = `group-${prefix}-${Date.now()}`
        const groupX = slaveX - PAD
        const groupY = nextAbsY
        const groupW = maxEstW + PAD * 2

        const newSlaveIds: string[] = []
        let slaveAbsY = groupY + TOP + PAD
        for (const { fmtId, version, estH } of slaveBatch) {
          const newId = `slave-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          newNodes.push({
            id: newId, type: 'bannerSlaveNode',
            position: { x: groupX + PAD, y: slaveAbsY },
            data: { formatId: fmtId, version },
          })
          newEdges.push({
            id: `${id}-${newId}`, source: id, sourceHandle: 'masterData',
            target: newId, targetHandle: 'masterData', type: 'bezier', animated: false,
            style: { stroke: PORT_COLORS['banner_master'] ?? '#FF9F4A', strokeWidth: 1.5, opacity: 0.7 },
          })
          newSlaveIds.push(newId)
          slaveAbsY += estH + GAP
        }

        const groupH = slaveAbsY - groupY + PAD
        newNodes.unshift({
          id: groupId, type: 'bannerGroupNode',
          position: { x: groupX, y: groupY },
          width: groupW, height: groupH,
          style: { width: groupW, height: groupH },
          zIndex: -1,
          data: {
            title: platformInfo?.label ?? prefix.toUpperCase(),
            platform: prefix,
            memberIds: newSlaveIds,
            presetIndex: PLATFORM_PRESET[prefix] ?? 0,
          },
        })
        nextAbsY += groupH + 40
      }
      isFirst = false
    }

    // Update existing groups (expand size + add memberIds)
    if (groupUpdates.length > 0) {
      setNodes(nds => nds.map(n => {
        const u = groupUpdates.find(x => x.id === n.id)
        if (!u) return n
        return {
          ...n,
          width: u.width, height: u.height,
          style: { ...((n as { style?: object }).style ?? {}), width: u.width, height: u.height },
          data: { ...(n.data as object), memberIds: u.memberIds },
        }
      }))
    }

    addNodes(newNodes)
    addEdges(newEdges)
    setShowSlavePicker(false)

    setTimeout(() => {
      const allSlaveIds = getEdges()
        .filter(e => e.source === id && e.sourceHandle === 'masterData')
        .map(e => e.target)
      if (allSlaveIds.length > 0) {
        fitView({ nodes: allSlaveIds.map(sid => ({ id: sid })), padding: 0.15, duration: 500, maxZoom: 0.9 })
      }
    }, 380)
  }

  // Programmatically select master + all connected slaves
  function selectGroup() {
    const slaveIds = new Set(
      getEdges()
        .filter(e => e.source === id && e.sourceHandle === 'masterData')
        .map(e => e.target)
    )
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === id || slaveIds.has(n.id) })))
  }

  // Create one BannerGroupNode wrapping master + all slaves (no parentId — uses memberIds + grid)
  function createGroup() {
    const masterNode = getNode(id); if (!masterNode) return
    const slaveEdges = getEdges().filter(e => e.source === id && e.sourceHandle === 'masterData')
    const allNodes   = getNodes()
    const members    = [masterNode, ...slaveEdges.map(e => allNodes.find(n => n.id === e.target)).filter(Boolean)] as typeof allNodes

    // Skip if master is already in a group
    if (allNodes.some(n => n.type === 'bannerGroupNode' && ((n.data as { memberIds?: string[] }).memberIds ?? []).includes(id))) return

    const PAD = 20
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of members) {
      const w = (n as { measured?: { width?: number } }).measured?.width  ?? 300
      const h = (n as { measured?: { height?: number } }).measured?.height ?? 300
      minX = Math.min(minX, n.position.x); minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + w); maxY = Math.max(maxY, n.position.y + h)
    }

    const groupId = `group-${Date.now()}`
    const gPos = { x: minX - PAD, y: minY - 44 }
    const gW = maxX - minX + PAD * 2

    // Apply grid layout immediately
    const { positions, groupH } = computeGridLayout(members, gPos, gW)

    setNodes(nds => [
      {
        id: groupId, type: 'bannerGroupNode',
        position: gPos,
        width: gW, height: groupH,
        style: { width: gW, height: groupH },
        zIndex: -1,
        data: { title: 'Kampania', memberIds: members.map(m => m.id) },
      },
      ...nds.map(n => {
        const pos = positions.get(n.id)
        return pos ? { ...n, position: pos } : n
      }),
    ])
  }

  function exportPng() {
    const c = canvasRef.current; if (!c) return
    const a = document.createElement('a'); a.href = c.toDataURL('image/png')
    a.download = `master-${fmt.id}.png`; a.click()
  }

  return (
    <BaseNode id={id} nodeType="bannerMasterNode" titleOverride="Master">
      <NodeFloatingPanel nodeId={id} open={showSlavePicker} onClose={() => setShowSlavePicker(false)} placement="right" nodeWidth={nodeW}>
        <SlaveFormatPicker onSelect={spawnSlaves} onClose={() => setShowSlavePicker(false)} />
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

        {/* Canvas with pills bar overlay */}
        <div style={{ background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: thumbH, position: 'relative', borderRadius: 4, overflow: 'visible' }}>

          {/* Pills bar — floats above canvas, visible when selected */}
          <div
            className="nodrag"
            style={{
              position: 'absolute', top: -44, left: 0, right: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '5px 8px',
              opacity: isSelected ? 1 : 0,
              transform: isSelected ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity .15s, transform .15s',
              pointerEvents: isSelected ? 'all' : 'none',
              zIndex: 30,
            }}
          >
            <MasterPillBtn icon={RectangleHorizontal} title="Zmień format podglądu" active={showFmtPicker}
              onClick={() => { setShowFmtPicker(v => !v); setShowOverride(false) }} />
            <MasterPillBtn icon={SlidersHorizontal} title="Ustawienia master" active={showOverride}
              onClick={() => { setShowOverride(v => !v); setShowFmtPicker(false) }} />
            <MasterPillBtn icon={MousePointer2} title="Zaznacz wszystkie (przeciągnij razem)"
              onClick={() => selectGroup()} />
            <MasterPillBtn icon={Combine} title="Utwórz grupę — otocz master + slave jedną ramką"
              onClick={() => createGroup()} />
            <MasterPillBtn icon={Download} title="Eksportuj PNG"
              onClick={() => exportPng()} />
          </div>

          {/* Format picker — dark glass overlay */}
          {showFmtPicker && (
            <div onMouseDown={e => e.stopPropagation()} style={{
              position: 'absolute', top: 8, left: 0, zIndex: 40,
              background: 'rgba(14,14,22,0.92)', border: '1px solid rgba(231,168,0,0.25)',
              borderRadius: 10, padding: 6, minWidth: 200, maxHeight: 260, overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(14px)',
            }}>
              {AD_FORMATS.map(f => (
                <div key={f.id} onMouseDown={e => { e.stopPropagation(); setFormatId(f.id); setShowFmtPicker(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 6, cursor: 'pointer', background: f.id === formatId ? 'rgba(231,168,0,0.15)' : 'transparent' }}
                  onMouseEnter={e => { if (f.id !== formatId) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if (f.id !== formatId) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <div style={{
                    width: f.w >= f.h ? 18 : Math.round(18 * f.w / f.h),
                    height: f.h >= f.w ? 18 : Math.round(18 * f.h / f.w),
                    background: f.id === formatId ? 'rgba(231,168,0,0.4)' : 'rgba(255,255,255,0.2)',
                    borderRadius: 2, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 10, color: f.id === formatId ? '#E7A800' : 'rgba(255,255,255,0.75)' }}>{f.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{f.w}×{f.h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Override panel — dark glass overlay */}
          {showOverride && (
            <div onMouseDown={e => e.stopPropagation()} style={{
              position: 'absolute', top: 8, right: 0, zIndex: 40,
              background: 'rgba(14,14,22,0.92)', border: '1px solid rgba(231,168,0,0.2)',
              borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(14px)',
              minWidth: 200,
            }}>
              <OverridePanel overrides={overrides} onChange={p => setOverrides(prev => ({ ...prev, ...p }))} />
            </div>
          )}

          <canvas ref={canvasRef} data-banner-canvas={`${id}-master`}
            style={{ width: thumbW, height: thumbH, display: 'block' }} />

          {!headline && !cta && !imageUrl && !theme && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
              <span style={{ fontSize: 28, opacity: 0.15 }}>★</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>Podłącz Headline + CTA<br />do mastera</span>
            </div>
          )}

          {/* Format info badge — bottom right of canvas */}
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
            pointerEvents: 'none', lineHeight: 1,
          }}>
            {fmt.w}×{fmt.h}
          </div>
        </div>

      </div>
    </BaseNode>
  )
}
