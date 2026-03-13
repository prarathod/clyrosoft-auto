import { themes, themeToVars } from '@/styles/themes'
import type { Theme } from '@/styles/themes'

const MOCK = {
  clinic_name: 'Sharma Dental Clinic',
  doctor_name: 'Ramesh Sharma',
  area: 'Koramangala',
  city: 'Bangalore',
  tagline: 'Your Smile, Our Priority',
  services: ['Teeth Cleaning', 'Root Canal', 'Braces', 'Whitening'],
}

function ThemeCard({ theme }: { theme: Theme }) {
  const vars = themeToVars(theme)
  const isModern = theme.key === 'modern'
  const isMinimal = theme.key === 'minimal'

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Label */}
      <div className="px-4 py-2 bg-gray-900 text-white text-xs font-mono flex items-center justify-between">
        <span>theme: &quot;{theme.key}&quot;</span>
        <span className="opacity-50">{theme.label}</span>
      </div>

      {/* Preview */}
      <div style={vars} className="text-sm">
        {/* Mini Navbar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between border-b"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <span
            className="font-bold text-sm"
            style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
          >
            {MOCK.clinic_name}
          </span>
          <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Services</span><span>About</span><span>Contact</span>
          </div>
          <span
            className="text-white text-xs px-3 py-1 font-semibold"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
          >
            Book Now
          </span>
        </div>

        {/* Mini Hero */}
        <div
          className="px-6 py-8"
          style={{ background: isModern
            ? 'linear-gradient(135deg, #1E1B4B, #7C3AED)'
            : isMinimal
              ? 'var(--hero-bg)'
              : 'var(--hero-bg)'
          }}
        >
          {isMinimal ? (
            <>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Dental Clinic · Koramangala
              </p>
              <h2
                className="text-2xl font-black mb-2"
                style={{ color: 'var(--hero-text)', fontFamily: 'var(--font-heading)' }}
              >
                {MOCK.clinic_name}
              </h2>
              <div className="w-8 h-0.5 mb-3" style={{ backgroundColor: 'var(--primary)' }} />
              <p className="text-sm mb-1" style={{ color: 'var(--hero-text)' }}>Dr. {MOCK.doctor_name}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--hero-subtext)' }}>{MOCK.tagline}</p>
              <span
                className="text-white text-xs px-4 py-1.5 font-semibold"
                style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
              >
                Book Appointment
              </span>
            </>
          ) : isModern ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest mb-2 text-violet-300">Dental Clinic</p>
                <h2 className="text-2xl font-black mb-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {MOCK.clinic_name}
                </h2>
                <p className="text-xs text-violet-300 mb-3">Dr. {MOCK.doctor_name}</p>
                <span className="text-white text-xs px-4 py-1.5 font-semibold rounded-full" style={{ backgroundColor: 'var(--primary)' }}>
                  Book Now
                </span>
              </div>
              <div className="text-5xl opacity-30">🦷</div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--hero-subtext)' }}>
                Dental Clinic
              </p>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--hero-text)', fontFamily: 'var(--font-heading)' }}
              >
                {MOCK.clinic_name}
              </h2>
              <p className="text-xs italic mb-4" style={{ color: 'var(--hero-subtext)' }}>
                &ldquo;{MOCK.tagline}&rdquo;
              </p>
              <span
                className="text-xs px-5 py-1.5 font-bold rounded-full"
                style={{ backgroundColor: 'white', color: 'var(--primary)' }}
              >
                Book Appointment
              </span>
            </div>
          )}
        </div>

        {/* Mini Services */}
        <div className="px-6 py-5" style={{ backgroundColor: 'var(--section-alt)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text)' }}>
            Our Services
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MOCK.services.map((s) => (
              <div
                key={s}
                className="p-2 text-center border text-xs"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Mini Testimonial */}
        <div className="px-6 py-5" style={{ backgroundColor: 'var(--bg)' }}>
          <div
            className="p-3 border text-xs"
            style={{
              backgroundColor: 'var(--section-alt)',
              borderColor: 'var(--card-border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <div className="text-yellow-400 mb-1 text-xs">★★★★★</div>
            <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
              &ldquo;Best clinic in the area. Booked via WhatsApp instantly!&rdquo;
            </p>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Priya Mehta</p>
          </div>
        </div>

        {/* Mini Footer */}
        <div
          className="px-6 py-3 text-xs"
          style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text)' }}
        >
          © 2026 {MOCK.clinic_name}. Powered by ClinicSaaS.
        </div>
      </div>
    </div>
  )
}

export default function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Theme Preview</h1>
          <p className="text-gray-500 text-sm">
            Change <code className="bg-gray-200 px-1 rounded">theme</code> in{' '}
            <code className="bg-gray-200 px-1 rounded">data/professions/dental.json</code> to switch instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.values(themes).map((theme) => (
            <ThemeCard key={theme.key} theme={theme} />
          ))}
        </div>

        <div className="mt-10 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-4">How to switch themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            {Object.values(themes).map((t) => (
              <div key={t.key} className="bg-gray-50 rounded-lg p-4 font-mono text-xs">
                <div className="text-gray-400 mb-1">// data/professions/dental.json</div>
                <div className="text-blue-600">{`"theme": "${t.key}"`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
