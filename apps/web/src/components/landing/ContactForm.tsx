'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const ADMIN_WA = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '919999999999'

export default function ContactForm() {
  const [form, setForm] = useState({ clinic_name: '', doctor_name: '', phone: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('leads').insert({
        clinic_name: form.clinic_name,
        doctor_name: form.doctor_name,
        phone: form.phone,
        city: form.city,
      })
      if (dbError) throw dbError

      // Notify admin on WhatsApp
      const msg = encodeURIComponent(
        `🏥 New Lead!\nClinic: ${form.clinic_name}\nDoctor: Dr. ${form.doctor_name}\nPhone: ${form.phone}\nCity: ${form.city}`
      )
      window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, '_blank')
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">We got your request!</h3>
        <p className="text-gray-600 text-sm">
          We will build your free demo website and send it to you within 24 hours on WhatsApp.
        </p>
        <p className="text-blue-600 font-semibold mt-4 text-sm">📱 Watch for a message on {form.phone}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
        <input
          type="text"
          required
          value={form.clinic_name}
          onChange={set('clinic_name')}
          placeholder="Sharma Dental Clinic"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
        <input
          type="text"
          required
          value={form.doctor_name}
          onChange={set('doctor_name')}
          placeholder="Dr. Ramesh Sharma"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={set('phone')}
          placeholder="9876543210"
          pattern="[0-9]{10}"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <input
          type="text"
          required
          value={form.city}
          onChange={set('city')}
          placeholder="Bangalore"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : '🚀 Get My Free Demo Site'}
      </button>
      <p className="text-xs text-gray-400 text-center">No credit card needed. Free demo, no obligation.</p>
    </form>
  )
}
