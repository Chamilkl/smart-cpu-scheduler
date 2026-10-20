'use client'
import { useState } from 'react'
import { ProcessInput } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { TechnicalTooltip } from '@/components/TechnicalTooltip'

interface Props {
  onAdd: (p: ProcessInput) => void
  existingPids: string[]
}

const empty = (): ProcessInput => ({ pid: '', arrival_time: 0, burst_time: 1, priority: 1 })

export function ProcessForm({ onAdd, existingPids }: Props) {
  const [form, setForm] = useState<ProcessInput>(empty())
  const [errors, setErrors] = useState<Partial<Record<keyof ProcessInput, string>>>({})
  const { t, lang } = useLanguage()

  const validate = () => {
    const e: Partial<Record<keyof ProcessInput, string>> = {}
    if (!form.pid.trim()) {
      e.pid = lang === 'th' ? 'กรุณากรอก Process ID' : 'Process ID required'
    } else if (existingPids.includes(form.pid.trim())) {
      e.pid = lang === 'th' ? 'PID นี้มีอยู่แล้ว' : 'PID already exists'
    }
    if (form.arrival_time < 0) e.arrival_time = '≥ 0'
    if (form.burst_time < 1) e.burst_time = '≥ 1'
    if (form.priority < 1 || form.priority > 10) e.priority = '1–10'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onAdd({ ...form, pid: form.pid.trim() })
    setForm(empty())
    setErrors({})
  }

  const field = (
    key: keyof ProcessInput,
    label: string,
    tooltipKey: 'pid' | 'at' | 'bt' | 'priority',
    type = 'text'
  ) => (
    <div>
      <div className="flex items-center mb-1">
        <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</label>
        <TechnicalTooltip termKey={tooltipKey} />
      </div>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        min={key === 'burst_time' || key === 'priority' ? 1 : 0}
        placeholder={key === 'pid' ? 'เช่น P1' : undefined}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
      {field('pid', t.simulator.pid, 'pid')}
      {field('arrival_time', t.simulator.arrivalTime, 'at', 'number')}
      {field('burst_time', t.simulator.burstTime, 'bt', 'number')}
      {field('priority', t.simulator.priority, 'priority', 'number')}
      <Button type="submit" size="sm" className="h-[38px]">
        <Plus className="h-4 w-4" /> {t.simulator.addBtn}
      </Button>
    </form>
  )
}
