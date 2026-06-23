// ═══════════════════════════════════════════════
// AD CREATOR — Icon Map
// Lucide outline icons per node type + UI
// ═══════════════════════════════════════════════
import {
  Globe,
  Target,
  Heading1,
  MousePointerClick,
  Group,
  PenLine,
  CopyCheck,
  Download,
  Paintbrush,
  Wand2,
  Images,
  LayoutTemplate,
  FolderDown,
  FlaskConical,
  KeyRound,
  AlertTriangle,
  Plus,
  X,
  ChevronRight,
  Palette,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'

export const NODE_ICONS: Record<string, LucideIcon> = {
  campaignNode:       Megaphone,
  webImportNode:      Globe,
  promptNode:         Target,
  headlineNode:       Heading1,
  ctaNode:            MousePointerClick,
  headlineCTANode:    PenLine,
  copyVariantsNode:   CopyCheck,
  xToolsImportNode:   Download,
  copyGroupNode:      Group,
  styleNode:          Paintbrush,
  imageGenNode:       Wand2,
  bgLibraryNode:      Images,
  bannerComposerNode: LayoutTemplate,
  batchExportNode:    FolderDown,
  themeNode:          Palette,
}

export {
  FlaskConical,
  KeyRound,
  AlertTriangle,
  Plus,
  X,
  ChevronRight,
}
