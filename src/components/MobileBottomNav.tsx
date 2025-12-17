'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Package, Phone } from 'lucide-react'
import { useMobileMenu } from '../contexts/MobileMenuContext'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isMenuOpen } = useMobileMenu()

  const navItems = useMemo(() => [
    { name: 'Home', href: '/', icon: Home, label: 'Home' },
    { name: 'Tour Packages', href: '/tours', icon: Package, label: 'Tours' },
    { name: 'Destinations', href: '/destinations', icon: MapPin, label: 'Destinations' },
    { name: 'Contact', href: '/contact', icon: Phone, label: 'Contact' },
  ], [])

  const isActive = useCallback((href: string) => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }, [pathname])

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg sm:hidden will-change-transform transition-transform duration-300 ${
      isMenuOpen ? 'translate-y-full' : 'translate-y-0'
    }`}>
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] touch-manipulation ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

