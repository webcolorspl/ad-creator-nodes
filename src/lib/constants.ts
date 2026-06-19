// ═══════════════════════════════════════════════
// AD CREATOR — Constants
// Kolory portów, formaty, rejestr nodów
// ═══════════════════════════════════════════════
import { PORT_TYPES, NODE_CATEGORIES, type AdFormat } from '@/types'

// ── Port colors ───────────────────────────────
export const PORT_COLORS: Record<string, string> = {
  [PORT_TYPES.PROMPT]:     '#4A7CFF',
  [PORT_TYPES.HEADLINE]:   '#7CB9FF',
  [PORT_TYPES.CTA]:        '#FF9F4A',
  [PORT_TYPES.COPY_GROUP]: '#9B6FFF',
  [PORT_TYPES.STYLE]:      '#FF6FB0',
  [PORT_TYPES.IMAGE]:      '#3DFFA0',
  [PORT_TYPES.BACKGROUND]: '#FFD700',
  [PORT_TYPES.BANNER]:     '#FF7C4A',
}

// ── Category colors (CSS vars) ────────────────
export const CAT_COLORS: Record<string, string> = {
  [NODE_CATEGORIES.INPUT]:   'var(--color-input)',
  [NODE_CATEGORIES.PROCESS]: 'var(--color-process)',
  [NODE_CATEGORIES.GEN]:     'var(--color-gen)',
  [NODE_CATEGORIES.OUTPUT]:  'var(--color-output)',
}

// ── Ad formats ────────────────────────────────
export const AD_FORMATS: AdFormat[] = [
  { id: '1:1',  label: 'Post',     w: 1080, h: 1080, pw: 28, ph: 28 },
  { id: '9:16', label: 'Story',    w: 1080, h: 1920, pw: 18, ph: 32 },
  { id: '16:9', label: 'Wide',     w: 1920, h: 1080, pw: 32, ph: 18 },
  { id: '4:5',  label: 'Portrait', w: 1080, h: 1350, pw: 22, ph: 28 },
]

// ── Node registry ─────────────────────────────
export interface PortDef {
  id: string
  type: string
  label: string
}

export interface NodeDef {
  label: string
  icon: string
  cat: string
  ins: PortDef[]
  outs: PortDef[]
  description: string
}

export const NODE_REGISTRY: Record<string, NodeDef> = {
  webImportNode: {
    label: 'Web Import', icon: '🌐', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [
      { id: 'prompt',     type: PORT_TYPES.PROMPT,     label: 'prompt' },
      { id: 'headline',   type: PORT_TYPES.HEADLINE,   label: 'headline' },
      { id: 'background', type: PORT_TYPES.BACKGROUND, label: 'image' },
    ],
    description: 'Pobiera teksty i grafiki z podanego URL',
  },
  promptNode: {
    label: 'Prompt', icon: '🎯', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [{ id: 'prompt', type: PORT_TYPES.PROMPT, label: 'prompt' }],
    description: 'Bazowy prompt kampanii z tonem i językiem',
  },
  headlineNode: {
    label: 'Headline', icon: '📝', cat: NODE_CATEGORIES.INPUT,
    ins: [{ id: 'headline', type: PORT_TYPES.HEADLINE, label: 'web proposals (opt.)' }],
    outs: [{ id: 'headline', type: PORT_TYPES.HEADLINE, label: 'headline' }],
    description: 'Hasło reklamowe z wariantami',
  },
  ctaNode: {
    label: 'CTA', icon: '📣', cat: NODE_CATEGORIES.INPUT,
    ins: [{ id: 'cta', type: PORT_TYPES.CTA, label: 'copy variants (opt.)' }],
    outs: [{ id: 'cta', type: PORT_TYPES.CTA, label: 'cta' }],
    description: 'Call to action — tekst i URL',
  },
  headlineCTANode: {
    label: 'Headline + CTA', icon: '📋', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [
      { id: 'headline', type: PORT_TYPES.HEADLINE, label: 'headline' },
      { id: 'cta',      type: PORT_TYPES.CTA,      label: 'cta' },
    ],
    description: 'Hasło + CTA w wariantach A/B — wybierz aktywny',
  },
  copyVariantsNode: {
    label: 'Copy Variants', icon: '🗂️', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [
      { id: 'headline', type: PORT_TYPES.HEADLINE, label: 'headline' },
      { id: 'cta',      type: PORT_TYPES.CTA,      label: 'cta' },
    ],
    description: 'Aktywny wariant z panelu „Warianty Copy"',
  },
  xToolsImportNode: {
    label: 'XTools Import', icon: '📥', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [
      { id: 'headline',   type: PORT_TYPES.HEADLINE,   label: 'headline' },
      { id: 'cta',        type: PORT_TYPES.CTA,        label: 'cta' },
      { id: 'background', type: PORT_TYPES.BACKGROUND, label: 'tło' },
      { id: 'style',      type: PORT_TYPES.STYLE,      label: 'style' },
    ],
    description: 'Wczytaj layout z ad-generator (JSON)',
  },
  copyGroupNode: {
    label: 'Copy Group', icon: '🔗', cat: NODE_CATEGORIES.PROCESS,
    ins: [
      { id: 'prompt',   type: PORT_TYPES.PROMPT,   label: 'prompt' },
      { id: 'headline', type: PORT_TYPES.HEADLINE,  label: 'headline' },
      { id: 'cta',      type: PORT_TYPES.CTA,       label: 'cta' },
    ],
    outs: [{ id: 'copyGroup', type: PORT_TYPES.COPY_GROUP, label: 'copy group' }],
    description: 'Łączy teksty w kompletny zestaw copy',
  },
  styleNode: {
    label: 'Style', icon: '🎨', cat: NODE_CATEGORIES.PROCESS,
    ins: [],
    outs: [{ id: 'style', type: PORT_TYPES.STYLE, label: 'style' }],
    description: 'Format i wymiary eksportu',
  },
  imageGenNode: {
    label: 'Image Gen', icon: '🖼️', cat: NODE_CATEGORIES.GEN,
    ins: [
      { id: 'prompt', type: PORT_TYPES.PROMPT, label: 'prompt' },
      { id: 'style',  type: PORT_TYPES.STYLE,  label: 'style' },
    ],
    outs: [{ id: 'image', type: PORT_TYPES.IMAGE, label: 'image' }],
    description: 'Generuje grafikę przez Gemini API',
  },
  bgLibraryNode: {
    label: 'BG Library', icon: '📚', cat: NODE_CATEGORIES.GEN,
    ins: [{ id: 'image', type: PORT_TYPES.IMAGE, label: 'image (opt.)' }],
    outs: [{ id: 'background', type: PORT_TYPES.BACKGROUND, label: 'background' }],
    description: 'Biblioteka teł — wgraj własne lub użyj Image Gen',
  },
  bannerComposerNode: {
    label: 'Banner', icon: '🎬', cat: NODE_CATEGORIES.OUTPUT,
    ins: [
      { id: 'copyGroup',  type: PORT_TYPES.COPY_GROUP,  label: 'copy group' },
      { id: 'background', type: PORT_TYPES.BACKGROUND,  label: 'tło' },
      { id: 'style',      type: PORT_TYPES.STYLE,       label: 'style' },
      { id: 'image',      type: PORT_TYPES.IMAGE,       label: 'grafika' },
    ],
    outs: [{ id: 'banner', type: PORT_TYPES.BANNER, label: 'banner' }],
    description: 'Składa finalny banner na Canvas',
  },
  batchExportNode: {
    label: 'Batch Export', icon: '📦', cat: NODE_CATEGORIES.OUTPUT,
    ins: [{ id: 'banner', type: PORT_TYPES.BANNER, label: 'banner' }],
    outs: [],
    description: 'Eksportuje wiele formatów jednocześnie',
  },
}

// ── Palette sections (sidebar order) ─────────
export const PALETTE_SECTIONS = [
  { label: 'Input',      items: ['xToolsImportNode', 'webImportNode', 'promptNode', 'copyVariantsNode', 'headlineCTANode', 'headlineNode', 'ctaNode'] },
  { label: 'Processing', items: ['copyGroupNode', 'styleNode'] },
  { label: 'Generation', items: ['imageGenNode', 'bgLibraryNode'] },
  { label: 'Output',     items: ['bannerComposerNode', 'batchExportNode'] },
]
