// First Come First Served (Non-preemptive)
import { Process, GanttSlot } from './types'

export function simulateFCFS(processes: Process[]): [GanttSlot[], number] {
  const procs = [...processes].sort((a, b) => a.arrival_time - b.arrival_time || a.pid.localeCompare(b.pid))
  const gantt: GanttSlot[] = []
  let t = 0
  for (const p of procs) {
    if (t < p.arrival_time) {
      gantt.push({ pid: 'IDLE', start: t, end: p.arrival_time })
      t = p.arrival_time
    }
    p.start_time = t
    p.response_time = t - p.arrival_time
    gantt.push({ pid: p.pid, start: t, end: t + p.burst_time })
    t += p.burst_time
    p.completion_time = t
  }
  return [gantt, t]
}
