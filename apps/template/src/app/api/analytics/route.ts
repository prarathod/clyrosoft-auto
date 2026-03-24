import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const ALLOWED_EVENTS = new Set(['page_view', 'whatsapp_click', 'form_submit'])

export async function POST(req: NextRequest) {
  try {
    const { subdomain, event_type, page, referrer } = await req.json()

    if (!subdomain || !event_type || !ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Skip demo/mock subdomains
    if (subdomain.startsWith('demo')) {
      return NextResponse.json({ ok: true })
    }

    await supabase.from('analytics').insert({
      subdomain,
      event_type,
      page:     page     ?? null,
      referrer: referrer ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // never fail silently on client
  }
}
