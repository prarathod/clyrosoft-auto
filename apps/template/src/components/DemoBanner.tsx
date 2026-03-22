'use client'

interface Props {
  clinicName: string
}

export default function DemoBanner({ clinicName }: Props) {
  // Owner phone — set NEXT_PUBLIC_OWNER_PHONE in .env.local
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE ?? '9011509422'
  const message = encodeURIComponent(
    `Hi! I saw the demo website created for ${clinicName}. I'd like to activate it for ₹999/month.`
  )
  return (
    <div className="bg-amber-400 text-amber-900 text-center py-2.5 px-4 text-sm font-medium sticky top-0 z-[60]">
      🎉 This is a <strong>free demo</strong> website for {clinicName}.{' '}
      <a
        href={`https://wa.me/91${ownerPhone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-bold hover:text-amber-800"
      >
        Go live in 24 hours → 299/month
      </a>
    </div>
  )
}
