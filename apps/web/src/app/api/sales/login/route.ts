import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (
    email === process.env.SALES_EMAIL &&
    password === process.env.SALES_PASSWORD
  ) {
    cookies().set('sales_token', process.env.SALES_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
