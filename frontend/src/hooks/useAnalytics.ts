'use client'
import { useCallback } from 'react'

const SESSION_KEY = 'smartcpu_analytics_session_id'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session'
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36)
      window.sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return 'sess_fallback_' + Math.random().toString(36).substring(2, 10)
  }
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

export function useAnalytics() {
  const sendEvent = useCallback((eventType: string, metadata: Record<string, unknown> = {}, path?: string) => {
    if (typeof window === 'undefined') return

    const sessionId = getOrCreateSessionId()
    const pagePath = path || window.location.pathname || '/'
    const payload = {
      event_type: eventType,
      page_path: pagePath,
      session_id: sessionId,
      event_metadata: {
        ...metadata,
        device: getDeviceType(),
        screen_width: window.innerWidth,
        timestamp: Date.now(),
      },
    }

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', blob)
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // Analytics failure must never disrupt UI
    }
  }, [])

  const trackPageView = useCallback((path?: string) => {
    sendEvent('page_view', {}, path)
  }, [sendEvent])

  const trackSimulation = useCallback((
    algorithm: string,
    processCount: number,
    executionTimeMs: number = 0,
    meta: Record<string, unknown> = {}
  ) => {
    sendEvent('simulation_run', {
      algorithm,
      process_count: processCount,
      execution_time_ms: executionTimeMs,
      ...meta,
    })
  }, [sendEvent])

  const trackAI = useCallback((
    action: 'recommend' | 'compare' | 'aics',
    meta: Record<string, unknown> = {}
  ) => {
    const eventType = action === 'recommend'
      ? 'ai_recommend'
      : action === 'compare'
        ? 'ai_compare'
        : 'aics_run'
    sendEvent(eventType, meta)
  }, [sendEvent])

  const trackLesson = useCallback((
    topic: string,
    meta: Record<string, unknown> = {}
  ) => {
    sendEvent('lesson_view', { topic, ...meta })
  }, [sendEvent])

  const trackQuiz = useCallback((
    action: 'start' | 'submit',
    meta: Record<string, unknown> = {}
  ) => {
    sendEvent(action === 'start' ? 'quiz_start' : 'quiz_submit', meta)
  }, [sendEvent])

  return {
    trackPageView,
    trackSimulation,
    trackAI,
    trackLesson,
    trackQuiz,
    sendEvent,
  }
}
