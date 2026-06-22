'use client'
import { useState, useEffect } from 'react'
import { Zap, ImageIcon } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { BaseNode } from './BaseNode'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { StatusBar } from '@/components/ui/StatusBar'
import { PasswordModal } from '@/components/PasswordModal'
import type { NodeProps } from '@xyflow/react'
import type { PromptData, StyleData, NodeStatus, CopyGroupData, HeadlineData } from '@/types'

export function ImageGenNode({ id }: NodeProps) {
  const edges         = useAppStore(s => s.edges)
  const nodeOutputs   = useAppStore(s => s.nodeOutputs)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const addToast      = useAppStore(s => s.addToast)
  const addToHistory  = useAppStore(s => s.addToHistory)
  const [images,   setImages]   = useState<string[]>([])
  const [selected, setSelected] = useState(0)
  const [status,   setStatus]   = useState<NodeStatus>('idle')
  const [errMsg,   setErrMsg]   = useState('')
  const [count,    setCount]    = useState(1)
  const [showAuth, setShowAuth] = useState(false)
  const [authed,   setAuthed]   = useState(false)

  const prompt         = resolveInput<PromptData>(id,     'prompt',    edges, nodeOutputs)
  const style          = resolveInput<StyleData>(id,      'style',     edges, nodeOutputs)
  const copy           = resolveInput<CopyGroupData>(id,  'copyGroup', edges, nodeOutputs)
  const directHeadline = resolveInput<HeadlineData>(id,   'headline',  edges, nodeOutputs)
  const canGen = !!prompt

  // Check existing session on mount
  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(({ authenticated }) => {
      if (authenticated) setAuthed(true)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (images.length > 0) {
      setNodeOutput(id, { image: { url: images[selected], index: selected } })
    }
  }, [images, selected, id, setNodeOutput])

  const handleGenerate = async () => {
    setStatus('running')
    setErrMsg('')
    const urls: string[] = []

    const headline = copy?.headline ?? directHeadline
    const contextSuffix = headline?.main
      ? `. Banner headline: "${headline.main}"${headline.sub ? `, "${headline.sub}"` : ''}${copy?.cta?.text ? `, CTA: "${copy.cta.text}"` : ''}`
      : ''
    const enhancedPromptText = (prompt?.text ?? '') + contextSuffix

    for (let i = 0; i < count; i++) {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptText: enhancedPromptText, tone: prompt!.tone }),
        })
        const json = await res.json() as { dataUrl?: string; error?: string }
        if (res.status === 401) {
          setAuthed(false)
          setShowAuth(true)
          setStatus('idle')
          return
        }
        if (!res.ok || !json.dataUrl) throw new Error(json.error ?? 'Błąd generowania')
        urls.push(json.dataUrl)
        addToHistory(json.dataUrl, prompt!.text)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Nieznany błąd'
        setErrMsg(msg)
        setStatus('error')
        return
      }
    }

    setImages(prev => [...urls, ...prev].slice(0, 8))
    setSelected(0)
    setStatus('done')
    addToast({ type: 'success', message: `✓ Wygenerowano ${count} ${count === 1 ? 'grafikę' : 'grafiki'}` })
  }

  const handleClick = () => {
    if (!authed) { setShowAuth(true); return }
    handleGenerate()
  }

  const handleAuthSuccess = () => {
    setAuthed(true)
    setShowAuth(false)
    handleGenerate()
  }

  return (
    <BaseNode id={id} nodeType="imageGenNode">
      {showAuth && (
        <PasswordModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      <PortIndicator label="Prompt" connected={!!prompt} detail={prompt?.tone} />
      <PortIndicator label="Style"  connected={!!style}  detail={style?.format} />
      {(copy?.headline?.main || directHeadline?.main) && (
        <div style={{ fontSize: 9, color: '#3DFFA0', marginBottom: 4 }}>✓ kontekst banera</div>
      )}

      <div className="field-row">
        <div>
          <div className="field-label">Liczba</div>
          <select className="field-select" value={count} onChange={e => setCount(Number(e.target.value))}>
            <option value={1}>1</option><option value={2}>2</option>
            <option value={3}>3</option><option value={4}>4</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!canGen || status === 'running'}
            onClick={handleClick}
          >
            {status === 'running'
              ? <><div className="gen-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Gen...</>
              : <><Zap size={13} strokeWidth={1.75} style={{ marginRight: 5 }} /> Generuj</>
            }
          </button>
        </div>
      </div>

      {status === 'idle' && images.length === 0 && (
        <div className="gen-placeholder">
          <ImageIcon size={28} strokeWidth={1.25} style={{ opacity: 0.35 }} />
          <span>{canGen ? 'Kliknij Generuj' : 'Podłącz Prompt'}</span>
        </div>
      )}
      {status === 'running' && (
        <div className="gen-placeholder">
          <div className="gen-spinner" />
          <span>Gemini generuje...</span>
        </div>
      )}
      {status === 'error' && (
        <div className="gen-placeholder" style={{ borderColor: '#FF4A4A66' }}>
          <span style={{ fontSize: 20 }}>⚠</span>
          <span style={{ color: '#FF6B6B', textAlign: 'center', fontSize: 10, padding: '0 8px' }}>{errMsg}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setStatus('idle')}>Spróbuj ponownie</button>
        </div>
      )}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((url, i) => (
            <div key={i} className={`image-thumb${i === selected ? ' selected' : ''}`} onClick={() => setSelected(i)}>
              <img src={url} alt={`gen ${i + 1}`} />
              {i === selected && <span className="image-selected-badge">✓</span>}
            </div>
          ))}
        </div>
      )}

      <StatusBar
        status={status === 'error' ? 'error' : status === 'running' ? 'running' : images.length > 0 ? 'done' : 'idle'}
        message={
          status === 'error'   ? 'błąd generowania' :
          status === 'running' ? 'generowanie...' :
          images.length > 0    ? `${images.length} grafik · #${selected + 1}` :
          'oczekuje'
        }
      />
    </BaseNode>
  )
}
