import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/client'
import { blogPostBySlugQuery, relatedBlogPostsQuery } from '@/sanity/lib/queries'
import { BlogPost } from '@/types/sanity'
import BlogPostContent from '@/modules/blog/components/blog-post-content'
import RelatedPosts from '@/modules/blog/components/related-posts'

interface BlogPostPageProps {
  params: {
    countryCode: string
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await sanityFetch<BlogPost>({
    query: blogPostBySlugQuery,
    params: { slug: params.slug },
    tags: ['blogPost'],
  })

  if (!post) {
    return {
      title: 'Post Not Found - Bough & Burrow',
    }
  }

  const { seo, title, excerpt, mainImage } = post

  return {
    title: seo?.metaTitle || `${title} - Bough & Burrow Blog`,
    description: seo?.metaDescription || excerpt,
    keywords: seo?.keywords,
    openGraph: {
      title: seo?.metaTitle || title,
      description: seo?.metaDescription || excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: mainImage ? [
        {
          url: `${mainImage.asset}?w=1200&h=630&fit=crop`,
          width: 1200,
          height: 630,
          alt: mainImage.alt || title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.metaTitle || title,
      description: seo?.metaDescription || excerpt,
      images: mainImage ? [`${mainImage.asset}?w=1200&h=630&fit=crop`] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await sanityFetch<BlogPost>({
    query: blogPostBySlugQuery,
    params: { slug: params.slug },
    tags: ['blogPost'],
  })

  if (!post) {
    notFound()
  }

  const categoryIds = post.categories.map(cat => cat._id)
  const relatedPosts = await sanityFetch<BlogPost[]>({
    query: relatedBlogPostsQuery,
    params: { 
      currentPostId: post._id,
      categoryIds 
    },
    tags: ['blogPost'],
  })

  return (
    <div className="content-container py-16">
      <BlogPostContent post={post} countryCode={params.countryCode} />
      
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-16 border-t">
          <RelatedPosts 
            posts={relatedPosts} 
            countryCode={params.countryCode} 
          />
        </div>
      )}
    </div>
  )
}