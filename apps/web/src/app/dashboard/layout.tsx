import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clients')
    .select('*')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        No clinic account found for this email. Contact support.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar clinicName={clinic.clinic_name} status={clinic.status} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
