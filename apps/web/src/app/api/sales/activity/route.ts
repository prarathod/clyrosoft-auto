import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  // Verify sales token
  const token = req.cookies.get('sales_token')?.value
  if (!token || token !== process.env.SALES_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lead_id, action, note } = await req.json()
  if (!lead_id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const employeeEmail = process.env.SALES_EMAIL!

  // Log the activity
  const { error } = await supabaseAdmin.from('lead_activities').insert({
    lead_id,
    employee_email: employeeEmail,
    action,
    note: note ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update the lead's last_called_at / last_wa_at timestamp
  const updatePayload: Record<string, unknown> = { contacted: true }
  if (action === 'called') updatePayload.last_called_at = new Date().toISOString()
  if (action === 'wa_sent') updatePayload.last_wa_at = new Date().toISOString()

  await supabaseAdmin.from('leads').update(updatePayload).eq('id', lead_id)

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  // Verify sales token OR admin token
  const salesToken = req.cookies.get('sales_token')?.value
  const adminToken = req.cookies.get('admin_token')?.value
  const isAuth =
    (salesToken && salesToken === process.env.SALES_SECRET) ||
    (adminToken && adminToken === process.env.ADMIN_SECRET)

  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD, defaults to today

  const startOf = date ? `${date}T00:00:00.000Z` : new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const endOf   = date ? `${date}T23:59:59.999Z` : new Date(new Date().setHours(23, 59, 59, 999)).toISOString()

  const { data: activities } = await supabaseAdmin
    .from('lead_activities')
    .select('*, leads(clinic_name, doctor_name, phone, city)')
    .eq('employee_email', process.env.SALES_EMAIL!)
    .gte('created_at', startOf)
    .lte('created_at', endOf)
    .order('created_at', { ascending: false })

  return NextResponse.json({ activities: activities ?? [] })
}
