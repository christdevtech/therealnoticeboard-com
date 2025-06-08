import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'region'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      admin: {
        description: 'City or town name',
      },
    },
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'Adamawa', value: 'adamawa' },
        { label: 'Centre', value: 'centre' },
        { label: 'East', value: 'east' },
        { label: 'Far North', value: 'far-north' },
        { label: 'Littoral', value: 'littoral' },
        { label: 'North', value: 'north' },
        { label: 'Northwest', value: 'northwest' },
        { label: 'South', value: 'south' },
        { label: 'Southwest', value: 'southwest' },
        { label: 'West', value: 'west' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of the neighborhood',
      },
    },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            description: 'Latitude coordinate',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            description: 'Longitude coordinate',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
