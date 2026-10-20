import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

const colorMap: Record<string, string> = {
  FCFS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
  SJF: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  SRTF: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
  RR: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  PRIORITY: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800',
  AICS: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
}

export function AlgorithmBadge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorMap[label] || 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200', className)}>
      {label}
    </span>
  )
}
