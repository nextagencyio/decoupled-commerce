function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded w-full mt-2" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 bg-gray-600 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-600 rounded w-4 animate-pulse" />
            <div className="h-4 bg-gray-600 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-600 rounded w-4 animate-pulse" />
            <div className="h-4 bg-gray-600 rounded w-32 animate-pulse" />
          </div>
          <div className="h-12 bg-gray-600 rounded w-64 mb-4 animate-pulse" />
          <div className="h-6 bg-gray-600 rounded w-96 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-600 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
