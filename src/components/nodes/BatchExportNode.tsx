'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { AD_FORMATS } from '@/lib/constants'
import type { NodeProps } from '@xyflow/react'
import type { BannerData } from '@/types'

const EXPORT_FORMATS = [
  { label: 'FB Post 1:1',       format: '1:1'  },
  { label: 'IG Story 9:16',     format: '9:16' },
  { label: 'Google Display 16:9', format: '16:9' },
  { label: 'Portrait 4:5',     format: '4:5'  },
]

export function BatchExportNode({ id }: NodeProps) {
  const { edges, nodeOutputs, addToast } = useAppStore()
  const [checked, setChecked] = useState([true, true, true, false])
  const banner = resolveInput<BannerData>(id, 'banner', edges, nodeOutputs)

  const exportAll = async () => {
    if (!banner?.dataUrl) return
    const selected = EXPORT_FORMATS.filter((_, i) => checked[i])
    if (!selected.length) { addToast({ type: 'warn', message: 'Wybierz min. 1 format' }); return }

    let exported = 0
    for (const ef of selected) {
      const f = AD_FORMATS.find(x => x.id === ef.format)
      if (!f) continue
      const canvas = document.createElement('canvas')
      canvas.width  = Math.min(f.w, 2000)
      canvas.height = Math.min(f.h, 2000)
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      await new Promise<void>(res => { img.onload = () => res(); img.src = banner.dataUrl })
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.download = `banner-${ef.format.replace(':', 'x')}-${Date.now()}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
      exported++
      await new Promise(r => setTimeout(r, 120))
    }
    addToast({ type: 'success', message: `Pobrano ${exported} formatów` })
  }

  return (
    <BaseNode id={id} nodeType="batchExportNode">
      <div className="field-label">Formaty eksportu</div>
      {EXPORT_FORMATS.map((f, i) => (
        <label key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => setChecked(c => c.map((v, j) => j === i ? !v : v))}
            style={{ accentColor: 'var(--color-output)' }}
          />
          <span style={{ color: 'var(--color-text-subtle)' }}>{f.label}</span>
        </label>
      ))}
      <button
        className="btn"
        style={{ width: '100%', justifyContent: 'center', background: 'var(--color-output)', color: '#fff', fontWeight: 600 }}
        disabled={!banner}
        onClick={exportAll}
      >
        ⬇ Eksportuj {checked.filter(Boolean).length} formatów
      </button>
      <StatusBar status={banner ? 'done' : 'idle'} message={banner ? `gotowy · ${banner.format}` : 'podłącz Banner'} />
    </BaseNode>
  )
}
