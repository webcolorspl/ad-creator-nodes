'use client'
import { useAppStore } from '@/store/appStore'
import { FlaskConical, KeyRound } from '@/lib/icons'

export function Topbar() {
  const { apiKey, nodeErrors, genHistory, setShowApiModal, setShowTests } = useAppStore()
  const { appMode, setAppMode } = useAppStore(s => ({ appMode: s.appMode, setAppMode: s.setAppMode }))
  const totalErrors = Object.values(nodeErrors).reduce((s, e) => s + e.length, 0)

  return (
    <header className="topbar">
      <span className="topbar-logo">FLOW <span>CAMPAIGNS</span></span>
      <div className="topbar-divider" />
      <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2 }}>
        {(['marketer', 'agency'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setAppMode(mode)}
            style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
              border: 'none', letterSpacing: '.04em',
              background: appMode === mode ? 'var(--color-input)' : 'transparent',
              color: appMode === mode ? '#fff' : 'var(--color-text-muted)',
              transition: 'background .15s, color .15s',
            }}
          >
            {mode === 'marketer' ? 'Marketer' : 'Agencja'}
          </button>
        ))}
      </div>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        v1.0
      </span>
      {totalErrors > 0 && (
        <span className="topbar-badge" style={{ background: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}>
          {totalErrors} {totalErrors === 1 ? 'błąd' : 'błędy'}
        </span>
      )}
      {genHistory.length > 0 && (
        <span className="topbar-badge" style={{ background: '#ECFDF5', color: 'var(--color-gen)', border: '1px solid #A7F3D0' }}>
          {genHistory.length} gen.
        </span>
      )}
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setShowTests(true)}>
          <FlaskConical size={13} strokeWidth={1.75} />
          Testy
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowApiModal(true)}>
          <KeyRound size={13} strokeWidth={1.75} />
          {apiKey ? 'API ✓' : 'API Key'}
        </button>
      </div>
    </header>
  )
}
