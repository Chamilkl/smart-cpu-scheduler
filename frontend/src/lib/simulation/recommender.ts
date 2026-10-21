// ===================================================
// Rule-based AI Recommender (client-side, no server needed)
// ===================================================
import { ProcessInput, AIRecommendation } from '@/lib/types'
import { extractFeatures, WorkloadFeatures } from './features'

function ruleBasedRecommend(f: WorkloadFeatures, optimizeFor: string): { algorithm: string; confidence: number; reasons: string[] } {
  let algorithm = 'FCFS'
  let confidence = 0.6
  const reasons: string[] = []

  if (f.priority_unique >= 3 && f.priority_spread > 1.5) {
    algorithm = 'PRIORITY'
    confidence = 0.75
    reasons.push(`มีความหลากหลายของ Priority สูง (${f.priority_unique} ระดับ, std=${f.priority_spread.toFixed(2)}) — Priority Scheduling จัดการได้ดีที่สุด`)
  } else if (f.burst_cv > 0.8) {
    if (f.arrival_spread > 0.3) {
      algorithm = 'SRTF'
      confidence = 0.80
      reasons.push(`Burst Time มีความแปรปรวนสูง (CV=${f.burst_cv.toFixed(2)}) และมาถึงเหลื่อมเวลากัน — SRTF ลด Waiting Time ได้ดีที่สุด`)
    } else {
      algorithm = 'SJF'
      confidence = 0.78
      reasons.push(`Burst Time มีความแปรปรวนสูง (CV=${f.burst_cv.toFixed(2)}) — SJF เหมาะกับ Batch Workload`)
    }
  } else if (f.short_ratio > 0.7 && f.burst_cv > 0.4) {
    algorithm = 'SJF'
    confidence = 0.72
    reasons.push(`งานส่วนใหญ่เป็นงานสั้น (${(f.short_ratio * 100).toFixed(0)}%) — SJF ให้ Waiting Time เฉลี่ยต่ำ`)
  } else if (f.all_arrive_together === 0 && f.arrival_spread > 0.2 && f.burst_cv < 0.6) {
    algorithm = 'RR'
    confidence = 0.70
    reasons.push(`ภาระงาน Interactive ผสมกันมาถึงต่างเวลา — Round Robin ให้ความเป็นธรรมและ Response Time ดี`)
  } else if (f.all_arrive_together === 1 && f.burst_cv < 0.3) {
    algorithm = 'FCFS'
    confidence = 0.65
    reasons.push('Burst Time สม่ำเสมอ มาถึงพร้อมกัน — FCFS เพียงพอและคาดเดาได้ง่าย')
  } else {
    algorithm = 'FCFS'
    confidence = 0.55
    reasons.push('ภาระงานทั่วไป — FCFS ให้การจัดตารางที่คาดเดาได้')
  }

  if (optimizeFor === 'response_time' && !['RR', 'SRTF'].includes(algorithm)) {
    reasons.push('สำหรับ Response Time ที่ดีที่สุด Round Robin มักเหมาะกว่าในระบบ Interactive')
  } else if (optimizeFor === 'turnaround_time' && !['SJF', 'SRTF'].includes(algorithm)) {
    reasons.push('สำหรับ Turnaround Time ที่ดีที่สุด SJF หรือ SRTF มักทำได้ดีกว่า')
  }

  return { algorithm, confidence: Math.round(confidence * 10000) / 10000, reasons }
}

function previewMetrics(processes: ProcessInput[], tq: number): Record<string, { avg_waiting_time: number; avg_turnaround_time: number }> {
  // Import lazily to avoid circular deps — we'll inline here
  // Use only FCFS, SJF, RR for quick preview
  const preview: Record<string, { avg_waiting_time: number; avg_turnaround_time: number }> = {}
  return preview
}

export function localRecommend(processes: ProcessInput[], optimizeFor: string = 'waiting_time'): AIRecommendation {
  const features = extractFeatures(processes)
  const result = ruleBasedRecommend(features, optimizeFor)

  // Determine a plausible alternative
  const allAlgos = ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY']
  const alternative = allAlgos.find(a => a !== result.algorithm) ?? 'RR'

  return {
    recommended_algorithm: result.algorithm,
    confidence: result.confidence,
    reasoning: result.reasons,
    features: features as unknown as Record<string, number>,
    alternative,
    comparison_preview: undefined,
  }
}
