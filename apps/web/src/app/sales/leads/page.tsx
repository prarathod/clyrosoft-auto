import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import SalesLeadsTable from './SalesLeadsTable'

export const revalidate = 0

export default async function SalesLeadsPage() {
  const token = cookies().get('sales_token')?.value ?? ''
  const [email] = token.split('|')

  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  // Get all activities for these leads by this employee
  const leadIds = (leads ?? []).map(l => l.id)
  const { data: activities } = leadIds.length > 0
    ? await supabaseAdmin
        .from('lead_activities')
        .select('lead_id, activity_type, note, created_at')
        .eq('employee_email', email)
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Group activities by lead_id
  const activityMap: Record<string, typeof activities> = {}
  for (const a of activities ?? []) {
    if (!activityMap[a.lead_id]) activityMap[a.lead_id] = []
    activityMap[a.lead_id]!.push(a)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Leads</h1>
        <p className="text-gray-500 text-sm">{(leads ?? []).length} leads · Log calls, WhatsApp & notes</p>
      </div>
      <SalesLeadsTable leads={leads ?? []} activityMap={activityMap} />
    </div>
  )
}
