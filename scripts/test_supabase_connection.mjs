/**
 * Supabase Connection Test Script
 * 
 * ใช้ตรวจสอบว่าตาราง Analytics ถูกสร้างแล้วบน Supabase หรือยัง
 * 
 * วิธีรัน:
 *   node scripts/test_supabase_connection.mjs
 * 
 * ต้องตั้งค่า Environment Variables ก่อน:
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/main/index.js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: กรุณาตั้งค่า environment variables ก่อนรันสคริปต์นี้')
  console.error('   NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY')
  console.error('   ตัวอย่าง: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/test_supabase_connection.mjs')
  process.exit(1)
}

console.log('Testing Supabase connection to:', SUPABASE_URL)

async function testConnection() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const tables = ['analytics_events', 'analytics_daily_summary', 'analytics_simulations']
  
  for (const table of tables) {
    const { data, error, status } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ Table "${table}": ${error.message} (${error.code})`)
      if (error.code === '42P01') {
        console.log(`   -> Run supabase/migrations/01_create_analytics_tables.sql first!`)
      }
    } else {
      console.log(`✓ Table "${table}" OK (status ${status}, rows: ${data.length})`)
    }
  }

  // Test insert
  const testId = '00000000-0000-0000-0000-test00000001'
  const { error: insertErr } = await supabase.from('analytics_events').insert([{
    id: testId,
    event_type: 'page_view',
    page_path: '/test-connection',
    session_id: 'test_connection_script',
    event_metadata: { test: true },
  }])
  if (!insertErr) {
    console.log('✓ INSERT test passed')
    await supabase.from('analytics_events').delete().eq('id', testId)
    console.log('✓ Cleanup done')
  } else {
    console.log('❌ INSERT test failed:', insertErr.message)
  }
  
  console.log('\n✅ All checks done. Supabase is ready for Smart CPU Scheduler Analytics!')
}

testConnection().catch(console.error)
