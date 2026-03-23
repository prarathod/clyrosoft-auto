'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@supabase/supabase-js'

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
    savings: 'Save ₹295 — 1 month FREE (₹250/mo)',
    amountPaise: 149900,
    price: 1499,
  },
  {
    key: 'yearly',
    label: '1 Year',
    display: '₹2,399',
    per: '/year',
    badge: 'Best Value',
    savings: 'Save ₹1,189 — 4 months FREE (₹200/mo)',
    amountPaise: 239900,
    price: 2399,
  },
]

declare global {
  interface Window { Razorpay: any }
}

export default function PayPage() {
  const params = useParams()
  const subdomain = params.subdomain as string

  const [clinic, setClinic] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    supabase
      .from('clients')
      .select('clinic_name, doctor_name, email, phone, status, subdomain')
      .eq('subdomain', subdomain)
      .single()
      .then(({ data }) => {
        if (!data) { setNotFound(true); return }
        setClinic(data)
      })
  }, [subdomain])

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
        theme: { color: '#059669' },
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

  if (notFound) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Clinic not found.</p>
    </div>
  )

  if (!clinic) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading…</p>
    </div>
  )

  const isAlreadyLive = clinic.status === 'paying'

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center">
            <p className="text-emerald-400 font-bold text-lg">Cliniqo</p>
            <h1 className="text-2xl font-black text-white mt-1">
              Go live with {clinic.clinic_name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Dr. {clinic.doctor_name}</p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-emerald-900/40 border border-emerald-700 rounded-2xl p-6 text-center space-y-3">
              <p className="text-4xl">🎉</p>
              <p className="font-bold text-emerald-400 text-lg">Payment successful!</p>
              <p className="text-gray-300 text-sm">
                Your site is now <strong>LIVE</strong>. The demo banner has been removed.
              </p>
              <a
                href={`/${subdomain}`}
                className="inline-block mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                View Your Live Site →
              </a>
            </div>
          )}

          {/* Already live */}
          {!success && isAlreadyLive && (
            <div className="bg-emerald-900/40 border border-emerald-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-emerald-400">Your site is already LIVE</p>
                <p className="text-gray-400 text-sm mt-0.5">No payment needed — you&apos;re good to go!</p>
              </div>
            </div>
          )}

          {/* Plan selection */}
          {!success && !isAlreadyLive && (
            <>
              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <div
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      selectedPlan === plan.key
                        ? 'border-emerald-500 bg-emerald-950/40'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute -top-2.5 right-4 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        plan.badge === 'Best Value' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPlan === plan.key ? 'border-emerald-500' : 'border-gray-600'
                        }`}>
                          {selectedPlan === plan.key && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{plan.label}</p>
                          {plan.savings && <p className="text-xs text-emerald-400 mt-0.5">{plan.savings}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">{plan.display}</span>
                        <span className="text-xs text-gray-400 ml-1">{plan.per}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-colors"
              >
                {loading ? 'Opening payment…' : `Pay ${PLANS.find(p => p.key === selectedPlan)?.display} →`}
              </button>

              <p className="text-xs text-center text-gray-500">
                Secured by Razorpay · UPI, Cards, Net Banking, Wallets accepted
              </p>

              {/* What you get */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm font-semibold text-white mb-3">What you get</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {[
                    'Demo banner removed — fully live site',
                    'Custom website with your branding',
                    'WhatsApp booking button',
                    'Appointment booking from your site',
                    'Analytics dashboard',
                    'Priority support',
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-xs">✓</span>{text}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
