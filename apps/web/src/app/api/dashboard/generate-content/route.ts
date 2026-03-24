import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  // Auth — must be a logged-in clinic user
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  // Fetch clinic data
  const { data: clinic } = await supabase
    .from('clients')
    .select('clinic_name, doctor_name, city, profession_type')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  try {
    const client  = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Generate professional website content for an Indian clinic:

Clinic: ${clinic.clinic_name}
Doctor: Dr. ${clinic.doctor_name}
City: ${clinic.city}
Speciality: ${clinic.profession_type}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "tagline": "A compelling tagline max 8 words",
  "doctor_bio": "A 2-sentence professional bio for Dr. ${clinic.doctor_name} focusing on expertise and patient care.",
  "services": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Service 6"],
  "testimonials": [
    {"name": "Indian Patient Name", "treatment": "Treatment name", "text": "Genuine 1-2 sentence review."},
    {"name": "Indian Patient Name", "treatment": "Treatment name", "text": "Genuine 1-2 sentence review."},
    {"name": "Indian Patient Name", "treatment": "Treatment name", "text": "Genuine 1-2 sentence review."}
  ]
}`,
      }],
    })

    const raw     = (message.content[0] as { text: string }).text.trim()
    const content = JSON.parse(raw)
    return NextResponse.json({ ok: true, content })
  } catch (err: any) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
