import { supabaseAdmin } from '@/lib/supabase'
import type { Client } from '@/types/database'

export const revalidate = 0

async function getClients(): Promise<Client[]> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

const STATUS_COLORS: Record<string, string> = {
  demo: 'bg-yellow-100 text-yellow-800',
  paying: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
}

export default async function DashboardPage() {
  const clients = await getClients()

  const stats = {
    total: clients.length,
    paying: clients.filter((c) => c.status === 'paying').length,
    demo: clients.filter((c) => c.status === 'demo').length,
    mrr: clients
      .filter((c) => c.status === 'paying')
      .reduce((sum, c) => sum + c.monthly_amount, 0),
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Clinic SaaS Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: stats.total },
          { label: 'Paying', value: stats.paying },
          { label: 'Demo', value: stats.demo },
          { label: 'MRR (₹)', value: `₹${stats.mrr.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Clinic', 'Doctor', 'Profession', 'City', 'Subdomain', 'Status', 'MRR'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{client.clinic_name}</td>
                <td className="px-4 py-3">{client.doctor_name}</td>
                <td className="px-4 py-3 capitalize">{client.profession_type}</td>
                <td className="px-4 py-3">{client.city}, {client.area}</td>
                <td className="px-4 py-3 text-blue-600 font-mono text-xs">{client.subdomain}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[client.status]}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {client.status === 'paying' ? `₹${client.monthly_amount}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-center py-12 text-gray-400">No clients yet. Run the scraper to add some.</p>
        )}
      </div>
    </main>
  )
}
