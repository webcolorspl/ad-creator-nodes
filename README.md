# AD CREATOR — Node Pipeline

Visual node-based ad campaign builder. Connects prompts, headlines, CTAs, and Gemini-generated images into production-ready banners.

## Stack
- **Next.js 15** + TypeScript
- **React Flow** — node editor
- **Zustand** — global state
- **Gemini API** — AI image generation (server-side)
- **Canvas API** — banner composition

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
# Get key at: https://aistudio.google.com → Get API Key

# 3. Run dev server
npm run dev
# Open http://localhost:3000

# 4. Run tests
npm test
```

## Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "feat: initial ad creator"
git remote add origin https://github.com/YOUR_USERNAME/ad-creator
git push -u origin main

# Then in Vercel dashboard:
# 1. Import GitHub repo
# 2. Settings → Environment Variables → add GEMINI_API_KEY
# 3. Deploy
```

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts   # Gemini API (server-side, key hidden)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── nodes/                  # One file per node type
│   │   ├── PromptNode.tsx
│   │   ├── HeadlineNode.tsx
│   │   ├── CTANode.tsx
│   │   ├── CopyGroupNode.tsx
│   │   ├── StyleNode.tsx
│   │   ├── ImageGenNode.tsx
│   │   ├── BGLibraryNode.tsx
│   │   ├── BannerComposerNode.tsx
│   │   ├── BatchExportNode.tsx
│   │   └── index.ts            # Barrel export
│   ├── ui/
│   │   ├── BaseNode.tsx        # Shared node wrapper
│   │   ├── StatusBar.tsx
│   │   └── PortIndicator.tsx
│   ├── AdCreatorApp.tsx        # App orchestrator
│   ├── FlowCanvas.tsx          # React Flow canvas
│   ├── Sidebar.tsx             # Node palette
│   ├── Inspector.tsx           # Right panel
│   ├── Topbar.tsx
│   ├── ApiKeyModal.tsx
│   ├── ToastList.tsx
│   └── TestsPanel.tsx          # Sprint 6 tests UI
├── lib/
│   ├── constants.ts            # PORT_COLORS, NODE_REGISTRY, AD_FORMATS
│   ├── validation.ts           # Per-node validators
│   ├── edgeResolver.ts         # Reads upstream node data
│   └── canvasComposer.ts       # Canvas 2D banner renderer
├── store/
│   └── appStore.ts             # Zustand store
├── styles/
│   ├── globals.css             # Design tokens + reset
│   ├── nodes.css               # Node card styles
│   ├── layout.css              # App shell layout
│   └── ui.css                  # Buttons, modals, toasts
└── types/
    └── index.ts                # All TypeScript types
```

## Adding a New Node

1. Add type definition in `src/types/index.ts`
2. Add registry entry in `src/lib/constants.ts`
3. Add validator in `src/lib/validation.ts` (if needed)
4. Create `src/components/nodes/YourNode.tsx`
5. Export from `src/components/nodes/index.ts`
6. Add to `NODE_TYPES` map in `src/components/FlowCanvas.tsx`

## Adding a New Feature (e.g. User Accounts)

See `docs/features/` for planned features:
- `auth.md` — Supabase auth integration plan
- `presets.md` — Flow template system
- `saas.md` — Multi-tenant upgrade path

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key from aistudio.google.com |

## Model Routing (Claude Code)

When working with Claude Code CLI, route tasks to the right model:
- **Architecture decisions, code review** → `claude-opus-4-6`
- **Feature implementation** → `claude-sonnet-4-6`  
- **CSS fixes, copy changes** → `claude-haiku-4-5`
