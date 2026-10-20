'use client'
import { AICSSDecision } from '@/lib/types'
import { AlgorithmBadge } from '@/components/ui/Badge'
import { CheckCircle2, Cpu, Sliders, Activity } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  decision: AICSSDecision
}

export function AICSStepper({ decision }: Props) {
  const { t, lang } = useLanguage()

  const steps = [
    {
      icon: Activity,
      label: t.aics.step1,
      detail: `${decision.workload_features?.n_processes || 0} ${lang === 'th' ? 'โพรเซสที่ถูกวิเคราะห์' : 'processes analyzed'} (Burst CV = ${decision.workload_features?.burst_cv ?? 0})`
    },
    {
      icon: Cpu,
      label: t.aics.step2,
      detail: `${lang === 'th' ? 'นโยบายที่เลือก:' : 'Selected policy:'} ${decision.selected_policy}`
    },
    {
      icon: Sliders,
      label: t.aics.step3,
      detail: decision.time_quantum_used
        ? `Time Quantum = ${decision.time_quantum_used} ms`
        : (lang === 'th' ? 'ไม่ต้องปรับพารามิเตอร์' : 'No tuning needed')
    },
    {
      icon: CheckCircle2,
      label: t.aics.step4,
      detail: lang === 'th' ? 'คำนวณตัวชี้วัดประสิทธิภาพครบถ้วน' : 'Computed performance metrics'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
        <span className="text-sm font-semibold text-teal-900 dark:text-teal-200">{t.aics.selectedPolicy}</span>
        <AlgorithmBadge label={decision.selected_policy} />
        {decision.time_quantum_used && (
          <span className="text-xs text-teal-700 dark:text-teal-300 font-mono">(TQ = {decision.time_quantum_used} ms)</span>
        )}
      </div>

      {/* Step indicators */}
      <div className="relative pl-1">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 mb-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/60 shadow-sm">
                <step.icon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-full bg-teal-100 dark:bg-teal-900/60 mt-1" />}
            </div>
            <div className="pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{step.label}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Decision trace */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t.aics.decisionTrace}</p>
        <div className="space-y-1.5">
          {decision.decision_steps.map((s, i) => (
            <div key={i} className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-slate-800 font-mono">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
