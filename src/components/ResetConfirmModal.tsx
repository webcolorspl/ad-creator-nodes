'use client'
import { useAppStore } from '@/store/appStore'

interface Props { onConfirm: () => void }

export function ResetConfirmModal({ onConfirm }: Props) {
  const showResetConfirm   = useAppStore(s => s.showResetConfirm)
  const setShowResetConfirm = useAppStore(s => s.setShowResetConfirm)

  if (!showResetConfirm) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--color-canvas, #0d0f14)',
        border: '1px solid #ef4444',
        borderRadius: 12, padding: '32px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        maxWidth: 400, width: '90%',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text, #fff)', marginBottom: 8 }}>Resetuj projekt?</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted, #6b7280)', lineHeight: 1.5 }}>
            Nastąpi reset wszystkich nodów i konfiguracji kampanii.<br />
            <strong style={{ color: '#ef4444' }}>Tej operacji nie można cofnąć.</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={() => setShowResetConfirm(false)}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--color-field-border, #2a2d3a)', background: 'var(--color-field-bg, #1a1d27)', color: 'var(--color-text, #fff)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            Anuluj
          </button>
          <button
            onClick={() => { setShowResetConfirm(false); onConfirm() }}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
          >
            Resetuj
          </button>
        </div>
      </div>
    </div>
  )
}
