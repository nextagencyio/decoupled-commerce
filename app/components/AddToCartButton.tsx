'use client'

import { useState } from 'react'
import { ShoppingCart, Loader2, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import clsx from 'clsx'

interface AddToCartButtonProps {
  variantId: string
  availableForSale: boolean
  quantity?: number
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function AddToCartButton({
  variantId,
  availableForSale,
  quantity = 1,
  size = 'md',
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = async () => {
    if (!availableForSale || isLoading || added) return

    await addToCart(variantId, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={handleClick}
      disabled={!availableForSale || isLoading}
      className={clsx(
        'btn transition-all duration-200',
        sizeClasses[size],
        fullWidth && 'w-full',
        !availableForSale
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : added
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'btn-primary'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : added ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added!
        </>
      ) : !availableForSale ? (
        'Sold Out'
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </button>
  )
}
