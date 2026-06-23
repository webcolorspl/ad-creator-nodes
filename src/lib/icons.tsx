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
  PenLine,
  FilePen,
  Download,
  Brush,
  Wand2,
  Image,
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
  Radio,
  type LucideIcon,
} from 'lucide-react'

export const NODE_ICONS: Record<string, LucideIcon> = {
  campaignNode:       Megaphone,
  channelNode:        Radio,
  webImportNode:      Globe,
  promptNode:         Target,
  headlineNode:       Heading1,
  ctaNode:            MousePointerClick,
  headlineCTANode:    PenLine,
  copyVariantsNode:   FilePen,
  xToolsImportNode:   Download,
  copyGroupNode:      Layers,
  styleNode:          Brush,
  imageGenNode:       Wand2,
  bgLibraryNode:      Image,
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
