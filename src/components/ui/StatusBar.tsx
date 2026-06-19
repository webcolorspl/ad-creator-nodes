'use client'
import type { NodeStatus } from '@/types'

interface StatusBarProps {
  status: NodeStatus
  message: string
}

export function StatusBar({ status, message }: StatusBarProps) {
  return (
    <div className={`node-status status-${status}`}>
      <span className="status-dot" />
      <span>{message}</span>
    </div>
  )
}
