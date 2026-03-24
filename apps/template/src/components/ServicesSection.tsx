const SERVICE_ICONS: Record<string, string> = {
  // Dental
  'Teeth Cleaning': '🦷', 'Root Canal': '🔬', 'Braces': '😁',
  'Teeth Whitening': '✨', 'Dental Implants': '🏥', 'Tooth Extraction': '🩺',
  'Cavity Filling': '💊', 'Consultation': '👨‍⚕️',
  // Eye
  'Cataract Surgery': '👁️', 'LASIK': '🔭', 'Eye Check-up': '🔍',
  'Glaucoma Treatment': '💊', 'Retina Care': '🔬',
  // Skin
  'Skin Consultation': '🧴', 'Acne Treatment': '✨', 'Anti-Ageing': '💆',
  'Hair Treatment': '💇', 'Laser Therapy': '💡',
  // General
  'General Checkup': '🩺', 'Vaccination': '💉', 'Blood Test': '🩸',
  'X-Ray': '🫁', 'ECG': '❤️', 'Physiotherapy': '🏃', 'Nutrition': '🥗',
  // Specialty
  'Cardiology': '❤️', 'Neurology': '🧠', 'Orthopaedics': '🦴',
  'Gynaecology': '👶', 'Paediatrics': '🧒', 'ENT': '👂',
  'Surgery': '🏥', 'Emergency Care': '🚑', 'ICU': '🏥',
}

interface Props {
  services: string[]
  primaryColor: string
}

export default function ServicesSection({ services }: Props) {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--section-alt)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Section heading with animated underline */}
        <div className="reveal text-center mb-14">
          <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--primary)' }}>
            What We Offer
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold heading-line"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
          >
            Our Services
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Comprehensive care tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <div
              key={service}
              className={`service-card reveal reveal-delay-${Math.min(i % 4 + 1, 6)} card-glow group cursor-default`}
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
              }}
            >
              {/* Icon with animated background */}
              <div
                className="service-icon mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-colors duration-300"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                }}
              >
                {SERVICE_ICONS[service] ?? '🏥'}
              </div>

              {/* Accent line */}
              <div
                className="w-8 h-0.5 mx-auto mb-3 rounded transition-all duration-300 group-hover:w-12"
                style={{ backgroundColor: 'var(--primary)' }}
              />

              <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>
                {service}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
