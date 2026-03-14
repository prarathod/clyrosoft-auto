'use client'

import { useState, useEffect, useCallback } from 'react'

interface Props {
  photos: string[]
  clinicName: string
}

export default function GallerySection({ photos, clinicName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Close on Escape, navigate with arrow keys
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') setLightboxIndex(null)
    if (e.key === 'ArrowRight') setLightboxIndex((i) => (i! + 1) % photos.length)
    if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i! - 1 + photos.length) % photos.length)
  }, [lightboxIndex, photos.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  if (!photos || photos.length === 0) return null

  const [featured, ...rest] = photos

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--section-alt)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--primary)' }}>
              Gallery
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
            >
              Inside Our Clinic
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              A glimpse into {clinicName}
            </p>
          </div>
          <span
            className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
          >
            {photos.length} photos
          </span>
        </div>

        {/* Layout: 1 featured + grid */}
        {photos.length === 1 ? (
          // Single photo — full width
          <button
            onClick={() => setLightboxIndex(0)}
            className="relative w-full overflow-hidden group"
            style={{ borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}
          >
            <img
              src={featured}
              alt={clinicName}
              className="w-full h-80 md:h-[480px] object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
              <ZoomIcon />
            </div>
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Featured large photo */}
            <button
              onClick={() => setLightboxIndex(0)}
              className="relative overflow-hidden group md:row-span-2"
              style={{ borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}
            >
              <img
                src={featured}
                alt={`${clinicName} — featured`}
                className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ZoomIcon />
              </div>
              <span
                className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                Featured
              </span>
            </button>

            {/* Rest of photos */}
            {rest.slice(0, 4).map((src, i) => {
              const isLast = i === 3 && photos.length > 5
              return (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="relative overflow-hidden group aspect-video"
                  style={{ borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}
                >
                  <img
                    src={src}
                    alt={`${clinicName} photo ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    {!isLast && <ZoomIcon />}
                  </div>
                  {/* "View all" overlay on last visible */}
                  {isLast && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="text-white text-2xl font-black">+{photos.length - 4}</span>
                      <span className="text-white/80 text-xs mt-1">View all photos</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Thumbnail strip (if more than 5 photos) */}
        {photos.length > 5 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="flex-shrink-0 w-16 h-16 overflow-hidden transition-opacity hover:opacity-80"
                style={{
                  borderRadius: 'calc(var(--radius) * 0.5)',
                  border: '2px solid var(--card-border)',
                  opacity: lightboxIndex === i ? 1 : 0.7,
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xl z-10"
            onClick={() => setLightboxIndex(null)}
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length) }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightboxIndex]}
            alt={`${clinicName} — ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button
              className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length) }}
            >
              ›
            </button>
          )}

          {/* Thumbnail strip in lightbox */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2">
              {photos.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg transition-all"
                  style={{
                    border: i === lightboxIndex ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
                    opacity: i === lightboxIndex ? 1 : 0.5,
                  }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ZoomIcon() {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    </div>
  )
}
