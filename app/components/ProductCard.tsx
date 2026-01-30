'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Eye } from 'lucide-react'
import { ShopifyProduct } from '@/lib/types'
import { formatPrice } from '@/lib/shopify-client'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: ShopifyProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstVariant = product.variants.edges[0]?.node
  const price = product.priceRange.minVariantPrice
  const compareAtPrice = firstVariant?.compareAtPrice
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)

  const discountPercentage = hasDiscount
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAtPrice.amount)) * 100)
    : 0

  return (
    <div className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <Link
        href={`/products/${product.handle}`}
        className="block relative aspect-square overflow-hidden bg-gray-100"
      >
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.availableForSale && (
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Sold Out
            </span>
          )}
          {hasDiscount && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <Eye className="w-4 h-4" />
            Quick View
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        {product.vendor && (
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-1">
            {product.vendor}
          </p>
        )}
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {product.availableForSale && firstVariant && (
          <div className="mt-4">
            <AddToCartButton
              variantId={firstVariant.id}
              availableForSale={firstVariant.availableForSale}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  )
}
