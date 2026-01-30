export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />

            {/* Options Skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded w-16 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Quantity Skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="h-14 bg-gray-200 rounded-lg w-full animate-pulse" />

            {/* Trust Badges Skeleton */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-6 w-6 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                </div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="pt-6 border-t space-y-3">
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
