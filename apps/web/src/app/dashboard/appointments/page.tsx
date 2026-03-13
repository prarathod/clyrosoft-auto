import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import AppointmentsList from './AppointmentsList'

export const revalidate = 0

export default async function AppointmentsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain, clinic_name')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('subdomain', clinic.subdomain)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Appointments</h2>
        <p className="text-sm text-gray-500">Bookings made through your clinic website.</p>
      </div>
      <AppointmentsList
        appointments={appointments ?? []}
        subdomain={clinic.subdomain}
      />
    </div>
  )
}
