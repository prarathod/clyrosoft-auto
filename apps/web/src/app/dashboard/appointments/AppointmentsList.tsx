'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Appointment {
  id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  service: string | null
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default function AppointmentsList({
  appointments: initial,
  subdomain,
}: {
  appointments: Appointment[]
  subdomain: string
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initial)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    const supabase = createClient()
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    setUpdating(null)
  }

  function waLink(a: Appointment) {
    const msg = encodeURIComponent(
      `Hi ${a.patient_name}, your appointment at ${a.appointment_time} on ${formatDate(a.appointment_date)}${a.service ? ` for ${a.service}` : ''} is confirmed. See you soon!`
    )
    return `https://wa.me/91${a.patient_phone}?text=${msg}`
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter((a) => a.appointment_date >= today && a.status !== 'cancelled')
  const past = appointments.filter((a) => a.appointment_date < today || a.status === 'cancelled')

  // Calendar: group by date for the next 7 days
  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  if (appointments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-3xl mb-3">📅</p>
        <p className="font-medium text-gray-900">No appointments yet</p>
        <p className="text-sm text-gray-500 mt-1">Appointments booked through your clinic site will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['list', 'calendar'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {v === 'list' ? '☰ List' : '📅 Calendar'}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} a={a} updating={updating} onStatus={updateStatus} waLink={waLink(a)} />
                ))}
              </div>
            </div>
          )}
          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Past / Cancelled ({past.length})
              </h3>
              <div className="space-y-2 opacity-70">
                {past.map((a) => (
                  <AppointmentCard key={a.id} a={a} updating={updating} onStatus={updateStatus} waLink={waLink(a)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Calendar view — 7-day grid
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {next7.map((dateStr) => {
            const dayAppts = appointments.filter((a) => a.appointment_date === dateStr && a.status !== 'cancelled')
            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
            const isToday = dateStr === today
            return (
              <div
                key={dateStr}
                className={`rounded-xl border p-3 min-h-[120px] ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <p className={`text-xs font-bold mb-2 ${isToday ? 'text-blue-700' : 'text-gray-500'}`}>{label}</p>
                {dayAppts.length === 0 ? (
                  <p className="text-xs text-gray-300">Free</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayAppts.map((a) => (
                      <div key={a.id} className="text-xs bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                        <p className="font-semibold text-gray-800 truncate">{a.patient_name}</p>
                        <p className="text-gray-500">{a.appointment_time}</p>
                        {a.service && <p className="text-gray-400 truncate">{a.service}</p>}
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  a, updating, onStatus, waLink,
}: {
  a: Appointment
  updating: string | null
  onStatus: (id: string, status: string) => void
  waLink: string
}) {
  const isUpdating = updating === a.id
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm">{a.patient_name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {a.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatDate(a.appointment_date)} · {a.appointment_time}
          {a.service && <> · {a.service}</>}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{a.patient_phone}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {a.status === 'pending' && (
          <button
            onClick={() => onStatus(a.id, 'confirmed')}
            disabled={isUpdating}
            className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Confirm ✓
          </button>
        )}
        {a.status === 'confirmed' && (
          <button
            onClick={() => onStatus(a.id, 'completed')}
            disabled={isUpdating}
            className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Done ✓
          </button>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
        >
          💬 WhatsApp
        </a>
        {a.status !== 'cancelled' && a.status !== 'completed' && (
          <button
            onClick={() => onStatus(a.id, 'cancelled')}
            disabled={isUpdating}
            className="text-xs text-gray-400 hover:text-red-500 px-1.5 py-1.5 transition-colors"
            title="Cancel"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
