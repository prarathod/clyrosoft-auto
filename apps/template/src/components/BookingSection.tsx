'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Props {
  subdomain: string
  services: string[]
  phone: string
}

const TIMES = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
  '4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM',
]

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export default function BookingSection({ subdomain, services, phone }: Props) {
  const [name, setName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [service, setService] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const supabase = getSupabase()
      const { error: dbError } = await supabase.from('appointments').insert({
        subdomain,
        patient_name: name,
        patient_phone: patientPhone,
        appointment_date: date,
        appointment_time: time,
        service: service || null,
        status: 'pending',
      })

      if (dbError) throw dbError
      setDone(true)
    } catch (err: any) {
      setError('Something went wrong. Please call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="book" className="py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Book an Appointment
        </h2>
        <p className="text-sm mb-8 opacity-70" style={{ color: 'var(--text)' }}>
          Fill in your details and we'll confirm within 2 hours.
        </p>

        {done ? (
          <div className="rounded-2xl p-8 text-center border" style={{ borderColor: 'var(--primary)', background: 'var(--bg)' }}>
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Appointment Requested!</h3>
            <p className="text-sm opacity-70 mb-6" style={{ color: 'var(--text)' }}>
              We'll confirm your {date} at {time} appointment shortly.
            </p>
            {phone && (
              <a
                href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi, I just booked an appointment for ${date} at ${time}. My name is ${name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: '#25D366', color: '#fff' }}
              >
                💬 Message us on WhatsApp
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70" style={{ color: 'var(--text)' }}>Your Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Sharma's Patient"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--primary)', color: 'var(--text)', background: 'var(--bg)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70" style={{ color: 'var(--text)' }}>Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--primary)', color: 'var(--text)', background: 'var(--bg)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70" style={{ color: 'var(--text)' }}>Preferred Date *</label>
                <input
                  required
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--primary)', color: 'var(--text)', background: 'var(--bg)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70" style={{ color: 'var(--text)' }}>Preferred Time *</label>
                <select
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--primary)', color: 'var(--text)', background: 'var(--bg)' }}
                >
                  <option value="">Select time</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {services.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70" style={{ color: 'var(--text)' }}>Service (optional)</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--primary)', color: 'var(--text)', background: 'var(--bg)' }}
                >
                  <option value="">Any / Not sure</option>
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-bold py-3.5 rounded-xl text-sm transition-opacity disabled:opacity-50"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              {submitting ? 'Booking…' : 'Request Appointment'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
