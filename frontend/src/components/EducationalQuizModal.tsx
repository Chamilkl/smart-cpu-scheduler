'use client'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ArrowRight } from 'lucide-react'

interface Question {
  id: string
  topic: string
  questionTh: string
  questionEn: string
  optionsTh: string[]
  optionsEn: string[]
  correctIndex: number
  explanationTh: string
  explanationEn: string
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'q1',
    topic: 'FCFS & Convoy Effect',
    questionTh: 'ข้อใดคือข้อเสียสำคัญที่สุดของอัลกอริทึม First-Come, First-Served (FCFS)?',
    questionEn: 'What is the primary drawback of First-Come, First-Served (FCFS)?',
    optionsTh: [
      'เกิดปรากฏการณ์ Convoy Effect เมื่องานยาวอยู่หัวคิว ทำให้งานสั้นต้องรอนานมาก',
      'อัลกอริทึมซับซ้อนและใช้พลังงานประมวลผลสูงเกินไป',
      'อาจเกิดการแย่งชิง CPU (Preemption) ตลอดเวลา',
      'ไม่สามารถใช้กับระบบที่มีงานมากกว่า 2 โพรเซสได้',
    ],
    optionsEn: [
      'Convoy Effect: Short processes suffer extreme wait times behind long processes',
      'Algorithm is excessively complex and CPU-heavy',
      'Causes frequent preemption overhead',
      'Cannot handle more than 2 processes',
    ],
    correctIndex: 0,
    explanationTh: 'Convoy Effect เป็นจุดอ่อนหลักของ FCFS เมื่องานแรกมี Burst Time สูง งานถัดไปทั้งหมดต้องรอนาน ทำให้ Average Waiting Time พุ่งสูง',
    explanationEn: 'The Convoy Effect is the signature bottleneck of FCFS where long CPU-bound jobs block short interactive jobs.',
  },
  {
    id: 'q2',
    topic: 'Preemption (การแย่ง CPU)',
    questionTh: 'อัลกอริทึมใดต่อไปนี้เป็น Preemptive Scheduling (ระบบสามารถสลับงานที่กำลังรันอยู่เพื่อแย่ง CPU ได้)?',
    questionEn: 'Which of the following is a Preemptive Scheduling algorithm?',
    optionsTh: [
      'FCFS (First-Come, First-Served)',
      'SJF แบบดั้งเดิม (Non-preemptive Shortest Job First)',
      'SRTF (Shortest Remaining Time First) และ Round Robin',
      'Priority แบบ Non-preemptive',
    ],
    optionsEn: [
      'Standard FCFS',
      'Traditional non-preemptive SJF',
      'SRTF (Shortest Remaining Time First) and Round Robin',
      'Non-preemptive Priority',
    ],
    correctIndex: 2,
    explanationTh: 'SRTF และ Round Robin เป็น Preemptive โดย SRTF จะแย่ง CPU เมื่อมีงานที่เวลางานเหลือน้อยกว่าเข้ามา ส่วน Round Robin แย่ง CPU เมื่อหมด Time Quantum',
    explanationEn: 'SRTF preempts when a shorter remaining burst arrives; Round Robin preempts upon quantum expiration.',
  },
  {
    id: 'q3',
    topic: 'SJF Optimization',
    questionTh: 'ข้อได้เปรียบสำคัญที่สุดของ Shortest Job First (SJF) คืออะไร?',
    questionEn: 'What is the greatest theoretical advantage of Shortest Job First (SJF)?',
    optionsTh: [
      'รับประกันการกระจายงานอย่างเท่าเทียมที่สุดเสมอ',
      'ให้เวลารอคอยเฉลี่ย (Average Waiting Time) ต่ำที่สุดสำหรับชุดงานที่ไม่สามารถแย่ง CPU ได้',
      'ไม่จำเป็นต้องรู้ Burst Time ของโพรเซสล่วงหน้า',
      'ป้องกันปัญหาการอดตาย (Starvation) ของงานยาวได้ 100%',
    ],
    optionsEn: [
      'Guarantees perfectly balanced CPU time',
      'Provably achieves minimal Average Waiting Time among non-preemptive algorithms',
      'Does not require advance knowledge of burst times',
      'Completely eliminates starvation for long jobs',
    ],
    correctIndex: 1,
    explanationTh: 'SJF พิสูจน์แล้วว่าให้ Average Waiting Time ต่ำที่สุด แต่มีข้อเสียคืออาจเกิด Starvation สำหรับงานที่มี Burst Time ยาว',
    explanationEn: 'SJF is mathematically optimal for minimizing average waiting time for non-preemptive schedules.',
  },
  {
    id: 'q4',
    topic: 'Round Robin & Time Quantum',
    questionTh: 'หากกำหนด Time Quantum ในอัลกอริทึม Round Robin มีค่าน้อยเกินไป (เช่น 0.001 ms) จะเกิดผลกระทบใด?',
    questionEn: 'What happens if the Time Quantum in Round Robin is set excessively small?',
    optionsTh: [
      'ระบบจะเสมือนกลายเป็นอัลกอริทึม FCFS',
      'การสลับบริบท (Context Switch) จะเกิดขึ้นถี่เกินไปจนสูญเสียเวลา Overhead สูงมาก',
      'เวลารอคอยเฉลี่ยจะกลายเป็น 0 ทันที',
      'โปรแกรมทุกตัวจะหยุดการทำงานพร้อมกัน',
    ],
    optionsEn: [
      'The scheduler degenerates into FCFS',
      'Excessive Context Switching introduces massive system overhead and degrades throughput',
      'Average waiting time instantaneously reaches zero',
      'All processes freeze simultaneously',
    ],
    correctIndex: 1,
    explanationTh: 'Time Quantum ที่สั้นเกินไปจะทำให้ CPU เสียเวลาไปกับการเซฟและโหลดสถานะโพรเซส (Context Switch Overhead) มากกว่าการประมวลผลจริง',
    explanationEn: 'Micro-quanta trigger continuous context switching overhead, severely reducing useful CPU throughput.',
  },
  {
    id: 'q5',
    topic: 'AICS & Adaptive Scheduling',
    questionTh: 'อัลกอริทึมนวัตกรรม AICS (Adaptive Intelligent CPU Scheduler) ตัดสินใจเลือกนโยบายจากอะไร?',
    questionEn: 'How does the novel AICS (Adaptive Intelligent CPU Scheduler) select its policy?',
    optionsTh: [
      'สุ่มนโยบายใหม่ทุกๆ 1 วินาที',
      'วิเคราะห์คุณลักษณะภาระงาน (Workload Features) เช่น ความแปรปรวนของเวลาประมวลผลและการกระจายตัวของงาน',
      'บังคับใช้งานเฉพาะ Round Robin เสมอ',
      'เลือกตามชื่อของ Process ID',
    ],
    optionsEn: [
      'Randomly shuffles policies every second',
      'Extracts and inspects workload features such as burst variance and arrival distribution to select the best policy dynamically',
      'Always forces standard Round Robin',
      'Selects policies alphabetically by Process ID',
    ],
    correctIndex: 1,
    explanationTh: 'AICS สกัดคุณลักษณะ (Features) ของงานใน Ready Queue แล้วเลือกนโยบายและ Time Quantum ที่เหมาะสมที่สุดแบบปรับตัว (Adaptive)',
    explanationEn: 'AICS extracts empirical features of the process batch and dynamically adapts policy and quantum to suit the real-time distribution.',
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function EducationalQuizModal({ open, onClose }: Props) {
  const { lang } = useLanguage()
  const { trackQuiz } = useAnalytics()
  const isTh = lang === 'th'

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [started, setStarted] = useState(false)

  // Track quiz_start when user begins
  const handleStart = () => {
    setStarted(true)
    setCurrentIdx(0)
    setSelectedAnswers({})
    setSubmitted(false)
    trackQuiz('start', { total_questions: QUIZ_QUESTIONS.length })
  }

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = () => {
    let correctCount = 0
    const answersBreakdown: Record<string, { topic: string; correct: boolean }> = {}

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctIndex
      if (isCorrect) correctCount += 1
      answersBreakdown[q.id] = {
        topic: q.topic,
        correct: isCorrect,
      }
    })

    const scorePercent = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100)
    setSubmitted(true)

    // Track anonymous quiz_submit event (No PII)
    trackQuiz('submit', {
      total_questions: QUIZ_QUESTIONS.length,
      correct_count: correctCount,
      score_percent: scorePercent,
      answers: answersBreakdown,
    })
  }

  const scoreCount = QUIZ_QUESTIONS.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length
  const scorePercent = Math.round((scoreCount / QUIZ_QUESTIONS.length) * 100)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isTh ? '🎯 แบบทดสอบวัดความรู้ CPU Scheduling (Educational Quiz)' : '🎯 CPU Scheduling Knowledge Quiz'}
      className="max-w-2xl"
    >
      {!started ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isTh ? 'ทบทวนและวัดความเข้าใจการจัดตาราง CPU' : 'Test Your Scheduling Knowledge'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
              {isTh
                ? 'แบบทดสอบ 5 ข้อ ครอบคลุม FCFS, SJF, SRTF, Round Robin และ AICS แบบไม่ระบุตัวตน (Anonymous)'
                : '5 interactive questions covering FCFS, SJF, SRTF, RR, and AICS. Submissions are strictly anonymous.'}
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={handleStart} className="px-6 py-2.5">
              <span>{isTh ? 'เริ่มทำแบบทดสอบ' : 'Start Quiz'}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : !submitted ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium">
              <span>{isTh ? `คำถามข้อที่ ${currentIdx + 1} จาก ${QUIZ_QUESTIONS.length}` : `Question ${currentIdx + 1} of ${QUIZ_QUESTIONS.length}`}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {QUIZ_QUESTIONS[currentIdx].topic}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-base text-gray-900 dark:text-white leading-relaxed">
              {isTh ? QUIZ_QUESTIONS[currentIdx].questionTh : QUIZ_QUESTIONS[currentIdx].questionEn}
            </h4>

            <div className="space-y-2">
              {(isTh ? QUIZ_QUESTIONS[currentIdx].optionsTh : QUIZ_QUESTIONS[currentIdx].optionsEn).map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentIdx, optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm transition-all border flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-semibold shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs shrink-0 font-bold ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            >
              {isTh ? 'ข้อก่อนหน้า' : 'Previous'}
            </Button>

            {currentIdx < QUIZ_QUESTIONS.length - 1 ? (
              <Button
                size="sm"
                disabled={selectedAnswers[currentIdx] === undefined}
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                <span>{isTh ? 'ข้อถัดไป' : 'Next'}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <span>{isTh ? 'ส่งคำตอบ (Submit)' : 'Submit Answers'}</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {scorePercent}%
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {isTh ? `คุณตอบถูก ${scoreCount} จาก ${QUIZ_QUESTIONS.length} ข้อ` : `Score: ${scoreCount} / ${QUIZ_QUESTIONS.length}`}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isTh
                ? 'ข้อมูลคะแนนถูกส่งไปวิเคราะห์ในระบบ Analytics ในรูปแบบไม่ระบุตัวตน (Anonymous) เรียบร้อยแล้ว'
                : 'Your anonymous result has been recorded for educational analytics.'}
            </p>
          </div>

          {/* Detailed Review */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const userOpt = selectedAnswers[idx]
              const isCorrect = userOpt === q.correctIndex
              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {idx + 1}. {isTh ? q.questionTh : q.questionEn}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                        💡 {isTh ? q.explanationTh : q.explanationEn}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={handleStart} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              <span>{isTh ? 'ทำใหม่อีกครั้ง' : 'Retry Quiz'}</span>
            </Button>
            <Button size="sm" onClick={onClose}>
              {isTh ? 'ปิดหน้าต่าง' : 'Close'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
