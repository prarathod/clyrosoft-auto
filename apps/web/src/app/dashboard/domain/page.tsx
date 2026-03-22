'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Script from 'next/script'

declare global { interface Window { Razorpay: any } }

const SETUP_FEE = 20000 // ₹200 in paise

const DOMAIN_PRICES: Record<string, { price: number; label: string }> = {
  '.com':   { price: 99900,  label: '₹999/yr'  },
  '.in':    { price: 49900,  label: '₹499/yr'  },
  '.co.in': { price: 34900,  label: '₹349/yr'  },
  '.net':   { price: 99900,  label: '₹999/yr'  },
  '.org':   { price: 89900,  label: '₹899/yr'  },
  '.clinic':{ price: 149900, label: '₹1,499/yr' },
}

export default function DomainPage() {
  const [tab, setTab] = useState<'own' | 'buy'>('own')
  const [clinic, setClinic] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  // Option A — bring your own domain
  const [ownDomain, setOwnDomain] = useState('')
  const [ownError, setOwnError] = useState('')

  // Option B — buy new domain
  const [buyName, setBuyName] = useState('')
  const [buyTld, setBuyTld] = useState('.com')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('clients').select('clinic_name, subdomain, email, custom_domain, status')
        .eq('email', session.user.email!).single()
        .then(({ data }) => { if (data) setClinic(data) })
    })
  }, [])

  function validateDomain(d: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(d.trim())
  }

  async function payAndSubmit(amountPaise: number, description: string, meta: object) {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise, plan: 'domain' }),
      })
      const { orderId, keyId, error } = await res.json()
      if (error) throw new Error(error)

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Cliniqo',
        description,
        order_id: orderId,
        prefill: { email: clinic?.email },
        theme: { color: '#2563EB' },
        handler: async (response: any) => {
          // Save domain request to DB
          const supabase = createClient()
          await supabase.from('domain_requests').insert({
            clinic_subdomain: clinic?.subdomain,
            clinic_email: clinic?.email,
            payment_id: response.razorpay_payment_id,
            ...meta,
          })
          setDone(description)
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

  function handleOwnDomainPay() {
    const d = ownDomain.trim().toLowerCase()
    if (!validateDomain(d)) { setOwnError('Enter a valid domain e.g. drsharma.com'); return }
    setOwnError('')
    payAndSubmit(SETUP_FEE, `Custom domain setup: ${d}`, { type: 'own', domain: d })
  }

  function handleBuyDomainPay() {
    const d = (buyName.trim().toLowerCase() + buyTld)
    const tldInfo = DOMAIN_PRICES[buyTld]
    payAndSubmit(SETUP_FEE + tldInfo.price, `New domain: ${d}`, { type: 'buy', domain: d, tld: buyTld })
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
        <p className="text-gray-500 mb-2">{done}</p>
        <p className="text-gray-500 text-sm">We will configure your domain and send DNS instructions within <strong>24 hours</strong> to your email.</p>
      </div>
    )
  }

  if (clinic?.custom_domain) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Custom Domain</h1>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <p className="text-sm text-green-700 font-semibold mb-1">✅ Custom domain active</p>
          <p className="text-2xl font-black text-gray-900">{clinic.custom_domain}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Custom Domain</h1>
        <p className="text-gray-500 text-sm mb-8">
          Your site is live at <span className="font-mono text-blue-600">demo.cliniqo.online/{clinic?.subdomain}</span>.
          Upgrade to a custom domain to look more professional.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('own')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'own' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I have a domain
          </button>
          <button
            onClick={() => setTab('buy')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'buy' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Buy a new domain
          </button>
        </div>

        {/* ── Option A: Own domain ── */}
        {tab === 'own' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Connect your existing domain</h2>
              <p className="text-sm text-gray-500">We charge a one-time ₹200 setup fee. We will configure DNS and SSL for you.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your domain name</label>
              <input
                type="text"
                placeholder="drsharma.com"
                value={ownDomain}
                onChange={(e) => setOwnDomain(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {ownError && <p className="text-red-500 text-xs mt-1">{ownError}</p>}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
              <p className="font-semibold">What happens next:</p>
              <p>1. We confirm payment (₹200 one-time)</p>
              <p>2. We email you DNS settings within 24 hours</p>
              <p>3. You add them to your domain registrar</p>
              <p>4. Your site goes live at your domain ✅</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">One-time setup fee</p>
                <p className="text-2xl font-black text-gray-900">₹200</p>
              </div>
              <button
                onClick={handleOwnDomainPay}
                disabled={loading || !ownDomain}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing…' : 'Pay ₹200 & Connect'}
              </button>
            </div>
          </div>
        )}

        {/* ── Option B: Buy new domain ── */}
        {tab === 'buy' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Register a new domain</h2>
              <p className="text-sm text-gray-500">We register it for you and configure everything. Includes ₹200 setup + domain price.</p>
            </div>

            {/* Domain search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search domain name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="drsharma"
                  value={buyName}
                  onChange={(e) => { setBuyName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSearched(false) }}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={buyTld}
                  onChange={(e) => { setBuyTld(e.target.value); setSearched(false) }}
                  className="border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(DOMAIN_PRICES).map(([tld, { label }]) => (
                    <option key={tld} value={tld}>{tld} — {label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSearched(true)}
                  disabled={!buyName}
                  className="bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                  Check
                </button>
              </div>
            </div>

            {/* Result */}
            {searched && buyName && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{buyName}{buyTld}</p>
                    <p className="text-xs text-green-700 font-semibold mt-0.5">✅ Likely available — we will confirm after payment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Domain + Setup</p>
                    <p className="text-xl font-black text-gray-900">
                      ₹{((SETUP_FEE + DOMAIN_PRICES[buyTld].price) / 100).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400">{DOMAIN_PRICES[buyTld].label} + ₹200 setup</p>
                  </div>
                </div>
              </div>
            )}

            {searched && buyName && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
                <p className="font-semibold">What happens next:</p>
                <p>1. We verify availability & confirm payment</p>
                <p>2. We register the domain under your name</p>
                <p>3. We configure DNS → your site goes live in 24 hours ✅</p>
                <p>4. Domain renews yearly — we remind you 30 days before</p>
              </div>
            )}

            {searched && buyName && (
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={handleBuyDomainPay}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing…' : `Pay ₹${((SETUP_FEE + DOMAIN_PRICES[buyTld].price) / 100).toLocaleString('en-IN')} & Register`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
