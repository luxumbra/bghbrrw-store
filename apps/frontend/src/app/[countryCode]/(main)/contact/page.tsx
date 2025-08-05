import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/client'
import { contentPageByTypeQuery } from '@/sanity/lib/queries'
import { ContentPage } from '@/types/sanity'
import ContentPageTemplate from '@/modules/content/templates/content-page-template'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<ContentPage>({
    query: contentPageByTypeQuery,
    params: { pageType: 'contact' },
    tags: ['contentPage'],
  })

  if (!page) {
    return {
      title: 'Contact Us',
      description: 'Get in touch with Bough & Burrow.',
    }
  }

  const { seo, title } = page

  return {
    title: seo?.metaTitle || `${title}`,
    description: seo?.metaDescription || 'Get in touch with Bough & Burrow.',
    keywords: seo?.keywords,
  }
}

export default async function ContactPage() {
  let page: ContentPage | null = null

  try {
    page = await sanityFetch<ContentPage>({
      query: contentPageByTypeQuery,
      params: { pageType: 'contact' },
      tags: ['contentPage'],
      revalidate: 3600, // 1 hour
    })
  } catch (error) {
    console.error('Failed to fetch about page:', error)
  }

  if (!page) {
    return (
      <div className="py-16 content-container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Contact Us
          </h1>
          <p className="mb-8 text-gray-600">
            This page is not yet available. Please create an "About" page in Sanity Studio.
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
