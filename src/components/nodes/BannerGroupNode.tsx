// ═══════════════════════════════════════════════
// AD CREATOR — BannerGroupNode
// Wizualny frame / kontener do grupowania slave banerów.
// Brak portów — tylko organizacja na canvasie.
// ═══════════════════════════════════════════════
'use client'
import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeResizer } from '@xyflow/react'

const PRESETS = [
  { label: 'Fiolet',    solid: '#7C5CF5', bg: 'rgba(124,92,245,0.06)',  glow: 'rgba(124,92,245,0.12)' },
  { label: 'Złoty',     solid: '#E7A800', bg: 'rgba(231,168,0,0.06)',   glow: 'rgba(231,168,0,0.12)'  },
  { label: 'Zielony',   solid: '#0EA87A', bg: 'rgba(14,168,122,0.06)',  glow: 'rgba(14,168,122,0.12)' },
  { label: 'Niebieski', solid: '#3A67F0', bg: 'rgba(58,103,240,0.06)',  glow: 'rgba(58,103,240,0.12)' },
  { label: 'Różowy',    solid: '#EC4899', bg: 'rgba(236,72,153,0.06)',  glow: 'rgba(236,72,153,0.12)' },
  { label: 'Pomarańcz', solid: '#FF6B35', bg: 'rgba(255,107,53,0.06)', glow: 'rgba(255,107,53,0.12)' },
]

export function BannerGroupNode({ data }: NodeProps) {
  const [title,        setTitle]        = useState((data as { title?: string }).title ?? 'Grupa banerów')
  const [editingTitle, setEditingTitle] = useState(false)
  const [preset,       setPreset]       = useState((data as { presetIndex?: number }).presetIndex ?? 0)

  const { solid, bg, glow } = PRESETS[preset]

  return (
    <>
      <NodeResizer
        minWidth={300}
        minHeight={200}
        handleStyle={{
          width: 12, height: 12, borderRadius: '50%',
          background: solid, border: '2px solid #fff',
          boxShadow: `0 0 0 2px ${solid}`,
        }}
        lineStyle={{ border: `1.5px solid ${solid}`, opacity: 0.4 }}
      />

      {/* Main frame — NO nodrag so the node is draggable by clicking anywhere in the body */}
      <div style={{
        width: '100%', height: '100%',
        border: `1.5px solid ${solid}`,
        borderRadius: 14,
        background: bg,
        boxShadow: `0 0 0 4px ${glow}, inset 0 0 40px ${glow}`,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}>

        {/* Label chip — top-left, floating above the border */}
        <div
          className="nodrag"
          style={{
            position: 'absolute',
            top: -14, left: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--color-surface)',
            border: `1.5px solid ${solid}`,
            borderRadius: 20,
            padding: '3px 10px 3px 6px',
            boxShadow: `0 2px 8px ${glow}`,
          }}
        >
          {/* Color swatches */}
          <div style={{ display: 'flex', gap: 3 }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPreset(i)}
                title={p.label}
                style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: p.solid, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                  outline: preset === i ? `2px solid ${p.solid}` : 'none',
                  outlineOffset: 1.5,
                  transition: 'transform .1s',
                  transform: preset === i ? 'scale(1.25)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 10, background: `${solid}40` }} />

          {/* Editable title */}
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false) }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11, fontWeight: 700, color: solid,
                padding: 0, fontFamily: 'inherit', width: 120,
              }}
            />
          ) : (
            <span
              onDoubleClick={() => setEditingTitle(true)}
              style={{
                fontSize: 11, fontWeight: 700, color: solid,
                cursor: 'text', userSelect: 'none', whiteSpace: 'nowrap',
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
