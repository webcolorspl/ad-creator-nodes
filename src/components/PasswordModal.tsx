'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export function PasswordModal({ onSuccess, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        setError('Nieprawidłowe hasło')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#1a1a2e', border: '1px solid #2a2a4a',
        borderRadius: 12, padding: '32px 28px', width: 320,
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            🔒 Generowanie obrazów
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Podaj hasło aby odblokować generowanie.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Hasło"
            disabled={loading}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0d0d1a', border: `1px solid ${error ? '#ff4a4a' : '#2a2a4a'}`,
              borderRadius: 8, padding: '10px 12px',
              color: '#fff', fontSize: 14, outline: 'none',
              marginBottom: error ? 8 : 16,
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 16 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #2a2a4a',
                background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer',
              }}
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                flex: 2, padding: '9px', borderRadius: 8, border: 'none',
                background: loading || !password ? '#2a2a4a' : '#2563eb',
                color: loading || !password ? '#555' : '#fff',
                fontSize: 13, fontWeight: 600, cursor: loading || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sprawdzam...' : 'Odblokuj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
