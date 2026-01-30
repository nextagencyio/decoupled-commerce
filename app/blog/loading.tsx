function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="flex items-center gap-4 mt-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8 md:mb-12">
          <div className="h-10 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
