import { defineQuery } from 'next-sanity'

// Blog post queries
export const blogPostsQuery = defineQuery(`
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    featured,
    mainImage {
      asset,
      alt
    },
    author-> {
      name,
      slug,
      image
    },
    categories[]-> {
      title,
      slug,
      color
    }
  }
`)

export const featuredBlogPostsQuery = defineQuery(`
  *[_type == "blogPost" && featured == true && defined(slug.current)] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset,
      alt
    },
    author-> {
      name,
      slug,
      image
    },
    categories[]-> {
      title,
      slug,
      color
    }
  }
`)

export const blogPostBySlugQuery = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    body,
    mainImage {
      asset,
      alt
    },
    author-> {
      name,
      slug,
      bio,
      image,
      website,
      socialLinks
    },
    categories[]-> {
      title,
      slug,
      description,
      color
    },
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`)

export const relatedBlogPostsQuery = defineQuery(`
  *[_type == "blogPost" && _id != $currentPostId && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset,
      alt
    },
    author-> {
      name,
      slug
    },
    categories[]-> {
      title,
      slug,
      color
    }
  }
`)

// Content page queries
export const contentPageBySlugQuery = defineQuery(`
  *[_type == "contentPage" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    pageType,
    content,
    lastUpdated,
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`)

export const contentPageByTypeQuery = defineQuery(`
  *[_type == "contentPage" && pageType == $pageType][0] {
    _id,
    title,
    slug,
    pageType,
    content,
    lastUpdated,
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`)

// Category queries
export const categoriesQuery = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "postCount": count(*[_type == "blogPost" && references(^._id)])
  }
`)

export const blogPostsByCategoryQuery = defineQuery(`
  *[_type == "blogPost" && $categoryId in categories[]._ref] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset,
      alt
    },
    author-> {
      name,
      slug,
      image
    },
    categories[]-> {
      title,
      slug,
      color
    }
  }
`)

// Author queries
export const authorsQuery = defineQuery(`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    bio,
    image,
    website,
    socialLinks,
    "postCount": count(*[_type == "blogPost" && author._ref == ^._id])
  }
`)

export const blogPostsByAuthorQuery = defineQuery(`
  *[_type == "blogPost" && author._ref == $authorId] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage {
      asset,
      alt
    },
    categories[]-> {
      title,
      slug,
      color
    }
  }
`)