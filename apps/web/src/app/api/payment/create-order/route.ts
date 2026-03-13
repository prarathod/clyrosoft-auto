import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { amount, plan } = await request.json()
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      notes: { plan },
    })
    return NextResponse.json({ orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (err: any) {
    console.error('Razorpay create-order error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to create order' }, { status: 500 })
  }
}
