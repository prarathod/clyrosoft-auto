interface TestimonialItem { name: string; text: string; treatment: string }

interface Props {
  doctorName: string
  clinicName: string
  testimonials?: TestimonialItem[] | null
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { name: 'Priya Mehta',  text: 'Absolutely brilliant experience! The doctor was very gentle and explained everything clearly. Completely painless and professional.', treatment: 'Consultation' },
  { name: 'Rahul Verma',  text: 'Best clinic in the area. Booked via WhatsApp and got an appointment the same evening. Very clean and professional.', treatment: 'Check-up' },
  { name: 'Sunita Rao',   text: 'My family has been coming here for 2 years. The doctor is so patient and thorough. Highly recommended!', treatment: 'Family Care' },
]

// Gradient pairs for avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
]

export default function Testimonials({ clinicName, testimonials }: Props) {
  const list = testimonials?.length ? testimonials : DEFAULT_TESTIMONIALS
  return (
    <section className="py-20 px-4 overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="reveal text-center mb-14">
          <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--primary)' }}>
            Patient Stories
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold heading-line"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
          >
            What Our Patients Say
          </h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Trusted by hundreds of patients at {clinicName}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card reveal reveal-delay-${i + 1} flex flex-col`}
              style={{
                backgroundColor: 'var(--section-alt)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)',
                padding: '1.75rem',
                borderTop: '3px solid var(--primary)',
              }}
            >
              {/* Giant decorative quote mark */}
              <div
                className="text-6xl font-black leading-none mb-2 select-none"
                style={{ color: 'var(--primary)', opacity: 0.18, fontFamily: 'Georgia, serif', lineHeight: '1' }}
                aria-hidden="true"
              >
                "
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <span
                    key={s}
                    className="text-base"
                    style={{
                      color: '#F59E0B',
                      animationDelay: `${i * 0.1 + s * 0.05}s`,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-muted)' }}>
                {t.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
                <div
                  className="w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 text-white shadow-md"
                  style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                >
                  {t.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--primary)', opacity: 0.8 }}>
                    {t.treatment}
                  </p>
                </div>
                <div className="ml-auto text-green-500 text-lg">✓</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
