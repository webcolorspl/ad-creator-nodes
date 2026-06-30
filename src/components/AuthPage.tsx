'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'

// ── Theme (identyczny z WelcomeScreen) ───────────────────────
function theme(dark: boolean) {
  return dark ? {
    bg:          '#07070b',
    dotColor:    'rgba(255,255,255,0.05)',
    text:        '#ffffff',
    textSub:     'rgba(255,255,255,0.82)',
    textMuted:   'rgba(255,255,255,0.55)',
    textFaint:   'rgba(255,255,255,0.28)',
    cardBg:      'rgba(255,255,255,0.03)',
    cardBorder:  'rgba(255,255,255,0.1)',
    inputBg:     'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputFocus:  'rgba(22,163,74,0.6)',
    labelColor:  'rgba(255,255,255,0.45)',
    toggleBg:    'rgba(255,255,255,0.08)',
    toggleBorder:'rgba(255,255,255,0.2)',
    linkColor:   'rgba(255,255,255,0.6)',
    linkHover:   '#fff',
    vignette:    'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, #07070b 100%)',
  } : {
    bg:          '#f4f4f7',
    dotColor:    'rgba(0,0,0,0.06)',
    text:        '#0f0f12',
    textSub:     '#3a3a4a',
    textMuted:   '#6b6b80',
    textFaint:   '#aaaabc',
    cardBg:      'rgba(255,255,255,0.85)',
    cardBorder:  'rgba(0,0,0,0.1)',
    inputBg:     '#fff',
    inputBorder: 'rgba(0,0,0,0.15)',
    inputFocus:  'rgba(22,163,74,0.7)',
    labelColor:  '#6b6b80',
    toggleBg:    'rgba(0,0,0,0.07)',
    toggleBorder:'rgba(0,0,0,0.15)',
    linkColor:   '#6b6b80',
    linkHover:   '#0f0f12',
    vignette:    'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, #f4f4f7 100%)',
  }
}

interface AuthPageProps {
  mode: 'register' | 'login'
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [dark, setDark] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState<string | null>(null)
  const [focusField, setFocusField] = useState<string | null>(null)

  const t = theme(dark)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setLoading(false) }
      else router.replace('/composer')
    } else {
      const { error, needsConfirmation } = await signUp(email, password)
      setLoading(false)
      if (error) setError(error)
      else if (needsConfirmation)
        setSuccess(`Sprawdź skrzynkę ${email} i kliknij link potwierdzający.`)
    }
  }

  const inp = (field: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', fontSize: 15,
    border: `1.5px solid ${focusField === field ? t.inputFocus : t.inputBorder}`,
    borderRadius: 10, outline: 'none',
    background: t.inputBg,
    color: t.text,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color .15s',
  })

  const isRegister = mode === 'register'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: t.bg,
      backgroundImage: `radial-gradient(circle, ${t.dotColor} 1px, transparent 1px)`,
      backgroundSize: '28px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      transition: 'background .3s',
    }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: t.vignette, transition: 'background .3s',
      }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: 28, zIndex: 2 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 28, fontWeight: 900, color: dark ? '#fff' : '#0f0f12',
            letterSpacing: '-0.03em', lineHeight: 1,
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}>
            XTOOLS<span style={{ color: '#16a34a' }}>.PL</span>
          </span>
        </a>
      </div>

      {/* Dark/light toggle */}
      <button
        onClick={() => setDark(d => !d)}
        style={{
          position: 'absolute', top: 24, right: 24, zIndex: 2,
          height: 36, borderRadius: 18,
          border: `1.5px solid ${t.toggleBorder}`,
          background: t.toggleBg,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
          transition: 'all .2s',
        }}
      >
        {dark
          ? <Sun  size={15} strokeWidth={2} color="#facc15" />
          : <Moon size={15} strokeWidth={2} color="#6366f1" />
        }
        <span style={{ fontSize: 12, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', letterSpacing: '0.02em' }}>
          {dark ? 'Jasny' : 'Ciemny'}
        </span>
      </button>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 440, maxWidth: '92vw',
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 24,
        padding: '44px 40px 36px',
        boxShadow: dark
          ? '0 24px 80px rgba(0,0,0,0.6)'
          : '0 16px 60px rgba(0,0,0,0.12)',
        backdropFilter: dark ? 'blur(20px)' : 'none',
        transition: 'background .3s, border-color .3s',
      }}>
        {success ? (
          /* ── Success screen ── */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 10 }}>
              Sprawdź skrzynkę
            </h2>
            <p style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.6, marginBottom: 28 }}>
              {success}
            </p>
            <a
              href="/"
              style={{
                fontSize: 13, color: t.linkColor, textDecoration: 'none', fontWeight: 600,
              }}
            >
              ← Wróć na stronę główną
            </a>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{
                fontSize: 28, fontWeight: 900, color: t.text,
                letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.1,
              }}>
                {isRegister ? 'Załóż konto' : 'Zaloguj się'}
                <br />
                <span style={{ color: '#16a34a' }}>
                  {isRegister ? 'i zacznij tworzyć.' : 'i wróć do pracy.'}
                </span>
              </h1>
              <p style={{ fontSize: 14, color: t.textMuted, marginTop: 10 }}>
                {isRegister
                  ? 'Bezpłatne konto — tylko email i hasło.'
                  : 'Witaj ponownie 👋'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: t.labelColor,
                  marginBottom: 6, display: 'block',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Adres email
                </label>
                <input
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inp('email')}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                />
              </div>
              <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: t.labelColor,
                  marginBottom: 6, display: 'block',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
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
                  style={inp('password')}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              {error && (
                <div style={{
                  fontSize: 13, color: '#ef4444',
                  background: 'rgba(239,68,68,0.1)',
                  borderRadius: 8, padding: '10px 14px',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', fontSize: 15, fontWeight: 800,
                  marginTop: 4, border: 'none', borderRadius: 12,
                  cursor: loading ? 'wait' : 'pointer',
                  background: loading
                    ? 'rgba(22,163,74,0.4)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.4)',
                  transition: 'all .15s',
                }}
              >
                {loading
                  ? 'Proszę czekać...'
                  : isRegister ? 'Zarejestruj się →' : 'Zaloguj się →'
                }
              </button>
            </form>

            {/* Switch mode */}
            <p style={{
              fontSize: 13, color: t.textMuted, textAlign: 'center', marginTop: 24,
            }}>
              {isRegister ? 'Masz już konto? ' : 'Nie masz jeszcze konta? '}
              <a
                href={isRegister ? '/logowanie' : '/rejestracja'}
                style={{
                  color: t.text, fontWeight: 700, textDecoration: 'underline',
                }}
              >
                {isRegister ? 'Zaloguj się' : 'Zarejestruj się'}
              </a>
            </p>

            {/* Back */}
            <p style={{ fontSize: 12, color: t.textFaint, textAlign: 'center', marginTop: 12 }}>
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                ← Wróć na stronę główną
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
