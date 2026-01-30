'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/shopify-client'

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateQuantity, removeFromCart } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeCart])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeCart])

  const lines = cart?.lines.edges.map(edge => edge.node) || []
  const subtotal = cart?.cost.subtotalAmount

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Your Cart</h2>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={closeCart}
                  className="btn btn-primary"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {line.merchandise.product.featuredImage ? (
                        <Image
                          src={line.merchandise.product.featuredImage.url}
                          alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        onClick={closeCart}
                        className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== 'Default Title' && (
                        <p className="text-sm text-gray-500">{line.merchandise.title}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatPrice(
                          line.merchandise.price.amount,
                          line.merchandise.price.currencyCode
                        )}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          disabled={isLoading}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(line.id)}
                          disabled={isLoading}
                          className="ml-4 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {lines.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>
                  {subtotal
                    ? formatPrice(subtotal.amount, subtotal.currencyCode)
                    : '$0.00'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout
              </p>
              <a
                href={cart?.checkoutUrl || '#'}
                className="btn btn-primary w-full py-3"
              >
                Checkout
              </a>
              <button
                onClick={closeCart}
                className="btn btn-secondary w-full"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
