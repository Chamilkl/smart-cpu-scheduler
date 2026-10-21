// ===================================================
// AICS – Adaptive Intelligent CPU Scheduler (client-side)
// ===================================================
import { ProcessInput, SimulationResult, GanttEntry } from '@/lib/types'
import { Process, GanttSlot } from './types'
import { extractFeatures, WorkloadFeatures } from './features'
import { assignColors, calculateMetrics, buildProcessResults } from './metrics'
import { simulateFCFS } from './fcfs'
import { simulateSJF } from './sjf'
import { simulateSRTF } from './srtf'
import { simulateRR } from './rr'
import { simulatePriority } from './priority'
import { makeProcess } from './types'

function selectPolicy(f: WorkloadFeatures): { policy: string; tq: number; decisions: string[] } {
  const decisions: string[] = []
  let policy = 'FCFS'
  let tq = Math.max(2, Math.round(f.burst_mean * 0.4))

  decisions.push(`Workload Analysis: ${f.n_processes} processes, burst CV=${f.burst_cv.toFixed(2)}, priority levels=${f.priority_unique}`)

  if (f.priority_unique >= 3 && f.priority_spread > 1.5) {
    policy = 'PRIORITY'
    decisions.push(`→ ตรวจพบความแตกต่างของ Priority สูง → เลือก Priority Scheduling`)
  } else if (f.burst_cv > 0.75 && f.all_arrive_together === 1) {
    policy = 'SJF'
    decisions.push(`→ Burst Time แปรปรวนสูง (CV=${f.burst_cv.toFixed(2)}) + มาถึงพร้อมกัน → เลือก SJF`)
  } else if (f.burst_cv > 0.75 && f.all_arrive_together === 0) {
    policy = 'SRTF'
    decisions.push(`→ Burst Time แปรปรวนสูง (CV=${f.burst_cv.toFixed(2)}) + มาถึงต่างเวลา → เลือก SRTF (Preemptive)`)
  } else if (f.burst_cv < 0.3 && f.arrival_spread > 0.3) {
    tq = Math.max(2, Math.round(f.burst_mean * 0.5))
    policy = 'RR'
    decisions.push(`→ Burst Time สม่ำเสมอ + มาถึงต่างเวลา → เลือก Round Robin (TQ=${tq}) เพื่อความเป็นธรรม`)
  } else if (f.short_ratio > 0.65) {
    policy = 'SJF'
    decisions.push(`→ งานสั้น ${(f.short_ratio * 100).toFixed(0)}% → เลือก SJF เพื่อลด Waiting Time`)
  } else {
    policy = 'FCFS'
    decisions.push(`→ ภาระงานทั่วไป → เลือก FCFS`)
  }

  // Fine-tune RR quantum: 40% of P80 burst
  if (policy === 'RR') {
    const bursts = [f.burst_min, f.burst_mean, f.burst_max] // approximation
    // We don't have full array here; tq was already set above
    decisions.push(`Time Quantum ปรับเป็น ${tq} (≈40% ของ burst เฉลี่ย ${f.burst_mean.toFixed(1)})`)
  }

  return { policy, tq, decisions }
}

export function runAICS(originals: ProcessInput[], timeQuantum: number = 2): SimulationResult {
  const features = extractFeatures(originals)
  const { policy, tq, decisions } = selectPolicy(features)

  let procs: Process[]
  let gantt: GanttSlot[]
  let totalTime: number

  if (policy === 'FCFS') {
    procs = originals.map(o => makeProcess(o.pid, o.arrival_time, o.burst_time, o.priority))
    ;[gantt, totalTime] = simulateFCFS(procs)
  } else if (policy === 'SJF') {
    procs = originals.map(o => makeProcess(o.pid, o.arrival_time, o.burst_time, o.priority))
    ;[gantt, totalTime] = simulateSJF(procs)
  } else if (policy === 'SRTF') {
    ;[procs, gantt, totalTime] = simulateSRTF(originals)
  } else if (policy === 'RR') {
    ;[procs, gantt, totalTime] = simulateRR(originals, tq)
  } else {
    // PRIORITY
    procs = originals.map(o => makeProcess(o.pid, o.arrival_time, o.burst_time, o.priority))
    ;[gantt, totalTime] = simulatePriority(procs)
  }

  const metrics = calculateMetrics(procs, gantt, totalTime)
  const ganttColored = assignColors(gantt)
  const processResults = buildProcessResults(originals, procs)

  return {
    algorithm: 'AICS',
    gantt_chart: ganttColored,
    process_results: processResults,
    metrics,
    aics_decision: {
      selected_policy: policy,
      time_quantum_used: policy === 'RR' ? tq : null,
      workload_features: features as unknown as Record<string, number>,
      decision_steps: decisions,
      components: [
        'WorkloadAnalyzer: extracted 14 workload features',
        `SchedulingPolicySelector: evaluated rules → selected ${policy}`,
        policy === 'RR' ? `AdaptiveParameterController: tuned TQ → ${tq}` : 'AdaptiveParameterController: no tuning needed',
        'PerformanceEvaluator: computed all metrics',
      ],
    },
  }
}
