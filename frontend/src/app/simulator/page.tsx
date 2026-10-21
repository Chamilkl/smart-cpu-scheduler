'use client'
import { useState } from 'react'
import { useProcesses } from '@/hooks/useProcesses'
import { useSimulation } from '@/hooks/useSimulation'
import { ProcessForm } from '@/components/ProcessForm'
import { ProcessTable } from '@/components/ProcessTable'
import { GanttChart } from '@/components/GanttChart'
import { MetricsDashboard } from '@/components/MetricsDashboard'
import { AIRecommendationCard } from '@/components/AIRecommendation'
import { AICSStepper } from '@/components/AICSStepper'
import { GanttLearningGuide } from '@/components/GanttLearningGuide'
import { SampleDatasetSelector } from '@/components/SampleDatasetSelector'
import { TechnicalTooltip } from '@/components/TechnicalTooltip'
import { UserGuideModal } from '@/components/UserGuideModal'
import { InteractiveOnboarding } from '@/components/InteractiveOnboarding'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ALGORITHMS } from '@/lib/constants'
import { AIRecommendation, ProcessInput } from '@/lib/types'
import { Zap, Brain, Trash2, GraduationCap, BookOpen, Sparkles, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBeginnerMode } from '@/contexts/BeginnerModeContext'
import { localRecommend, generateRandomProcesses } from '@/lib/simulation'

export default function SimulatorPage() {
  const { processes, addProcess, removeProcess, loadProcesses } = useProcesses()
  const { result, loading, simulate } = useSimulation()
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  const { t, lang } = useLanguage()
  const { isBeginnerMode } = useBeginnerMode()
  const isTh = lang === 'th'

  const handleSimulate = () => {
    if (processes.length === 0) {
      toast.error(isTh ? 'กรุณาเพิ่มโพรเซสอย่างน้อย 1 รายการ' : 'Add at least one process')
      return
    }
    simulate(processes, algorithm, timeQuantum)
  }

  const handleAI = () => {
    if (processes.length === 0) {
      toast.error(isTh ? 'กรุณาเพิ่มโพรเซสก่อนขอคำแนะนำ AI' : 'Add processes first')
      return
    }
    setAiLoading(true)
    try {
      // Runs entirely in browser – instant, no server needed
      const rec = localRecommend(processes)
      setAiRec(rec)
    } catch {
      toast.error(isTh ? 'เกิดข้อผิดพลาดในการวิเคราะห์ AI' : 'AI recommendation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleRandomSample = () => {
    const sample = generateRandomProcesses(5)
    loadProcesses(sample)
    toast.success(isTh ? 'สุ่มชุดข้อมูลตัวอย่างใหม่สำเร็จ' : 'Random sample loaded')
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
      {/* Modals */}
      <UserGuideModal open={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <InteractiveOnboarding forceOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t.simulator.title}
            </h1>
            {isBeginnerMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{isTh ? 'โหมดผู้เริ่มต้น' : 'Beginner Mode'}</span>
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {t.simulator.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <SampleDatasetSelector
            onSelectPreset={handleSelectPreset}
            onRandomSample={handleRandomSample}
          />

          <Button variant="ghost" size="sm" onClick={() => setGuideModalOpen(true)} className="text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{isTh ? 'วิธีใช้งาน' : 'Guide'}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setTourOpen(true)} className="text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{isTh ? 'ทัวร์แนะนำ' : 'Tour'}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleClear} className="text-gray-500 hover:text-red-500">
            <Trash2 className="h-4 w-4" /> {t.simulator.clearAll}
          </Button>
        </div>
      </div>

      {/* Beginner Mode Educational Banner (TOR Section 3.5) */}
      {isBeginnerMode && (
        <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
          <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">
              {isTh ? 'คำแนะนำสำหรับผู้เริ่มต้น (Beginner Mode Active)' : 'Learner Guidance Active'}
            </div>
            <p className="text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
              {isTh
                ? 'ระบบแนะนำให้เริ่มต้นจากอัลกอริทึม FCFS โดยคุณสามารถกด "เลือกชุดข้อมูลตัวอย่าง (3 รูปแบบ)" ด้านบน เพื่อโหลดโพรเซสทดลองได้ทันที และสังเกตเครื่องหมาย (?) สีฟ้าข้างคำศัพท์เพื่อดูความหมายและสูตรคำนวณ'
                : 'We recommend starting with FCFS. Use "Sample Presets" above to load test data instantly, and click any (?) icon to view definitions and formulas.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Process Input & Algorithm Selection */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {t.simulator.processConfig}
              </h2>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                {processes.length} {isTh ? 'โพรเซสในรายการ' : 'processes'}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProcessForm onAdd={addProcess} existingPids={processes.map(p => p.pid)} />
              <ProcessTable processes={processes} onRemove={removeProcess} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                  {t.simulator.algoSelection}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TechnicalTooltip termKey="non_preemptive" />
                  <TechnicalTooltip termKey="preemptive" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALGORITHMS.map(a => {
                  const isSelected = algorithm === a.value
                  return (
                    <button
                      key={a.value}
                      onClick={() => setAlgorithm(a.value)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      {/* Beginner Recommendation Badge */}
                      {isBeginnerMode && a.value === 'FCFS' && (
                        <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-amber-950 shadow-sm uppercase tracking-wide">
                          {isTh ? 'แนะนำผู้เริ่ม' : 'Beginner'}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">{a.shortLabel}</div>
                        {a.preemptive ? (
                          <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-1.5 py-0.5 rounded-md">
                            Preemptive
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            Non-preempt
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-tight line-clamp-1">{a.label}</div>
                    </button>
                  )
                })}
              </div>

              {algorithm === 'RR' && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-900 dark:text-orange-200">
                    <label>{t.simulator.timeQuantum}</label>
                    <TechnicalTooltip termKey="tq" />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={timeQuantum}
                    onChange={e => setTimeQuantum(Number(e.target.value))}
                    className="w-20 rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">ms</span>
                  {isBeginnerMode && (
                    <span className="text-[11px] text-orange-600 dark:text-orange-300 ml-auto hidden sm:inline">
                      💡 {isTh ? 'ค่าปกติแนะนำคือ 2 หรือ 4 ms' : 'Recommended 2-4 ms'}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button onClick={handleSimulate} loading={loading} className="flex-1 py-2.5">
                  <Zap className="h-4 w-4" /> {t.simulator.runBtn}
                </Button>
                <Button variant="secondary" onClick={handleAI} loading={aiLoading} className="py-2.5">
                  <Brain className="h-4 w-4 text-indigo-500" /> {t.simulator.aiRecommendBtn}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: AI Recommendation Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {t.ai.title}
              </h2>
            </CardHeader>
            <CardContent>
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Spinner />
                  <p className="text-xs text-gray-400">
                    {isTh ? 'โมเดล Random Forest กำลังสกัด 14 คุณลักษณะ...' : 'Extracting workload features...'}
                  </p>
                </div>
              )}
              {!aiLoading && !aiRec && (
                <div className="text-center py-8 px-4 space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 mb-1 text-indigo-500">
                    <Brain className="h-6 w-6" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {t.ai.waitingAi}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    {isTh ? 'ระบบจะวิเคราะห์ความแปรปรวนของเวลาประมวลผลและการกระจายตัวของเวลามาถึง' : 'Analyzes burst variance and arrival patterns'}
                  </p>
                </div>
              )}
              {aiRec && (
                <AIRecommendationCard
                  recommendation={aiRec}
                  onApply={(algo) => {
                    setAlgorithm(algo)
                    toast.success(isTh ? `เลือกอัลกอริทึม ${algo} แล้ว` : `Applied ${algo}`)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulation Results Section */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="h-12 w-12" />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">กำลังประมวลผลการจำลอง...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 pt-2">
          {/* Gantt Chart Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                  {t.simulator.ganttTitle}
                </h2>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {isTh ? 'เวลารวมทั้งหมด' : 'Total time'}: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{result.metrics.total_time} ms</strong>
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <GanttChart gantt={result.gantt_chart} totalTime={result.metrics.total_time} />
              {/* Gantt Learning Guide (TOR Section 3.7) */}
              <GanttLearningGuide algorithm={result.algorithm} />
            </CardContent>
          </Card>

          {/* Metrics Dashboard */}
          <Card>
            <CardContent>
              <MetricsDashboard metrics={result.metrics} algorithm={result.algorithm} />
            </CardContent>
          </Card>

          {/* AICS Stepper Card (Only if AICS algorithm was selected) */}
          {result.aics_decision && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                  {t.simulator.aicsTraceTitle}
                </h2>
              </CardHeader>
              <CardContent>
                <AICSStepper decision={result.aics_decision} />
              </CardContent>
            </Card>
          )}

          {/* Process Results Table */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">
                {t.simulator.processResultsTitle}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.pid} <TechnicalTooltip termKey="pid" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.at} <TechnicalTooltip termKey="at" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.bt} <TechnicalTooltip termKey="bt" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.ct} <TechnicalTooltip termKey="ct" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.tat} <TechnicalTooltip termKey="tat" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2 pr-4">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.wt} <TechnicalTooltip termKey="wt" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase pb-2">
                        <span className="inline-flex items-center">{t.simulator.tableHeaders.rt} <TechnicalTooltip termKey="rt" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60 font-mono">
                    {result.process_results.map(p => (
                      <tr key={p.pid} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 pr-4 font-semibold text-indigo-600 dark:text-indigo-400">{p.pid}</td>
                        <td className="py-2.5 pr-4 text-gray-700 dark:text-slate-300">{p.arrival_time}</td>
                        <td className="py-2.5 pr-4 text-gray-700 dark:text-slate-300">{p.burst_time}</td>
                        <td className="py-2.5 pr-4 text-gray-900 dark:text-white font-bold">{p.completion_time}</td>
                        <td className="py-2.5 pr-4 text-purple-600 dark:text-purple-400 font-semibold">{p.turnaround_time}</td>
                        <td className="py-2.5 pr-4 text-orange-600 dark:text-orange-400 font-semibold">{p.waiting_time}</td>
                        <td className="py-2.5 text-pink-600 dark:text-pink-400 font-semibold">{p.response_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
