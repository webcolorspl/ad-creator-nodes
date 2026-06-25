// ═══════════════════════════════════════════════
// AD CREATOR — Type System
// Centralny plik typów — importuj stąd wszędzie
// ═══════════════════════════════════════════════

// ── Port Types ────────────────────────────────
export const PORT_TYPES = {
  PROMPT:            'prompt',
  HEADLINE:          'headline',
  CTA:               'cta',
  COPY_GROUP:        'copy_group',
  STYLE:             'style',
  IMAGE:             'image',
  BACKGROUND:        'background',
  BANNER:            'banner',
  THEME:             'theme',
  PROPOSALS:         'proposals',
  SELECTED_VARIANTS: 'selected_variants',
} as const

export type PortType = typeof PORT_TYPES[keyof typeof PORT_TYPES]

// ── Node Categories ───────────────────────────
export const NODE_CATEGORIES = {
  INPUT:   'input',
  PROCESS: 'process',
  GEN:     'gen',
  OUTPUT:  'output',
} as const

export type NodeCategory = typeof NODE_CATEGORIES[keyof typeof NODE_CATEGORIES]

// ── Node Status ───────────────────────────────
export type NodeStatus = 'idle' | 'running' | 'done' | 'error'

// ── Data shapes flowing between nodes ─────────
export interface PromptData {
  text: string
  tone: string
  lang: string
  variants?: string[]
}

export interface HeadlineData {
  main: string
  mainColor?: string
  mainFont?: string
  mainWeight?: number
  mainSize?: number
  sub?: string
  subColor?: string
  subFont?: string
  subWeight?: number
  subSize?: number
  variants?: string[]
}

export interface CTAData {
  text: string
  style: 'primary' | 'outline' | 'ghost' | 'text' | 'solid' | 'pill' | 'gradient'
  bgColor?: string
  textColor?: string
  size?: number
}

export interface HeadlineCTAVariant {
  id: string
  headlineMain: string
  headlineSub: string
  ctaText: string
  ctaStyle: 'primary' | 'outline' | 'ghost' | 'text'
  // Text styling
  headlineAlign?: 'left' | 'center' | 'right'
  headlineBold?: boolean
  headlineItalic?: boolean
  headlineUnderline?: boolean
  headlineSize?: number
  subAlign?: 'left' | 'center' | 'right'
  subBold?: boolean
  subItalic?: boolean
  subUnderline?: boolean
  // Theme override
  themeOverride?: { bgColor?: string; accentColor?: string; fontFamily?: string }
}

export interface ProposalsData {
  variants: HeadlineCTAVariant[]
}

export interface CopyGroupData {
  prompt: PromptData
  headline: HeadlineData
  cta: CTAData
}

export interface StyleData {
  format: string
  width: number
  height: number
}

export interface ImageData {
  url: string
  index: number
}

export interface BackgroundData {
  url: string
  color?: string
  all?: Array<{ id: number; name: string; url: string }>
}

export interface ThemeData {
  brandName: string
  bgColor: string
  accentColor: string
  fontFamily: string
  logoUrl?: string
  logoVariant: 'horizontal' | 'vertical' | 'icon'
}

export interface BannerData {
  dataUrl: string
  format: string
  width: number
  height: number
}

// ── Node Output Map ───────────────────────────
export interface NodeOutputs {
  prompt?:           PromptData
  headline?:         HeadlineData
  cta?:              CTAData
  copyGroup?:        CopyGroupData
  style?:            StyleData
  image?:            ImageData
  background?:       BackgroundData
  banner?:           BannerData
  theme?:            ThemeData
  proposals?:        ProposalsData
  selectedVariants?: HeadlineCTAVariant[]
}

// ── Web Scrape Data ───────────────────────────
export interface WebData {
  title: string
  description: string
  promptText: string
  headlines: string[]
  images: string[]
  url: string
}

// ── Format definition ─────────────────────────
export interface AdFormat {
  id: string
  label: string
  w: number
  h: number
  pw: number  // preview width
  ph: number  // preview height
}

// ── Toast ─────────────────────────────────────
export interface Toast {
  id: number
  type: 'info' | 'success' | 'error' | 'warn'
  message: string
}

// ── Generation History ────────────────────────
export interface GenHistoryItem {
  id: number
  url: string
  prompt: string
  ts: string
}
