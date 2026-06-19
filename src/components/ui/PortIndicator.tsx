'use client'

interface PortIndicatorProps {
  label: string
  connected: boolean
  detail?: string
}

export function PortIndicator({ label, connected, detail }: PortIndicatorProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="field-label" style={{ margin: 0 }}>{label}</span>
      <span className={`port-indicator ${connected ? 'port-connected' : 'port-disconnected'}`}>
        <span>{connected ? '●' : '○'}</span>
        <span>{connected ? (detail ?? 'ok') : 'brak'}</span>
      </span>
    </div>
  )
}
