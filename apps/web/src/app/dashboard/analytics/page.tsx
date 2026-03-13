import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

type EventType = 'page_view' | 'whatsapp_click' | 'form_submit'

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain, clinic_name')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) redirect('/login')

  const { data: events } = await supabase
    .from('analytics')
    .select('event_type, created_at')
    .eq('subdomain', clinic.subdomain)
    .order('created_at', { ascending: false })

  const counts: Record<EventType, number> = {
    page_view: 0,
    whatsapp_click: 0,
    form_submit: 0,
  }

  ;(events ?? []).forEach((e) => {
    const type = e.event_type as EventType
    if (type in counts) counts[type]++
  })

  // Last 7 days page views
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentViews = (events ?? []).filter(
    (e) => e.event_type === 'page_view' && new Date(e.created_at) >= sevenDaysAgo
  ).length

  const STATS = [
    { label: 'Total Page Views', value: counts.page_view, icon: '👁️', color: 'blue' },
    { label: 'WhatsApp Clicks', value: counts.whatsapp_click, icon: '💬', color: 'green' },
    { label: 'Form Submissions', value: counts.form_submit, icon: '📋', color: 'purple' },
    { label: 'Views (7 days)', value: recentViews, icon: '📈', color: 'orange' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Analytics</h2>
        <p className="text-sm text-gray-500">Traffic and engagement for {clinic.clinic_name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg mb-3 ${colorMap[stat.color]}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {(events ?? []).length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-medium text-gray-900">No analytics yet</p>
          <p className="text-sm text-gray-500 mt-1">Analytics will appear here once visitors interact with your site.</p>
        </div>
      )}
    </div>
  )
}
