'use client'
// ═══════════════════════════════════════════════
// COPY VARIANTS NODE
// Czyta aktywny wariant z globalnego store.
// Edycja odbywa się w panelu "Warianty Copy".
// Wystawia porty: headline + cta
// ═══════════════════════════════════════════════
import { useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'

export function CopyVariantsNode({ id }: NodeProps) {
  const setNodeOutput        = useAppStore(s => s.setNodeOutput)
  const setNodeErrors        = useAppStore(s => s.setNodeErrors)
  const copyVariants         = useAppStore(s => s.copyVariants)
  const activeCopyVariantIdx = useAppStore(s => s.activeCopyVariantIdx)

  const active = copyVariants[activeCopyVariantIdx] ?? copyVariants[0]
  const validHeadline = active?.headlineMain.trim().length > 0 && active.headlineMain.length <= 60
  const validCTA      = active?.ctaText.trim().length > 0 && active.ctaText.length <= 30
  const valid         = validHeadline && validCTA

  useEffect(() => {
    if (valid) {
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
      if (!validHeadline) errs.push('Uzupełnij hasło w panelu Warianty Copy')
      if (!validCTA)      errs.push('Uzupełnij CTA w panelu Warianty Copy')
      setNodeErrors(id, errs)
      setNodeOutput(id, {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(active), id])

  return (
    <BaseNode id={id} nodeType="copyVariantsNode">
      {/* Active variant preview */}
      <div style={{
        background: valid ? 'var(--blue-50)' : 'var(--color-field-bg)',
        border: `1px solid ${valid ? 'var(--blue-200)' : 'var(--color-field-border)'}`,
        borderRadius: 7,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--blue-500)', minWidth: 44 }}>
            Wariant {activeCopyVariantIdx + 1}
          </span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>z {copyVariants.length}</span>
        </div>

        {active?.headlineMain.trim() ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.3 }}>
              {active.headlineMain.slice(0, 36)}{active.headlineMain.length > 36 ? '…' : ''}
            </div>
            {active.headlineSub.trim() && (
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                {active.headlineSub.slice(0, 40)}{active.headlineSub.length > 40 ? '…' : ''}
              </div>
            )}
            {active.ctaText.trim() && (
              <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                CTA: <span style={{ color: 'var(--blue-500)', fontWeight: 500 }}>{active.ctaText}</span>
                {' '}[{active.ctaStyle}]
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Otwórz panel<br />„Warianty Copy"
          </div>
        )}
      </div>

      <StatusBar
        status={valid ? 'done' : 'idle'}
        message={valid
          ? `"${active.headlineMain.slice(0, 16)}…" · ${active.ctaText.slice(0, 10)}`
          : 'uzupełnij w panelu'}
      />
    </BaseNode>
  )
}
