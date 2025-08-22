'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Dummy admin user
const ADMIN_USER: User = {
  id: '1',
  email: 'admin@isleandecho.com',
  name: 'Admin User',
  role: 'admin'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if it's the admin user
    if (email === ADMIN_USER.email && password === 'admin123') {
      setUser(ADMIN_USER)
      localStorage.setItem('user', JSON.stringify(ADMIN_USER))
      return true
    }

    // For demo purposes, allow any email with password 'demo123'
    if (password === 'demo123') {
      const demoUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: 'user'
      }
      setUser(demoUser)
      localStorage.setItem('user', JSON.stringify(demoUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
