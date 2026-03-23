import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  // Fetch all sales employees
  const { data: employees } = await supabaseAdmin
    .from('sales_employees')
    .select('*')
    .eq('is_active', true)
    .order('created_at')

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Fetch all activities for last 7 days
  const { data: recentActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('employee_email, employee_name, activity_type, note, created_at, lead_id')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // All-time activities per employee for commission calc
  const { data: allActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('employee_email, lead_id, activity_type')

  // Get all lead phones for conversion matching
  const allLeadIds = [...new Set((allActivities ?? []).map(a => a.lead_id))]
  const { data: allLeads } = allLeadIds.length > 0
    ? await supabaseAdmin.from('leads').select('id, phone, clinic_name, doctor_name, city').in('id', allLeadIds)
    : { data: [] }
  const leadMap = Object.fromEntries((allLeads ?? []).map(l => [l.id, l]))

  // Get paying clients phones
  const { data: payingClients } = await supabaseAdmin
    .from('clients').select('phone').eq('status', 'paying')
  const payingPhones = new Set((payingClients ?? []).map(c => c.phone))

  // Per-employee stats
  const empStats = (employees ?? []).map(emp => {
    const myActivities = (allActivities ?? []).filter(a => a.employee_email === emp.email)
    const myRecent     = (recentActivities ?? []).filter(a => a.employee_email === emp.email)

    const todayActs  = myRecent.filter(a => new Date(a.created_at) >= todayStart)
    const monthActs  = (allActivities ?? []).filter(a =>
      a.employee_email === emp.email && new Date(a.created_at) >= monthStart
    )

    const todayCalls = todayActs.filter(a => a.activity_type === 'call').length
    const todayWA    = todayActs.filter(a => a.activity_type === 'whatsapp').length

    const monthContactedLeads = new Set(
      monthActs
        .filter(a => a.activity_type === 'call' || a.activity_type === 'whatsapp')
        .map(a => a.lead_id)
    )

    const totalContactedLeads = new Set(
      myActivities
        .filter(a => a.activity_type === 'call' || a.activity_type === 'whatsapp')
        .map(a => a.lead_id)
    )

    // Conversions = leads I contacted that are now paying
    const myConversions = [...totalContactedLeads].filter(lid => {
      const lead = leadMap[lid]
      return lead && payingPhones.has(lead.phone)
    }).length

    const monthEarnings =
      monthContactedLeads.size * emp.commission_per_contact +
      myConversions * emp.commission_per_conversion

    return { emp, todayCalls, todayWA, monthContactedLeads: monthContactedLeads.size, myConversions, monthEarnings, recentActs: myRecent }
  })

  // Get lead details for recent activities display
  const recentLeadIds = [...new Set((recentActivities ?? []).map(a => a.lead_id))]
  const { data: recentLeads } = recentLeadIds.length > 0
    ? await supabaseAdmin.from('leads').select('id, clinic_name, doctor_name, city').in('id', recentLeadIds)
    : { data: [] }
  const recentLeadMap = Object.fromEntries((recentLeads ?? []).map(l => [l.id, l]))

  // Group recent activities by date
  const byDate: Record<string, typeof recentActivities> = {}
  for (const a of recentActivities ?? []) {
    const d = a.created_at.slice(0, 10)
    if (!byDate[d]) byDate[d] = []
    byDate[d]!.push(a)
  }

  const actIcon = (t: string) => t === 'call' ? '📞' : t === 'whatsapp' ? '💬' : t === 'demo_created' ? '⚡' : '📝'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Team Performance</h1>
        <p className="text-gray-400 text-sm">{(employees ?? []).length} active sales employees</p>
      </div>

      {/* Per-employee cards */}
      <div className="space-y-4">
        {empStats.map(({ emp, todayCalls, todayWA, monthContactedLeads, myConversions, monthEarnings }) => (
          <div key={emp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">{emp.name}</h2>
                <p className="text-gray-400 text-sm">{emp.email}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  ₹{emp.commission_per_contact}/contact · ₹{emp.commission_per_conversion}/conversion
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">This month earnings</p>
                <p className="text-2xl font-black text-emerald-400">₹{monthEarnings.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Today's Calls", value: todayCalls,           color: 'text-blue-400'   },
                { label: "Today's WA",    value: todayWA,              color: 'text-emerald-400' },
                { label: 'Month Contacts',value: monthContactedLeads,  color: 'text-purple-400'  },
                { label: 'Conversions',   value: myConversions,        color: 'text-yellow-400'  },
              ].map(s => (
                <div key={s.label} className="bg-gray-800/50 rounded-lg p-3">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 7-day activity feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold">Activity — Last 7 Days</h2>
          <p className="text-gray-500 text-xs">{(recentActivities ?? []).length} actions</p>
        </div>

        {Object.keys(byDate).length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-10">No activity in the last 7 days</p>
        ) : (
          <div>
            {Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, acts]) => (
              <div key={date}>
                <div className="px-5 py-2 bg-gray-800/50 flex items-center justify-between">
                  <p className="text-gray-300 text-xs font-semibold">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>📞 {acts!.filter(a => a.activity_type === 'call').length}</span>
                    <span>💬 {acts!.filter(a => a.activity_type === 'whatsapp').length}</span>
                    <span>📝 {acts!.filter(a => a.activity_type === 'note').length}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-800/40">
                  {acts!.map((a, i) => {
                    const lead = recentLeadMap[a.lead_id]
                    return (
                      <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/20">
                        <div className="flex items-center gap-3">
                          <span className="text-base">{actIcon(a.activity_type)}</span>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {lead?.clinic_name ?? 'Unknown'} — Dr. {lead?.doctor_name ?? ''}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {a.employee_name} · {lead?.city ?? ''}{a.note ? ` · "${a.note}"` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs whitespace-nowrap">
                          {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
