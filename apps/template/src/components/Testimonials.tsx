interface TestimonialItem {
  name: string
  text: string
  treatment: string
}

interface Props {
  doctorName: string
  clinicName: string
  testimonials?: TestimonialItem[] | null
}

const STARS = '★★★★★'

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Priya Mehta',
    text: 'Absolutely brilliant experience! The doctor was very gentle and explained everything clearly. My root canal was completely painless.',
    treatment: 'Root Canal',
  },
  {
    name: 'Rahul Verma',
    text: 'Best clinic in the area. Booked via WhatsApp and got an appointment the same evening. Very professional and clean.',
    treatment: 'Teeth Whitening',
  },
  {
    name: 'Sunita Rao',
    text: 'My kids love coming here — the doctor is so patient. We have been coming for 2 years now. Braces treatment is going great!',
    treatment: 'Braces',
  },
]

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Testimonials({ clinicName, testimonials }: Props) {
  const list = testimonials?.length ? testimonials : DEFAULT_TESTIMONIALS

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Patient Stories
          </p>
          <h2
            className="text-3xl font-bold"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
          >
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
              className="p-6 border hover:shadow-md transition-shadow"
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
                  className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)', color: '#fff', opacity: 0.9 }}
                >
                  {t.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.treatment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
