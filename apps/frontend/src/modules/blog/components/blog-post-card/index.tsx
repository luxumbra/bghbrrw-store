import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import type { BlogPost } from "@/types/sanity"
import { urlFor } from "@/sanity/lib/client"

interface BlogPostCardProps {
  post: BlogPost
  countryCode: string
}

export default function BlogPostCard({ post, countryCode }: BlogPostCardProps) {
  const publishedDate = new Date(post.publishedAt)
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })

  return (
    <article className="overflow-hidden transition-shadow duration-300 rounded-lg shadow-md bg-zinc-800 hover:shadow-lg">
      <Link href={`/${countryCode}/blog/${post.slug.current}`}>
        {post.mainImage && (
          <div className="relative aspect-video">
            <Image
              src={urlFor(post.mainImage.asset).width(600).height(340).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-6">
          {post.categories && (
            <div className="flex items-center gap-2 mb-3">
              {post.categories.map((category) => (
                <span
                  key={`${post.slug.current}-${category._id}-${category.slug.current}`}
                  className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: category.color || "#18181b",
                    color: "#fff",
                  }}
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}

          <h2 className="mb-2 text-xl line-clamp-2">
            {post.title}
          </h2>

          <p className="mb-4 line-clamp-3">{post.excerpt}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {post.author.image && (
                <div className="relative w-6 h-6">
                  <Image
                    src={urlFor(post.author.image.asset)
                      .width(24)
                      .height(24)
                      .url()}
                    alt={post.author.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              )}
              <span>{post.author.name}</span>
            </div>
            <time dateTime={post.publishedAt}>{timeAgo}</time>
          </div>
        </div>
      </Link>
    </article>
  )
}
