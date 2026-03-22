'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ContactForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    clinic_name: '',
    doctor_name: '',
    phone: '',
    city: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Create account + client record via API
      const res = await fetch('/api/signup-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      // 2. Sign the user in immediately
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) throw new Error(signInError.message)

      // 3. Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="doctor@example.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Set a Password *</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={set('password')}
          placeholder="Min. 6 characters"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Setting up your site…' : '🚀 Get My Free Demo Site'}
      </button>
      <p className="text-xs text-gray-400 text-center">No credit card needed. Your site is ready instantly.</p>
    </form>
  )
}
