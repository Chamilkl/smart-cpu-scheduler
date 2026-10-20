'use client'
import { AIRecommendation as AIRec } from '@/lib/types'
import { AlgorithmBadge } from '@/components/ui/Badge'
import { Lightbulb, CheckCircle2, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  recommendation: AIRec
  onApply?: (algo: string) => void
}

export function AIRecommendationCard({ recommendation: rec, onApply }: Props) {
  const { t } = useLanguage()
  const confidence = Math.round(rec.confidence * 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shadow-sm">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t.ai.recommended}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <AlgorithmBadge label={rec.recommended_algorithm} className="text-sm px-3 py-0.5 font-bold" />
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{confidence}%</span>
          </div>
        </div>
        {onApply && (
          <button
            onClick={() => onApply(rec.recommended_algorithm)}
            className="ml-auto text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            {t.ai.applyBtn}
          </button>
        )}
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5 font-medium">
          <span>{t.ai.confidence}</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{confidence}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 transition-all duration-700"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">{t.ai.reasoning}</p>
        <ul className="space-y-2">
          {rec.reasoning.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Comparison Preview */}
      {rec.comparison_preview && (
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">{t.ai.quickComparison}</p>
          <div className="space-y-1.5">
            {Object.entries(rec.comparison_preview).map(([algo, m]) => (
              <div key={algo} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                <AlgorithmBadge label={algo} className="w-20 justify-center" />
                <div className="flex-1 flex items-center gap-3 text-xs text-gray-600 dark:text-slate-300">
                  <span>WT: <strong>{formatNumber(m.avg_waiting_time)}</strong></span>
                  <span>TAT: <strong>{formatNumber(m.avg_turnaround_time)}</strong></span>
                </div>
                {algo === rec.recommended_algorithm && (
                  <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold gap-0.5">
                    <TrendingDown className="h-3 w-3" /> ดีที่สุด
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
