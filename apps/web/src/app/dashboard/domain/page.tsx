'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const ROOT        = 'cliniqo.online'
const DEMO_HOST   = `demo.${ROOT}`

function toSlug(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

// ── Subdomain tab ────────────────────────────────────────────────────────────
function SubdomainTab({ clinic, onUpdated }: { clinic: any; onUpdated: (sub: string) => void }) {
  const [input,    setInput]    = useState('')
  const [slug,     setSlug]     = useState('')
  const [checking, setChecking] = useState(false)
  const [avail,    setAvail]    = useState<boolean | null>(null)
  const [reason,   setReason]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  function handleInput(v: string) {
    const s = toSlug(v)
    setInput(v); setSlug(s); setAvail(null); setReason(''); setError('')
  }

  async function handleCheck() {
    if (slug.length < 3)              { setReason('Min 3 characters'); setAvail(false); return }
    if (slug === clinic?.subdomain)   { setReason('This is already your subdomain'); setAvail(false); return }
    setChecking(true)
    try {
      const res  = await fetch(`/api/dashboard/subdomain?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setAvail(data.available)
      setReason(data.reason ?? '')
    } finally { setChecking(false) }
  }

  async function handleUpdate() {
    if (!avail || !slug) return
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/dashboard/subdomain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: slug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Update failed'); return }
      onUpdated(data.subdomain)
      setInput(''); setSlug(''); setAvail(null); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  const isPaid     = clinic?.status === 'paying'
  const currentUrl = isPaid
    ? `https://${clinic.subdomain}.${ROOT}`
    : `https://${DEMO_HOST}/${clinic.subdomain}`

  return (
    <div className="space-y-6">
      {/* Current URL */}
      <div className={`rounded-2xl p-5 border ${isPaid ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${isPaid ? 'text-green-600' : 'text-blue-600'}`}>
          {isPaid ? '✅ Live website' : '🔵 Demo website'}
        </p>
        <a href={currentUrl} target="_blank" rel="noopener noreferrer"
          className={`text-lg font-bold break-all hover:underline ${isPaid ? 'text-green-800' : 'text-blue-800'}`}>
          {currentUrl}
        </a>
        {!isPaid && (
          <p className="text-xs text-blue-500 mt-2">
            Upgrade your plan to get <strong>{clinic.subdomain}.{ROOT}</strong>
          </p>
        )}
      </div>

      {/* Change form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-bold text-gray-900 mb-0.5">Change subdomain</h2>
          <p className="text-sm text-gray-500">
            Your URL will become <span className="font-mono text-gray-800">{slug || 'your-name'}.{ROOT}</span>
          </p>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New subdomain</label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text" value={input} onChange={(e) => handleInput(e.target.value)}
                placeholder={clinic.subdomain}
                className="flex-1 px-4 py-3 text-sm focus:outline-none"
              />
              <span className="px-3 py-3 text-xs text-gray-400 bg-gray-50 border-l border-gray-200 whitespace-nowrap">
                .{ROOT}
              </span>
            </div>
            {slug && slug !== input.toLowerCase() && (
              <p className="text-xs text-gray-400 mt-1">Saved as: <span className="font-mono">{slug}</span></p>
            )}
          </div>
          <button onClick={handleCheck} disabled={checking || slug.length < 3}
            className="px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40">
            {checking ? 'Checking…' : 'Check'}
          </button>
        </div>

        {avail === true && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">{slug}.{ROOT} is available!</p>
              <p className="text-xs text-green-600">Click Update to claim it.</p>
            </div>
          </div>
        )}
        {avail === false && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-xl">❌</span>
            <p className="text-sm text-red-700">{reason || `${slug}.${ROOT} is already taken.`}</p>
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold text-green-800">
            ✅ Subdomain updated! Your new URL is active.
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Current: <span className="font-mono">{clinic.subdomain}.{ROOT}</span></p>
          <button onClick={handleUpdate} disabled={!avail || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
            {saving ? 'Updating…' : 'Update Subdomain'}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 space-y-1">
        <p className="font-semibold">⚠ Before you change</p>
        <p>• Your old URL (<span className="font-mono">{clinic.subdomain}.{ROOT}</span>) will stop working immediately.</p>
        <p>• Update any shared links, Google My Business, or business cards.</p>
      </div>
    </div>
  )
}

// ── Custom domain tab ────────────────────────────────────────────────────────
function CustomDomainTab({ clinic }: { clinic: any }) {
  const [domain,    setDomain]    = useState(clinic.custom_domain ?? '')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified,  setVerified]  = useState<boolean | null>(null)
  const [error,     setError]     = useState('')

  const savedDomain = clinic.custom_domain

  async function handleSave() {
    const d = domain.trim().toLowerCase()
    if (!d) return
    if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]\.[a-z]{2,}$/.test(d)) {
      setError('Enter a valid domain e.g. drsharma.com'); return
    }
    setSaving(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('clients')
      .update({ custom_domain: d, custom_domain_status: 'pending' })
      .eq('subdomain', clinic.subdomain)
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false); setSaved(true)
    // Reload to show DNS instructions
    window.location.reload()
  }

  async function handleVerify() {
    if (!savedDomain) return
    setVerifying(true); setVerified(null)
    try {
      const res  = await fetch(`/api/dashboard/verify-domain?domain=${encodeURIComponent(savedDomain)}`)
      const data = await res.json()
      setVerified(data.verified)
    } finally { setVerifying(false) }
  }

  // Domain already set — show DNS instructions
  if (savedDomain) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Custom domain</h2>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{savedDomain}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              clinic.custom_domain_status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {clinic.custom_domain_status === 'active' ? '✅ Active' : '⏳ Pending DNS'}
            </span>
          </div>

          {clinic.custom_domain_status !== 'active' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-800">
                  Add these DNS records to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
                </p>

                {/* DNS records table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-blue-600 font-semibold border-b border-blue-200">
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Name / Host</th>
                        <th className="pb-2">Value / Points to</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs text-gray-800">
                      <tr className="border-b border-blue-100">
                        <td className="py-2 pr-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-sans font-semibold">CNAME</span></td>
                        <td className="py-2 pr-4">@<br/><span className="text-gray-400 font-sans text-xs">(or blank / root)</span></td>
                        <td className="py-2">{DEMO_HOST}</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-sans font-semibold">CNAME</span></td>
                        <td className="py-2 pr-4">www</td>
                        <td className="py-2">{DEMO_HOST}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-blue-600">
                  DNS changes can take <strong>10 min – 48 hours</strong> to propagate globally.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-1.5">
                <p className="font-semibold text-gray-800">Step-by-step:</p>
                <p>1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)</p>
                <p>2. Go to <strong>DNS Settings</strong> or <strong>Manage DNS</strong></p>
                <p>3. Delete any existing A records for @ and www</p>
                <p>4. Add the two CNAME records shown above</p>
                <p>5. Save changes, then click Verify below</p>
              </div>

              {verified === false && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  ❌ DNS not detected yet. This can take up to 48 hours — try again later.
                </div>
              )}
              {verified === true && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 font-semibold">
                  ✅ DNS verified! Your custom domain will be active within a few minutes.
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={handleVerify} disabled={verifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                  {verifying ? 'Checking DNS…' : 'Verify DNS Setup'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Need help? WhatsApp us or reply to any Cliniqo email.
        </p>
      </div>
    )
  }

  // No custom domain yet — entry form
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-bold text-gray-900 mb-0.5">Connect your own domain</h2>
          <p className="text-sm text-gray-500">
            Use <span className="font-mono">drsharma.com</span> instead of <span className="font-mono">{clinic.subdomain}.{ROOT}</span>. Free — just add 2 DNS records.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Your domain</label>
          <input
            type="text"
            placeholder="drsharma.com"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setError('') }}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* What happens */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-800">How it works (free):</p>
          <p>1. Enter your domain name and click Save</p>
          <p>2. We show you 2 DNS records to add to your registrar</p>
          <p>3. Add them (takes 2 min), then click Verify</p>
          <p>4. Your site goes live at your own domain ✅</p>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving || !domain.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
            {saving ? 'Saving…' : 'Save & Get DNS Instructions →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DomainPage() {
  const [tab,    setTab]    = useState<'subdomain' | 'custom'>('subdomain')
  const [clinic, setClinic] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('clients')
        .select('clinic_name, subdomain, status, email, custom_domain, custom_domain_status')
        .eq('email', session.user.email!)
        .single()
        .then(({ data }) => { if (data) setClinic(data) })
    })
  }, [])

  if (!clinic) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Domain Settings</h1>
        <p className="text-gray-500 text-sm">Manage your website URL</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: 'subdomain', label: '🔗 Change Subdomain' },
          { key: 'custom',    label: '🌐 Custom Domain'    },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'subdomain' && (
        <SubdomainTab
          clinic={clinic}
          onUpdated={(sub) => setClinic((c: any) => ({ ...c, subdomain: sub }))}
        />
      )}
      {tab === 'custom' && <CustomDomainTab clinic={clinic} />}
    </div>
  )
}
