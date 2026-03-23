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
        <div className="reveal text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            What We Offer
          </p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            Our Services
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <div
              key={service}
              className={`reveal reveal-delay-${Math.min(i % 4 + 1, 6)} card-glow p-5 text-center border transition-all hover:-translate-y-1 cursor-default`}
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="text-3xl mb-3">{SERVICE_ICONS[service] ?? '🏥'}</div>
              <div className="w-8 h-0.5 mx-auto mb-3 rounded" style={{ backgroundColor: 'var(--primary)' }} />
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{service}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
