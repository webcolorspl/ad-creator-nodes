'use client'
import { useState, useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { validateHeadlineNode } from '@/lib/validation'
import type { NodeProps } from '@xyflow/react'
import type { HeadlineData } from '@/types'

const VAR_BTN: React.CSSProperties = {
  textAlign: 'left', width: '100%', padding: '5px 8px', borderRadius: 6,
  background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)',
  cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all .1s',
  display: 'flex', alignItems: 'baseline', gap: 6,
}
const VAR_BTN_HOVER: React.CSSProperties = {
  ...VAR_BTN, background: 'var(--blue-50)', borderColor: 'var(--blue-200)',
}

export function HeadlineNode({ id, data }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const setNodeErrors = useAppStore(s => s.setNodeErrors)
  const edges         = useAppStore(s => s.edges)
  const nodeOutputs   = useAppStore(s => s.nodeOutputs)
  const copyVariants  = useAppStore(s => s.copyVariants)
  const d = data as Record<string, unknown>
  const [main,     setMain]     = useState((d.main as string) ?? '')
  const [sub,      setSub]      = useState((d.sub  as string) ?? '')
  const [variants, setVariants] = useState<string[]>((d.variants as string[]) ?? [])
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const filledVariants = copyVariants.filter(v => v.headlineMain.trim())

  const webInput = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs)
  const valid    = main.trim().length > 0 && main.length <= 60

  useEffect(() => {
    const errors = validateHeadlineNode({ main, sub })
    setNodeErrors(id, errors)
    if (!errors.length) {
      setNodeOutput(id, { headline: { main: main.trim(), sub: sub.trim(), variants } })
    }
  }, [main, sub, variants, id, setNodeOutput, setNodeErrors])

  // Zamień wariant[i] z aktywnym hasłem głównym
  const promoteVariant = (i: number) => {
    const promoted = variants[i]
    if (!promoted.trim()) return
    setVariants(vs => vs.map((v, j) => j === i ? main : v))
    setMain(promoted)
  }

  // Zastosuj propozycję z Web Import
  const applyProposal = (text: string) => setMain(text.slice(0, 60))

  return (
    <BaseNode id={id} nodeType="headlineNode">

      {/* Propozycje z Web Import */}
      {webInput && (
        <div>
          <div className="field-label" style={{ color: 'var(--blue-500)' }}>Propozycje z Web Import</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6 }}>
            {[webInput.main, ...(webInput.variants ?? [])].filter(Boolean).map((h, i) => (
              <button
                key={i}
                onClick={() => applyProposal(h)}
                style={{
                  textAlign: 'left', fontSize: 11, padding: '4px 8px', borderRadius: 5,
                  background: 'var(--blue-50)', border: '1px solid var(--blue-100)',
                  color: 'var(--blue-600)', cursor: 'pointer', lineHeight: 1.4,
                  fontFamily: 'var(--font-ui)', transition: 'background .1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-100)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue-50)')}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="field-divider" />
        </div>
      )}

      {!webInput && <PortIndicator label="Web Import (opt.)" connected={false} />}

      {/* ── Variant picker from CopyVariantsPanel ── */}
      {filledVariants.length > 0 && (
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
                  onClick={e => { e.stopPropagation(); setMain(v.headlineMain.slice(0, 60)); setSub(v.headlineSub) }}
                >
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-process)', minWidth: 52 }}>
                    Wariant {origIdx + 1}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.headlineMain.slice(0, 28)}{v.headlineMain.length > 28 ? '…' : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="field-divider" style={{ marginTop: 6 }} />
        </div>
      )}

      {/* Hasło główne */}
      <div>
        <div className="field-label">Hasło główne <span className="field-required">*</span></div>
        <input
          className={`field-input${main.trim().length > 0 ? (main.length <= 60 ? ' valid' : ' invalid') : ''}`}
          placeholder="Np. Twoja marka. Twój sukces."
          value={main}
          onChange={e => setMain(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span className="field-hint">max 60 znaków</span>
          <span className={`field-charcount${main.length > 60 ? ' over' : ''}`}>{main.length}/60</span>
        </div>
      </div>

      {/* Pod-hasło */}
      <div>
        <div className="field-label">Pod-hasło</div>
        <input
          className={`field-input${sub.length > 100 ? ' invalid' : sub.length > 0 ? ' valid' : ''}`}
          placeholder="Opcjonalny tekst pomocniczy"
          value={sub}
          onChange={e => setSub(e.target.value)}
        />
      </div>

      {/* Warianty z wyborem aktywnego */}
      {variants.length > 0 && (
        <div>
          <div className="field-label">Warianty <span className="field-hint" style={{ textTransform: 'none', letterSpacing: 0 }}>— kliknij ↑ aby użyć</span></div>
          <div className="variant-list">
            {variants.map((v, i) => (
              <div key={i} className="variant-chip">
                <button
                  onClick={() => promoteVariant(i)}
                  title="Ustaw jako hasło główne"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 2px', color: v.trim() ? 'var(--blue-400)' : 'var(--color-text-muted)',
                    fontSize: 12, lineHeight: 1, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  ↑
                </button>
                <input
                  value={v}
                  placeholder={`Wariant ${i + 1}…`}
                  onChange={e => setVariants(vs => vs.map((x, j) => j === i ? e.target.value : x))}
                />
                <span
                  className="variant-remove"
                  onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {variants.length < 3 && (
        <button className="add-variant" onClick={() => setVariants(v => [...v, ''])}>＋ Wariant</button>
      )}

      <StatusBar
        status={valid ? 'done' : 'idle'}
        message={valid ? `"${main.slice(0, 22)}${main.length > 22 ? '…' : ''}"${variants.length ? ` +${variants.length}` : ''}` : 'wpisz hasło'}
      />
    </BaseNode>
  )
}
