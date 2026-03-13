'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  clinicName: string
  status: string
}

export default function TopBar({ clinicName, status }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-gray-900 text-sm">{clinicName}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          status === 'paying'
            ? 'bg-green-100 text-green-700'
            : status === 'demo'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {status === 'paying' ? '● LIVE' : status === 'demo' ? '◌ Demo' : 'Inactive'}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Sign out
      </button>
    </header>
  )
}
