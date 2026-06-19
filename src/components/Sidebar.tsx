'use client'
import type { Node } from '@xyflow/react'
import { NODE_REGISTRY, PALETTE_SECTIONS, CAT_COLORS } from '@/lib/constants'
import { NODE_ICONS } from '@/lib/icons'
import { useAppStore } from '@/store/appStore'

interface SidebarProps {
  nodes: Node[]
}

export function Sidebar({ nodes }: SidebarProps) {
  const { requestZoom } = useAppStore()

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const onClick = (nodeType: string) => {
    const match = nodes.find(n => n.type === nodeType)
    if (match) requestZoom(match.id)
  }

  return (
    <aside className="sidebar">
      {PALETTE_SECTIONS.map(({ label, items }) => (
        <div key={label}>
          <div className="sidebar-section-label">{label}</div>
          {items.map(nodeType => {
            const def      = NODE_REGISTRY[nodeType]
            const Icon     = NODE_ICONS[nodeType]
            const hasNode  = nodes.some(n => n.type === nodeType)
            return (
              <div
                key={nodeType}
                className="palette-item"
                draggable
                onDragStart={e => onDragStart(e, nodeType)}
                onClick={() => onClick(nodeType)}
                title={hasNode ? `Kliknij → skocz do ${def.label}` : def.description}
                style={{ cursor: hasNode ? 'pointer' : 'grab' }}
              >
                <span
                  className="palette-icon"
                  style={{ color: CAT_COLORS[def.cat] }}
                >
                  {Icon && <Icon size={15} strokeWidth={1.75} />}
                </span>
                <span style={{ flex: 1 }}>{def.label}</span>
                {hasNode && (
                  <span style={{ fontSize: 9, color: 'var(--blue-400)', opacity: 0.7 }}>→</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
