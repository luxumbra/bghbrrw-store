import Image from 'next/image'
import Link from 'next/link'
import { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/client'
import { CalloutBlock, InternalLinkAnnotation, LinkAnnotation } from '@/types/sanity'

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-lg aspect-video">
            <Image
              src={urlFor(value.asset).width(800).height(450).url()}
              alt={value.alt || 'Image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-center text-gray-600">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    callout: ({ value }: { value: CalloutBlock }) => {
      const typeStyles = {
        info: 'border-blue-200 bg-blue-50 text-blue-800',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        success: 'border-green-200 bg-green-50 text-green-800',
        error: 'border-red-200 bg-red-50 text-red-800',
      }

      return (
        <div className={`p-4 border-l-4 rounded-r-md my-6 ${typeStyles[value.type]}`}>
          <p className="m-0">{value.text}</p>
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value: LinkAnnotation }) => {
      const target = value.blank ? '_blank' : undefined
      const rel = value.blank ? 'noopener noreferrer' : undefined

      return (
        <a
          href={value.href}
          target={target}
          rel={rel}
          className="text-blue-600 hover:underline"
        >
          {children}
        </a>
      )
    },
    internalLink: ({ children, value }: { children: React.ReactNode; value: InternalLinkAnnotation }) => {
      const { reference } = value
      const href = reference._type === 'blogPost'
        ? `/blog/${reference.slug.current}`
        : `/${reference.slug.current}`

      return (
        <Link href={href} className="text-blue-600 hover:underline">
          {children}
        </Link>
      )
    },
  },
  block: {
    h1: ({ children }) => (
      <h1>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4>{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="pl-4 my-6 italic border-l-4 border-gray-300">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="pl-6 my-4 space-y-2 list-disc">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="pl-6 my-4 space-y-2 list-decimal">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
}
