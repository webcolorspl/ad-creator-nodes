'use client'
// ═══════════════════════════════════════════════
// HEADLINE PROPOSALS NODE — lista wariantów AI
// Radio-select: jeden na raz → selectedVariants[0]
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

const CTA_LABELS: Record<string, string> = {
  primary: 'Wypełniony',
  outline: 'Ramka',
  ghost:   'Ghost',
  text:    'Tekst',
}

function AlignBtn({ current, value, onClick }: { current: string | undefined; value: string; onClick: () => void }) {
  const Icon = value === 'left' ? AlignLeft : value === 'center' ? AlignCenter : AlignRight
  const active = (current ?? 'left') === value
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={onClick}
      title={value}
      style={{
        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? 'var(--color-input)' : 'var(--color-field-border)'}`,
        borderRadius: 6, background: active ? 'rgba(58,103,240,0.12)' : 'transparent',
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
        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? 'var(--color-input)' : 'var(--color-field-border)'}`,
        borderRadius: 6, background: active ? 'rgba(58,103,240,0.12)' : 'transparent',
        color: active ? 'var(--color-input)' : 'var(--color-text-muted)',
        cursor: 'pointer', fontSize: 11, fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}

// Radio-style check circle
function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${checked ? 'var(--color-input)' : 'var(--color-field-border)'}`,
      background: checked ? 'var(--color-input)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color .15s, background .15s',
    }}>
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

export function HeadlineProposalsNode({ id }: NodeProps) {
  const edges          = useAppStore(s => s.edges)
  const nodeOutputs    = useAppStore(s => s.nodeOutputs)
  const setNodeOutput  = useAppStore(s => s.setNodeOutput)
  const addToast       = useAppStore(s => s.addToast)

  const proposals = resolveInput<ProposalsData>(id, 'proposals', edges, nodeOutputs)

  const [variants,    setVariants]    = useState<HeadlineCTAVariant[]>([])
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [styling,     setStyling]     = useState<string | null>(null)

  // Sync incoming proposals → local variants (merge, don't replace)
  useEffect(() => {
    if (!proposals?.variants?.length) return
    setVariants(prev => {
      const existingIds = new Set(prev.map(v => v.id))
      const newOnes = proposals.variants.filter(v => !existingIds.has(v.id))
      return [...prev, ...newOnes]
    })
  }, [JSON.stringify(proposals?.variants?.map(v => v.id))]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync single selected variant to output
  useEffect(() => {
    const sel = variants.find(v => v.id === selectedId)
    setNodeOutput(id, { selectedVariants: sel ? [sel] : undefined })
  }, [selectedId, variants, id, setNodeOutput])

  function selectVariant(vid: string) {
    setSelectedId(prev => prev === vid ? null : vid)
  }

  function updateVariant(vid: string, patch: Partial<HeadlineCTAVariant>) {
    setVariants(prev => prev.map(v => v.id === vid ? { ...v, ...patch } : v))
  }

  function removeVariant(vid: string) {
    setVariants(prev => prev.filter(v => v.id !== vid))
    if (selectedId === vid) setSelectedId(null)
    if (expanded === vid) setExpanded(null)
    if (styling === vid) setStyling(null)
  }

  function addToLibrary() {
    const sel = variants.find(v => v.id === selectedId)
    if (!sel) { addToast({ type: 'warn', message: 'Zaznacz wariant' }); return }
    useAppStore.getState().addCopyVariant()
    const freshVariants = useAppStore.getState().copyVariants
    useAppStore.getState().setCopyVariant(freshVariants.length - 1, {
      id: sel.id,
      headlineMain: sel.headlineMain,
      headlineSub: sel.headlineSub,
      ctaText: sel.ctaText,
      ctaStyle: sel.ctaStyle,
    })
    addToast({ type: 'success', message: 'Dodano do biblioteki' })
  }

  const inputSt: React.CSSProperties = {
    width: '100%', fontSize: 11, padding: '5px 7px', borderRadius: 6,
    border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)',
    color: 'var(--color-text)', fontFamily: 'var(--font-ui)', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
    textTransform: 'uppercase' as const, color: 'var(--color-text-muted)',
    marginBottom: 2, display: 'block',
  }

  return (
    <BaseNode id={id} nodeType="headlineProposalsNode">
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 5 }}>

        {!variants.length && (
          <div style={{
            padding: '24px 0', textAlign: 'center',
            color: 'var(--color-text-muted)', fontSize: 11,
          }}>
            Podłącz BriefNode i kliknij „Generuj propozycje"
          </div>
        )}

        {variants.map((v, idx) => {
          const isSelected = selectedId === v.id
          const isExpanded = expanded === v.id
          const isStyling  = styling === v.id

          return (
            <div key={v.id} style={{
              border: `1.5px solid ${isSelected ? 'var(--color-input)' : 'var(--color-field-border)'}`,
              borderRadius: 10, overflow: 'hidden',
              background: isSelected ? 'rgba(58,103,240,0.05)' : 'var(--color-field-bg)',
              transition: 'border-color .15s, background .15s',
              boxShadow: isSelected ? '0 0 0 3px rgba(58,103,240,0.12)' : 'none',
            }}>

              {/* ── Header row ── */}
              <div
                style={{ display: 'flex', alignItems: 'flex-start', padding: '9px 10px', gap: 8, cursor: 'pointer' }}
                onClick={() => selectVariant(v.id)}
                onMouseDown={e => e.stopPropagation()}
              >
                {/* Radio circle */}
                <div style={{ paddingTop: 1, flexShrink: 0 }}>
                  <CheckCircle checked={isSelected} />
                </div>

                {/* Main text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, lineHeight: 1.3,
                    color: isSelected ? 'var(--color-text)' : 'var(--color-text-subtle)',
                    wordBreak: 'break-word',
                  }}>
                    {v.headlineMain || <span style={{ fontStyle: 'italic', opacity: .5 }}>brak hasła</span>}
                  </div>
                  {v.headlineSub && (
                    <div style={{
                      fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {v.headlineSub}
                    </div>
                  )}
                  {v.ctaText && (
                    <div style={{ marginTop: 5 }}>
                      <span style={{
                        fontSize: 9, padding: '2px 8px', borderRadius: 20,
                        background: isSelected ? 'rgba(58,103,240,0.15)' : 'rgba(0,0,0,0.06)',
                        color: isSelected ? 'var(--color-input)' : 'var(--color-text-muted)',
                        fontWeight: 600, letterSpacing: '.03em',
                      }}>
                        {v.ctaText}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons — right side */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: '1px 5px',
                    background: 'var(--color-border)', borderRadius: 10,
                    color: 'var(--color-text-muted)', letterSpacing: '.04em',
                  }}>
                    {idx + 1}
                  </span>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setStyling(isStyling ? null : v.id)}
                    title="Stylizacja"
                    style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                      border: `1px solid ${isStyling ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                      background: isStyling ? 'rgba(124,92,245,0.1)' : 'transparent',
                      color: isStyling ? 'var(--color-process)' : 'var(--color-text-muted)',
                    }}
                  >
                    Aa
                  </button>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setExpanded(isExpanded ? null : v.id)}
                    title="Edytuj"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isExpanded ? 'var(--color-input)' : 'var(--color-text-muted)',
                      fontSize: 12, padding: '2px 4px', lineHeight: 1,
                    }}
                  >
                    ✎
                  </button>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => removeVariant(v.id)}
                    title="Usuń"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-muted)', fontSize: 14, padding: '2px 4px', lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* ── Edit panel ── */}
              {isExpanded && (
                <div style={{
                  padding: '8px 10px 10px', borderTop: '1px solid var(--color-border)',
                  display: 'flex', flexDirection: 'column', gap: 7,
                  background: 'rgba(0,0,0,0.025)',
                }}>
                  <div>
                    <label style={labelSt}>Hasło główne</label>
                    <textarea
                      onMouseDown={e => e.stopPropagation()}
                      style={{ ...inputSt, resize: 'vertical', minHeight: 48 }}
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
                    <div style={{ width: 100 }}>
                      <label style={labelSt}>Styl CTA</label>
                      <select
                        onMouseDown={e => e.stopPropagation()}
                        style={{ ...inputSt, cursor: 'pointer' }}
                        value={v.ctaStyle}
                        onChange={e => updateVariant(v.id, { ctaStyle: e.target.value as HeadlineCTAVariant['ctaStyle'] })}
                      >
                        {CTA_STYLES.map(s => <option key={s} value={s}>{CTA_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Styling panel ── */}
              {isStyling && (
                <div style={{
                  padding: '8px 10px 10px', borderTop: '1px solid var(--color-border)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  background: 'rgba(124,92,245,0.03)',
                }}>
                  <div>
                    <div style={{ ...labelSt, marginBottom: 5 }}>Hasło główne — styl</div>
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
                        type="number" min={8} max={120}
                        value={v.headlineSize ?? 36}
                        onChange={e => updateVariant(v.id, { headlineSize: Number(e.target.value) })}
                        onMouseDown={e => e.stopPropagation()}
                        style={{ width: 42, fontSize: 10, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)', color: 'var(--color-text)', outline: 'none' }}
                        title="Rozmiar px"
                      />
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>px</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ ...labelSt, marginBottom: 5 }}>Pod-hasło — styl</div>
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

                  <div>
                    <div style={{ ...labelSt, marginBottom: 5 }}>Kolory</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
        {variants.length > 0 && selectedId && (
          <button
            className="btn btn-ghost btn-sm"
            onMouseDown={e => e.stopPropagation()}
            onClick={addToLibrary}
            style={{ justifyContent: 'center', fontSize: 10, marginTop: 2 }}
          >
            + Dodaj wybrany do biblioteki
          </button>
        )}
      </div>

      <StatusBar
        status={variants.length ? (selectedId ? 'done' : 'idle') : 'idle'}
        message={
          variants.length === 0 ? 'Brak wariantów — podłącz BriefNode' :
          selectedId             ? 'Wybrany wariant → BannerGrid' :
                                   `${variants.length} wariantów — wybierz jeden`
        }
      />
    </BaseNode>
  )
}
