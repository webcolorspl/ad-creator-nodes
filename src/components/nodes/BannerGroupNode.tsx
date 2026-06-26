// ═══════════════════════════════════════════════
// AD CREATOR — BannerGroupNode
// Magnific-style visual frame. Slave nodes get parentId
// set via onNodeDragStop in FlowCanvas when dropped inside.
// ═══════════════════════════════════════════════
'use client'
import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeResizer } from '@xyflow/react'

export function BannerGroupNode({ data }: NodeProps) {
  const [title, setTitle] = useState((data as { title?: string }).title ?? 'Grupa')
  const [editing, setEditing] = useState(false)

  return (
    <>
      <NodeResizer
        minWidth={260}
        minHeight={160}
        handleStyle={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.15)',
        }}
        lineStyle={{ border: '1px solid rgba(255,255,255,0.2)' }}
      />

      {/* Frame — no nodrag: entire area is draggable */}
      <div style={{
        width: '100%', height: '100%',
        border: '1.5px solid rgba(255,255,255,0.13)',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.03)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
        boxSizing: 'border-box',
      }}>

        {/* Floating label — top-left, nodrag only on this element */}
        <div
          className="nodrag"
          style={{
            position: 'absolute',
            top: -11, left: 16,
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--color-surface)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: 20,
            padding: '2px 10px',
          }}
        >
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false) }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 10, fontWeight: 600, color: 'var(--color-text)',
                fontFamily: 'inherit', width: 100, padding: 0,
              }}
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              style={{
                fontSize: 10, fontWeight: 600,
                color: 'var(--color-text-muted)',
                cursor: 'text', userSelect: 'none',
                letterSpacing: '0.02em',
              }}
              title="Podwójne kliknięcie aby edytować"
            >
              {title}
            </span>
          )}
        </div>

        {/* Drop hint — visible only when empty */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Przeciągnij banery tutaj
          </span>
        </div>
      </div>
    </>
  )
}
