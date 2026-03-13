'use client'

import { useState } from 'react'

interface Props {
  phone: string
  doctorName: string
  services: string[]
  primaryColor: string
}

export default function AppointmentForm({ phone, doctorName, services, primaryColor }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = [
      `Hi Dr. ${doctorName}, I'd like to book an appointment.`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.service ? `Service: ${form.service}` : '',
      form.message ? `Message: ${form.message}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Request an Appointment</h2>
      <p className="text-sm text-gray-400">
        Fill this form and we&apos;ll open WhatsApp with your details pre-filled.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
        <input
          type="tel"
          name="phone"
          required
          placeholder="10-digit mobile number"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          className={inputClass + ' bg-white'}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        >
          <option value="">Select a service (optional)</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Any symptoms or questions..."
          value={form.message}
          onChange={handleChange}
          className={inputClass + ' resize-none'}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl shadow hover:opacity-90 transition-opacity"
        style={{ backgroundColor: primaryColor }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Send via WhatsApp
      </button>
    </form>
  )
}
