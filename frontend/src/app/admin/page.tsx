'use client'
import { useState, useEffect, useCallback, useId } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { getModelStatus, trainModel } from '@/lib/api'
import {
  Brain,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  Activity,
  Calendar,
  Layers,
  Cpu,
  BarChart3,
  HelpCircle,
  Sparkles,
  Award,
  FileText,
  Settings,
  Lock,
  LogOut,
  RefreshCw,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
  Clock,
  Printer,
  ShieldCheck,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts'

interface AnalyticsData {
  meta: {
    range: string
    startDate: string
    endDate: string
    supabase_connected: boolean
    visitor_definition: string
    totalEventsRetrieved: number
  }
  overview: {
    totalVisitors: number
    todayVisitors: number
    monthlyVisitors: number
    totalPageViews: number
    todayPageViews: number
    activeVisitors: number
    popularPages: { path: string; views: number }[]
    deviceStats: { name: string; count: number; percent: number }[]
    trafficTrends: { date: string; visitors: number; pageViews: number; simulations: number }[]
    monthlyComparison: { month: string; visitors: number; pageViews: number }[]
  }
  simulation: {
    total: number
    algorithms: { algorithm: string; count: number; percent: number }[]
    fcfsCount: number
    sjfCount: number
    rrCount: number
    srtfCount: number
    priorityCount: number
    aicsCount: number
  }
  ai: {
    recommendationsCount: number
    comparisonCount: number
    aicsRunsCount: number
    totalAiCalls: number
    successRate: number
  }
  learning: {
    totalLessonOpens: number
    topics: { topic: string; count: number }[]
    guideOpens: number
    onboardingTourCompletions: number
  }
  quiz: {
    startCount: number
    submitCount: number
    averageScorePercent: number
    weakTopics: { topic: string; incorrectRate: number; totalAttempts: number }[]
  }
}

type TabType =
  | 'overview'
  | 'website'
  | 'learning'
  | 'simulation'
  | 'ai'
  | 'quiz'
  | 'reports'
  | 'settings'

const DEVICE_COLORS = ['#6366f1', '#06b6d4', '#ec4899']
const ALGO_COLORS: Record<string, string> = {
  FCFS: '#6366f1',
  SJF: '#a855f7',
  SRTF: '#ec4899',
  RR: '#f97316',
  PRIORITY: '#10b981',
  AICS: '#06b6d4',
}

export default function AdminPage() {
  const { t, lang } = useLanguage()
  const isTh = lang === 'th'

  // Admin Auth State
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Analytics Data & States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Original AI Retrain Feature State
  const [modelTrained, setModelTrained] = useState(false)
  const [training, setTraining] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)

  // Chart Gradient IDs
  const pvGradId = useId()
  const visGradId = useId()

  // 1. Check Authentication on Mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        setAuthenticated(data.authenticated)
      })
      .catch(() => setAuthenticated(false))
  }, [])

  // 2. Fetch AI Model Status (Original Feature)
  useEffect(() => {
    if (authenticated) {
      getModelStatus()
        .then(s => { setModelTrained(s.model_trained); setModelLoading(false) })
        .catch(() => setModelLoading(false))
    }
  }, [authenticated])

  // 3. Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    if (!authenticated) return
    setError(null)
    try {
      let url = `/api/analytics/stats?range=${dateRange}`
      if (dateRange === 'custom' && customStart) {
        url += `&startDate=${encodeURIComponent(customStart)}`
        if (customEnd) url += `&endDate=${encodeURIComponent(customEnd)}`
      }
      const res = await fetch(url)
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      if (data.success) {
        setAnalytics(data)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อ Analytics API ได้')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [authenticated, dateRange, customStart, customEnd])

  useEffect(() => {
    if (authenticated) {
      setLoading(true)
      fetchAnalytics()
    }
  }, [authenticated, fetchAnalytics])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim()) return
    setAuthLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (data.success) {
        setAuthenticated(true)
        setPasswordInput('')
        toast.success(isTh ? 'เข้าสู่ระบบผู้ดูแลระบบสำเร็จ' : 'Admin Login Successful')
      } else {
        toast.error(data.error || 'รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      toast.error('การเข้าสู่ระบบล้มเหลว')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthenticated(false)
    setAnalytics(null)
    toast.success(isTh ? 'ออกจากระบบแล้ว' : 'Logged out')
  }

  // Original AI Retrain Handler
  const handleTrain = async () => {
    setTraining(true)
    try {
      const r = await trainModel()
      toast.success(isTh ? 'เริ่มกระบวนการฝึกโมเดล AI ในเบื้องหลังแล้ว' : r.message)
      setTimeout(() => {
        getModelStatus().then(s => setModelTrained(s.model_trained))
      }, 3000)
    } catch {
      toast.error(isTh ? 'การฝึกโมเดลล้มเหลว' : 'Training failed')
    } finally {
      setTraining(false)
    }
  }

  // Auth Loading View
  if (authenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner className="h-10 w-10" />
        <p className="text-xs text-gray-500 dark:text-slate-400">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
      </div>
    )
  }

  // Login Gate View
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="border-indigo-100 dark:border-indigo-900/60 shadow-xl shadow-indigo-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-3">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isTh ? 'เข้าสู่ระบบผู้ดูแลระบบ' : 'Admin Authentication'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Smart CPU Scheduler – Admin Analytics Dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  {isTh ? 'รหัสผ่านผู้ดูแลระบบ (Admin Password)' : 'Admin Password'}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder={isTh ? 'กรอกรหัสผ่านผู้ดูแลระบบ...' : 'Enter admin password...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <Button type="submit" loading={authLoading} className="w-full py-2.5">
                {isTh ? 'ยืนยันเพื่อเข้าสู่ Dashboard' : 'Unlock Dashboard'}
              </Button>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                🔒 {isTh
                  ? 'ระบบนี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบและอาจารย์ผู้ประเมินผล เพื่อความปลอดภัยของข้อมูลการใช้งาน'
                  : 'Restricted to administrators and evaluators. Protected by server-side verification.'}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nav Menu Items (TOR Section 4)
  const navTabs: { key: TabType; label: string; icon: typeof Users }[] = [
    { key: 'overview', label: isTh ? 'ภาพรวม' : 'Overview', icon: BarChart3 },
    { key: 'website', label: isTh ? 'สถิติเว็บไซต์' : 'Website Analytics', icon: Eye },
    { key: 'learning', label: isTh ? 'การเรียนรู้' : 'Learning Analytics', icon: HelpCircle },
    { key: 'simulation', label: isTh ? 'การจำลอง CPU' : 'CPU Simulations', icon: Cpu },
    { key: 'ai', label: isTh ? 'AI & AICS' : 'AI & AICS', icon: Brain },
    { key: 'quiz', label: isTh ? 'แบบฝึกหัด' : 'Quiz Analytics', icon: Award },
    { key: 'reports', label: isTh ? 'รายงาน' : 'Reports', icon: FileText },
    { key: 'settings', label: isTh ? 'ตั้งค่า & AI' : 'Settings', icon: Settings },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Admin Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Verified</span>
            </span>
            {analytics?.meta.supabase_connected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Database className="h-3 w-3" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                <Activity className="h-3 w-3" />
                <span>Live Event Engine</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            {isTh ? 'ศูนย์วิเคราะห์ข้อมูลสถิติ (Admin Analytics)' : 'Admin Analytics Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Smart CPU Scheduler – Version 1.0 (Educational Analytics Edition)
          </p>
        </div>

        {/* Global Controls: Date Range & Refresh & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector (TOR Section 3.2) */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '30d', '90d', 'custom'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-bold'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {r === '7d' ? (isTh ? '7 วัน' : '7 Days') :
                 r === '30d' ? (isTh ? '30 วัน' : '30 Days') :
                 r === '90d' ? (isTh ? '90 วัน' : '90 Days') :
                 (isTh ? 'กำหนดเอง' : 'Custom')}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            className="gap-1.5"
            title={isTh ? 'รีเฟรชข้อมูล' : 'Refresh data'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isTh ? 'รีเฟรช' : 'Refresh'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5"
            title={isTh ? 'ออกจากระบบ' : 'Logout'}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isTh ? 'ออก' : 'Logout'}</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker bar */}
      {dateRange === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center gap-3 text-xs">
          <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-gray-700 dark:text-slate-300">
            {isTh ? 'กำหนดช่วงวันที่:' : 'Select Range:'}
          </span>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
          <span>-</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
          <Button size="sm" onClick={fetchAnalytics} className="py-1 px-3 text-xs">
            {isTh ? 'นำไปใช้' : 'Apply'}
          </Button>
        </div>
      )}

      {/* Admin Tab Navigation Bar (TOR Section 4) */}
      <div className="flex overflow-x-auto gap-1 border-b border-gray-200 dark:border-slate-800 pb-1 scrollbar-none">
        {navTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner className="h-10 w-10" />
          <p className="text-xs text-gray-500 dark:text-slate-400">กำลังประมวลผลข้อมูลสถิติ...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20">
          <CardContent className="py-12 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{error}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isTh ? 'กรุณาตรวจสอบการเชื่อมต่อ หรือลองรีเฟรชข้อมูลใหม่อีกครั้ง' : 'Please check connection and retry.'}
            </p>
            <Button size="sm" onClick={fetchAnalytics} className="mt-2">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>{isTh ? 'ลองใหม่อีกครั้ง' : 'Retry'}</span>
            </Button>
          </CardContent>
        </Card>
      ) : !analytics ? (
        <Card>
          <CardContent className="py-16 text-center text-xs text-gray-500">
            {isTh ? 'ไม่มีข้อมูลสถิติสำหรับช่วงเวลานี้' : 'No analytics data found.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Definition Alert Note (TOR Section 3.1) */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <AlertCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong>{isTh ? 'นิยามการนับผู้เข้าชม (TOR Section 3.1):' : 'Visitor Definition:'}</strong>{' '}
                  {isTh
                    ? 'จำนวนผู้เข้าชมเป็นค่าประมาณการจาก Unique Session ID ที่ไม่ระบุตัวตน (Anonymous) โดยระบบไม่จัดเก็บ IP หรือ Fingerprint เพื่อเคารพความเป็นส่วนตัวของผู้เรียนตามข้อกำหนด TOR'
                    : 'Estimated visitors are calculated from anonymous session identifiers without tracking IP addresses or fingerprinting.'}
                </div>
              </div>

              {/* 8 Statistic Cards (TOR Section 3.1) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title={isTh ? 'ผู้เข้าชมทั้งหมด (โดยประมาณ)' : 'Total Visitors'}
                  value={analytics.overview.totalVisitors.toLocaleString()}
                  sub={isTh ? 'Unique Sessions' : 'Unique Sessions'}
                  icon={Users}
                  color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                />
                <StatCard
                  title={isTh ? 'ผู้เข้าชมวันนี้' : 'Today Visitors'}
                  value={analytics.overview.todayVisitors.toLocaleString()}
                  sub={isTh ? `เปิดชม ${analytics.overview.todayPageViews} หน้า` : `${analytics.overview.todayPageViews} Views`}
                  icon={TrendingUp}
                  color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
                />
                <StatCard
                  title={isTh ? 'ผู้เข้าชมเดือนนี้' : 'Monthly Visitors'}
                  value={analytics.overview.monthlyVisitors.toLocaleString()}
                  sub={isTh ? 'ช่วง 30 วันล่าสุด' : 'Last 30 days'}
                  icon={Calendar}
                  color="text-purple-600 bg-purple-50 dark:bg-purple-950/60"
                />
                <StatCard
                  title={isTh ? 'ผู้ใช้งานออนไลน์ (5 นาที)' : 'Active Visitors'}
                  value={analytics.overview.activeVisitors.toLocaleString()}
                  sub={isTh ? 'มีกิจกรรมล่าสุด' : 'Active in 5 mins'}
                  icon={Activity}
                  color="text-pink-600 bg-pink-50 dark:bg-pink-950/60"
                />
                <StatCard
                  title={isTh ? 'จำนวนการเปิดหน้า (Page Views)' : 'Total Page Views'}
                  value={analytics.overview.totalPageViews.toLocaleString()}
                  sub={isTh ? 'ทุกหน้ารวมกัน' : 'All pages aggregated'}
                  icon={Eye}
                  color="text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60"
                />
                <StatCard
                  title={isTh ? 'การจำลอง CPU ทั้งหมด' : 'CPU Simulations'}
                  value={analytics.simulation.total.toLocaleString()}
                  sub={isTh ? `FCFS, SJF, RR ฯลฯ` : 'Across algorithms'}
                  icon={Cpu}
                  color="text-amber-600 bg-amber-50 dark:bg-amber-950/60"
                />
                <StatCard
                  title={isTh ? 'การเรียกใช้ AI & AICS' : 'AI & AICS Calls'}
                  value={analytics.ai.totalAiCalls.toLocaleString()}
                  sub={isTh ? `สำเร็จ ${analytics.ai.successRate}%` : `${analytics.ai.successRate}% Success`}
                  icon={Brain}
                  color="text-teal-600 bg-teal-50 dark:bg-teal-950/60"
                />
                <StatCard
                  title={isTh ? 'การทำแบบฝึกหัด (Quiz)' : 'Quiz Submissions'}
                  value={analytics.quiz.submitCount.toLocaleString()}
                  sub={isTh ? `เฉลี่ย ${analytics.quiz.averageScorePercent}%` : `Avg ${analytics.quiz.averageScorePercent}%`}
                  icon={Award}
                  color="text-orange-600 bg-orange-50 dark:bg-orange-950/60"
                />
              </div>

              {/* Main Charts: Traffic Trends & Device Distribution */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Traffic Trend Chart (2 Cols) */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <span>{isTh ? 'แนวโน้มการเข้าชมและการเปิดหน้า (Traffic Trends)' : 'Daily Traffic Trends'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {isTh ? 'จำนวนผู้เข้าชมและ Page Views รายวัน' : 'Daily visitors and page views'}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analytics.overview.trafficTrends.length === 0 ? (
                      <EmptyState text={isTh ? 'ยังไม่มีข้อมูลแนวโน้มในช่วงเวลานี้' : 'No traffic trend data'} />
                    ) : (
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.overview.trafficTrends}>
                            <defs>
                              <linearGradient id={pvGradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id={visGradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '12px',
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: '#fff',
                                border: 'none',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                            <Area
                              type="monotone"
                              dataKey="pageViews"
                              name={isTh ? 'การเปิดหน้า (Page Views)' : 'Page Views'}
                              stroke="#6366f1"
                              fillOpacity={1}
                              fill={`url(#${pvGradId})`}
                            />
                            <Area
                              type="monotone"
                              dataKey="visitors"
                              name={isTh ? 'ผู้เข้าชม (Visitors)' : 'Visitors'}
                              stroke="#10b981"
                              fillOpacity={1}
                              fill={`url(#${visGradId})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Device Breakdown Pie Chart (1 Col) */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-indigo-600" />
                      <span>{isTh ? 'สัดส่วนอุปกรณ์ (Device Types)' : 'Device Share'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {isTh ? 'Desktop, Mobile และ Tablet' : 'Desktop, Mobile & Tablet'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.overview.deviceStats}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={4}
                          >
                            {analytics.overview.deviceStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              background: 'rgba(15, 23, 42, 0.9)',
                              color: '#fff',
                              border: 'none',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      {analytics.overview.deviceStats.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                            />
                            <span className="text-gray-700 dark:text-slate-300">{d.name}</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {d.percent}% ({d.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Pages Table */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>{isTh ? 'หน้าเว็บไซต์ยอดนิยม (Popular Pages)' : 'Popular Pages'}</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400">
                          <th className="pb-2 font-semibold">URL Path</th>
                          <th className="pb-2 font-semibold">{isTh ? 'ชื่อหน้า' : 'Page Name'}</th>
                          <th className="pb-2 font-semibold text-right">{isTh ? 'จำนวนการเปิด (Views)' : 'Views'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {analytics.overview.popularPages.map(p => (
                          <tr key={p.path} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                              {p.path}
                            </td>
                            <td className="py-2.5 text-gray-700 dark:text-slate-300">
                              {p.path === '/' ? (isTh ? 'หน้าแรก (Home)' : 'Home') :
                               p.path === '/simulator' ? (isTh ? 'ระบบจำลอง (Simulator)' : 'Simulator') :
                               p.path === '/compare' ? (isTh ? 'เปรียบเทียบอัลกอริทึม (Compare)' : 'Compare') :
                               p.path === '/help' ? (isTh ? 'ศูนย์ช่วยเหลือ (Help Center)' : 'Help') :
                               p.path === '/history' ? (isTh ? 'ประวัติ (History)' : 'History') :
                               p.path === '/admin' ? (isTh ? 'ผู้ดูแลระบบ (Admin)' : 'Admin') : p.path}
                            </td>
                            <td className="py-2.5 font-bold text-right text-gray-900 dark:text-white">
                              {p.views.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: WEBSITE ANALYTICS */}
          {activeTab === 'website' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Comparison */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {isTh ? 'เปรียบเทียบผู้เข้าชมรายเดือน' : 'Monthly Comparison'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {isTh ? 'จำนวนผู้เข้าชมและ Page Views แยกตามเดือน' : 'Aggregated by month'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.overview.monthlyComparison}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              background: 'rgba(15, 23, 42, 0.9)',
                              color: '#fff',
                              border: 'none',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                          <Bar dataKey="visitors" name={isTh ? 'ผู้เข้าชม (Visitors)' : 'Visitors'} fill="#6366f1" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="pageViews" name={isTh ? 'Page Views' : 'Page Views'} fill="#06b6d4" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Pages Bar Chart */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {isTh ? 'กราฟแท่งหน้าเว็บไซต์ยอดนิยม' : 'Page Views by Path'}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.overview.popularPages.slice(0, 6)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="path" type="category" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              background: 'rgba(15, 23, 42, 0.9)',
                              color: '#fff',
                              border: 'none',
                            }}
                          />
                          <Bar dataKey="views" name={isTh ? 'จำนวนครั้งที่เปิด' : 'Views'} fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING ANALYTICS */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard
                  title={isTh ? 'การเปิดบทเรียนทั้งหมด' : 'Total Lesson Views'}
                  value={analytics.learning.totalLessonOpens.toLocaleString()}
                  sub={isTh ? 'รวมทุกขั้นตอนและหัวข้อ' : 'All steps combined'}
                  icon={HelpCircle}
                  color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                />
                <StatCard
                  title={isTh ? 'เปิดคู่มือ 5 ขั้นตอน' : '5-Step Guide Opens'}
                  value={analytics.learning.guideOpens.toLocaleString()}
                  sub={isTh ? 'User Guide Modal' : 'Modal interactions'}
                  icon={Layers}
                  color="text-teal-600 bg-teal-50 dark:bg-teal-950/60"
                />
                <StatCard
                  title={isTh ? 'ทัวร์แนะนำเว็บไซต์สำเร็จ' : 'Tour Completions'}
                  value={analytics.learning.onboardingTourCompletions.toLocaleString()}
                  sub={isTh ? 'Interactive Tour' : 'Completed all steps'}
                  icon={Sparkles}
                  color="text-amber-600 bg-amber-50 dark:bg-amber-950/60"
                />
              </div>

              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'บทเรียนและหัวข้อที่ได้รับความนิยม (Popular Educational Topics)' : 'Popular Educational Lessons'}
                  </h3>
                </CardHeader>
                <CardContent>
                  {analytics.learning.topics.length === 0 ? (
                    <EmptyState text={isTh ? 'ยังไม่มีข้อมูลการเปิดบทเรียนในช่วงเวลานี้' : 'No lesson interactions'} />
                  ) : (
                    <div className="space-y-3">
                      {analytics.learning.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                          <span className="font-medium text-xs sm:text-sm text-gray-800 dark:text-slate-200">
                            {t.topic}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                            {t.count} {isTh ? 'ครั้ง' : 'times'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: CPU SIMULATION ANALYTICS */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {analytics.simulation.algorithms.map(a => (
                  <div
                    key={a.algorithm}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-center space-y-1 shadow-sm"
                  >
                    <span className="text-xs font-bold font-mono text-gray-500 dark:text-slate-400">
                      {a.algorithm}
                    </span>
                    <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                      {a.count.toLocaleString()}
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {a.percent}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {isTh ? 'กราฟแท่งจำนวนการใช้งานแยกตามอัลกอริทึม' : 'Usage by Algorithm'}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.simulation.algorithms}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="algorithm" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              background: 'rgba(15, 23, 42, 0.9)',
                              color: '#fff',
                              border: 'none',
                            }}
                          />
                          <Bar dataKey="count" name={isTh ? 'จำนวนครั้ง' : 'Runs'}>
                            {analytics.simulation.algorithms.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={ALGO_COLORS[entry.algorithm] || '#6366f1'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {isTh ? 'สัดส่วนความนิยมอัลกอริทึม' : 'Algorithm Popularity Share'}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.simulation.algorithms}
                            dataKey="count"
                            nameKey="algorithm"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={entry => `${entry.algorithm}: ${entry.percent}%`}
                          >
                            {analytics.simulation.algorithms.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={ALGO_COLORS[entry.algorithm] || '#6366f1'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              background: 'rgba(15, 23, 42, 0.9)',
                              color: '#fff',
                              border: 'none',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 5: AI & AICS ANALYTICS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                  title={isTh ? 'ขอคำแนะนำ AI ทั้งหมด' : 'AI Recommendations'}
                  value={analytics.ai.recommendationsCount.toLocaleString()}
                  sub={isTh ? 'Workload Analysis' : 'Workload Analysis'}
                  icon={Brain}
                  color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                />
                <StatCard
                  title={isTh ? 'เปรียบเทียบอัลกอริทึม' : 'Algorithm Comparisons'}
                  value={analytics.ai.comparisonCount.toLocaleString()}
                  sub={isTh ? 'Multi-algo Runs' : 'Multi-algo Runs'}
                  icon={BarChart3}
                  color="text-purple-600 bg-purple-50 dark:bg-purple-950/60"
                />
                <StatCard
                  title={isTh ? 'ใช้งานอัลกอริทึม AICS' : 'AICS Adaptive Runs'}
                  value={analytics.ai.aicsRunsCount.toLocaleString()}
                  sub={isTh ? 'Dynamic Adaptation' : 'Dynamic Adaptation'}
                  icon={Sparkles}
                  color="text-teal-600 bg-teal-50 dark:bg-teal-950/60"
                />
                <StatCard
                  title={isTh ? 'อัตราความสำเร็จ (Success Rate)' : 'AI Success Rate'}
                  value={`${analytics.ai.successRate}%`}
                  sub={isTh ? 'ความพร้อมใช้งานโมเดล' : 'Operational reliability'}
                  icon={CheckCircle2}
                  color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
                />
              </div>

              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'บทบาทของ AI และอัลกอริทึม AICS ในการศึกษา' : 'Educational Role of AI & AICS'}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    ระบบจำลอง <strong>AICS (Adaptive Intelligent CPU Scheduler)</strong> สกัดคุณลักษณะของโพรเซส เช่น ค่าความแปรปรวนของเวลาประมวลผล (Variance of Burst Time) และการกระจายตัวของเวลามาถึง (Arrival Distribution) ทำให้นักเรียนสามารถเปรียบเทียบการตัดสินใจของมนุษย์กับอัลกอริทึมปรับตัวอัตโนมัติได้อย่างเป็นรูปธรรม
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: QUIZ ANALYTICS */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard
                  title={isTh ? 'จำนวนครั้งที่เริ่มทำแบบฝึกหัด' : 'Quiz Starts'}
                  value={analytics.quiz.startCount.toLocaleString()}
                  sub={isTh ? 'Started Quiz' : 'Started Quiz'}
                  icon={Award}
                  color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                />
                <StatCard
                  title={isTh ? 'จำนวนครั้งที่ส่งคำตอบ' : 'Quiz Submissions'}
                  value={analytics.quiz.submitCount.toLocaleString()}
                  sub={isTh ? 'Completed Quiz' : 'Completed Quiz'}
                  icon={CheckCircle2}
                  color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
                />
                <StatCard
                  title={isTh ? 'คะแนนเฉลี่ยรวม (ไม่ระบุตัวตน)' : 'Average Score'}
                  value={`${analytics.quiz.averageScorePercent}%`}
                  sub={isTh ? 'Anonymous Aggregate' : 'Anonymous Aggregate'}
                  icon={TrendingUp}
                  color="text-amber-600 bg-amber-50 dark:bg-amber-950/60"
                />
              </div>

              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'หัวข้อที่มีอัตราการตอบผิดสูง (จุดที่ผู้เรียนยังสับสน)' : 'Topics with High Error Rates (Areas for Learning Intervention)'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isTh
                      ? 'ช่วยให้อาจารย์และผู้พัฒนาทราบว่าควรปรับปรุงเนื้อหาหรืออธิบายเพิ่มเติมในหัวข้อใด'
                      : 'Guides pedagogical improvements based on learner error patterns.'}
                  </p>
                </CardHeader>
                <CardContent>
                  {analytics.quiz.weakTopics.length === 0 ? (
                    <EmptyState text={isTh ? 'ยังไม่มีข้อมูลการส่งคำตอบแบบฝึกหัดในช่วงเวลานี้' : 'No quiz submissions recorded'} />
                  ) : (
                    <div className="space-y-3">
                      {analytics.quiz.weakTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                              {topic.topic}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 block">
                              {isTh ? `ส่งคำตอบทั้งหมด ${topic.totalAttempts} ครั้ง` : `${topic.totalAttempts} responses`}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-red-500">
                              {topic.incorrectRate}%
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {isTh ? 'อัตราตอบผิด' : 'Error rate'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {isTh ? 'รายงานสรุปภาพรวมการประเมินผลนวัตกรรมทางการศึกษา' : 'Educational Innovation Analytics Report'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {isTh ? `ช่วงวันที่: ${analytics.meta.startDate.split('T')[0]} ถึง ${analytics.meta.endDate.split('T')[0]}` : `Period: ${analytics.meta.startDate.split('T')[0]} to ${analytics.meta.endDate.split('T')[0]}`}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-1.5">
                    <Printer className="h-4 w-4" />
                    <span>{isTh ? 'พิมพ์ / ส่งออก PDF' : 'Print / Export PDF'}</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        <tr>
                          <th className="p-3 font-semibold">{isTh ? 'ดัชนีชี้วัด (Key Indicator)' : 'Metric'}</th>
                          <th className="p-3 font-semibold text-right">{isTh ? 'ค่าสถิติ (Value)' : 'Value'}</th>
                          <th className="p-3 font-semibold">{isTh ? 'หน่วยนับ / คำอธิบาย' : 'Unit / Description'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-3 font-medium">Estimated Visitors</td>
                          <td className="p-3 font-bold text-right text-indigo-600 dark:text-indigo-400">{analytics.overview.totalVisitors.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? 'Unique Sessions (ไม่ระบุตัวตน)' : 'Unique anonymous sessions'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Total Page Views</td>
                          <td className="p-3 font-bold text-right">{analytics.overview.totalPageViews.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? 'ครั้งที่มีการเปิดหน้า' : 'Total page navigations'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">CPU Simulations Run</td>
                          <td className="p-3 font-bold text-right text-emerald-600 dark:text-emerald-400">{analytics.simulation.total.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? 'ครั้งการจำลองอัลกอริทึม' : 'Total simulations'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">AI & AICS Interactions</td>
                          <td className="p-3 font-bold text-right text-teal-600 dark:text-teal-400">{analytics.ai.totalAiCalls.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? 'ครั้งที่ขอคำแนะนำหรือรัน AICS' : 'Recommendations & adaptive runs'}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Quiz Submissions</td>
                          <td className="p-3 font-bold text-right text-amber-600 dark:text-amber-400">{analytics.quiz.submitCount.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? `ส่งคำตอบสำเร็จ (คะแนนเฉลี่ย ${analytics.quiz.averageScorePercent}%)` : `Completed tests (Avg ${analytics.quiz.averageScorePercent}%)`}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Lesson & Guide Views</td>
                          <td className="p-3 font-bold text-right text-purple-600 dark:text-purple-400">{analytics.learning.totalLessonOpens.toLocaleString()}</td>
                          <td className="p-3 text-gray-500 dark:text-slate-400">{isTh ? 'ครั้งการเปิดอ่านคู่มือและบทเรียน' : 'Guide and lesson interactions'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    📝 <strong>หมายเหตุประกอบรายงาน:</strong> ข้อมูลนี้จัดทำขึ้นเพื่อสนับสนุนการประเมินผลการใช้นวัตกรรมการศึกษา Smart CPU Scheduler โดยยึดหลักจริยธรรมข้อมูล ไม่เก็บรหัสผ่าน ไม่เก็บ IP และไม่สร้างโปรไฟล์ติดตามตัวตนของนักเรียนรายบุคคล
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 8: SETTINGS & ORIGINAL AI TRAINING */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Preserved Original Feature: AI Model Status & Retrain (TOR Section 9) */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{t.admin.mlStatus} (Machine Learning Model Management)</span>
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modelLoading ? (
                    <p className="text-gray-400 dark:text-slate-500 text-sm">กำลังตรวจสอบสถานะโมเดล...</p>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                      {modelTrained ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold block text-sm">
                              {t.admin.modelReady}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              Random Forest Classifier พร้อมสำหรับวิเคราะห์ภาระงาน
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                          <span className="text-gray-600 dark:text-slate-300 font-medium text-sm">
                            {t.admin.modelNotReady}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <Button onClick={handleTrain} loading={training} className="py-2.5">
                    <Brain className="h-4 w-4" /> {modelTrained ? t.admin.retrainBtn : t.admin.trainBtn}
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    {t.admin.trainDesc}
                  </p>
                </CardContent>
              </Card>

              {/* Database & Data Retention Settings */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span>{isTh ? 'สถานะฐานข้อมูลและนโยบายการจัดเก็บ (Database & Retention)' : 'Database & Retention'}</span>
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                    <span>{isTh ? 'การเชื่อมต่อ Supabase PostgreSQL' : 'Supabase PostgreSQL Connection'}</span>
                    <span className={`font-bold ${analytics.meta.supabase_connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {analytics.meta.supabase_connected
                        ? (isTh ? '✓ เชื่อมต่อสำเร็จ (Production Live)' : '✓ Connected')
                        : (isTh ? '⚡ โหมดเครื่องพัฒนา (Local In-Memory Engine)' : '⚡ Local Engine')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {isTh ? 'นโยบายการเก็บรักษาข้อมูล (Data Retention Policy):' : 'Data Retention Policy:'}
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-slate-400">
                      <li>{isTh ? 'เก็บ Events รายละเอียดไว้เป็นเวลา 90 วันเพื่อการวิเคราะห์ทางสถิติ' : 'Detailed events kept for 90 days'}</li>
                      <li>{isTh ? 'สรุปข้อมูลรายวัน (analytics_daily_summary) จัดเก็บต่อเนื่องโดยไม่สิ้นเปลืองพื้นที่' : 'Daily summaries retained indefinitely'}</li>
                      <li>{isTh ? 'ไม่เก็บที่อยู่ IP หรือข้อมูลส่วนบุคคลใดๆ ของนักเรียน' : 'No personal data or IP stored'}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  sub: string
  icon: typeof Users
  color: string
}) {
  return (
    <Card className="border-gray-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 line-clamp-1">{title}</span>
          <div className={`p-2 rounded-xl shrink-0 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-slate-500 font-medium line-clamp-1">
          {sub}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-gray-400 dark:text-slate-500 text-xs">
      <Layers className="h-8 w-8 text-gray-300 dark:text-slate-600" />
      <span>{text}</span>
    </div>
  )
}
