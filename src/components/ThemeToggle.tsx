'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  console.log('Current theme in toggle:', theme) // Debug log

  // Get the icon and label based on current theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Moon className="w-5 h-5 text-gray-700" />
      case 'dark':
        return <Sun className="w-5 h-5 text-gray-700" />
      default:
        return <Sun className="w-5 h-5 text-gray-700" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode'
      case 'dark':
        return 'Switch to light mode'
      default:
        return 'Switch theme'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-blue-50"
      aria-label={getThemeLabel()}
      title={getThemeLabel()}
    >
      {getThemeIcon()}
    </button>
  )
}
