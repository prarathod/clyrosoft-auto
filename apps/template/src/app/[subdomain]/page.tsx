export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'
import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import GallerySection from '@/components/GallerySection'
import Testimonials from '@/components/Testimonials'
import BookingSection from '@/components/BookingSection'
import WhatsAppCTA from '@/components/WhatsAppCTA'

interface Props {
  params: { subdomain: string }
}

export async function generateMetadata({ params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) return {}
  return {
    title: `${clinic.clinic_name} | ${clinic.city}`,
    description: `Book an appointment at ${clinic.clinic_name}, ${clinic.area}, ${clinic.city}`,
  }
}

export default async function ClinicPage({ params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()

  const config = await getProfessionConfig(clinic.profession_type)

  // Prefer clinic-level overrides, fall back to profession config defaults
  const services = clinic.services?.length ? clinic.services : config.services
  const testimonials = clinic.testimonials?.length ? clinic.testimonials : null

  return (
    <main>
      <div data-section="hero">
        <HeroSection clinic={clinic} config={config} />
      </div>
      <div data-section="services">
        <ServicesSection services={services} primaryColor={config.primary_color} />
      </div>
      <div data-section="gallery">
        <GallerySection photos={clinic.photos ?? []} clinicName={clinic.clinic_name} />
      </div>
      <div data-section="testimonials">
        <Testimonials
          doctorName={clinic.doctor_name}
          clinicName={clinic.clinic_name}
          testimonials={testimonials}
        />
      </div>
      <div data-section="booking">
        <BookingSection
          subdomain={params.subdomain}
          services={services}
          phone={clinic.phone}
        />
      </div>
      <div data-section="contact">
        <WhatsAppCTA phone={clinic.phone} doctorName={clinic.doctor_name} />
      </div>
    </main>
  )
}
