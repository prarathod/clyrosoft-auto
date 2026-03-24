import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'
import AppointmentForm from '@/components/AppointmentForm'

interface Props {
  params: { subdomain: string }
}

export default async function ContactPage({ params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()
  const config = await getProfessionConfig(clinic.profession_type)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section
        className="py-20 text-white text-center"
        style={{ backgroundColor: config.primary_color }}
      >
        <p className="text-sm uppercase tracking-widest opacity-80 mb-2">{clinic.clinic_name}</p>
        <h1 className="text-4xl font-bold mb-3">Book an Appointment</h1>
        <p className="opacity-80">Fill the form — we&apos;ll open WhatsApp for instant confirmation</p>
      </section>

      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Appointment Form */}
          <AppointmentForm
            phone={clinic.phone}
            doctorName={clinic.doctor_name}
            services={config.services}
            primaryColor={config.primary_color}
            subdomain={params.subdomain}
          />

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Clinic Details</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🏥 <strong>{clinic.clinic_name}</strong></p>
                <p>👨‍⚕️ Dr. {clinic.doctor_name}</p>
                <p>📍 {clinic.area && clinic.area !== clinic.city ? `${clinic.area}, ` : ''}{clinic.city}</p>
                <a
                  href={`tel:+91${clinic.phone}`}
                  className="flex items-center gap-2 font-semibold text-white rounded-xl px-4 py-2.5 text-sm transition-opacity hover:opacity-90 w-fit"
                  style={{ backgroundColor: config.primary_color }}
                >
                  📞 Call +91 {clinic.phone}
                </a>
                {clinic.email && (
                  <p>
                    ✉️{' '}
                    <a href={`mailto:${clinic.email}`} className="hover:text-gray-900">
                      {clinic.email}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Prefer WhatsApp?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Chat directly with Dr. {clinic.doctor_name} for instant appointment booking.
              </p>
              <a
                href={`https://wa.me/91${clinic.phone}?text=${encodeURIComponent(
                  `Hi Dr. ${clinic.doctor_name}, I'd like to book an appointment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-full text-sm transition-colors w-fit"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Open WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
