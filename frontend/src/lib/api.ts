import axios from 'axios'
import { ProcessInput, SimulationResult, AIRecommendation, HistoryRecord } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export async function runSimulation(
  processes: ProcessInput[],
  algorithm: string,
  timeQuantum: number = 2,
  sessionId?: string
): Promise<SimulationResult> {
  const { data } = await api.post('/api/simulation/run', {
    processes,
    algorithm,
    time_quantum: timeQuantum,
    session_id: sessionId,
  })
  return data
}

export async function compareAlgorithms(
  processes: ProcessInput[],
  algorithms: string[],
  timeQuantum: number = 2
): Promise<Record<string, unknown>> {
  const { data } = await api.post('/api/simulation/compare', {
    processes,
    algorithms,
    time_quantum: timeQuantum,
  })
  return data
}

export async function getAIRecommendation(
  processes: ProcessInput[],
  optimizeFor: string = 'waiting_time'
): Promise<AIRecommendation> {
  const { data } = await api.post('/api/ai/recommend', {
    processes,
    optimize_for: optimizeFor,
  })
  return data
}

export async function getHistory(
  sessionId?: string,
  algorithm?: string,
  limit: number = 50
): Promise<HistoryRecord[]> {
  const params: Record<string, unknown> = { limit }
  if (sessionId) params.session_id = sessionId
  if (algorithm) params.algorithm = algorithm
  const { data } = await api.get('/api/history/', { params })
  return data
}

export async function generateSample(n: number = 5): Promise<{ processes: ProcessInput[] }> {
  const { data } = await api.get('/api/processes/generate-sample', { params: { n } })
  return data
}

export async function trainModel(): Promise<{ message: string }> {
  const { data } = await api.post('/api/ai/train')
  return data
}

export async function getModelStatus(): Promise<{ model_trained: boolean }> {
  const { data } = await api.get('/api/ai/model-status')
  return data
}
