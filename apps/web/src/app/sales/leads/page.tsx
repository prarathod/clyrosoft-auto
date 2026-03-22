import { supabaseAdmin } from '@/lib/supabaseAdmin'
import SalesLeadsTable from './SalesLeadsTable'

export const dynamic = 'force-dynamic'

export default async function SalesLeadsPage() {
  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select('id, clinic_name, doctor_name, phone, city, contacted, demo_url, last_called_at, last_wa_at, wa_invalid, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{leads?.length ?? 0} total leads</p>
        </div>
      </div>
      <SalesLeadsTable leads={leads ?? []} />
    </div>
  )
}
