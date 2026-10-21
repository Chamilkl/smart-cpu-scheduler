// ===================================================
// Feature Extractor for AI Recommender
// ===================================================
import { ProcessInput } from '@/lib/types'

export interface WorkloadFeatures {
  n_processes: number
  burst_mean: number
  burst_std: number
  burst_min: number
  burst_max: number
  burst_cv: number
  arrival_spread: number
  all_arrive_together: number
  short_ratio: number
  long_ratio: number
  priority_unique: number
  priority_spread: number
  avg_inter_arrival: number
  total_burst: number
}

function mean(arr: number[]) { return arr.reduce((s, v) => s + v, 0) / arr.length }
function std(arr: number[]) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

export function extractFeatures(processes: ProcessInput[]): WorkloadFeatures {
  const n = processes.length
  const bursts = processes.map(p => p.burst_time)
  const arrivals = processes.map(p => p.arrival_time)
  const priorities = processes.map(p => p.priority)

  const burstMean = mean(bursts)
  const burstStd = std(bursts)
  const burstCv = burstMean > 0 ? burstStd / burstMean : 0
  const maxArrival = Math.max(...arrivals)
  const arrivalSpread = std(arrivals) / (maxArrival + 1e-9)
  const allArriveTogether = std(arrivals) === 0 ? 1 : 0
  const shortJobs = bursts.filter(b => b <= burstMean).length
  const shortRatio = shortJobs / n
  const sortedArrivals = [...arrivals].sort((a, b) => a - b)
  const interArrivals = sortedArrivals.slice(1).map((v, i) => v - sortedArrivals[i])
  const avgInterArrival = interArrivals.length > 0 ? mean(interArrivals) : 0
  const priorityUnique = new Set(priorities).size
  const prioritySpread = std(priorities)

  return {
    n_processes: n,
    burst_mean: Math.round(burstMean * 10000) / 10000,
    burst_std: Math.round(burstStd * 10000) / 10000,
    burst_min: Math.min(...bursts),
    burst_max: Math.max(...bursts),
    burst_cv: Math.round(burstCv * 10000) / 10000,
    arrival_spread: Math.round(arrivalSpread * 10000) / 10000,
    all_arrive_together: allArriveTogether,
    short_ratio: Math.round(shortRatio * 10000) / 10000,
    long_ratio: Math.round((1 - shortRatio) * 10000) / 10000,
    priority_unique: priorityUnique,
    priority_spread: Math.round(prioritySpread * 10000) / 10000,
    avg_inter_arrival: Math.round(avgInterArrival * 10000) / 10000,
    total_burst: bursts.reduce((s, v) => s + v, 0),
  }
}
