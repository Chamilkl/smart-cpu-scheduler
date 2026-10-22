'use client'
import { useState } from 'react'
import { useProcesses } from '@/hooks/useProcesses'
import { ProcessForm } from '@/components/ProcessForm'
import { ProcessTable } from '@/components/ProcessTable'
import { AlgorithmComparison } from '@/components/AlgorithmComparison'
import { SampleDatasetSelector } from '@/components/SampleDatasetSelector'
import { TechnicalTooltip } from '@/components/TechnicalTooltip'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { compareAlgorithms, generateSample } from '@/lib/api'
import { ALGORITHMS } from '@/lib/constants'
import { BarChart3, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { ProcessInput } from '@/lib/types'
import { runLocalCompare, generateRandomProcesses } from '@/lib/simulation'
import { useAnalytics } from '@/hooks/useAnalytics'

const ALL_ALGOS = ALGORITHMS.map(a => a.value)

export default function ComparePage() {
  const { processes, addProcess, removeProcess, loadProcesses } = useProcesses()
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>(['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY', 'AICS'])
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [comparison, setComparison] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const { t, lang } = useLanguage()
  const { trackAI } = useAnalytics()
  const isTh = lang === 'th'

  const toggleAlgo = (algo: string) => {
    setSelectedAlgos(prev => prev.includes(algo) ? prev.filter(a => a !== algo) : [...prev, algo])
  }

  const handleCompare = () => {
    if (processes.length === 0) {
      toast.error(isTh ? 'กรุณาเพิ่มโพรเซสอย่างน้อย 1 รายการ' : 'Add at least one process')
      return
    }
    if (selectedAlgos.length < 2) {
      toast.error(isTh ? 'กรุณาเลือกอัลกอริทึมอย่างน้อย 2 แบบเพื่อเปรียบเทียบ' : 'Select at least 2 algorithms')
      return
    }
    setLoading(true)
    try {
      // Runs entirely in browser — instant results
      const result = runLocalCompare(processes, selectedAlgos, timeQuantum)
      setComparison(result as Record<string, unknown>)
      toast.success(isTh ? 'เปรียบเทียบอัลกอริทึมสำเร็จ' : 'Comparison complete')
      trackAI('compare', {
        algorithms: selectedAlgos,
        process_count: processes.length,
        status: 'success',
      })
    } catch {
      toast.error(isTh ? 'การเปรียบเทียบล้มเหลว' : 'Comparison failed')
      trackAI('compare', {
        algorithms: selectedAlgos,
        process_count: processes.length,
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRandomSample = () => {
    const sample = generateRandomProcesses(6)
    loadProcesses(sample)
    toast.success(isTh ? 'สุ่มตัวอย่างสำเร็จ' : 'Random sample loaded')
  }

  const handleSelectPreset = (presetProcs: ProcessInput[]) => {
    loadProcesses(presetProcs)
  }

  const handleClear = () => {
    loadProcesses([])
    toast.success(isTh ? 'ล้างข้อมูลโพรเซสแล้ว' : 'Processes cleared')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t.compare.title}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {t.compare.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SampleDatasetSelector
            onSelectPreset={handleSelectPreset}
            onRandomSample={handleRandomSample}
          />
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-gray-500 hover:text-red-500">
            <Trash2 className="h-4 w-4" /> {t.simulator.clearAll}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Processes input */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {t.simulator.processConfig}
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {processes.length} {isTh ? 'โพรเซส' : 'processes'}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProcessForm onAdd={addProcess} existingPids={processes.map(p => p.pid)} />
              <ProcessTable processes={processes} onRemove={removeProcess} />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Algorithm Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {t.compare.selectAlgos}
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {ALL_ALGOS.map(algo => (
                  <label key={algo} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedAlgos.includes(algo)}
                      onChange={() => toggleAlgo(algo)}
                      className="h-4 w-4 rounded accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{algo}</span>
                  </label>
                ))}
              </div>

              {selectedAlgos.includes('RR') && (
                <div className="flex items-center gap-2 pt-2 px-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <label>Time Quantum:</label>
                    <TechnicalTooltip termKey="tq" />
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={timeQuantum}
                    onChange={e => setTimeQuantum(Number(e.target.value))}
                    className="w-16 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-1 text-xs font-mono"
                  />
                  <span className="text-xs text-gray-400">ms</span>
                </div>
              )}

              <Button className="w-full mt-3 py-2.5" onClick={handleCompare} loading={loading}>
                <BarChart3 className="h-4 w-4" /> {t.compare.compareBtn}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="h-12 w-12" />
          <p className="text-sm text-gray-500 dark:text-slate-400">กำลังจำลองและเปรียบเทียบทุกอัลกอริทึม...</p>
        </div>
      )}

      {comparison && !loading && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white text-base">
              {t.compare.resultsTitle}
            </h2>
          </CardHeader>
          <CardContent>
            <AlgorithmComparison comparison={comparison as Record<string, { metrics: { avg_waiting_time: number; avg_turnaround_time: number; avg_response_time: number; context_switches: number; cpu_utilization: number }; selected_policy?: string }>} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
