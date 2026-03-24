import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type EventType = 'page_view' | 'whatsapp_click' | 'form_submit'

function dayLabel(date: Date) {
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain, clinic_name, status')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) redirect('/login')

  // Fetch events from admin client to bypass RLS
  const { data: events, error } = await supabaseAdmin
    .from('analytics')
    .select('event_type, created_at, page')
    .eq('subdomain', clinic.subdomain)
    .order('created_at', { ascending: false })
    .limit(500)

  const counts: Record<EventType, number> = {
    page_view: 0,
    whatsapp_click: 0,
    form_submit: 0,
  }

  ;(events ?? []).forEach((e) => {
    const type = e.event_type as EventType
    if (type in counts) counts[type]++
  })

  // Last 7 days daily breakdown
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const dailyViews = days.map((day) => {
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    const count = (events ?? []).filter((e) =>
      e.event_type === 'page_view' &&
      new Date(e.created_at) >= day &&
      new Date(e.created_at) < next
    ).length
    return { label: dayLabel(day), count }
  })

  const maxCount = Math.max(...dailyViews.map((d) => d.count), 1)
  const sevenDayTotal = dailyViews.reduce((s, d) => s + d.count, 0)

  // Recent events (last 10)
  const recent = (events ?? []).slice(0, 10)

  const EVENT_META: Record<string, { icon: string; label: string; color: string }> = {
    page_view:      { icon: '👁️', label: 'Page View',       color: '#3B82F6' },
    whatsapp_click: { icon: '💬', label: 'WhatsApp Click',  color: '#22C55E' },
    form_submit:    { icon: '📋', label: 'Form Submit',     color: '#8B5CF6' },
  }

  const STATS = [
    { label: 'Total Page Views',  value: counts.page_view,      icon: '👁️', color: 'blue',   bg: 'bg-blue-50',   text: 'text-blue-700'   },
    { label: 'WhatsApp Clicks',   value: counts.whatsapp_click, icon: '💬', color: 'green',  bg: 'bg-green-50',  text: 'text-green-700'  },
    { label: 'Form Submissions',  value: counts.form_submit,    icon: '📋', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700' },
    { label: 'Views (7 days)',    value: sevenDayTotal,         icon: '📈', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Analytics</h2>
        <p className="text-sm text-gray-500">Traffic and engagement for {clinic.clinic_name}</p>
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
            ⚠ Could not load analytics. Make sure you&apos;ve run the SQL migration to create the <code>analytics</code> table.
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg mb-3 ${stat.bg} ${stat.text}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">Page Views — Last 7 Days</h3>
        <p className="text-xs text-gray-400 mb-6">{sevenDayTotal} total views this week</p>
        <div className="flex items-end gap-2 h-32">
          {dailyViews.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-600">
                {d.count > 0 ? d.count : ''}
              </span>
              <div className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%`,
                  backgroundColor: d.count > 0 ? '#3B82F6' : '#E5E7EB',
                  minHeight: '4px',
                }}
              />
              <span className="text-[10px] text-gray-400 text-center leading-tight">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((e, i) => {
              const meta = EVENT_META[e.event_type] ?? { icon: '•', label: e.event_type, color: '#6B7280' }
              return (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <span className="text-base">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                    {e.page && <p className="text-xs text-gray-400">{e.page}</p>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(e.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-medium text-gray-900">No analytics yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Analytics will appear here once visitors interact with your site.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 text-left max-w-sm mx-auto">
            <p className="font-semibold mb-1">Make sure you&apos;ve run this SQL in Supabase:</p>
            <code className="block text-xs font-mono whitespace-pre">{`CREATE TABLE IF NOT EXISTS analytics (
  id bigserial PRIMARY KEY,
  subdomain text NOT NULL,
  event_type text NOT NULL,
  page text,
  referrer text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ins" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sel" ON analytics FOR SELECT TO authenticated USING (true);`}</code>
          </div>
        </div>
      )}
    </div>
  )
}
