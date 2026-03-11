'use client'

interface Props {
  clinicName: string
  phone: string
}

export default function DemoBanner({ clinicName, phone }: Props) {
  const message = encodeURIComponent(
    `Hi! I saw the demo website you created for ${clinicName}. I'm interested in activating it at ₹999/month.`
  )
  return (
    <div className="bg-amber-400 text-amber-900 text-center py-3 px-4 text-sm font-medium">
      🎉 This is a <strong>free demo</strong> website created for {clinicName}.{' '}
      <a
        href={`https://wa.me/91${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-bold hover:text-amber-700"
      >
        Activate for ₹999/month →
      </a>
    </div>
  )
}
