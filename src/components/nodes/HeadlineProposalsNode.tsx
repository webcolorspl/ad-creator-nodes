'use client'
// ═══════════════════════════════════════════════
// HEADLINE PROPOSALS NODE — lista wariantów AI
// Wybierz, edytuj, stylizuj → selectedVariants
// ═══════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from '@/lib/icons'
import type { NodeProps } from '@xyflow/react'
import type { HeadlineCTAVariant, ProposalsData } from '@/types'

const CTA_STYLES = ['primary', 'outline', 'ghost', 'text'] as const

function AlignBtn({ current, value, onClick }: { current: string | undefined; value: string; onClick: () => void }) {
  const Icon = value === 'left' ? AlignLeft : value === 'center' ? AlignCenter : AlignRight
  const active = (current ?? 'left') === value
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={onClick}
      title={value}
      style={{
        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? 'var(--color-input)' : 'var(--color-field-border)'}`,
        borderRadius: 5, background: active ? 'rgba(58,103,240,0.1)' : 'transparent',
        color: active ? 'var(--color-input)' : 'var(--color-text-muted)',
        cursor: 'pointer',
      }}
    >
      <Icon size={11} strokeWidth={2} />
    </button>
  )
}

function StyleToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={onClick}
      style={{
        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? 'var(--color-input)' : 'var(--color-field-border)'}`,
        borderRadius: 5, background: active ? 'rgba(58,103,240,0.1)' : 'transparent',
        color: active ? 'var(--color-input)' : 'var(--color-text-muted)',
        cursor: 'pointer', fontSize: 11, fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}

export function HeadlineProposalsNode({ id }: NodeProps) {
  const edges          = useAppStore(s => s.edges)
  const nodeOutputs    = useAppStore(s => s.nodeOutputs)
  const setNodeOutput  = useAppStore(s => s.setNodeOutput)
  const addToast       = useAppStore(s => s.addToast)

  const proposals = resolveInput<ProposalsData>(id, 'proposals', edges, nodeOutputs)

  const [variants,  setVariants]  = useState<HeadlineCTAVariant[]>([])
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [styling,   setStyling]   = useState<string | null>(null)

  // Sync incoming proposals → local variants (merge, don't replace)
  useEffect(() => {
    if (!proposals?.variants?.length) return
    setVariants(prev => {
      const existingIds = new Set(prev.map(v => v.id))
      const newOnes = proposals.variants.filter(v => !existingIds.has(v.id))
      return [...prev, ...newOnes]
    })
  }, [JSON.stringify(proposals?.variants?.map(v => v.id))]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selected variants to output
  useEffect(() => {
    const sel = variants.filter(v => selected.has(v.id))
    setNodeOutput(id, { selectedVariants: sel.length ? sel : undefined })
  }, [selected, variants, id, setNodeOutput])

  function toggleSelect(vid: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(vid)) next.delete(vid)
      else next.add(vid)
      return next
    })
  }

  function updateVariant(vid: string, patch: Partial<HeadlineCTAVariant>) {
    setVariants(prev => prev.map(v => v.id === vid ? { ...v, ...patch } : v))
  }

  function removeVariant(vid: string) {
    setVariants(prev => prev.filter(v => v.id !== vid))
    setSelected(prev => { const n = new Set(prev); n.delete(vid); return n })
  }

  function addToLibrary() {
    const sel = variants.filter(v => selected.has(v.id))
    if (!sel.length) { addToast({ type: 'warn', message: 'Zaznacz warianty' }); return }
    sel.forEach(v => {
      // Use store directly to add and immediately update
      useAppStore.getState().addCopyVariant()
      const freshVariants = useAppStore.getState().copyVariants
      useAppStore.getState().setCopyVariant(freshVariants.length - 1, {
        id: v.id,
        headlineMain: v.headlineMain,
        headlineSub: v.headlineSub,
        ctaText: v.ctaText,
        ctaStyle: v.ctaStyle,
      })
    })
    addToast({ type: 'success', message: `Dodano ${sel.length} wariantów do biblioteki` })
  }

  const selCount = selected.size

  const inputSt: React.CSSProperties = {
    width: '100%', fontSize: 11, padding: '5px 7px', borderRadius: 6,
    border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)',
    color: 'var(--color-text)', fontFamily: 'var(--font-ui)', outline: 'none',
  }
  const labelSt: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
    textTransform: 'uppercase' as const, color: 'var(--color-text-muted)',
    marginBottom: 2, display: 'block',
  }

  return (
    <BaseNode id={id} nodeType="headlineProposalsNode">
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 6 }}>

        {!variants.length && (
          <div style={{
            padding: '20px 0', textAlign: 'center',
            color: 'var(--color-text-muted)', fontSize: 11,
          }}>
            Podłącz BriefNode i kliknij „Generuj propozycje"
          </div>
        )}

        {/* Variant cards */}
        {variants.map((v, idx) => {
          const isSelected = selected.has(v.id)
          const isExpanded = expanded === v.id
          const isStyling  = styling === v.id

          return (
            <div key={v.id} style={{
              border: `1.5px solid ${isSelected ? 'var(--blue-400)' : 'var(--color-field-border)'}`,
              borderRadius: 10, overflow: 'hidden',
              background: isSelected ? 'var(--blue-50)' : 'var(--color-field-bg)',
              transition: 'border-color .15s, background .15s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', gap: 7 }}>
                {/* Select checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(v.id)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{ accentColor: 'var(--blue-500)', width: 13, height: 13, flexShrink: 0, cursor: 'pointer' }}
                />
                {/* Label + preview */}
                <div
                  style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                  onClick={() => setExpanded(isExpanded ? null : v.id)}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'var(--blue-600)' : 'var(--color-text-subtle)' }}>
                    Wariant {idx + 1}
                  </div>
                  {v.headlineMain && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.headlineMain.slice(0, 36)}{v.headlineMain.length > 36 ? '…' : ''}
                    </div>
                  )}
                </div>
                {/* Style toggle */}
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => setStyling(isStyling ? null : v.id)}
                  title="Stylizacja"
                  style={{
                    fontSize: 9, padding: '2px 5px', borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${isStyling ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                    background: isStyling ? 'rgba(124,92,245,0.1)' : 'transparent',
                    color: isStyling ? 'var(--color-process)' : 'var(--color-text-muted)',
                  }}
                >
                  Aa
                </button>
                {/* Edit toggle */}
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => setExpanded(isExpanded ? null : v.id)}
                  title="Edytuj"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 11, padding: '2px 3px' }}
                >
                  ✎
                </button>
                {/* Remove */}
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => removeVariant(v.id)}
                  title="Usuń"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12, padding: '2px 3px' }}
                >
                  ×
                </button>
              </div>

              {/* Edit panel */}
              {isExpanded && (
                <div style={{ padding: '8px 10px 10px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div>
                    <label style={labelSt}>Hasło główne</label>
                    <input
                      onMouseDown={e => e.stopPropagation()}
                      style={inputSt}
                      value={v.headlineMain}
                      onChange={e => updateVariant(v.id, { headlineMain: e.target.value })}
                      placeholder="Hasło główne…"
                    />
                    <span style={{ fontSize: 9, color: v.headlineMain.length > 200 ? '#E54D6A' : 'var(--color-text-muted)' }}>
                      {v.headlineMain.length}/200
                    </span>
                  </div>
                  <div>
                    <label style={labelSt}>Pod-hasło</label>
                    <input
                      onMouseDown={e => e.stopPropagation()}
                      style={inputSt}
                      value={v.headlineSub}
                      onChange={e => updateVariant(v.id, { headlineSub: e.target.value })}
                      placeholder="Pod-hasło (opcjonalne)…"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelSt}>CTA</label>
                      <input
                        onMouseDown={e => e.stopPropagation()}
                        style={inputSt}
                        value={v.ctaText}
                        onChange={e => updateVariant(v.id, { ctaText: e.target.value })}
                        placeholder="Kup teraz"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelSt}>Styl CTA</label>
                      <select
                        onMouseDown={e => e.stopPropagation()}
                        style={{ ...inputSt, cursor: 'pointer' }}
                        value={v.ctaStyle}
                        onChange={e => updateVariant(v.id, { ctaStyle: e.target.value as HeadlineCTAVariant['ctaStyle'] })}
                      >
                        {CTA_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Styling panel */}
              {isStyling && (
                <div style={{ padding: '8px 10px 10px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Headline styling */}
                  <div>
                    <div style={{ ...labelSt, marginBottom: 4 }}>Hasło — styl</div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <AlignBtn current={v.headlineAlign} value="left"   onClick={() => updateVariant(v.id, { headlineAlign: 'left' })} />
                      <AlignBtn current={v.headlineAlign} value="center" onClick={() => updateVariant(v.id, { headlineAlign: 'center' })} />
                      <AlignBtn current={v.headlineAlign} value="right"  onClick={() => updateVariant(v.id, { headlineAlign: 'right' })} />
                      <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 2px' }} />
                      <StyleToggle active={!!v.headlineBold}      label="B" onClick={() => updateVariant(v.id, { headlineBold: !v.headlineBold })} />
                      <StyleToggle active={!!v.headlineItalic}    label="I" onClick={() => updateVariant(v.id, { headlineItalic: !v.headlineItalic })} />
                      <StyleToggle active={!!v.headlineUnderline} label="U" onClick={() => updateVariant(v.id, { headlineUnderline: !v.headlineUnderline })} />
                      <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 2px' }} />
                      <input
                        type="number"
                        min={8} max={120}
                        value={v.headlineSize ?? 36}
                        onChange={e => updateVariant(v.id, { headlineSize: Number(e.target.value) })}
                        onMouseDown={e => e.stopPropagation()}
                        style={{ width: 42, fontSize: 10, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)', color: 'var(--color-text)', outline: 'none' }}
                        title="Rozmiar px"
                      />
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>px</span>
                    </div>
                  </div>

                  {/* Sub-headline styling */}
                  <div>
                    <div style={{ ...labelSt, marginBottom: 4 }}>Pod-hasło — styl</div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <AlignBtn current={v.subAlign} value="left"   onClick={() => updateVariant(v.id, { subAlign: 'left' })} />
                      <AlignBtn current={v.subAlign} value="center" onClick={() => updateVariant(v.id, { subAlign: 'center' })} />
                      <AlignBtn current={v.subAlign} value="right"  onClick={() => updateVariant(v.id, { subAlign: 'right' })} />
                      <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 2px' }} />
                      <StyleToggle active={!!v.subBold}      label="B" onClick={() => updateVariant(v.id, { subBold: !v.subBold })} />
                      <StyleToggle active={!!v.subItalic}    label="I" onClick={() => updateVariant(v.id, { subItalic: !v.subItalic })} />
                      <StyleToggle active={!!v.subUnderline} label="U" onClick={() => updateVariant(v.id, { subUnderline: !v.subUnderline })} />
                    </div>
                  </div>

                  {/* Theme override */}
                  <div>
                    <div style={{ ...labelSt, marginBottom: 4 }}>Kolor tła / akcentu</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Tło</span>
                        <input
                          type="color"
                          value={v.themeOverride?.bgColor ?? '#1a1a2e'}
                          onChange={e => updateVariant(v.id, { themeOverride: { ...v.themeOverride, bgColor: e.target.value } })}
                          onMouseDown={e => e.stopPropagation()}
                          style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--color-field-border)', padding: 1, cursor: 'pointer' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Akcent</span>
                        <input
                          type="color"
                          value={v.themeOverride?.accentColor ?? '#3a67f0'}
                          onChange={e => updateVariant(v.id, { themeOverride: { ...v.themeOverride, accentColor: e.target.value } })}
                          onMouseDown={e => e.stopPropagation()}
                          style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--color-field-border)', padding: 1, cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Actions */}
        {variants.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {selCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onMouseDown={e => e.stopPropagation()}
                onClick={addToLibrary}
                style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}
              >
                + Dodaj do biblioteki ({selCount})
              </button>
            )}
          </div>
        )}

      </div>
      <StatusBar
        status={variants.length ? (selCount > 0 ? 'done' : 'idle') : 'idle'}
        message={
          variants.length === 0 ? 'Brak wariantów — podłącz BriefNode' :
          selCount > 0          ? `${selCount} wybranych → BannerGrid` :
                                  `${variants.length} wariantów — zaznacz które wysłać`
        }
      />
    </BaseNode>
  )
}
