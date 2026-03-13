import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'
import Link from 'next/link'

interface Props {
  params: { subdomain: string }
}

const SERVICE_ICONS: Record<string, string> = {
  'Teeth Cleaning': '🦷',
  'Root Canal': '🔬',
  'Braces': '😁',
  'Teeth Whitening': '✨',
  'Dental Implants': '🏥',
  'Tooth Extraction': '🩺',
  'Cavity Filling': '💊',
  'Consultation': '👨‍⚕️',
}

const SERVICE_DESC: Record<string, string> = {
  'Teeth Cleaning': 'Professional cleaning to remove plaque and tartar for a healthier smile.',
  'Root Canal': 'Pain-free root canal treatment to save your natural tooth.',
  'Braces': 'Orthodontic braces to straighten your teeth and perfect your bite.',
  'Teeth Whitening': 'Brighten your smile by several shades with our whitening treatment.',
  'Dental Implants': 'Permanent, natural-looking implants to replace missing teeth.',
  'Tooth Extraction': 'Safe and comfortable extraction by our experienced dentists.',
  'Cavity Filling': 'Tooth-colored fillings to restore cavities discreetly.',
  'Consultation': 'Comprehensive dental checkup and personalized treatment plan.',
}

export default async function ServicesPage({ params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()
  const config = await getProfessionConfig(clinic.profession_type)

  const whatsappUrl = `https://wa.me/91${clinic.phone}?text=${encodeURIComponent(
    `Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`
  )}`

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section
        className="py-20 text-white text-center"
        style={{ backgroundColor: config.primary_color }}
      >
        <p className="text-sm uppercase tracking-widest opacity-80 mb-2">{clinic.clinic_name}</p>
        <h1 className="text-4xl font-bold mb-3">Our Services</h1>
        <p className="opacity-80 max-w-md mx-auto">
          We offer comprehensive dental care with the latest technology and a gentle touch.
        </p>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.services.map((service) => (
            <div
              key={service}
              className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{SERVICE_ICONS[service] ?? '🏥'}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {SERVICE_DESC[service] ?? 'Professional treatment by our experienced team.'}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold"
                style={{ color: config.primary_color }}
              >
                Book this service →
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Not sure which treatment you need?</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white px-8 py-3 rounded-full font-semibold shadow hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.primary_color }}
          >
            Chat with Dr. {clinic.doctor_name}
          </a>
        </div>
      </section>
    </main>
  )
}
