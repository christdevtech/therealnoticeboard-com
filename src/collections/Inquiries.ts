import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { inquiriesDelete } from '../access/inquiries'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: inquiriesDelete,
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'property', 'inquirer', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      admin: {
        description: 'Property this inquiry is about',
      },
    },
    {
      name: 'inquirer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User making the inquiry',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            // Auto-assign current user as inquirer on create
            if (operation === 'create' && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Subject of the inquiry',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Inquiry message',
      },
    },
    {
      name: 'inquiryType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'General Information',
          value: 'general',
        },
        {
          label: 'Schedule Viewing',
          value: 'viewing',
        },
        {
          label: 'Make Offer',
          value: 'offer',
        },
        {
          label: 'Request Details',
          value: 'details',
        },
      ],
    },
    {
      name: 'contactPreference',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Email',
          value: 'email',
        },
        {
          label: 'Phone',
          value: 'phone',
        },
        {
          label: 'WhatsApp',
          value: 'whatsapp',
        },
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'preferredTime',
          type: 'text',
          admin: {
            description: 'Preferred time for contact',
          },
        },
      ],
    },
    {
      name: 'offerAmount',
      type: 'number',
      admin: {
        description: 'Offer amount (if making an offer)',
        condition: (data) => data.inquiryType === 'offer',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Responded',
          value: 'responded',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },
    {
      name: 'response',
      type: 'textarea',
      admin: {
        description: 'Response from property owner',
      },
    },
    {
      name: 'responseDate',
      type: 'date',
      admin: {
        description: 'Date of response',
      },
    },
  ],
  timestamps: true,
}
