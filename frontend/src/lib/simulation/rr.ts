// Round Robin
import { Process, GanttSlot } from './types'
import { ProcessInput } from '@/lib/types'

export function simulateRR(originals: ProcessInput[], timeQuantum: number = 2): [Process[], GanttSlot[], number] {
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

  const sorted = [...procs].sort((a, b) => a.arrival_time - b.arrival_time)
  const gantt: GanttSlot[] = []
  let t = 0
  const queue: Process[] = []
  const arrived = new Set<string>()
  let completed = 0
  const n = procs.length

  // enqueue all arriving at t=0
  for (const p of sorted) {
    if (p.arrival_time <= t && !arrived.has(p.pid)) {
      queue.push(p)
      arrived.add(p.pid)
    }
  }

  while (completed < n) {
    if (queue.length === 0) {
      const next = Math.min(...procs.filter(p => !arrived.has(p.pid)).map(p => p.arrival_time))
      gantt.push({ pid: 'IDLE', start: t, end: next })
      t = next
      for (const p of sorted) {
        if (p.arrival_time <= t && !arrived.has(p.pid)) {
          queue.push(p)
          arrived.add(p.pid)
        }
      }
      continue
    }

    const p = queue.shift()!
    if (p.start_time === -1) {
      p.start_time = t
      p.response_time = t - p.arrival_time
    }
    const exec = Math.min(timeQuantum, p.remaining_time)
    gantt.push({ pid: p.pid, start: t, end: t + exec })
    p.remaining_time -= exec
    t += exec

    // enqueue newly arrived
    for (const sp of sorted) {
      if (sp.arrival_time <= t && !arrived.has(sp.pid)) {
        queue.push(sp)
        arrived.add(sp.pid)
      }
    }

    if (p.remaining_time === 0) {
      p.completion_time = t
      completed++
    } else {
      queue.push(p)
    }
  }
  return [procs, gantt, t]
}
