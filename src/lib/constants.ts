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
  theme: '#A855F7',
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
  // Facebook
  { id: 'fb-feed',     label: 'FB Feed',      w: 1200, h: 628,  pw: 64, ph: 33 },
  { id: 'fb-square',   label: 'FB Square',    w: 1080, h: 1080, pw: 44, ph: 44 },
  { id: 'fb-story',    label: 'FB Story',     w: 1080, h: 1920, pw: 25, ph: 44 },
  { id: 'fb-cover',    label: 'FB Cover',     w: 820,  h: 312,  pw: 64, ph: 24 },
  // Instagram
  { id: 'ig-square',   label: 'IG Square',    w: 1080, h: 1080, pw: 44, ph: 44 },
  { id: 'ig-portrait', label: 'IG Portrait',  w: 1080, h: 1350, pw: 35, ph: 44 },
  { id: 'ig-story',    label: 'IG Story',     w: 1080, h: 1920, pw: 25, ph: 44 },
  { id: 'ig-land',     label: 'IG Landscape', w: 1080, h: 566,  pw: 64, ph: 33 },
  // LinkedIn
  { id: 'li-single',   label: 'LI Post',      w: 1200, h: 627,  pw: 64, ph: 33 },
  { id: 'li-square',   label: 'LI Square',    w: 1080, h: 1080, pw: 44, ph: 44 },
  { id: 'li-banner',   label: 'LI Banner',    w: 1584, h: 396,  pw: 64, ph: 16 },
  // TikTok
  { id: 'tt-video',    label: 'TT Cover',     w: 1080, h: 1920, pw: 25, ph: 44 },
  // X / Twitter
  { id: 'x-single',    label: 'X Post',       w: 1200, h: 675,  pw: 64, ph: 36 },
  { id: 'x-square',    label: 'X Square',     w: 1080, h: 1080, pw: 44, ph: 44 },
  // YouTube
  { id: 'yt-thumb',    label: 'YT Thumb',     w: 1280, h: 720,  pw: 64, ph: 36 },
  { id: 'yt-shorts',   label: 'YT Shorts',    w: 1080, h: 1920, pw: 25, ph: 44 },
  // Pinterest
  { id: 'pn-standard', label: 'PIN Standard', w: 1000, h: 1500, pw: 30, ph: 44 },
  { id: 'pn-square',   label: 'PIN Square',   w: 1000, h: 1000, pw: 44, ph: 44 },
]

export const PLATFORM_GROUPS: { label: string; icon: string; color: string; ids: string[] }[] = [
  { label: 'Facebook',  icon: 'f',  color: '#1877F2', ids: ['fb-feed','fb-square','fb-story','fb-cover'] },
  { label: 'Instagram', icon: '◎', color: '#E4405F', ids: ['ig-square','ig-portrait','ig-story','ig-land'] },
  { label: 'LinkedIn',  icon: 'in', color: '#0A66C2', ids: ['li-single','li-square','li-banner'] },
  { label: 'TikTok',   icon: '♪',  color: '#010101', ids: ['tt-video'] },
  { label: 'X',        icon: '𝕏',  color: '#0f0f0f', ids: ['x-single','x-square'] },
  { label: 'YouTube',  icon: '▶',  color: '#FF0000', ids: ['yt-thumb','yt-shorts'] },
  { label: 'Pinterest', icon: 'P', color: '#E60023', ids: ['pn-standard','pn-square'] },
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
  campaignNode: {
    label: 'Campaign Setup', icon: '✦', cat: NODE_CATEGORIES.PROCESS,
    ins: [],
    outs: [],
    description: 'Konfiguracja kampanii — typ, cele, grupy banerów',
  },
  channelNode: {
    label: 'Kanały', icon: '📡', cat: NODE_CATEGORIES.PROCESS,
    ins: [],
    outs: [],
    description: 'Wybór kanałów dystrybucji i formatów banerów',
  },
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
  themeNode: {
    label: 'Brand Theme', icon: '🎨', cat: NODE_CATEGORIES.INPUT,
    ins: [],
    outs: [{ id: 'theme', type: 'theme', label: 'theme' }],
    description: 'Preset brandowy — kolory, font, logo',
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
      { id: 'headline',   type: PORT_TYPES.HEADLINE,    label: 'headline' },
      { id: 'cta',        type: PORT_TYPES.CTA,         label: 'cta' },
      { id: 'background', type: PORT_TYPES.BACKGROUND,  label: 'tło' },
      { id: 'style',      type: PORT_TYPES.STYLE,       label: 'style' },
      { id: 'image',      type: PORT_TYPES.IMAGE,       label: 'grafika' },
      { id: 'theme',      type: 'theme',                label: 'theme' },
    ],
    outs: [{ id: 'banner', type: PORT_TYPES.BANNER, label: 'banner' }],
    description: 'Składa finalny banner na Canvas',
  },
  batchExportNode: {
    label: 'Batch Export', icon: '📦', cat: NODE_CATEGORIES.OUTPUT,
    ins: [
      { id: 'banner',     type: PORT_TYPES.BANNER,     label: 'banner' },
      { id: 'copyGroup',  type: PORT_TYPES.COPY_GROUP,  label: 'copy group' },
      { id: 'headline',   type: PORT_TYPES.HEADLINE,    label: 'headline' },
      { id: 'cta',        type: PORT_TYPES.CTA,         label: 'cta' },
      { id: 'background', type: PORT_TYPES.BACKGROUND,  label: 'tło' },
      { id: 'theme',      type: 'theme',                label: 'theme' },
    ],
    outs: [],
    description: 'Eksportuje wiele formatów jednocześnie',
  },
  creativeNode: {
    label: 'Creative', icon: '✏', cat: NODE_CATEGORIES.PROCESS,
    ins: [],
    outs: [
      { id: 'headline', type: PORT_TYPES.HEADLINE, label: 'headline' },
      { id: 'cta',      type: PORT_TYPES.CTA,      label: 'cta' },
      { id: 'image',    type: PORT_TYPES.IMAGE,     label: 'image' },
      { id: 'theme',    type: PORT_TYPES.THEME,     label: 'theme' },
    ],
    description: 'Copy, obraz i marka w jednym miejscu',
  },
  bannerGridNode: {
    label: 'Banner Preview', icon: '🖼', cat: NODE_CATEGORIES.OUTPUT,
    ins: [
      { id: 'headline', type: PORT_TYPES.HEADLINE, label: 'headline' },
      { id: 'cta',      type: PORT_TYPES.CTA,      label: 'cta' },
      { id: 'image',    type: PORT_TYPES.IMAGE,     label: 'image' },
      { id: 'theme',    type: PORT_TYPES.THEME,     label: 'theme' },
    ],
    outs: [],
    description: 'Podgląd banerów we wszystkich formatach',
  },
}

// ── Palette sections (sidebar order) ─────────
export const PALETTE_SECTIONS = [
  { label: 'Input',      items: ['themeNode', 'xToolsImportNode', 'webImportNode', 'promptNode', 'copyVariantsNode', 'headlineCTANode', 'headlineNode', 'ctaNode'] },
  { label: 'Processing', items: ['copyGroupNode', 'styleNode'] },
  { label: 'Generation', items: ['imageGenNode', 'bgLibraryNode'] },
  { label: 'Output',     items: ['bannerComposerNode', 'batchExportNode'] },
]
