'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  subdomain:       string
  siteUrl?:        string   // override the URL shown/used in the iframe (paid vs demo)
  refreshKey:      number
  highlightSection?: string
  liveTheme?:      string   // instantly reflected via postMessage (no save needed)
  autoSaving?:     boolean  // shows a subtle "Saving…" badge
}

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3001'

type Device = 'mobile' | 'tablet' | 'desktop'
const DEVICES: { key: Device; label: string; icon: string; width: string }[] = [
  { key: 'mobile',  label: 'Mobile',  icon: '📱', width: '375px' },
  { key: 'tablet',  label: 'Tablet',  icon: '⬜', width: '768px' },
  { key: 'desktop', label: 'Desktop', icon: '🖥',  width: '100%'  },
]

export default function PreviewPane({ subdomain, siteUrl, refreshKey, highlightSection, liveTheme, autoSaving }: Props) {
  const iframeRef   = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const url = siteUrl ?? `${TEMPLATE_URL}/${subdomain}`

  // Hard-reload the iframe when refreshKey bumps (after content auto-save)
  useEffect(() => {
    if (iframeRef.current && refreshKey > 0) {
      iframeRef.current.src = url
    }
  }, [refreshKey, url])

  // ── INSTANT theme preview via postMessage ──────────────────────────────────
  // Wait for the iframe to be ready before posting; retry until ACK or 3s
  const sentThemeRef = useRef<string | null>(null)
  useEffect(() => {
    if (!liveTheme || liveTheme === sentThemeRef.current) return
    sentThemeRef.current = liveTheme

    function post() {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PREVIEW_THEME', theme: liveTheme }, '*'
      )
    }

    // Post immediately in case the iframe is already loaded
    post()

    // Also re-post after 300ms in case the iframe was still loading
    const t = setTimeout(post, 300)
    return () => clearTimeout(t)
  }, [liveTheme])

  // Section highlight
  useEffect(() => {
    if (!highlightSection) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'HIGHLIGHT_SECTION', section: highlightSection }, '*'
    )
  }, [highlightSection])

  const selected = DEVICES.find((d) => d.key === device)!

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between mb-0.5 px-0.5">
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
              Saving…
            </span>
          )}
          <button
            onClick={() => { if (iframeRef.current) iframeRef.current.src = url }}
            className="text-xs text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-200 border-b border-gray-300">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 font-mono truncate border border-gray-300">
            {url}
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-shrink-0" title="Open in new tab">↗</a>
          <div className="flex gap-0.5 bg-gray-300 rounded-lg p-0.5 flex-shrink-0">
            {DEVICES.map((d) => (
              <button key={d.key} onClick={() => setDevice(d.key)} title={d.label}
                className={`px-2 py-1 rounded-md text-sm transition-colors ${device === d.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {d.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-auto bg-gray-300 flex justify-center">
          <div className="relative bg-white h-full transition-all duration-300"
            style={{ width: selected.width, minWidth: selected.width, maxWidth: selected.width }}>
            <iframe ref={iframeRef} src={url} title="Clinic preview"
              className="w-full h-full border-0" style={{ minHeight: '600px' }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Theme changes are <strong>instant</strong> · Content auto-saves after 1.5s
      </p>
    </div>
  )
}
