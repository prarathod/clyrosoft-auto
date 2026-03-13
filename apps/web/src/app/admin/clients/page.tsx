import { supabaseAdmin } from '@/lib/supabaseAdmin'
import ClientsTable from './ClientsTable'

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = supabaseAdmin
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Clients</h1>
        <p className="text-gray-500 text-sm">{(clients ?? []).length} total · {(clients ?? []).filter(c => c.status === 'paying').length} paying</p>
      </div>
      <ClientsTable clients={clients ?? []} />
    </div>
  )
}
