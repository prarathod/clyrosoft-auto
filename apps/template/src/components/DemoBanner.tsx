'use client'

interface Props {
  clinicName: string
  subdomain: string
}

export default function DemoBanner({ clinicName, subdomain }: Props) {
  return (
    <div className="bg-amber-400 text-amber-900 text-center py-2.5 px-4 text-sm font-medium sticky top-0 z-[60]">
      🎉 This is a <strong>free demo</strong> for {clinicName}.{' '}
      <a
        href={`/pay/${subdomain}`}
        className="underline font-bold hover:text-amber-800"
      >
        Go live for ₹299/month →
      </a>
    </div>
  )
}
