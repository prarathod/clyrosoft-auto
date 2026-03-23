interface TestimonialItem { name: string; text: string; treatment: string }

interface Props {
  doctorName: string
  clinicName: string
  testimonials?: TestimonialItem[] | null
}

const STARS = '★★★★★'

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { name: 'Priya Mehta',  text: 'Absolutely brilliant experience! The doctor was very gentle and explained everything clearly. Completely painless and professional.', treatment: 'Consultation' },
  { name: 'Rahul Verma',  text: 'Best clinic in the area. Booked via WhatsApp and got an appointment the same evening. Very clean and professional.', treatment: 'Check-up' },
  { name: 'Sunita Rao',   text: 'My family has been coming here for 2 years. The doctor is so patient and thorough. Highly recommended!', treatment: 'Family Care' },
]

export default function Testimonials({ clinicName, testimonials }: Props) {
  const list = testimonials?.length ? testimonials : DEFAULT_TESTIMONIALS
  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Patient Stories
          </p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            What Our Patients Say
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Trusted by hundreds of patients at {clinicName}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((t, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} p-6 border hover:shadow-lg transition-all hover:-translate-y-1`}
              style={{
                backgroundColor: 'var(--section-alt)',
                borderColor: 'var(--card-border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="text-yellow-400 text-lg mb-3">{STARS}</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {t.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.treatment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
