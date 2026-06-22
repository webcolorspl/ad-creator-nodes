// ═══════════════════════════════════════════════
// AD CREATOR — Canvas Composer
// Renderuje banner na HTML Canvas
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
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Fallback — zwróć pusty obraz
      resolve(new Image())
    }
    img.src = url
  })
}

export async function composeBanner(
  canvas: HTMLCanvasElement,
  { copy, background, bgColor, image, style, theme }: ComposeOptions
): Promise<void> {
  const fmt = AD_FORMATS.find(f => f.id === (style?.format ?? '1:1')) ?? AD_FORMATS[0]
  canvas.width  = Math.min(fmt.w, 2000)
  canvas.height = Math.min(fmt.h, 2000)

  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')!

  // 1. Background / generated image
  const bgUrl = image ?? background
  if (bgUrl) {
    const img = await loadImage(bgUrl)
    if (img.width > 0) {
      // Cover fit
      const scale = Math.max(W / img.width, H / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
    } else if (bgColor) {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, W, H)
    } else {
      drawFallbackBg(ctx, W, H)
    }
  } else if (bgColor) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)
  } else if (theme?.bgColor) {
    ctx.fillStyle = theme.bgColor
    ctx.fillRect(0, 0, W, H)
  } else {
    drawFallbackBg(ctx, W, H)
  }

  // 2. Gradient overlay
  const overlay = ctx.createLinearGradient(0, H * 0.4, 0, H)
  overlay.addColorStop(0, 'rgba(0,0,0,0)')
  overlay.addColorStop(1, 'rgba(0,0,0,0.72)')
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, W, H)

  if (!copy) return

  // 3. Typography
  const px = (n: number) => Math.round(n * (W / 1080))
  const centerX = W / 2

  // Logo placeholder (top-left corner)
  if (theme?.brandName && theme.brandName !== 'Custom') {
    ctx.shadowBlur = 0
    const logoFont = theme.fontFamily ?? 'Inter'
    ctx.font = `700 ${px(20)}px ${logoFont}, sans-serif`
    ctx.fillStyle = theme.accentColor
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = px(8)
    ctx.fillText(theme.brandName, px(32), px(56))
    ctx.shadowBlur = 0
  }

  // Headline
  if (copy.headline?.main) {
    const hFont   = copy.headline.mainFont   ?? theme?.fontFamily ?? 'Inter'
    const hWeight = copy.headline.mainWeight ?? 700
    const hColor  = copy.headline.mainColor  ?? '#FFFFFF'
    const fontSize = px(copy.headline.main.length > 30 ? 52 : 68)
    ctx.font = `${hWeight} ${fontSize}px ${hFont}, system-ui, sans-serif`
    ctx.fillStyle = hColor
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = px(12)

    // Word wrap
    const words = copy.headline.main.split(' ')
    const maxWidth = W * 0.82
    let line = ''
    const lines: string[] = []
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    lines.push(line)

    const lineHeight = fontSize * 1.2
    const totalHeight = lines.length * lineHeight
    const startY = H * 0.68 - totalHeight / 2
    lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineHeight))
  }

  // Sub-headline
  if (copy.headline?.sub) {
    const sFont   = copy.headline.subFont   ?? copy.headline.mainFont   ?? theme?.fontFamily ?? 'Inter'
    const sWeight = copy.headline.subWeight ?? 400
    const sColor  = copy.headline.subColor  ?? 'rgba(255,255,255,0.80)'
    ctx.font = `${sWeight} ${px(28)}px ${sFont}, system-ui, sans-serif`
    ctx.fillStyle = sColor
    ctx.shadowBlur = px(6)
    ctx.fillText(copy.headline.sub, centerX, H * 0.77)
  }

  // CTA Button
  if (copy.cta?.text) {
    ctx.shadowBlur = 0
    const btnW = px(260), btnH = px(56)
    const btnX = centerX - btnW / 2
    const btnY = H * 0.84
    const radius = btnH / 2

    const ctaBg   = copy.cta.bgColor   ?? theme?.accentColor ?? '#3DFFA0'
    const ctaTc   = copy.cta.textColor ?? (isColorDark(ctaBg) ? '#FFFFFF' : '#000000')
    const ctaFontFamily = theme?.fontFamily ?? 'Inter'
    const ctaFontSize   = copy.cta.size ? px(Math.min(copy.cta.size, 28)) : px(26)

    ctx.fillStyle = ctaBg
    ctx.beginPath()
    ctx.moveTo(btnX + radius, btnY)
    ctx.lineTo(btnX + btnW - radius, btnY)
    ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + radius)
    ctx.lineTo(btnX + btnW, btnY + btnH - radius)
    ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - radius, btnY + btnH)
    ctx.lineTo(btnX + radius, btnY + btnH)
    ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - radius)
    ctx.lineTo(btnX, btnY + radius)
    ctx.quadraticCurveTo(btnX, btnY, btnX + radius, btnY)
    ctx.closePath()
    ctx.fill()

    ctx.font = `600 ${ctaFontSize}px ${ctaFontFamily}, system-ui, sans-serif`
    ctx.fillStyle = ctaTc
    ctx.textAlign = 'center'
    ctx.fillText(copy.cta.text, centerX, btnY + btnH * 0.65)
  }
}

function drawFallbackBg(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const gradient = ctx.createLinearGradient(0, 0, W, H)
  gradient.addColorStop(0, '#0A0A20')
  gradient.addColorStop(1, '#1A1A3E')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)
}
