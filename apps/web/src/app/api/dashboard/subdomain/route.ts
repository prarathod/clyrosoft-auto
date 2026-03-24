import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

// GET /api/dashboard/subdomain?slug=new-slug  → { available: boolean }
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const clean = toSlug(slug)
  if (clean.length < 3) return NextResponse.json({ available: false, reason: 'Too short (min 3 chars)' })

  const { data } = await supabaseAdmin
    .from('clients')
    .select('subdomain')
    .eq('subdomain', clean)
    .maybeSingle()

  return NextResponse.json({ available: !data, slug: clean })
}

// PUT /api/dashboard/subdomain  { subdomain: string } → updates current user's subdomain
export async function PUT(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { subdomain } = await req.json()
  const clean = toSlug(subdomain ?? '')
  if (clean.length < 3) return NextResponse.json({ error: 'Subdomain too short' }, { status: 400 })

  // Double-check availability
  const { data: existing } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('subdomain', clean)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 })

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ subdomain: clean })
    .eq('email', session.user.email!)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, subdomain: clean })
}
