'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { FloatingPanel } from './FloatingPanel'
import type { HeadlineCTAVariant } from '@/types'

const MAX = 5

export function CopyVariantsPanel() {
  const variants                = useAppStore(s => s.copyVariants)
  const activeIdx               = useAppStore(s => s.activeCopyVariantIdx)
  const setCopyVariant          = useAppStore(s => s.setCopyVariant)
  const addCopyVariant          = useAppStore(s => s.addCopyVariant)
  const removeCopyVariant       = useAppStore(s => s.removeCopyVariant)
  const setActiveCopyVariantIdx = useAppStore(s => s.setActiveCopyVariantIdx)

  const [editIdx, setEditIdx] = useState(0)

  const v   = variants[editIdx] ?? variants[0]
  const set = (field: keyof HeadlineCTAVariant, value: string) =>
    setCopyVariant(editIdx, { ...v, [field]: value })

  const isActive      = editIdx === activeIdx
  const validHeadline = v?.headlineMain.trim().length > 0 && v.headlineMain.length <= 60
  const validCTA      = v?.ctaText.trim().length > 0 && v.ctaText.length <= 30

  return (
    <FloatingPanel side="copy" title="Warianty Copy" width={460}>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* ── LEFT: variant tree ── */}
        <div style={{
          width: 148,
          flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '6px 0',
        }}>
          {variants.map((variant, idx) => {
            const isEdit  = idx === editIdx
            const isAct   = idx === activeIdx
            const hasText = variant.headlineMain.trim().length > 0
            return (
              <button
                key={variant.id}
                onClick={() => setEditIdx(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  padding: '7px 10px',
                  margin: '1px 5px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isEdit ? 'var(--blue-50)' : 'transparent',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (!isEdit) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isEdit) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: isAct ? 'var(--blue-500)' : 'var(--color-field-border)',
                  }} />
                  <span style={{
                    fontSize: 10,
                    fontWeight: isEdit ? 600 : 500,
                    color: isEdit ? 'var(--blue-600)' : 'var(--color-text-subtle)',
                    letterSpacing: '.03em',
                  }}>
                    Wariant {idx + 1}
                    {isAct && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--blue-400)', fontWeight: 400 }}>aktywny</span>}
                  </span>
                </div>
                <div style={{
                  fontSize: 10,
                  color: hasText ? 'var(--color-text)' : 'var(--color-text-muted)',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  fontStyle: hasText ? 'normal' : 'italic',
                }}>
                  {hasText ? variant.headlineMain : 'Pusty wariant'}
                </div>
                {variant.ctaText.trim() && (
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {variant.ctaText.slice(0, 20)}{variant.ctaText.length > 20 ? '…' : ''}
                  </div>
                )}
              </button>
            )
          })}

          {variants.length < MAX && (
            <button
              onClick={() => { addCopyVariant(); setEditIdx(variants.length) }}
              style={{
                margin: '4px 5px 2px',
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px dashed var(--color-field-border)',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                fontSize: 10,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color .12s, color .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-subtle)'; e.currentTarget.style.color = 'var(--color-text-subtle)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-field-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              + Wariant
            </button>
          )}
        </div>

        {/* ── RIGHT: edit form ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>
              Wariant {editIdx + 1}
            </span>
            <button
              onClick={() => setActiveCopyVariantIdx(editIdx)}
              style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '.05em',
                padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                border: `1px solid ${isActive ? 'var(--blue-400)' : 'var(--color-field-border)'}`,
                background: isActive ? 'var(--blue-500)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                transition: 'all .12s',
              }}
            >
              {isActive ? '● AKTYWNY' : 'Ustaw aktywny'}
            </button>
            {variants.length > 1 && (
              <button
                onClick={() => { removeCopyVariant(editIdx); setEditIdx(Math.max(0, editIdx - 1)) }}
                style={{
                  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', borderRadius: 5, background: 'transparent',
                  color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12,
                }}
                title="Usuń wariant"
              >
                ✕
              </button>
            )}
          </div>

          <div className="field-divider" />

          {/* Headline main */}
          <div>
            <div className="field-label">Hasło główne <span className="field-required">*</span></div>
            <input
              className={`field-input${v.headlineMain.trim() ? (v.headlineMain.length <= 60 ? ' valid' : ' invalid') : ''}`}
              placeholder="Np. Twoja marka. Twój sukces."
              value={v.headlineMain}
              onChange={e => set('headlineMain', e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
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
              onChange={e => set('headlineSub', e.target.value)}
            />
          </div>

          <div className="field-divider" />

          {/* CTA */}
          <div>
            <div className="field-label">Tekst CTA <span className="field-required">*</span></div>
            <input
              className={`field-input${v.ctaText.trim() ? (v.ctaText.length <= 30 ? ' valid' : ' invalid') : ''}`}
              placeholder="Np. Sprawdź ofertę"
              value={v.ctaText}
              onChange={e => set('ctaText', e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span className="field-hint">max 30 znaków</span>
              <span className={`field-charcount${v.ctaText.length > 30 ? ' over' : ''}`}>{v.ctaText.length}/30</span>
            </div>
          </div>

          {/* CTA style */}
          <div>
            <div className="field-label">Styl przycisku</div>
            <select className="field-select" value={v.ctaStyle} onChange={e => set('ctaStyle', e.target.value)}>
              <option value="primary">Primary — wypełniony</option>
              <option value="outline">Outline — ramka</option>
              <option value="ghost">Ghost</option>
              <option value="text">Text only</option>
            </select>
          </div>

          {(!validHeadline || !validCTA) && (
            <div style={{
              marginTop: 4, padding: '6px 8px', borderRadius: 6,
              background: 'rgba(255,100,100,.06)', border: '1px solid rgba(255,100,100,.15)',
              fontSize: 10, color: '#FF8080', lineHeight: 1.5,
            }}>
              {!validHeadline && <div>Hasło jest wymagane (max 60 znaków)</div>}
              {!validCTA      && <div>CTA jest wymagane (max 30 znaków)</div>}
            </div>
          )}
        </div>

      </div>
    </FloatingPanel>
  )
}
