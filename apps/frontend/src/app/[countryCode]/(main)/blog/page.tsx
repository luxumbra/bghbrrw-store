import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/client'
import { blogPostsQuery, categoriesQuery } from '@/sanity/lib/queries'
import { BlogPost, Category } from '@/types/sanity'
import BlogPostCard from '@/modules/blog/components/blog-post-card'
import CategoryFilter from '@/modules/blog/components/category-filter'

export const metadata: Metadata = {
  title: 'Blog - Bough & Burrow',
  description: 'Discover the latest news, tips, and insights from Bough & Burrow.',
}

interface BlogPageProps {
  params: {
    countryCode: string
  }
  searchParams: {
    category?: string
  }
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  let blogPosts: BlogPost[] = []
  let categories: Category[] = []

  try {
    const results = await Promise.all([
      sanityFetch<BlogPost[]>({
        query: blogPostsQuery,
        tags: ['blogPost'],
        revalidate: 300, // 5 minutes
      }),
      sanityFetch<Category[]>({
        query: categoriesQuery,
        tags: ['category'],
        revalidate: 3600, // 1 hour
      }),
    ])
    blogPosts = results[0] || []
    categories = results[1] || []
  } catch (error) {
    console.error('Failed to fetch blog data:', error)
  }

  const filteredPosts = searchParams.category
    ? blogPosts.filter(post =>
        post.categories.some(cat => cat.slug.current === searchParams.category)
      )
    : blogPosts

  return (
    <div className="py-16 content-container">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Blog</h1>
        <p className="max-w-2xl text-xl">
          Discover the latest news, tips, and insights from our team at Bough & Burrow.
        </p>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={searchParams.category}
      />

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogPostCard
              key={post._id}
              post={post}
              countryCode={params.countryCode}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">
            {searchParams.category
              ? `No posts found in the "${searchParams.category}" category.`
              : blogPosts.length === 0
                ? 'Welcome to the blog! No posts available yet. Please add some content in Sanity Studio.'
                : 'No blog posts found.'
            }
          </p>
          {blogPosts.length === 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Access Sanity Studio at <a href="http://localhost:3333" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">http://localhost:3333</a> to create your first blog post.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
