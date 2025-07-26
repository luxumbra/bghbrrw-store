import { BlogPost } from '@/types/sanity'
import BlogPostCard from '../blog-post-card'

interface RelatedPostsProps {
  posts: BlogPost[]
  countryCode: string
}

export default function RelatedPosts({ posts, countryCode }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard 
            key={post._id} 
            post={post} 
            countryCode={countryCode}
          />
        ))}
      </div>
    </section>
  )
}