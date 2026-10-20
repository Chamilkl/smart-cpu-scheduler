'use client'
import { useState, useCallback } from 'react'
import { ProcessInput } from '@/lib/types'
import { DEFAULT_PROCESSES } from '@/lib/constants'

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessInput[]>(DEFAULT_PROCESSES)

  const addProcess = useCallback((p: ProcessInput) => {
    setProcesses(prev => [...prev, p])
  }, [])

  const updateProcess = useCallback((index: number, p: ProcessInput) => {
    setProcesses(prev => prev.map((item, i) => (i === index ? p : item)))
  }, [])

  const removeProcess = useCallback((index: number) => {
    setProcesses(prev => prev.filter((_, i) => i !== index))
  }, [])

  const resetProcesses = useCallback(() => {
    setProcesses(DEFAULT_PROCESSES)
  }, [])

  const loadProcesses = useCallback((procs: ProcessInput[]) => {
    setProcesses(procs)
  }, [])

  return { processes, addProcess, updateProcess, removeProcess, resetProcesses, loadProcesses }
}
