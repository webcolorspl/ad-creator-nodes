'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { AD_FORMATS } from '@/lib/constants'
import type { NodeProps } from '@xyflow/react'

export function StyleNode({ id, data }: NodeProps) {
  const { setNodeOutput } = useAppStore()
  const d = data as Record<string, unknown>
  const [format, setFormat] = useState<string>((d.format as string) ?? '1:1')
  const fmt = AD_FORMATS.find(f => f.id === format) ?? AD_FORMATS[0]

  useEffect(() => {
    setNodeOutput(id, { style: { format: fmt.id, width: fmt.w, height: fmt.h } })
  }, [format, id, fmt, setNodeOutput])

  return (
    <BaseNode id={id} nodeType="styleNode">
      <div className="field-label">Format</div>
      <div className="format-grid">
        {AD_FORMATS.map(f => (
          <button
            key={f.id}
            className={`format-btn${format === f.id ? ' active' : ''}`}
            onClick={() => setFormat(f.id)}
          >
            <div style={{ marginBottom: 2 }}>
              <div className="format-rect" style={{ width: f.pw, height: f.ph }} />
            </div>
            <span className="format-ratio">{f.id}</span>
            <span className="format-label">{f.label}</span>
          </button>
        ))}
      </div>
      <StatusBar status="done" message={`${fmt.w}×${fmt.h}px`} />
    </BaseNode>
  )
}
