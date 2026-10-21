'use client'
import { useState, useCallback } from 'react'
import { SimulationResult, ProcessInput } from '@/lib/types'
import { runLocalSimulation } from '@/lib/simulation'
import toast from 'react-hot-toast'

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simulate = useCallback((
    processes: ProcessInput[],
    algorithm: string,
    timeQuantum: number = 2
  ) => {
    setLoading(true)
    setError(null)
    try {
      // Run entirely in browser — no network request needed
      const res = runLocalSimulation(processes, algorithm, timeQuantum)
      setResult(res)
      toast.success(algorithm === 'AICS'
        ? `AICS เลือก ${res.aics_decision?.selected_policy} ✓`
        : `จำลอง ${algorithm} สำเร็จ ✓`)
      return res
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Simulation failed'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, simulate, clearResult }
}
