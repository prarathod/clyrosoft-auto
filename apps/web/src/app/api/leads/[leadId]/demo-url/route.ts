import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { leadId: string } },
) {
  const { demo_url } = await req.json()
  if (!demo_url) return NextResponse.json({ error: 'demo_url required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ demo_url })
    .eq('id', params.leadId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
