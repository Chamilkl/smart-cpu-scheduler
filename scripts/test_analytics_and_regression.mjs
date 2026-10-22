import http from 'http'

const BASE_URL = 'http://localhost:3005'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, options)
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const body = isJson ? await res.json() : await res.text()
  return { status: res.status, headers: res.headers, body }
}

async function runTests() {
  console.log('🚀 Starting Smart CPU Scheduler – Admin Analytics Verification & Regression Suite\n')
  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  try {
    // 1. Pages Load Testing
    console.log('1. Testing Frontend Route Availability...')
    const home = await request('/')
    assert(home.status === 200, 'Home page (/) loads with status 200')

    const sim = await request('/simulator')
    assert(sim.status === 200, 'Simulator page (/simulator) loads with status 200')

    const comp = await request('/compare')
    assert(comp.status === 200, 'Compare page (/compare) loads with status 200')

    const help = await request('/help')
    assert(help.status === 200, 'Help & Learning page (/help) loads with status 200')

    const admin = await request('/admin')
    assert(admin.status === 200, 'Admin page (/admin) loads with status 200')

    // 2. Tracking API Testing
    console.log('\n2. Testing Analytics Tracking API (/api/analytics/track)...')
    const sessionId = 'test_sess_' + Date.now()

    const pv1 = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page_path: '/simulator',
        session_id: sessionId,
        event_metadata: { device: 'desktop' },
      }),
    })
    assert(pv1.status === 200 && pv1.body.success, 'Page view tracked successfully')

    // Deduplication test
    const pvDup = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page_path: '/simulator',
        session_id: sessionId,
      }),
    })
    assert(pvDup.body.deduplicated === true, 'Rapid duplicate page view correctly de-duplicated')

    // Simulation events
    const simFcfs = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'simulation_run',
        page_path: '/simulator',
        session_id: sessionId,
        event_metadata: { algorithm: 'FCFS', process_count: 5, execution_time_ms: 12 },
      }),
    })
    assert(simFcfs.status === 200 && simFcfs.body.success, 'FCFS simulation run tracked')

    const simAics = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'simulation_run',
        page_path: '/simulator',
        session_id: sessionId,
        event_metadata: { algorithm: 'AICS', process_count: 5, execution_time_ms: 18 },
      }),
    })
    assert(simAics.status === 200 && simAics.body.success, 'AICS simulation run tracked')

    // AI & Compare events
    const aiRec = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'ai_recommend',
        page_path: '/simulator',
        session_id: sessionId,
        event_metadata: { recommended_algorithm: 'SJF', status: 'success' },
      }),
    })
    assert(aiRec.status === 200 && aiRec.body.success, 'AI recommendation tracked')

    const aiComp = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'ai_compare',
        page_path: '/compare',
        session_id: sessionId,
        event_metadata: { algorithms: ['FCFS', 'SJF', 'RR'], status: 'success' },
      }),
    })
    assert(aiComp.status === 200 && aiComp.body.success, 'Algorithm comparison tracked')

    // Learning & Quiz events
    const lesson = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'lesson_view',
        page_path: '/help',
        session_id: sessionId,
        event_metadata: { topic: 'ขั้นตอนที่ 1: เลือกอัลกอริทึมการจัดตาราง' },
      }),
    })
    assert(lesson.status === 200 && lesson.body.success, 'Educational lesson view tracked')

    const quizSubmit = await request('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'quiz_submit',
        page_path: '/help',
        session_id: sessionId,
        event_metadata: {
          total_questions: 5,
          correct_count: 4,
          score_percent: 80,
          answers: {
            q1: { topic: 'FCFS & Convoy Effect', correct: true },
            q2: { topic: 'Preemption (การแย่ง CPU)', correct: true },
            q3: { topic: 'SJF Optimization', correct: false },
          },
        },
      }),
    })
    assert(quizSubmit.status === 200 && quizSubmit.body.success, 'Quiz submission tracked with scores')

    // 3. Security & Admin Authentication Testing
    console.log('\n3. Testing Admin Security & Auth Gate (/api/admin/auth & /api/analytics/stats)...')
    const unauthStats = await request('/api/analytics/stats')
    assert(unauthStats.status === 401, 'Unauthorized request to /api/analytics/stats correctly rejected (401)')

    const wrongLogin = await request('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password-xyz' }),
    })
    assert(wrongLogin.status === 401, 'Wrong admin password correctly rejected (401)')

    const rightLogin = await request('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'admin_cpu_scheduler_2026' }),
    })
    assert(rightLogin.status === 200 && rightLogin.body.token, 'Correct admin password verified, session token issued')

    const adminToken = rightLogin.body.token
    const cookieHeader = rightLogin.headers.get('set-cookie') || `smartcpu_admin_session=${adminToken}`

    // 4. Admin Analytics Stats Testing
    console.log('\n4. Testing Admin Analytics Aggregated Stats Retrieval...')
    const authStats = await request('/api/analytics/stats?range=30d', {
      headers: {
        'Cookie': cookieHeader,
      },
    })
    assert(authStats.status === 200 && authStats.body.success, 'Authorized stats request returned 200 OK')
    const s = authStats.body
    assert(s.overview.totalVisitors >= 1, `Total estimated visitors recorded: ${s.overview.totalVisitors}`)
    assert(s.overview.totalPageViews >= 1, `Total page views recorded: ${s.overview.totalPageViews}`)
    assert(s.simulation.total >= 2, `Total simulations recorded: ${s.simulation.total}`)
    assert(s.simulation.fcfsCount >= 1, `FCFS simulation count: ${s.simulation.fcfsCount}`)
    assert(s.simulation.aicsCount >= 1, `AICS simulation count: ${s.simulation.aicsCount}`)
    assert(s.ai.totalAiCalls >= 2, `AI & AICS interactions recorded: ${s.ai.totalAiCalls}`)
    assert(s.quiz.submitCount >= 1, `Quiz submissions recorded: ${s.quiz.submitCount}`)
    assert(s.quiz.averageScorePercent === 80, `Quiz anonymous average score: ${s.quiz.averageScorePercent}%`)
    assert(s.learning.totalLessonOpens >= 1, `Learning lesson opens: ${s.learning.totalLessonOpens}`)

    console.log(`\n========================================`)
    console.log(`Total tests run: ${passed + failed}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`========================================\n`)

    if (failed > 0) process.exit(1)
  } catch (err) {
    console.error('Test runner fatal error:', err)
    process.exit(1)
  }
}

runTests()
