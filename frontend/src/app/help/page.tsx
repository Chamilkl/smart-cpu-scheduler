'use client'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TECHNICAL_GLOSSARY } from '@/lib/constants'
import { UserGuideModal } from '@/components/UserGuideModal'
import { InteractiveOnboarding } from '@/components/InteractiveOnboarding'
import { EducationalQuizModal } from '@/components/EducationalQuizModal'
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Calculator,
  ChevronDown,
  Layers,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Award
} from 'lucide-react'

export default function HelpPage() {
  const { t, lang } = useLanguage()
  const isTh = lang === 'th'
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: isTh ? '1. ทำไมผลลัพธ์ Waiting Time ของ SJF จึงมักจะต่ำกว่า FCFS?' : '1. Why does SJF generally achieve lower waiting time than FCFS?',
      a: isTh
        ? 'ตามหลักคณิตศาสตร์ การนำงานที่มีระยะเวลาประมวลผลสั้นที่สุดมาทำก่อน จะช่วยลดเวลารอคอยของงานส่วนใหญ่ลงได้อย่างมีนัยสำคัญ ต่างจาก FCFS ที่หากมีงานยาวอยู่หัวคิว งานสั้นทั้งหมดที่ตามมาจะต้องรอนานมาก (เรียกว่า Convoy Effect)'
        : 'SJF minimizes waiting time by dispatching short jobs first, preventing long jobs from blocking the ready queue (avoiding the Convoy Effect observed in FCFS).',
    },
    {
      q: isTh ? '2. Preemptive กับ Non-preemptive แตกต่างกันอย่างไร?' : '2. What is the difference between Preemptive and Non-preemptive scheduling?',
      a: isTh
        ? 'Non-preemptive (เช่น FCFS, SJF) เมื่องานได้ CPU แล้ว จะครอง CPU จนเสร็จสมบูรณ์โดยไม่มีใครแย่งได้ ส่วน Preemptive (เช่น SRTF, Round Robin) ระบบสามารถสั่งหยุดงานที่กำลังรันอยู่ชั่วคราว เพื่อสลับให้งานที่สำคัญกว่าหรือถึงคิวทำงานแทนได้ทันที'
        : 'In Non-preemptive systems, a running process holds the CPU until completion. In Preemptive systems, the OS can interrupt a running process to allocate CPU to higher-priority tasks or enforce time-slices.',
    },
    {
      q: isTh ? '3. Time Quantum ใน Round Robin ควรตั้งค่าเท่าใดจึงจะเหมาะสม?' : '3. What is an optimal Time Quantum in Round Robin?',
      a: isTh
        ? 'หากตั้งค่า Time Quantum เล็กเกินไป จะเกิดการสลับบริบท (Context Switch) ถี่เกินไปจนเสียประสิทธิภาพ หากตั้งค่าใหญ่เกินไป Round Robin จะมีพฤติกรรมกลายเป็น FCFS โดยทั่วไปหลักการที่ดีคือกำหนดให้ Time Quantum ยาวพอที่จะครอบคลุมประมาณ 80% ของ Burst Time ของโพรเซส'
        : 'If the quantum is too short, excessive context switches degrade system efficiency. If too long, it degenerates into FCFS. A standard rule of thumb is setting quantum to cover ≈80% of CPU bursts.',
    },
    {
      q: isTh ? '4. อัลกอริทึม AICS แตกต่างจากอัลกอริทึมมาตรฐานอย่างไร?' : '4. How does AICS differ from standard scheduling algorithms?',
      a: isTh
        ? 'AICS (Adaptive Intelligent CPU Scheduler) เป็นอัลกอริทึมนวัตกรรมที่พัฒนาขึ้นในโครงการนี้ โดยจะวิเคราะห์คุณลักษณะของภาระงาน (เช่น ค่าความแปรปรวนของ Burst Time, การกระจายตัวของเวลามาถึง, ระดับความสำคัญ) แล้วปรับเปลี่ยนนโยบายการจัดตารางและการปรับพารามิเตอร์แบบปรับตัวตามสถานการณ์จริง'
        : 'AICS is our novel adaptive algorithm that inspects workload features (burst variance, arrival distribution, priority spread) and dynamically adapts policy and quantum to suit the real-time scenario.',
    },
    {
      q: isTh ? '5. จำเป็นต้องสมัครสมาชิกก่อนใช้งานหรือไม่?' : '5. Do I need to create an account or sign in to use this system?',
      a: isTh
        ? 'ไม่จำเป็นเลยครับ! ระบบ Smart CPU Scheduler ออกแบบมาเพื่อเป็นสื่อการเรียนรู้แบบเปิด (Open Educational Tool) นักเรียน นักศึกษา และอาจารย์สามารถเข้าถึงและใช้งานทุกฟังก์ชันได้ทันทีฟรี'
        : 'No registration required! The system is designed as an open educational platform for students and educators to access all features immediately.',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Modals */}
      <UserGuideModal open={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <InteractiveOnboarding forceOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <EducationalQuizModal open={quizModalOpen} onClose={() => setQuizModalOpen(false)} />

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/20">
            <HelpCircle className="h-4 w-4" />
            <span>Help & Learning Center (ศูนย์ช่วยเหลือและการเรียนรู้)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {isTh ? 'ศูนย์ช่วยเหลือและคู่มือการเรียนรู้' : 'Help & Learning Center'}
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            {isTh
              ? 'รวบรวมคำอธิบายการใช้งาน พจนานุกรมคำศัพท์เทคนิคด้านระบบปฏิบัติการ คำถามที่พบบ่อย และคู่มือการอ่านผลลัพธ์ผังแกนต์'
              : 'Complete user guide, OS technical glossary, FAQs, and Gantt chart interpretation guide for students.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGuideModalOpen(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 font-bold"
            >
              <BookOpen className="h-4 w-4" /> {isTh ? 'เปิดคู่มือ 5 ขั้นตอน' : '5-Step User Guide'}
            </Button>
            <button
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isTh ? 'เริ่มทัวร์แนะนำเว็บไซต์ (Interactive Tour)' : 'Restart Onboarding Tour'}</span>
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuizModalOpen(true)}
              className="bg-amber-400 text-gray-900 hover:bg-amber-300 border-0 font-bold shadow-md shadow-amber-400/20"
            >
              <Award className="h-4 w-4 text-amber-900" />
              <span>{isTh ? '🎯 แบบทดสอบวัดความรู้ (Quiz)' : '🎯 Knowledge Quiz'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Technical Glossary & Gantt Guide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Glossary */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'พจนานุกรมคำศัพท์เทคนิค (Technical Glossary)' : 'Technical Glossary'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isTh ? 'คำอธิบายศัพท์สำคัญ 14 รายการตามข้อกำหนด TOR 3.3 พร้อมสูตรคำนวณ' : '14 technical terms with mathematical formulas'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.values(TECHNICAL_GLOSSARY).map((term) => (
                  <div
                    key={term.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                        {isTh ? term.termTh : term.termEn}
                      </span>
                      {term.abbr && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {term.abbr}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
                      {isTh ? term.shortDefTh : term.shortDefEn}
                    </p>
                    {term.formula && (
                      <div className="pt-1">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          <Calculator className="h-3 w-3" />
                          <span>{isTh ? 'สูตร:' : 'Formula:'}</span>
                        </div>
                        <div className="font-mono text-[10px] text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                          {term.formula}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Gantt Chart Reading Guide */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'คำแนะนำการอ่านผังแกนต์ (Gantt Chart Interpretation)' : 'Gantt Chart Interpretation'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isTh ? 'วิธีการอ่านช่วงเวลาและตรวจสอบลำดับการจัดตาราง' : 'How to read timelines and verify scheduling order'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <strong className="text-gray-900 dark:text-white block mb-1">
                    📌 1. ทำความเข้าใจแกนเวลาในแนวนอน
                  </strong>
                  แกนเวลาเริ่มจากเวลา 0 ไปทางขวา แต่ละช่องแสดงการครอบครอง CPU ในช่วงเวลานั้น เช่น ช่วง [0, 8] หมายความว่ามีโพรเซสรันต่อเนื่อง 8 มิลลิวินาที
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <strong className="text-gray-900 dark:text-white block mb-1">
                    📌 2. สังเกตการณ์แย่ง CPU (Preemption)
                  </strong>
                  ในอัลกอริทึมอย่าง Round Robin หรือ SRTF คุณจะสังเกตเห็นว่าโพรเซสหนึ่งอาจถูกตัดตอนเป็นหลายช่วง และสลับให้โพรเซสอื่นทำก่อน นั่นคือตัวอย่างของการแย่ง CPU (Preemption)
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                  <strong className="text-gray-900 dark:text-white block mb-1">
                    📌 3. การหาค่า Turnaround Time และ Waiting Time จากผังแกนต์
                  </strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li><strong>Completion Time (CT):</strong> ดูขอบขวาสุดที่แถบของโพรเซสนั้นปรากฏครั้งสุดท้าย</li>
                    <li><strong>Turnaround Time (TAT):</strong> คำนวณจาก CT ลบด้วย Arrival Time (AT)</li>
                    <li><strong>Waiting Time (WT):</strong> นำ TAT ที่ได้ ลบด้วย Burst Time (BT) ของงานนั้น</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: FAQs & Quick Links */}
        <div className="space-y-6">
          {/* Section: FAQs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-base">
                    {isTh ? 'คำถามที่พบบ่อย (FAQs)' : 'Frequently Asked Questions'}
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i
                return (
                  <div
                    key={i}
                    className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-slate-800/40"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full p-3.5 text-left text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-gray-100/50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-slate-800/60 mt-1">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">
                {isTh ? 'ทางลัดการเรียนรู้' : 'Quick Learning Links'}
              </h2>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                variant="secondary"
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => setGuideModalOpen(true)}
              >
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <span>{isTh ? 'เปิดคู่มือการใช้งาน 5 ขั้นตอน' : 'Open 5-Step Guide'}</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => setTourOpen(true)}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{isTh ? 'เริ่มทัวร์แนะนำเว็บไซต์อีกครั้ง' : 'Restart Interactive Tour'}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
