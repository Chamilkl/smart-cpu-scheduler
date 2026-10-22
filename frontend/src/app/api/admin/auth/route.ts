import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, generateSessionToken, checkAdminAuth } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง (Invalid password)' },
        { status: 401 }
      )
    }

    const token = generateSessionToken()
    const response = NextResponse.json({
      success: true,
      message: 'ยืนยันตัวตนสำเร็จ (Authenticated)',
      token,
    })

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'smartcpu_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const isAuthenticated = checkAdminAuth(req)
  return NextResponse.json({
    authenticated: isAuthenticated,
  })
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ (Logged out)',
  })
  response.cookies.delete('smartcpu_admin_session')
  return response
}
