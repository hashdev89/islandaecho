'use client'

import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { MobileMenuProvider } from '../contexts/MobileMenuContext'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MobileMenuProvider>
          {children}
        </MobileMenuProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
