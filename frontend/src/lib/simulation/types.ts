// ===================================================
// CPU Scheduler – Client-side Simulation Engine
// Shared types used across all algorithm modules
// ===================================================

export interface Process {
  pid: string
  arrival_time: number
  burst_time: number
  priority: number
  remaining_time: number
  completion_time: number
  start_time: number       // -1 if not started yet
  waiting_time: number
  turnaround_time: number
  response_time: number
}

export interface GanttSlot {
  pid: string
  start: number
  end: number
}

export function makeProcess(pid: string, arrival_time: number, burst_time: number, priority: number): Process {
  return {
    pid,
    arrival_time,
    burst_time,
    priority,
    remaining_time: burst_time,
    completion_time: 0,
    start_time: -1,
    waiting_time: 0,
    turnaround_time: 0,
    response_time: -1,
  }
}

export function cloneProcess(p: Process): Process {
  return { ...p }
}
