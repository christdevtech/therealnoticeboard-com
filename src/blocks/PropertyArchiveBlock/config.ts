import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const PropertyArchive: Block = {
  slug: 'propertyArchive',
  interfaceName: 'PropertyArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'properties',
      label: 'Collections To Show',
      options: [
        {
          label: 'Properties',
          value: 'properties',
        },
      ],
    },
    {
      name: 'propertyTypes',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Property Types To Show',
      options: [
        {
          label: 'Residential',
          value: 'residential',
        },
        {
          label: 'Commercial',
          value: 'commercial',
        },
        {
          label: 'Industrial',
          value: 'industrial',
        },
        {
          label: 'Land',
          value: 'land',
        },
      ],
    },
    {
      name: 'listingTypes',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Listing Types To Show',
      options: [
        {
          label: 'For Sale',
          value: 'sale',
        },
        {
          label: 'For Rent',
          value: 'rent',
        },
      ],
    },
    {
      name: 'neighborhoods',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Neighborhoods To Show',
      relationTo: 'neighborhoods',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['properties'],
    },
  ],
  labels: {
    plural: 'Property Archives',
    singular: 'Property Archive',
  },
}