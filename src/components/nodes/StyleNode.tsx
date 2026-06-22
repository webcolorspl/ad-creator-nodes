'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { AD_FORMATS, PLATFORM_GROUPS } from '@/lib/constants'
import type { NodeProps } from '@xyflow/react'

export function StyleNode({ id, data }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const d = data as Record<string, unknown>
  const [format, setFormat] = useState<string>((d.format as string) ?? 'fb-feed')
  const [activePlatform, setActivePlatform] = useState<string>('Facebook')
  const fmt = AD_FORMATS.find(f => f.id === format) ?? AD_FORMATS[0]

  useEffect(() => {
    setNodeOutput(id, { style: { format: fmt.id, width: fmt.w, height: fmt.h } })
  }, [format, id, fmt, setNodeOutput])

  const platformFormats = AD_FORMATS.filter(f =>
    PLATFORM_GROUPS.find(g => g.label === activePlatform)?.ids.includes(f.id)
  )

  return (
    <BaseNode id={id} nodeType="styleNode">
      {/* Platform tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
        {PLATFORM_GROUPS.map(g => (
          <button
            key={g.label}
            onClick={() => setActivePlatform(g.label)}
            style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700, borderRadius: 4, cursor: 'pointer',
              border: `1.5px solid ${activePlatform === g.label ? g.color : 'var(--color-field-border)'}`,
              background: activePlatform === g.label ? g.color + '22' : 'var(--color-field-bg)',
              color: activePlatform === g.label ? g.color : 'var(--color-text-muted)',
              transition: 'all .1s',
            }}
            title={g.label}
          >
            {g.icon}
          </button>
        ))}
      </div>

      {/* Format grid for active platform */}
      <div className="format-grid">
        {platformFormats.map(f => (
          <button
            key={f.id}
            className={`format-btn${format === f.id ? ' active' : ''}`}
            onClick={() => setFormat(f.id)}
          >
            <div style={{ marginBottom: 2 }}>
              <div className="format-rect" style={{ width: f.pw, height: f.ph }} />
            </div>
            <span className="format-ratio" style={{ fontSize: 8 }}>{f.label}</span>
            <span className="format-label">{f.w}×{f.h}</span>
          </button>
        ))}
      </div>

      <StatusBar status="done" message={`${fmt.label} · ${fmt.w}×${fmt.h}px`} />
    </BaseNode>
  )
}
