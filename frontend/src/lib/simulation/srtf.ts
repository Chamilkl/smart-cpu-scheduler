// Shortest Remaining Time First (Preemptive SJF)
import { Process, GanttSlot, cloneProcess } from './types'
import { ProcessInput } from '@/lib/types'

export function simulateSRTF(originals: ProcessInput[]): [Process[], GanttSlot[], number] {
  const procs: Process[] = originals.map(o => ({
    pid: o.pid,
    arrival_time: o.arrival_time,
    burst_time: o.burst_time,
    priority: o.priority,
    remaining_time: o.burst_time,
    completion_time: 0,
    start_time: -1,
    waiting_time: 0,
    turnaround_time: 0,
    response_time: -1,
  }))

  const gantt: GanttSlot[] = []
  let t = 0
  let completed = 0
  const n = procs.length
  const maxTime = procs.reduce((s, p) => s + p.burst_time + p.arrival_time, 0) + 1

  while (completed < n && t <= maxTime) {
    const available = procs.filter(p => p.arrival_time <= t && p.remaining_time > 0)
    if (available.length === 0) {
      const next = Math.min(...procs.filter(p => p.remaining_time > 0).map(p => p.arrival_time))
      gantt.push({ pid: 'IDLE', start: t, end: next })
      t = next
      continue
    }
    available.sort((a, b) => a.remaining_time - b.remaining_time || a.arrival_time - b.arrival_time || a.pid.localeCompare(b.pid))
    const p = available[0]
    if (p.start_time === -1) {
      p.start_time = t
      p.response_time = t - p.arrival_time
    }

    if (gantt.length > 0 && gantt[gantt.length - 1].pid === p.pid) {
      gantt[gantt.length - 1].end++
    } else {
      gantt.push({ pid: p.pid, start: t, end: t + 1 })
    }
    p.remaining_time--
    t++
    if (p.remaining_time === 0) {
      p.completion_time = t
      completed++
    }
  }
  return [procs, gantt, t]
}
