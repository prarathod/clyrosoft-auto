'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const PreviewPane = dynamic(() => import('@/components/dashboard/PreviewPane'), { ssr: false })

interface Testimonial {
  name: string
  text: string
  treatment: string
}

function SectionTag({ label }: { label: string }) {
  return (
    <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
      {label}
    </span>
  )
}

export default function ContentPage() {
  const [clinicId, setClinicId] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [phone, setPhone] = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('clients')
        .select('id, subdomain, services, testimonials, phone, google_maps_link')
        .eq('email', session.user.email!)
        .single()
        .then(({ data }) => {
          if (!data) return
          setClinicId(data.id)
          setSubdomain(data.subdomain)
          setServices(data.services ?? [])
          setTestimonials(data.testimonials ?? [])
          setPhone(data.phone ?? '')
          setGoogleMapsLink(data.google_maps_link ?? '')
        })
    })
  }, [])

  function addService() {
    if (!newService.trim()) return
    setServices([...services, newService.trim()])
    setNewService('')
  }

  function removeService(i: number) {
    setServices(services.filter((_, idx) => idx !== i))
  }

  function addTestimonial() {
    setTestimonials([...testimonials, { name: '', text: '', treatment: '' }])
  }

  function updateTestimonial(i: number, field: keyof Testimonial, value: string) {
    setTestimonials(testimonials.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  function removeTestimonial(i: number) {
    setTestimonials(testimonials.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!clinicId) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({ services, testimonials, phone, google_maps_link: googleMapsLink })
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">Content</h2>
          <p className="text-sm text-gray-500">Update services, testimonials, and contact info.</p>
        </div>

        {/* Services */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center flex-wrap gap-1">
            Services
            <SectionTag label="↓ Services section" />
          </h3>
          {services.length === 0 && (
            <p className="text-xs text-gray-400 mb-3">No custom services — profession defaults will show.</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4 mt-3">
            {services.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                {s}
                <button onClick={() => removeService(i)} className="text-blue-400 hover:text-blue-700 ml-1 text-xs">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              placeholder="e.g. Teeth Whitening"
              className={inputClass}
            />
            <button
              onClick={addService}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center flex-wrap gap-1">
            Contact Info
            <SectionTag label="↓ Footer + WhatsApp button" />
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
            <input type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className={inputClass} />
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 flex items-center flex-wrap gap-1">
              Testimonials
              <SectionTag label="↓ Reviews section" />
            </h3>
            <button onClick={addTestimonial} className="text-sm text-blue-600 hover:underline flex-shrink-0">+ Add</button>
          </div>
          {testimonials.length === 0 && (
            <p className="text-xs text-gray-400 mb-3 mt-1">Sample reviews show when empty</p>
          )}
          <div className="space-y-4 mt-3">
            {testimonials.map((t, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Review {i + 1}</span>
                  <button onClick={() => removeTestimonial(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
                <input value={t.name} onChange={(e) => updateTestimonial(i, 'name', e.target.value)} placeholder="Patient name" className={inputClass} />
                <input value={t.treatment} onChange={(e) => updateTestimonial(i, 'treatment', e.target.value)} placeholder="Treatment (e.g. Root Canal)" className={inputClass} />
                <textarea value={t.text} onChange={(e) => updateTestimonial(i, 'text', e.target.value)} placeholder="What did the patient say?" rows={3} className={`${inputClass} resize-none`} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !clinicId}
          className="w-full bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved! Preview refreshing…' : 'Save & Update Site'}
        </button>
      </div>

      {/* ── Right: live preview (fills remaining space) ── */}
      {subdomain && (
        <div className="flex-1 min-w-0 hidden xl:flex flex-col sticky top-6" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Live Preview</span>
            <button onClick={() => setPreviewKey((k) => k + 1)} className="text-xs text-blue-600 hover:underline">Refresh</button>
          </div>
          <PreviewPane subdomain={subdomain} refreshKey={previewKey} />
        </div>
      )}

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
