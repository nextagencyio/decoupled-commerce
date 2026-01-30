export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative bg-gray-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="h-12 bg-gray-300 rounded w-3/4 mb-6" />
            <div className="h-6 bg-gray-300 rounded w-full mb-2" />
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-8" />
            <div className="flex gap-4">
              <div className="h-12 bg-gray-300 rounded w-40" />
              <div className="h-12 bg-gray-300 rounded w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Collections Skeleton */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
