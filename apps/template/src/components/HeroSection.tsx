'use client'

import type { Client, ProfessionConfig, ClinicStat } from '@/types/database'
import type { Theme } from '@/styles/themes'
import { useTheme } from './ThemeProvider'

interface Props {
  clinic: Client
  config: ProfessionConfig
  theme: Theme
}

function waUrl(phone: string, doctorName: string) {
  return `https://wa.me/91${phone}?text=${encodeURIComponent(
    `Hi Dr. ${doctorName}, I would like to book an appointment.`
  )}`
}

function WaIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

const DEFAULT_STATS: ClinicStat[] = [
  { label: 'Years Experience', value: '10+' },
  { label: 'Happy Patients',   value: '5K+' },
  { label: 'Average Rating',   value: '4.8★' },
]

function StatsRow({ stats, light = false }: { stats: ClinicStat[]; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-6 mt-8">
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <p
            className="text-2xl font-black"
            style={{ color: light ? '#FFFFFF' : 'var(--primary)' }}
          >
            {s.value}
          </p>
          <p className="text-xs mt-0.5" style={{ color: light ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

function locationStr(clinic: Client) {
  return clinic.area && clinic.area !== clinic.city
    ? `${clinic.area}, ${clinic.city}`
    : clinic.city
}

// ── 1: Classic ────────────────────────────────────────────────────────────────
function HeroClassic({ clinic, config }: Omit<Props, 'theme'>) {
  const url  = waUrl(clinic.phone, clinic.doctor_name)
  const stats = clinic.stats?.length ? clinic.stats : DEFAULT_STATS
  return (
    <section className="relative overflow-hidden py-28 px-4" style={{ background: 'var(--hero-bg)' }}>
      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center" style={{ color: 'var(--hero-text)' }}>
        <span
          className="reveal inline-block text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 font-semibold"
          style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--hero-text)' }}
        >
          {config.display_name} · {locationStr(clinic)}
        </span>
        <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          {clinic.clinic_name}
        </h1>
        <p className="reveal reveal-delay-2 text-xl mb-2" style={{ color: 'var(--hero-subtext)' }}>
          Dr. {clinic.doctor_name}
        </p>
        <p className="reveal reveal-delay-2 text-2xl font-light italic mb-10 mt-4" style={{ color: 'var(--hero-subtext)', fontFamily: 'var(--font-heading)' }}>
          &ldquo;{clinic.tagline || config.hero_tagline}&rdquo;
        </p>
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            style={{ color: 'var(--primary)' }}>
            <WaIcon /> Book Appointment
          </a>
          <a href={`tel:+91${clinic.phone}`}
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full text-lg transition-all border"
            style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--hero-text)', borderColor: 'rgba(255,255,255,0.3)' }}>
            📞 Call Us
          </a>
        </div>
        <div className="reveal reveal-delay-4 flex justify-center">
          <StatsRow stats={stats} light />
        </div>
      </div>
    </section>
  )
}

// ── 2: Modern ─────────────────────────────────────────────────────────────────
function HeroModern({ clinic, config }: Omit<Props, 'theme'>) {
  const url   = waUrl(clinic.phone, clinic.doctor_name)
  const stats = clinic.stats?.length ? clinic.stats : DEFAULT_STATS
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center px-4 py-20" style={{ background: 'var(--hero-bg)' }}>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }} />
      <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div style={{ color: 'var(--hero-text)' }}>
          <span className="reveal inline-block text-xs uppercase tracking-[0.3em] px-3 py-1 rounded mb-6 font-semibold"
            style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--primary)' }}>
            {config.display_name}
          </span>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl font-black leading-none mb-4 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {clinic.clinic_name}
          </h1>
          <p className="reveal reveal-delay-2 text-lg font-medium mb-1" style={{ color: 'var(--primary)' }}>
            Dr. {clinic.doctor_name}
          </p>
          <p className="reveal reveal-delay-2 mb-2 text-sm" style={{ color: 'var(--hero-subtext)' }}>
            {locationStr(clinic)}
          </p>
          <p className="reveal reveal-delay-2 text-xl mb-8 mt-4 font-light" style={{ color: 'var(--hero-subtext)' }}>
            {clinic.tagline || config.hero_tagline}
          </p>
          <div className="reveal reveal-delay-3 flex flex-wrap gap-4">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full text-base shadow-lg hover:opacity-90 transition-opacity text-white"
              style={{ backgroundColor: 'var(--primary)' }}>
              <WaIcon /> Book Now
            </a>
            <a href={`tel:+91${clinic.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold border transition-all"
              style={{ borderColor: 'var(--card-border)', color: 'var(--hero-text)', backgroundColor: 'var(--hero-accent)' }}>
              📞 {clinic.phone}
            </a>
          </div>
          <div className="reveal reveal-delay-4">
            <StatsRow stats={stats} light />
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          {clinic.photos?.[0] ? (
            <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid var(--card-border)' }}>
              <img src={clinic.photos[0]} alt={clinic.clinic_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-72 h-72 rounded-full flex items-center justify-center text-8xl shadow-2xl"
              style={{ backgroundColor: 'var(--hero-accent)', border: '1px solid var(--card-border)' }}>
              🏥
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── 3: Minimal ────────────────────────────────────────────────────────────────
function HeroMinimal({ clinic, config }: Omit<Props, 'theme'>) {
  const url = waUrl(clinic.phone, clinic.doctor_name)
  return (
    <section className="px-4 py-28" style={{ backgroundColor: 'var(--hero-bg)', borderBottom: '1px solid var(--card-border)' }}>
      <div className="max-w-4xl mx-auto">
        <p className="reveal text-xs uppercase tracking-[0.4em] mb-6" style={{ color: 'var(--text-muted)' }}>
          {config.display_name} · {locationStr(clinic)}
        </p>
        <h1 className="reveal reveal-delay-1 text-6xl md:text-8xl font-black leading-none mb-6 tracking-tight"
          style={{ color: 'var(--hero-text)', fontFamily: 'var(--font-heading)' }}>
          {clinic.clinic_name}
        </h1>
        <div className="reveal reveal-delay-2 w-16 h-0.5 mb-6" style={{ backgroundColor: 'var(--primary)' }} />
        <p className="reveal reveal-delay-2 text-2xl font-light mb-2" style={{ color: 'var(--hero-text)' }}>
          Dr. {clinic.doctor_name}
        </p>
        <p className="reveal reveal-delay-2 mb-10 text-lg" style={{ color: 'var(--hero-subtext)' }}>
          {clinic.tagline || config.hero_tagline}
        </p>
        <div className="reveal reveal-delay-3 flex flex-wrap gap-4">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 text-sm tracking-wide transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}>
            <WaIcon /> Book via WhatsApp
          </a>
          <a href={`tel:+91${clinic.phone}`}
            className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm tracking-wide border transition-all hover:opacity-80"
            style={{ color: 'var(--text)', borderColor: 'var(--card-border)', borderRadius: 'var(--radius)' }}>
            📞 {clinic.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

// ── 4: Vitality ───────────────────────────────────────────────────────────────
function HeroVitality({ clinic, config }: Omit<Props, 'theme'>) {
  const url   = waUrl(clinic.phone, clinic.doctor_name)
  const stats = clinic.stats?.length ? clinic.stats : DEFAULT_STATS
  return (
    <section className="px-4 py-16 md:py-24" style={{ backgroundColor: 'var(--hero-bg)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="reveal inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--primary)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
            {config.display_name} · {clinic.area}
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl md:text-6xl font-extrabold leading-tight mb-4"
            style={{ color: 'var(--hero-text)', fontFamily: 'var(--font-heading)' }}>
            {clinic.clinic_name}
          </h1>
          <p className="reveal reveal-delay-2 text-lg font-semibold mb-1" style={{ color: 'var(--primary)' }}>
            Dr. {clinic.doctor_name}
          </p>
          <p className="reveal reveal-delay-2 text-base mb-8" style={{ color: 'var(--hero-subtext)' }}>
            {clinic.tagline || config.hero_tagline}
          </p>
          <div className="reveal reveal-delay-3 grid grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'var(--hero-accent)', border: '1px solid var(--card-border)' }}>
                <p className="text-xl font-black" style={{ color: 'var(--primary)' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--hero-subtext)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="reveal reveal-delay-4 flex flex-wrap gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm"
              style={{ backgroundColor: 'var(--primary)' }}>
              <WaIcon /> Book Appointment
            </a>
            <a href={`tel:+91${clinic.phone}`}
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border transition-all"
              style={{ color: 'var(--text)', borderColor: 'var(--card-border)' }}>
              📞 {clinic.phone}
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          {clinic.photos?.[0] ? (
            <div className="rounded-3xl overflow-hidden shadow-2xl h-[420px]" style={{ border: '3px solid var(--hero-accent)' }}>
              <img src={clinic.photos[0]} alt={clinic.clinic_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="rounded-3xl h-[420px] flex flex-col items-center justify-center gap-4"
              style={{ backgroundColor: 'var(--hero-accent)', border: '2px dashed var(--card-border)' }}>
              <span className="text-7xl">🏥</span>
              <p className="font-semibold text-lg" style={{ color: 'var(--primary)' }}>{config.display_name}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── 5: Elegant ────────────────────────────────────────────────────────────────
function HeroElegant({ clinic, config }: Omit<Props, 'theme'>) {
  const url = waUrl(clinic.phone, clinic.doctor_name)
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4 py-24"
      style={{ background: 'var(--hero-bg)' }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--hero-accent) 1px, transparent 1px), linear-gradient(90deg, var(--hero-accent) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      <div className="reveal w-16 h-px mb-10" style={{ backgroundColor: 'var(--primary)' }} />
      <div className="relative max-w-3xl mx-auto text-center" style={{ color: 'var(--hero-text)' }}>
        <div className="reveal reveal-delay-1 inline-block text-xs uppercase tracking-[0.35em] px-6 py-2 mb-8 font-semibold"
          style={{ color: 'var(--primary)', border: '1px solid var(--primary)', backgroundColor: 'rgba(180,83,9,0.12)' }}>
          {config.display_name} · Est. {new Date().getFullYear()}
        </div>
        <h1 className="reveal reveal-delay-2 text-5xl md:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--hero-text)' }}>
          {clinic.clinic_name}
        </h1>
        <div className="reveal reveal-delay-2 w-24 h-px mx-auto mb-6" style={{ backgroundColor: 'var(--primary)' }} />
        <p className="reveal reveal-delay-3 text-sm font-light tracking-widest uppercase mb-2" style={{ color: 'var(--primary)' }}>
          Dr. {clinic.doctor_name}
        </p>
        <p className="reveal reveal-delay-3 text-sm mb-2" style={{ color: 'var(--hero-subtext)' }}>{locationStr(clinic)}</p>
        <p className="reveal reveal-delay-3 text-xl italic font-light mt-4 mb-12"
          style={{ color: 'var(--hero-subtext)', fontFamily: 'var(--font-heading)' }}>
          &ldquo;{clinic.tagline || config.hero_tagline}&rdquo;
        </p>
        <div className="reveal reveal-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold px-10 py-4 text-sm uppercase tracking-widest transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--primary)', color: '#FEF3C7', borderRadius: '0' }}>
            <WaIcon /> Book Consultation
          </a>
          <a href={`tel:+91${clinic.phone}`}
            className="inline-flex items-center justify-center gap-2 font-semibold px-10 py-4 text-sm uppercase tracking-widest border transition-all hover:opacity-80"
            style={{ color: 'var(--hero-text)', borderColor: 'var(--primary)', backgroundColor: 'transparent', borderRadius: '0' }}>
            📞 Call Now
          </a>
        </div>
      </div>
      <div className="reveal w-16 h-px mt-10" style={{ backgroundColor: 'var(--primary)' }} />
    </section>
  )
}

// ── 6: Warm ───────────────────────────────────────────────────────────────────
function HeroWarm({ clinic, config }: Omit<Props, 'theme'>) {
  const url = waUrl(clinic.phone, clinic.doctor_name)
  return (
    <section className="relative overflow-hidden py-24 px-4" style={{ background: 'var(--hero-bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl bg-white" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl bg-white" />
      </div>
      <div className="relative max-w-3xl mx-auto text-center" style={{ color: 'var(--hero-text)' }}>
        <span className="reveal inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-full mb-6"
          style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--hero-text)' }}>
          💊 {config.display_name} · {clinic.city}
        </span>
        <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-black leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {clinic.clinic_name}
        </h1>
        <p className="reveal reveal-delay-2 text-lg font-semibold mb-1" style={{ color: 'var(--hero-subtext)' }}>
          Dr. {clinic.doctor_name}
        </p>
        <p className="reveal reveal-delay-2 text-sm mb-8" style={{ color: 'var(--hero-subtext)' }}>
          📍 {locationStr(clinic)}
        </p>
        <p className="reveal reveal-delay-2 text-xl font-light mb-10" style={{ color: 'var(--hero-subtext)' }}>
          {clinic.tagline || config.hero_tagline}
        </p>
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-base"
            style={{ color: 'var(--primary)', borderRadius: 'var(--radius)' }}>
            <WaIcon /> Book Appointment
          </a>
          <a href={`tel:+91${clinic.phone}`}
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 border-2 border-white/40 text-base backdrop-blur-sm transition-all hover:bg-white/10"
            style={{ color: 'var(--hero-text)', borderRadius: 'var(--radius)' }}>
            📞 Call Us
          </a>
        </div>
        <div className="reveal reveal-delay-4 flex flex-wrap justify-center gap-2">
          {['Same-day appointments', 'No long queues', 'Experienced team', 'Affordable care'].map((tag) => (
            <span key={tag} className="text-xs font-medium px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--hero-accent)', color: 'var(--hero-text)' }}>
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 7: Prestige ───────────────────────────────────────────────────────────────
// Dark charcoal + silver/platinum — ultra-luxury, exclusive, premium specialist
function HeroPrestige({ clinic, config }: Omit<Props, 'theme'>) {
  const url   = waUrl(clinic.phone, clinic.doctor_name)
  const stats = clinic.stats?.length ? clinic.stats : DEFAULT_STATS
  return (
    <section
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4 py-24"
      style={{ background: 'var(--hero-bg)' }}
    >
      {/* Subtle noise grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

      {/* Top silver line */}
      <div className="reveal w-24 h-px mb-16" style={{ backgroundColor: 'var(--primary)' }} />

      <div className="relative max-w-3xl mx-auto text-center" style={{ color: 'var(--hero-text)' }}>
        {/* Floating clinic icon */}
        <div className="reveal float-anim text-6xl mb-10 opacity-60">🏛️</div>

        {/* Eyebrow */}
        <p className="reveal reveal-delay-1 text-xs uppercase tracking-[0.5em] mb-8 font-light"
          style={{ color: 'var(--primary)' }}>
          {config.display_name} · {locationStr(clinic)}
        </p>

        {/* Clinic name */}
        <h1 className="reveal reveal-delay-2 text-5xl md:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          {clinic.clinic_name}
        </h1>

        {/* Silver rule */}
        <div className="reveal reveal-delay-2 flex items-center gap-4 justify-center mb-6">
          <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: 'var(--primary)', opacity: 0.4 }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--primary)' }}>Excellence in Care</span>
          <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: 'var(--primary)', opacity: 0.4 }} />
        </div>

        {/* Doctor */}
        <p className="reveal reveal-delay-3 text-sm uppercase tracking-[0.4em] font-light mb-2"
          style={{ color: 'var(--primary)' }}>
          Dr. {clinic.doctor_name}
        </p>
        <p className="reveal reveal-delay-3 text-lg italic font-light mb-12"
          style={{ color: 'var(--hero-subtext)', fontFamily: 'var(--font-heading)' }}>
          &ldquo;{clinic.tagline || config.hero_tagline}&rdquo;
        </p>

        {/* Buttons — sharp, no radius */}
        <div className="reveal reveal-delay-4 flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-medium px-10 py-4 text-sm uppercase tracking-[0.2em] transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--primary)', color: '#0C0C0C', borderRadius: '0' }}>
            <WaIcon /> Request Appointment
          </a>
          <a href={`tel:+91${clinic.phone}`}
            className="inline-flex items-center justify-center gap-2 font-medium px-10 py-4 text-sm uppercase tracking-[0.2em] border transition-all hover:opacity-80"
            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', backgroundColor: 'transparent', borderRadius: '0' }}>
            📞 Call Directly
          </a>
        </div>

        {/* Stats */}
        <div className="reveal reveal-delay-5 flex justify-center gap-12 border-t pt-10"
          style={{ borderColor: 'rgba(168,162,158,0.12)' }}>
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{s.value}</p>
              <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--hero-subtext)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom silver line */}
      <div className="reveal w-24 h-px mt-16" style={{ backgroundColor: 'var(--primary)' }} />
    </section>
  )
}

// ── 8: Pulse ──────────────────────────────────────────────────────────────────
// White left + vivid sky-blue right — medical-tech, hospitals, diagnostics
function HeroPulse({ clinic, config }: Omit<Props, 'theme'>) {
  const url   = waUrl(clinic.phone, clinic.doctor_name)
  const stats = clinic.stats?.length ? clinic.stats : DEFAULT_STATS
  return (
    <section className="overflow-hidden min-h-[90vh] flex flex-col md:flex-row">
      {/* Left: white content panel */}
      <div className="flex-1 flex items-center px-8 md:px-16 py-20 md:py-0" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-xl w-full">
          <div className="reveal inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
            style={{ backgroundColor: '#F0F9FF', color: 'var(--primary)', border: '1px solid #E0F2FE' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
            {config.display_name}
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl md:text-6xl font-black leading-tight mb-3 tracking-tight"
            style={{ color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
            {clinic.clinic_name}
          </h1>
          <p className="reveal reveal-delay-2 text-base font-semibold mb-1" style={{ color: 'var(--primary)' }}>
            Dr. {clinic.doctor_name}
          </p>
          <p className="reveal reveal-delay-2 text-sm mb-2 text-slate-500">{locationStr(clinic)}</p>
          <p className="reveal reveal-delay-2 text-lg text-slate-600 mb-8 leading-relaxed">
            {clinic.tagline || config.hero_tagline}
          </p>

          {/* CTA */}
          <div className="reveal reveal-delay-3 flex flex-wrap gap-3 mb-10">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm"
              style={{ backgroundColor: 'var(--primary)' }}>
              <WaIcon /> Book Appointment
            </a>
            <a href={`tel:+91${clinic.phone}`}
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg text-sm border-2 transition-all"
              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              📞 {clinic.phone}
            </a>
          </div>

          {/* Stats */}
          <div className="reveal reveal-delay-4 flex gap-8 border-t pt-8" style={{ borderColor: '#E0F2FE' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: vivid blue panel with pulse rings */}
      <div className="hidden md:flex w-2/5 items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--hero-bg)' }}>
        {/* Animated pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map((n) => (
            <div key={n}
              className={`absolute rounded-full border-2 border-white/20 pulse-ring ${n > 1 ? `pulse-ring-${n}` : ''}`}
              style={{ width: `${n * 140}px`, height: `${n * 140}px` }} />
          ))}
        </div>

        {/* Clinic photo or icon */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
          {clinic.photos?.[0] ? (
            <div className="w-52 h-52 rounded-full overflow-hidden shadow-2xl border-4 border-white/30">
              <img src={clinic.photos[0]} alt={clinic.clinic_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-44 h-44 rounded-full flex items-center justify-center text-7xl shadow-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.25)' }}>
              🏥
            </div>
          )}
          <div style={{ color: 'rgba(255,255,255,0.85)' }}>
            <p className="text-lg font-bold text-white">{clinic.clinic_name}</p>
            <p className="text-sm mt-1">{locationStr(clinic)}</p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-300">Accepting Appointments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function HeroSection({ clinic, config }: Omit<Props, 'theme'>) {
  const { theme } = useTheme()
  if (theme.heroLayout === 'split')    return <HeroModern   clinic={clinic} config={config} />
  if (theme.heroLayout === 'minimal')  return <HeroMinimal  clinic={clinic} config={config} />
  if (theme.heroLayout === 'vitality') return <HeroVitality clinic={clinic} config={config} />
  if (theme.heroLayout === 'elegant')  return <HeroElegant  clinic={clinic} config={config} />
  if (theme.heroLayout === 'warm')     return <HeroWarm     clinic={clinic} config={config} />
  if (theme.heroLayout === 'prestige') return <HeroPrestige clinic={clinic} config={config} />
  if (theme.heroLayout === 'pulse')    return <HeroPulse    clinic={clinic} config={config} />
  return <HeroClassic clinic={clinic} config={config} />
}
