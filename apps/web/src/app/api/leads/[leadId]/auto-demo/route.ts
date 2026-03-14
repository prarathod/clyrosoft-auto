import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://demo.cliniqo.online'

// Theme map by profession_type keyword
function pickTheme(profession: string): string {
  const p = profession.toLowerCase()
  if (p.includes('skin') || p.includes('derma') || p.includes('plastic') || p.includes('hair')) return 'modern'
  if (p.includes('eye') || p.includes('ortho') || p.includes('spine') || p.includes('cardio') || p.includes('neuro') || p.includes('oncol')) return 'elegant'
  if (p.includes('physio') || p.includes('yoga') || p.includes('ayur') || p.includes('naturo') || p.includes('weight') || p.includes('sports')) return 'vitality'
  if (p.includes('child') || p.includes('pediatr') || p.includes('maternity') || p.includes('gynec') || p.includes('fertility') || p.includes('speech') || p.includes('occupat')) return 'warm'
  if (p.includes('general surgery') || p.includes('pain') || p.includes('diagnostic') || p.includes('pathol') || p.includes('radiol')) return 'minimal'
  return 'classic'
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { leadId: string } },
) {
  // 1. Fetch lead
  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', params.leadId)
    .single()

  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // 2. If demo already exists, return it
  if (lead.demo_url) {
    return NextResponse.json({ demo_url: lead.demo_url })
  }

  // 3. Generate subdomain (ensure unique)
  const baseSlug = toSlug(lead.clinic_name)
  let subdomain = baseSlug
  const { data: existing } = await supabaseAdmin
    .from('clients')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle()
  if (existing) subdomain = `${baseSlug}-${Date.now().toString(36)}`

  // 4. Create client record
  const profession = lead.profession_type || lead.category || 'general physician'
  const theme = pickTheme(profession)

  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .insert({
      clinic_name:   lead.clinic_name,
      doctor_name:   lead.doctor_name,
      phone:         lead.phone,
      email:         lead.email ?? null,
      city:          lead.city,
      area:          lead.area ?? null,
      subdomain,
      profession_type: profession,
      theme,
      status:        'demo',
      monthly_amount: 499,
      photos:        lead.photos ?? null,
      tagline:       lead.tagline ?? null,
      doctor_bio:    lead.doctor_bio ?? null,
      services:      lead.services ?? null,
      full_address:  lead.full_address ?? null,
      opening_hours: lead.opening_hours ?? null,
      google_maps_link: lead.google_maps_url ?? null,
    })
    .select()
    .single()

  if (clientErr || !client) {
    return NextResponse.json({ error: clientErr?.message || 'Failed to create demo' }, { status: 500 })
  }

  // 5. Save demo_url back to lead
  const demo_url = `${TEMPLATE_URL}/${subdomain}`
  await supabaseAdmin
    .from('leads')
    .update({ demo_url })
    .eq('id', params.leadId)

  return NextResponse.json({ demo_url })
}
