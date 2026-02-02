/**
 * Demo Mode Module
 *
 * This file contains ALL demo/mock mode functionality.
 * To remove demo mode from a real project:
 * 1. Delete this file (lib/demo-mode.ts)
 * 2. Delete the data/mock/ directory
 * 3. Delete app/components/DemoModeBanner.tsx
 * 4. Remove DemoModeBanner from app/layout.tsx
 * 5. Remove demo mode checks from app/page.tsx
 */

// Import mock data for serverless compatibility
import productsData from '@/data/mock/products.json'
import collectionsData from '@/data/mock/collections.json'
import blogData from '@/data/mock/blog.json'

import { ShopifyProduct, ShopifyCollection } from './types'

/**
 * Check if demo mode is enabled via environment variable
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// Mock data map
const mockDataMap: Record<string, any> = {
  'products.json': productsData,
  'collections.json': collectionsData,
  'blog.json': blogData,
}

function loadMockData(filename: string): any {
  return mockDataMap[filename] || null
}

/**
 * Get mock products for demo mode
 */
export function getMockProducts(first: number = 8): ShopifyProduct[] {
  const data = loadMockData('products.json')
  return (data?.products || []).slice(0, first) as ShopifyProduct[]
}

/**
 * Get mock product by handle
 */
export function getMockProductByHandle(handle: string): ShopifyProduct | null {
  const products = getMockProducts(100)
  return products.find(p => p.handle === handle) || null
}

/**
 * Get mock collections for demo mode
 */
export function getMockCollections(first: number = 4): ShopifyCollection[] {
  const data = loadMockData('collections.json')
  return (data?.collections || []).slice(0, first) as ShopifyCollection[]
}

/**
 * Get mock collection by handle
 */
export function getMockCollectionByHandle(handle: string): ShopifyCollection | null {
  const collections = getMockCollections(100)
  return collections.find(c => c.handle === handle) || null
}

/**
 * Get mock blog posts for demo mode
 */
export function getMockBlogPosts(first: number = 10): any[] {
  const data = loadMockData('blog.json')
  return (data?.posts || []).slice(0, first)
}

/**
 * Get mock blog post by slug
 */
export function getMockBlogPostBySlug(slug: string): any | null {
  const posts = getMockBlogPosts(100)
  return posts.find(p => p.path === `/blog/${slug}` || p.slug === slug) || null
}

/**
 * Handle a GraphQL query with mock data (for Drupal blog content)
 * Returns the appropriate mock response based on the query
 */
export function handleMockQuery(body: string): any {
  try {
    const { query, variables } = JSON.parse(body)

    // Handle route queries for individual blog posts
    if (variables?.path) {
      const routePath = variables.path
      const posts = getMockBlogPosts(100)
      const post = posts.find(p => p.path === routePath)
      if (post) {
        return {
          data: {
            route: {
              __typename: 'RouteInternal',
              entity: post
            }
          }
        }
      }
    }

    // Handle blog listing queries
    if (query.includes('GetBlogPosts') || query.includes('nodeArticles')) {
      return {
        data: {
          nodeArticles: {
            __typename: 'NodeArticleConnection',
            nodes: getMockBlogPosts()
          }
        }
      }
    }

    // Return empty data for unmatched queries
    return { data: {} }
  } catch (error) {
    console.error('Mock query error:', error)
    return { data: {}, errors: [{ message: 'Mock data error' }] }
  }
}
