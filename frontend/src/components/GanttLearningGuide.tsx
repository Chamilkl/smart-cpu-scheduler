'use client'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BookOpen, ChevronDown, Clock, Zap, CheckCircle2, Split, PauseCircle } from 'lucide-react'

interface Props {
  algorithm?: string
}

export function GanttLearningGuide({ algorithm }: Props) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const isTh = lang === 'th'

  const guides = [
    {
      icon: Clock,
      title: isTh ? '1. แกนเวลา (Time Axis)' : '1. Time Axis',
      desc: isTh
        ? 'ตัวเลขด้านล่างผังแกนต์แสดงหน่วยเวลา (ms) เริ่มจาก 0 ไปจนถึงเวลาที่ทุกงานเสร็จสิ้น (Total Time) ระยะห่างสะท้อนเวลาที่ผ่านไปจริง'
        : 'The numbers along the bottom represent elapsed time units (ms) from 0 to total completion time.',
    },
    {
      icon: Zap,
      title: isTh ? '2. แถบสีของแต่ละ Process' : '2. Process Color Bars',
      desc: isTh
        ? 'แต่ละโพรเซสจะมีสีประจำตัวเฉพาะ ความกว้างของกล่องเท่ากับระยะเวลาที่โพรเซสครอบครอง CPU ในช่วงเวลานั้น'
        : 'Each process is assigned a distinct color. Bar width corresponds directly to execution duration in that time window.',
    },
    {
      icon: CheckCircle2,
      title: isTh ? '3. เวลาเริ่มต้นและเวลาสิ้นสุด' : '3. Start & Completion Times',
      desc: isTh
        ? 'ขอบซ้ายของแท่งแรกของโพรเซสคือเวลาเริ่มประมวลผล (Start Time) ส่วนขอบขวาสุดของแท่งสุดท้ายคือกำหนดเวลาเสร็จสิ้นสมบูรณ์ (Completion Time: CT)'
        : 'The left edge of the first slice is Start Time. The right edge of the final slice is Completion Time (CT).',
    },
    {
      icon: PauseCircle,
      title: isTh ? '4. ช่วง CPU ว่าง (CPU Idle)' : '4. CPU Idle Periods',
      desc: isTh
        ? 'แถบสีเทาหรือคำว่า "IDLE" หมายถึงช่วงเวลาที่ไม่มีโพรเซสใดมาถึงระบบเลย CPU จึงหยุดพักรอ'
        : 'Gray segments labeled "IDLE" indicate that no process had arrived yet, so the CPU stayed idle.',
    },
    {
      icon: Split,
      title: isTh ? '5. ความแตกต่าง Preemptive vs Non-preemptive' : '5. Preemptive vs Non-preemptive',
      desc: isTh
        ? 'ในอัลกอริทึมแบบ Preemptive (เช่น SRTF หรือ Round Robin) แถบสีของโพรเซสเดิมอาจถูกตัดแบ่งเป็นหลายช่วงสลับกับงานอื่น ส่วนแบบ Non-preemptive (เช่น FCFS หรือ SJF) แต่ละโพรเซสจะมีแท่งสีเดียวต่อเนื่องจนเสร็จ'
        : 'In preemptive algorithms (SRTF, Round Robin), a process bar may be sliced into multiple fragments. In non-preemptive algorithms (FCFS, SJF), each process runs in a single continuous bar.',
    },
  ]

  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-slate-900/40 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-indigo-50/80 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            {isTh ? 'คู่มือการอ่านผังแกนต์ (Gantt Chart Learning Guide)' : 'Gantt Chart Learning Guide'}
          </span>
          {algorithm && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
              {algorithm}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <span>{open ? (isTh ? 'ซ่อนคำแนะนำ' : 'Hide') : (isTh ? 'ดูวิธีอ่านกราฟ' : 'Show Guide')}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="p-4 pt-1 border-t border-indigo-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {guides.map((g) => (
              <div
                key={g.title}
                className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/80 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <g.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-bold text-gray-900 dark:text-white text-xs">{g.title}</span>
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
