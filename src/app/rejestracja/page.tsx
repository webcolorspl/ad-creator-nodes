import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'

export default function RejestracjaPage() {
  return (
    <Suspense>
      <AuthPage mode="register" />
    </Suspense>
  )
}
