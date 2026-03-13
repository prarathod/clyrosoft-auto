'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const PreviewPane = dynamic(() => import('@/components/dashboard/PreviewPane'), { ssr: false })

const THEMES = [
  {
    key: 'classic',
    label: 'Classic',
    desc: 'Traditional · Blue · Serif font',
    color: '#2563EB',
    preview: { bg: '#2563EB', text: 'white' },
  },
  {
    key: 'modern',
    label: 'Modern',
    desc: 'Dark · Gradient · Bold',
    color: '#8B5CF6',
    preview: { bg: 'linear-gradient(135deg, #1E1B4B, #7C3AED)', text: 'white' },
  },
  {
    key: 'minimal',
    label: 'Minimal',
    desc: 'Clean · White · Minimal',
    color: '#18181B',
    preview: { bg: '#FAFAFA', text: '#09090B' },
  },
]

function SectionTag({ label }: { label: string }) {
  return (
    <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
      {label}
    </span>
  )
}

export default function WebsitePage() {
  const [clinicId, setClinicId] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [theme, setTheme] = useState('classic')
  const [tagline, setTagline] = useState('')
  const [doctorBio, setDoctorBio] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('clients')
        .select('id, subdomain, theme, tagline, doctor_bio, cta_text')
        .eq('email', session.user.email!)
        .single()
        .then(({ data }) => {
          if (!data) return
          setClinicId(data.id)
          setSubdomain(data.subdomain)
          setTheme(data.theme ?? 'classic')
          setTagline(data.tagline ?? '')
          setDoctorBio(data.doctor_bio ?? '')
          setCtaText(data.cta_text ?? '')
        })
    })
  }, [])

  async function handleSave() {
    if (!clinicId) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({ theme, tagline, doctor_bio: doctorBio, cta_text: ctaText })
      .eq('id', clinicId)
    setSaving(false)
    setSaved(true)
    setPreviewKey((k) => k + 1)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="flex gap-6 items-start min-h-0">
      {/* ── Left: editor ── */}
      <div className="w-[420px] flex-shrink-0 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Website Settings</h2>
          <p className="text-sm text-gray-500">Save to apply changes to your live site.</p>
        </div>

        {/* Theme picker */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
            Theme
            <SectionTag label="↑ Top bar colour" />
          </h3>
          <p className="text-xs text-gray-400 mb-4">Controls the overall colour scheme of your entire website</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <div
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                  theme === t.key ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="h-20 p-3 flex flex-col justify-end"
                  style={{ background: t.preview.bg }}
                >
                  <div className="text-xs font-bold truncate" style={{ color: t.preview.text }}>
                    Your Clinic
                  </div>
                </div>
                <div className="p-2.5 bg-white">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-semibold text-xs text-gray-900">{t.label}</span>
                    {theme === t.key && <span className="ml-auto text-blue-500 text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content fields */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">Page Content</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Tagline
              <SectionTag label="↑ Hero — below clinic name" />
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Your Smile, Our Priority"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA Button Text
              <SectionTag label="↑ Hero — Book button" />
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Book Appointment"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Bio
              <SectionTag label="↑ About section" />
            </label>
            <textarea
              value={doctorBio}
              onChange={(e) => setDoctorBio(e.target.value)}
              rows={4}
              placeholder="Dr. Sharma has 15 years of experience in cosmetic dentistry..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !clinicId}
          className="w-full bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved! Preview refreshing…' : 'Save & Update Site'}
        </button>
      </div>

      {/* ── Right: live preview (fills remaining space) ── */}
      {subdomain && (
        <div className="flex-1 min-w-0 flex flex-col hidden xl:flex sticky top-6" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Live Preview</span>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-xs text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <PreviewPane subdomain={subdomain} refreshKey={previewKey} />
        </div>
      )}

      {/* Mobile: preview button */}
      {subdomain && (
        <a
          href={`${process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3001'}/${subdomain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="xl:hidden fixed bottom-20 right-4 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
        >
          Preview ↗
        </a>
      )}
    </div>
  )
}
