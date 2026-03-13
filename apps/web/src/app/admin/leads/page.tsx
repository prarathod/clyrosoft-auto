import { supabaseAdmin } from '@/lib/supabaseAdmin'
import LeadsTable from './LeadsTable'

export const revalidate = 0

export default async function LeadsPage() {
  const supabase = supabaseAdmin
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Leads</h1>
        <p className="text-gray-500 text-sm">{(leads ?? []).length} total leads from landing page</p>
      </div>
      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
