'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'

export function ApiKeyModal() {
  const { setApiKey, setShowApiModal } = useAppStore()
  const [key, setKey] = useState('')

  return (
    <div className="modal-overlay" onClick={() => setShowApiModal(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🔑 Gemini API Key</div>
        <div className="modal-subtitle">
          Klucz jest ustawiany jako zmienna środowiskowa <code>GEMINI_API_KEY</code> w Vercel.
          Na lokalnym środowisku dodaj go do pliku <code>.env.local</code>.
        </div>
        <div>
          <div className="field-label">API Key (lokalny test)</div>
          <input
            className="field-input"
            type="password"
            placeholder="AIza..."
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && key && setApiKey(key)}
            autoFocus
          />
          <div className="field-hint">Na Vercel: Settings → Environment Variables → GEMINI_API_KEY</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setShowApiModal(false)}>Zamknij</button>
          <button className="btn btn-primary" onClick={() => key && setApiKey(key)} disabled={!key}>Zapisz lokalnie</button>
        </div>
      </div>
    </div>
  )
}
