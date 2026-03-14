'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  subdomain: string
  refreshKey: number
  highlightSection?: string  // section id to scroll+highlight via postMessage
}

const TEMPLATE_URL = process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'http://localhost:3001'

type Device = 'mobile' | 'tablet' | 'desktop'

const DEVICES: { key: Device; label: string; icon: string; width: string }[] = [
  { key: 'mobile',  label: 'Mobile',  icon: '📱', width: '375px' },
  { key: 'tablet',  label: 'Tablet',  icon: '⬜', width: '768px' },
  { key: 'desktop', label: 'Desktop', icon: '🖥',  width: '100%' },
]

export default function PreviewPane({ subdomain, refreshKey, highlightSection }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const url = `${TEMPLATE_URL}/${subdomain}`

  useEffect(() => {
    if (iframeRef.current && refreshKey > 0) {
      iframeRef.current.src = url
    }
  }, [refreshKey, url])

  // Send highlight message to iframe when activeSection changes
  useEffect(() => {
    if (!highlightSection) return
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage(
      { type: 'HIGHLIGHT_SECTION', section: highlightSection },
      '*'
    )
  }, [highlightSection])

  const selected = DEVICES.find((d) => d.key === device)!

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="bg-gray-100 border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1">
        {/* Browser chrome: dots + URL + device switcher */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-200 border-b border-gray-300">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 font-mono truncate border border-gray-300">
            {url}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex-shrink-0"
            title="Open in new tab"
          >
            ↗
          </a>
          {/* Device switcher */}
          <div className="flex gap-0.5 bg-gray-300 rounded-lg p-0.5 flex-shrink-0">
            {DEVICES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                title={d.label}
                className={`px-2 py-1 rounded-md text-sm transition-colors ${
                  device === d.key
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {d.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport container — centers iframe at device width */}
        <div className="flex-1 overflow-auto bg-gray-300 flex justify-center">
          <div
            className="relative bg-white h-full transition-all duration-300"
            style={{ width: selected.width, minWidth: selected.width, maxWidth: selected.width }}
          >
            <iframe
              ref={iframeRef}
              src={url}
              title="Clinic preview"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet (768px)' : 'Mobile (375px)'} · Preview refreshes after you save
      </p>
    </div>
  )
}
