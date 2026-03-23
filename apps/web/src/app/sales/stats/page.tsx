import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const revalidate = 0

export default async function SalesStatsPage() {
  const token = cookies().get('sales_token')?.value ?? ''
  const [email, name] = token.split('|')

  const { data: emp } = await supabaseAdmin
    .from('sales_employees')
    .select('commission_per_contact, commission_per_conversion')
    .eq('email', email)
    .maybeSingle()

  const commPerContact    = emp?.commission_per_contact    ?? 10
  const commPerConversion = emp?.commission_per_conversion ?? 200

  // All activities ever
  const { data: allActivities } = await supabaseAdmin
    .from('lead_activities')
    .select('lead_id, activity_type, note, created_at')
    .eq('employee_email', email)
    .order('created_at', { ascending: false })

  const totalCalls = (allActivities ?? []).filter(a => a.activity_type === 'call').length
  const totalWA    = (allActivities ?? []).filter(a => a.activity_type === 'whatsapp').length
  const totalNotes = (allActivities ?? []).filter(a => a.activity_type === 'note').length

  const uniqueContactedLeads = new Set(
    (allActivities ?? [])
      .filter(a => a.activity_type === 'call' || a.activity_type === 'whatsapp')
      .map(a => a.lead_id)
  ).size

  // Group by month
  const byMonth: Record<string, { contacts: Set<string>; activities: number }> = {}
  for (const a of allActivities ?? []) {
    const month = new Date(a.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
    if (!byMonth[month]) byMonth[month] = { contacts: new Set(), activities: 0 }
    byMonth[month].activities++
    if (a.activity_type === 'call' || a.activity_type === 'whatsapp') {
      byMonth[month].contacts.add(a.lead_id)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">My Stats — {name}</h1>
        <p className="text-gray-400 text-sm">All time performance</p>
      </div>

      {/* All-time summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls',     value: totalCalls,              icon: '📞', color: 'text-blue-400'   },
          { label: 'WA Messages',     value: totalWA,                 icon: '💬', color: 'text-emerald-400' },
          { label: 'Notes Added',     value: totalNotes,              icon: '📝', color: 'text-purple-400'  },
          { label: 'Leads Contacted', value: uniqueContactedLeads,    icon: '✅', color: 'text-yellow-400'  },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Commission rates */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-3">Your Commission Rates</h2>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-400">Per Lead Contacted</p>
            <p className="text-xl font-black text-emerald-400">₹{commPerContact}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Per Paid Conversion</p>
            <p className="text-xl font-black text-emerald-400">₹{commPerConversion}</p>
          </div>
        </div>
      </div>

      {/* Month-by-month */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Month-by-Month</h2>
        </div>
        {Object.keys(byMonth).length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No activity yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                {['Month', 'Leads Contacted', 'Activities', 'Est. Earnings'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {Object.entries(byMonth).map(([month, data]) => {
                const contacts = data.contacts.size
                const earnings = contacts * commPerContact
                return (
                  <tr key={month} className="hover:bg-gray-800/50">
                    <td className="px-5 py-3 text-white font-medium">{month}</td>
                    <td className="px-5 py-3 text-gray-300">{contacts}</td>
                    <td className="px-5 py-3 text-gray-300">{data.activities}</td>
                    <td className="px-5 py-3 text-emerald-400 font-semibold">₹{(earnings).toLocaleString('en-IN')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
