// ═══════════════════════════════════════════════
// AD CREATOR — Icon Map
// Lucide outline icons per node type + UI
// ═══════════════════════════════════════════════
import {
  Globe,
  Target,
  Heading1,
  MousePointerClick,
  Layers,
  LayoutList,
  Library,
  Sliders,
  Sparkles,
  ImageIcon,
  LayoutTemplate,
  PackageOpen,
  FlaskConical,
  KeyRound,
  AlertTriangle,
  Plus,
  X,
  ChevronRight,
  FileJson,
  type LucideIcon,
} from 'lucide-react'

export const NODE_ICONS: Record<string, LucideIcon> = {
  webImportNode:      Globe,
  promptNode:         Target,
  headlineNode:       Heading1,
  ctaNode:            MousePointerClick,
  headlineCTANode:    LayoutList,
  copyVariantsNode:   Library,
  xToolsImportNode:   FileJson,
  copyGroupNode:      Layers,
  styleNode:          Sliders,
  imageGenNode:       Sparkles,
  bgLibraryNode:      ImageIcon,
  bannerComposerNode: LayoutTemplate,
  batchExportNode:    PackageOpen,
}

export {
  FlaskConical,
  KeyRound,
  AlertTriangle,
  Plus,
  X,
  ChevronRight,
}
