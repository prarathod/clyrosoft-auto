export default function AnnouncementBanner({ text }: { text: string }) {
  if (!text.trim()) return null
  return (
    <div
      className="w-full overflow-hidden py-2 px-4 text-center text-xs font-semibold tracking-wide"
      style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
    >
      <span className="inline-block">📢 &nbsp;{text}</span>
    </div>
  )
}
