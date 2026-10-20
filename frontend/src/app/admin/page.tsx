'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getModelStatus, trainModel } from '@/lib/api'
import { Brain, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminPage() {
  const [modelTrained, setModelTrained] = useState(false)
  const [training, setTraining] = useState(false)
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLanguage()

  useEffect(() => {
    getModelStatus()
      .then(s => { setModelTrained(s.model_trained); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleTrain = async () => {
    setTraining(true)
    try {
      const r = await trainModel()
      toast.success(lang === 'th' ? 'เริ่มกระบวนการฝึกโมเดล AI ในเบื้องหลังแล้ว' : r.message)
      setTimeout(() => {
        getModelStatus().then(s => setModelTrained(s.model_trained))
      }, 3000)
    } catch {
      toast.error(lang === 'th' ? 'การฝึกโมเดลล้มเหลว' : 'Training failed')
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t.admin.title}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> {t.admin.mlStatus}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-gray-400 dark:text-slate-500 text-sm">กำลังตรวจสอบสถานะ...</p>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              {modelTrained ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold block text-sm">
                      {t.admin.modelReady}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      Random Forest Classifier พร้อมสำหรับวิเคราะห์ภาระงาน
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                  <span className="text-gray-600 dark:text-slate-300 font-medium text-sm">
                    {t.admin.modelNotReady}
                  </span>
                </>
              )}
            </div>
          )}

          <Button onClick={handleTrain} loading={training} className="py-2.5">
            <Brain className="h-4 w-4" /> {modelTrained ? t.admin.retrainBtn : t.admin.trainBtn}
          </Button>

          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            {t.admin.trainDesc}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
