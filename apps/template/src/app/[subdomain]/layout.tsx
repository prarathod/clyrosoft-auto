export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getClinicBySubdomain, getProfessionConfig } from '@/lib/getClinicData'
import { getTheme } from '@/styles/themes'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import DemoBanner from '@/components/DemoBanner'
import SectionHighlighter from '@/components/SectionHighlighter'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import AnnouncementBanner from '@/components/AnnouncementBanner'

interface Props {
  children: React.ReactNode
  params: { subdomain: string }
}

export default async function ClinicLayout({ children, params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()

  const config = await getProfessionConfig(clinic.profession_type)
  const theme  = getTheme(clinic.theme ?? config.theme)

  return (
    <ThemeProvider initialTheme={theme.key}>
      <ScrollRevealInit />
      <SectionHighlighter />
      {clinic.announcement && <AnnouncementBanner text={clinic.announcement} />}
      {clinic.status === 'demo' && (
        <DemoBanner clinicName={clinic.clinic_name} subdomain={params.subdomain} />
      )}
      <Navbar clinic={clinic} config={config} theme={theme} />
      {children}
      <div data-section="footer"><Footer clinic={clinic} config={config} /></div>
      <FloatingWhatsApp phone={clinic.phone} doctorName={clinic.doctor_name} />
      <ThemeSwitcher />
    </ThemeProvider>
  )
}
