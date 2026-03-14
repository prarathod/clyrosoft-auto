'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const PROFESSIONS = [
  'dental', 'skin', 'physio', 'general', 'eye', 'orthopedic',
  'ent', 'cardiology', 'neurology', 'psychiatry', 'ayurveda',
  'fertility', 'pediatric', 'gynecology', 'oncology', 'urology',
  'nephrology', 'gastro', 'pulmonology', 'endocrinology',
  'rheumatology', 'spine', 'neuro-surgery', 'plastic-surgery',
  'bariatric', 'vascular', 'radiology', 'pathology',
  'homeopathy', 'naturopathy', 'dietitian', 'psychologist',
  'yoga', 'chiropractic', 'acupuncture', 'occupational',
  'speech', 'audiology', 'optometry', 'hair-transplant', 'ivf',
]

const THEMES = [
  { value: 'classic',  label: 'Classic — Blue, clean & trustworthy' },
  { value: 'modern',   label: 'Modern — Split layout with hero photo' },
  { value: 'minimal',  label: 'Minimal — Light & distraction-free' },
  { value: 'vitality', label: 'Vitality — Emerald green with stats' },
  { value: 'elegant',  label: 'Elegant — Dark navy & gold, luxury' },
  { value: 'warm',     label: 'Warm — Coral gradient, friendly feel' },
]

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3000'

function generateSubdomain(clinicName: string): string {
  return clinicName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 30)
    .replace(/-+$/, '')
}

function DemoGeneratorForm() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead_id')

  const [form, setForm] = useState({
    clinic_name: searchParams.get('name') ?? '',
    doctor_name: searchParams.get('doctor') ?? '',
    phone: searchParams.get('phone') ?? '',
    email: '',
    area: searchParams.get('area') ?? '',
    city: searchParams.get('city') ?? '',
    profession_type: 'dental',
    theme: 'classic',
    tagline: '',
  })
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; subdomain: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (form.clinic_name) {
      setSubdomain(generateSubdomain(form.clinic_name))
    }
  }, [form.clinic_name])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const finalSubdomain = subdomain || generateSubdomain(form.clinic_name)

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_name: form.clinic_name,
          doctor_name: form.doctor_name,
          phone: form.phone,
          email: form.email || null,
          area: form.area,
          city: form.city,
          subdomain: finalSubdomain,
          profession_type: form.profession_type,
          status: 'demo',
          monthly_amount: 499,
          theme: form.theme,
          tagline: form.tagline || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create demo')

      const demoUrl = `${TEMPLATE_URL}/${finalSubdomain}`

      // Save demo_url back to the lead if we came from a lead
      if (leadId) {
        await fetch(`/api/leads/${leadId}/demo-url`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demo_url: demoUrl }),
        })
      }

      setResult({ url: demoUrl, subdomain: finalSubdomain })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create demo')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
  const labelClass = "block text-sm font-medium text-gray-300 mb-1"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Demo Generator</h1>
        <p className="text-gray-500 text-sm">
          Create a new demo clinic website instantly
          {leadId && <span className="ml-2 text-blue-400 text-xs">· linked to lead</span>}
        </p>
      </div>

      {result ? (
        <div className="bg-green-950 border border-green-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-white mb-2">Demo Created!</h2>
          {leadId && <p className="text-green-400 text-sm mb-2">✓ Demo URL saved to lead</p>}
          <p className="text-gray-400 text-sm mb-6">The demo site is live at:</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            ↗ Open Demo: {result.subdomain}
          </a>
          <div className="mt-6 p-4 bg-gray-900 rounded-xl text-left">
            <p className="text-xs text-gray-500 mb-1">Demo URL to send client:</p>
            <p className="text-blue-400 font-mono text-sm">{result.url}</p>
          </div>
          <div className="mt-3 flex gap-3 justify-center">
            {leadId && (
              <a
                href="/admin/leads"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Back to leads (WA button now uses this URL)
              </a>
            )}
            <button
              onClick={() => { setResult(null); setForm({ clinic_name: '', doctor_name: '', phone: '', email: '', area: '', city: '', profession_type: 'dental', theme: 'classic', tagline: '' }) }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Create another →
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Clinic Name *</label>
              <input type="text" required value={form.clinic_name} onChange={set('clinic_name')} placeholder="Sharma Dental Clinic" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Doctor Name *</label>
              <input type="text" required value={form.doctor_name} onChange={set('doctor_name')} placeholder="Ramesh Sharma" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="9876543210" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="sharma@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Area *</label>
              <input type="text" required value={form.area} onChange={set('area')} placeholder="Koramangala" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" required value={form.city} onChange={set('city')} placeholder="Bangalore" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Profession *</label>
              <select value={form.profession_type} onChange={set('profession_type')} className={inputClass}>
                {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Theme / Design</label>
              <select value={form.theme} onChange={set('theme')} className={inputClass}>
                {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Tagline</label>
            <input type="text" value={form.tagline} onChange={set('tagline')} placeholder="Your Smile, Our Priority" className={inputClass} />
          </div>

          {/* Subdomain preview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Generated subdomain:</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-blue-400 text-sm">{subdomain || '—'}</p>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="edit if needed"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Demo URL: {TEMPLATE_URL}/{subdomain || '...'}</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating…' : '⚡ Generate Demo Site'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function DemoGeneratorPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
      <DemoGeneratorForm />
    </Suspense>
  )
}
