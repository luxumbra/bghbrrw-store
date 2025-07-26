'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@/types/sanity'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export default function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }

    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ''
    
    router.push(`/blog${url}`)
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Posts
        </button>
        
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryChange(category.slug.current)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.slug.current
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.title}
            {category.postCount && category.postCount > 0 && (
              <span className="ml-1 opacity-70">({category.postCount})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}