import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Client } from '@/types/database'

// GET /api/clients — list all or filter by status
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')

  let query = supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/clients — create a new client (called by scraper)
export async function POST(req: NextRequest) {
  const body: Omit<Client, 'id' | 'created_at'> = await req.json()

  // Auto-generate subdomain from clinic name if not provided
  if (!body.subdomain) {
    body.subdomain = body.clinic_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 30)
  }

  const { data, error } = await supabaseAdmin.from('clients').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
