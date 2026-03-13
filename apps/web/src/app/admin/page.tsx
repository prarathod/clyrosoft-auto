import { supabaseAdmin } from '@/lib/supabaseAdmin'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-950 border-blue-900',
    green: 'text-green-400 bg-green-950 border-green-900',
    yellow: 'text-yellow-400 bg-yellow-950 border-yellow-900',
    purple: 'text-purple-400 bg-purple-950 border-purple-900',
  }
  return (
    <div className={`rounded-xl p-5 border ${colors[color]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export const revalidate = 0

export default async function AdminOverviewPage() {
  const supabase = supabaseAdmin

  const [{ data: clients }, { data: leads }, { data: analytics }] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('analytics').select('event_type, created_at').order('created_at', { ascending: false }).limit(100),
  ])

  const paying = (clients ?? []).filter((c) => c.status === 'paying').length
  const demo = (clients ?? []).filter((c) => c.status === 'demo').length
  const inactive = (clients ?? []).filter((c) => c.status === 'inactive').length
  const mrr = paying * 999

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const leadsToday = (leads ?? []).filter((l) => new Date(l.created_at) >= todayStart).length

  const recentClients = (clients ?? []).slice(0, 5)
  const recentLeads = (leads ?? []).slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Overview</h1>
        <p className="text-gray-500 text-sm">Platform-wide snapshot</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={`₹${mrr.toLocaleString()}`} sub={`${paying} paying clients`} color="green" />
        <StatCard label="Paying Clients" value={paying} color="blue" />
        <StatCard label="Demo Sites" value={demo} sub={`${inactive} inactive`} color="yellow" />
        <StatCard label="Leads Today" value={leadsToday} sub={`${(leads ?? []).length} total`} color="purple" />
      </div>

      {/* Recent clients + leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-4 text-sm">Recent Clients</h2>
          {recentClients.length === 0 ? (
            <p className="text-gray-500 text-sm">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{c.clinic_name}</p>
                    <p className="text-xs text-gray-500">{c.area}, {c.city}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'paying' ? 'bg-green-900 text-green-400' :
                    c.status === 'demo'   ? 'bg-yellow-900 text-yellow-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-4 text-sm">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-gray-500 text-sm">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{l.clinic_name}</p>
                    <p className="text-xs text-gray-500">{l.city} · {l.phone}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(l.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
