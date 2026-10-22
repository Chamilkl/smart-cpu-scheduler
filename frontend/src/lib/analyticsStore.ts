export interface TrackedEvent {
  id: string
  event_type: string
  page_path: string
  session_id: string
  event_metadata: Record<string, unknown>
  created_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __ANALYTICS_MEMORY_BUFFER__: TrackedEvent[] | undefined
  // eslint-disable-next-line no-var
  var __ANALYTICS_RATE_LIMITS__: Map<string, { count: number; start: number; lastPage?: string; lastPageTime?: number }> | undefined
}

if (!global.__ANALYTICS_MEMORY_BUFFER__) {
  global.__ANALYTICS_MEMORY_BUFFER__ = []
}
if (!global.__ANALYTICS_RATE_LIMITS__) {
  global.__ANALYTICS_RATE_LIMITS__ = new Map()
}

export const inMemoryEvents = global.__ANALYTICS_MEMORY_BUFFER__
export const rateLimits = global.__ANALYTICS_RATE_LIMITS__
