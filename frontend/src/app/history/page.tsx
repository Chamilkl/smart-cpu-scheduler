'use client'
import { useEffect, useState } from 'react'
import { HistoryRecord } from '@/lib/types'
import { getHistory } from '@/lib/api'
import { SimulationHistoryList } from '@/components/SimulationHistory'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getSessionId } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const sid = getSessionId()
    getHistory(sid)
      .then(r => { setRecords(r); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t.history.title}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {t.history.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">
            {t.history.title}
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <SimulationHistoryList records={records} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
