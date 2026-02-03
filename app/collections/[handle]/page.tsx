import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { shopifyFetch, isShopifyConfigured } from '@/lib/shopify-client'
import { GET_COLLECTION_BY_HANDLE, GET_COLLECTIONS } from '@/lib/shopify-queries'
import { ShopifyCollection, ShopifyProduct } from '@/lib/types'
import { isDemoMode, getMockCollectionByHandle, getMockCollections } from '@/lib/demo-mode'
import ProductCard from '../../components/ProductCard'

interface Props {
  params: Promise<{ handle: string }>
}

async function getCollection(handle: string): Promise<ShopifyCollection | null> {
  // Demo mode: return mock collection
  if (isDemoMode()) {
    return getMockCollectionByHandle(handle)
  }

  if (!isShopifyConfigured()) return null

  try {
    const { data } = await shopifyFetch<{ collection: ShopifyCollection | null }>({
      query: GET_COLLECTION_BY_HANDLE,
      variables: { handle },
      tags: ['collections', `collection-${handle}`],
    })
    return data.collection
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (!collection) {
    return {
      title: 'Collection Not Found | Decoupled Commerce',
    }
  }

  return {
    title: `${collection.title} | Decoupled Commerce`,
    description: collection.description || `Shop our ${collection.title} collection`,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.image ? [collection.image.url] : [],
    },
  }
}

export async function generateStaticParams() {
  // Demo mode: return mock collection handles
  if (isDemoMode()) {
    return getMockCollections(50).map(c => ({ handle: c.handle }))
  }

  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      collections: { edges: { node: { handle: string } }[] }
    }>({
      query: GET_COLLECTIONS,
      variables: { first: 50 },
    })

    return data.collections.edges.map((edge) => ({
      handle: edge.node.handle,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params

  if (!isShopifyConfigured() && !isDemoMode()) {
    notFound()
  }

  const collection = await getCollection(handle)

  if (!collection) {
    notFound()
  }

  const products = collection.products.edges.map((edge) => edge.node)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Collection Header */}
      <div className="relative bg-gray-900">
        {collection.image && (
          <div className="absolute inset-0">
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/collections" className="hover:text-white">Collections</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-white">{collection.title}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{collection.title}</h1>
          {collection.description && (
            <p className="text-xl text-gray-300 max-w-2xl">{collection.description}</p>
          )}
          <p className="mt-4 text-gray-400">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No products in this collection.</p>
            <Link href="/products" className="btn btn-primary mt-4">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
