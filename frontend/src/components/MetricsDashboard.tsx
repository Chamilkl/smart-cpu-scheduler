'use client'
import { Metrics } from '@/lib/types'
import { formatNumber } from '@/lib/utils'
import { Clock, Timer, Zap, Activity, RefreshCw, BarChart2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { TechnicalTooltip } from '@/components/TechnicalTooltip'
import { TECHNICAL_GLOSSARY } from '@/lib/constants'

interface Props {
  metrics: Metrics
  algorithm: string
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  colorLight,
  colorDark,
  tooltipKey,
}: {
  icon: React.ElementType
  label: string
  value: string
  unit: string
  colorLight: string
  colorDark: string
  tooltipKey: keyof typeof TECHNICAL_GLOSSARY
}) => (
  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-all">
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${colorLight} ${colorDark} shrink-0`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">{label}</p>
        <TechnicalTooltip termKey={tooltipKey} />
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
        {value} <span className="text-xs font-normal text-gray-500 dark:text-slate-400">{unit}</span>
      </p>
    </div>
  </div>
)

export function MetricsDashboard({ metrics, algorithm }: Props) {
  const { t } = useLanguage()

  const cards: {
    icon: React.ElementType
    label: string
    value: string
    unit: string
    colorLight: string
    colorDark: string
    tooltipKey: keyof typeof TECHNICAL_GLOSSARY
  }[] = [
    {
      icon: Clock,
      label: t.metrics.avgWaitingTime,
      value: formatNumber(metrics.avg_waiting_time),
      unit: 'ms',
      colorLight: 'bg-indigo-100 text-indigo-600',
      colorDark: 'dark:bg-indigo-950 dark:text-indigo-400',
      tooltipKey: 'wt',
    },
    {
      icon: Timer,
      label: t.metrics.avgTurnaroundTime,
      value: formatNumber(metrics.avg_turnaround_time),
      unit: 'ms',
      colorLight: 'bg-purple-100 text-purple-600',
      colorDark: 'dark:bg-purple-950 dark:text-purple-400',
      tooltipKey: 'tat',
    },
    {
      icon: Zap,
      label: t.metrics.avgResponseTime,
      value: formatNumber(metrics.avg_response_time),
      unit: 'ms',
      colorLight: 'bg-pink-100 text-pink-600',
      colorDark: 'dark:bg-pink-950 dark:text-pink-400',
      tooltipKey: 'rt',
    },
    {
      icon: Activity,
      label: t.metrics.cpuUtilization,
      value: formatNumber(metrics.cpu_utilization),
      unit: '%',
      colorLight: 'bg-emerald-100 text-emerald-600',
      colorDark: 'dark:bg-emerald-950 dark:text-emerald-400',
      tooltipKey: 'cpu_util',
    },
    {
      icon: RefreshCw,
      label: t.metrics.contextSwitches,
      value: String(metrics.context_switches),
      unit: 'ครั้ง',
      colorLight: 'bg-orange-100 text-orange-600',
      colorDark: 'dark:bg-orange-950 dark:text-orange-400',
      tooltipKey: 'context_switch',
    },
    {
      icon: BarChart2,
      label: t.metrics.throughput,
      value: formatNumber(metrics.throughput, 4),
      unit: 'งาน/ms',
      colorLight: 'bg-teal-100 text-teal-600',
      colorDark: 'dark:bg-teal-950 dark:text-teal-400',
      tooltipKey: 'throughput',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {t.simulator.metricsTitle}
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
          {algorithm}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(c => <MetricCard key={c.label} {...c} />)}
      </div>
    </div>
  )
}
