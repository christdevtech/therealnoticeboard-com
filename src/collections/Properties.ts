import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { verifiedOrAdmin } from '../access/verified'
import { propertiesRead, propertiesUpdate, propertiesDelete } from '../access/properties'

export const Properties: CollectionConfig = {
  slug: 'properties',
  access: {
    create: verifiedOrAdmin,
    read: propertiesRead,
    update: propertiesUpdate,
    delete: propertiesDelete,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'propertyType', 'listingType', 'price', 'status', 'owner'],
  },
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
      type: 'richText',
      required: true,
      admin: {
        description: 'Detailed description of the property',
      },
    },
    {
      name: 'propertyType',
      type: 'relationship',
      relationTo: 'property-types',
      required: true,
      admin: {
        description: 'Type of property (land, residential, commercial, industrial)',
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
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in XAF (Central African Franc)',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'XAF',
      options: [
        {
          label: 'XAF (Central African Franc)',
          value: 'XAF',
        },
        {
          label: 'USD (US Dollar)',
          value: 'USD',
        },
        {
          label: 'EUR (Euro)',
          value: 'EUR',
        },
      ],
    },
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
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'bedrooms',
          type: 'number',
          admin: {
            description: 'Number of bedrooms (for residential properties)',
          },
        },
        {
          name: 'bathrooms',
          type: 'number',
          admin: {
            description: 'Number of bathrooms (for residential properties)',
          },
        },
        {
          name: 'area',
          type: 'number',
          admin: {
            description: 'Area in square meters',
          },
        },
        {
          name: 'parking',
          type: 'checkbox',
          label: 'Parking Available',
        },
        {
          name: 'furnished',
          type: 'checkbox',
          label: 'Furnished',
        },
        {
          name: 'amenities',
          type: 'array',
          fields: [
            {
              name: 'amenity',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
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
  ],
  timestamps: true,
}
