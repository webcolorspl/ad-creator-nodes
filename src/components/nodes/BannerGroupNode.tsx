// ═══════════════════════════════════════════════
// AD CREATOR — BannerGroupNode
// Wizualny kontener / frame do grupowania slave banerów.
// Brak portów — tylko organizacja na canvasie.
// ═══════════════════════════════════════════════
'use client'
import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeResizer } from '@xyflow/react'

const PRESETS = [
  { label: 'Fiolet', border: 'rgba(124,92,245,0.5)',  bg: 'rgba(124,92,245,0.04)' },
  { label: 'Złoty',  border: 'rgba(231,168,0,0.5)',   bg: 'rgba(231,168,0,0.04)'  },
  { label: 'Zielony',border: 'rgba(14,168,122,0.5)',  bg: 'rgba(14,168,122,0.04)' },
  { label: 'Niebieski', border: 'rgba(58,103,240,0.5)', bg: 'rgba(58,103,240,0.04)' },
  { label: 'Różowy', border: 'rgba(236,72,153,0.5)',  bg: 'rgba(236,72,153,0.04)' },
]

export function BannerGroupNode({ data }: NodeProps) {
  const [title,       setTitle]       = useState((data as { title?: string }).title ?? 'Grupa banerów')
  const [editingTitle, setEditingTitle] = useState(false)
  const [preset,      setPreset]      = useState(0)

  const { border, bg } = PRESETS[preset]

  return (
    <>
      <NodeResizer
        minWidth={300}
        minHeight={200}
        handleStyle={{ width: 10, height: 10, borderRadius: 3 }}
        lineStyle={{ border: `1px dashed ${border}` }}
      />
      <div
        className="nodrag"
        style={{
          width: '100%', height: '100%',
          border: `1.5px dashed ${border}`,
          borderRadius: 12,
          background: bg,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          borderBottom: `1px solid ${border}`,
          borderRadius: '10px 10px 0 0',
        }}>
          {/* Color presets */}
          <div style={{ display: 'flex', gap: 4 }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPreset(i)}
                title={p.label}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: p.border, border: 'none', cursor: 'pointer', padding: 0,
                  outline: preset === i ? `2px solid ${p.border}` : 'none',
                  outlineOffset: 2,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Editable title */}
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false) }}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11, fontWeight: 600, color: border,
                padding: 0, fontFamily: 'inherit',
              }}
            />
          ) : (
            <span
              onDoubleClick={() => setEditingTitle(true)}
              style={{ flex: 1, fontSize: 11, fontWeight: 600, color: border, cursor: 'text', userSelect: 'none' }}
              title="Podwójne kliknięcie aby edytować"
            >
              {title}
            </span>
          )}

          <span style={{ fontSize: 8, color: border, opacity: 0.6, whiteSpace: 'nowrap' }}>
            przeciągnij narożnik aby zmienić rozmiar
          </span>
        </div>
      </div>
    </>
  )
}
