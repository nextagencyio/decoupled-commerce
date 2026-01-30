import { Metadata } from 'next'
import { shopifyFetch, isShopifyConfigured } from '@/lib/shopify-client'
import { GET_PRODUCTS } from '@/lib/shopify-queries'
import { ShopifyProduct } from '@/lib/types'
import ProductCard from '../components/ProductCard'
import SetupGuide from '../components/SetupGuide'

export const metadata: Metadata = {
  title: 'All Products | Decoupled Commerce',
  description: 'Browse our complete collection of products',
}

async function getProducts() {
  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      products: { edges: { node: ShopifyProduct }[] }
    }>({
      query: GET_PRODUCTS,
      variables: { first: 50 },
      tags: ['products'],
    })
    return data.products.edges.map(edge => edge.node)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage() {
  if (!isShopifyConfigured()) {
    return <SetupGuide />
  }

  const products = await getProducts()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">All Products</h1>
          <p className="mt-2 text-lg text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
