'use client'

import { useState } from 'react'

interface Props {
  photos: string[]
  clinicName: string
}

export default function GallerySection({ photos, clinicName }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!photos || photos.length === 0) return null

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
        >
          Our Clinic
        </h2>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          A look inside {clinicName}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(src)}
              className="relative overflow-hidden rounded-xl aspect-video group"
              style={{ border: '1px solid var(--card-border)' }}
            >
              <img
                src={src}
                alt={`${clinicName} photo ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt="Clinic photo"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            referrerPolicy="no-referrer"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  )
}
