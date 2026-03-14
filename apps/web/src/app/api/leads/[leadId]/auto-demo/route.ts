import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://demo.cliniqo.online'

// Mirrors the theme assignments in apps/template/src/lib/getClinicData.ts PROFESSION_MAP
function pickTheme(profession: string): string {
  const p = profession.toLowerCase()
  // vitality
  if (p.includes('dental') || p.includes('physio') || p.includes('ayur') ||
      p.includes('naturo') || p.includes('homeo') || p.includes('pulmo') ||
      p.includes('diabetes') || p.includes('sports') || p.includes('weight') ||
      p.includes('nutrition') || p.includes('unani')) return 'vitality'
  // elegant
  if (p.includes('eye') || p.includes('ophthal') || p.includes('ortho') ||
      p.includes('spine') || p.includes('cardio') || p.includes('neuro') ||
      p.includes('oncol') || p.includes('nephro') || p.includes('rheuma') ||
      p.includes('radiol') || p.includes('acupunct')) return 'elegant'
  // modern
  if (p.includes('skin') || p.includes('derma') || p.includes('plastic') ||
      p.includes('hair transplant') || p.includes('cosmet')) return 'modern'
  // warm
  if (p.includes('child') || p.includes('pediatr') || p.includes('gynec') ||
      p.includes('maternity') || p.includes('fertility') || p.includes('ivf') ||
      p.includes('neonatal') || p.includes('speech') || p.includes('occupat') ||
      p.includes('psychiatr') || p.includes('mental') || p.includes('veterin')) return 'warm'
  // minimal
  if (p.includes('ent') || p.includes('general surgery') || p.includes('pain') ||
      p.includes('diagnostic') || p.includes('pathol')) return 'minimal'
  // classic (general physician, gastro, endo, urology, etc.)
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
