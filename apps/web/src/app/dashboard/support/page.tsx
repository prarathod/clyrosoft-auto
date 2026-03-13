'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const ADMIN_WA = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '919999999999'

const QUICK = [
  'I need help with my website',
  'I want to upgrade my plan',
  'I have a billing question',
  'I want to change my clinic info',
]

export default function SupportPage() {
  const [message, setMessage] = useState('')
  const [clinicData, setClinicData] = useState<{ subdomain: string; clinic_name: string; phone: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('clients').select('subdomain, clinic_name, phone').eq('email', session.user.email!).single().then(({ data }) => {
        if (data) setClinicData(data)
      })
    })
  }, [])

  async function sendWa(msg: string) {
    if (clinicData) {
      const supabase = createClient()
      await supabase.from('support_messages').insert({
        subdomain: clinicData.subdomain,
        clinic_name: clinicData.clinic_name,
        phone: clinicData.phone,
        message: msg,
      }).then(() => {})
    }
    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Support</h2>
        <p className="text-sm text-gray-500">We typically respond within 2 hours on WhatsApp.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Messages</h3>
        <div className="space-y-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => sendWa(q)}
              className="w-full text-left text-sm px-4 py-3 bg-gray-50 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-colors flex items-center gap-3"
            >
              <span>💬</span> {q}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Custom Message</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe your issue or question..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
        />
        <button
          onClick={() => sendWa(message)}
          disabled={!message.trim()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-40 transition-colors"
        >
          Send on WhatsApp
        </button>
      </div>
    </div>
  )
}
