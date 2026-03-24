import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import crypto from 'crypto'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function cloudinarySign(params: Record<string, string>, secret: string) {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha256').update(str + secret).digest('hex')
}

export async function POST(req: NextRequest) {
  // Auth
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret)
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })

  // Parse multipart
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: 'Only JPG, PNG, WebP and GIF allowed' }, { status: 400 })

  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

  // Get clinic subdomain (used as folder name)
  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  // Build signed upload params
  const timestamp = String(Math.floor(Date.now() / 1000))
  const folder    = `cliniqo/${clinic.subdomain}`
  const params    = { folder, timestamp }
  const signature = cloudinarySign(params, apiSecret)

  // Upload to Cloudinary
  const body = new FormData()
  body.append('file', file)
  body.append('api_key', apiKey)
  body.append('timestamp', timestamp)
  body.append('folder', folder)
  body.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Cloudinary upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ url: data.secure_url })
}
