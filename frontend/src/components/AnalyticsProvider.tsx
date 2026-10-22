'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { trackPageView } = useAnalytics()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname
      trackPageView(pathname)
    }
  }, [pathname, trackPageView])

  return <>{children}</>
}
