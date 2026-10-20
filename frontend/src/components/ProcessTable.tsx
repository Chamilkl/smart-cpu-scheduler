'use client'
import { ProcessInput } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { TechnicalTooltip } from '@/components/TechnicalTooltip'

interface Props {
  processes: ProcessInput[]
  onRemove: (i: number) => void
}

export function ProcessTable({ processes, onRemove }: Props) {
  const { t } = useLanguage()

  if (processes.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">{t.simulator.noProcesses}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pb-2 pr-4">
              <span className="inline-flex items-center">{t.simulator.tableHeaders.pid} <TechnicalTooltip termKey="pid" /></span>
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pb-2 pr-4">
              <span className="inline-flex items-center">{t.simulator.tableHeaders.at} <TechnicalTooltip termKey="at" /></span>
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pb-2 pr-4">
              <span className="inline-flex items-center">{t.simulator.tableHeaders.bt} <TechnicalTooltip termKey="bt" /></span>
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pb-2 pr-4">
              <span className="inline-flex items-center">{t.simulator.tableHeaders.priority} <TechnicalTooltip termKey="priority" /></span>
            </th>
            <th className="text-right pb-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
          {processes.map((p, i) => (
            <tr key={p.pid} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 pr-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{p.pid}</td>
              <td className="py-2.5 pr-4 text-gray-700 dark:text-slate-300">{p.arrival_time} ms</td>
              <td className="py-2.5 pr-4 text-gray-700 dark:text-slate-300">{p.burst_time} ms</td>
              <td className="py-2.5 pr-4">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  p.priority <= 2
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : p.priority <= 4
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>{p.priority}</span>
              </td>
              <td className="py-2.5 text-right">
                <Button variant="ghost" size="sm" onClick={() => onRemove(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 h-auto">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
