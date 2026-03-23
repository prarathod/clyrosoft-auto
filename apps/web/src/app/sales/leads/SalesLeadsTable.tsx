'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string
  clinic_name: string
  doctor_name: string
  phone: string
  email?: string | null
  city: string
  area?: string | null
  created_at: string
  contacted?: boolean
  demo_url?: string | null
  wa_invalid?: boolean | null
  lead_status?: string | null
  login_password?: string | null
}

const STATUS_OPTIONS = [
  { value: 'new',            label: 'New'            },
  { value: 'interested',     label: 'Interested'     },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'callback',       label: 'Callback'       },
  { value: 'paid',           label: 'Paid'           },
]

interface Activity {
  lead_id: string
  activity_type: string
  note: string | null
  created_at: string
}

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://cliniqo.in'

function buildWAUrl(phone: string, doctorName: string, clinicName: string, city: string, demoUrl?: string | null) {
  const enc = encodeURIComponent
  const siteLink = demoUrl ?? `${TEMPLATE_URL}/demo`
  const demoLine = demoUrl
    ? enc('*We already built a FREE demo for your clinic!*')
    : enc("*We'll build a FREE demo for your clinic first!*")
  const E = { wave: '%F0%9F%91%8B', check: '%E2%9C%85', right: '%F0%9F%91%89', party: '%F0%9F%8E%89', star: '%E2%AD%90', pray: '%F0%9F%99%8F', target: '%F0%9F%8E%AF' }
  const text = (
    enc(`Hi Dr. ${doctorName}! `) + E.wave +
    enc('\n\nI\'m from *Cliniqo* — we build professional websites for clinics & doctors across India.') +
    enc(`\n\nI found *${clinicName}*${city ? ` in ${city}` : ''} on Google Maps but no website. Patients search online before visiting — a website means more bookings!\n\n`) +
    E.party + enc(' ') + demoLine +
    enc('\n\n') + E.right + enc(` *${siteLink}*\n\n`) +
    E.check + enc(' Mobile-friendly & fast\n') +
    E.check + enc(' WhatsApp booking button\n') +
    E.check + enc(' Services, gallery & doctor profile\n') +
    enc('\n') + E.star + enc(' *Just ₹299/month.* No setup fee. Cancel anytime. ') + E.target +
    enc('\n\nReply *YES*! ') + E.pray
  )
  return `https://api.whatsapp.com/send?phone=91${phone}&text=${text}`
}

export default function SalesLeadsTable({
  leads,
  activityMap,
}: {
  leads: Lead[]
  activityMap: Record<string, Activity[] | null | undefined>
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [logging, setLogging] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'demo'>('all')
  // Local activity state so notes appear instantly without waiting for router.refresh()
  const [localActivities, setLocalActivities] = useState<Record<string, Activity[]>>(
    Object.fromEntries(Object.entries(activityMap).map(([k, v]) => [k, v ?? []]))
  )
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

  async function logActivity(leadId: string, type: string, note?: string) {
    setLogging(`${leadId}-${type}`)
    // Optimistically add to local state so it shows immediately
    const newActivity: Activity = {
      lead_id: leadId,
      activity_type: type,
      note: note ?? null,
      created_at: new Date().toISOString(),
    }
    setLocalActivities(prev => ({
      ...prev,
      [leadId]: [newActivity, ...(prev[leadId] ?? [])],
    }))
    await fetch('/api/sales/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, activity_type: type, note: note ?? null }),
    })
    setLogging(null)
    router.refresh()
  }

  async function updateStatus(leadId: string, value: string) {
    setLocalStatuses(prev => ({ ...prev, [leadId]: value }))
    await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_status: value }),
    })
  }

  async function openWA(lead: Lead) {
    window.open(buildWAUrl(lead.phone, lead.doctor_name, lead.clinic_name, lead.city, lead.demo_url), '_blank')
    await logActivity(lead.id, 'whatsapp', `Sent WhatsApp message to Dr. ${lead.doctor_name}`)
  }

  async function logCall(lead: Lead) {
    await logActivity(lead.id, 'call', `Called Dr. ${lead.doctor_name} at ${lead.phone}`)
  }

  async function submitNote(leadId: string) {
    if (!noteText.trim()) return
    await logActivity(leadId, 'note', noteText.trim())
    setNoteText('')
  }

  const filtered = leads.filter(l => {
    if (filter === 'new')       return !l.contacted
    if (filter === 'contacted') return !!l.contacted
    if (filter === 'demo')      return !!l.demo_url
    return true
  }).filter(l => {
    if (!search) return true
    const s = search.toLowerCase()
    return l.clinic_name.toLowerCase().includes(s) ||
           l.doctor_name.toLowerCase().includes(s) ||
           l.city?.toLowerCase().includes(s) ||
           l.phone.includes(s)
  })

  const activityIcon = (type: string) =>
    type === 'call' ? '📞' : type === 'whatsapp' ? '💬' : type === 'demo_created' ? '⚡' : '📝'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search clinic, doctor, city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
          {(['all', 'new', 'contacted', 'demo'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-xs">{filtered.length} leads</p>

      {/* Table */}
      <div className="space-y-2">
        {filtered.map(lead => {
          const activities = localActivities[lead.id] ?? []
          const isExpanded = expanded === lead.id
          const isLoggingCall = logging === `${lead.id}-call`
          const isLoggingWA   = logging === `${lead.id}-whatsapp`
          const isLoggingNote = logging === `${lead.id}-note`
          const currentStatus = localStatuses[lead.id] ?? lead.lead_status ?? 'new'

          return (
            <div key={lead.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Main row */}
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{lead.clinic_name}</span>
                    {lead.contacted && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400">Contacted</span>
                    )}
                    {lead.demo_url && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-400">Demo ready</span>
                    )}
                    {activities.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-400">
                        {activities.length} {activities.length === 1 ? 'action' : 'actions'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Dr. {lead.doctor_name} · {lead.city}{lead.area ? `, ${lead.area}` : ''}
                  </p>
                  <a href={`tel:+91${lead.phone}`} className="text-blue-400 text-xs hover:underline">{lead.phone}</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => logCall(lead)}
                    disabled={!!isLoggingCall}
                    className="text-xs bg-blue-900 hover:bg-blue-800 text-blue-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="Log a call"
                  >
                    {isLoggingCall ? '…' : '📞 Call'}
                  </button>
                  <button
                    onClick={() => openWA(lead)}
                    disabled={!!isLoggingWA}
                    className="text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="Open WhatsApp + log activity"
                  >
                    {isLoggingWA ? '…' : '💬 WA'}
                  </button>
                  {lead.demo_url && (
                    <a
                      href={lead.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      ↗ Site
                    </a>
                  )}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : lead.id)}
                    className="text-xs text-gray-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-gray-800 px-4 py-4 space-y-4 bg-gray-800/20">

                  {/* Status + Login creds */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Lead Status</p>
                      <select
                        value={currentStatus}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Login Email</p>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-400">Email: <span className="text-white font-mono">{lead.email ?? '—'}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5">Password: <span className="text-white font-mono">{lead.login_password ?? '—'}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Activity log */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Activity Log</p>
                    {activities.length === 0 ? (
                      <p className="text-xs text-gray-600">No activity yet — log a call or note below.</p>
                    ) : (
                      <div className="space-y-1.5 mb-3">
                        {activities.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span>{activityIcon(a.activity_type)}</span>
                            <div className="flex-1">
                              <span className="text-gray-300">{a.note ?? a.activity_type}</span>
                            </div>
                            <span className="text-gray-600 whitespace-nowrap">
                              {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add note */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a note (e.g. interested, callback at 5pm, asked for price)…"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitNote(lead.id) }}
                        className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => submitNote(lead.id)}
                        disabled={!!isLoggingNote}
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoggingNote ? '…' : '+ Note'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
