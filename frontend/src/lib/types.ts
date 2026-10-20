export interface ProcessInput {
  pid: string
  arrival_time: number
  burst_time: number
  priority: number
}

export interface GanttEntry {
  pid: string
  start: number
  end: number
  color: string
}

export interface ProcessResult {
  pid: string
  arrival_time: number
  burst_time: number
  priority: number
  completion_time: number
  turnaround_time: number
  waiting_time: number
  response_time: number
}

export interface Metrics {
  avg_waiting_time: number
  avg_turnaround_time: number
  avg_response_time: number
  cpu_utilization: number
  throughput: number
  context_switches: number
  total_time: number
}

export interface AICSSDecision {
  selected_policy: string
  time_quantum_used: number | null
  workload_features: Record<string, number>
  decision_steps: string[]
  components: string[]
}

export interface SimulationResult {
  algorithm: string
  gantt_chart: GanttEntry[]
  process_results: ProcessResult[]
  metrics: Metrics
  aics_decision?: AICSSDecision
}

export interface AIRecommendation {
  recommended_algorithm: string
  confidence: number
  reasoning: string[]
  features: Record<string, number>
  alternative?: string
  comparison_preview?: Record<string, { avg_waiting_time: number; avg_turnaround_time: number }>
}

export interface HistoryRecord {
  id: number
  session_id: string
  algorithm: string
  processes_input: ProcessInput[]
  results: Record<string, unknown>
  metrics: Metrics
  created_at: string
}

export type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY' | 'AICS'
