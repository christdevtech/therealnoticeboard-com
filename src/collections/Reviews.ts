import type { CollectionConfig } from 'payload'

import { reviewsRead, reviewsCreate, reviewsUpdate, reviewsDelete } from '../access/reviews'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    create: reviewsCreate,
    read: reviewsRead,
    update: reviewsUpdate,
    delete: reviewsDelete,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'reviewer', 'vendor', 'rating', 'status', 'createdAt'],
    group: 'Marketplace',
  },
  hooks: {
    beforeChange: [
      // Validate that reviewer has a completed transaction with the vendor
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data

        const user = req.user
        if (!user) throw new Error('You must be logged in to leave a review.')

        // Admin can bypass transaction check
        if (user.role === 'admin') return data

        if (!data?.vendor || !data?.transaction) {
          throw new Error('A completed transaction is required to leave a review.')
        }

        // Verify the transaction exists, is completed, and involves this reviewer
        const transaction = await req.payload.findByID({
          collection: 'transactions',
          id: data.transaction,
          depth: 0,
        })

        if (!transaction) {
          throw new Error('Transaction not found.')
        }

        if (transaction.status !== 'completed') {
          throw new Error('You can only review after a transaction is completed.')
        }

        const buyerId =
          typeof transaction.buyer === 'object' ? transaction.buyer.id : transaction.buyer
        if (buyerId !== user.id) {
          throw new Error('You can only review transactions where you are the buyer.')
        }

        const sellerId =
          typeof transaction.seller === 'object' ? transaction.seller.id : transaction.seller
        if (sellerId !== data.vendor) {
          throw new Error('The vendor must match the seller in the transaction.')
        }

        // Check for duplicate reviews on the same transaction
        const existingReview = await req.payload.find({
          collection: 'reviews',
          where: {
            and: [
              { reviewer: { equals: user.id } },
              { transaction: { equals: data.transaction } },
            ],
          },
          limit: 1,
        })

        if (existingReview.totalDocs > 0) {
          throw new Error('You have already reviewed this transaction.')
        }

        // Auto-set the reviewer
        data.reviewer = user.id

        return data
      },
    ],
  },
  fields: [
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'User who wrote the review',
      },
    },
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Vendor being reviewed',
      },
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      admin: {
        description: 'Specific property/listing this review is about',
      },
    },
    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
      admin: {
        description: 'The completed transaction that validates this review',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Overall rating (1-5 stars)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description: 'Review headline',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      admin: {
        description: 'Detailed review',
      },
    },
    {
      name: 'aspects',
      type: 'group',
      admin: {
        description: 'Detailed aspect ratings',
      },
      fields: [
        {
          name: 'communication',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'How well did the vendor communicate? (1-5)',
          },
        },
        {
          name: 'accuracy',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Was the listing accurate? (1-5)',
          },
        },
        {
          name: 'value',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Was it good value? (1-5)',
          },
        },
      ],
    },
    {
      name: 'vendorResponse',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: "Vendor's reply to the review",
      },
      access: {
        // Only the vendor or admin can write a response
        update: ({ req, doc }) => {
          if (req.user?.role === 'admin') return true
          if (!doc || !req.user) return false
          const vendorId = typeof doc.vendor === 'object' ? doc.vendor.id : doc.vendor
          return vendorId === req.user.id
        },
      },
    },
    {
      name: 'vendorResponseDate',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the vendor responded',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Hidden',
          value: 'hidden',
        },
        {
          label: 'Flagged',
          value: 'flagged',
        },
      ],
      admin: {
        description: 'Review visibility status',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
  ],
  timestamps: true,
}
