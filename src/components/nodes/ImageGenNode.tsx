'use client'
// ═══════════════════════════════════════════════
// IMAGE GEN NODE — generowanie grafik przez Imagen 3
// Własny prompt textarea → /api/generate-image → image output
// ═══════════════════════════════════════════════
import { useState } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'

type Status = 'idle' | 'running' | 'done' | 'error'

const ASPECT_OPTIONS = [
  { value: '1:1',  label: '1:1' },
  { value: '4:3',  label: '4:3' },
  { value: '3:4',  label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
]

export function ImageGenNode({ id }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const addToast      = useAppStore(s => s.addToast)

  const [prompt,     setPrompt]     = useState('')
  const [aspect,     setAspect]     = useState('1:1')
  const [status,     setStatus]     = useState<Status>('idle')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function generate() {
    if (!prompt.trim()) { addToast({ type: 'warn', message: 'Wpisz prompt' }); return }
    setStatus('running')
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio: aspect }),
      })
      const data = await res.json() as { imageBase64?: string; mimeType?: string; error?: string }

      if (!res.ok || data.error) {
        setStatus('error')
        setErrorMsg(data.error ?? `HTTP ${res.status}`)
        addToast({ type: 'error', message: data.error ?? 'Błąd generowania' })
        return
      }

      const url = `data:${data.mimeType ?? 'image/png'};base64,${data.imageBase64}`
      setPreviewUrl(url)
      setNodeOutput(id, { image: { url, index: 0 } })
      setStatus('done')
      addToast({ type: 'success', message: 'Grafika gotowa' })
    } catch (e) {
      const msg = String(e)
      setStatus('error')
      setErrorMsg(msg)
      addToast({ type: 'error', message: msg })
    }
  }

  const inputSt: React.CSSProperties = {
    width: '100%', fontSize: 11, padding: '6px 8px', borderRadius: 7,
    border: '1px solid var(--color-field-border)', background: 'var(--color-field-bg)',
    color: 'var(--color-text)', fontFamily: 'var(--font-ui)', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)', marginBottom: 3, display: 'block',
  }

  return (
    <BaseNode id={id} nodeType="imageGenNode">
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Prompt */}
        <div>
          <label style={labelSt}>Prompt grafiki</label>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            style={{ ...inputSt, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="np. minimalistyczne tło gradientowe niebiesko-fioletowe, nowoczesne, profesjonalne, bez tekstu…"
          />
        </div>

        {/* Aspect ratio */}
        <div>
          <label style={labelSt}>Format</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ASPECT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setAspect(opt.value)}
                style={{
                  fontSize: 10, padding: '3px 9px', borderRadius: 5, cursor: 'pointer',
                  border: `1px solid ${aspect === opt.value ? 'var(--color-gen)' : 'var(--color-field-border)'}`,
                  background: aspect === opt.value ? 'rgba(52,211,153,0.12)' : 'transparent',
                  color: aspect === opt.value ? 'var(--color-gen)' : 'var(--color-text-muted)',
                  fontWeight: aspect === opt.value ? 700 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn btn-primary btn-sm"
          onMouseDown={e => e.stopPropagation()}
          onClick={generate}
          disabled={status === 'running'}
          style={{ justifyContent: 'center' }}
        >
          {status === 'running' ? (
            <><div className="gen-spinner" style={{ width: 11, height: 11, borderWidth: 1.5 }} /> Generuję…</>
          ) : status === 'done' ? (
            '↺ Generuj ponownie'
          ) : (
            '✦ Generuj grafikę'
          )}
        </button>

        {/* Error */}
        {status === 'error' && errorMsg && (
          <div style={{
            fontSize: 10, color: '#E54D6A', background: 'rgba(229,77,106,0.08)',
            border: '1px solid rgba(229,77,106,0.2)', borderRadius: 6, padding: '6px 8px',
            wordBreak: 'break-word',
          }}>
            {errorMsg}
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div style={{
            borderRadius: 8, overflow: 'hidden',
            border: '1px solid var(--color-field-border)',
          }}>
            <img
              src={previewUrl}
              alt="Wygenerowana grafika"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{
              padding: '4px 8px', fontSize: 9, color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border)', display: 'flex', gap: 4, alignItems: 'center',
            }}>
              <span style={{ color: 'var(--color-gen)' }}>✓</span>
              Imagen 3 · {aspect}
            </div>
          </div>
        )}

        {status === 'idle' && !previewUrl && (
          <div style={{
            padding: '20px 0', textAlign: 'center',
            color: 'var(--color-text-muted)', fontSize: 10, lineHeight: 1.6,
          }}>
            Wpisz prompt i kliknij „Generuj grafikę"<br />
            <span style={{ fontSize: 9, opacity: .7 }}>Powered by Imagen 3</span>
          </div>
        )}
      </div>

      <StatusBar
        status={status}
        message={
          status === 'running' ? 'Generuję przez Imagen 3…' :
          status === 'done'    ? 'Grafika gotowa → BG Library' :
          status === 'error'   ? errorMsg :
                                 'Oczekuje na prompt'
        }
      />
    </BaseNode>
  )
}
