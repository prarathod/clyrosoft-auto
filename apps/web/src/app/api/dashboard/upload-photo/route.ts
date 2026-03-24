import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  // Auth
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Get clinic subdomain (used as folder name)
  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  // Parse multipart
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: 'Only JPG, PNG, WebP and GIF allowed' }, { status: 400 })

  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

  const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${clinic.subdomain}/${Date.now()}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('clinic-photos')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('clinic-photos')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
