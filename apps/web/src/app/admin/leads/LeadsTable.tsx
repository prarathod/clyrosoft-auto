'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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
  profession_type?: string | null
  photos?: string[] | null
  wa_invalid?: boolean | null
  lead_status?: string | null
  login_password?: string | null
}

interface ActivityRow {
  lead_id: string
  employee_name: string
  activity_type: string
  note: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: 'new',            label: 'New',            color: 'bg-gray-800 text-gray-400'    },
  { value: 'interested',     label: 'Interested',     color: 'bg-blue-900 text-blue-300'    },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-950 text-red-400'      },
  { value: 'callback',       label: 'Callback',       color: 'bg-yellow-900 text-yellow-300' },
  { value: 'paid',           label: 'Paid',           color: 'bg-emerald-900 text-emerald-400' },
]

function statusStyle(s?: string | null) {
  return STATUS_OPTIONS.find(o => o.value === (s ?? 'new'))?.color ?? 'bg-gray-800 text-gray-400'
}
function statusLabel(s?: string | null) {
  return STATUS_OPTIONS.find(o => o.value === (s ?? 'new'))?.label ?? 'New'
}
const activityIcon = (t: string) => t === 'call' ? '📞' : t === 'whatsapp' ? '💬' : t === 'demo_created' ? '⚡' : '📝'

const CLINIQO_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://cliniqo.in'

// Plain-text message for clipboard (emoji via String.fromCodePoint, runs in browser onClick)
function buildPlainMessage(
  doctorName: string,
  clinicName: string,
  city: string,
  demoUrl?: string | null,
): string {
  const wave   = String.fromCodePoint(0x1F44B)
  const check  = String.fromCodePoint(0x2705)
  const pray   = String.fromCodePoint(0x1F64F)
  const right  = String.fromCodePoint(0x1F449)
  const target = String.fromCodePoint(0x1F3AF)
  const party  = String.fromCodePoint(0x1F389)
  const star   = String.fromCodePoint(0x2B50)

  const siteLink = demoUrl ?? `${CLINIQO_URL}/demo`
  const demoLine = demoUrl
    ? `*We already built a FREE demo for your clinic!*`
    : `*We'll build a FREE demo for your clinic first!*`

  return `Hi Dr. ${doctorName}! ${wave}

I'm from *Cliniqo* — we build professional websites for clinics & doctors across India.

I found *${clinicName}*${city ? ` in ${city}` : ''} on Google Maps but no website. Patients search online before visiting — a website means more bookings!

${party} ${demoLine}

${right} *${siteLink}*

${check} Mobile-friendly & fast
${check} WhatsApp booking button
${check} Services, gallery & doctor profile
${check} 6+ professional designs to pick from

${star} *Just \u20B9299/month.* No setup fee. Cancel anytime. ${target}

View the demo, pick your favourite design — no payment needed upfront!

Reply *YES*! ${pray}`
}

// Pre-encoded emoji for WA URL (bypasses wa.me redirect corruption)
const E = {
  wave:   '%F0%9F%91%8B',
  check:  '%E2%9C%85',
  pray:   '%F0%9F%99%8F',
  right:  '%F0%9F%91%89',
  target: '%F0%9F%8E%AF',
  party:  '%F0%9F%8E%89',
  star:   '%E2%AD%90',
}

function buildWAUrl(
  phone: string,
  doctorName: string,
  clinicName: string,
  city: string,
  demoUrl?: string | null,
): string {
  const enc = encodeURIComponent
  const siteLink = demoUrl ?? `${CLINIQO_URL}/demo`
  const demoLine = demoUrl
    ? enc('*We already built a FREE demo for your clinic!*')
    : enc("*We'll build a FREE demo for your clinic first!*")

  const text = (
    enc(`Hi Dr. ${doctorName}! `) + E.wave +
    enc("\n\nI'm from *Cliniqo* — we build professional websites for clinics & doctors across India.") +
    enc(`\n\nI found *${clinicName}*${city ? ` in ${city}` : ''} on Google Maps but no website. Patients search online before visiting — a website means more bookings!\n\n`) +
    E.party + enc(' ') + demoLine +
    enc('\n\n') + E.right + enc(` *${siteLink}*\n\n`) +
    E.check + enc(' Mobile-friendly & fast\n') +
    E.check + enc(' WhatsApp booking button\n') +
    E.check + enc(' Services, gallery & doctor profile\n') +
    E.check + enc(' 6+ professional designs to pick from\n') +
    enc('\n') + E.star + enc(' *Just \u20B9299/month.* No setup fee. Cancel anytime. ') + E.target +
    enc('\n\nView the demo, pick your favourite design — no payment needed upfront!\n\nReply *YES*! ') + E.pray
  )
  return `https://api.whatsapp.com/send?phone=91${phone}&text=${text}`
}

export default function LeadsTable({ leads, activityMap }: { leads: Lead[]; activityMap: Record<string, ActivityRow[]> }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [creatingDemo, setCreatingDemo] = useState<string | null>(null)
  const [localDemoUrls, setLocalDemoUrls] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})
  // Optimistic local state — updates instantly without waiting for router.refresh()
  const [localContacted, setLocalContacted] = useState<Set<string>>(new Set())
  const [localWaSent, setLocalWaSent] = useState<Set<string>>(new Set())
  const [localWaInvalid, setLocalWaInvalid] = useState<Set<string>>(
    new Set(leads.filter((l) => l.wa_invalid).map((l) => l.id))
  )

  function isContacted(lead: Lead) { return localContacted.has(lead.id) || !!lead.contacted }
  function isWaInvalid(lead: Lead) { return localWaInvalid.has(lead.id) }
  function isWaSent(lead: Lead)    { return localWaSent.has(lead.id) }

  async function updateStatus(leadId: string, value: string) {
    setLocalStatuses(prev => ({ ...prev, [leadId]: value }))
    await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_status: value }),
    })
  }

  async function markContacted(id: string) {
    setLocalContacted((prev) => new Set(prev).add(id))
    const supabase = createClient()
    await supabase.from('leads').update({ contacted: true }).eq('id', id)
  }

  async function toggleWaInvalid(lead: Lead) {
    const next = !isWaInvalid(lead)
    setLocalWaInvalid((prev) => {
      const s = new Set(prev)
      next ? s.add(lead.id) : s.delete(lead.id)
      return s
    })
    const supabase = createClient()
    await supabase.from('leads').update({ wa_invalid: next }).eq('id', lead.id)
  }

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('leads').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
  }

  async function copyMessage(lead: Lead) {
    const demoUrl = localDemoUrls[lead.id] ?? lead.demo_url
    const msg = buildPlainMessage(lead.doctor_name, lead.clinic_name, lead.city, demoUrl)
    await navigator.clipboard.writeText(msg)
    setCopied(lead.id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function openWA(lead: Lead) {
    let demoUrl = localDemoUrls[lead.id] ?? lead.demo_url

    // Auto-create demo if one doesn't exist yet
    if (!demoUrl) {
      setCreatingDemo(lead.id)
      try {
        const res = await fetch(`/api/leads/${lead.id}/auto-demo`, { method: 'POST' })
        const json = await res.json()
        if (json.demo_url) {
          demoUrl = json.demo_url
          setLocalDemoUrls((prev) => ({ ...prev, [lead.id]: demoUrl as string }))
        }
      } catch {
        // fall through — open WA without demo link
      } finally {
        setCreatingDemo(null)
      }
    }

    // Mark contacted + WA sent instantly (no refresh needed)
    markContacted(lead.id)
    setLocalWaSent((prev) => new Set(prev).add(lead.id))

    window.open(
      buildWAUrl(lead.phone, lead.doctor_name, lead.clinic_name, lead.city, demoUrl),
      '_blank',
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400">No leads yet. They will appear here when someone submits the landing page form.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => {
        const isExp = expanded === lead.id
        const activities = activityMap[lead.id] ?? []
        const currentStatus = localStatuses[lead.id] ?? lead.lead_status ?? 'new'
        const demoUrl = localDemoUrls[lead.id] ?? lead.demo_url

        return (
          <div key={lead.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Main row */}
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{lead.clinic_name}</span>
                  {/* Lead status badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle(currentStatus)}`}>
                    {statusLabel(currentStatus)}
                  </span>
                  {isContacted(lead) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400">Contacted</span>
                  )}
                  {demoUrl && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-400">Demo ready</span>}
                  {isWaSent(lead) && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-400">💬 WA sent</span>}
                  {isWaInvalid(lead) && <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400">❌ Not WA</span>}
                  {activities.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-400">{activities.length} notes</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  Dr. {lead.doctor_name} · {lead.city}{lead.area && lead.area !== lead.city ? `, ${lead.area}` : ''}
                </p>
                <div className="flex gap-3 mt-0.5">
                  <a href={`tel:+91${lead.phone}`} className="text-blue-400 text-xs hover:underline">{lead.phone}</a>
                  {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <a
                  href={`/admin/demo-generator?lead_id=${lead.id}&name=${encodeURIComponent(lead.clinic_name)}&doctor=${encodeURIComponent(lead.doctor_name)}&phone=${lead.phone}&city=${encodeURIComponent(lead.city)}&area=${encodeURIComponent(lead.area ?? '')}`}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {demoUrl ? '⚡ Re-demo' : '⚡ Demo'}
                </a>
                {demoUrl && (
                  <a href={demoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors">
                    ↗ View
                  </a>
                )}
                <button onClick={() => markContacted(lead.id)} disabled={isContacted(lead)}
                  className="text-xs bg-green-900 hover:bg-green-800 text-green-400 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  ✓ Mark
                </button>
                <button onClick={() => openWA(lead)} disabled={creatingDemo === lead.id}
                  className="text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-400 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                  {creatingDemo === lead.id ? '⏳...' : '💬 WA'}
                </button>
                <button onClick={() => toggleWaInvalid(lead)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${isWaInvalid(lead) ? 'bg-red-950 text-red-400' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>
                  {isWaInvalid(lead) ? '❌' : '📵'}
                </button>
                <button onClick={() => copyMessage({ ...lead, demo_url: demoUrl })}
                  className="text-xs bg-yellow-900 hover:bg-yellow-800 text-yellow-400 px-2.5 py-1.5 rounded-lg transition-colors">
                  {copied === lead.id ? '✓' : '📋'}
                </button>
                <button onClick={() => deleteLead(lead.id)} disabled={deleting === lead.id}
                  className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-1.5 rounded-lg transition-colors">
                  🗑
                </button>
                <button onClick={() => setExpanded(isExp ? null : lead.id)}
                  className="text-xs text-gray-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                  {isExp ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Expanded panel */}
            {isExp && (
              <div className="border-t border-gray-800 px-4 py-4 space-y-4 bg-gray-800/30">

                {/* Status + Login creds row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status dropdown */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Lead Status</p>
                    <select
                      value={currentStatus}
                      onChange={e => updateStatus(lead.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Login credentials */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Login Credentials</p>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 space-y-1">
                      <p className="text-xs text-gray-400">Email: <span className="text-white font-mono">{lead.email ?? '—'}</span></p>
                      <p className="text-xs text-gray-400">Password: <span className="text-white font-mono">{lead.login_password ?? '—'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Activity log */}
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Activity Log</p>
                  {activities.length === 0 ? (
                    <p className="text-xs text-gray-600">No activity logged yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {activities.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span>{activityIcon(a.activity_type)}</span>
                          <div className="flex-1">
                            <span className="text-gray-300">{a.note ?? a.activity_type}</span>
                            <span className="text-gray-600 ml-1">· {a.employee_name}</span>
                          </div>
                          <span className="text-gray-600 whitespace-nowrap">
                            {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
