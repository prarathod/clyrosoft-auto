import Link from 'next/link'
import type { Client, ProfessionConfig } from '@/types/database'

interface Props {
  clinic: Client
  config: ProfessionConfig
}

export default function Footer({ clinic, config }: Props) {
  const base = `/${clinic.subdomain}`
  const year = new Date().getFullYear()
  return (
    <footer className="pt-12 pb-6 px-4" style={{ backgroundColor: 'var(--footer-bg)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <p
            className="font-bold text-lg mb-1"
            style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
          >
            {clinic.clinic_name}
          </p>
          <p className="text-sm mb-3" style={{ color: 'var(--footer-text)' }}>
            Dr. {clinic.doctor_name}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--footer-text)' }}>
            {config.display_name} providing quality care in {clinic.area && clinic.area !== clinic.city ? `${clinic.area}, ` : ''}{clinic.city}.
          </p>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>
            Quick Links
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { href: base, label: 'Home' },
              { href: `${base}/services`, label: 'Services' },
              { href: `${base}/about`, label: 'About Us' },
              { href: `${base}/contact`, label: 'Contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-opacity hover:opacity-100 opacity-70"
                  style={{ color: 'var(--footer-text)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

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
              <a
                href={`https://wa.me/91${clinic.phone}?text=${encodeURIComponent(
                  `Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                WhatsApp Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="border-t pt-6 text-center text-xs"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--footer-text)' }}
      >
        © {year} {clinic.clinic_name}. All rights reserved.
      </div>
    </footer>
  )
}
