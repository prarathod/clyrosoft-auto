import type { Client, ProfessionConfig } from '@/types/database'

interface Props {
  clinic: Client
  config: ProfessionConfig
}

export default function HeroSection({ clinic, config }: Props) {
  return (
    <section
      className="min-h-[70vh] flex flex-col items-center justify-center text-white text-center px-6 py-20"
      style={{ backgroundColor: config.primary_color }}
    >
      <p className="text-sm uppercase tracking-widest opacity-80 mb-2">{config.display_name}</p>
      <h1 className="text-5xl font-bold mb-4">{clinic.clinic_name}</h1>
      <p className="text-xl opacity-90 mb-2">Dr. {clinic.doctor_name}</p>
      <p className="text-lg opacity-75 mb-8">{clinic.area}, {clinic.city}</p>
      <p className="text-2xl font-light italic mb-10">&ldquo;{config.hero_tagline}&rdquo;</p>
      <a
        href={`https://wa.me/91${clinic.phone}?text=Hi%20Dr.%20${encodeURIComponent(clinic.doctor_name)}%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white text-green-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        📅 Book Appointment via WhatsApp
      </a>
    </section>
  )
}
