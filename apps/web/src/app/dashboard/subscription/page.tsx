'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Script from 'next/script'

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: 499,
    display: '₹499',
    per: '/month',
    badge: null,
    savings: null,
    amountPaise: 49900,
  },
  {
    key: '6months',
    label: '6 Months',
    price: 2499,
    display: '₹2,499',
    per: '/ 6 months',
    badge: 'Popular',
    savings: 'Save ₹495  (₹416/mo)',
    amountPaise: 249900,
  },
  {
    key: 'yearly',
    label: '1 Year',
    price: 4499,
    display: '₹4,499',
    per: '/year',
    badge: 'Best Value',
    savings: 'Save ₹989  (₹375/mo)',
    amountPaise: 449900,
  },
]

declare global {
  interface Window { Razorpay: any }
}

export default function SubscriptionPage() {
  const [clinic, setClinic] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('clients')
        .select('clinic_name, status, monthly_amount, payment_date, subdomain, email')
        .eq('email', session.user.email!)
        .single()
        .then(({ data }) => { if (data) setClinic(data) })
    })
  }, [])

  async function handlePay() {
    if (!clinic) return
    const plan = PLANS.find((p) => p.key === selectedPlan)!
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amountPaise, plan: plan.key }),
      })
      const { orderId, keyId, error } = await res.json()
      if (error) throw new Error(error)

      const rzp = new window.Razorpay({
        key: keyId,
        amount: plan.amountPaise,
        currency: 'INR',
        name: 'Cliniqo',
        description: `${plan.label} Plan — ${clinic.clinic_name}`,
        order_id: orderId,
        prefill: { email: clinic.email },
        theme: { color: '#2563EB' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subdomain: clinic.subdomain,
              plan: plan.key,
              amount: plan.price,
            }),
          })
          const result = await verifyRes.json()
          if (result.ok) {
            setSuccess(true)
            setClinic((c: any) => ({ ...c, status: 'paying' }))
          }
          setLoading(false)
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  if (!clinic) return <div className="text-sm text-gray-400 p-6">Loading…</div>

  const isLive = clinic.status === 'paying'

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription</h2>
          <p className="text-sm text-gray-500">Choose a plan to go live and remove the demo banner.</p>
        </div>

        {(isLive || success) && (
          <div className="rounded-2xl p-5 border-2 border-green-300 bg-green-50 flex items-center gap-4">
            <span className="text-2xl">{success ? '🎉' : '✅'}</span>
            <div>
              <p className="font-bold text-green-800">{success ? 'Payment successful! Your site is now LIVE.' : 'Your site is LIVE'}</p>
              <p className="text-sm text-green-700 mt-0.5">
                {success
                  ? 'The demo banner has been removed from your site.'
                  : `Plan active · ₹${clinic.monthly_amount}/month${clinic.payment_date ? ` · Last paid ${new Date(clinic.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`}
              </p>
            </div>
          </div>
        )}

        {!isLive && (
          <>
            <div className="space-y-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                    selectedPlan === plan.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-2.5 right-4 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      plan.badge === 'Best Value' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPlan === plan.key ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedPlan === plan.key && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{plan.label}</p>
                        {plan.savings && <p className="text-xs text-green-600 font-medium mt-0.5">{plan.savings}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-gray-900">{plan.display}</span>
                      <span className="text-sm text-gray-500 ml-1">{plan.per}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-colors"
            >
              {loading ? 'Opening payment…' : `Pay ${PLANS.find(p => p.key === selectedPlan)?.display} with Razorpay`}
            </button>
            <p className="text-xs text-center text-gray-400">Secured by Razorpay · UPI, Cards, Net Banking, Wallets accepted</p>
          </>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What you get</h3>
          <ul className="space-y-2 text-sm">
            {[
              [true,  'Custom clinic website with your branding'],
              [true,  'WhatsApp booking button'],
              [true,  'Services, testimonials & doctor bio'],
              [true,  'Analytics dashboard'],
              [true,  'Appointment booking from your site'],
              [isLive, isLive ? 'No demo banner — fully live' : 'Remove demo banner (upgrade to go live)'],
              [isLive, isLive ? 'Priority support' : 'Priority support (upgrade)'],
            ].map(([included, text], i) => (
              <li key={i} className={`flex items-center gap-2 ${!included ? 'text-gray-400' : 'text-gray-700'}`}>
                <span>{included ? '✓' : '○'}</span>{text as string}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
