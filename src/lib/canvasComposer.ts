// ═══════════════════════════════════════════════
// AD CREATOR — Canvas Composer
// Renderuje banner na HTML Canvas
// ═══════════════════════════════════════════════
import { AD_FORMATS } from './constants'
import type { CopyGroupData, StyleData } from '@/types'

interface ComposeOptions {
  copy?: CopyGroupData | null
  background?: string | null
  image?: string | null
  style?: StyleData | null
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
  { copy, background, image, style }: ComposeOptions
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
    } else {
      drawFallbackBg(ctx, W, H)
    }
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

  // Headline
  if (copy.headline?.main) {
    const fontSize = px(copy.headline.main.length > 30 ? 52 : 68)
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = '#FFFFFF'
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
    ctx.font = `400 ${px(28)}px Inter, system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.80)'
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

    ctx.fillStyle = '#3DFFA0'
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

    ctx.font = `600 ${px(26)}px Inter, system-ui, sans-serif`
    ctx.fillStyle = '#000000'
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
