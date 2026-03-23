import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clinic } = await supabase
    .from('clients')
    .select('*')
    .eq('email', session.user.email!)
    .single()

  if (!clinic) redirect('/login')

  const isLive = clinic.status === 'paying'
  const siteUrl = `${process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3001'}/${clinic.subdomain}`

  // Fetch appointment count for conversion nudge
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('subdomain', clinic.subdomain)

  const hasAppointments = (appointmentCount ?? 0) > 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Upgrade CTA — always shown for demo users */}
      {!isLive && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <p className="font-bold text-base">
              {hasAppointments
                ? `🎉 You have ${appointmentCount} appointment${appointmentCount === 1 ? '' : 's'} waiting!`
                : '🚀 Your demo is ready — go live now!'}
            </p>
            <p className="text-blue-100 text-sm mt-0.5">
              Remove the demo banner and make your site fully live. Just ₹299/month.
            </p>
          </div>
          <Link
            href="/dashboard/subscription"
            className="shrink-0 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Upgrade → ₹299/mo
          </Link>
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-2xl p-6 border ${isLive ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 text-sm font-semibold mb-2 ${isLive ? 'text-green-700' : 'text-yellow-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {isLive ? 'Your site is LIVE' : 'Demo Mode'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{clinic.clinic_name}</h2>
            <p className="text-sm text-gray-600 mt-1">Dr. {clinic.doctor_name} · {clinic.area}, {clinic.city}</p>
            {!isLive && (
              <p className="text-xs text-yellow-700 mt-2">
                Upgrade to go live and remove the demo banner from your site.
              </p>
            )}
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            View Site ↗
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/website', icon: '🎨', title: 'Change Theme', desc: 'Pick a look for your site' },
          { href: '/dashboard/content', icon: '📝', title: 'Edit Content', desc: 'Update services & info' },
          { href: '/dashboard/analytics', icon: '📊', title: 'View Stats', desc: 'Visits & WhatsApp clicks' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">{card.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Clinic details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinic Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Clinic Name', value: clinic.clinic_name },
            { label: 'Doctor', value: `Dr. ${clinic.doctor_name}` },
            { label: 'Phone', value: clinic.phone },
            { label: 'Email', value: clinic.email ?? '—' },
            { label: 'Location', value: `${clinic.area}, ${clinic.city}` },
            { label: 'Site URL', value: `/${clinic.subdomain}` },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-gray-400 text-xs">{row.label}</p>
              <p className="text-gray-900 font-medium mt-0.5">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
