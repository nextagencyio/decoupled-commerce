'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { Menu, X, ShoppingBag, Store } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Collections', href: '/collections' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cart, openCart } = useCart()

  const totalQuantity = cart?.totalQuantity || 0

  const getActiveTab = () => {
    if (pathname === '/') return 'Home'
    for (const item of navigationItems) {
      if (item.href !== '/' && pathname.startsWith(item.href)) {
        return item.name
      }
    }
    return null
  }

  const activeTab = getActiveTab()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              Decoupled Commerce
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.name
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {totalQuantity > 9 ? '9+' : totalQuantity}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    activeTab === item.name
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
