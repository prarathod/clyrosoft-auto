'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const ROOT = 'cliniqo.online'

function toSlug(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export default function DomainPage() {
  const [clinic,      setClinic]      = useState<any>(null)
  const [input,       setInput]       = useState('')
  const [slug,        setSlug]        = useState('')
  const [checking,    setChecking]    = useState(false)
  const [available,   setAvailable]   = useState<boolean | null>(null)
  const [checkReason, setCheckReason] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('clients')
        .select('clinic_name, subdomain, status, email')
        .eq('email', session.user.email!)
        .single()
        .then(({ data }) => { if (data) setClinic(data) })
    })
  }, [])

  const isPaid    = clinic?.status === 'paying'
  const currentUrl = clinic
    ? isPaid
      ? `https://${clinic.subdomain}.${ROOT}`
      : `https://demo.${ROOT}/${clinic.subdomain}`
    : ''

  function handleInput(v: string) {
    const s = toSlug(v)
    setInput(v)
    setSlug(s)
    setAvailable(null)
    setCheckReason('')
    setError('')
  }

  async function handleCheck() {
    if (slug.length < 3) { setCheckReason('Min 3 characters'); setAvailable(false); return }
    if (slug === clinic?.subdomain) { setCheckReason('This is already your subdomain'); setAvailable(false); return }
    setChecking(true)
    try {
      const res  = await fetch(`/api/dashboard/subdomain?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setAvailable(data.available)
      setCheckReason(data.reason ?? '')
    } finally {
      setChecking(false)
    }
  }

  async function handleUpdate() {
    if (!available || !slug) return
    setSaving(true)
    setError('')
    try {
      const res  = await fetch('/api/dashboard/subdomain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: slug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Update failed'); return }
      setClinic((c: any) => ({ ...c, subdomain: data.subdomain }))
      setInput('')
      setSlug('')
      setAvailable(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!clinic) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Website URL</h1>
        <p className="text-gray-500 text-sm">Change your subdomain on {ROOT}</p>
      </div>

      {/* Current URL */}
      <div className={`rounded-2xl p-5 border ${isPaid ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${isPaid ? 'text-green-600' : 'text-blue-600'}`}>
          {isPaid ? '✅ Live website' : '🔵 Demo website'}
        </p>
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-lg font-bold break-all hover:underline ${isPaid ? 'text-green-800' : 'text-blue-800'}`}
        >
          {currentUrl}
        </a>
        {!isPaid && (
          <p className="text-xs text-blue-500 mt-2">Upgrade your plan to get <strong>{clinic.subdomain}.{ROOT}</strong></p>
        )}
      </div>

      {/* Change subdomain */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-bold text-gray-900 mb-0.5">Change subdomain</h2>
          <p className="text-sm text-gray-500">
            Your URL will become <span className="font-mono text-gray-700">{slug || 'your-name'}.{ROOT}</span>
          </p>
        </div>

        {/* Input + check */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New subdomain</label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={clinic.subdomain}
                className="flex-1 px-4 py-3 text-sm focus:outline-none"
              />
              <span className="px-3 text-xs text-gray-400 bg-gray-50 border-l border-gray-200 py-3 whitespace-nowrap">
                .{ROOT}
              </span>
            </div>
            {slug && slug !== input.toLowerCase() && (
              <p className="text-xs text-gray-400 mt-1">Will be saved as: <span className="font-mono">{slug}</span></p>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={checking || slug.length < 3}
            className="px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {checking ? 'Checking…' : 'Check'}
          </button>
        </div>

        {/* Availability result */}
        {available === true && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-green-600 text-lg">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">{slug}.{ROOT} is available!</p>
              <p className="text-xs text-green-600">Click Update to claim it.</p>
            </div>
          </div>
        )}
        {available === false && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 text-lg">❌</span>
            <p className="text-sm text-red-700">{checkReason || `${slug}.${ROOT} is already taken. Try another.`}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-semibold">
            ✅ Subdomain updated! Your new URL is active.
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Current: <span className="font-mono">{clinic.subdomain}.{ROOT}</span></p>
          <button
            onClick={handleUpdate}
            disabled={!available || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            {saving ? 'Updating…' : 'Update Subdomain'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 space-y-1.5">
        <p className="font-semibold">⚠ Before you change</p>
        <p>• Your old URL (<span className="font-mono">{clinic.subdomain}.{ROOT}</span>) will stop working immediately.</p>
        <p>• Update any shared links, business cards, or Google My Business listings.</p>
        <p>• You can change it again any time.</p>
      </div>
    </div>
  )
}
