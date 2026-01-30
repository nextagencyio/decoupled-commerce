import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, Newspaper } from 'lucide-react'
import { DrupalArticle } from '@/lib/types'

interface ArticleCardProps {
  article: DrupalArticle
  featured?: boolean
}

function formatDate(timestamp: string): string {
  return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const excerpt = article.body.summary ||
    article.body.processed.replace(/<[^>]+>/g, '').slice(0, 160) + '...'

  if (featured) {
    return (
      <Link
        href={article.path}
        className="group relative rounded-2xl overflow-hidden h-full min-h-[400px] shadow-lg"
      >
        {article.featuredImage?.url ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Newspaper className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">
            {article.title}
          </h3>
          <p className="text-white/80 mb-4 line-clamp-2">{excerpt}</p>
          {article.created && (
            <div className="flex items-center text-white/60 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(article.created)}
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={article.path}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {article.featuredImage?.url ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <span className="text-5xl font-bold text-white/30">{article.title[0]}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>

        <div className="flex items-center justify-between text-sm">
          {article.created && (
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(article.created)}
            </div>
          )}
          <span className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
            Read more
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}
