import Image from 'next/image'
import { format } from 'date-fns'
import { PortableText } from '@portabletext/react'
import { BlogPost } from '@/types/sanity'
import { urlFor } from '@/sanity/lib/client'
import { portableTextComponents } from '@/modules/content/components/portable-text'

interface BlogPostContentProps {
  post: BlogPost
  countryCode: string
}

export default function BlogPostContent({ post, countryCode }: BlogPostContentProps) {
  const publishedDate = new Date(post.publishedAt)

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {post.categories.map((category) => (
            <span
              key={category._id}
              className="inline-block px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: category.color || '#e5e7eb',
                color: '#374151'
              }}
            >
              {category.title}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 pb-6 mb-8 border-b">
          <div className="flex items-center gap-3">
            {post.author.image && (
              <div className="relative w-12 h-12">
                <Image
                  src={urlFor(post.author.image.asset).width(48).height(48).url()}
                  alt={post.author.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <time 
                dateTime={post.publishedAt}
                className="text-sm text-gray-500"
              >
                {format(publishedDate, 'MMMM d, yyyy')}
              </time>
            </div>
          </div>
        </div>
      </header>

      {post.mainImage && (
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={urlFor(post.mainImage.asset).width(1200).height(675).url()}
            alt={post.mainImage.alt || post.title}
            fill
            className="object-cover"
            priority
          />
          {post.mainImage.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-sm">
              {post.mainImage.caption}
            </figcaption>
          )}
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {post.body && (
          <PortableText 
            value={post.body} 
            components={portableTextComponents}
          />
        )}
      </div>

      {post.author.bio && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">About the Author</h3>
          <div className="flex gap-4">
            {post.author.image && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={urlFor(post.author.image.asset).width(64).height(64).url()}
                  alt={post.author.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{post.author.name}</h4>
              <div className="prose prose-sm">
                <PortableText 
                  value={post.author.bio} 
                  components={portableTextComponents}
                />
              </div>
              {(post.author.website || post.author.socialLinks) && (
                <div className="flex gap-3 mt-3">
                  {post.author.website && (
                    <a 
                      href={post.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  )}
                  {post.author.socialLinks?.twitter && (
                    <a 
                      href={post.author.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Twitter
                    </a>
                  )}
                  {post.author.socialLinks?.linkedin && (
                    <a 
                      href={post.author.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}