'use client'
import { HistoryRecord } from '@/lib/types'
import { AlgorithmBadge } from '@/components/ui/Badge'
import { formatNumber } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  records: HistoryRecord[]
  onSelect?: (r: HistoryRecord) => void
}

export function SimulationHistoryList({ records, onSelect }: Props) {
  const { t } = useLanguage()

  if (records.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-10">{t.history.noHistory}</p>
  }
  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {records.map(r => (
        <div
          key={r.id}
          className="flex items-center gap-4 py-3.5 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 px-3 rounded-xl cursor-pointer transition-colors"
          onClick={() => onSelect?.(r)}
        >
          <AlgorithmBadge label={r.algorithm} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
              {r.processes_input?.length || 0} {t.history.processesCount}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-slate-400">
            <div>WT: <strong className="text-gray-700 dark:text-slate-200">{formatNumber(r.metrics.avg_waiting_time)} ms</strong></div>
            <div>TAT: <strong className="text-gray-700 dark:text-slate-200">{formatNumber(r.metrics.avg_turnaround_time)} ms</strong></div>
          </div>
        </div>
      ))}
    </div>
  )
}
