import Link from 'next/link'
import type { Client, ProfessionConfig } from '@/types/database'

interface Props { clinic: Client; config: ProfessionConfig }

function SocialIcon({ type }: { type: string }) {
  if (type === 'instagram') return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (type === 'facebook') return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
  if (type === 'google') return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
    </svg>
  )
  if (type === 'youtube') return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
  return null
}

export default function Footer({ clinic, config }: Props) {
  const base   = `/${clinic.subdomain}`
  const year   = new Date().getFullYear()
  const hours  = clinic.opening_hours ?? []
  const social = clinic.social_links ?? {}
  const hasSocial = Object.values(social).some(Boolean)

  return (
    <footer className="pt-12 pb-6 px-4" style={{ backgroundColor: 'var(--footer-bg)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

        {/* Col 1: Clinic info */}
        <div className="md:col-span-1">
          <p className="font-bold text-lg mb-1" style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
            {clinic.clinic_name}
          </p>
          <p className="text-sm mb-3" style={{ color: 'var(--footer-text)' }}>Dr. {clinic.doctor_name}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--footer-text)' }}>
            {config.display_name} providing quality care in {clinic.area && clinic.area !== clinic.city ? `${clinic.area}, ` : ''}{clinic.city}.
          </p>
          {/* Social icons */}
          {hasSocial && (
            <div className="flex gap-3 mt-2">
              {([
                ['instagram', social.instagram],
                ['facebook',  social.facebook],
                ['google',    social.google],
                ['youtube',   social.youtube],
              ] as [string, string | undefined][]).filter(([, url]) => url).map(([type, url]) => (
                <a key={type} href={url} target="_blank" rel="noopener noreferrer"
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--footer-text)' }}>
                  <SocialIcon type={type} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Quick links */}
        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>
            Quick Links
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { href: base,               label: 'Home' },
              { href: `${base}/services`, label: 'Services' },
              { href: `${base}/about`,    label: 'About Us' },
              { href: `${base}/contact`,  label: 'Contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-opacity hover:opacity-100 opacity-60"
                  style={{ color: 'var(--footer-text)' }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>
            Contact
          </p>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--footer-text)' }}>
            <li>📍 {clinic.area && clinic.area !== clinic.city ? `${clinic.area}, ` : ''}{clinic.city}</li>
            <li>
              <a href={`tel:+91${clinic.phone}`} className="hover:opacity-100 opacity-70 transition-opacity">
                📞 +91 {clinic.phone}
              </a>
            </li>
            {clinic.email && (
              <li>
                <a href={`mailto:${clinic.email}`} className="hover:opacity-100 opacity-70 transition-opacity">
                  ✉️ {clinic.email}
                </a>
              </li>
            )}
            <li>
              <a href={`https://wa.me/91${clinic.phone}?text=${encodeURIComponent(`Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`)}`}
                target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                WhatsApp Us
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Opening hours */}
        {hours.length > 0 && (
          <div>
            <p className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>
              Opening Hours
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--footer-text)' }}>
              {hours.map((h, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="opacity-70">{h.label}</span>
                  <span className="font-medium opacity-90">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t pt-6 text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--footer-text)' }}>
        © {year} {clinic.clinic_name}. All rights reserved.
      </div>
    </footer>
  )
}
