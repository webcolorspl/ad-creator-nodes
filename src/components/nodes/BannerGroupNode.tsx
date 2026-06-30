// ═══════════════════════════════════════════════
// AD CREATOR — BannerGroupNode
// Magnific-style loose frame. memberIds tracked in data.
// No parentId — slaves are independent absolute-position nodes.
// ═══════════════════════════════════════════════
'use client'
import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeResizer, useReactFlow } from '@xyflow/react'
import { PLATFORM_GROUPS } from '@/lib/constants'
import { computeGridLayout, minGroupWidth, GRID_PAD, GRID_TOP } from '@/lib/groupLayout'

// Map platform prefix → brand color
const PLATFORM_COLOR: Record<string, string> = {}
for (const g of PLATFORM_GROUPS) {
  const prefix = g.ids[0].split('-')[0]
  // Use fallback for very dark colors (TikTok #010101, X #0f0f0f)
  const hex = g.color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g2 = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const lum = (r * 299 + g2 * 587 + b * 114) / 1000
  PLATFORM_COLOR[prefix] = lum < 40 ? '#9090AA' : g.color
}

export function BannerGroupNode({ id, data }: NodeProps) {
  const [title, setTitle] = useState((data as { title?: string }).title ?? 'Grupa')
  const [editing, setEditing] = useState(false)
  const { getNodes, setNodes } = useReactFlow()

  const platform = (data as { platform?: string }).platform ?? ''
  const color = PLATFORM_COLOR[platform] ?? 'rgba(140,140,175,0.9)'
  const borderColor = `${color}66`
  const bgColor = `${color}0A`
  const titleColor = `${color}CC`

  // When user resizes the group → recompute COLS from new width, relayout members
  function onResizeEnd(_: unknown, { width }: { width: number; height: number }) {
    const allNodes = getNodes()
    const group = allNodes.find(n => n.id === id)
    if (!group) return
    const memberIds = (data as { memberIds?: string[] }).memberIds ?? []
    const members = allNodes.filter(n => memberIds.includes(n.id))
    if (!members.length) return

    const { positions, groupH } = computeGridLayout(members, group.position, width)
    setNodes(nds => nds.map(n => {
      if (n.id === id) return { ...n, height: groupH, style: { ...((n as { style?: object }).style ?? {}), height: groupH } }
      const pos = positions.get(n.id)
      return pos ? { ...n, position: pos } : n
    }))
  }

  const memberCount = ((data as { memberIds?: string[] }).memberIds ?? []).length
  const minW = minGroupWidth(300)  // 300 = fallback member width

  return (
    <>
      <NodeResizer
        minWidth={minW}
        minHeight={GRID_TOP + GRID_PAD * 2 + 160}
        handleStyle={{ opacity: 0, pointerEvents: 'all' }}
        lineStyle={{ border: 'none' }}
        onResizeEnd={onResizeEnd}
      />

      {/* Frame */}
      <div style={{
        width: '100%', height: '100%',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 14,
        background: bgColor,
        position: 'relative',
        boxSizing: 'border-box',
      }}>

        {/* Title — top-left, Magnific style */}
        <div
          className="nodrag"
          style={{
            position: 'absolute',
            top: 10, left: 14,
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}
        >
          {/* Color dot */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: color, flexShrink: 0,
            boxShadow: `0 0 6px ${color}88`,
          }} />

          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false) }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11, fontWeight: 700, color: titleColor,
                fontFamily: 'inherit', width: 120, padding: 0,
              }}
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              style={{
                fontSize: 11, fontWeight: 700,
                color: titleColor,
                cursor: 'text', userSelect: 'none',
                letterSpacing: '0.01em',
              }}
              title="Podwójne kliknięcie aby edytować"
            >
              {title}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
