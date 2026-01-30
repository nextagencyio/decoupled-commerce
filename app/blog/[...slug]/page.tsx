import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft } from 'lucide-react'
import { apolloClient, isDrupalConfigured } from '@/lib/apollo-client'
import { GET_ARTICLE_BY_PATH, GET_ALL_ARTICLE_PATHS } from '@/lib/drupal-queries'
import { DrupalArticle } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string[] }>
}

async function getArticle(path: string): Promise<DrupalArticle | null> {
  if (!isDrupalConfigured()) return null

  try {
    const { data } = await apolloClient.query({
      query: GET_ARTICLE_BY_PATH,
      variables: { path },
    })

    const entity = data.route?.entity
    if (!entity) return null

    return {
      id: entity.id,
      title: entity.title,
      path: entity.path,
      created: entity.created?.timestamp,
      body: {
        processed: entity.body?.processed || '',
      },
      featuredImage: entity.featuredImage,
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const path = '/blog/' + slug.join('/')
  const article = await getArticle(path)

  if (!article) {
    return {
      title: 'Article Not Found | Decoupled Commerce',
    }
  }

  return {
    title: `${article.title} | Decoupled Commerce`,
    description: article.body.processed.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: article.title,
      images: article.featuredImage ? [article.featuredImage.url] : [],
    },
  }
}

export async function generateStaticParams() {
  if (!isDrupalConfigured()) return []

  try {
    const { data } = await apolloClient.query({
      query: GET_ALL_ARTICLE_PATHS,
    })

    return data.nodeArticles?.nodes.map((node: { path: string }) => {
      // Strip /blog/ prefix since route already includes it
      const pathWithoutBlog = node.path.replace(/^\/blog\//, '/')
      return {
        slug: pathWithoutBlog.split('/').filter(Boolean),
      }
    }) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const path = '/blog/' + slug.join('/')

  if (!isDrupalConfigured()) {
    notFound()
  }

  const article = await getArticle(path)

  if (!article) {
    notFound()
  }

  const date = article.created
    ? new Date(parseInt(article.created) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      {article.featuredImage && (
        <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b">
          {date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time>{date}</time>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600"
          dangerouslySetInnerHTML={{ __html: article.body.processed }}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm">
            Thanks for reading! Check out our <Link href="/products" className="text-primary-600 hover:underline">products</Link> or <Link href="/blog" className="text-primary-600 hover:underline">more articles</Link>.
          </p>
        </div>
      </article>
    </div>
  )
}
