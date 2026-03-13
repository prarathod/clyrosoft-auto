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
  created_at: string
  contacted?: boolean
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function markContacted(id: string) {
    const supabase = createClient()
    await supabase.from('leads').update({ contacted: true }).eq('id', id)
    router.refresh()
  }

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('leads').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${lead.contacted ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {lead.contacted ? 'Contacted' : 'New'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`/admin/demo-generator?name=${encodeURIComponent(lead.clinic_name)}&doctor=${encodeURIComponent(lead.doctor_name)}&phone=${lead.phone}&city=${encodeURIComponent(lead.city)}`}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                    >
                      ⚡ Demo
                    </a>
                    <button
                      onClick={() => markContacted(lead.id)}
                      disabled={lead.contacted}
                      className="text-xs bg-green-900 hover:bg-green-800 text-green-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
                    >
                      ✓ Mark
                    </button>
                    <a
                      href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi Dr. ${lead.doctor_name}, I'm from Cliniqo. We've built a free demo website for ${lead.clinic_name}!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-400 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      💬 WA
                    </a>
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
