import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { apolloClient, isDrupalConfigured } from '@/lib/apollo-client'
import { GET_PAGE_BY_PATH, GET_ALL_PAGE_PATHS } from '@/lib/drupal-queries'
import { DrupalPage } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string[] }>
}

async function getPage(path: string): Promise<DrupalPage | null> {
  if (!isDrupalConfigured()) return null

  try {
    const { data } = await apolloClient.query({
      query: GET_PAGE_BY_PATH,
      variables: { path },
    })

    const entity = data.route?.entity
    if (!entity) return null

    return {
      id: entity.id,
      title: entity.title,
      path: entity.path,
      body: {
        processed: entity.body?.processed || '',
      },
      heroImage: entity.heroImage,
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const page = await getPage(path)

  if (!page) {
    return {
      title: 'Page Not Found | Decoupled Commerce',
    }
  }

  return {
    title: `${page.title} | Decoupled Commerce`,
    description: page.body.processed.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: page.title,
      images: page.heroImage ? [page.heroImage.url] : [],
    },
  }
}

export async function generateStaticParams() {
  if (!isDrupalConfigured()) return []

  try {
    const { data } = await apolloClient.query({
      query: GET_ALL_PAGE_PATHS,
    })

    return data.nodePages?.nodes.map((node: { path: string }) => ({
      slug: node.path.split('/').filter(Boolean),
    })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params
  const path = '/' + slug.join('/')

  // Don't handle known routes
  const knownRoutes = ['/products', '/collections', '/blog', '/cart']
  if (knownRoutes.some((route) => path.startsWith(route))) {
    notFound()
  }

  if (!isDrupalConfigured()) {
    notFound()
  }

  const page = await getPage(path)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      {page.heroImage && (
        <div className="relative h-[30vh] md:h-[40vh] bg-gray-900">
          <Image
            src={page.heroImage.url}
            alt={page.heroImage.alt || page.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              {page.title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title (if no hero) */}
        {!page.heroImage && (
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            {page.title}
          </h1>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600"
          dangerouslySetInnerHTML={{ __html: page.body.processed }}
        />
      </div>
    </div>
  )
}
