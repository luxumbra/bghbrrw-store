import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'contentPage',
  title: 'Content Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          {title: 'About', value: 'about'},
          {title: 'Privacy Policy', value: 'privacy'},
          {title: 'Terms of Service', value: 'terms'},
          {title: 'Contact', value: 'contact'},
          {title: 'FAQ', value: 'faq'},
          {title: 'Other', value: 'other'}
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: Rule => Rule.max(60)
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          validation: Rule => Rule.max(160)
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
          options: {
            layout: 'tags'
          }
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType',
    },
    prepare(selection) {
      const {title, pageType} = selection
      return {
        title,
        subtitle: pageType ? pageType.charAt(0).toUpperCase() + pageType.slice(1) : 'Page'
      }
    },
  },
})