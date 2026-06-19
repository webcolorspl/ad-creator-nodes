'use client'
// ═══════════════════════════════════════════════
// COPY VARIANTS PANEL — pływający panel wariantów
// Edytuj Headline + CTA dla każdego wariantu.
// Aktywny wariant → CopyVariantsNode wypluwa dane.
// ═══════════════════════════════════════════════
import { useAppStore } from '@/store/appStore'
import { FloatingPanel } from './FloatingPanel'
import type { HeadlineCTAVariant } from '@/types'

const MAX = 5

export function CopyVariantsPanel() {
  const variants             = useAppStore(s => s.copyVariants)
  const activeIdx            = useAppStore(s => s.activeCopyVariantIdx)
  const setCopyVariant       = useAppStore(s => s.setCopyVariant)
  const addCopyVariant       = useAppStore(s => s.addCopyVariant)
  const removeCopyVariant    = useAppStore(s => s.removeCopyVariant)
  const setActiveCopyVariantIdx = useAppStore(s => s.setActiveCopyVariantIdx)

  const set = (idx: number, field: keyof HeadlineCTAVariant, value: string) =>
    setCopyVariant(idx, { ...variants[idx], [field]: value })

  return (
    <FloatingPanel side="copy" title="Warianty Copy" width={280}>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px 10px' }}>

        {variants.map((v, idx) => {
          const isActive = idx === activeIdx
          return (
            <div
              key={v.id}
              style={{
                border: `1.5px solid ${isActive ? 'var(--blue-400)' : 'var(--color-field-border)'}`,
                borderRadius: 8,
                background: isActive ? 'var(--blue-50)' : 'var(--color-node-bg)',
                padding: '8px 10px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition: 'border-color .15s, background .15s',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <button
                  onClick={() => setActiveCopyVariantIdx(idx)}
                  title="Ustaw jako aktywny"
                  style={{
                    width: 14, height: 14, borderRadius: '50%', padding: 0, cursor: 'pointer', flexShrink: 0,
                    border: `2px solid ${isActive ? 'var(--blue-500)' : '#B0BECF'}`,
                    background: isActive ? 'var(--blue-500)' : 'transparent',
                  }}
                />
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: isActive ? 'var(--blue-600)' : 'var(--color-text-subtle)' }}>
                  Wariant {idx + 1}
                  {isActive && <span style={{ fontWeight: 400, color: 'var(--blue-400)', marginLeft: 5, fontSize: 10 }}>aktywny</span>}
                </span>
                {variants.length > 1 && (
                  <button
                    onClick={() => removeCopyVariant(idx)}
                    title="Usuń"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 13, padding: '0 2px', display: 'flex', alignItems: 'center' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Headline main */}
              <div>
                <div className="field-label">Hasło <span className="field-required">*</span></div>
                <input
                  className={`field-input${v.headlineMain.trim() ? (v.headlineMain.length <= 60 ? ' valid' : ' invalid') : ''}`}
                  placeholder="Np. Twoja marka. Twój sukces."
                  value={v.headlineMain}
                  onChange={e => set(idx, 'headlineMain', e.target.value)}
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
                  onChange={e => set(idx, 'headlineSub', e.target.value)}
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
                  onChange={e => set(idx, 'ctaText', e.target.value)}
                />
                <span className={`field-charcount${v.ctaText.length > 30 ? ' over' : ''}`}>{v.ctaText.length}/30</span>
              </div>

              {/* CTA style */}
              <div>
                <div className="field-label">Styl CTA</div>
                <select className="field-select" value={v.ctaStyle} onChange={e => set(idx, 'ctaStyle', e.target.value)}>
                  <option value="primary">Primary — wypełniony</option>
                  <option value="outline">Outline — ramka</option>
                  <option value="ghost">Ghost</option>
                  <option value="text">Text only</option>
                </select>
              </div>

            </div>
          )
        })}

        {variants.length < MAX && (
          <button className="add-variant" onClick={addCopyVariant} style={{ marginTop: 2 }}>
            ＋ Wariant
          </button>
        )}
      </div>
    </FloatingPanel>
  )
}
