// ═══════════════════════════════════════════════
// AD CREATOR — Canvas Composer
// Renderuje banner na HTML Canvas
// Layout: center (domyślny) | top | bottom
// ═══════════════════════════════════════════════
import { AD_FORMATS } from './constants'
import type { CopyGroupData, StyleData, ThemeData, BannerLayoutOptions, BgFit } from '@/types'

interface ComposeOptions {
  copy?:       CopyGroupData | null
  background?: string | null
  bgColor?:    string | null
  image?:      string | null
  style?:      StyleData | null
  theme?:      ThemeData | null
  layout?:     BannerLayoutOptions | null
  // Image positioning
  bgFit?:          BgFit   // default 'cover'
  bgOffsetX?:      number  // -100..100 (%)
  bgOffsetY?:      number  // -100..100 (%)
  bgScale?:        number  // multiplier, default 1.0
  overlayOpacity?: number  // 0..1, overrides default per textPos
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
  { copy, background, bgColor, image, style, theme, layout, bgFit, bgOffsetX, bgOffsetY, bgScale, overlayOpacity }: ComposeOptions
): Promise<void> {
  const fmt = AD_FORMATS.find(f => f.id === (style?.format ?? '')) ?? AD_FORMATS[0]
  canvas.width  = Math.min(fmt.w, 2000)
  canvas.height = Math.min(fmt.h, 2000)

  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')!

  const scale = Math.min(W, H) / 1080
  const px = (n: number) => Math.round(n * scale)

  const textPos   = layout?.textPosition ?? 'center'
  const ctaVisible = layout?.ctaVisible !== false

  // ── 1. Background ──────────────────────────────────────────────────
  const bgUrl = image ?? background
  const fit: BgFit  = bgFit    ?? 'cover'
  const offX        = bgOffsetX ?? 0      // -100..100
  const offY        = bgOffsetY ?? 0      // -100..100
  const scaleExtra  = bgScale   ?? 1.0

  if (bgUrl) {
    const img = await loadImage(bgUrl)
    if (img.width > 0) {
      drawBgImage(ctx, img, W, H, fit, offX, offY, scaleExtra)
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

  // ── 2. Overlay (adaptive per textPos, controllable opacity) ───────
  const alpha = overlayOpacity !== undefined ? overlayOpacity : undefined
  if (textPos === 'center') {
    ctx.fillStyle = `rgba(0,0,0,${alpha ?? 0.42})`
    ctx.fillRect(0, 0, W, H)
  } else if (textPos === 'top') {
    const a0 = alpha !== undefined ? alpha : 0.78
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.65)
    grad.addColorStop(0, `rgba(0,0,0,${a0})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
  } else { // bottom
    const a0 = alpha !== undefined ? alpha : 0.78
    const grad = ctx.createLinearGradient(0, H * 0.35, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, `rgba(0,0,0,${a0})`)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
  }

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

  const centerX   = W / 2
  const gap       = px(18)
  const bottomPad = Math.round(H * 0.055)

  // ── 4. Measure: headline ──────────────────────────────────────────
  const hFont   = copy.headline?.mainFont   ?? theme?.fontFamily ?? 'Inter'
  const hWeight = copy.headline?.mainWeight ?? 700
  const hColor  = copy.headline?.mainColor  ?? '#FFFFFF'

  let hLines: string[] = []
  let hFontSize = 0
  let hLineH = 0

  if (copy.headline?.main) {
    const maxFs = Math.floor(H * 0.20)
    if (copy.headline.mainSize) {
      hFontSize = Math.min(px(copy.headline.mainSize), maxFs)
    } else {
      const rawFs = copy.headline.main.length > 40 ? px(48) : copy.headline.main.length > 20 ? px(58) : px(68)
      hFontSize = Math.min(rawFs, maxFs, px(72))
    }
    ctx.font = `${hWeight} ${hFontSize}px ${hFont}, system-ui, sans-serif`
    hLines   = wrapText(ctx, copy.headline.main, W * 0.84)
    hLineH   = Math.round(hFontSize * 1.22)
  }

  // ── 5. Measure: sub-headline ──────────────────────────────────────
  const sFont   = copy.headline?.subFont   ?? copy.headline?.mainFont ?? theme?.fontFamily ?? 'Inter'
  const sWeight = copy.headline?.subWeight ?? 400
  const sColor  = copy.headline?.subColor  ?? 'rgba(255,255,255,0.82)'
  const sFs     = copy.headline?.subSize ? Math.min(px(copy.headline.subSize), Math.floor(H * 0.12)) : px(26)
  const sLineH  = Math.round(sFs * 1.3)
  let sLines: string[] = []

  if (copy.headline?.sub) {
    ctx.font = `${sWeight} ${sFs}px ${sFont}, system-ui, sans-serif`
    sLines   = wrapText(ctx, copy.headline.sub, W * 0.80)
  }

  // ── 6. Measure: CTA ──────────────────────────────────────────────
  const hasCta  = !!(copy.cta?.text && ctaVisible)
  const ctaBtnH = hasCta ? px(54) : 0
  const ctaBtnW = hasCta ? Math.min(px(280), W * 0.6) : 0

  const hBlockH = hLines.length * hLineH
  const sBlockH = sLines.length * sLineH
  const totalBlockH = hBlockH
    + (sBlockH > 0 ? gap + sBlockH : 0)
    + (ctaBtnH > 0 ? gap + ctaBtnH : 0)

  // ── 7. Block position ─────────────────────────────────────────────
  let blockTopY: number
  if (textPos === 'center') {
    blockTopY = Math.round((H - totalBlockH) / 2)
  } else if (textPos === 'top') {
    blockTopY = px(80)
  } else { // bottom
    blockTopY = H - bottomPad - ctaBtnH - (ctaBtnH > 0 ? gap : 0) - sBlockH - (sBlockH > 0 ? gap : 0) - hBlockH
    blockTopY = Math.max(px(40), blockTopY)
  }

  // ── 8. Draw headline ──────────────────────────────────────────────
  if (hLines.length > 0) {
    ctx.font = `${hWeight} ${hFontSize}px ${hFont}, system-ui, sans-serif`
    ctx.fillStyle = hColor; ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = px(14)
    hLines.forEach((l, i) => ctx.fillText(l, centerX, blockTopY + i * hLineH + hFontSize))
    ctx.shadowBlur = 0
  }

  // ── 9. Draw sub-headline ──────────────────────────────────────────
  if (sLines.length > 0) {
    const subStartY = blockTopY + hBlockH + (hBlockH > 0 ? gap : 0)
    ctx.font = `${sWeight} ${sFs}px ${sFont}, system-ui, sans-serif`
    ctx.fillStyle = sColor; ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = px(6)
    sLines.forEach((l, i) => ctx.fillText(l, centerX, subStartY + i * sLineH + sFs))
    ctx.shadowBlur = 0
  }

  // ── 10. Draw CTA button ───────────────────────────────────────────
  if (hasCta && copy.cta?.text) {
    ctx.shadowBlur = 0
    const ctaStartY = blockTopY + hBlockH + (sBlockH > 0 ? gap + sBlockH : 0) + gap
    const btnX      = centerX - ctaBtnW / 2
    const btnY      = ctaStartY
    const radius    = ctaBtnH / 2

    const ctaBg = copy.cta.bgColor ?? theme?.accentColor ?? '#3DFFA0'
    const ctaTc = copy.cta.textColor ?? (isColorDark(ctaBg) ? '#FFFFFF' : '#000000')

    ctx.fillStyle = ctaBg
    ctx.beginPath()
    ctx.moveTo(btnX + radius, btnY)
    ctx.arcTo(btnX + ctaBtnW, btnY,          btnX + ctaBtnW, btnY + ctaBtnH, radius)
    ctx.arcTo(btnX + ctaBtnW, btnY + ctaBtnH, btnX,          btnY + ctaBtnH, radius)
    ctx.arcTo(btnX,           btnY + ctaBtnH, btnX,          btnY,           radius)
    ctx.arcTo(btnX,           btnY,           btnX + ctaBtnW, btnY,          radius)
    ctx.closePath(); ctx.fill()

    const ctaFs = copy.cta.size ? px(Math.min(copy.cta.size, 26)) : px(24)
    ctx.font = `700 ${ctaFs}px ${theme?.fontFamily ?? 'Inter'}, system-ui, sans-serif`
    ctx.fillStyle = ctaTc; ctx.textAlign = 'center'
    ctx.fillText(copy.cta.text, centerX, btnY + ctaBtnH * 0.66)
  }
}

function drawBgImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number, H: number,
  fit: BgFit,
  offX: number,   // -100..100 (%)
  offY: number,   // -100..100 (%)
  scaleExtra: number,
) {
  const iw = img.width, ih = img.height

  if (fit === 'fill') {
    ctx.drawImage(img, 0, 0, W, H)
    return
  }

  const baseScale = fit === 'cover'
    ? Math.max(W / iw, H / ih)
    : Math.min(W / iw, H / ih)   // 'contain'

  const s  = baseScale * scaleExtra
  const sw = iw * s
  const sh = ih * s

  // Default center offset
  const cx = (W - sw) / 2
  const cy = (H - sh) / 2

  // User offset: +100% moves the image right/down by half the overflow
  const overflowX = sw - W
  const overflowY = sh - H
  const dx = fit === 'cover' ? (offX / 100) * (overflowX / 2) : (offX / 100) * (W / 4)
  const dy = fit === 'cover' ? (offY / 100) * (overflowY / 2) : (offY / 100) * (H / 4)

  ctx.drawImage(img, cx + dx, cy + dy, sw, sh)
}

function drawFallbackBg(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#0A0A20'); g.addColorStop(1, '#1A1A3E')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
}
