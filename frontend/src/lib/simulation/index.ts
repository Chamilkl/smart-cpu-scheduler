// ===================================================
// Main entry point – runs any algorithm locally in browser
// ===================================================
import { ProcessInput, SimulationResult } from '@/lib/types'
import { makeProcess } from './types'
import { assignColors, calculateMetrics, buildProcessResults } from './metrics'
import { simulateFCFS } from './fcfs'
import { simulateSJF } from './sjf'
import { simulateSRTF } from './srtf'
import { simulateRR } from './rr'
import { simulatePriority } from './priority'
import { runAICS } from './aics'

export { localRecommend } from './recommender'
export { extractFeatures } from './features'

export function runLocalSimulation(
  originals: ProcessInput[],
  algorithm: string,
  timeQuantum: number = 2,
): SimulationResult {
  const algo = algorithm.toUpperCase()

  if (algo === 'AICS') {
    return runAICS(originals, timeQuantum)
  }

  if (algo === 'SRTF') {
    const [procs, gantt, totalTime] = simulateSRTF(originals)
    const metrics = calculateMetrics(procs, gantt, totalTime)
    return {
      algorithm,
      gantt_chart: assignColors(gantt),
      process_results: buildProcessResults(originals, procs),
      metrics,
    }
  }

  if (algo === 'RR') {
    const [procs, gantt, totalTime] = simulateRR(originals, timeQuantum)
    const metrics = calculateMetrics(procs, gantt, totalTime)
    return {
      algorithm,
      gantt_chart: assignColors(gantt),
      process_results: buildProcessResults(originals, procs),
      metrics,
    }
  }

  // FCFS, SJF, PRIORITY – non-preemptive: work on shared Process objects
  const procs = originals.map(o => makeProcess(o.pid, o.arrival_time, o.burst_time, o.priority))
  let gantt, totalTime

  if (algo === 'FCFS') {
    ;[gantt, totalTime] = simulateFCFS(procs)
  } else if (algo === 'SJF') {
    ;[gantt, totalTime] = simulateSJF(procs)
  } else if (algo === 'PRIORITY') {
    ;[gantt, totalTime] = simulatePriority(procs)
  } else {
    throw new Error(`Unknown algorithm: ${algorithm}`)
  }

  const metrics = calculateMetrics(procs, gantt, totalTime)
  return {
    algorithm,
    gantt_chart: assignColors(gantt),
    process_results: buildProcessResults(originals, procs),
    metrics,
  }
}

export function runLocalCompare(
  originals: ProcessInput[],
  algorithms: string[],
  timeQuantum: number = 2,
): Record<string, { metrics: ReturnType<typeof calculateMetrics>; selected_policy?: string }> {
  const results: Record<string, { metrics: ReturnType<typeof calculateMetrics>; selected_policy?: string }> = {}
  for (const algo of algorithms) {
    try {
      const res = runLocalSimulation(originals, algo, timeQuantum)
      results[algo] = {
        metrics: res.metrics,
        ...(algo === 'AICS' && res.aics_decision ? { selected_policy: res.aics_decision.selected_policy } : {}),
      }
    } catch {
      // skip invalid
    }
  }
  return results
}

/** Generate a random process set (no server needed) */
export function generateRandomProcesses(n: number = 5): ProcessInput[] {
  const procs: ProcessInput[] = []
  let t = 0
  for (let i = 0; i < n; i++) {
    t += Math.floor(Math.random() * 5)
    procs.push({
      pid: `P${i + 1}`,
      arrival_time: t,
      burst_time: Math.floor(Math.random() * 15) + 1,
      priority: Math.floor(Math.random() * 5) + 1,
    })
  }
  return procs
}
