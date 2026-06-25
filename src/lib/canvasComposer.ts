// ═══════════════════════════════════════════════
// AD CREATOR — Canvas Composer
// Renderuje banner na HTML Canvas
// Bottom-up layout: CTA → sub → headline
// ═══════════════════════════════════════════════
import { AD_FORMATS } from './constants'
import type { CopyGroupData, StyleData, ThemeData } from '@/types'

interface ComposeOptions {
  copy?: CopyGroupData | null
  background?: string | null
  bgColor?: string | null
  image?: string | null
  style?: StyleData | null
  theme?: ThemeData | null
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(new Image())
    img.src = url
  })
}

// Word-wrap helper — returns lines fitting within maxWidth
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function composeBanner(
  canvas: HTMLCanvasElement,
  { copy, background, bgColor, image, style, theme }: ComposeOptions
): Promise<void> {
  const fmt = AD_FORMATS.find(f => f.id === (style?.format ?? '')) ?? AD_FORMATS[0]
  canvas.width  = Math.min(fmt.w, 2000)
  canvas.height = Math.min(fmt.h, 2000)

  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')!

  // Scale relative to the SHORTER dimension so text fits all aspect ratios
  const scale = Math.min(W, H) / 1080
  const px = (n: number) => Math.round(n * scale)

  // ── 1. Background ─────────────────────────────────────────────────
  const bgUrl = image ?? background
  if (bgUrl) {
    const img = await loadImage(bgUrl)
    if (img.width > 0) {
      const s = Math.max(W / img.width, H / img.height)
      ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s)
    } else {
      ctx.fillStyle = bgColor ?? theme?.bgColor ?? '#1a1a2e'
      ctx.fillRect(0, 0, W, H)
    }
  } else if (bgColor) {
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H)
  } else if (theme?.bgColor) {
    ctx.fillStyle = theme.bgColor; ctx.fillRect(0, 0, W, H)
  } else {
    drawFallbackBg(ctx, W, H)
  }

  // ── 2. Gradient overlay (bottom 60%) ──────────────────────────────
  const grad = ctx.createLinearGradient(0, H * 0.35, 0, H)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.78)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  // ── 3. Brand name (top-left) ───────────────────────────────────────
  if (theme?.brandName && theme.brandName !== 'Custom') {
    ctx.font = `700 ${px(20)}px ${theme.fontFamily ?? 'Inter'}, sans-serif`
    ctx.fillStyle = theme.accentColor ?? '#3DFFA0'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = px(8)
    ctx.fillText(theme.brandName, px(32), px(52))
    ctx.shadowBlur = 0
  }

  if (!copy) return

  const centerX = W / 2
  const bottomPad = Math.round(H * 0.055)   // ~5.5% from bottom

  // ── 4. CTA Button (positioned from bottom) ────────────────────────
  let ctaTopY = H  // will be set if CTA present

  if (copy.cta?.text) {
    ctx.shadowBlur = 0
    const btnH     = px(54)
    const btnW     = Math.min(px(280), W * 0.6)
    const btnX     = centerX - btnW / 2
    const btnY     = H - bottomPad - btnH
    ctaTopY        = btnY
    const radius   = btnH / 2

    const ctaBg = copy.cta.bgColor ?? theme?.accentColor ?? '#3DFFA0'
    const ctaTc = copy.cta.textColor ?? (isColorDark(ctaBg) ? '#FFFFFF' : '#000000')

    ctx.fillStyle = ctaBg
    ctx.beginPath()
    ctx.moveTo(btnX + radius, btnY)
    ctx.arcTo(btnX + btnW, btnY, btnX + btnW, btnY + btnH, radius)
    ctx.arcTo(btnX + btnW, btnY + btnH, btnX, btnY + btnH, radius)
    ctx.arcTo(btnX, btnY + btnH, btnX, btnY, radius)
    ctx.arcTo(btnX, btnY, btnX + btnW, btnY, radius)
    ctx.closePath(); ctx.fill()

    const ctaFs = copy.cta.size ? px(Math.min(copy.cta.size, 26)) : px(24)
    ctx.font = `700 ${ctaFs}px ${theme?.fontFamily ?? 'Inter'}, system-ui, sans-serif`
    ctx.fillStyle = ctaTc; ctx.textAlign = 'center'
    ctx.fillText(copy.cta.text, centerX, btnY + btnH * 0.66)
  }

  const gap = px(18)

  // ── 5. Sub-headline (above CTA) ───────────────────────────────────
  let subTopY = ctaTopY

  if (copy.headline?.sub) {
    const subFs   = px(26)
    const subLineH = Math.round(subFs * 1.3)
    const sFont   = copy.headline.subFont ?? copy.headline.mainFont ?? theme?.fontFamily ?? 'Inter'
    const sWeight = copy.headline.subWeight ?? 400
    const sColor  = copy.headline.subColor  ?? 'rgba(255,255,255,0.82)'

    ctx.font = `${sWeight} ${subFs}px ${sFont}, system-ui, sans-serif`
    const subLines = wrapText(ctx, copy.headline.sub, W * 0.80)
    const subBlockH = subLines.length * subLineH

    subTopY = ctaTopY - gap - subBlockH
    ctx.fillStyle = sColor; ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = px(6)
    subLines.forEach((l, i) => ctx.fillText(l, centerX, subTopY + i * subLineH + subFs))
    ctx.shadowBlur = 0
  }

  // ── 6. Headline (above sub or CTA) ────────────────────────────────
  if (copy.headline?.main) {
    const hFont   = copy.headline.mainFont   ?? theme?.fontFamily ?? 'Inter'
    const hWeight = copy.headline.mainWeight ?? 700
    const hColor  = copy.headline.mainColor  ?? '#FFFFFF'

    // Font size: base on text length and available height
    const availableH = subTopY - gap
    const rawFs = copy.headline.main.length > 40 ? px(48) : copy.headline.main.length > 20 ? px(58) : px(68)
    const maxFsByHeight = Math.floor(availableH * 0.22)  // max ~22% of available space
    const fontSize = Math.min(rawFs, maxFsByHeight, px(72))

    ctx.font = `${hWeight} ${fontSize}px ${hFont}, system-ui, sans-serif`
    ctx.fillStyle = hColor; ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = px(14)

    const lines   = wrapText(ctx, copy.headline.main, W * 0.84)
    const lineH   = Math.round(fontSize * 1.22)
    const totalH  = lines.length * lineH

    // Place block so its BOTTOM aligns just above subTopY
    const blockTopY = subTopY - gap - totalH

    // Clamp so we don't go off the top
    const startY = Math.max(px(40), blockTopY)
    lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineH + fontSize))
    ctx.shadowBlur = 0
  }
}

function drawFallbackBg(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#0A0A20'); g.addColorStop(1, '#1A1A3E')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
}
