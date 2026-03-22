'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin',                icon: '🏠', label: 'Overview'        },
  { href: '/admin/leads',          icon: '📋', label: 'Leads'           },
  { href: '/admin/clients',        icon: '🏥', label: 'Clients'         },
  { href: '/admin/outreach',       icon: '📤', label: 'Outreach'        },
  { href: '/admin/demo-generator', icon: '⚡', label: 'Demo Generator'  },
  { href: '/admin/analytics',      icon: '📊', label: 'Analytics'       },
  { href: '/admin/support',        icon: '💬', label: 'Support'         },
  { href: '/admin/team',           icon: '👤', label: 'Team'            },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 bg-gray-950 border-r border-gray-800 flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-white text-sm">Cliniqo Admin</span>
          </div>
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
                    ? 'bg-blue-600 text-white'
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
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${active ? 'text-blue-400' : 'text-gray-500'}`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="hidden sm:block">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
