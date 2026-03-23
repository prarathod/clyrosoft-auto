'use client'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://cliniqo.in'

interface Props {
  clinicName: string
}

export default function DemoBanner({ clinicName }: Props) {
  return (
    <div className="bg-amber-400 text-amber-900 text-center py-2.5 px-4 text-sm font-medium sticky top-0 z-[60]">
      🎉 This is a <strong>free demo</strong> for {clinicName}.{' '}
      <a
        href={`${DASHBOARD_URL}/dashboard/subscription`}
        className="underline font-bold hover:text-amber-800"
      >
        Go live for ₹299/month →
      </a>
    </div>
  )
}
