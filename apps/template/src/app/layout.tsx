import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clinic Website',
  description: 'Your local clinic',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
