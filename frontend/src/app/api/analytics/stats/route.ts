import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { inMemoryEvents } from '@/lib/analyticsStore'

interface EventData {
  id: string
  event_type: string
  page_path: string
  session_id: string
  event_metadata: Record<string, unknown>
  created_at: string
}

export async function GET(req: NextRequest) {
  // 1. Strict Server-Side Admin Authentication Check (TOR Section 7)
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าถึงข้อมูล (Unauthorized Admin Access)' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d' // '7d' | '30d' | '90d' | 'custom'
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    const now = new Date()
    let startDate: Date

    if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    } else if (range === 'custom' && customStart) {
      startDate = new Date(customStart)
    } else {
      // Default 30d
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const endDate = (range === 'custom' && customEnd) ? new Date(customEnd) : now

    const supabase = getSupabaseServer()
    let rawEvents: EventData[] = []
    let supabaseConnected = false

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true })

        if (!error && data) {
          rawEvents = data as EventData[]
          supabaseConnected = true
        } else if (error) {
          console.error('[Stats API] Supabase query error:', error.message)
        }
      } catch (err) {
        console.error('[Stats API] Supabase connection failed:', err)
      }
    }

    // Fallback to in-memory events if Supabase is not connected yet
    if (!supabaseConnected) {
      const startMs = startDate.getTime()
      const endMs = endDate.getTime()
      rawEvents = inMemoryEvents.filter(e => {
        const time = new Date(e.created_at).getTime()
        return time >= startMs && time <= endMs
      })
    }

    // =================================================================
    // Aggregations and Metric Computations
    // =================================================================

    // 1. Overview Metrics
    const totalPageViews = rawEvents.filter(e => e.event_type === 'page_view').length
    const uniqueSessions = new Set(rawEvents.map(e => e.session_id))
    const totalVisitors = uniqueSessions.size

    // Today's Visitors & Views
    const todayStr = now.toISOString().split('T')[0]
    const todayEvents = rawEvents.filter(e => e.created_at.startsWith(todayStr))
    const todayVisitors = new Set(todayEvents.map(e => e.session_id)).size
    const todayPageViews = todayEvents.filter(e => e.event_type === 'page_view').length

    // Active Visitors in last 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    const activeVisitors = new Set(
      rawEvents.filter(e => e.created_at >= fiveMinutesAgo).map(e => e.session_id)
    ).size

    // Monthly Visitors (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const monthlyVisitors = new Set(
      rawEvents.filter(e => e.created_at >= thirtyDaysAgo).map(e => e.session_id)
    ).size

    // 2. Traffic Trends (Day-by-Day)
    const dailyMap: Record<string, { date: string; pageViews: number; visitors: Set<string>; simulations: number }> = {}

    // Pre-populate days in range
    const loopDate = new Date(startDate)
    while (loopDate <= endDate) {
      const dStr = loopDate.toISOString().split('T')[0]
      dailyMap[dStr] = { date: dStr, pageViews: 0, visitors: new Set(), simulations: 0 }
      loopDate.setDate(loopDate.getDate() + 1)
    }

    rawEvents.forEach(e => {
      const dStr = e.created_at.split('T')[0]
      if (!dailyMap[dStr]) {
        dailyMap[dStr] = { date: dStr, pageViews: 0, visitors: new Set(), simulations: 0 }
      }
      dailyMap[dStr].visitors.add(e.session_id)
      if (e.event_type === 'page_view') {
        dailyMap[dStr].pageViews += 1
      } else if (e.event_type === 'simulation_run') {
        dailyMap[dStr].simulations += 1
      }
    })

    const trafficTrends = Object.values(dailyMap).map(d => ({
      date: d.date,
      visitors: d.visitors.size,
      pageViews: d.pageViews,
      simulations: d.simulations,
    }))

    // 3. Monthly Comparison
    const monthlyMap: Record<string, { month: string; visitors: Set<string>; pageViews: number }> = {}
    rawEvents.forEach(e => {
      const mStr = e.created_at.slice(0, 7) // 'YYYY-MM'
      if (!monthlyMap[mStr]) {
        monthlyMap[mStr] = { month: mStr, visitors: new Set(), pageViews: 0 }
      }
      monthlyMap[mStr].visitors.add(e.session_id)
      if (e.event_type === 'page_view') {
        monthlyMap[mStr].pageViews += 1
      }
    })
    const monthlyComparison = Object.values(monthlyMap).map(m => ({
      month: m.month,
      visitors: m.visitors.size,
      pageViews: m.pageViews,
    }))

    // 4. Popular Pages
    const pageCounts: Record<string, number> = {}
    rawEvents.filter(e => e.event_type === 'page_view').forEach(e => {
      const p = e.page_path || '/'
      pageCounts[p] = (pageCounts[p] || 0) + 1
    })
    const popularPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, views: count }))
      .sort((a, b) => b.views - a.views)

    // 5. Device Statistics
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
    rawEvents.forEach(e => {
      const dev = String(e.event_metadata?.device || 'desktop').toLowerCase()
      if (dev.includes('mobile')) deviceCounts.mobile += 1
      else if (dev.includes('tablet')) deviceCounts.tablet += 1
      else deviceCounts.desktop += 1
    })
    const totalDeviceEvents = deviceCounts.desktop + deviceCounts.mobile + deviceCounts.tablet || 1
    const deviceStats = [
      { name: 'คอมพิวเตอร์ (Desktop)', count: deviceCounts.desktop, percent: Math.round((deviceCounts.desktop / totalDeviceEvents) * 100) },
      { name: 'โทรศัพท์มือถือ (Mobile)', count: deviceCounts.mobile, percent: Math.round((deviceCounts.mobile / totalDeviceEvents) * 100) },
      { name: 'แท็บเล็ต (Tablet)', count: deviceCounts.tablet, percent: Math.round((deviceCounts.tablet / totalDeviceEvents) * 100) },
    ]

    // 6. CPU Simulation Analytics (Section 3.3 B)
    const simEvents = rawEvents.filter(e => e.event_type === 'simulation_run')
    const algoBreakdown: Record<string, number> = {
      FCFS: 0,
      SJF: 0,
      SRTF: 0,
      RR: 0,
      PRIORITY: 0,
      AICS: 0,
    }
    simEvents.forEach(e => {
      const algo = String(e.event_metadata?.algorithm || 'FCFS').toUpperCase()
      algoBreakdown[algo] = (algoBreakdown[algo] || 0) + 1
    })
    const simulationStats = {
      total: simEvents.length,
      algorithms: Object.entries(algoBreakdown).map(([algo, count]) => ({
        algorithm: algo,
        count,
        percent: simEvents.length ? Math.round((count / simEvents.length) * 100) : 0,
      })),
      fcfsCount: algoBreakdown.FCFS || 0,
      sjfCount: algoBreakdown.SJF || 0,
      rrCount: algoBreakdown.RR || 0,
      srtfCount: algoBreakdown.SRTF || 0,
      priorityCount: algoBreakdown.PRIORITY || 0,
      aicsCount: algoBreakdown.AICS || 0,
    }

    // 7. AI & AICS Analytics (Section 3.3 C)
    const aiRecEvents = rawEvents.filter(e => e.event_type === 'ai_recommend')
    const aiCompareEvents = rawEvents.filter(e => e.event_type === 'ai_compare')
    const aicsRuns = rawEvents.filter(e => e.event_type === 'aics_run' || (e.event_type === 'simulation_run' && e.event_metadata?.algorithm === 'AICS'))
    const aiSuccessEvents = rawEvents.filter(e =>
      (e.event_type === 'ai_recommend' || e.event_type === 'ai_compare') &&
      e.event_metadata?.status !== 'error'
    )
    const totalAiCalls = aiRecEvents.length + aiCompareEvents.length + aicsRuns.length
    const aiSuccessRate = totalAiCalls > 0
      ? Math.round((aiSuccessEvents.length / (aiRecEvents.length + aiCompareEvents.length || 1)) * 100)
      : 100

    const aiStats = {
      recommendationsCount: aiRecEvents.length,
      comparisonCount: aiCompareEvents.length,
      aicsRunsCount: aicsRuns.length,
      totalAiCalls,
      successRate: Math.min(100, aiSuccessRate),
    }

    // 8. Learning Analytics (Section 3.3 A)
    const lessonEvents = rawEvents.filter(e => e.event_type === 'lesson_view')
    const lessonTopicCounts: Record<string, number> = {}
    lessonEvents.forEach(e => {
      const topic = String(e.event_metadata?.topic || e.event_metadata?.title || 'คู่มือ 5 ขั้นตอน (5-Step Guide)')
      lessonTopicCounts[topic] = (lessonTopicCounts[topic] || 0) + 1
    })
    const learningStats = {
      totalLessonOpens: lessonEvents.length,
      topics: Object.entries(lessonTopicCounts).map(([topic, count]) => ({ topic, count })),
      guideOpens: rawEvents.filter(e => e.event_metadata?.action === 'guide_modal_open').length,
      onboardingTourCompletions: rawEvents.filter(e => e.event_metadata?.action === 'tour_completed').length,
    }

    // 9. Quiz Analytics (Section 3.3 D)
    const quizStartEvents = rawEvents.filter(e => e.event_type === 'quiz_start')
    const quizSubmitEvents = rawEvents.filter(e => e.event_type === 'quiz_submit')
    
    let totalScorePercentSum = 0
    let validScoresCount = 0
    const topicMistakeCounts: Record<string, { total: number; incorrect: number }> = {}

    quizSubmitEvents.forEach(e => {
      const score = Number(e.event_metadata?.score_percent)
      if (!isNaN(score)) {
        totalScorePercentSum += score
        validScoresCount += 1
      }

      const answers = e.event_metadata?.answers as Record<string, { topic: string; correct: boolean }> | undefined
      if (answers && typeof answers === 'object') {
        Object.values(answers).forEach(ans => {
          if (ans?.topic) {
            if (!topicMistakeCounts[ans.topic]) {
              topicMistakeCounts[ans.topic] = { total: 0, incorrect: 0 }
            }
            topicMistakeCounts[ans.topic].total += 1
            if (!ans.correct) {
              topicMistakeCounts[ans.topic].incorrect += 1
            }
          }
        })
      }
    })

    const averageScore = validScoresCount > 0 ? Math.round(totalScorePercentSum / validScoresCount) : 0
    const weakTopics = Object.entries(topicMistakeCounts).map(([topic, stats]) => ({
      topic,
      incorrectRate: stats.total > 0 ? Math.round((stats.incorrect / stats.total) * 100) : 0,
      totalAttempts: stats.total,
    })).sort((a, b) => b.incorrectRate - a.incorrectRate)

    const quizStats = {
      startCount: quizStartEvents.length,
      submitCount: quizSubmitEvents.length,
      averageScorePercent: averageScore,
      weakTopics,
    }

    return NextResponse.json({
      success: true,
      meta: {
        range,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        supabase_connected: supabaseConnected,
        visitor_definition: 'จำนวนผู้เข้าชมโดยประมาณคำนวณจาก Unique Session ID (ไม่ระบุตัวตน) ตามเกณฑ์ TOR Section 3.1',
        totalEventsRetrieved: rawEvents.length,
      },
      overview: {
        totalVisitors,
        todayVisitors,
        monthlyVisitors,
        totalPageViews,
        todayPageViews,
        activeVisitors,
        popularPages,
        deviceStats,
        trafficTrends,
        monthlyComparison,
      },
      simulation: simulationStats,
      ai: aiStats,
      learning: learningStats,
      quiz: quizStats,
    })
  } catch (error) {
    console.error('[Stats API] Error calculating statistics:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการประมวลผลสถิติ' },
      { status: 500 }
    )
  }
}
