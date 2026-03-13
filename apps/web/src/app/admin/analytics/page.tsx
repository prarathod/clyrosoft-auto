import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const revalidate = 0

export default async function AdminAnalyticsPage() {
  const supabase = supabaseAdmin

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: allEvents }, { data: weekEvents }, { data: clients }] = await Promise.all([
    supabase.from('analytics').select('event_type, subdomain'),
    supabase.from('analytics').select('event_type, subdomain').gte('created_at', weekAgo),
    supabase.from('clients').select('subdomain, clinic_name, status'),
  ])

  const totalViews = (allEvents ?? []).filter((e) => e.event_type === 'page_view').length
  const totalWa    = (allEvents ?? []).filter((e) => e.event_type === 'whatsapp_click').length
  const totalForms = (allEvents ?? []).filter((e) => e.event_type === 'form_submit').length
  const weekViews  = (weekEvents ?? []).filter((e) => e.event_type === 'page_view').length
  const weekWa     = (weekEvents ?? []).filter((e) => e.event_type === 'whatsapp_click').length

  // Per-clinic view counts
  const clinicViews: Record<string, number> = {}
  ;(allEvents ?? []).forEach((e) => {
    if (e.event_type === 'page_view') {
      clinicViews[e.subdomain] = (clinicViews[e.subdomain] ?? 0) + 1
    }
  })
  const topClinics = Object.entries(clinicViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([subdomain, views]) => ({
      subdomain,
      views,
      name: (clients ?? []).find((c) => c.subdomain === subdomain)?.clinic_name ?? subdomain,
    }))

  const STATS = [
    { label: 'Total Page Views',    value: totalViews, icon: '👁️', color: 'blue'   },
    { label: 'Total WA Clicks',     value: totalWa,    icon: '💬', color: 'green'  },
    { label: 'Form Submissions',    value: totalForms, icon: '📋', color: 'purple' },
    { label: 'Views This Week',     value: weekViews,  icon: '📈', color: 'yellow' },
    { label: 'WA Clicks This Week', value: weekWa,     icon: '🔥', color: 'orange' },
    { label: 'Active Clinics',      value: (clients ?? []).filter(c => c.status !== 'inactive').length, icon: '🏥', color: 'teal' },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-950 border-blue-900 text-blue-400',
    green:  'bg-green-950 border-green-900 text-green-400',
    purple: 'bg-purple-950 border-purple-900 text-purple-400',
    yellow: 'bg-yellow-950 border-yellow-900 text-yellow-400',
    orange: 'bg-orange-950 border-orange-900 text-orange-400',
    teal:   'bg-teal-950 border-teal-900 text-teal-400',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Analytics</h1>
        <p className="text-gray-500 text-sm">Platform-wide statistics across all clinics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 border ${colorMap[stat.color]}`}>
            <div className="text-xl mb-2">{stat.icon}</div>
            <p className={`text-3xl font-black ${colorMap[stat.color].split(' ')[2]}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top clinics */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-bold text-white mb-4">Most Visited Clinics</h2>
        {topClinics.length === 0 ? (
          <p className="text-gray-500 text-sm">No analytics data yet.</p>
        ) : (
          <div className="space-y-3">
            {topClinics.map(({ subdomain, views, name }, i) => (
              <div key={subdomain} className="flex items-center gap-4">
                <span className="text-gray-600 text-sm w-6 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{name}</span>
                    <span className="text-xs text-gray-400">{views} views</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min((views / (topClinics[0]?.views ?? 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
