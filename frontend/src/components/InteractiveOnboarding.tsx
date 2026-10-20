'use client'
import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, Cpu, FileSpreadsheet, Play, BarChart3, LineChart } from 'lucide-react'

interface Props {
  forceOpen?: boolean
  onClose?: () => void
}

export function InteractiveOnboarding({ forceOpen = false, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const { lang } = useLanguage()
  const isTh = lang === 'th'

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setStep(0)
      return
    }
    try {
      const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      if (!completed) {
        // Show after a gentle 800ms delay for first-time visitors
        const timer = setTimeout(() => setIsOpen(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore
    }
  }, [forceOpen])

  const finishTour = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true')
    } catch {
      // Ignore
    }
    setIsOpen(false)
    if (onClose) onClose()
  }

  const tourSteps = [
    {
      icon: Sparkles,
      title: isTh ? '👋 ยินดีต้อนรับสู่ Smart CPU Scheduler!' : '👋 Welcome to Smart CPU Scheduler!',
      subtitle: isTh ? 'ระบบจำลองการจัดตาราง CPU สำหรับผู้เริ่มต้นและนักศึกษา' : 'CPU Scheduling Simulator for Students & Beginners',
      desc: isTh
        ? 'คุณสามารถเรียนรู้ ทดลอง และเปรียบเทียบอัลกอริทึมต่าง ๆ ได้ด้วยตนเอง โดยไม่ต้องสมัครสมาชิก ต้องการให้ระบบพาชมและแนะนำการใช้งานเบื้องต้นทีละขั้นตอนหรือไม่?'
        : 'Learn, simulate, and compare algorithms at your own pace without registration. Would you like a quick interactive walkthrough?',
      isPrompt: true,
    },
    {
      icon: Cpu,
      title: isTh ? '1. การเลือกอัลกอริทึม (Algorithm Selection)' : '1. Algorithm Selection',
      subtitle: isTh ? 'เลือกวิธีที่ CPU จะจัดสรรเวลาให้แต่ละงาน' : 'Choose how CPU dispatches time',
      desc: isTh
        ? 'ในแถบ Algorithm Selection คุณสามารถเลือก FCFS, SJF, SRTF, Round Robin, Priority หรืออัลกอริทึมปรับตัว AICS (สำหรับผู้เริ่มต้นแนะนำให้เริ่มจาก FCFS ครับ)'
        : 'Choose from FCFS, SJF, SRTF, Round Robin, Priority, or adaptive AICS. FCFS is recommended for your first simulation.',
    },
    {
      icon: FileSpreadsheet,
      title: isTh ? '2. กำหนดข้อมูล Process (Workload Input)' : '2. Process Input & Presets',
      subtitle: isTh ? 'ป้อน PID, Arrival Time, Burst Time และ Priority' : 'Enter PID, Arrival, Burst, and Priority',
      desc: isTh
        ? 'คุณสามารถกรอกข้อมูลโพรเซสลงในตาราง หรือกดปุ่ม "เลือกชุดข้อมูลตัวอย่าง (3 รูปแบบ)" เพื่อโหลดข้อมูลสำเร็จรูปที่จัดเตรียมไว้สำหรับการเรียนรู้ได้ทันที'
        : 'Enter processes in the table or click "Sample Presets" to instantly load 3 ready-made educational datasets.',
    },
    {
      icon: Play,
      title: isTh ? '3. เริ่มการจำลองและคำแนะนำด้วย AI' : '3. Run Simulation & AI Recommend',
      subtitle: isTh ? 'ประมวลผลทันทีในไม่กี่มิลลิวินาที' : 'Execute scheduling or ask AI',
      desc: isTh
        ? 'กดปุ่ม "เริ่มจำลอง" เพื่อสั่งให้เครื่องมือคำนวณ หรือกด "AI แนะนำอัลกอริทึม" เพื่อให้ Machine Learning วิเคราะห์และบอกว่าควรใช้อัลกอริทึมใดพร้อมเหตุผล'
        : 'Click "Run Simulation" to compute, or click "AI Recommend" to let Random Forest ML recommend the optimal scheduling policy.',
    },
    {
      icon: BarChart3,
      title: isTh ? '4. ผังแกนต์ (Gantt Chart Timeline)' : '4. Gantt Chart Timeline',
      subtitle: isTh ? 'ดูช่วงเวลาที่ CPU ทำงานให้แต่ละ Process' : 'Visual timeline of process execution',
      desc: isTh
        ? 'ผังแกนต์จะแสดงช่วงเวลาจริงของแต่ละโพรเซสด้วยสีประจำตัว มีตัวเลขแกนเวลากำกับชัดเจน และมีคู่มืออธิบายการอ่านผังแกนต์อยู่ใต้กราฟ'
        : 'The Gantt chart displays colored execution blocks across the time axis, including IDLE periods and completion markers.',
    },
    {
      icon: LineChart,
      title: isTh ? '5. แดชบอร์ดตัวชี้วัดประสิทธิภาพ (Metrics)' : '5. Performance Metrics Dashboard',
      subtitle: isTh ? 'วัดผลความรวดเร็วและความคุ้มค่า' : 'Measure efficiency and fairness',
      desc: isTh
        ? 'สรุปเวลารอคอยเฉลี่ย (Avg WT), เวลารอบงานเฉลี่ย (Avg TAT), เวลาตอบสนอง (Avg RT), อัตราการใช้ CPU (%) และจำนวนการสลับบริบท (Context Switches)'
        : 'Instant calculations of Avg Waiting Time, Turnaround Time, Response Time, CPU Utilization, and Context Switches.',
    },
    {
      icon: CheckCircle2,
      title: isTh ? '🎉 พร้อมเริ่มต้นการทดลองแล้ว!' : '🎉 You’re all set!',
      subtitle: isTh ? 'เริ่มเรียนรู้การจัดตาราง CPU ได้ทันที' : 'Start your CPU scheduling journey',
      desc: isTh
        ? 'คุณสามารถเปิดคู่มือ 5 ขั้นตอน หรือเริ่มทัวร์แนะนำนี้ใหม่ได้เสมอจากเมนู "ช่วยเหลือ" ด้านบน ขอให้สนุกกับการเรียนรู้ครับ!'
        : 'You can revisit this onboarding tour or open the 5-step user guide anytime from the Help Center in the top navigation bar.',
      isLast: true,
    },
  ]

  if (!isOpen) return null

  const cur = tourSteps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-left space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close / Skip button */}
        <button
          type="button"
          onClick={finishTour}
          className="absolute top-5 right-5 p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={isTh ? 'ปิด / ข้ามคำแนะนำ' : 'Skip walkthrough'}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-7 bg-indigo-600 dark:bg-indigo-500'
                  : i < step
                  ? 'w-2 bg-indigo-300 dark:bg-indigo-900'
                  : 'w-2 bg-gray-200 dark:bg-slate-800'
              }`}
            />
          ))}
          <span className="ml-auto text-[11px] font-mono text-gray-400 dark:text-slate-500">
            {step + 1} / {tourSteps.length}
          </span>
        </div>

        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm ring-4 ring-indigo-50 dark:ring-indigo-950/30">
            <cur.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight leading-snug">
              {cur.title}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {cur.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          {cur.desc}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          {cur.isPrompt ? (
            <>
              <Button variant="ghost" size="sm" onClick={finishTour}>
                {isTh ? 'ข้ามคำแนะนำ' : 'Skip Tour'}
              </Button>
              <Button size="sm" onClick={() => setStep(1)} className="px-5">
                {isTh ? 'เริ่มพาชมเว็บไซต์' : 'Start Tour'} <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : cur.isLast ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> {isTh ? 'ย้อนกลับ' : 'Back'}
              </Button>
              <Button size="sm" onClick={finishTour} className="bg-emerald-600 hover:bg-emerald-700 px-5">
                <CheckCircle2 className="h-4 w-4" /> {isTh ? 'เริ่มใช้งานทันที' : 'Finish & Start'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setStep(Math.max(0, step - 1))}>
                <ArrowLeft className="h-4 w-4" /> {isTh ? 'ย้อนกลับ' : 'Back'}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={finishTour}>
                  {isTh ? 'ข้าม' : 'Skip'}
                </Button>
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  {isTh ? 'ถัดไป' : 'Next'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
