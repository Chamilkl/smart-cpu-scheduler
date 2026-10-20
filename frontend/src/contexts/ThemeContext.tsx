'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('cpu_theme')) as Theme | null
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved)
        if (saved === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark')
        document.documentElement.classList.add('dark')
      }
    } catch {
      // Ignore
    }
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    } catch {
      // Ignore
    }
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
