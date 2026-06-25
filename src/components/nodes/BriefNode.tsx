'use client'
// ═══════════════════════════════════════════════
// BRIEF NODE — brief kampanii + generowanie wariantów AI
// ═══════════════════════════════════════════════
import { useState } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'
import type { NodeStatus, HeadlineCTAVariant, ProposalsData } from '@/types'

const AGE_OPTIONS = ['wszystkie', '18–24', '25–35', '35–50', '50+']
const GENDER_OPTIONS = ['wszyscy', 'kobiety', 'mężczyźni']
const TONE_OPTIONS = [
  { id: 'formalny',      label: 'Formalny' },
  { id: 'luźny',         label: 'Luźny' },
  { id: 'premium',       label: 'Premium' },
  { id: 'humorystyczny', label: 'Humor' },
  { id: 'bold',          label: 'Bold' },
]

export function BriefNode({ id }: NodeProps) {
  const campaign      = useAppStore(s => s.campaign)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)
  const setNodeErrors = useAppStore(s => s.setNodeErrors)
  const addToast      = useAppStore(s => s.addToast)

  const [product,  setProduct]  = useState('')
  const [keywords, setKeywords] = useState('')
  const [url,      setUrl]      = useState('')
  const [age,      setAge]      = useState('wszystkie')
  const [gender,   setGender]   = useState('wszyscy')
  const [tone,     setTone]     = useState('luźny')
  const [status,   setStatus]   = useState<NodeStatus>('idle')
  const [errMsg,   setErrMsg]   = useState('')
  const [count,    setCount]    = useState(0)

  const canGenerate = product.trim().length > 2

  async function generate(extra = 0) {
    if (!campaign || !canGenerate) return
    setStatus('running')
    setErrMsg('')

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          product: product.trim(),
          keywords: keywords.trim(),
          url: url.trim() || undefined,
          age,
          gender,
          tone,
          count: extra > 0 ? extra : 4,
        }),
      })

      const data = await res.json() as { variants?: HeadlineCTAVariant[]; error?: string }

      if (!res.ok || data.error || !data.variants?.length) {
        throw new Error(data.error ?? 'Brak wariantów w odpowiedzi')
      }

      const current = extra > 0
        ? ((useAppStore.getState().nodeOutputs[id]?.proposals as ProposalsData | undefined)?.variants ?? [])
        : []

      const merged: ProposalsData = {
        variants: [...current, ...data.variants],
      }

      setNodeOutput(id, { proposals: merged })
      setNodeErrors(id, [])
      setCount(merged.variants.length)
      setStatus('done')
      addToast({ type: 'success', message: `Wygenerowano ${data.variants.length} wariantów` })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrMsg(msg)
      setStatus('error')
      setNodeErrors(id, [msg])
      addToast({ type: 'error', message: `Brief: ${msg.slice(0, 60)}` })
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: 11, padding: '6px 8px', borderRadius: 7,
    border: '1px solid var(--color-field-border)',
    background: 'var(--color-field-bg)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
    textTransform: 'uppercase', color: 'var(--color-text-muted)',
    marginBottom: 3, display: 'block',
  }

  const TYPE_LABELS: Record<string, string> = {
    brand: 'Brand Awareness', performance: 'Performance', leads: 'Lead Generation',
    launch: 'Product Launch', seasonal: 'Seasonal', remarketing: 'Remarketing',
  }

  return (
    <BaseNode id={id} nodeType="briefNode">
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Campaign context badge */}
        {campaign && (
          <div style={{
            display: 'flex', gap: 4, flexWrap: 'wrap',
            padding: '6px 8px', borderRadius: 8,
            background: 'rgba(58,103,240,0.06)',
            border: '1px solid rgba(58,103,240,0.15)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-input)', letterSpacing: '.04em' }}>
              {TYPE_LABELS[campaign.type] ?? campaign.type}
            </span>
            {campaign.goals.map(g => (
              <span key={g} style={{ fontSize: 9, color: 'var(--color-text-muted)', background: 'var(--color-field-bg)', borderRadius: 3, padding: '1px 4px' }}>
                {g}
              </span>
            ))}
          </div>
        )}
        {!campaign && (
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', padding: '4px 0' }}>
            Uruchom najpierw Campaign Setup
          </div>
        )}

        {/* Produkt */}
        <div>
          <label style={labelStyle}>Produkt / Marka <span style={{ color: '#E54D6A' }}>*</span></label>
          <input
            onMouseDown={e => e.stopPropagation()}
            style={inputStyle}
            value={product}
            onChange={e => setProduct(e.target.value)}
            placeholder="Np. Nike Air Max — buty sportowe"
          />
        </div>

        {/* Słowa kluczowe */}
        <div>
          <label style={labelStyle}>Słowa kluczowe</label>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.4 }}
            rows={2}
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="Np. szybkość, styl, limitowana edycja, komfort"
          />
        </div>

        {/* URL */}
        <div>
          <label style={labelStyle}>URL (opcjonalnie)</label>
          <input
            onMouseDown={e => e.stopPropagation()}
            style={inputStyle}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Targeting */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Wiek</label>
            <select
              onMouseDown={e => e.stopPropagation()}
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={age}
              onChange={e => setAge(e.target.value)}
            >
              {AGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Płeć</label>
            <select
              onMouseDown={e => e.stopPropagation()}
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Ton */}
        <div>
          <label style={labelStyle}>Ton</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TONE_OPTIONS.map(t => (
              <button
                key={t.id}
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setTone(t.id)}
                style={{
                  fontSize: 10, fontWeight: tone === t.id ? 600 : 400,
                  padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${tone === t.id ? 'var(--color-input)' : 'var(--color-field-border)'}`,
                  background: tone === t.id ? 'rgba(58,103,240,0.1)' : 'var(--color-field-bg)',
                  color: tone === t.id ? 'var(--color-input)' : 'var(--color-text-muted)',
                  transition: 'all .15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn btn-primary btn-sm"
          disabled={!canGenerate || !campaign || status === 'running'}
          onMouseDown={e => e.stopPropagation()}
          onClick={() => generate(0)}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {status === 'running' ? '⏳ Generuję…' : 'Generuj propozycje →'}
        </button>

        {/* Generate more (shown after first generation) */}
        {count > 0 && status !== 'running' && (
          <button
            className="btn btn-ghost btn-sm"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => generate(4)}
            style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}
          >
            + Generuj więcej (4)
          </button>
        )}

      </div>
      <StatusBar
        status={status}
        message={
          status === 'running' ? 'Generuję warianty AI…' :
          status === 'done'    ? `${count} wariantów gotowych` :
          status === 'error'   ? errMsg.slice(0, 50) :
          'Wypełnij produkt i kliknij Generuj'
        }
      />
    </BaseNode>
  )
}
