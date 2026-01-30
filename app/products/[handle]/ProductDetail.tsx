'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react'
import { ShopifyProduct, ShopifyProductVariant, ShopifyImage } from '@/lib/types'
import { formatPrice } from '@/lib/shopify-client'
import ProductGallery from '../../components/ProductGallery'
import VariantSelector from '../../components/VariantSelector'
import AddToCartButton from '../../components/AddToCartButton'

interface ProductDetailProps {
  product: ShopifyProduct
  images: ShopifyImage[]
  variants: ShopifyProductVariant[]
}

export default function ProductDetail({ product, images, variants }: ProductDetailProps) {
  // Initialize with first available variant's options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const firstVariant = variants.find((v) => v.availableForSale) || variants[0]
    return firstVariant?.selectedOptions.reduce(
      (acc, opt) => ({ ...acc, [opt.name]: opt.value }),
      {}
    ) || {}
  })

  const [quantity, setQuantity] = useState(1)

  // Find the variant that matches selected options
  const selectedVariant = useMemo(() => {
    return variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [variants, selectedOptions])

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }))
  }

  const price = selectedVariant?.price || product.priceRange.minVariantPrice
  const compareAtPrice = selectedVariant?.compareAtPrice
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <ProductGallery images={images} productTitle={product.title} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Vendor */}
            <div>
              {product.vendor && (
                <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                  </span>
                  <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                    Sale
                  </span>
                </>
              )}
            </div>

            {/* Availability */}
            {selectedVariant && (
              <p className={`text-sm ${selectedVariant.availableForSale ? 'text-green-600' : 'text-red-600'}`}>
                {selectedVariant.availableForSale
                  ? selectedVariant.quantityAvailable > 0
                    ? `${selectedVariant.quantityAvailable} in stock`
                    : 'In stock'
                  : 'Out of stock'}
              </p>
            )}

            {/* Variant Selector */}
            <VariantSelector
              options={product.options}
              variants={variants}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
            />

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg w-32">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            {selectedVariant && (
              <AddToCartButton
                variantId={selectedVariant.id}
                availableForSale={selectedVariant.availableForSale}
                quantity={quantity}
                size="lg"
                fullWidth
              />
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-600">Secure Checkout</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>

            {/* Description */}
            {product.descriptionHtml && (
              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <div
                  className="prose prose-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
