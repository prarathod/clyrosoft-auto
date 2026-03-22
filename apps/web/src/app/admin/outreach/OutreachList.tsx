'use client'

import { useState } from 'react'

interface Client {
  id: string
  clinic_name: string
  doctor_name: string | null
  phone: string | null
  city: string | null
  area: string | null
  subdomain: string
  contacted: boolean
  created_at: string
}

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL || 'https://cliniqo.in'

// Pre-encoded UTF-8 emoji — injected directly into the URL, bypassing encodeURIComponent
const E = {
  wave:   '%F0%9F%91%8B',  // 👋
  check:  '%E2%9C%85',     // ✅
  pray:   '%F0%9F%99%8F',  // 🙏
  right:  '%F0%9F%91%89',  // 👉
  target: '%F0%9F%8E%AF',  // 🎯
  party:  '%F0%9F%8E%89',  // 🎉
  star:   '%E2%AD%90',     // ⭐
}

function buildWAMessage(client: Client): string {
  const enc = encodeURIComponent
  const doctor = client.doctor_name ? `Dr. ${client.doctor_name}` : 'Doctor'
  const demoUrl = `${TEMPLATE_URL}/${client.subdomain}`
  const clinicName = client.clinic_name || 'your clinic'
  const location = [client.area, client.city].filter(Boolean).join(', ')

  return (
    enc(`Hi ${doctor}! `) + E.wave +
    enc('\n\n') + E.party + enc(' *We built a FREE demo website for your clinic!*\n\n') +
    E.right + enc(` *${demoUrl}*\n\n`) +
    enc(`Open the link — it's *${clinicName}*${location ? ` (${location})` : ''}, ready to go live!\n\n`) +
    E.check + enc(' WhatsApp booking button\n') +
    E.check + enc(' Services & doctor profile page\n') +
    E.check + enc(' Photo gallery & patient reviews\n') +
    E.check + enc(' Mobile-friendly design\n') +
    E.check + enc(' 6+ professional designs to choose from ') + E.star +
    enc('\n\n*\u20B9299/month only* — no setup fee, cancel anytime. ') + E.target +
    enc('\n\nLike what you see? Just reply *YES*! ') + E.pray
  )
}

function buildWALink(client: Client): string {
  const phone = (client.phone || '').replace(/\D/g, '')
  const normalized = phone.startsWith('91') ? phone : `91${phone}`
  // Use api.whatsapp.com/send directly — skips the wa.me redirect which corrupts emoji encoding
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${buildWAMessage(client)}`
}

async function markContacted(id: string): Promise<void> {
  await fetch(`/api/clients/${id}/contacted`, { method: 'PATCH' })
}

function buildPlainMessage(client: Client): string {
  const wave   = String.fromCodePoint(0x1F44B)
  const check  = String.fromCodePoint(0x2705)
  const pray   = String.fromCodePoint(0x1F64F)
  const right  = String.fromCodePoint(0x1F449)
  const target = String.fromCodePoint(0x1F3AF)
  const party  = String.fromCodePoint(0x1F389)
  const star   = String.fromCodePoint(0x2B50)

  const doctor = client.doctor_name ? `Dr. ${client.doctor_name}` : 'Doctor'
  const demoUrl = `${TEMPLATE_URL}/${client.subdomain}`
  const clinicName = client.clinic_name || 'your clinic'
  const location = [client.area, client.city].filter(Boolean).join(', ')

  return `Hi ${doctor}! ${wave}

${party} We built a FREE demo website for your clinic!

${right} *${demoUrl}*

Open the link — it's *${clinicName}*${location ? ` (${location})` : ''}, ready to go live!

${check} WhatsApp booking button
${check} Services & doctor profile page
${check} Photo gallery & patient reviews
${check} Mobile-friendly design
${check} 6+ professional designs to choose from ${star}

*\u20B9299/month only* — no setup fee, cancel anytime. ${target}

Like what you see? Just reply *YES*! ${pray}`
}

export default function OutreachList({ clients }: { clients: Client[] }) {
  const [tab, setTab] = useState<'all' | 'pending' | 'contacted'>('pending')
  const [contactedIds, setContactedIds] = useState<Set<string>>(
    new Set(clients.filter((c) => c.contacted).map((c) => c.id))
  )
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const visible = clients.filter((c) => {
    const isContacted = contactedIds.has(c.id)
    if (tab === 'pending') return !isContacted
    if (tab === 'contacted') return isContacted
    return true
  })

  async function copyMessage(client: Client) {
    await navigator.clipboard.writeText(buildPlainMessage(client))
    setCopied(client.id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSendWA(client: Client) {
    // Open WhatsApp
    window.open(buildWALink(client), '_blank')

    // Mark as contacted
    if (!contactedIds.has(client.id)) {
      setLoading((prev) => new Set(prev).add(client.id))
      await markContacted(client.id)
      setContactedIds((prev) => new Set(prev).add(client.id))
      setLoading((prev) => {
        const next = new Set(prev)
        next.delete(client.id)
        return next
      })
    }
  }

  const pendingCount = clients.filter((c) => !contactedIds.has(c.id)).length
  const contactedCount = clients.filter((c) => contactedIds.has(c.id)).length

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'contacted', label: `Contacted (${contactedCount})` },
          { key: 'all', label: `All (${clients.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          {tab === 'pending' ? 'No pending clinics — all contacted!' : 'None yet.'}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((client) => {
            const isContacted = contactedIds.has(client.id)
            const isLoading = loading.has(client.id)
            const demoUrl = `${TEMPLATE_URL}/${client.subdomain}`

            return (
              <div
                key={client.id}
                className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 transition-opacity ${
                  isContacted ? 'border-green-900 opacity-70' : 'border-gray-800'
                }`}
              >
                {/* Status dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isContacted ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm truncate">
                      {client.clinic_name}
                    </span>
                    {client.doctor_name && (
                      <span className="text-gray-500 text-xs">Dr. {client.doctor_name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {client.phone && (
                      <span className="text-gray-400 text-xs font-mono">{client.phone}</span>
                    )}
                    {(client.area || client.city) && (
                      <span className="text-gray-600 text-xs">
                        {[client.area, client.city].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-xs truncate max-w-[180px]"
                    >
                      {client.subdomain}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isContacted ? (
                    <span className="text-xs text-green-500 font-medium px-3 py-1.5 bg-green-900/40 rounded-full">
                      ✓ Contacted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendWA(client)}
                      disabled={isLoading || !client.phone}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>💬</span>
                      )}
                      Send WA
                    </button>
                  )}
                  {isContacted && (
                    <button
                      onClick={() => handleSendWA(client)}
                      className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded transition-colors"
                      title="Send again"
                    >
                      Resend
                    </button>
                  )}
                  <button
                    onClick={() => copyMessage(client)}
                    className="text-xs bg-yellow-900 hover:bg-yellow-800 text-yellow-400 px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Copy message to clipboard"
                  >
                    {copied === client.id ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
