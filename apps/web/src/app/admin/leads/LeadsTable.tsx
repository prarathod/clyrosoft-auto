'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Lead {
  id: string
  clinic_name: string
  doctor_name: string
  phone: string
  city: string
  area?: string | null
  created_at: string
  contacted?: boolean
  demo_url?: string | null
  profession_type?: string | null
  photos?: string[] | null
  wa_invalid?: boolean | null
}

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

${star} *Just \u20B9499/month.* No setup fee. Cancel anytime. ${target}

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
    enc('\n') + E.star + enc(' *Just \u20B9499/month.* No setup fee. Cancel anytime. ') + E.target +
    enc('\n\nView the demo, pick your favourite design — no payment needed upfront!\n\nReply *YES*! ') + E.pray
  )
  return `https://api.whatsapp.com/send?phone=91${phone}&text=${text}`
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [creatingDemo, setCreatingDemo] = useState<string | null>(null)
  const [localDemoUrls, setLocalDemoUrls] = useState<Record<string, string>>({})
  // Optimistic local state — updates instantly without waiting for router.refresh()
  const [localContacted, setLocalContacted] = useState<Set<string>>(new Set())
  const [localWaSent, setLocalWaSent] = useState<Set<string>>(new Set())
  const [localWaInvalid, setLocalWaInvalid] = useState<Set<string>>(
    new Set(leads.filter((l) => l.wa_invalid).map((l) => l.id))
  )

  function isContacted(lead: Lead) { return localContacted.has(lead.id) || !!lead.contacted }
  function isWaInvalid(lead: Lead) { return localWaInvalid.has(lead.id) }
  function isWaSent(lead: Lead)    { return localWaSent.has(lead.id) }

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
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {['Clinic', 'Doctor', 'Phone', 'City', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{lead.clinic_name}</td>
                <td className="px-4 py-3 text-gray-300">Dr. {lead.doctor_name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:+91${lead.phone}`} className="text-blue-400 hover:underline">{lead.phone}</a>
                </td>
                <td className="px-4 py-3 text-gray-400">{lead.city}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${isContacted(lead) ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      {isContacted(lead) ? 'Contacted' : 'New'}
                    </span>
                    {(localDemoUrls[lead.id] ?? lead.demo_url) && (
                      <span className="text-xs px-2 py-0.5 rounded-full w-fit bg-blue-900 text-blue-400">Demo ready</span>
                    )}
                    {isWaSent(lead) && (
                      <span className="text-xs px-2 py-0.5 rounded-full w-fit bg-emerald-900 text-emerald-400">💬 WA sent</span>
                    )}
                    {isWaInvalid(lead) && (
                      <span className="text-xs px-2 py-0.5 rounded-full w-fit bg-red-950 text-red-400">❌ Not on WA</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`/admin/demo-generator?lead_id=${lead.id}&name=${encodeURIComponent(lead.clinic_name)}&doctor=${encodeURIComponent(lead.doctor_name)}&phone=${lead.phone}&city=${encodeURIComponent(lead.city)}&area=${encodeURIComponent(lead.area ?? '')}`}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {(localDemoUrls[lead.id] ?? lead.demo_url) ? '⚡ Re-demo' : '⚡ Demo'}
                    </a>
                    {(localDemoUrls[lead.id] ?? lead.demo_url) && (
                      <a
                        href={localDemoUrls[lead.id] ?? lead.demo_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        ↗ View
                      </a>
                    )}
                    <button
                      onClick={() => markContacted(lead.id)}
                      disabled={isContacted(lead)}
                      className="text-xs bg-green-900 hover:bg-green-800 text-green-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
                    >
                      ✓ Mark
                    </button>
                    <button
                      onClick={() => openWA(lead)}
                      disabled={creatingDemo === lead.id}
                      className="text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {creatingDemo === lead.id ? '⏳ Creating...' : '💬 WA'}
                    </button>
                    <button
                      onClick={() => toggleWaInvalid(lead)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                        isWaInvalid(lead)
                          ? 'bg-red-950 hover:bg-red-900 text-red-400'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
                      }`}
                      title={isWaInvalid(lead) ? 'Mark as on WA' : 'Mark as not on WA'}
                    >
                      {isWaInvalid(lead) ? '❌ Not WA' : '📵 Not WA'}
                    </button>
                    <button
                      onClick={() => copyMessage({ ...lead, demo_url: localDemoUrls[lead.id] ?? lead.demo_url })}
                      className="text-xs bg-yellow-900 hover:bg-yellow-800 text-yellow-400 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copied === lead.id ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button
                      onClick={() => deleteLead(lead.id)}
                      disabled={deleting === lead.id}
                      className="text-xs bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
