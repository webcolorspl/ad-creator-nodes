import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/layout.css'
import '@/styles/nodes.css'
import '@/styles/ui.css'
import '@xyflow/react/dist/style.css'
import { AuthProvider } from '@/store/AuthContext'

export const metadata: Metadata = {
  title: 'Flow Campaigns',
  description: 'Visual node-based ad campaign builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
