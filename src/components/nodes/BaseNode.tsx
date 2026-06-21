// ═══════════════════════════════════════════════
// AD CREATOR — BaseNode
// ═══════════════════════════════════════════════
'use client'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/appStore'
import { NODE_REGISTRY, PORT_COLORS } from '@/lib/constants'
import { NODE_ICONS, AlertTriangle } from '@/lib/icons'
import '@/styles/nodes.css'

const WIZARD_STEPS: Record<string, number> = {
  xToolsImportNode:   1,
  webImportNode:      1,
  copyVariantsNode:   2,
  promptNode:         2,
  imageGenNode:       3,
  bgLibraryNode:      3,
  bannerComposerNode: 4,
  batchExportNode:    5,
}

interface BaseNodeProps {
  id: string
  nodeType: string
  children: React.ReactNode
}

export function BaseNode({ id, nodeType, children }: BaseNodeProps) {
  const selectNode = useAppStore(s => s.selectNode)
  const selectedId = useAppStore(s => s.selectedId)
  const nodeErrors = useAppStore(s => s.nodeErrors)
  const appMode = useAppStore(s => s.appMode)

  const def     = NODE_REGISTRY[nodeType]
  const errors  = nodeErrors[id] ?? []
  const isSelected = selectedId === id
  const step = appMode === 'marketer' ? WIZARD_STEPS[nodeType] : undefined

  if (!def) return null

  const Icon = NODE_ICONS[nodeType]

  return (
    <div
      className={`node-card type-${nodeType} cat-${def.cat} ${isSelected ? 'selected' : ''}`}
      onClick={() => selectNode(id)}
    >
      {/* Input handles */}
      {def.ins.map((port, i) => (
        <Handle
          key={`in-${port.id}`}
          type="target"
          position={Position.Left}
          id={port.id}
          style={{
            top: `${((i + 1) / (def.ins.length + 1)) * 100}%`,
            background: PORT_COLORS[port.type] ?? '#7A8AB0',
          }}
          title={`${port.id} · ${port.type}`}
        />
      ))}

      {/* Header */}
      <div className="node-header">
        {step !== undefined && (
          <span className="node-step-badge">{step}</span>
        )}
        <span className={`node-icon cat-${def.cat}`}>
          {Icon && <Icon size={15} strokeWidth={1.75} />}
        </span>
        <span className="node-title">{def.label}</span>
        <span className={`node-badge badge-${def.cat}`}>{def.cat}</span>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="node-error-banner">
          <AlertTriangle size={12} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            {errors[0]}
            {errors.length > 1 ? ` +${errors.length - 1}` : ''}
          </span>
        </div>
      )}

      {/* Node content */}
      <div className="node-body">{children}</div>

      {/* Output handles */}
      {def.outs.map((port, i) => (
        <Handle
          key={`out-${port.id}`}
          type="source"
          position={Position.Right}
          id={port.id}
          style={{
            top: `${((i + 1) / (def.outs.length + 1)) * 100}%`,
            background: PORT_COLORS[port.type] ?? '#7A8AB0',
          }}
          title={`${port.id} · ${port.type}`}
        />
      ))}
    </div>
  )
}
