'use client'

import { useState } from 'react'

interface Lead {
  id: string
  clinic_name: string
  doctor_name: string
  phone: string
  city: string
  contacted: boolean
  demo_url: string | null
  last_called_at: string | null
  last_wa_at: string | null
  wa_invalid: boolean
  created_at: string
}

interface Props { leads: Lead[] }

export default function SalesLeadsTable({ leads }: Props) {
  const [localLeads, setLocalLeads] = useState(leads)
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all')
  const [loading, setLoading] = useState<Record<string, string>>({}) // leadId → action

  const filtered = localLeads.filter(l => {
    if (filter === 'new')       return !l.contacted
    if (filter === 'contacted') return l.contacted
    return true
  })

  async function logActivity(lead: Lead, action: 'called' | 'wa_sent') {
    setLoading(prev => ({ ...prev, [lead.id]: action }))
    await fetch('/api/sales/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, action }),
    })
    const now = new Date().toISOString()
    setLocalLeads(prev => prev.map(l => l.id === lead.id ? {
      ...l,
      contacted: true,
      last_called_at: action === 'called'  ? now : l.last_called_at,
      last_wa_at:     action === 'wa_sent' ? now : l.last_wa_at,
    } : l))
    setLoading(prev => { const n = { ...prev }; delete n[lead.id]; return n })
  }

  function openWhatsApp(lead: Lead) {
    const demoLink = lead.demo_url ? `\n\n🌐 Your demo site: ${lead.demo_url}` : ''
    const msg = encodeURIComponent(
      `Namaste Dr. ${lead.doctor_name}! 🙏\n\nI'm Rahul from Cliniqo. We've built a free demo website for ${lead.clinic_name}.${demoLink}\n\nFor only ₹299/month you can go live with your own domain. Would love to connect!`
    )
    window.open(`https://wa.me/91${lead.phone}?text=${msg}`, '_blank')
    logActivity(lead, 'wa_sent')
  }

  function fmt(iso: string | null) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const tabs: Array<{ key: typeof filter; label: string }> = [
    { key: 'all',       label: `All (${localLeads.length})` },
    { key: 'new',       label: `New (${localLeads.filter(l => !l.contacted).length})` },
    { key: 'contacted', label: `Contacted (${localLeads.filter(l => l.contacted).length})` },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Filter tabs */}
      <div className="flex border-b border-gray-800 px-4 pt-3 gap-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-sm px-3 py-1.5 rounded-t-lg font-medium transition-colors ${
              filter === t.key
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 font-medium px-4 py-3">Clinic</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Phone</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">City</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Last Contact</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-600 py-10">No leads here</td></tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{lead.clinic_name}</p>
                  <p className="text-gray-500 text-xs">Dr. {lead.doctor_name}</p>
                </td>
                <td className="px-4 py-3">
                  <a href={`tel:${lead.phone}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{lead.city}</td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {lead.last_called_at && (
                      <p className="text-xs text-blue-400">📞 {fmt(lead.last_called_at)}</p>
                    )}
                    {lead.last_wa_at && (
                      <p className="text-xs text-green-400">💬 {fmt(lead.last_wa_at)}</p>
                    )}
                    {!lead.last_called_at && !lead.last_wa_at && (
                      <p className="text-xs text-gray-600">Not contacted</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Call button */}
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={() => logActivity(lead, 'called')}
                      className="flex items-center gap-1 bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {loading[lead.id] === 'called' ? '…' : '📞 Call'}
                    </a>

                    {/* WhatsApp button */}
                    <button
                      onClick={() => openWhatsApp(lead)}
                      disabled={!!loading[lead.id]}
                      className="flex items-center gap-1 bg-green-900/50 hover:bg-green-800/60 text-green-300 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading[lead.id] === 'wa_sent' ? '…' : '💬 WhatsApp'}
                    </button>

                    {/* View demo */}
                    {lead.demo_url && (
                      <a
                        href={lead.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        ↗ Demo
                      </a>
                    )}
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
