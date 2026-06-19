'use client'
import { useAppStore } from '@/store/appStore'
import { FlaskConical, KeyRound } from '@/lib/icons'

export function Topbar() {
  const { apiKey, nodeErrors, genHistory, setShowApiModal, setShowTests } = useAppStore()
  const totalErrors = Object.values(nodeErrors).reduce((s, e) => s + e.length, 0)

  return (
    <header className="topbar">
      <span className="topbar-logo">FLOW <span>CAMPAIGNS</span></span>
      <div className="topbar-divider" />
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
