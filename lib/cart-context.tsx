'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { ShopifyCart, ShopifyCartLine } from './types'
import { shopifyFetch } from './shopify-client'
import { CREATE_CART, ADD_TO_CART, UPDATE_CART_LINE, REMOVE_FROM_CART, GET_CART } from './shopify-queries'

interface CartState {
  cart: ShopifyCart | null
  isLoading: boolean
  isOpen: boolean
}

type CartAction =
  | { type: 'SET_CART'; payload: ShopifyCart | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

interface CartContextType extends CartState {
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeFromCart: (lineId: string) => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_ID_KEY = 'shopify_cart_id'

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: false,
    isOpen: false,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      const cartId = localStorage.getItem(CART_ID_KEY)
      if (cartId) {
        try {
          const { data } = await shopifyFetch<{ cart: ShopifyCart | null }>({
            query: GET_CART,
            variables: { cartId },
            cache: 'no-store',
          })
          if (data.cart) {
            dispatch({ type: 'SET_CART', payload: data.cart })
          } else {
            // Cart not found, clear storage
            localStorage.removeItem(CART_ID_KEY)
          }
        } catch (error) {
          console.error('Error loading cart:', error)
          localStorage.removeItem(CART_ID_KEY)
        }
      }
    }
    loadCart()
  }, [])

  const addToCart = async (variantId: string, quantity: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      let cart = state.cart

      if (!cart) {
        // Create new cart
        const { data } = await shopifyFetch<{
          cartCreate: { cart: ShopifyCart; userErrors: { message: string }[] }
        }>({
          query: CREATE_CART,
          variables: {
            lines: [{ merchandiseId: variantId, quantity }],
          },
          cache: 'no-store',
        })

        if (data.cartCreate.userErrors.length > 0) {
          console.error('Cart creation errors:', data.cartCreate.userErrors)
          return
        }

        cart = data.cartCreate.cart
        localStorage.setItem(CART_ID_KEY, cart.id)
      } else {
        // Add to existing cart
        const { data } = await shopifyFetch<{
          cartLinesAdd: { cart: ShopifyCart; userErrors: { message: string }[] }
        }>({
          query: ADD_TO_CART,
          variables: {
            cartId: cart.id,
            lines: [{ merchandiseId: variantId, quantity }],
          },
          cache: 'no-store',
        })

        if (data.cartLinesAdd.userErrors.length > 0) {
          console.error('Add to cart errors:', data.cartLinesAdd.userErrors)
          return
        }

        cart = data.cartLinesAdd.cart
      }

      dispatch({ type: 'SET_CART', payload: cart })
      dispatch({ type: 'OPEN_CART' })
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!state.cart) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      if (quantity === 0) {
        await removeFromCart(lineId)
        return
      }

      const { data } = await shopifyFetch<{
        cartLinesUpdate: { cart: ShopifyCart; userErrors: { message: string }[] }
      }>({
        query: UPDATE_CART_LINE,
        variables: {
          cartId: state.cart.id,
          lines: [{ id: lineId, quantity }],
        },
        cache: 'no-store',
      })

      if (data.cartLinesUpdate.userErrors.length > 0) {
        console.error('Update cart errors:', data.cartLinesUpdate.userErrors)
        return
      }

      dispatch({ type: 'SET_CART', payload: data.cartLinesUpdate.cart })
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const removeFromCart = async (lineId: string) => {
    if (!state.cart) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const { data } = await shopifyFetch<{
        cartLinesRemove: { cart: ShopifyCart; userErrors: { message: string }[] }
      }>({
        query: REMOVE_FROM_CART,
        variables: {
          cartId: state.cart.id,
          lineIds: [lineId],
        },
        cache: 'no-store',
      })

      if (data.cartLinesRemove.userErrors.length > 0) {
        console.error('Remove from cart errors:', data.cartLinesRemove.userErrors)
        return
      }

      dispatch({ type: 'SET_CART', payload: data.cartLinesRemove.cart })
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })
  const openCart = () => dispatch({ type: 'OPEN_CART' })
  const closeCart = () => dispatch({ type: 'CLOSE_CART' })

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
