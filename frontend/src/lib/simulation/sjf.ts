// Shortest Job First (Non-preemptive)
import { Process, GanttSlot } from './types'

export function simulateSJF(processes: Process[]): [GanttSlot[], number] {
  const procs = [...processes]
  const gantt: GanttSlot[] = []
  let t = 0
  const completed = new Set<string>()

  while (completed.size < procs.length) {
    const available = procs.filter(p => !completed.has(p.pid) && p.arrival_time <= t)
    if (available.length === 0) {
      const next = Math.min(...procs.filter(p => !completed.has(p.pid)).map(p => p.arrival_time))
      gantt.push({ pid: 'IDLE', start: t, end: next })
      t = next
      continue
    }
    available.sort((a, b) => a.burst_time - b.burst_time || a.arrival_time - b.arrival_time || a.pid.localeCompare(b.pid))
    const p = available[0]
    p.start_time = t
    p.response_time = t - p.arrival_time
    gantt.push({ pid: p.pid, start: t, end: t + p.burst_time })
    t += p.burst_time
    p.completion_time = t
    completed.add(p.pid)
  }
  return [gantt, t]
}
