function Bone({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

export default function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gray-200 animate-pulse py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Bone className="h-4 w-40 mx-auto rounded-full" />
          <Bone className="h-12 w-80 mx-auto" />
          <Bone className="h-5 w-48 mx-auto" />
          <Bone className="h-8 w-64 mx-auto rounded-full" />
          <div className="flex justify-center gap-4 pt-4">
            <Bone className="h-12 w-44 rounded-full" />
            <Bone className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Services skeleton */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Bone className="h-6 w-40 mx-auto mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border">
                <Bone className="h-8 w-8 mx-auto mb-3" />
                <Bone className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials skeleton */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Bone className="h-6 w-48 mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border space-y-3">
                <Bone className="h-4 w-24" />
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-5/6" />
                <Bone className="h-3 w-4/6" />
                <div className="flex items-center gap-3 pt-2">
                  <Bone className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Bone className="h-3 w-24" />
                    <Bone className="h-2 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
