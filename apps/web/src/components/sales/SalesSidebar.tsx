'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/sales',        icon: '🏠', label: 'Dashboard'  },
  { href: '/sales/leads',  icon: '📋', label: 'My Leads'   },
  { href: '/sales/stats',  icon: '💰', label: 'My Earnings' },
]

export default function SalesSidebar({ employeeName }: { employeeName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/sales/logout', { method: 'POST' })
    router.push('/sales/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 bg-gray-950 border-r border-gray-800 flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-white text-sm">Sales Portal</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Hi, {employeeName} 👋</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex z-50">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${active ? 'text-emerald-400' : 'text-gray-500'}`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
