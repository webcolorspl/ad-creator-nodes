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
  // Try all matching edges in order — return first non-null value (fallback support)
  const matching = edges.filter(
    e => e.target === nodeId && e.targetHandle === portId
  )

  for (const edge of matching) {
    const sourceOutput = nodeOutputs[edge.source]
    if (!sourceOutput) continue

    if (edge.sourceHandle) {
      const val = sourceOutput[edge.sourceHandle as keyof NodeOutputs]
      if (val !== undefined) return val as T
    } else {
      return sourceOutput as unknown as T
    }
  }

  return null
}
