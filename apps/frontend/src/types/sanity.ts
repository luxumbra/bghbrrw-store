import { PortableTextBlock } from '@portabletext/types'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface SanityImage {
  asset: SanityImageSource
  alt?: string
  caption?: string
}

export interface Author {
  _id: string
  name: string
  slug: {
    current: string
  }
  image?: SanityImage
  bio?: PortableTextBlock[]
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

export interface Category {
  _id: string
  title: string
  slug: {
    current: string
  }
  description?: string
  color?: string
  postCount?: number
}

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  author: Author
  mainImage?: SanityImage
  categories: Category[]
  publishedAt: string
  excerpt: string
  body?: PortableTextBlock[]
  featured?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

export interface ContentPage {
  _id: string
  title: string
  slug: {
    current: string
  }
  pageType: 'about' | 'privacy' | 'terms' | 'contact' | 'faq' | 'other'
  content: PortableTextBlock[]
  lastUpdated: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

export interface CalloutBlock {
  _type: 'callout'
  type: 'info' | 'warning' | 'success' | 'error'
  text: string
}

export interface InternalLinkAnnotation {
  _type: 'internalLink'
  reference: {
    _type: string
    slug: {
      current: string
    }
  }
}

export interface LinkAnnotation {
  _type: 'link'
  href: string
  blank?: boolean
}