'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export function ToastList() {
  const { toasts, dismissToast } = useAppStore()

  useEffect(() => {
    toasts.forEach(t => {
      const timer = setTimeout(() => dismissToast(t.id), 3500)
      return () => clearTimeout(timer)
    })
  }, [toasts, dismissToast])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismissToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
