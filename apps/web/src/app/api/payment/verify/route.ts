import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subdomain,
      plan,
      amount,
    } = await request.json()

    // Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Mark client as paying
    const supabase = getAdminSupabase()
    const { error } = await supabase
      .from('clients')
      .update({
        status: 'paying',
        monthly_amount: amount,
        payment_date: new Date().toISOString(),
      })
      .eq('subdomain', subdomain)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Payment verify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
