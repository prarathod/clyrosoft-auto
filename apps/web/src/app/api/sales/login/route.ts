import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const hash = createHash('sha256').update(password).digest('hex')

  const { data: employee } = await supabaseAdmin
    .from('sales_employees')
    .select('id, name, email, password_hash, is_active')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!employee || !employee.is_active || employee.password_hash !== hash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Cookie stores "email|name" so pages know who is logged in without a DB call
  const tokenValue = `${employee.email}|${employee.name}`

  cookies().set('sales_token', tokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true, name: employee.name })
}
