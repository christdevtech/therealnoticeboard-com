import type { CollectionConfig } from 'payload'

import { verifiedOrAdmin } from '../../access/verified'
import { propertiesRead, propertiesUpdate, propertiesDelete } from '../../access/properties'
import { slugField } from '@/fields/slug'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateProperty } from './hooks/revalidateProperty'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Properties: CollectionConfig = {
  slug: 'properties',
  access: {
    create: verifiedOrAdmin,
    read: propertiesRead,
    update: propertiesUpdate,
    delete: propertiesDelete,
  },
  defaultPopulate: {
    title: true,
    propertyType: true,
    listingType: true,
    area: true,
    images: true,
    owner: true,
    neighborhood: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'propertyType', 'listingType', 'price', 'status', 'owner'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'properties',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'properties',
        req,
      }),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Information',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                description: 'Property title or name',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Detailed description of the property',
              },
            },
            {
              name: 'propertyType',
              type: 'select',
              options: [
                {
                  label: 'Land',
                  value: 'land',
                },
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
              ],
              required: true,
              admin: {
                description: 'Type of property (land, residential, commercial, industrial)',
              },
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxDepth: 2,
            },
            {
              name: 'area',
              type: 'number',
              required: true,
              admin: {
                description: 'Area in square meters',
              },
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            {
              name: 'neighborhood',
              type: 'relationship',
              relationTo: 'neighborhoods',
              required: true,
            },
            {
              name: 'address',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Full address of the property',
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
                    description: 'Latitude coordinate for map display',
                  },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  admin: {
                    description: 'Longitude coordinate for map display',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Property Features',
          fields: [
            // Residential-specific features
            {
              name: 'residentialFeatures',
              type: 'group',
              admin: {
                condition: (data) => data.propertyType === 'residential',
              },
              fields: [
                {
                  name: 'bedrooms',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Number of bedrooms',
                  },
                },
                {
                  name: 'bathrooms',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Number of bathrooms',
                  },
                },
                {
                  name: 'floors',
                  type: 'number',
                  admin: {
                    description: 'Number of floors',
                  },
                },
                {
                  name: 'yearBuilt',
                  type: 'number',
                  admin: {
                    description: 'Year the property was built',
                  },
                },
              ],
            },
            // Commercial-specific features
            {
              name: 'commercialFeatures',
              type: 'group',
              admin: {
                condition: (data) => data.propertyType === 'commercial',
              },
              fields: [
                {
                  name: 'businessType',
                  type: 'select',
                  options: [
                    { label: 'Office', value: 'office' },
                    { label: 'Retail', value: 'retail' },
                    { label: 'Restaurant', value: 'restaurant' },
                    { label: 'Warehouse', value: 'warehouse' },
                    { label: 'Mixed Use', value: 'mixed' },
                    { label: 'Other', value: 'other' },
                  ],
                  admin: {
                    description: 'Type of commercial use',
                  },
                },
                {
                  name: 'floors',
                  type: 'number',
                  admin: {
                    description: 'Number of floors',
                  },
                },
                {
                  name: 'offices',
                  type: 'number',
                  admin: {
                    description: 'Number of offices/rooms',
                  },
                },
                {
                  name: 'yearBuilt',
                  type: 'number',
                  admin: {
                    description: 'Year the property was built',
                  },
                },
              ],
            },
            // Industrial-specific features
            {
              name: 'industrialFeatures',
              type: 'group',
              admin: {
                condition: (data) => data.propertyType === 'industrial',
              },
              fields: [
                {
                  name: 'industrialType',
                  type: 'select',
                  options: [
                    { label: 'Manufacturing', value: 'manufacturing' },
                    { label: 'Warehouse', value: 'warehouse' },
                    { label: 'Distribution Center', value: 'distribution' },
                    { label: 'Factory', value: 'factory' },
                    { label: 'Storage', value: 'storage' },
                    { label: 'Other', value: 'other' },
                  ],
                  admin: {
                    description: 'Type of industrial use',
                  },
                },
                {
                  name: 'ceilingHeight',
                  type: 'number',
                  admin: {
                    description: 'Ceiling height in meters',
                  },
                },
                {
                  name: 'loadingDocks',
                  type: 'number',
                  admin: {
                    description: 'Number of loading docks',
                  },
                },
                {
                  name: 'powerSupply',
                  type: 'text',
                  admin: {
                    description: 'Power supply specifications',
                  },
                },
                {
                  name: 'yearBuilt',
                  type: 'number',
                  admin: {
                    description: 'Year the property was built',
                  },
                },
              ],
            },
            // Land-specific features
            {
              name: 'landFeatures',
              type: 'group',
              admin: {
                condition: (data) => data.propertyType === 'land',
              },
              fields: [
                {
                  name: 'landType',
                  type: 'select',
                  options: [
                    { label: 'Residential Plot', value: 'residential' },
                    { label: 'Commercial Plot', value: 'commercial' },
                    { label: 'Agricultural', value: 'agricultural' },
                    { label: 'Industrial', value: 'industrial' },
                    { label: 'Mixed Use', value: 'mixed' },
                    { label: 'Undeveloped', value: 'undeveloped' },
                  ],
                  admin: {
                    description: 'Intended use of the land',
                  },
                },
                {
                  name: 'topography',
                  type: 'select',
                  options: [
                    { label: 'Flat', value: 'flat' },
                    { label: 'Sloped', value: 'sloped' },
                    { label: 'Hilly', value: 'hilly' },
                    { label: 'Irregular', value: 'irregular' },
                  ],
                  admin: {
                    description: 'Land topography',
                  },
                },
              ],
            },
            {
              name: 'amenities',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              admin: {
                description: 'Select amenities available for this property',
              },
              filterOptions: ({ siblingData }) => {
                return {
                  propertyTypes: {
                    contains: siblingData.propertyType,
                  },
                }
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          label: 'Contact Information',
          fields: [
            {
              name: 'contactInfo',
              type: 'group',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'email',
                  type: 'email',
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  admin: {
                    description: 'WhatsApp number for contact',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            // Auto-assign current user as owner on create
            if (operation === 'create' && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Price in XAF (Central African Franc)',
      },
    },
    {
      name: 'listingType',
      type: 'select',
      required: true,
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending Review',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Sold/Rented',
          value: 'sold',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Admin approval status',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Admin notes about this property',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Property',
      admin: {
        position: 'sidebar',
        description: 'Mark as featured property for homepage display',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateProperty],
    afterDelete: [revalidateDelete],
  },
  timestamps: true,
}
