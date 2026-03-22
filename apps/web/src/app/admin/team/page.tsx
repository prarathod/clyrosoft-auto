import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const SALES_EMAIL = process.env.SALES_EMAIL ?? 'rahul@gmail.com'
const SALES_NAME  = process.env.SALES_NAME  ?? 'Rahul'

export default async function AdminTeamPage() {
  // Last 7 days of activity
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: activities } = await supabaseAdmin
    .from('lead_activities')
    .select('action, created_at, lead_id, note, leads(clinic_name, doctor_name, phone, city)')
    .eq('employee_email', SALES_EMAIL)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // Today's activity
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)
  const todayActivities = (activities ?? []).filter(a =>
    new Date(a.created_at) >= todayStart && new Date(a.created_at) <= todayEnd
  )

  // All-time commission stats
  const { data: allActivity } = await supabaseAdmin
    .from('lead_activities')
    .select('lead_id')
    .eq('employee_email', SALES_EMAIL)

  const uniqueLeadIds = [...new Set((allActivity ?? []).map(r => r.lead_id))]

  let convertedCount = 0
  if (uniqueLeadIds.length > 0) {
    const { data: leadPhones } = await supabaseAdmin
      .from('leads').select('phone').in('id', uniqueLeadIds)
    if (leadPhones?.length) {
      const { count } = await supabaseAdmin
        .from('clients').select('*', { count: 'exact', head: true })
        .in('phone', leadPhones.map(l => l.phone)).eq('status', 'paying')
      convertedCount = count ?? 0
    }
  }

  const totalCommission = uniqueLeadIds.length * 200 + convertedCount * 500

  // Group activities by date for the 7-day breakdown
  const byDate: Record<string, typeof activities> = {}
  for (const a of activities ?? []) {
    const d = a.created_at.slice(0, 10)
    if (!byDate[d]) byDate[d] = []
    byDate[d]!.push(a)
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team — {SALES_NAME}</h1>
        <p className="text-gray-400 text-sm mt-1">{SALES_EMAIL} · Sales Representative</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Calls",    value: todayActivities.filter(a => a.action === 'called').length,   color: 'text-blue-400' },
          { label: "Today's WA",       value: todayActivities.filter(a => a.action === 'wa_sent').length,  color: 'text-green-400' },
          { label: 'Total Connected',  value: uniqueLeadIds.length,                                         color: 'text-yellow-400' },
          { label: 'Paid Conversions', value: convertedCount,                                               color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commission */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Commission Breakdown</h2>
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-gray-400 text-xs">Leads Connected × ₹200</p>
            <p className="text-blue-300 font-bold text-lg">{uniqueLeadIds.length} × ₹200 = ₹{(uniqueLeadIds.length * 200).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Paid Conversions × ₹500</p>
            <p className="text-purple-300 font-bold text-lg">{convertedCount} × ₹500 = ₹{(convertedCount * 500).toLocaleString()}</p>
          </div>
          <div className="sm:ml-auto">
            <p className="text-gray-400 text-xs">Total Payable</p>
            <p className="text-green-400 font-bold text-2xl">₹{totalCommission.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 7-day activity log */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold">Activity — Last 7 Days</h2>
          <p className="text-gray-500 text-xs">{(activities ?? []).length} actions total</p>
        </div>

        {Object.keys(byDate).length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-10">No activity in the last 7 days</p>
        ) : (
          <div>
            {Object.entries(byDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, acts]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="px-5 py-2 bg-gray-800/50 flex items-center justify-between">
                    <p className="text-gray-300 text-xs font-semibold">
                      {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>📞 {acts!.filter(a => a.action === 'called').length} calls</span>
                      <span>💬 {acts!.filter(a => a.action === 'wa_sent').length} WA</span>
                    </div>
                  </div>
                  {/* Activities */}
                  <div className="divide-y divide-gray-800/40">
                    {acts!.map((a, i) => (
                      <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/20">
                        <div className="flex items-center gap-3">
                          <span className="text-base">
                            {a.action === 'called' ? '📞' : a.action === 'wa_sent' ? '💬' : '📝'}
                          </span>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {(a.leads as { clinic_name: string } | null)?.clinic_name ?? 'Unknown'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Dr. {(a.leads as { doctor_name: string } | null)?.doctor_name} ·{' '}
                              {(a.leads as { city: string } | null)?.city} ·{' '}
                              {a.action === 'called' ? 'Called' : a.action === 'wa_sent' ? 'WhatsApp sent' : 'Note'}
                              {a.note ? ` — "${a.note}"` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs">{fmt(a.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
