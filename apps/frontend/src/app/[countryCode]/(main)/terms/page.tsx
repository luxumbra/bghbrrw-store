import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/client'
import { contentPageByTypeQuery } from '@/sanity/lib/queries'
import type { ContentPage } from '@/types/sanity'
import ContentPageTemplate from '@/modules/content/templates/content-page-template'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<ContentPage>({
    query: contentPageByTypeQuery,
    params: { pageType: 'terms' },
    tags: ['contentPage'],
  })

  if (!page) {
    return {
      title: 'Terms of Service',
      description: 'Read our terms of service to understand our policies and guidelines.',
    }
  }

  const { seo, title } = page

  return {
    title: seo?.metaTitle || `${title}`,
    description: seo?.metaDescription || 'Read our terms of service to understand our policies and guidelines.',
    keywords: seo?.keywords,
  }
}

export default async function TermsPage() {
  let page: ContentPage | null = null

  try {
    page = await sanityFetch<ContentPage>({
      query: contentPageByTypeQuery,
      params: { pageType: 'terms' },
      tags: ['contentPage'],
      revalidate: 3600, // 1 hour
    })
  } catch (error) {
    console.error('Failed to fetch terms page:', error)
  }

  if (!page) {
    return (
      <div className="py-16 content-container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Terms of Service
          </h1>
          <p className="mb-8 text-gray-600">
            This page is not yet available. Please create a "Terms of Service" page in Sanity Studio.
          </p>
          <a
            href="http://localhost:3333"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Access Sanity Studio →
          </a>
        </div>
      </div>
    )
  }

  return <ContentPageTemplate page={page} />
}
