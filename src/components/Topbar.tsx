'use client'
import { useAppStore } from '@/store/appStore'
import { FlaskConical, KeyRound } from '@/lib/icons'

export function Topbar() {
  const apiKey              = useAppStore(s => s.apiKey)
  const nodeErrors          = useAppStore(s => s.nodeErrors)
  const genHistory          = useAppStore(s => s.genHistory)
  const setShowApiModal     = useAppStore(s => s.setShowApiModal)
  const setShowTests        = useAppStore(s => s.setShowTests)
  const appMode             = useAppStore(s => s.appMode)
  const setAppMode          = useAppStore(s => s.setAppMode)
  const setShowResetConfirm = useAppStore(s => s.setShowResetConfirm)
  const totalErrors = Object.values(nodeErrors).reduce((s, e) => s + e.length, 0)

  return (
    <header className="topbar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #3A67F0 0%, #7C5CF5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(58,103,240,0.3)',
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-.02em' }}>F</span>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '.01em', lineHeight: 1.2 }}>
            Flow<span style={{ color: 'var(--blue-500)' }}>Campaigns</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '.04em' }}>
            v1.0
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="topbar-divider" />

      {/* Mode switcher */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'rgba(244,247,255,0.8)',
        border: '1px solid rgba(210,220,250,0.5)',
        borderRadius: 12, padding: '3px',
      }}>
        {(['marketer', 'agency'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setAppMode(mode)}
            style={{
              fontSize: 10, fontWeight: 600, padding: '4px 12px', borderRadius: 9,
              cursor: 'pointer', border: 'none', letterSpacing: '.03em',
              background: appMode === mode
                ? 'linear-gradient(135deg, #3A67F0 0%, #7C5CF5 100%)'
                : 'transparent',
              color: appMode === mode ? '#fff' : 'var(--color-text-muted)',
              boxShadow: appMode === mode ? '0 2px 6px rgba(58,103,240,0.28)' : 'none',
              transition: 'all .18s cubic-bezier(0.34,1.4,0.64,1)',
            }}
          >
            {mode === 'marketer' ? 'Marketer' : 'Agencja'}
          </button>
        ))}
      </div>

      {/* Status badges */}
      {totalErrors > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
          background: 'rgba(255,245,245,0.9)', color: '#DC2626',
          border: '1px solid rgba(254,202,202,0.7)',
        }}>
          {totalErrors} {totalErrors === 1 ? 'błąd' : 'błędy'}
        </span>
      )}
      {genHistory.length > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
          background: 'rgba(14,168,122,.1)', color: 'var(--color-gen)',
          border: '1px solid rgba(14,168,122,.2)',
        }}>
          {genHistory.length} gen.
        </span>
      )}

      {/* Actions */}
      <div className="topbar-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowResetConfirm(true)}
          style={{ color: '#ef4444', borderColor: 'rgba(254,202,202,0.6)' }}
        >
          ↺ Reset
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowTests(true)}>
          <FlaskConical size={12} strokeWidth={1.75} />
          Testy
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowApiModal(true)}
          style={apiKey ? { borderColor: 'rgba(14,168,122,.3)', color: 'var(--color-gen)' } : {}}
        >
          <KeyRound size={12} strokeWidth={1.75} />
          {apiKey ? 'API ✓' : 'API Key'}
        </button>
      </div>
    </header>
  )
}
