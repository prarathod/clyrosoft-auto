'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  cities: string[]
  areas:  string[]
  total:  number
}

export default function LeadsFilters({ cities, areas, total }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const city   = searchParams.get('city')   ?? ''
  const area   = searchParams.get('area')   ?? ''
  const status = searchParams.get('status') ?? ''
  const search = searchParams.get('q')      ?? ''

  // Single update — avoids double-push race condition
  const setParam = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else        params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const clearAll = () => router.push(pathname)
  const hasFilter = city || area || status || search

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">{total.toLocaleString()} leads</p>
        {hasFilter && (
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            ✕ Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="sm:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Search clinic / doctor</label>
          <input
            type="text"
            defaultValue={search}
            placeholder="Type to search…"
            onKeyDown={(e) => { if (e.key === 'Enter') setParam({ q: (e.target as HTMLInputElement).value }) }}
            onBlur={(e) => setParam({ q: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setParam({ status: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <optgroup label="Contact status">
              <option value="new">New (not contacted)</option>
              <option value="contacted">Contacted</option>
              <option value="demo">Has Demo</option>
              <option value="wa_invalid">WA Invalid</option>
            </optgroup>
            <optgroup label="Lead status">
              <option value="lead_interested">Interested</option>
              <option value="lead_callback">Callback</option>
              <option value="lead_not_interested">Not Interested</option>
              <option value="lead_paid">Paid</option>
            </optgroup>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">City</label>
          <select
            value={city}
            onChange={(e) => setParam({ city: e.target.value, area: '' })}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Area</label>
          <select
            value={area}
            onChange={(e) => setParam({ area: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex flex-wrap gap-2">
          {search && <Chip label={`"${search}"`}  onRemove={() => setParam({ q: '' })}      />}
          {status && <Chip label={status}          onRemove={() => setParam({ status: '' })} />}
          {city   && <Chip label={city}            onRemove={() => setParam({ city: '', area: '' })} />}
          {area   && <Chip label={area}            onRemove={() => setParam({ area: '' })}   />}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-900/50 text-blue-300 text-xs px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-white ml-0.5">✕</button>
    </span>
  )
}
