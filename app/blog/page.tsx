import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { apolloClient, isDrupalConfigured } from '@/lib/apollo-client'
import { GET_ARTICLES } from '@/lib/drupal-queries'
import { DrupalArticle } from '@/lib/types'
import { isDemoMode, getMockBlogPosts } from '@/lib/demo-mode'
import ArticleCard from '../components/ArticleCard'

export const metadata: Metadata = {
  title: 'Blog | Decoupled Commerce',
  description: 'Read our latest articles and updates',
}

async function getArticles(): Promise<DrupalArticle[]> {
  // Demo mode: return mock blog posts
  if (isDemoMode()) {
    return getMockBlogPosts(20) as DrupalArticle[]
  }

  if (!isDrupalConfigured()) return []

  try {
    const { data } = await apolloClient.query({
      query: GET_ARTICLES,
      variables: { first: 20 },
    })

    return data.nodeArticles?.nodes.map((node: any) => ({
      id: node.id,
      title: node.title,
      path: node.path,
      created: node.created?.timestamp,
      body: {
        processed: node.body?.processed || '',
        summary: node.body?.summary || '',
      },
      featuredImage: node.featuredImage,
    })) || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function BlogPage() {
  const drupalConfigured = isDrupalConfigured() || isDemoMode()
  const articles = await getArticles()

  if (!drupalConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Blog</h1>
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Drupal Not Configured</h2>
            <p className="text-gray-600 mb-6">
              Blog content is powered by Drupal. Run the setup script to connect your Drupal space.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 inline-block">
              <code className="text-sm text-gray-800">npm run setup</code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Blog</h1>
          <p className="mt-2 text-lg text-gray-600">
            Latest articles and updates
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No articles found.</p>
            <p className="text-sm text-gray-400">
              Import sample content with: <code className="bg-gray-100 px-2 py-1 rounded">npm run setup-content</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
