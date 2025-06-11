import { admin } from '@/access/admin'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { CollectionConfig } from 'payload'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  access: {
    read: anyone,
    create: admin,
    update: admin,
    delete: admin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'propertyTypes', 'icon'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the amenity or feature',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Basic Features', value: 'basic' },
        { label: 'Comfort & Convenience', value: 'comfort' },
        { label: 'Security & Safety', value: 'security' },
        { label: 'Recreation & Entertainment', value: 'recreation' },
        { label: 'Business & Work', value: 'business' },
        { label: 'Utilities & Infrastructure', value: 'utilities' },
        { label: 'Transportation & Access', value: 'transportation' },
        { label: 'Environmental', value: 'environmental' },
      ],
      admin: {
        description: 'Category of the amenity',
      },
    },
    {
      name: 'propertyTypes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Land', value: 'land' },
      ],
      admin: {
        description: 'Property types this amenity applies to',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of the amenity',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Icon representing this amenity',
      },
    },
  ],
}
