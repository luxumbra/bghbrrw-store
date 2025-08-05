import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          {title: 'Forest Green', value: '#2F5233'},
          {title: 'Bark Brown', value: '#5D4037'},
          {title: 'Stone Gray', value: '#455A64'},
          {title: 'Moss Green', value: '#558B2F'},
          {title: 'Clay Red', value: '#8D4A2B'},
          {title: 'Sage Green', value: '#689F84'},
          {title: 'Charcoal', value: '#37474F'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
