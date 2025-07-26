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
          {title: 'Blue', value: '#3B82F6'},
          {title: 'Green', value: '#10B981'},
          {title: 'Purple', value: '#8B5CF6'},
          {title: 'Red', value: '#EF4444'},
          {title: 'Yellow', value: '#F59E0B'},
          {title: 'Pink', value: '#EC4899'},
          {title: 'Gray', value: '#6B7280'},
        ],
        layout: 'radio'
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