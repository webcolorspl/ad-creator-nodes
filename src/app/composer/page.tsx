'use client'
import { AuthGate } from '@/components/AuthGate'
import { AdCreatorApp } from '@/components/AdCreatorApp'

export default function ComposerPage() {
  return (
    <AuthGate redirectTo="/composer">
      <AdCreatorApp skipWelcome />
    </AuthGate>
  )
}
