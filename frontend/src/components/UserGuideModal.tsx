'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Cpu, FileSpreadsheet, Play, BarChart2, GitCompare, ArrowRight, ArrowLeft } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function UserGuideModal({ open, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const { lang } = useLanguage()
  const { trackLesson } = useAnalytics()
  const isTh = lang === 'th'

  const steps = [
    {
      num: 1,
      icon: Cpu,
      title: isTh ? 'ขั้นตอนที่ 1: เลือกอัลกอริทึมการจัดตาราง' : 'Step 1: Select CPU Scheduling Algorithm',
      subtitle: isTh ? 'เริ่มต้นจากอัลกอริทึมที่เข้าใจง่ายที่สุด' : 'Start with the simplest algorithm',
      content: isTh ? (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>
            ระบบรองรับอัลกอริทึมมาตรฐาน 5 รูปแบบ และอัลกอริทึมปรับตัวอัจฉริยะ AICS:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li><strong className="text-indigo-600 dark:text-indigo-400">FCFS (แนะนำสำหรับผู้เริ่มต้น):</strong> มาก่อนได้ก่อน เข้าใจง่ายที่สุด ทำงานตามลำดับการมาถึง</li>
            <li><strong className="text-purple-600 dark:text-purple-400">SJF:</strong> ทำงานที่ใช้เวลาสั้นที่สุดก่อน ให้เวลารอคอยเฉลี่ยต่ำ</li>
            <li><strong className="text-pink-600 dark:text-pink-400">SRTF:</strong> เหมือน SJF แต่สามารถแย่ง CPU ได้ทันทีที่มีงานสั้นกว่าเข้ามา</li>
            <li><strong className="text-orange-600 dark:text-orange-400">Round Robin:</strong> วนรอบเท่าเทียมกันตาม Time Quantum เหมาะกับระบบ Interactive</li>
            <li><strong className="text-emerald-600 dark:text-emerald-400">Priority:</strong> จัดลำดับตามความสำคัญของงาน (ตัวเลขน้อย = สำคัญมาก)</li>
            <li><strong className="text-teal-600 dark:text-teal-400">AICS:</strong> อัลกอริทึมปรับตัว วิเคราะห์ภาระงานและเลือกนโยบายที่เหมาะสมที่สุดให้อัตโนมัติ</li>
          </ul>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            💡 <strong>คำแนะนำสำหรับผู้เริ่มต้น:</strong> แนะนำให้เลือก <strong>FCFS</strong> สำหรับการทดลองครั้งแรก เพื่อทำความเข้าใจลำดับเวลาพื้นฐาน
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>The system supports 5 standard algorithms plus our adaptive AICS:</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li><strong className="text-indigo-600 dark:text-indigo-400">FCFS (Recommended for beginners):</strong> First-Come, First-Served — simplest to learn.</li>
            <li><strong className="text-purple-600 dark:text-purple-400">SJF:</strong> Shortest Job First — prioritizes minimal burst time.</li>
            <li><strong className="text-pink-600 dark:text-pink-400">SRTF:</strong> Shortest Remaining Time First — preemptive SJF.</li>
            <li><strong className="text-orange-600 dark:text-orange-400">Round Robin:</strong> Fair time-sharing based on Time Quantum.</li>
            <li><strong className="text-emerald-600 dark:text-emerald-400">Priority:</strong> Urgency-based scheduling (lower number = higher priority).</li>
            <li><strong className="text-teal-600 dark:text-teal-400">AICS:</strong> Dynamically adapts policy based on workload analysis.</li>
          </ul>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            💡 <strong>Beginner Tip:</strong> Choose <strong>FCFS</strong> for your first experiment to easily follow execution order without preemption.
          </div>
        </div>
      ),
    },
    {
      num: 2,
      icon: FileSpreadsheet,
      title: isTh ? 'ขั้นตอนที่ 2: กำหนดข้อมูลกระบวนการ (Processes)' : 'Step 2: Define Process Inputs',
      subtitle: isTh ? 'ป้อนข้อมูลหรือเลือกชุดตัวอย่างสำเร็จรูป' : 'Enter data or select sample presets',
      content: isTh ? (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>แต่ละ Process ประกอบด้วย 4 ข้อมูลสำคัญ:</p>
          <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Process ID (PID)</strong>
              <span className="text-gray-600 dark:text-slate-300">ชื่อเรียกกระบวนการ เช่น P1, P2 (ต้องไม่ซ้ำกัน)</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Arrival Time (AT)</strong>
              <span className="text-gray-600 dark:text-slate-300">เวลาที่กระบวนการมาถึงคิว (มิลลิวินาที: ms) เริ่มต้นที่ 0</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Burst Time (BT)</strong>
              <span className="text-gray-600 dark:text-slate-300">ระยะเวลาที่ต้องใช้ CPU ทำงานจริง (ต้อง ≥ 1 ms)</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Priority</strong>
              <span className="text-gray-600 dark:text-slate-300">ลำดับความสำคัญ (1 คือด่วนที่สุด, 10 คือความสำคัญต่ำสุด)</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-xs leading-relaxed">
            ✨ <strong>ทางลัดสะดวกรวดเร็ว:</strong> คุณสามารถกดปุ่ม <strong>"เลือกชุดข้อมูลตัวอย่าง"</strong> เพื่อโหลดข้อมูลตัวอย่าง 3 รูปแบบได้ทันทีโดยไม่ต้องพิมพ์เอง!
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>Each process requires four core attributes:</p>
          <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Process ID (PID)</strong>
              <span className="text-gray-600 dark:text-slate-300">Unique process identifier (e.g. P1, P2)</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Arrival Time (AT)</strong>
              <span className="text-gray-600 dark:text-slate-300">Queue entry time in ms (starts at 0)</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Burst Time (BT)</strong>
              <span className="text-gray-600 dark:text-slate-300">CPU execution time needed (≥ 1 ms)</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/80">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Priority</strong>
              <span className="text-gray-600 dark:text-slate-300">Urgency level (1 = highest urgency)</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-xs leading-relaxed">
            ✨ <strong>Fast Shortcut:</strong> Click <strong>"Sample Presets"</strong> on the simulator page to load 3 ready-made datasets instantly!
          </div>
        </div>
      ),
    },
    {
      num: 3,
      icon: Play,
      title: isTh ? 'ขั้นตอนที่ 3: เริ่มการจำลองการประมวลผล' : 'Step 3: Run Simulation',
      subtitle: isTh ? 'ตรวจสอบข้อมูลและกดปุ่มเริ่มจำลอง' : 'Validate data and click Run',
      content: isTh ? (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>
            เมื่อกำหนดข้อมูลครบถ้วนแล้ว ให้กดปุ่ม <strong className="text-gray-900 dark:text-white">"เริ่มจำลอง" (Run Simulation)</strong>:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li>ระบบจะตรวจสอบความถูกต้องของข้อมูล (เช่น PID ไม่ซ้ำกัน, Burst Time &gt; 0)</li>
            <li>ระบบประมวลผลอัลกอริทึมจำลองอย่างแม่นยำภายในไม่กี่มิลลิวินาที</li>
            <li>หากเลือก <strong className="text-orange-600 dark:text-orange-400">Round Robin</strong> อย่าลืมกำหนดค่า <strong>Time Quantum</strong> ที่เหมาะสม (เช่น 2 หรือ 4 ms)</li>
            <li>หรือสามารถกด <strong className="text-indigo-600 dark:text-indigo-400">"AI แนะนำอัลกอริทึม"</strong> เพื่อให้โมเดล Machine Learning วิเคราะห์และแนะนำตัวเลือกที่ดีที่สุด</li>
          </ul>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
            🤖 <strong>ฟีเจอร์ AI:</strong> ระบบมี Random Forest ML วิเคราะห์คุณลักษณะ 14 มิติของ Process เพื่อแนะนำอัลกอริทึมที่คุ้มค่าที่สุด
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>Click <strong className="text-gray-900 dark:text-white">"Run Simulation"</strong> to execute. The system computes timeline and metrics instantaneously.</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li>Input validation ensures unique PIDs and positive Burst Times</li>
            <li>If testing <strong className="text-orange-600 dark:text-orange-400">Round Robin</strong>, configure the Time Quantum (e.g. 2 or 4 ms)</li>
            <li>Or click <strong className="text-indigo-600 dark:text-indigo-400">"AI Recommend"</strong> to let Machine Learning analyze your workload</li>
          </ul>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
            🤖 <strong>AI Assistant:</strong> Random Forest model inspects 14 workload characteristics to suggest optimal scheduling.
          </div>
        </div>
      ),
    },
    {
      num: 4,
      icon: BarChart2,
      title: isTh ? 'ขั้นตอนที่ 4: ศึกษาผลลัพธ์และตัวชี้วัด' : 'Step 4: Analyze Results & Metrics',
      subtitle: isTh ? 'อ่านผังแกนต์และทำความเข้าใจตัวเลขประสิทธิภาพ' : 'Inspect Gantt Chart and key metrics',
      content: isTh ? (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>ระบบจะแสดงผลลัพธ์ 3 ส่วน:</p>
          <ol className="space-y-1.5 list-decimal list-inside text-xs sm:text-sm">
            <li><strong className="text-gray-900 dark:text-white">ผังแกนต์ (Gantt Chart):</strong> แสดงแถบเวลาจริงว่า CPU ทำงานให้โพรเซสใด ในช่วงเวลาใด</li>
            <li><strong className="text-gray-900 dark:text-white">Performance Dashboard:</strong> แสดงค่าเฉลี่ย Waiting Time (เวลารอคอย), Turnaround Time (เวลารอบงาน), Response Time, CPU Utilization, Throughput และ Context Switches</li>
            <li><strong className="text-gray-900 dark:text-white">ตารางผลลัพธ์ราย Process:</strong> แสดงเวลาเสร็จสิ้น (CT), TAT, WT, RT ของแต่ละงานอย่างละเอียด</li>
          </ol>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
            🎯 <strong>เป้าหมายการประเมิน:</strong> ยิ่งเวลารอคอยเฉลี่ย (Avg WT) และเวลารอบงานเฉลี่ย (Avg TAT) มีค่าน้อยเท่าใด หมายความว่าอัลกอริทึมนั้นทำงานได้มีประสิทธิภาพมากขึ้นเท่านั้น
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>The system presents results in three coordinated panels:</p>
          <ol className="space-y-1.5 list-decimal list-inside text-xs sm:text-sm">
            <li><strong className="text-gray-900 dark:text-white">Gantt Chart:</strong> Visual execution bar chart showing CPU assignment across time</li>
            <li><strong className="text-gray-900 dark:text-white">Performance Metrics:</strong> Avg Waiting Time, Turnaround Time, Response Time, CPU Utilization</li>
            <li><strong className="text-gray-900 dark:text-white">Process Result Table:</strong> Completion Time, TAT, WT, RT calculated per process</li>
          </ol>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
            🎯 <strong>Evaluation Goal:</strong> Lower Avg Waiting Time (WT) and Turnaround Time (TAT) indicate superior performance for batch workloads.
          </div>
        </div>
      ),
    },
    {
      num: 5,
      icon: GitCompare,
      title: isTh ? 'ขั้นตอนที่ 5: เปรียบเทียบอัลกอริทึมต่างๆ' : 'Step 5: Compare Multiple Algorithms',
      subtitle: isTh ? 'ทดสอบว่าอัลกอริทึมใดทำงานได้ดีที่สุดสำหรับงานของคุณ' : 'Find which algorithm outperforms others',
      content: isTh ? (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>
            คลิกที่เมนู <strong className="text-gray-900 dark:text-white">"เปรียบเทียบ" (Compare)</strong> ที่แถบด้านบน:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li>ระบบจะนำชุดข้อมูลเดียวกันไปจำลองกับทุกอัลกอริทึมพร้อมกัน</li>
            <li>แสดงตารางสรุปเปรียบเทียบค่าเวลาของทุกอัลกอริทึมแบบเคียงข้างกัน</li>
            <li>แสดงกราฟแท่ง (Bar Chart) สีสันชัดเจน เพื่อให้เห็นความแตกต่างของเวลารอคอยและเวลารอบงานได้ทันที</li>
            <li>ช่วยให้นักเรียนเห็นจุดเด่นและข้อจำกัดของแต่ละอัลกอริทึมได้อย่างเป็นรูปธรรม</li>
          </ul>
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-300 text-xs leading-relaxed">
            📊 <strong>การศึกษาเปรียบเทียบ:</strong> เหมาะอย่างยิ่งสำหรับการทำรายงานหรือเปรียบเทียบประสิทธิภาพในห้องเรียน
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
          <p>Visit the <strong className="text-gray-900 dark:text-white">Compare</strong> page from the top navigation:</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm">
            <li>Simulate all algorithms simultaneously against the exact same dataset</li>
            <li>Side-by-side comparison table of all timing metrics</li>
            <li>Interactive bar chart illustrating waiting and turnaround time differences</li>
            <li>Clear visualization of trade-offs between fairness and throughput</li>
          </ul>
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-300 text-xs leading-relaxed">
            📊 <strong>Comparative Study:</strong> Observe firsthand how SJF and SRTF minimize wait times compared to FCFS.
          </div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (open) {
      trackLesson(steps[currentStep]?.title || 'คู่มือการใช้งาน 5 ขั้นตอน', {
        step_number: currentStep + 1,
        action: 'guide_modal_open',
      })
    }
  }, [open, currentStep, trackLesson])

  const step = steps[currentStep]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isTh ? '📖 คู่มือการใช้งานเว็บไซต์ 5 ขั้นตอน (User Guide)' : '📖 5-Step User Guide'}
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between gap-1 border-b border-gray-100 dark:border-slate-800 pb-3 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                currentStep === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{s.num}</span>
              <span className="hidden sm:inline truncate max-w-[80px]">
                {s.num === 1 ? 'อัลกอริทึม' : s.num === 2 ? 'Process' : s.num === 3 ? 'จำลอง' : s.num === 4 ? 'ผลลัพธ์' : 'เปรียบเทียบ'}
              </span>
            </button>
          ))}
        </div>

        {/* Current Step Body */}
        <div className="space-y-2 min-h-[220px]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {step.subtitle}
              </p>
            </div>
          </div>

          {step.content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4" /> {isTh ? 'ย้อนกลับ' : 'Back'}
          </Button>

          <span className="text-xs text-gray-400 dark:text-slate-500 font-mono font-medium">
            {currentStep + 1} / {steps.length}
          </span>

          {currentStep < steps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            >
              {isTh ? 'ถัดไป' : 'Next'} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> {isTh ? 'เข้าใจแล้ว เริ่มต้นใช้งาน!' : 'Got it, let’s start!'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
