// ═══════════════════════════════════════════════
// AD CREATOR — Edge Resolver
// Funkcja rozwiązująca dane z upstream nodów
// ═══════════════════════════════════════════════
import type { Edge } from '@xyflow/react'
import type { NodeOutputs } from '@/types'

/**
 * Dla danego nodeId i portId przechodzi po krawędziach
 * i zwraca dane wyjściowe połączonego source noda.
 */
export function resolveInput<T>(
  nodeId: string,
  portId: string,
  edges: Edge[],
  nodeOutputs: Record<string, NodeOutputs>
): T | null {
  const edge = edges.find(
    e => e.target === nodeId && e.targetHandle === portId
  )
  if (!edge) return null

  const sourceOutput = nodeOutputs[edge.source]
  if (!sourceOutput) return null

  // Jeśli source ma konkretny port, zwróć jego dane
  if (edge.sourceHandle) {
    const val = sourceOutput[edge.sourceHandle as keyof NodeOutputs]
    return val !== undefined ? (val as T) : null
  }

  return sourceOutput as unknown as T
}
