// ═══════════════════════════════════════════════
// AD CREATOR — groupLayout
// Grid layout helper for BannerGroupNode.
// COLS derived from group width; HEIGHT auto-fits rows.
// ═══════════════════════════════════════════════
import type { Node } from '@xyflow/react'

export const GRID_PAD = 20   // inner padding (left/right/bottom)
export const GRID_GAP = 16   // gap between cells
export const GRID_TOP = 44   // reserved for title label

/** How many columns fit in groupW given member width. Always ≥ 1. */
export function colsFromWidth(groupW: number, memberW: number): number {
  return Math.max(1, Math.floor((groupW - GRID_PAD * 2 + GRID_GAP) / (memberW + GRID_GAP)))
}

/** Minimum group width to fit at least 1 column of the given member width. */
export function minGroupWidth(memberW: number): number {
  return GRID_PAD * 2 + memberW
}

export interface GridResult {
  /** Absolute canvas position for each member id */
  positions: Map<string, { x: number; y: number }>
  /** Group width — unchanged from input (user-controlled via resize) */
  groupW: number
  /** Calculated group height to exactly fit all rows */
  groupH: number
}

/**
 * Compute grid positions for `members` inside a group.
 * - Sorts members by Y then X (reading order) to determine slot assignment.
 * - groupW is kept as-is; groupH is recalculated.
 */
export function computeGridLayout(
  members: Node[],
  groupPos: { x: number; y: number },
  groupW: number,
): GridResult {
  if (!members.length) {
    return { positions: new Map(), groupW, groupH: GRID_TOP + GRID_PAD * 2 }
  }

  const maxMemberW = Math.max(
    ...members.map(m => (m as { measured?: { width?: number } }).measured?.width ?? 300)
  )

  const cols = colsFromWidth(groupW, maxMemberW)

  // Sort by reading order: top→bottom, left→right
  const sorted = [...members].sort((a, b) => {
    const dy = a.position.y - b.position.y
    if (dy !== 0) return dy
    return a.position.x - b.position.x
  })

  // Max height per row (to handle slaves of different heights)
  const numRows = Math.ceil(sorted.length / cols)
  const rowHeights: number[] = Array(numRows).fill(0)
  for (let i = 0; i < sorted.length; i++) {
    const row = Math.floor(i / cols)
    const mH = (sorted[i] as { measured?: { height?: number } }).measured?.height ?? 400
    rowHeights[row] = Math.max(rowHeights[row], mH)
  }

  // Cumulative Y offset per row
  const rowY: number[] = Array(numRows).fill(0)
  rowY[0] = GRID_TOP + GRID_PAD
  for (let r = 1; r < numRows; r++) {
    rowY[r] = rowY[r - 1] + rowHeights[r - 1] + GRID_GAP
  }

  // Absolute positions
  const positions = new Map<string, { x: number; y: number }>()
  for (let i = 0; i < sorted.length; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    positions.set(sorted[i].id, {
      x: groupPos.x + GRID_PAD + col * (maxMemberW + GRID_GAP),
      y: groupPos.y + rowY[row],
    })
  }

  const lastRow = numRows - 1
  const groupH = rowY[lastRow] + rowHeights[lastRow] + GRID_PAD

  return { positions, groupW, groupH }
}
