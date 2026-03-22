import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export default async function SalesDashboardPage() {
  const employeeEmail = process.env.SALES_EMAIL!
  const name = process.env.SALES_NAME ?? 'You'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Today's activity
  const { data: todayActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('action, created_at, leads(clinic_name, doctor_name, phone, city)')
    .eq('employee_email', employeeEmail)
    .gte('created_at', todayStart.toISOString())
    .lte('created_at', todayEnd.toISOString())
    .order('created_at', { ascending: false })

  const todayCalls  = todayActivities?.filter(a => a.action === 'called').length  ?? 0
  const todayWA     = todayActivities?.filter(a => a.action === 'wa_sent').length ?? 0

  // All-time commission stats
  // Leads connected = leads where employee logged at least one action
  const { data: connectedLeadIds } = await supabaseAdmin
    .from('lead_activities')
    .select('lead_id')
    .eq('employee_email', employeeEmail)

  const uniqueLeadIds = [...new Set((connectedLeadIds ?? []).map(r => r.lead_id))]

  // Leads that converted to paying (phone match between lead and client)
  let convertedCount = 0
  if (uniqueLeadIds.length > 0) {
    const { data: leadPhones } = await supabaseAdmin
      .from('leads')
      .select('phone')
      .in('id', uniqueLeadIds)

    if (leadPhones && leadPhones.length > 0) {
      const phones = leadPhones.map(l => l.phone)
      const { count } = await supabaseAdmin
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .in('phone', phones)
        .eq('status', 'paying')
      convertedCount = count ?? 0
    }
  }

  // Commission calculation: ₹200 per connected + ₹500 per converted
  const commissionConnected  = uniqueLeadIds.length * 200
  const commissionConverted  = convertedCount * 500
  const totalCommission      = commissionConnected + commissionConverted

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Good work, {name}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Here's your performance overview</p>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Calls",    value: todayCalls,              color: 'text-blue-400' },
          { label: "Today's WA Sent",  value: todayWA,                 color: 'text-green-400' },
          { label: 'Total Connected',  value: uniqueLeadIds.length,    color: 'text-yellow-400' },
          { label: 'Converted Paying', value: convertedCount,          color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Commission */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-3 font-medium">Your Earnings</p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-white text-xs">Connected leads × ₹200</p>
            <p className="text-blue-300 font-bold">{uniqueLeadIds.length} × ₹200 = ₹{commissionConnected.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white text-xs">Paid conversions × ₹500</p>
            <p className="text-purple-300 font-bold">{convertedCount} × ₹500 = ₹{commissionConverted.toLocaleString()}</p>
          </div>
          <div className="sm:ml-auto">
            <p className="text-white text-xs">Total Commission</p>
            <p className="text-green-400 text-2xl font-bold">₹{totalCommission.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Today's activity log */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Today's Activity</h2>
        </div>
        {!todayActivities || todayActivities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No activity yet today. Start reaching out to leads!</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {todayActivities.map((a: {
              action: string
              created_at: string
              leads: { clinic_name: string; doctor_name: string; phone: string; city: string } | null
            }, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {a.action === 'called' ? '📞' : a.action === 'wa_sent' ? '💬' : '📝'}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {a.leads?.clinic_name ?? 'Unknown clinic'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Dr. {a.leads?.doctor_name} · {a.leads?.city} ·{' '}
                      {a.action === 'called' ? 'Called' : a.action === 'wa_sent' ? 'WhatsApp sent' : 'Note added'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs">
                  {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
