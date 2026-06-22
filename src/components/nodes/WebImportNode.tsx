'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import type { NodeProps } from '@xyflow/react'
import type { NodeStatus, WebData } from '@/types'

export function WebImportNode({ id }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const addToast      = useAppStore(s => s.addToast)
  const [url,    setUrl]    = useState('')
  const [status, setStatus] = useState<NodeStatus>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [data,   setData]   = useState<WebData | null>(null)
  const [selImg, setSelImg] = useState(0)

  const handleFetch = async () => {
    if (!url.trim()) return
    setStatus('running')
    setErrMsg('')

    try {
      const res  = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json() as WebData & { error?: string }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Błąd pobierania')

      setData(json)
      setSelImg(0)
      applyOutputs(json, 0)
      setStatus('done')
      addToast({ type: 'success', message: `✓ Pobrano: ${json.title || url}` })
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Nieznany błąd')
      setStatus('error')
    }
  }

  const applyOutputs = (d: WebData, imgIndex: number) => {
    setNodeOutput(id, {
      prompt: {
        text: d.promptText,
        tone: 'neutral',
        lang: 'pl',
      },
      headline: {
        main:     d.headlines[0] ?? d.title ?? '',
        sub:      d.description ?? '',
        variants: d.headlines.slice(1),
      },
      ...(d.images[imgIndex] ? {
        background: { url: d.images[imgIndex], all: [] },
      } : {}),
    })
  }

  const selectImage = (i: number) => {
    setSelImg(i)
    if (data) applyOutputs(data, i)
  }

  return (
    <BaseNode id={id} nodeType="webImportNode">
      <div>
        <div className="field-label">URL strony <span className="field-required">*</span></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="field-input"
            placeholder="https://www.trans.eu/pl/"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
            disabled={!url.trim() || status === 'running'}
            onClick={handleFetch}
          >
            {status === 'running'
              ? <div className="gen-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
              : '↓'
            }
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="node-error-banner">
          <span style={{ fontSize: 11 }}>{errMsg}</span>
        </div>
      )}

      {data && (
        <>
          {/* Propozycje nagłówków */}
          {data.headlines.length > 0 && (
            <div>
              <div className="field-label">Propozycje haseł</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {data.headlines.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      padding: '4px 8px',
                      borderRadius: 5,
                      background: i === 0 ? 'var(--blue-50)' : 'var(--color-field-bg)',
                      border: `1px solid ${i === 0 ? 'var(--blue-200)' : 'var(--color-field-border)'}`,
                      color: i === 0 ? 'var(--blue-600)' : 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                    }}
                    title="Kliknij aby użyć jako główne hasło"
                    onClick={() => {
                      if (!data) return
                      const updated = { ...data, headlines: [h, ...data.headlines.filter((_, j) => j !== i)] }
                      setData(updated)
                      applyOutputs(updated, selImg)
                    }}
                  >
                    {i === 0 && <span style={{ fontSize: 9, fontWeight: 600, marginRight: 4, color: 'var(--blue-400)' }}>GŁÓWNE</span>}
                    {h}
                  </div>
                ))}
              </div>
              <div className="field-hint" style={{ marginTop: 3 }}>Kliknij hasło → ustawia je jako główne</div>
            </div>
          )}

          {/* Tekst */}
          <div>
            <div className="field-label">Pobrana treść</div>
            <div className="inspector-value" style={{ maxHeight: 72, fontSize: 10, lineHeight: 1.5 }}>
              {data.promptText || '(brak tekstu)'}
            </div>
          </div>

          {/* Obrazy */}
          {data.images.length > 0 && (
            <div>
              <div className="field-label">Grafiki ({data.images.length})</div>
              <div className="image-grid">
                {data.images.slice(0, 4).map((imgUrl, i) => (
                  <div
                    key={i}
                    className={`image-thumb${i === selImg ? ' selected' : ''}`}
                    onClick={() => selectImage(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`img ${i + 1}`} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    {i === selImg && <span className="image-selected-badge">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <StatusBar
        status={status === 'error' ? 'error' : status === 'running' ? 'running' : data ? 'done' : 'idle'}
        message={
          status === 'error'   ? 'błąd pobierania' :
          status === 'running' ? 'pobieranie...' :
          data                 ? (data.title || data.url).slice(0, 30) :
          'wpisz URL i kliknij ↓'
        }
      />
    </BaseNode>
  )
}
