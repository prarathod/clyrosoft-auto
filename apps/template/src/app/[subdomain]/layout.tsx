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

interface Props {
  children: React.ReactNode
  params: { subdomain: string }
}

export default async function ClinicLayout({ children, params }: Props) {
  const clinic = await getClinicBySubdomain(params.subdomain)
  if (!clinic) notFound()

  const config = await getProfessionConfig(clinic.profession_type)
  // Use clinic-level theme override if set, else profession config default
  const theme = getTheme(clinic.theme ?? config.theme)

  return (
    <ThemeProvider initialTheme={theme.key}>
      {clinic.status === 'demo' && (
        <DemoBanner clinicName={clinic.clinic_name} />
      )}
      <SectionHighlighter />
      <Navbar clinic={clinic} config={config} theme={theme} />
      {children}
      <div data-section="footer"><Footer clinic={clinic} config={config} /></div>
      <FloatingWhatsApp phone={clinic.phone} doctorName={clinic.doctor_name} />
      <ThemeSwitcher />
    </ThemeProvider>
  )
}
