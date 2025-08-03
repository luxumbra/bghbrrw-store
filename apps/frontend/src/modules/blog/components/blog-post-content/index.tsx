import Image from "next/image"
import { format } from "date-fns"
import { PortableText } from "@portabletext/react"
import type { BlogPost } from "@/types/sanity"
import { urlFor } from "@/sanity/lib/client"
import { portableTextComponents } from "@/modules/content/components/portable-text"
import { Icon } from "@iconify/react"

interface BlogPostContentProps {
  post: BlogPost
  countryCode: string
}

export default function BlogPostContent({
  post,
  countryCode,
}: BlogPostContentProps) {
  const publishedDate = new Date(post.publishedAt)

  return (
    <article className="max-w-4xl mx-auto prose prose-xl prose-invert">
      <header className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center justify-start gap-2">
          {post.categories.map((category) => (
            <span
              key={category.slug.current}
              className="inline-block px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: category.color || "#333",
                color: "#fff",
              }}
            >
              {category.title}
            </span>
          ))}
                      </div>
          <div className="flex items-center justify-end gap-2">
            {post.author.image && (
              <div className="relative w-6 h-6">
                <Image
                  src={urlFor(post.author.image.asset)
                    .width(16)
                    .height(16)
                    .url()}
                  alt={post.author.name}
                  fill
                  className="object-cover my-0 rounded-full"
                />
              </div>
            )}
            <p className="inline-flex gap-1 text-sm text-gray-400">
              Written by: {post.author.name}
            </p>
            <div className="inline-flex items-center gap-1 pl-2 text-sm text-gray-400 border-l-2 border-gray-600">
              <Icon icon="mdi:calendar-outline" className="size-5" />
              <time dateTime={post.publishedAt} className="">
                {format(publishedDate, "MMMM d, yyyy")}
              </time>
            </div>
          </div>
        </div>

        <h1 className="font-normal text-copy-color">{post.title}</h1>

        <p className="mb-6 text-xl leading-normal font-body font-extralight xl:text-3xl">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 pb-6 mb-8 border-b">
          <div className="flex items-center gap-3">
            {/* {post.author.image && (
              <div className="relative w-12 h-12">
                <Image
                  src={urlFor(post.author.image.asset)
                    .width(48)
                    .height(48)
                    .url()}
                  alt={post.author.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )} */}
          </div>
        </div>
      </header>

      {post.mainImage && (
        <div className="relative mb-8 overflow-hidden rounded-lg aspect-video">
          <Image
            src={urlFor(post.mainImage.asset).width(1200).height(675).url()}
            alt={post.mainImage.alt || post.title}
            fill
            className="object-cover"
            priority
          />
          {post.mainImage.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-sm text-white bg-black/50">
              {post.mainImage.caption}
            </figcaption>
          )}
        </div>
      )}

      <div className="prose prose-lg prose-invert max-w-none">
        {post.body && (
          <PortableText value={post.body} components={portableTextComponents} />
        )}
      </div>

      {post.author.bio && (
        <div className="p-6 mt-12 rounded-lg shadow-inner bg-zinc-800 shadow-black">
          <h3 className="mb-3 text-lg font-semibold">About the Author</h3>
          <div className="flex gap-4">
            {post.author.image && (
              <div className="relative flex-shrink-0 w-16 h-16">
                <Image
                  src={urlFor(post.author.image.asset)
                    .width(64)
                    .height(64)
                    .url()}
                  alt={post.author.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <div>
              <h4 className="mb-2 font-medium">{post.author.name}</h4>
              <div className="prose-sm prose prose-invert">
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
