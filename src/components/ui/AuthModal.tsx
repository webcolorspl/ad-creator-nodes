'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/store/AuthContext'

interface AuthModalProps {
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else onClose()
    } else {
      const { error, needsConfirmation } = await signUp(email, password)
      if (error) setError(error)
      else if (needsConfirmation)
        setSuccess(`Sprawdź skrzynkę ${email} i kliknij link potwierdzający.`)
    }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 8, outline: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        width: 400,
        maxWidth: '92vw',
        padding: '32px 28px 24px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #3A67F0 0%, #7C5CF5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(58,103,240,0.3)',
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>F</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>FlowCampaigns</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 16, color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>
          {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 22 }}>
          {mode === 'login' ? 'Witaj ponownie 👋' : 'Bezpłatne konto — email i hasło'}
        </p>

        {success ? (
          <div style={{
            background: 'rgba(14,168,122,0.1)', borderRadius: 10,
            padding: '20px 16px', textAlign: 'center',
            border: '1px solid rgba(14,168,122,0.3)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
            <p style={{ fontSize: 13, color: 'var(--color-gen)', fontWeight: 600, lineHeight: 1.5 }}>
              {success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
                marginBottom: 5, display: 'block',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Adres email
              </label>
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inp}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(124,92,245,0.6)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <div>
              <label style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
                marginBottom: 5, display: 'block',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Hasło
              </label>
              <input
                type="password"
                placeholder="minimum 6 znaków"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={inp}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(124,92,245,0.6)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#ef4444',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: 8, padding: '10px 14px',
                border: '1px solid rgba(239,68,68,0.25)',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 700,
                marginTop: 4, border: 'none', borderRadius: 8,
                cursor: loading ? 'wait' : 'pointer',
                background: loading
                  ? 'rgba(124,92,245,0.4)'
                  : 'linear-gradient(135deg, #3A67F0 0%, #7C5CF5 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(124,92,245,0.35)',
                transition: 'all .15s',
              }}
            >
              {loading ? 'Proszę czekać...' : mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
            </button>
          </form>
        )}

        {!success && (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 18 }}>
            {mode === 'login' ? 'Nie masz jeszcze konta? ' : 'Masz już konto? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text)', fontWeight: 700, fontSize: 13,
                textDecoration: 'underline',
              }}
            >
              {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </p>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
