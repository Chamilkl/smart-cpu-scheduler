'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Cpu,
  Zap,
  BarChart3,
  Brain,
  GitBranch,
  History,
  ArrowRight,
  BookOpen,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { UserGuideModal } from '@/components/UserGuideModal'
import { InteractiveOnboarding } from '@/components/InteractiveOnboarding'

export default function HomePage() {
  const { t, lang } = useLanguage()
  const isTh = lang === 'th'
  const [guideOpen, setGuideOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  const features = [
    { icon: Zap, title: t.home.f1_title, desc: t.home.f1_desc, href: '/simulator', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
    { icon: BarChart3, title: t.home.f2_title, desc: t.home.f2_desc, href: '/compare', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
    { icon: Brain, title: t.home.f3_title, desc: t.home.f3_desc, href: '/simulator', color: 'bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400' },
    { icon: GitBranch, title: t.home.f4_title, desc: t.home.f4_desc, href: '/simulator', color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' },
    { icon: History, title: t.home.f5_title, desc: t.home.f5_desc, href: '/history', color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Modals */}
      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <InteractiveOnboarding forceOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Welcome Message Card (TOR Section 3.1) */}
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <GraduationCap className="h-4 w-4" />
              <span>Smart CPU Scheduler Version 2.0.1 (Educational UX Improvement)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isTh
                ? 'ข้อความต้อนรับสำหรับผู้เรียนและผู้เริ่มต้น'
                : 'Welcome to Smart CPU Scheduler'}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
              {isTh ? (
                <span>
                  &ldquo;ยินดีต้อนรับสู่ <strong>Smart CPU Scheduler</strong> เว็บไซต์จำลองการจัดตารางการทำงานของ CPU สำหรับผู้เริ่มต้น คุณสามารถเรียนรู้ ทดลอง และเปรียบเทียบอัลกอริทึมต่าง ๆ ได้ด้วยตนเอง โดยไม่ต้องสมัครสมาชิก&rdquo;
                </span>
              ) : (
                <span>
                  &ldquo;Welcome to <strong>Smart CPU Scheduler</strong>, a learner-centered CPU scheduling simulation platform for beginners and students. You can learn, simulate, and compare algorithms with zero setup and no registration required.&rdquo;
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <Link
              href="/simulator"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-xs sm:text-sm"
            >
              <Zap className="h-4 w-4" />
              <span>{isTh ? 'เริ่มทดลองใช้งาน' : 'Start Simulator'}</span>
            </Link>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all text-xs sm:text-sm"
            >
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>{isTh ? 'ดูวิธีใช้งาน (5 ขั้นตอน)' : 'View Guide'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm active:scale-95 transition-all text-xs sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{isTh ? 'ทัวร์แนะนำ' : 'Tour'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-500 mb-6 shadow-xl shadow-indigo-500/25 ring-8 ring-indigo-50 dark:ring-indigo-950/40">
          <Cpu className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
          {t.home.heroTitle}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          {t.home.heroSubtitle}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc, href, color }) => (
          <Link
            key={title}
            href={href}
            className="group block bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
              <span>{title}</span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Supported Algorithms */}
      <div className="mt-8 text-center pt-4 border-t border-gray-100 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.home.supportedAlgos}</h2>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { name: 'FCFS', desc: isTh ? 'มาก่อนได้ก่อน (แนะนำสำหรับผู้เริ่มต้น)' : 'First Come First Served (Beginner)' },
            { name: 'SJF', desc: isTh ? 'งานสั้นที่สุดทำก่อน' : 'Shortest Job First' },
            { name: 'SRTF', desc: isTh ? 'งานเหลือสั้นสุดทำก่อน (แย่ง CPU ได้)' : 'Shortest Remaining Time First' },
            { name: 'Round Robin', desc: isTh ? 'วนรอบตาม Time Quantum' : 'Time Quantum Scheduling' },
            { name: 'Priority', desc: isTh ? 'ตามลำดับความสำคัญ' : 'Priority Scheduling' },
            { name: 'AICS', desc: isTh ? 'อัลกอริทึมปรับตัวอัจฉริยะ' : 'Adaptive Intelligent Scheduler' },
          ].map(a => (
            <div key={a.name} className="px-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{a.name}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:inline">• {a.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
