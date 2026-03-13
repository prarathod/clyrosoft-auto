import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'

interface Props {
  params: { subdomain: string }
}

const WHY_US = [
  {
    icon: '🏆',
    title: 'Years of Experience',
    desc: 'Our team brings years of clinical expertise to provide you with the best care possible.',
  },
  {
    icon: '🔬',
    title: 'Modern Equipment',
    desc: 'We use the latest technology and sterilized equipment for safe, accurate treatments.',
  },
  {
    icon: '💛',
    title: 'Patient-First Approach',
    desc: 'We prioritize your comfort and explain every step so you always feel in control.',
  },
  {
    icon: '💬',
    title: 'WhatsApp Appointments',
    desc: 'Book instantly on WhatsApp — no waiting on hold, no complicated forms.',
  },
]

export default async function AboutPage({ params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()
  const config = await getProfessionConfig(clinic.profession_type)

  const whatsappUrl = `https://wa.me/91${clinic.phone}?text=${encodeURIComponent(
    `Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`
  )}`

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section
        className="py-20 text-white text-center"
        style={{ backgroundColor: config.primary_color }}
      >
        <p className="text-sm uppercase tracking-widest opacity-80 mb-2">{clinic.clinic_name}</p>
        <h1 className="text-4xl font-bold mb-3">About Us</h1>
        <p className="opacity-80">Trusted dental care in {clinic.area}, {clinic.city}</p>
      </section>

      {/* Doctor Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Doctor Photo Placeholder */}
          <div
            className="w-48 h-48 rounded-full flex-shrink-0 flex items-center justify-center text-6xl text-white shadow-lg"
            style={{ backgroundColor: config.primary_color }}
          >
            👨‍⚕️
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-1">
              {config.display_name}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Dr. {clinic.doctor_name}</h2>
            <p className="text-gray-500 mb-4">{clinic.clinic_name} · {clinic.area}, {clinic.city}</p>
            <p className="text-gray-600 leading-relaxed">
              Dr. {clinic.doctor_name} is a dedicated dental professional committed to providing
              compassionate, high-quality care. With a focus on patient comfort and modern
              techniques, our clinic offers a welcoming environment where every patient feels heard
              and valued.
            </p>
            <a
              href={`tel:+91${clinic.phone}`}
              className="inline-block mt-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📞 +91 {clinic.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_US.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to visit us?</h2>
        <p className="text-gray-500 mb-6">
          {clinic.clinic_name} is located in {clinic.area}, {clinic.city}.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white px-8 py-3 rounded-full font-semibold shadow hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.primary_color }}
        >
          Book an Appointment
        </a>
      </section>
    </main>
  )
}
