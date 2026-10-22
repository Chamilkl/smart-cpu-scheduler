import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { BeginnerModeProvider } from '@/contexts/BeginnerModeContext'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart CPU Scheduler - ระบบจำลองการจัดตาราง CPU อัจฉริยะ (v2.0.1)',
  description: 'Smart CPU Scheduler Version 2.0.1: Educational User Experience Improvement, AI Recommendation & AICS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <BeginnerModeProvider>
              <AnalyticsProvider>
                <Navbar />
                <main className="min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    className: 'text-sm dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700 shadow-lg',
                  }}
                />
              </AnalyticsProvider>
            </BeginnerModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
