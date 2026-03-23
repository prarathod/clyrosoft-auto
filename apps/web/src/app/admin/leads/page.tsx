import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Suspense } from 'react'
import LeadsTable from './LeadsTable'
import LeadsFilters from './LeadsFilters'
import LeadsPagination from './LeadsPagination'

export const revalidate = 0

const PAGE_SIZE = 50

interface SearchParams {
  city?:   string
  area?:   string
  status?: string
  q?:      string
  page?:   string
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const city   = searchParams.city?.trim()   || ''
  const area   = searchParams.area?.trim()   || ''
  const status = searchParams.status?.trim() || ''
  const q      = searchParams.q?.trim()      || ''
  const page   = Math.max(1, parseInt(searchParams.page ?? '1', 10))

  // ── Build filtered query ─────────────────────────────────────────────
  let query = supabaseAdmin.from('leads').select('*', { count: 'exact' })

  if (city)   query = query.ilike('city', city)
  if (area)   query = query.ilike('area', `%${area}%`)
  if (q)      query = query.or(`clinic_name.ilike.%${q}%,doctor_name.ilike.%${q}%`)

  if (status === 'new')        query = query.eq('contacted', false)
  if (status === 'contacted')  query = query.eq('contacted', true)
  if (status === 'demo')       query = query.not('demo_url', 'is', null)
  if (status === 'wa_invalid') query = query.eq('wa_invalid', true)

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const { data: leads, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const total      = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Fetch distinct cities + areas for filter dropdowns ───────────────
  const [{ data: cityRows }, { data: areaRows }] = await Promise.all([
    supabaseAdmin.from('leads').select('city').not('city', 'is', null).order('city'),
    supabaseAdmin.from('leads').select('area').not('area', 'is', null).order('area'),
  ])

  const cities = Array.from(new Set((cityRows ?? []).map(r => r.city).filter(Boolean))).sort()
  const areas  = Array.from(new Set((areaRows  ?? []).map(r => r.area).filter(Boolean))).sort()

  // ── Fetch activities for this page's leads ────────────────────────────
  const leadIds = (leads ?? []).map(l => l.id)
  const { data: activities } = leadIds.length > 0
    ? await supabaseAdmin
        .from('lead_activities')
        .select('lead_id, employee_name, activity_type, note, created_at')
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  type ActivityRow = { lead_id: string; employee_name: string; activity_type: string; note: string | null; created_at: string }
  const activityMap: Record<string, ActivityRow[]> = {}
  for (const a of (activities ?? []) as ActivityRow[]) {
    if (!activityMap[a.lead_id]) activityMap[a.lead_id] = []
    activityMap[a.lead_id]!.push(a)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Leads</h1>
        <p className="text-gray-500 text-sm">{total.toLocaleString()} leads</p>
      </div>

      <Suspense>
        <LeadsFilters cities={cities} areas={areas} total={total} />
      </Suspense>

      {leads && leads.length > 0 ? (
        <>
          <LeadsTable leads={leads} activityMap={activityMap} />
          <Suspense>
            <LeadsPagination page={page} totalPages={totalPages} />
          </Suspense>
        </>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No leads match your filters.</p>
        </div>
      )}
    </div>
  )
}
