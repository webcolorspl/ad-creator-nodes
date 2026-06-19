'use client'
import { useState, useEffect } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import { validatePromptNode } from '@/lib/validation'
import type { NodeProps } from '@xyflow/react'

export function PromptNode({ id, data }: NodeProps) {
  const { setNodeOutput, setNodeErrors } = useAppStore()
  const d = data as Record<string, unknown>
  const [text,     setText]     = useState((d.text     as string) ?? '')
  const [tone,     setTone]     = useState((d.tone     as string) ?? 'neutral')
  const [lang,     setLang]     = useState((d.lang     as string) ?? 'pl')
  const [variants, setVariants] = useState<string[]>((d.variants as string[]) ?? [])
  const valid = text.trim().length >= 10 && text.length <= 800

  useEffect(() => {
    const errors = validatePromptNode({ text })
    setNodeErrors(id, errors)
    if (!errors.length) {
      setNodeOutput(id, { prompt: { text: text.trim(), tone, lang, variants } })
    }
  }, [text, tone, lang, variants, id, setNodeOutput, setNodeErrors])

  return (
    <BaseNode id={id} nodeType="promptNode">
      <div>
        <div className="field-label">Prompt kampanii <span className="field-required">*</span></div>
        <textarea
          className="field-textarea"
          placeholder="Opisz kampanię: produkt, grupę docelową, nastrój..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span className="field-hint">min 10 znaków</span>
          <span className={`field-charcount${text.length > 800 ? ' over' : ''}`}>{text.length}/800</span>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Ton</div>
          <select className="field-select" value={tone} onChange={e => setTone(e.target.value)}>
            <option value="neutral">Neutralny</option>
            <option value="luxury">Luksusowy</option>
            <option value="casual">Casualowy</option>
            <option value="bold">Odważny</option>
            <option value="minimal">Minimalistyczny</option>
            <option value="playful">Zabawny</option>
          </select>
        </div>
        <div>
          <div className="field-label">Język</div>
          <select className="field-select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="pl">🇵🇱 PL</option>
            <option value="en">🇬🇧 EN</option>
            <option value="de">🇩🇪 DE</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
        </div>
      </div>
      {variants.length > 0 && (
        <div>
          <div className="field-label">Warianty A/B</div>
          <div className="variant-list">
            {variants.map((v, i) => (
              <div key={i} className="variant-chip">
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', minWidth: 16 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <input
                  value={v}
                  placeholder={`Wariant ${String.fromCharCode(65 + i)}...`}
                  onChange={e => setVariants(vs => vs.map((x, j) => j === i ? e.target.value : x))}
                />
                <span className="variant-remove" onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))}>✕</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {variants.length < 4 && (
        <button className="add-variant" onClick={() => setVariants(v => [...v, ''])}>＋ Wariant A/B</button>
      )}
      <StatusBar
        status={valid ? 'done' : 'idle'}
        message={valid ? `${lang.toUpperCase()} · ${tone}` : 'wypełnij prompt'}
      />
    </BaseNode>
  )
}