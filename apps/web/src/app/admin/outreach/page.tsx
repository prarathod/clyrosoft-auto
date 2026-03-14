import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OutreachList from './OutreachList'

export const revalidate = 0

export default async function OutreachPage() {
  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select('id, clinic_name, doctor_name, phone, city, area, subdomain, contacted, created_at')
    .eq('status', 'demo')
    .order('created_at', { ascending: false })

  const all = clients ?? []
  const pending = all.filter((c) => !c.contacted)
  const done = all.filter((c) => c.contacted)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Outreach</h1>
          <p className="text-gray-500 text-sm">
            {pending.length} pending · {done.length} contacted · {all.length} total demo sites
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 bg-yellow-900 text-yellow-400 rounded-full font-medium">{pending.length} to contact</span>
          <span className="px-3 py-1.5 bg-green-900 text-green-400 rounded-full font-medium">{done.length} contacted</span>
        </div>
      </div>

      {/* Progress bar */}
      {all.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Outreach progress</span>
            <span>{Math.round((done.length / all.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(done.length / all.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <OutreachList clients={all} />
    </div>
  )
}
