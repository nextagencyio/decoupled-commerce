import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { shopifyFetch, isShopifyConfigured } from '@/lib/shopify-client'
import { GET_COLLECTIONS } from '@/lib/shopify-queries'
import { ShopifyCollection } from '@/lib/types'
import { isDemoMode, getMockCollections } from '@/lib/demo-mode'
import SetupGuide from '../components/SetupGuide'

export const metadata: Metadata = {
  title: 'Collections | Decoupled Commerce',
  description: 'Browse our product collections',
}

async function getCollections() {
  // Demo mode: return mock collections
  if (isDemoMode()) {
    return getMockCollections(50)
  }

  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      collections: { edges: { node: ShopifyCollection }[] }
    }>({
      query: GET_COLLECTIONS,
      variables: { first: 50 },
      tags: ['collections'],
    })
    return data.collections.edges.map(edge => edge.node)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

export default async function CollectionsPage() {
  if (!isShopifyConfigured() && !isDemoMode()) {
    return <SetupGuide />
  }

  const collections = await getCollections()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Collections</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse our curated collections
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] relative">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-primary-600 text-4xl font-bold">
                        {collection.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{collection.title}</h2>
                  {collection.description && (
                    <p className="text-white/80 text-sm line-clamp-2">{collection.description}</p>
                  )}
                  <span className="inline-flex items-center mt-4 text-white font-medium group-hover:underline">
                    Shop Collection &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No collections found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
