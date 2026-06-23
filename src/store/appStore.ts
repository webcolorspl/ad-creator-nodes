// ═══════════════════════════════════════════════
// AD CREATOR — Zustand Store
// Globalny state aplikacji
// ═══════════════════════════════════════════════
import { create } from 'zustand'
import type { Edge } from '@xyflow/react'
import type { Toast, GenHistoryItem, NodeOutputs, HeadlineCTAVariant } from '@/types'

export interface CampaignConfig {
  type: 'brand' | 'performance' | 'leads' | 'launch' | 'seasonal' | 'remarketing'
  goals: string[]
  groups: ('prospecting' | 'remarketing' | 'upsell' | 'seasonal' | 'brand')[]
}

interface AppState {
  // API
  apiKey: string
  setApiKey: (key: string) => void

  // Node data
  nodeOutputs: Record<string, NodeOutputs>
  nodeErrors:  Record<string, string[]>
  setNodeOutput: (id: string, data: NodeOutputs) => void
  setNodeErrors: (id: string, errors: string[]) => void
  deleteNode: (id: string) => void

  // Selection
  selectedId: string | null
  selectNode: (id: string | null) => void

  // Zoom request (sidebar → canvas)
  zoomToId: string | null
  requestZoom: (nodeId: string) => void
  clearZoom: () => void

  // Edges (synced from React Flow for edge resolver)
  edges: Edge[]
  syncEdges: (edges: Edge[]) => void

  // UI
  showApiModal: boolean
  setShowApiModal: (show: boolean) => void
  inspectorTab: 'node' | 'flow' | 'history'
  setInspectorTab: (tab: 'node' | 'flow' | 'history') => void
  showTests: boolean
  setShowTests: (show: boolean) => void
  appMode: 'marketer' | 'agency'
  setAppMode: (mode: 'marketer' | 'agency') => void

  // Floating panels
  panels: {
    left:  { x: number; y: number; minimized: boolean }
    right: { x: number; y: number; minimized: boolean }
    copy:  { x: number; y: number; minimized: boolean }
  }
  setPanelPos: (side: 'left' | 'right' | 'copy', x: number, y: number) => void
  togglePanelMinimized: (side: 'left' | 'right' | 'copy') => void

  // Copy variants (shared between CopyVariantsPanel and CopyVariantsNode)
  copyVariants: HeadlineCTAVariant[]
  activeCopyVariantIdx: number
  setCopyVariant: (idx: number, variant: HeadlineCTAVariant) => void
  addCopyVariant: () => void
  removeCopyVariant: (idx: number) => void
  setActiveCopyVariantIdx: (idx: number) => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void

  // Generation history
  genHistory: GenHistoryItem[]
  addToHistory: (url: string, prompt: string) => void

  // Campaign
  campaign: CampaignConfig | null
  campaignLaunchKey: number
  canvasResetKey: number
  showStartModal: boolean
  showResetConfirm: boolean
  setCampaign: (c: CampaignConfig | null) => void
  launchCampaign: (c: CampaignConfig) => void
  resetCanvas: () => void
  setShowStartModal: (v: boolean) => void
  setShowResetConfirm: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // API key — persisted in sessionStorage
  apiKey: typeof window !== 'undefined'
    ? sessionStorage.getItem('gemini_key') ?? ''
    : '',
  setApiKey: (key) => {
    if (typeof window !== 'undefined') sessionStorage.setItem('gemini_key', key)
    set({ apiKey: key, showApiModal: false })
  },

  // Node data
  nodeOutputs: {},
  nodeErrors:  {},
  setNodeOutput: (id, data) =>
    set(s => ({ nodeOutputs: { ...s.nodeOutputs, [id]: data } })),
  setNodeErrors: (id, errors) =>
    set(s => ({ nodeErrors: { ...s.nodeErrors, [id]: errors } })),
  deleteNode: (id) =>
    set(s => {
      const { [id]: _a, ...outputs } = s.nodeOutputs
      const { [id]: _b, ...errors }  = s.nodeErrors
      return {
        nodeOutputs: outputs,
        nodeErrors:  errors,
        selectedId: s.selectedId === id ? null : s.selectedId,
      }
    }),

  // Selection
  selectedId: null,
  selectNode: (id) => set({ selectedId: id }),

  // Zoom request
  zoomToId: null,
  requestZoom: (nodeId) => set({ zoomToId: nodeId }),
  clearZoom:   () => set({ zoomToId: null }),

  // Edges
  edges: [],
  syncEdges: (edges) => set({ edges }),

  // UI
  showApiModal: false,
  setShowApiModal: (show) => set({ showApiModal: show }),
  inspectorTab: 'node',
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  showTests: false,
  setShowTests: (show) => set({ showTests: show }),
  appMode: 'marketer',
  setAppMode: (mode) => set({ appMode: mode }),

  // Floating panels
  panels: {
    left:   { x: 8,   y: 60, minimized: false },
    right:  { x: 1132, y: 60, minimized: true },
    copy:   { x: 8, y: 420, minimized: false },
  },
  setPanelPos: (side, x, y) =>
    set(s => ({ panels: { ...s.panels, [side]: { ...s.panels[side], x, y } } })),
  togglePanelMinimized: (side) =>
    set(s => ({ panels: { ...s.panels, [side]: { ...s.panels[side], minimized: !s.panels[side].minimized } } })),

  // Copy variants
  copyVariants: [
    { id: 'v1', headlineMain: 'Lato 2025. Twój styl.', headlineSub: 'Nowa kolekcja już dostępna', ctaText: 'Odkryj kolekcję', ctaStyle: 'primary' as const },
    { id: 'v2', headlineMain: 'Moda, która mówi za Ciebie.', headlineSub: '', ctaText: 'Zobacz więcej', ctaStyle: 'outline' as const },
    { id: 'v3', headlineMain: 'Styl bez kompromisów.', headlineSub: 'Premium. Minimalistyczny. Twój.', ctaText: 'Sprawdź ofertę', ctaStyle: 'primary' as const },
  ],
  activeCopyVariantIdx: 0,
  setCopyVariant: (idx, variant) =>
    set(s => ({ copyVariants: s.copyVariants.map((v, i) => i === idx ? variant : v) })),
  addCopyVariant: () =>
    set(s => ({
      copyVariants: [
        ...s.copyVariants,
        { id: `v${Date.now()}`, headlineMain: '', headlineSub: '', ctaText: '', ctaStyle: 'primary' as const },
      ],
    })),
  removeCopyVariant: (idx) =>
    set(s => {
      const next = s.copyVariants.filter((_, i) => i !== idx)
      return {
        copyVariants: next.length ? next : [{ id: 'v1', headlineMain: '', headlineSub: '', ctaText: '', ctaStyle: 'primary' as const }],
        activeCopyVariantIdx: Math.min(s.activeCopyVariantIdx, next.length - 1),
      }
    }),
  setActiveCopyVariantIdx: (idx) => set({ activeCopyVariantIdx: idx }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set(s => ({
      toasts: [...s.toasts, { id: Date.now() + Math.random(), ...toast }],
    })),
  dismissToast: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // History
  genHistory: [],
  addToHistory: (url, prompt) =>
    set(s => ({
      genHistory: [
        { id: Date.now(), url, prompt: prompt.slice(0, 40), ts: new Date().toLocaleTimeString() },
        ...s.genHistory,
      ].slice(0, 20),
    })),

  // Campaign
  campaign: null,
  campaignLaunchKey: 0,
  canvasResetKey: 0,
  showStartModal: true,
  showResetConfirm: false,
  setCampaign: (c) => set({ campaign: c }),
  launchCampaign: (c) => set(s => ({ campaign: c, campaignLaunchKey: s.campaignLaunchKey + 1 })),
  resetCanvas: () => set(s => ({ campaign: null, showStartModal: true, canvasResetKey: s.canvasResetKey + 1, campaignLaunchKey: 0 })),
  setShowStartModal: (v) => set({ showStartModal: v }),
  setShowResetConfirm: (v) => set({ showResetConfirm: v }),
}))
