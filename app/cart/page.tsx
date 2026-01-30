'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/shopify-client'

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart()

  const lines = cart?.lines.edges.map(edge => edge.node) || []
  const subtotal = cart?.cost.subtotalAmount
  const total = cart?.cost.totalAmount

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="bg-white rounded-xl p-6 flex gap-6"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {line.merchandise.product.featuredImage ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    className="font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-sm text-gray-500 mt-1">{line.merchandise.title}</p>
                  )}
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatPrice(
                      line.merchandise.price.amount,
                      line.merchandise.price.currencyCode
                    )}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(line.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(
                      (parseFloat(line.merchandise.price.amount) * line.quantity).toFixed(2),
                      line.merchandise.price.currencyCode
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 border-b pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    {subtotal
                      ? formatPrice(subtotal.amount, subtotal.currencyCode)
                      : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                <span>Total</span>
                <span>
                  {total
                    ? formatPrice(total.amount, total.currencyCode)
                    : '$0.00'}
                </span>
              </div>

              <a
                href={cart?.checkoutUrl || '#'}
                className="btn btn-primary w-full py-3 text-center"
              >
                Proceed to Checkout
              </a>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout powered by Shopify
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
