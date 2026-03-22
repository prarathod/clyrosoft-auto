import Link from 'next/link'
import SalesLogoutButton from './SalesLogoutButton'

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const name = process.env.SALES_NAME ?? 'Sales'

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Cliniqo</p>
          <p className="text-white font-bold mt-0.5">{name}</p>
          <p className="text-gray-500 text-xs">Sales Rep</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/sales',       label: 'Dashboard', icon: '📊' },
            { href: '/sales/leads', label: 'Leads',     icon: '📋' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <SalesLogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
          <div>
            <p className="text-white font-bold text-sm">{name} · Sales Portal</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/sales" className="text-gray-400 hover:text-white">Home</Link>
            <Link href="/sales/leads" className="text-gray-400 hover:text-white">Leads</Link>
            <SalesLogoutButton />
          </div>
        </div>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
