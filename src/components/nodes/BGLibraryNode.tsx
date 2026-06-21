'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { BaseNode } from './BaseNode'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { StatusBar } from '@/components/ui/StatusBar'
import type { NodeProps } from '@xyflow/react'
import type { ImageData } from '@/types'

interface BgItem { id: number; name: string; url: string }

export function BGLibraryNode({ id }: NodeProps) {
  const { edges, nodeOutputs, setNodeOutput } = useAppStore()
  const [bgs, setBgs] = useState<BgItem[]>([])
  const [sel, setSel] = useState(0)

  const imageInput = resolveInput<ImageData>(id, 'image', edges, nodeOutputs)

  // Gdy podłączony Image Gen i brak własnych uploadów — użyj wygenerowanego obrazu
  useEffect(() => {
    if (imageInput?.url) {
      if (bgs.length === 0) {
        setNodeOutput(id, { background: { url: imageInput.url, all: [] } })
      }
    }
  }, [imageInput?.url, bgs.length, id, setNodeOutput])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      if (!f.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = ev => {
        setBgs(prev => {
          const next = [...prev, { id: Date.now() + Math.random(), name: f.name, url: ev.target!.result as string }]
          setNodeOutput(id, { background: { url: next[sel].url, all: next } })
          return next
        })
      }
      reader.readAsDataURL(f)
    })
  }

  const selectBg = (i: number) => {
    setSel(i)
    setNodeOutput(id, { background: { url: bgs[i].url, all: bgs } })
  }

  const activeUrl = bgs.length > 0 ? bgs[sel].url : imageInput?.url

  return (
    <BaseNode id={id} nodeType="bgLibraryNode">
      <PortIndicator label="Image Gen (opt.)" connected={!!imageInput} />

      <label style={{ cursor: 'pointer' }}>
        <div
          style={{
            border: '1px dashed var(--color-field-border)',
            borderRadius: 6,
            padding: '10px 8px',
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            transition: 'border-color .12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-input)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-field-border)')}
        >
          + Wgraj tła (PNG/JPG)
        </div>
        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </label>

      {/* Uploaded backgrounds */}
      {bgs.length > 0 && (
        <div className="image-grid">
          {bgs.slice(0, 4).map((bg, i) => (
            <div key={bg.id} className={`image-thumb${i === sel ? ' selected' : ''}`} onClick={() => selectBg(i)}>
              <img src={bg.url} alt={bg.name} />
              {i === sel && <span className="image-selected-badge">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Preview + save button for image from Image Gen */}
      {imageInput?.url && (
        <div>
          {bgs.length === 0 && (
            <div className="canvas-wrap">
              <img src={imageInput.url} alt="z Image Gen" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            onClick={() => {
              const url = imageInput.url
              setBgs(prev => {
                const next = [...prev, { id: Date.now(), name: `gen-${prev.length + 1}`, url }]
                setSel(next.length - 1)
                setNodeOutput(id, { background: { url, all: next } })
                return next
              })
            }}
          >
            + Zapisz do biblioteki
          </button>
        </div>
      )}

      <StatusBar
        status={activeUrl ? 'done' : 'idle'}
        message={
          bgs.length > 0 ? `${bgs.length} teł · #${sel + 1}` :
          imageInput?.url ? 'tło z Image Gen' :
          'brak teł'
        }
      />
    </BaseNode>
  )
}
