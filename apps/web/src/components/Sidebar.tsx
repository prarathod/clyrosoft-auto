'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',              icon: '🏠', label: 'Overview'      },
  { href: '/dashboard/website',      icon: '🎨', label: 'Website'       },
  { href: '/dashboard/appointments', icon: '📅', label: 'Appointments'  },
  { href: '/dashboard/patients',     icon: '🏥', label: 'Patients'      },
  { href: '/dashboard/staff',        icon: '👥', label: 'Staff'         },
  { href: '/dashboard/inventory',    icon: '📦', label: 'Inventory'     },
  { href: '/dashboard/analytics',    icon: '📊', label: 'Analytics'     },
  { href: '/dashboard/domain',       icon: '🌐', label: 'Domain'        },
  { href: '/dashboard/subscription', icon: '💳', label: 'Subscription'  },
  { href: '/dashboard/support',      icon: '💬', label: 'Support'       },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="font-bold text-gray-900 text-sm">ClinicSaaS</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
