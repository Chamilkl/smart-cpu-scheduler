'use client'
import { useState, useCallback } from 'react'
import { SimulationResult, ProcessInput } from '@/lib/types'
import { runSimulation } from '@/lib/api'
import { getSessionId } from '@/lib/utils'
import toast from 'react-hot-toast'

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simulate = useCallback(async (
    processes: ProcessInput[],
    algorithm: string,
    timeQuantum: number = 2
  ) => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      const res = await runSimulation(processes, algorithm, timeQuantum, sessionId)
      setResult(res)
      toast.success(`Simulation complete: ${algorithm}`)
      return res
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail || (err as { message?: string })?.message || 'Simulation failed'
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
