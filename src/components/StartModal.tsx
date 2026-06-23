'use client'
import { useAppStore } from '@/store/appStore'

export function StartModal() {
  const showStartModal   = useAppStore(s => s.showStartModal)
  const setShowStartModal = useAppStore(s => s.setShowStartModal)

  if (!showStartModal) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--color-canvas, #0d0f14)',
        border: '1px solid var(--color-field-border, #2a2d3a)',
        borderRadius: 16, padding: '48px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
        maxWidth: 560, width: '90%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-process, #6366f1)', textTransform: 'uppercase', marginBottom: 8 }}>FLOW</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text, #fff)', letterSpacing: '-0.02em' }}>CAMPAIGNS</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted, #6b7280)', marginTop: 8 }}>Zaprojektuj kampanię reklamową krok po kroku</div>
        </div>

        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
          <button
            onClick={() => setShowStartModal(false)}
            style={{
              flex: 1, padding: '20px 16px',
              background: 'var(--color-process, #6366f1)',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontSize: 28 }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Zacznij od zera</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.4 }}>Skonfiguruj kampanię<br />krok po kroku</span>
          </button>

          <button
            onClick={() => setShowStartModal(false)}
            style={{
              flex: 1, padding: '20px 16px',
              background: 'var(--color-field-bg, #1a1d27)',
              border: '1px solid var(--color-field-border, #2a2d3a)',
              borderRadius: 12, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-process, #6366f1)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-field-border, #2a2d3a)')}
          >
            <span style={{ fontSize: 28 }}>⬆</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text, #fff)' }}>Wgraj propozycję</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted, #6b7280)', textAlign: 'center', lineHeight: 1.4 }}>Importuj z XTools<br />lub wczytaj JSON</span>
          </button>
        </div>
      </div>
    </div>
  )
}
