'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  cities: string[]
  areas:  string[]
  total:  number
}

export default function LeadsFilters({ cities, areas, total }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const city   = searchParams.get('city')   ?? ''
  const area   = searchParams.get('area')   ?? ''
  const status = searchParams.get('status') ?? ''
  const search = searchParams.get('q')      ?? ''

  const set = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else        params.delete(key)
    params.delete('page') // reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const clearAll = () => router.push(pathname)

  const hasFilter = city || area || status || search

  // Filter areas by selected city (client-side — areas are already scoped by city if needed)
  const filteredAreas = city
    ? areas // ideally we'd scope to city, but areas are pre-fetched for the full dataset
    : areas

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">{total.toLocaleString()} leads</p>
        {hasFilter && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
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
            onKeyDown={(e) => { if (e.key === 'Enter') set('q', (e.target as HTMLInputElement).value) }}
            onBlur={(e) => set('q', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="demo">Has Demo</option>
            <option value="wa_invalid">WA Invalid</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">City</label>
          <select
            value={city}
            onChange={(e) => { set('city', e.target.value); set('area', '') }}
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
            onChange={(e) => set('area', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All areas</option>
            {filteredAreas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex flex-wrap gap-2">
          {search  && <Chip label={`"${search}"`}  onRemove={() => set('q', '')}      />}
          {status  && <Chip label={status}          onRemove={() => set('status', '')} />}
          {city    && <Chip label={city}            onRemove={() => { set('city', ''); set('area', '') }} />}
          {area    && <Chip label={area}            onRemove={() => set('area', '')}   />}
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
