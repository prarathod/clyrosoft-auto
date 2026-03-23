import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  const token = cookies().get('sales_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [email, name] = token.split('|')
  const { lead_id, activity_type, note } = await request.json()

  if (!lead_id || !activity_type) {
    return NextResponse.json({ error: 'lead_id and activity_type required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('lead_activities').insert({
    lead_id,
    employee_email: email,
    employee_name: name ?? email,
    activity_type,
    note: note ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also mark lead as contacted if call or whatsapp
  if (activity_type === 'call' || activity_type === 'whatsapp') {
    await supabaseAdmin.from('leads').update({ contacted: true }).eq('id', lead_id)
  }

  return NextResponse.json({ ok: true })
}
