'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Cpu,
  BarChart3,
  History,
  Settings,
  Zap,
  Moon,
  Sun,
  Languages,
  HelpCircle,
  GraduationCap,
  BookOpen
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBeginnerMode } from '@/contexts/BeginnerModeContext'
import { UserGuideModal } from '@/components/UserGuideModal'

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const { isBeginnerMode, toggleBeginnerMode } = useBeginnerMode()
  const [guideOpen, setGuideOpen] = useState(false)
  const isTh = lang === 'th'

  const nav = [
    { href: '/', label: t.nav.home, icon: Cpu },
    { href: '/simulator', label: t.nav.simulator, icon: Zap },
    { href: '/compare', label: t.nav.compare, icon: BarChart3 },
    { href: '/history', label: t.nav.history, icon: History },
    { href: '/help', label: isTh ? 'ช่วยเหลือ' : 'Help', icon: HelpCircle },
    { href: '/admin', label: t.nav.admin, icon: Settings },
  ]

  return (
    <>
      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <nav className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg tracking-tight block leading-tight">
                    Smart CPU
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                    v2.0.1
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 hidden sm:block">
                  {isTh ? 'ระบบจำลองการจัดตารางอัจฉริยะ' : 'Intelligent Scheduling System'}
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Beginner Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleBeginnerMode}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
                  isBeginnerMode
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
                title={isTh ? 'คลิกเพื่อเปิด/ปิดโหมดผู้เริ่มต้น (Beginner Mode)' : 'Toggle Beginner Mode'}
              >
                <GraduationCap className={`h-4 w-4 ${isBeginnerMode ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">
                  {isTh ? (isBeginnerMode ? 'โหมดผู้เริ่มต้น (เปิด)' : 'โหมดปกติ') : (isBeginnerMode ? 'Beginner: ON' : 'Beginner: OFF')}
                </span>
              </button>

              {/* Quick 5-Step Guide Button */}
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                title={isTh ? 'เปิดคู่มือการใช้งาน 5 ขั้นตอน' : 'Open 5-Step Guide'}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isTh ? 'คู่มือ' : 'Guide'}</span>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title={isTh ? 'เปลี่ยนเป็น English' : 'Switch to ภาษาไทย'}
              >
                <Languages className="h-3.5 w-3.5 text-indigo-500" />
                <span>{lang === 'th' ? 'TH' : 'EN'}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'dark' ? 'เปิดโหมดสว่าง (Light Mode)' : 'เปิดโหมดมืด (Dark Mode)'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-gray-100 dark:border-slate-800/80 -mx-4 px-4 scrollbar-none">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0',
                  pathname === href
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
