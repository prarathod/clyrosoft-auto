import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendWelcomeEmail } from '@/lib/email'

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

interface AIContent {
  tagline: string
  doctor_bio: string
  services: string[]
  testimonials: Array<{ name: string; treatment: string; text: string }>
}

async function generateClinicContent(
  clinic_name: string,
  doctor_name: string,
  city: string,
): Promise<AIContent | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are helping set up a clinic website in India. Generate professional content for:
Clinic: ${clinic_name}
Doctor: Dr. ${doctor_name}
City: ${city}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "tagline": "A short inspiring tagline (max 8 words)",
  "doctor_bio": "A 2-sentence professional bio for Dr. ${doctor_name} mentioning their expertise and dedication to patients.",
  "services": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Service 6"],
  "testimonials": [
    {"name": "Patient Name", "treatment": "Treatment type", "text": "Short positive review (1-2 sentences)"},
    {"name": "Patient Name", "treatment": "Treatment type", "text": "Short positive review (1-2 sentences)"},
    {"name": "Patient Name", "treatment": "Treatment type", "text": "Short positive review (1-2 sentences)"}
  ]
}`,
        },
      ],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    return JSON.parse(raw) as AIContent
  } catch {
    return null
  }
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

  // 3. Generate AI content (runs in parallel with auth user creation)
  const [authResult, aiContent] = await Promise.all([
    supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    }),
    generateClinicContent(clinic_name, doctor_name, city),
  ])

  const { data: authData, error: authError } = authResult
  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create account' }, { status: 500 })
  }

  // 4. Create client record with AI-generated content
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
      // AI-generated content (null-safe — falls back to template defaults if AI fails)
      tagline:     aiContent?.tagline     ?? null,
      doctor_bio:  aiContent?.doctor_bio  ?? null,
      services:    aiContent?.services    ?? null,
      testimonials: aiContent?.testimonials ?? null,
    })

  if (clientErr) {
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
    login_password: password,
  })

  // 6. Send welcome email with login credentials
  const emailResult = await sendWelcomeEmail({ to: email, doctor_name, clinic_name, email, password })

  return NextResponse.json({
    success: true,
    subdomain,
    demo_url: `${TEMPLATE_URL}/${subdomain}`,
    email_sent: emailResult?.success ?? false,
    email_error: emailResult?.error ?? null,
  })
}
