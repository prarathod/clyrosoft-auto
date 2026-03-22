'use client'

import { useRouter } from 'next/navigation'

export default function SalesLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/sales/logout', { method: 'POST' })
    router.push('/sales/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
    >
      Sign out
    </button>
  )
}
