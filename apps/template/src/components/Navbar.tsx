'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Client, ProfessionConfig } from '@/types/database'
import type { Theme } from '@/styles/themes'

interface Props {
  clinic: Client
  config: ProfessionConfig
  theme: Theme
}

export default function Navbar({ clinic, config, theme }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const base = `/${clinic.subdomain}`
  const links = [
    { href: base, label: 'Home' },
    { href: `${base}/services`, label: 'Services' },
    { href: `${base}/about`, label: 'About' },
    { href: `${base}/contact`, label: 'Contact' },
  ]
  const waUrl = `https://wa.me/91${clinic.phone}?text=${encodeURIComponent(
    `Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`
  )}`
  // For modern dark theme, navbar should be dark too
  const isLight = theme.key !== 'modern'

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href={base}
          className="font-bold text-lg leading-tight"
          style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
        >
          {clinic.clinic_name}
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--text)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:+91${clinic.phone}`}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            📞 {clinic.phone}
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm px-5 py-2 font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            Book Now
          </a>
        </div>

        <button
          className="md:hidden p-2 rounded-md transition-opacity hover:opacity-70"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{ color: 'var(--text)' }}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-1"
              style={{ color: 'var(--text)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ borderColor: 'var(--card-border)' }} />
          <a href={`tel:+91${clinic.phone}`} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            📞 {clinic.phone}
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm px-5 py-2.5 font-semibold text-center"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
          >
            Book Now
          </a>
        </div>
      )}
    </nav>
  )
}
