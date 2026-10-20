'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, translations } from '@/lib/i18n'
import { STORAGE_KEYS } from '@/lib/constants'

interface LanguageContextType {
  lang: Language
  t: typeof translations['th']
  setLang: (l: Language) => void
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  t: translations.th,
  setLang: () => {},
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('th')

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEYS.LANGUAGE) || localStorage.getItem('cpu_lang')) as Language | null
      if (saved === 'th' || saved === 'en') {
        setLangState(saved)
      }
    } catch {
      // Ignore
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang)
    } catch {
      // Ignore
    }
  }

  const toggleLang = () => {
    setLang(lang === 'th' ? 'en' : 'th')
  }

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
