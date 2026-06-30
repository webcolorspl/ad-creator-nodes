'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace('/')
    })
  }, [router])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, #3A67F0 0%, #7C5CF5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>F</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Weryfikacja konta…</p>
    </div>
  )
}
