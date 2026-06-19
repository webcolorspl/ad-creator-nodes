// ═══════════════════════════════════════════════
// AD CREATOR — Validation Rules
// Osobny plik — łatwo rozszerzać o nowe nody
// ═══════════════════════════════════════════════
import type { PromptData, HeadlineData, CTAData } from '@/types'

export function validatePromptNode(data: Partial<PromptData>): string[] {
  const errors: string[] = []
  if (!data.text || data.text.trim().length < 10)
    errors.push('Prompt musi mieć min. 10 znaków')
  if (data.text && data.text.length > 800)
    errors.push('Prompt nie może przekraczać 800 znaków')
  return errors
}

export function validateHeadlineNode(data: Partial<HeadlineData>): string[] {
  const errors: string[] = []
  if (!data.main || !data.main.trim())
    errors.push('Hasło główne jest wymagane')
  if (data.main && data.main.length > 60)
    errors.push('Hasło główne max 60 znaków')
  if (data.sub && data.sub.length > 100)
    errors.push('Pod-hasło max 100 znaków')
  return errors
}

export function validateCTANode(data: Partial<CTAData>): string[] {
  const errors: string[] = []
  if (!data.text || !data.text.trim())
    errors.push('Tekst CTA jest wymagany')
  if (data.text && data.text.length > 30)
    errors.push('CTA max 30 znaków')
  return errors
}

// Dodawanie nowych validatorów:
// 1. Stwórz funkcję validateXxxNode(data) tutaj
// 2. Zaimportuj w komponencie noda
