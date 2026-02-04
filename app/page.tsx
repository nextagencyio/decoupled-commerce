import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw } from 'lucide-react'
import { shopifyFetch, isShopifyConfigured } from '@/lib/shopify-client'
import { GET_PRODUCTS, GET_COLLECTIONS } from '@/lib/shopify-queries'
import { ShopifyProduct, ShopifyCollection } from '@/lib/types'
import ProductCard from './components/ProductCard'
import SetupGuide from './components/SetupGuide'
import AlmostThere from './components/AlmostThere'
import { isDemoMode, getMockProducts, getMockCollections } from '@/lib/demo-mode'

// Check if Drupal is configured
function isDrupalConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_DRUPAL_BASE_URL &&
    process.env.DRUPAL_CLIENT_ID &&
    process.env.DRUPAL_CLIENT_SECRET
  )
}

async function getFeaturedProducts() {
  // Demo mode: return mock products
  if (isDemoMode()) {
    return getMockProducts(8)
  }

  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      products: { edges: { node: ShopifyProduct }[] }
    }>({
      query: GET_PRODUCTS,
      variables: { first: 8 },
      tags: ['products'],
    })
    return data.products.edges.map(edge => edge.node)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

async function getCollections() {
  // Demo mode: return mock collections
  if (isDemoMode()) {
    return getMockCollections(4)
  }

  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      collections: { edges: { node: ShopifyCollection }[] }
    }>({
      query: GET_COLLECTIONS,
      variables: { first: 4 },
      tags: ['collections'],
    })
    return data.collections.edges.map(edge => edge.node)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Sparkles,
    title: 'Quality Guarantee',
    description: 'Premium products only',
  },
]

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
  ])

  const shopifyConfigured = isShopifyConfigured() || isDemoMode()

  if (!shopifyConfigured) {
    // Show "Almost There" if Drupal is configured but Shopify isn't
    if (isDrupalConfigured()) {
      return <AlmostThere />
    }
    // Show full setup guide if nothing is configured
    return <SetupGuide />
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Discover
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mt-2">
                Premium Products
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 mb-8 md:mb-10 max-w-3xl mx-auto">
              Curated collections of high-quality products. Modern design meets exceptional craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-900 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-primary-900 transition-colors duration-200 font-semibold text-lg"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-gray-500 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {products.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-2">Handpicked favorites from our collection</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-semibold group"
              >
                View All
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center text-primary-600 font-semibold"
              >
                View All Products
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Collections Section */}
      {collections.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Shop by Collection</h2>
                <p className="text-gray-600 mt-2">Explore our carefully curated collections</p>
              </div>
              <Link
                href="/collections"
                className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-semibold group"
              >
                View All
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative">
                    {collection.image ? (
                      <Image
                        src={collection.image.url}
                        alt={collection.image.altText || collection.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                      {collection.title}
                    </h3>
                    <span className="inline-flex items-center text-white/80 text-sm mt-1 group-hover:text-white">
                      Shop now
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/collections"
                className="inline-flex items-center text-primary-600 font-semibold"
              >
                View All Collections
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog Teaser */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl overflow-hidden">
            <div className="px-8 py-12 md:px-12 md:py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Read Our Blog
              </h2>
              <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg">
                Stay updated with the latest trends, tips, and insights from our team.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg"
              >
                Explore Articles
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay in the Loop
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive deals, new arrivals, and insider updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-md hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
