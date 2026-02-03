import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { shopifyFetch, isShopifyConfigured, formatPrice } from '@/lib/shopify-client'
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS } from '@/lib/shopify-queries'
import { ShopifyProduct } from '@/lib/types'
import { isDemoMode, getMockProductByHandle, getMockProducts } from '@/lib/demo-mode'
import ProductDetail from './ProductDetail'

interface Props {
  params: Promise<{ handle: string }>
}

async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  // Demo mode: return mock product
  if (isDemoMode()) {
    return getMockProductByHandle(handle)
  }

  if (!isShopifyConfigured()) return null

  try {
    const { data } = await shopifyFetch<{ product: ShopifyProduct | null }>({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
      tags: ['products', `product-${handle}`],
    })
    return data.product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return {
      title: 'Product Not Found | Decoupled Commerce',
    }
  }

  return {
    title: `${product.title} | Decoupled Commerce`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  }
}

export async function generateStaticParams() {
  // Demo mode: return mock product handles
  if (isDemoMode()) {
    return getMockProducts(100).map(p => ({ handle: p.handle }))
  }

  if (!isShopifyConfigured()) return []

  try {
    const { data } = await shopifyFetch<{
      products: { edges: { node: { handle: string } }[] }
    }>({
      query: GET_PRODUCTS,
      variables: { first: 100 },
    })

    return data.products.edges.map((edge) => ({
      handle: edge.node.handle,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params

  if (!isShopifyConfigured() && !isDemoMode()) {
    notFound()
  }

  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const images = product.images.edges.map((edge) => edge.node)
  const variants = product.variants.edges.map((edge) => edge.node)

  return <ProductDetail product={product} images={images} variants={variants} />
}
