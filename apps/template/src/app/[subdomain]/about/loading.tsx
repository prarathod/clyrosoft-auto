function Bone({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-200 animate-pulse py-20 px-4 text-center">
        <Bone className="h-4 w-32 mx-auto mb-4" />
        <Bone className="h-10 w-40 mx-auto" />
      </div>
      <div className="py-16 px-4 max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
        <Bone className="w-48 h-48 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Bone className="h-3 w-24" />
          <Bone className="h-8 w-56" />
          <Bone className="h-3 w-40" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-5/6" />
          <Bone className="h-3 w-4/6" />
        </div>
      </div>
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Bone className="h-6 w-40 mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border space-y-2">
                <Bone className="h-8 w-8" />
                <Bone className="h-5 w-36" />
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
