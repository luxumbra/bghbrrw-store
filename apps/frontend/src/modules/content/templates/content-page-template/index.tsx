import { format } from 'date-fns'
import { PortableText } from '@portabletext/react'
import type { ContentPage } from '@/types/sanity'
import { portableTextComponents } from '@/modules/content/components/portable-text'

interface ContentPageTemplateProps {
  page: ContentPage
}

export default function ContentPageTemplate({ page }: ContentPageTemplateProps) {
  const lastUpdated = new Date(page.lastUpdated)

  return (
    <div className="py-16 content-container">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {page.title}
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {format(lastUpdated, 'MMMM d, yyyy')}
          </p>
        </header>

        <div className="leading-relaxed prose prose-lg post-content lg:prose-xl prose-invert max-w-none">
          <PortableText
            value={page.content}
            components={portableTextComponents}
          />
        </div>
      </div>
    </div>
  )
}
