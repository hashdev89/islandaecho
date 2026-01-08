'use client'

import { AuthProvider } from '../contexts/AuthContext'
import { MobileMenuProvider } from '../contexts/MobileMenuContext'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MobileMenuProvider>
        {children}
      </MobileMenuProvider>
    </AuthProvider>
  )
}
