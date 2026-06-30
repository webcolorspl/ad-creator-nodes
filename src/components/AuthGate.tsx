'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/store/AuthContext'

const PORTAL_ID = 'auth-gate-portal'
const OVERLAY_ID = 'auth-gate-overlay'

function AuthOverlay({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [focus, setFocus]       = useState<string | null>(null)
  const { signIn }              = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) { setError(error); setLoading(false) }
    // success → middleware/AuthContext wyczyszczą overlay automatycznie
  }

  const inp = (field: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', fontSize: 15,
    border: `1.5px solid ${focus === field ? 'rgba(22,163,74,0.7)' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: 10, outline: 'none',
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color .15s',
  })

  return (
    <div
      id={OVERLAY_ID}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2147483647,
        background: 'rgba(5,5,10,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Blokada pointer-events na wszystkim poza modalem */}
      <style>{`
        #${OVERLAY_ID} * { box-sizing: border-box; }
      `}</style>

      <div style={{
        width: 420, maxWidth: '92vw',
        background: 'rgba(18,18,24,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '44px 40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
            XTOOLS<span style={{ color: '#16a34a' }}>.PL</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Zaloguj się, aby kontynuować
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Dostęp do narzędzia wymaga konta XTOOLS.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email
            </label>
            <input
              type="email" placeholder="twoj@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required style={inp('email')}
              onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Hasło
            </label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6} style={inp('password')}
              onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: '#f87171', fontWeight: 500,
              background: 'rgba(239,68,68,0.1)', borderRadius: 8,
              padding: '10px 14px', border: '1px solid rgba(239,68,68,0.2)',
            }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              padding: '14px', fontSize: 15, fontWeight: 800,
              border: 'none', borderRadius: 12, marginTop: 4,
              cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'rgba(22,163,74,0.4)' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.4)',
              transition: 'all .15s',
            }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 22 }}>
          Nie masz konta?{' '}
          <a href={`/rejestracja?redirect=${redirectTo}`} style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
            Zarejestruj się za darmo
          </a>
        </p>
      </div>
    </div>
  )
}

interface AuthGateProps {
  children: React.ReactNode
  redirectTo: string
}

export function AuthGate({ children, redirectTo }: AuthGateProps) {
  const { user, loading } = useAuth()
  const [show, setShow]   = useState(false)
  const [mounted, setMounted] = useState(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [, forceRender] = useState(0)

  // Montowanie po stronie klienta
  useEffect(() => { setMounted(true) }, [])

  // Pokaż overlay po 1 sekundzie jeśli brak sesji
  useEffect(() => {
    if (loading) return
    if (user) { setShow(false); return }

    timerRef.current = setTimeout(() => setShow(true), 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [user, loading])

  // Anti-tamper: MutationObserver + interval
  useEffect(() => {
    if (!show || !mounted) return

    // Upewnij się że portal istnieje
    let portal = document.getElementById(PORTAL_ID) as HTMLDivElement | null
    if (!portal) {
      portal = document.createElement('div')
      portal.id = PORTAL_ID
      document.body.appendChild(portal)
    }
    portalRef.current = portal

    // MutationObserver — przywróć jeśli usunięty
    observerRef.current = new MutationObserver(() => {
      const stillThere = document.getElementById(PORTAL_ID)
      const overlay    = document.getElementById(OVERLAY_ID)
      if (!stillThere || !overlay) {
        if (!document.getElementById(PORTAL_ID)) {
          const div = document.createElement('div')
          div.id = PORTAL_ID
          document.body.appendChild(div)
          portalRef.current = div
        }
        forceRender(n => n + 1)
      }
    })
    observerRef.current.observe(document.body, { childList: true, subtree: true })

    // Interval — sprawdź widoczność co 300ms
    intervalRef.current = setInterval(() => {
      const overlay = document.getElementById(OVERLAY_ID)
      if (!overlay) { forceRender(n => n + 1); return }
      const style = window.getComputedStyle(overlay)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        overlay.style.cssText = ''
        forceRender(n => n + 1)
      }
    }, 300)

    return () => {
      observerRef.current?.disconnect()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [show, mounted])

  // Blokuj klawisze kiedy overlay aktywny
  useEffect(() => {
    if (!show) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'F12') || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [show])

  const portalNode = mounted
    ? (document.getElementById(PORTAL_ID) ?? portalRef.current)
    : null

  return (
    <>
      {/* Treść pod spodem — blokujemy interakcję gdy overlay aktywny */}
      <div style={{ pointerEvents: show ? 'none' : 'auto', userSelect: show ? 'none' : 'auto' }}>
        {children}
      </div>

      {/* Overlay przez portal */}
      {show && mounted && portalNode &&
        createPortal(<AuthOverlay redirectTo={redirectTo} />, portalNode)
      }
    </>
  )
}
