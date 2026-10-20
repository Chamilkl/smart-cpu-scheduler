'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

interface BeginnerModeContextType {
  isBeginnerMode: boolean
  toggleBeginnerMode: () => void
  setBeginnerMode: (val: boolean) => void
}

const BeginnerModeContext = createContext<BeginnerModeContextType>({
  isBeginnerMode: true,
  toggleBeginnerMode: () => {},
  setBeginnerMode: () => {},
})

export function BeginnerModeProvider({ children }: { children: React.ReactNode }) {
  // Default to true for learner-centered design as specified in TOR
  const [isBeginnerMode, setIsBeginnerModeState] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEGINNER_MODE)
      if (saved !== null) {
        setIsBeginnerModeState(saved === 'true')
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true)
  }, [])

  const setBeginnerMode = (val: boolean) => {
    setIsBeginnerModeState(val)
    try {
      localStorage.setItem(STORAGE_KEYS.BEGINNER_MODE, String(val))
    } catch {
      // Ignore
    }
  }

  const toggleBeginnerMode = () => {
    setBeginnerMode(!isBeginnerMode)
  }

  return (
    <BeginnerModeContext.Provider value={{ isBeginnerMode, toggleBeginnerMode, setBeginnerMode }}>
      {children}
    </BeginnerModeContext.Provider>
  )
}

export function useBeginnerMode() {
  return useContext(BeginnerModeContext)
}
