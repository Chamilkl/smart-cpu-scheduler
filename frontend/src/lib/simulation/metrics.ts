// ===================================================
// Metrics & Color helpers
// ===================================================
import { Process, GanttSlot } from './types'
import { GanttEntry, Metrics, ProcessResult } from '@/lib/types'

const PROCESS_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
  '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#e11d48',
]

export function assignColors(gantt: GanttSlot[]): GanttEntry[] {
  const pidColors: Record<string, string> = {}
  let colorIdx = 0
  return gantt.map(slot => {
    if (slot.pid !== 'IDLE' && !pidColors[slot.pid]) {
      pidColors[slot.pid] = PROCESS_COLORS[colorIdx % PROCESS_COLORS.length]
      colorIdx++
    }
    return {
      pid: slot.pid,
      start: slot.start,
      end: slot.end,
      color: pidColors[slot.pid] ?? '#9ca3af',
    }
  })
}

export function calculateMetrics(processes: Process[], gantt: GanttSlot[], totalTime: number): Metrics {
  const n = processes.length
  if (n === 0) return {
    avg_waiting_time: 0, avg_turnaround_time: 0, avg_response_time: 0,
    cpu_utilization: 100, throughput: 0, context_switches: 0, total_time: 0,
  }

  for (const p of processes) {
    p.turnaround_time = p.completion_time - p.arrival_time
    p.waiting_time = Math.max(0, p.turnaround_time - p.burst_time)
    p.response_time = p.start_time >= 0 ? Math.max(0, p.start_time - p.arrival_time) : 0
  }

  const busyTime = gantt.filter(s => s.pid !== 'IDLE').reduce((sum, s) => sum + (s.end - s.start), 0)
  let contextSwitches = 0
  for (let i = 1; i < gantt.length; i++) {
    if (gantt[i].pid !== gantt[i - 1].pid && gantt[i].pid !== 'IDLE' && gantt[i - 1].pid !== 'IDLE') {
      contextSwitches++
    }
  }

  return {
    avg_waiting_time: round4(processes.reduce((s, p) => s + p.waiting_time, 0) / n),
    avg_turnaround_time: round4(processes.reduce((s, p) => s + p.turnaround_time, 0) / n),
    avg_response_time: round4(processes.reduce((s, p) => s + p.response_time, 0) / n),
    cpu_utilization: round4(totalTime > 0 ? (busyTime / totalTime) * 100 : 100),
    throughput: round6(totalTime > 0 ? n / totalTime : 0),
    context_switches: contextSwitches,
    total_time: totalTime,
  }
}

export function buildProcessResults(originals: Array<{ pid: string; arrival_time: number; burst_time: number; priority: number }>, procs: Process[]): ProcessResult[] {
  const pidMap = new Map(procs.map(p => [p.pid, p]))
  return originals.map(orig => {
    const p = pidMap.get(orig.pid)!
    const tat = p.completion_time - orig.arrival_time
    const wt = Math.max(0, tat - orig.burst_time)
    const rt = p.start_time >= 0 ? Math.max(0, p.start_time - orig.arrival_time) : 0
    return {
      pid: p.pid,
      arrival_time: orig.arrival_time,
      burst_time: orig.burst_time,
      priority: orig.priority,
      completion_time: p.completion_time,
      turnaround_time: tat,
      waiting_time: wt,
      response_time: rt,
    }
  })
}

function round4(n: number) { return Math.round(n * 10000) / 10000 }
function round6(n: number) { return Math.round(n * 1000000) / 1000000 }
