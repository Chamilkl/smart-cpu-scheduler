import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem('cpu_scheduler_session_id')
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem('cpu_scheduler_session_id', id)
  return id
}

export function algorithmColor(algo: string): string {
  const colors: Record<string, string> = {
    FCFS: '#6366f1',
    SJF: '#8b5cf6',
    SRTF: '#ec4899',
    RR: '#f97316',
    PRIORITY: '#22c55e',
    AICS: '#14b8a6',
  }
  return colors[algo] || '#9ca3af'
}
