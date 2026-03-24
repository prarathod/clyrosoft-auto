import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import dns from 'dns/promises'

const EXPECTED_CNAME = 'demo.cliniqo.online'

// GET /api/dashboard/verify-domain?domain=drsharma.com
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 })

  // Auth
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    // Check CNAME for root (@) and www
    let verified = false
    for (const host of [domain, `www.${domain}`]) {
      try {
        const cname = await dns.resolveCname(host)
        if (cname.some((c) => c.replace(/\.$/, '') === EXPECTED_CNAME)) {
          verified = true
          break
        }
      } catch {
        // DNS lookup failed for this host — try next
      }
    }

    if (verified) {
      // Mark as active in DB
      await supabaseAdmin
        .from('clients')
        .update({ custom_domain_status: 'active' })
        .eq('email', session.user.email!)
    }

    return NextResponse.json({ verified })
  } catch (err: any) {
    console.error('DNS verify error:', err)
    return NextResponse.json({ verified: false })
  }
}
