import { NextRequest } from 'next/server'
import crypto from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_cpu_scheduler_2026'
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'smart-cpu-default-session-salt-2026'

export function verifyAdminPassword(input: string): boolean {
  if (!input) return false
  return input.trim() === ADMIN_PASSWORD.trim()
}

export function generateSessionToken(): string {
  const timestamp = Date.now().toString()
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET)
  hmac.update(`${timestamp}:${ADMIN_PASSWORD}`)
  const signature = hmac.digest('hex')
  return `${timestamp}.${signature}`
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [timestampStr, providedSignature] = parts
  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) return false

  // Session valid for 24 hours
  const maxAge = 24 * 60 * 60 * 1000
  if (Date.now() - timestamp > maxAge) return false

  const hmac = crypto.createHmac('sha256', ADMIN_SECRET)
  hmac.update(`${timestampStr}:${ADMIN_PASSWORD}`)
  const expectedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  )
}

export function checkAdminAuth(req: NextRequest | Request): boolean {
  // 1. Check HTTP-only cookie
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, decodeURIComponent(v.join('='))]
    })
  )
  const sessionToken = cookies['smartcpu_admin_session']
  if (verifySessionToken(sessionToken)) return true

  // 2. Check Authorization Bearer or X-Admin-Key
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    if (verifySessionToken(token) || verifyAdminPassword(token)) return true
  }

  const customKey = req.headers.get('x-admin-key')
  if (customKey && (verifyAdminPassword(customKey) || verifySessionToken(customKey))) {
    return true
  }

  return false
}
