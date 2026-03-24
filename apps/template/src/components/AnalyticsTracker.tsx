'use client'

import { useEffect } from 'react'

interface Props {
  subdomain: string
  page?: string
}

export default function AnalyticsTracker({ subdomain, page }: Props) {
  useEffect(() => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subdomain,
        event_type: 'page_view',
        page: page ?? window.location.pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
