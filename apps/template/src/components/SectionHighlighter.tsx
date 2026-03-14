'use client'

import { useEffect } from 'react'

/**
 * Listens for postMessage from the Cliniqo dashboard.
 * When { type: 'HIGHLIGHT_SECTION', section: 'hero' } is received:
 *   1. Scrolls smoothly to the section
 *   2. Flashes a yellow outline for 1.2s
 */
export default function SectionHighlighter() {
  useEffect(() => {
    function handler(event: MessageEvent) {
      if (event.data?.type !== 'HIGHLIGHT_SECTION') return
      const sectionId: string = event.data.section
      const el = document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement | null
      if (!el) return

      // Scroll into view
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // Remove class first (in case it's already active) then re-add
      el.classList.remove('section-highlight')
      // Force reflow so the animation restarts
      void el.offsetWidth
      el.classList.add('section-highlight')

      // Clean up after animation
      setTimeout(() => el.classList.remove('section-highlight'), 1400)
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return null
}
