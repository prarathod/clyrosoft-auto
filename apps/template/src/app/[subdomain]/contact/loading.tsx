function Bone({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-200 animate-pulse py-20 px-4 text-center">
        <Bone className="h-4 w-32 mx-auto mb-4" />
        <Bone className="h-10 w-64 mx-auto" />
      </div>
      <div className="py-16 px-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl p-6 border space-y-4">
          <Bone className="h-6 w-48" />
          <Bone className="h-3 w-64" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Bone className="h-3 w-24" />
              <Bone className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <Bone className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border space-y-3">
            <Bone className="h-5 w-36" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-3 w-full" />
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 border space-y-3">
            <Bone className="h-5 w-40" />
            <Bone className="h-3 w-full" />
            <Bone className="h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
