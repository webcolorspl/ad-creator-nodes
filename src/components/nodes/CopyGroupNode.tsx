'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { BaseNode } from './BaseNode'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { StatusBar } from '@/components/ui/StatusBar'
import type { NodeProps } from '@xyflow/react'
import type { PromptData, HeadlineData, CTAData } from '@/types'

export function CopyGroupNode({ id }: NodeProps) {
  const edges         = useAppStore(s => s.edges)
  const nodeOutputs   = useAppStore(s => s.nodeOutputs)
  const setNodeOutput = useAppStore(s => s.setNodeOutput)

  const p = resolveInput<PromptData>(id,   'prompt',   edges, nodeOutputs)
  const h = resolveInput<HeadlineData>(id, 'headline', edges, nodeOutputs)
  const c = resolveInput<CTAData>(id,      'cta',      edges, nodeOutputs)
  const ok = !!p && !!h && !!c

  useEffect(() => {
    if (ok) setNodeOutput(id, { copyGroup: { prompt: p!, headline: h!, cta: c! } })
    else    setNodeOutput(id, {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ p, h, c }), id])

  return (
    <BaseNode id={id} nodeType="copyGroupNode">
      <PortIndicator label="Prompt"   connected={!!p} />
      <PortIndicator label="Headline" connected={!!h} />
      <PortIndicator label="CTA"      connected={!!c} />
      <div className="field-divider" />
      {ok ? (
        <div style={{ background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', minWidth: 50 }}>hasło</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{h!.main}{h!.sub ? ` · ${h!.sub}` : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', minWidth: 50 }}>cta</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{c!.text} [{c!.style}]</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', minWidth: 50 }}>ton</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{p!.tone} · {p!.lang?.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '8px 0' }}>
          Podłącz Prompt + Headline + CTA
        </div>
      )}
      <StatusBar
        status={ok ? 'done' : 'idle'}
        message={ok ? 'copy group gotowy' : `${[!!p, !!h, !!c].filter(Boolean).length}/3 połączeń`}
      />
    </BaseNode>
  )
}
