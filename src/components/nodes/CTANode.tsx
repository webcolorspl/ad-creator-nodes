'use client'
import { useState, useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { validateCTANode } from '@/lib/validation'
import type { NodeProps } from '@xyflow/react'
import type { CTAData } from '@/types'

const VAR_BTN: React.CSSProperties = {
  textAlign: 'left', width: '100%', padding: '5px 8px', borderRadius: 6,
  background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)',
  cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all .1s',
  display: 'flex', alignItems: 'baseline', gap: 6,
}
const VAR_BTN_HOVER: React.CSSProperties = {
  ...VAR_BTN, background: 'var(--blue-50)', borderColor: 'var(--blue-200)',
}

export function CTANode({ id, data }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const setNodeErrors = useAppStore(s => s.setNodeErrors)
  const edges         = useAppStore(s => s.edges)
  const nodeOutputs   = useAppStore(s => s.nodeOutputs)
  const copyVariants  = useAppStore(s => s.copyVariants)
  const d = data as Record<string, unknown>
  const [text,       setText]       = useState((d.text  as string) ?? '')
  const [style,      setStyle]      = useState((d.style as string) ?? 'primary')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Input from CopyVariantsNode via edge
  const ctaInput = resolveInput<CTAData>(id, 'cta', edges, nodeOutputs)

  const filledVariants = copyVariants.filter(v => v.ctaText.trim())
  const valid    = text.trim().length > 0 && text.length <= 30

  useEffect(() => {
    const errors = validateCTANode({ text, style: style as 'primary' })
    setNodeErrors(id, errors)
    if (!errors.length) {
      setNodeOutput(id, { cta: { text: text.trim(), style: style as 'primary' } })
    }
  }, [text, style, id, setNodeOutput, setNodeErrors])

  return (
    <BaseNode id={id} nodeType="ctaNode">

      {/* ── Connected from CopyVariantsNode ── */}
      {ctaInput ? (
        <div>
          <PortIndicator label="Copy Variants" connected={true} />
          <div style={{ marginTop: 4, padding: '5px 8px', background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 6, fontSize: 11, color: 'var(--blue-600)' }}>
            {ctaInput.text} [{ctaInput.style}]
          </div>
          <div className="field-divider" style={{ marginTop: 6 }} />
        </div>
      ) : (
        <PortIndicator label="Copy Variants (opt.)" connected={false} />
      )}

      {/* ── Variant picker from CopyVariantsPanel ── */}
      {!ctaInput && filledVariants.length > 0 && (
        <div className="nodrag nopan">
          <div className="field-label" style={{ color: 'var(--color-process)' }}>
            Warianty Copy — kliknij aby użyć
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filledVariants.map((v, i) => {
              const origIdx = copyVariants.indexOf(v)
              return (
                <div
                  key={v.id}
                  className="nodrag nopan"
                  style={hoveredIdx === i ? VAR_BTN_HOVER : VAR_BTN}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setText(v.ctaText.slice(0, 30)); setStyle(v.ctaStyle) }}
                >
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-process)', minWidth: 52 }}>
                    Wariant {origIdx + 1}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                    {v.ctaText.slice(0, 20)}{v.ctaText.length > 20 ? '…' : ''}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    [{v.ctaStyle}]
                  </span>
                </div>
              )
            })}
          </div>
          <div className="field-divider" style={{ marginTop: 6 }} />
        </div>
      )}

      <div>
        <div className="field-label">Tekst przycisku <span className="field-required">*</span></div>
        <input
          className={`field-input${text.trim().length > 0 ? (text.length <= 30 ? ' valid' : ' invalid') : ''}`}
          placeholder="Np. Sprawdź ofertę"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <span className={`field-charcount${text.length > 30 ? ' over' : ''}`}>{text.length}/30</span>
      </div>
      <div>
        <div className="field-label">Styl</div>
        <select className="field-select" value={style} onChange={e => setStyle(e.target.value)}>
          <option value="primary">Primary — wypełniony</option>
          <option value="outline">Outline — ramka</option>
          <option value="ghost">Ghost</option>
          <option value="text">Text only</option>
        </select>
      </div>
      <StatusBar status={valid ? 'done' : 'idle'} message={valid ? `"${text}" · ${style}` : 'wpisz tekst CTA'} />
    </BaseNode>
  )
}