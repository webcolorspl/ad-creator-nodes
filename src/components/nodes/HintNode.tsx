'use client'
// ═══════════════════════════════════════════════
// HINT NODE — callout bubble for wizard mode
// Non-interactive annotation shown on canvas.
// ═══════════════════════════════════════════════
import type { NodeProps } from '@xyflow/react'

interface HintData {
  text: string
  arrow?: 'right' | 'down' | 'up' | 'left'
}

const ARROW = { right: '→', down: '↓', up: '↑', left: '←' }

export function HintNode({ data }: NodeProps) {
  const { text, arrow } = data as unknown as HintData

  return (
    <div
      style={{
        background: 'rgba(253, 224, 71, 0.07)',
        border: '1px solid rgba(253, 224, 71, 0.28)',
        borderRadius: 8,
        padding: '7px 11px',
        maxWidth: 200,
        fontSize: 10.5,
        fontWeight: 500,
        color: 'rgba(253, 224, 71, 0.82)',
        lineHeight: 1.55,
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'var(--font-ui)',
        whiteSpace: 'pre-line',
      }}
    >
      {arrow && (
        <span style={{ marginRight: 5, opacity: 0.7 }}>{ARROW[arrow]}</span>
      )}
      {text}
    </div>
  )
}
