'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { FlaskConical, KeyRound, Moon, Sun } from '@/lib/icons'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { AuthModal } from '@/components/ui/AuthModal'

export function Topbar() {
  const apiKey              = useAppStore(s => s.apiKey)
  const nodeErrors          = useAppStore(s => s.nodeErrors)
  const genHistory          = useAppStore(s => s.genHistory)
  const setShowApiModal     = useAppStore(s => s.setShowApiModal)
  const setShowTests        = useAppStore(s => s.setShowTests)
  const appMode             = useAppStore(s => s.appMode)
  const setAppMode          = useAppStore(s => s.setAppMode)
  const setShowResetConfirm = useAppStore(s => s.setShowResetConfirm)
  const darkMode       = useAppStore(s => s.darkMode)
  const toggleDarkMode = useAppStore(s => s.toggleDarkMode)
  const totalErrors = Object.values(nodeErrors).reduce((s, e) => s + e.length, 0)

  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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
          onClick={toggleDarkMode}
          title={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
          style={{ padding: '5px 8px' }}
        >
          {darkMode
            ? <Sun  size={13} strokeWidth={1.75} />
            : <Moon size={13} strokeWidth={1.75} />
          }
        </button>
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

        {/* Auth */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowUserMenu(v => !v)}
              style={{ gap: 6, borderColor: 'rgba(124,92,245,0.3)', color: 'var(--color-text)' }}
              title={user.email}
            >
              <User size={12} strokeWidth={1.75} />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email?.split('@')[0]}
              </span>
            </button>
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '4px 0', minWidth: 180,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zalogowany jako</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</div>
                </div>
                <button
                  onClick={() => { signOut(); setShowUserMenu(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', background: 'none', border: 'none',
                    color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={13} strokeWidth={1.75} />
                  Wyloguj się
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowAuthModal(true)}
            style={{ borderColor: 'rgba(124,92,245,0.3)', color: '#7C5CF5', fontWeight: 600 }}
          >
            <LogIn size={12} strokeWidth={1.75} />
            Zaloguj
          </button>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showUserMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowUserMenu(false)} />
      )}
    </header>
  )
}
