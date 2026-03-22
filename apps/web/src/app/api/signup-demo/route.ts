import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://demo.cliniqo.online'

function pickTheme(clinicName: string): string {
  const n = clinicName.toLowerCase()
  if (n.includes('dental') || n.includes('physio') || n.includes('ayur') ||
      n.includes('homeo') || n.includes('diabetes') || n.includes('nutrition')) return 'vitality'
  if (n.includes('eye') || n.includes('ophthal') || n.includes('ortho') ||
      n.includes('cardio') || n.includes('neuro') || n.includes('spine')) return 'elegant'
  if (n.includes('skin') || n.includes('derma') || n.includes('plastic') ||
      n.includes('cosmet') || n.includes('hair')) return 'modern'
  if (n.includes('child') || n.includes('pediatr') || n.includes('gynec') ||
      n.includes('maternity') || n.includes('fertility') || n.includes('mental')) return 'warm'
  if (n.includes('ent') || n.includes('pain') || n.includes('diagnostic')) return 'minimal'
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

export async function POST(req: NextRequest) {
  const { clinic_name, doctor_name, phone, city, email, password } = await req.json()

  if (!clinic_name || !doctor_name || !phone || !city || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // 1. Check if email already exists in clients
  const { data: existingClient } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingClient) {
    return NextResponse.json({ error: 'An account with this email already exists. Please login.' }, { status: 409 })
  }

  // 2. Generate unique subdomain
  const baseSlug = toSlug(clinic_name)
  let subdomain = baseSlug
  const { data: existing } = await supabaseAdmin
    .from('clients')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle()
  if (existing) subdomain = `${baseSlug}-${Date.now().toString(36)}`

  // 3. Create Supabase auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification so they can login immediately
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create account' }, { status: 500 })
  }

  // 4. Create client record
  const theme = pickTheme(clinic_name)
  const { error: clientErr } = await supabaseAdmin
    .from('clients')
    .insert({
      clinic_name,
      doctor_name,
      phone,
      email,
      city,
      subdomain,
      theme,
      status: 'demo',
      monthly_amount: 499,
      profession_type: 'general physician',
      area: city,
    })

  if (clientErr) {
    // Rollback: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: clientErr.message || 'Failed to create clinic' }, { status: 500 })
  }

  // 5. Also save as lead (for admin tracking)
  await supabaseAdmin.from('leads').insert({
    clinic_name,
    doctor_name,
    phone,
    email,
    city,
    demo_url: `${TEMPLATE_URL}/${subdomain}`,
  })

  return NextResponse.json({ success: true, subdomain, demo_url: `${TEMPLATE_URL}/${subdomain}` })
}
