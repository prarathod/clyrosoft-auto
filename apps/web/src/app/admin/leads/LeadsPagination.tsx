'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  page:      number
  totalPages: number
}

export default function LeadsPagination({ page, totalPages }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  // Build page number range: always show first, last, current ±1
  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i)
  const pageList = [...pages].sort((a, b) => a - b)

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-gray-500 text-xs">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        {pageList.map((p, i) => {
          const prev = pageList[i - 1]
          const showEllipsis = prev !== undefined && p - prev > 1
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="text-gray-600 text-xs px-1">…</span>}
              <button
                onClick={() => goTo(p)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
