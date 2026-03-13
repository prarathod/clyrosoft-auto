'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Status = 'all' | 'paying' | 'demo' | 'inactive'

interface Client {
  id: string
  clinic_name: string
  doctor_name: string
  subdomain: string
  status: string
  payment_date: string | null
  monthly_amount: number
  city: string
  area: string
  created_at: string
}

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3000'

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Status>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? clients : clients.filter((c) => c.status === filter)

  async function changeStatus(id: string, status: string) {
    setUpdating(id)
    const supabase = createClient()
    await supabase.from('clients').update({ status }).eq('id', id)
    router.refresh()
    setUpdating(null)
  }

  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('clients').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'paying', 'demo', 'inactive'] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s} {s !== 'all' ? `(${clients.filter(c => c.status === s).length})` : `(${clients.length})`}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                {['Clinic', 'Subdomain', 'Location', 'Status', 'MRR', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{client.clinic_name}</p>
                    <p className="text-xs text-gray-500">Dr. {client.doctor_name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{client.subdomain}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{client.area}, {client.city}</td>
                  <td className="px-4 py-3">
                    <select
                      value={client.status}
                      onChange={(e) => changeStatus(client.id, e.target.value)}
                      disabled={updating === client.id}
                      className={`text-xs px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        client.status === 'paying'   ? 'bg-green-900 text-green-400' :
                        client.status === 'demo'     ? 'bg-yellow-900 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <option value="demo">demo</option>
                      <option value="paying">paying</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {client.status === 'paying' ? `₹${client.monthly_amount}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`${TEMPLATE_URL}/${client.subdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        ↗ Site
                      </a>
                      <button
                        onClick={() => deleteClient(client.id, client.clinic_name)}
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
          {filtered.length === 0 && (
            <p className="text-center py-10 text-gray-500 text-sm">No clients with status &quot;{filter}&quot;</p>
          )}
        </div>
      </div>
    </div>
  )
}
