import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default async function SalesDashboard() {
  const token = cookies().get('sales_token')?.value ?? ''
  const [email, name] = token.split('|')

  // Fetch employee commission rates
  const { data: emp } = await supabaseAdmin
    .from('sales_employees')
    .select('commission_per_contact, commission_per_conversion')
    .eq('email', email)
    .maybeSingle()

  const commPerContact    = emp?.commission_per_contact    ?? 10
  const commPerConversion = emp?.commission_per_conversion ?? 200

  // Activity counts — today
  const { data: todayActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('activity_type')
    .eq('employee_email', email)
    .gte('created_at', startOfDay())

  const todayCalls     = (todayActivities ?? []).filter(a => a.activity_type === 'call').length
  const todayWA        = (todayActivities ?? []).filter(a => a.activity_type === 'whatsapp').length
  const todayContacted = todayCalls + todayWA

  // Activity counts — this month
  const { data: monthActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('activity_type, lead_id')
    .eq('employee_email', email)
    .gte('created_at', startOfMonth())

  const monthContacted = new Set(
    (monthActivities ?? [])
      .filter(a => a.activity_type === 'call' || a.activity_type === 'whatsapp')
      .map(a => a.lead_id)
  ).size

  // Conversions this month: leads I contacted that are now 'paying'
  const contactedLeadIds = Array.from(new Set((monthActivities ?? []).map(a => a.lead_id))]
  let monthConversions = 0
  if (contactedLeadIds.length > 0) {
    const { data: convertedLeads } = await supabaseAdmin
      .from('leads')
      .select('id, demo_url')
      .in('id', contactedLeadIds)
    // Check clients table for paying status matching these demo URLs
    const demoUrls = (convertedLeads ?? []).map(l => l.demo_url).filter(Boolean)
    if (demoUrls.length > 0) {
      const { count } = await supabaseAdmin
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('status', 'paying')
        .in('subdomain', demoUrls.map(u => (u as string).split('/').pop() ?? ''))
      monthConversions = count ?? 0
    }
  }

  const monthEarnings = (monthContacted * commPerContact) + (monthConversions * commPerConversion)

  // Recent activities
  const { data: recentActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('id, activity_type, note, created_at, lead_id')
    .eq('employee_email', email)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get lead names for recent activities
  const recentLeadIds = Array.from(new Set((recentActivities ?? []).map(a => a.lead_id))]
  const { data: recentLeads } = recentLeadIds.length > 0
    ? await supabaseAdmin.from('leads').select('id, clinic_name, doctor_name').in('id', recentLeadIds)
    : { data: [] }
  const leadMap = Object.fromEntries((recentLeads ?? []).map(l => [l.id, l]))

  const stats = [
    { label: "Today's Calls",    value: todayCalls,      icon: '📞', color: 'blue'    },
    { label: "Today's WA Sent",  value: todayWA,         icon: '💬', color: 'emerald' },
    { label: 'Month Contacts',   value: monthContacted,  icon: '✅', color: 'purple'  },
    { label: 'Conversions',      value: monthConversions, icon: '🎯', color: 'yellow' },
  ]

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-900/40 text-blue-400 border-blue-800',
    emerald: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    purple:  'bg-purple-900/40 text-purple-400 border-purple-800',
    yellow:  'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Welcome back, {name} 👋</h1>
        <p className="text-gray-400 text-sm">Here&apos;s your performance for today and this month.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${colorMap[s.color]}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Earnings card */}
      <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-sm font-medium">This Month&apos;s Earnings</p>
            <p className="text-3xl font-black text-white mt-1">₹{monthEarnings.toLocaleString('en-IN')}</p>
            <p className="text-gray-400 text-xs mt-1">
              {monthContacted} contacts × ₹{commPerContact} + {monthConversions} conversions × ₹{commPerConversion}
            </p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/sales/leads" className="bg-gray-900 border border-gray-800 hover:border-emerald-700 rounded-xl p-5 transition-colors group">
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">View All Leads</div>
          <div className="text-xs text-gray-500 mt-0.5">Call, WhatsApp & track</div>
        </Link>
        <Link href="/sales/stats" className="bg-gray-900 border border-gray-800 hover:border-emerald-700 rounded-xl p-5 transition-colors group">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">My Stats</div>
          <div className="text-xs text-gray-500 mt-0.5">Full history & earnings</div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>
        {(recentActivities ?? []).length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No activity yet. Start calling leads!</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {(recentActivities ?? []).map(a => {
              const lead = leadMap[a.lead_id]
              const icon = a.activity_type === 'call' ? '📞' : a.activity_type === 'whatsapp' ? '💬' : a.activity_type === 'demo_created' ? '⚡' : '📝'
              return (
                <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">
                      {lead ? `${lead.clinic_name} — Dr. ${lead.doctor_name}` : 'Unknown lead'}
                    </p>
                    {a.note && <p className="text-xs text-gray-400 truncate mt-0.5">{a.note}</p>}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
