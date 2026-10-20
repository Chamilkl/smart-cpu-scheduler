'use client'
import { useState, useRef, useEffect } from 'react'
import { TECHNICAL_GLOSSARY } from '@/lib/constants'
import { useLanguage } from '@/contexts/LanguageContext'
import { HelpCircle, X, Calculator, Info } from 'lucide-react'

interface Props {
  termKey: keyof typeof TECHNICAL_GLOSSARY
  inline?: boolean
  className?: string
}

export function TechnicalTooltip({ termKey, inline = true, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)

  const term = TECHNICAL_GLOSSARY[termKey]
  if (!term) return null

  const isTh = lang === 'th'
  const title = isTh ? term.termTh : term.termEn
  const shortDef = isTh ? term.shortDefTh : term.shortDefEn
  const detail = isTh ? term.detailTh : term.detailEn
  const example = isTh ? term.exampleTh : term.exampleEn

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={ref}
      className={`relative ${inline ? 'inline-flex items-center ml-1 align-middle' : 'block'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!open)
        }}
        aria-label={`คำอธิบาย ${title}`}
        aria-expanded={open}
        className="text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors p-0.5 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl text-left text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                <Info className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="font-bold text-gray-900 dark:text-white text-sm block leading-tight">
                  {title} {term.abbr && <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs">({term.abbr})</span>}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
                  {isTh ? term.termEn : term.termTh}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Short Definition */}
          <p className="text-gray-700 dark:text-slate-200 font-medium mb-2 leading-relaxed">
            {shortDef}
          </p>

          {/* Details */}
          <p className="text-gray-500 dark:text-slate-400 mb-2 leading-relaxed text-[11px]">
            {detail}
          </p>

          {/* Formula */}
          {term.formula && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-2 rounded-xl mb-2">
              <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] uppercase mb-0.5">
                <Calculator className="h-3 w-3" />
                <span>{isTh ? 'สูตรคำนวณ' : 'Formula'}</span>
              </div>
              <div className="font-mono text-[11px] text-indigo-950 dark:text-indigo-200 font-semibold">
                {term.formula}
              </div>
            </div>
          )}

          {/* Example */}
          {example && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-2 rounded-xl">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] uppercase block mb-0.5">
                {isTh ? 'ตัวอย่าง' : 'Example'}
              </span>
              <span className="text-[11px] text-emerald-950 dark:text-emerald-200">
                {example}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
