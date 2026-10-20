'use client'
import { useState } from 'react'
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/constants'
import { ProcessInput } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { Database, Sparkles, ChevronDown, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  onSelectPreset: (processes: ProcessInput[]) => void
  onRandomSample: () => void
}

export function SampleDatasetSelector({ onSelectPreset, onRandomSample }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const { lang } = useLanguage()
  const isTh = lang === 'th'

  const handleSelect = (preset: SamplePreset) => {
    setSelectedId(preset.id)
    onSelectPreset(preset.processes)
    setOpen(false)
    toast.success(isTh ? `โหลด "${preset.nameTh}" สำเร็จ` : `Loaded "${preset.nameEn}"`)
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-sm"
        >
          <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>{isTh ? 'เลือกชุดข้อมูลตัวอย่าง (3 รูปแบบ)' : 'Sample Presets (3 Datasets)'}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onRandomSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title={isTh ? 'สุ่มชุดข้อมูลแบบสุ่ม' : 'Random Sample'}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>{isTh ? 'สุ่มข้อมูล' : 'Random'}</span>
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 sm:left-0 z-40 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                {isTh ? 'ชุดข้อมูลสำหรับทดลองเรียนรู้ (TOR 3.6)' : 'Educational Sample Presets'}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {isTh ? 'เลือกชุดข้อมูลเพื่อทดลองกับอัลกอริทึมต่างๆ ได้ทันที' : 'Select a preset to inspect different scheduling behaviors'}
              </span>
            </div>

            <div className="space-y-1">
              {SAMPLE_PRESETS.map((preset) => {
                const isSelected = selectedId === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {isTh ? preset.nameTh : preset.nameEn}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-snug">
                        {isTh ? preset.descTh : preset.descEn}
                      </p>
                      <div className="flex gap-2 mt-2 font-mono text-[10px] text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md inline-block">
                        {preset.processes.length} Processes ({preset.processes.map(p => `${p.pid}(${p.burst_time})`).join(', ')})
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
