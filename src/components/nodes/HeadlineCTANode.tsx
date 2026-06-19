'use client'
// ═══════════════════════════════════════════════
// HEADLINE + CTA NODE — warianty A/B
// Każdy wariant = hasło główne + pod-hasło + CTA
// Aktywny wariant trafia na porty headline i cta
// ═══════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'
import type { HeadlineCTAVariant } from '@/types'

const MAX_VARIANTS = 5

function makeVariant(n: number): HeadlineCTAVariant {
  return { id: `v${Date.now()}_${n}`, headlineMain: '', headlineSub: '', ctaText: '', ctaStyle: 'primary' }
}

export function HeadlineCTANode({ id, data }: NodeProps) {
  const { setNodeOutput, setNodeErrors } = useAppStore()
  const d = data as Record<string, unknown>

  const [variants,  setVariants]  = useState<HeadlineCTAVariant[]>(
    (d.variants as HeadlineCTAVariant[])?.length ? (d.variants as HeadlineCTAVariant[]) : [makeVariant(1)]
  )
  const [activeIdx, setActiveIdx] = useState<number>((d.activeIdx as number) ?? 0)
  const [expanded,  setExpanded]  = useState<number>(0)

  const active = variants[Math.min(activeIdx, variants.length - 1)]

  const validActive =
    active.headlineMain.trim().length > 0 &&
    active.headlineMain.length <= 60 &&
    active.ctaText.trim().length > 0 &&
    active.ctaText.length <= 30

  // Auto-save output on every change
  useEffect(() => {
    if (validActive) {
      setNodeErrors(id, [])
      setNodeOutput(id, {
        headline: {
          main: active.headlineMain.trim(),
          sub:  active.headlineSub.trim() || undefined,
        },
        cta: {
          text:  active.ctaText.trim(),
          style: active.ctaStyle,
        },
      })
    } else {
      const errs: string[] = []
      if (!active.headlineMain.trim())        errs.push('Wpisz hasło główne')
      else if (active.headlineMain.length > 60) errs.push('Hasło max 60 znaków')
      if (!active.ctaText.trim())             errs.push('Wpisz tekst CTA')
      else if (active.ctaText.length > 30)    errs.push('CTA max 30 znaków')
      setNodeErrors(id, errs)
      setNodeOutput(id, {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(variants), activeIdx, id])

  const update = (idx: number, field: keyof HeadlineCTAVariant, value: string) =>
    setVariants(vs => vs.map((v, i) => i === idx ? { ...v, [field]: value } : v))

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return
    const next = [...variants, makeVariant(variants.length + 1)]
    setVariants(next)
    setExpanded(next.length - 1)
  }

  const removeVariant = (idx: number) => {
    if (variants.length === 1) return
    const next = variants.filter((_, i) => i !== idx)
    setVariants(next)
    const newActive = activeIdx >= next.length ? next.length - 1 : activeIdx
    setActiveIdx(newActive)
    setExpanded(Math.min(expanded, next.length - 1))
  }

  return (
    <BaseNode id={id} nodeType="headlineCTANode">
      {variants.map((v, idx) => {
        const isActive   = idx === activeIdx
        const isExpanded = idx === expanded
        return (
          <div
            key={v.id}
            style={{
              border: `1.5px solid ${isActive ? 'var(--blue-400)' : 'var(--color-field-border)'}`,
              borderRadius: 8,
              background: isActive ? 'var(--blue-50)' : 'var(--color-field-bg)',
              overflow: 'hidden',
              transition: 'border-color .15s, background .15s',
            }}
          >
            {/* ── Variant header ── */}
            <div
              style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', cursor: 'pointer', gap: 7, userSelect: 'none' }}
              onClick={() => setExpanded(isExpanded ? -1 : idx)}
            >
              {/* Active radio */}
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setActiveIdx(idx) }}
                title="Ustaw jako aktywny"
                style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0, padding: 0, cursor: 'pointer',
                  border: `2px solid ${isActive ? 'var(--blue-500)' : '#B0BECF'}`,
                  background: isActive ? 'var(--blue-500)' : 'transparent',
                }}
              />
              {/* Label */}
              <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: isActive ? 'var(--blue-600)' : 'var(--color-text-subtle)' }}>
                Wariant {idx + 1}
                {v.headlineMain.trim() && (
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 5 }}>
                    — {v.headlineMain.slice(0, 22)}{v.headlineMain.length > 22 ? '…' : ''}
                  </span>
                )}
              </span>
              {/* Remove */}
              {variants.length > 1 && (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); removeVariant(idx) }}
                  title="Usuń wariant"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: 'var(--color-text-muted)', fontSize: 12, display: 'flex', alignItems: 'center' }}
                >
                  ✕
                </button>
              )}
              {/* Chevron */}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ color: 'var(--color-text-muted)', flexShrink: 0, transition: 'transform .15s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* ── Variant fields ── */}
            {isExpanded && (
              <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid var(--color-border)' }}>
                {/* Headline main */}
                <div>
                  <div className="field-label">Hasło <span className="field-required">*</span></div>
                  <input
                    className={`field-input${v.headlineMain.trim() ? (v.headlineMain.length <= 60 ? ' valid' : ' invalid') : ''}`}
                    placeholder="Np. Twoja marka. Twój sukces."
                    value={v.headlineMain}
                    onChange={e => update(idx, 'headlineMain', e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="field-hint">max 60 znaków</span>
                    <span className={`field-charcount${v.headlineMain.length > 60 ? ' over' : ''}`}>{v.headlineMain.length}/60</span>
                  </div>
                </div>

                {/* Headline sub */}
                <div>
                  <div className="field-label">Pod-hasło</div>
                  <input
                    className="field-input"
                    placeholder="Opcjonalny tekst pomocniczy"
                    value={v.headlineSub}
                    onChange={e => update(idx, 'headlineSub', e.target.value)}
                  />
                </div>

                <div className="field-divider" />

                {/* CTA text */}
                <div>
                  <div className="field-label">CTA <span className="field-required">*</span></div>
                  <input
                    className={`field-input${v.ctaText.trim() ? (v.ctaText.length <= 30 ? ' valid' : ' invalid') : ''}`}
                    placeholder="Np. Sprawdź ofertę"
                    value={v.ctaText}
                    onChange={e => update(idx, 'ctaText', e.target.value)}
                  />
                  <span className={`field-charcount${v.ctaText.length > 30 ? ' over' : ''}`}>{v.ctaText.length}/30</span>
                </div>

                {/* CTA style */}
                <div>
                  <div className="field-label">Styl CTA</div>
                  <select
                    className="field-select"
                    value={v.ctaStyle}
                    onChange={e => update(idx, 'ctaStyle', e.target.value)}
                  >
                    <option value="primary">Primary — wypełniony</option>
                    <option value="outline">Outline — ramka</option>
                    <option value="ghost">Ghost</option>
                    <option value="text">Text only</option>
                  </select>
                </div>

              </div>
            )}
          </div>
        )
      })}

      {variants.length < MAX_VARIANTS && (
        <button className="add-variant" onClick={addVariant}>＋ Wariant</button>
      )}

      <StatusBar
        status={validActive ? 'done' : 'idle'}
        message={validActive
          ? `"${active.headlineMain.slice(0, 18)}${active.headlineMain.length > 18 ? '…' : ''}" · ${active.ctaText.slice(0, 12)}`
          : `Wariant ${activeIdx + 1} — wypełnij pola`}
      />
    </BaseNode>
  )
}
