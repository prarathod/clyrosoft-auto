import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  const { lead_status } = await request.json()
  const { error } = await supabaseAdmin
    .from('leads')
    .update({ lead_status })
    .eq('id', params.leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
