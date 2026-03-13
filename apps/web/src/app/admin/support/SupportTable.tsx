'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface SupportMessage {
  id: string
  subdomain: string
  clinic_name: string
  phone: string | null
  message: string
  created_at: string
  replied: boolean
}

export default function SupportTable({ messages }: { messages: SupportMessage[] }) {
  const router = useRouter()

  async function markReplied(id: string) {
    const supabase = createClient()
    await supabase.from('support_messages').update({ replied: true }).eq('id', id)
    router.refresh()
  }

  if (messages.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400 text-sm">No support messages yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`bg-gray-900 border rounded-xl p-5 ${msg.replied ? 'border-gray-800 opacity-60' : 'border-blue-900'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white text-sm">{msg.clinic_name}</span>
                <span className="text-gray-600 text-xs font-mono">{msg.subdomain}</span>
                {!msg.replied && <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">New</span>}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">{msg.message}</p>
              <p className="text-gray-600 text-xs">
                {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {msg.phone && (
                <a
                  href={`https://wa.me/91${msg.phone}?text=${encodeURIComponent(`Hi, this is Cliniqo support. Regarding your message: "${msg.message.slice(0, 50)}..."`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markReplied(msg.id)}
                  className="text-xs bg-green-900 hover:bg-green-800 text-green-400 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  💬 Reply on WA
                </a>
              )}
              {!msg.replied && (
                <button
                  onClick={() => markReplied(msg.id)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ✓ Mark Replied
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
