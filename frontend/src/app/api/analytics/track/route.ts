import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { inMemoryEvents, rateLimits, TrackedEvent } from '@/lib/analyticsStore'

// Allowed events for validation
const ALLOWED_EVENTS = new Set([
  'page_view',
  'simulation_run',
  'ai_recommend',
  'ai_compare',
  'aics_run',
  'lesson_view',
  'quiz_start',
  'quiz_submit',
])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, page_path, session_id, event_metadata } = body

    // 1. Validation
    if (!event_type || !ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ success: false, error: 'Invalid event_type' }, { status: 400 })
    }

    if (!session_id || typeof session_id !== 'string' || session_id.length < 5 || session_id.length > 64) {
      return NextResponse.json({ success: false, error: 'Invalid session_id' }, { status: 400 })
    }

    const safePath = (typeof page_path === 'string' && page_path.startsWith('/')) ? page_path.slice(0, 255) : '/'
    const safeMetadata = (event_metadata && typeof event_metadata === 'object') ? event_metadata : {}

    // Clean any potential sensitive fields from metadata
    delete safeMetadata.password
    delete safeMetadata.email
    delete safeMetadata.token
    delete safeMetadata.ip

    // 2. Rate Limiting & De-duplication (TOR Section 7)
    const now = Date.now()
    const sessionRate = rateLimits.get(session_id) || { count: 0, start: now }

    if (now - sessionRate.start > 60000) {
      sessionRate.count = 0
      sessionRate.start = now
    }

    sessionRate.count += 1
    if (sessionRate.count > 60) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    // De-duplicate rapid duplicate page_views (within 5 seconds on same path)
    if (event_type === 'page_view') {
      if (sessionRate.lastPage === safePath && sessionRate.lastPageTime && now - sessionRate.lastPageTime < 5000) {
        return NextResponse.json({ success: true, deduplicated: true })
      }
      sessionRate.lastPage = safePath
      sessionRate.lastPageTime = now
    }

    rateLimits.set(session_id, sessionRate)

    const eventRecord: TrackedEvent = {
      id: crypto.randomUUID(),
      event_type,
      page_path: safePath,
      session_id,
      event_metadata: safeMetadata,
      created_at: new Date().toISOString(),
    }

    // 3. Store to Supabase PostgreSQL if configured
    const supabase = getSupabaseServer()
    let savedToSupabase = false

    if (supabase) {
      try {
        const { error: eventError } = await supabase.from('analytics_events').insert([
          {
            id: eventRecord.id,
            event_type: eventRecord.event_type,
            page_path: eventRecord.page_path,
            session_id: eventRecord.session_id,
            event_metadata: eventRecord.event_metadata,
            created_at: eventRecord.created_at,
          },
        ])

        if (!eventError) {
          savedToSupabase = true

          // If this is a simulation event, also log into analytics_simulations
          if (event_type === 'simulation_run') {
            const algoName = String(safeMetadata.algorithm || 'UNKNOWN').slice(0, 30)
            const simType = String(safeMetadata.simulation_type || 'single').slice(0, 30)
            const procCount = Number(safeMetadata.process_count) || 0
            const execTime = Number(safeMetadata.execution_time_ms) || 0

            await supabase.from('analytics_simulations').insert([
              {
                id: crypto.randomUUID(),
                algorithm_name: algoName,
                simulation_type: simType,
                status: 'success',
                session_id,
                process_count: procCount,
                execution_time_ms: execTime,
                metadata: safeMetadata,
                created_at: eventRecord.created_at,
              },
            ])
          }
        } else {
          console.error('[Analytics] Supabase insert error:', eventError.message)
        }
      } catch (err) {
        console.error('[Analytics] Supabase connection error:', err)
      }
    }

    // Keep in-memory buffer updated
    inMemoryEvents.push(eventRecord)
    if (inMemoryEvents.length > 2000) {
      inMemoryEvents.shift()
    }

    return NextResponse.json({
      success: true,
      persisted_to_db: savedToSupabase,
    })
  } catch (error) {
    console.error('[Analytics Track] Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
