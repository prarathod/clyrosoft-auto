'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    display: '₹299',
    per: '/month',
    badge: null,
    savings: null,
    amountPaise: 29900,
    price: 299,
  },
  {
    key: '6months',
    label: '6 Months',
    display: '₹1,499',
    per: '/ 6 months',
    badge: 'Popular',
    savings: 'Save ₹295 — 1 month FREE  (₹250/mo)',
    amountPaise: 149900,
    price: 1499,
  },
  {
    key: 'yearly',
    label: '1 Year',
    display: '₹2,399',
    per: '/year',
    badge: 'Best Value',
    savings: 'Save ₹1,189 — 4 months FREE  (₹200/mo)',
    amountPaise: 239900,
    price: 2399,
  },
]

declare global {
  interface Window { Razorpay: any }
}

export default function SubscriptionPage() {
  const router = useRouter()
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
        .select('clinic_name, status, monthly_amount, payment_date, subdomain, email, phone')
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
        prefill: { email: clinic.email, contact: clinic.phone },
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
            // Refresh dashboard after 3 seconds
            setTimeout(() => router.push('/dashboard'), 3000)
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
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription</h2>
          <p className="text-sm text-gray-500">Choose a plan to go live and remove the demo banner from your site.</p>
        </div>

        {/* Success state */}
        {success && (
          <div className="rounded-2xl p-6 border-2 border-green-300 bg-green-50 text-center space-y-2">
            <p className="text-3xl">🎉</p>
            <p className="font-bold text-green-800 text-lg">Payment successful! Your site is now LIVE.</p>
            <p className="text-sm text-green-700">The demo banner has been removed. Redirecting to dashboard…</p>
          </div>
        )}

        {/* Already paying */}
        {!success && isLive && (
          <div className="rounded-2xl p-5 border-2 border-green-300 bg-green-50 flex items-center gap-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800">Your site is LIVE</p>
              <p className="text-sm text-green-700 mt-0.5">
                ₹{clinic.monthly_amount}/month
                {clinic.payment_date
                  ? ` · Paid on ${new Date(clinic.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : ''}
              </p>
            </div>
          </div>
        )}

        {/* Plan selection */}
        {!isLive && !success && (
          <>
            <div className="space-y-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                    selectedPlan === plan.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
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
              {loading ? 'Opening payment…' : `Pay ${PLANS.find(p => p.key === selectedPlan)?.display} →`}
            </button>
            <p className="text-xs text-center text-gray-400">
              Secured by Razorpay · UPI, Cards, Net Banking, Wallets accepted
            </p>
          </>
        )}

        {/* What you get */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What you get</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Custom clinic website with your branding',
              'WhatsApp booking button',
              'Services, testimonials & doctor bio',
              'Analytics dashboard',
              'Appointment booking from your site',
              'No demo banner — fully live site',
              'Priority support',
            ].map((text) => (
              <li key={text} className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>{text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
