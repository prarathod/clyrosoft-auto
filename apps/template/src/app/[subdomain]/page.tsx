import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'
import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import DemoBanner from '@/components/DemoBanner'

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

  return (
    <main>
      {clinic.status === 'demo' && <DemoBanner clinicName={clinic.clinic_name} phone={clinic.phone} />}
      <HeroSection clinic={clinic} config={config} />
      <ServicesSection services={config.services} primaryColor={config.primary_color} />
      <WhatsAppCTA phone={clinic.phone} doctorName={clinic.doctor_name} />
    </main>
  )
}
