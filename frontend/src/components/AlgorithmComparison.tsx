'use client'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { algorithmColor, formatNumber } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

interface AlgoMetrics {
  metrics: {
    avg_waiting_time: number
    avg_turnaround_time: number
    avg_response_time: number
    context_switches: number
    cpu_utilization: number
  }
  selected_policy?: string
}

interface Props {
  comparison: Record<string, AlgoMetrics>
}

export function AlgorithmComparison({ comparison }: Props) {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()

  const data = useMemo(() => {
    return Object.entries(comparison).map(([algo, result]) => ({
      name: algo,
      'Avg WT': result.metrics.avg_waiting_time,
      'Avg TAT': result.metrics.avg_turnaround_time,
      'Avg RT': result.metrics.avg_response_time,
      'CPU %': result.metrics.cpu_utilization,
    }))
  }, [comparison])

  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800">
              <th className="text-left pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {lang === 'th' ? 'อัลกอริทึม' : 'Algorithm'}
              </th>
              <th className="text-right pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {lang === 'th' ? 'เวลารอคอย (WT)' : 'Avg WT'}
              </th>
              <th className="text-right pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {lang === 'th' ? 'เวลารอบงาน (TAT)' : 'Avg TAT'}
              </th>
              <th className="text-right pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {lang === 'th' ? 'เวลาตอบสนอง (RT)' : 'Avg RT'}
              </th>
              <th className="text-right pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                CPU %
              </th>
              <th className="text-right pb-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                {lang === 'th' ? 'สลับบริบท' : 'CS'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {Object.entries(comparison).map(([algo, result]) => {
              const allWT = Object.values(comparison).map(r => r.metrics.avg_waiting_time)
              const isMinWT = result.metrics.avg_waiting_time === Math.min(...allWT)
              return (
                <tr key={algo} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: algorithmColor(algo) }} />
                      <span className="font-semibold text-gray-900 dark:text-white">{algo}</span>
                      {result.selected_policy && (
                        <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md font-mono">
                          → {result.selected_policy}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`py-3 text-right font-mono ${isMinWT ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-slate-300'}`}>
                    {formatNumber(result.metrics.avg_waiting_time)} ms
                  </td>
                  <td className="py-3 text-right font-mono text-gray-700 dark:text-slate-300">{formatNumber(result.metrics.avg_turnaround_time)} ms</td>
                  <td className="py-3 text-right font-mono text-gray-700 dark:text-slate-300">{formatNumber(result.metrics.avg_response_time)} ms</td>
                  <td className="py-3 text-right font-mono text-gray-700 dark:text-slate-300">{formatNumber(result.metrics.cpu_utilization)}%</td>
                  <td className="py-3 text-right font-mono text-gray-700 dark:text-slate-300">{result.metrics.context_switches}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">{t.compare.visualComparison}</p>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Avg WT" name={lang === 'th' ? 'เวลารอคอยเฉลี่ย' : 'Avg WT'} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg TAT" name={lang === 'th' ? 'เวลารอบงานเฉลี่ย' : 'Avg TAT'} fill="#a855f7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg RT" name={lang === 'th' ? 'เวลาตอบสนองเฉลี่ย' : 'Avg RT'} fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
