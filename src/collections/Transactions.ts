import type { CollectionConfig } from 'payload'

import {
  transactionsRead,
  transactionsCreate,
  transactionsUpdate,
  transactionsDelete,
} from '../access/transactions'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: {
    create: transactionsCreate,
    read: transactionsRead,
    update: transactionsUpdate,
    delete: transactionsDelete,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['property', 'buyer', 'seller', 'type', 'status', 'amount', 'createdAt'],
    group: 'Marketplace',
  },
  hooks: {
    beforeChange: [
      // Auto-set seller from property owner on create
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.property) {
          const property = await req.payload.findByID({
            collection: 'properties',
            id: data.property,
            depth: 0,
          })

          if (property) {
            const ownerId =
              typeof property.owner === 'object' ? property.owner.id : property.owner
            data.seller = ownerId
          }

          // Auto-set buyer to current user
          if (req.user && !data.buyer) {
            data.buyer = req.user.id
          }
        }

        return data
      },
    ],
    afterChange: [
      // When both parties confirm, mark as completed
      async ({ doc, req, previousDoc, operation }) => {
        if (operation !== 'update') return doc
        if (!previousDoc) return doc

        // Check if both confirmations are now true
        if (doc.buyerConfirmed && doc.sellerConfirmed && doc.status !== 'completed') {
          await req.payload.update({
            collection: 'transactions',
            id: doc.id,
            data: {
              status: 'completed',
              completedAt: new Date().toISOString(),
            },
            req,
            context: { skipTransactionHook: true },
          })

          // Update property status if it's a purchase
          if (doc.type === 'purchase' && doc.property) {
            const propertyId =
              typeof doc.property === 'object' ? doc.property.id : doc.property
            await req.payload.update({
              collection: 'properties',
              id: propertyId,
              data: {
                status: 'sold',
              },
              req,
            })
          }
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      admin: {
        description: 'Property/listing involved in this transaction',
      },
    },
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'The buyer in this transaction',
      },
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'The seller/vendor (auto-set from property owner)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Purchase',
          value: 'purchase',
        },
        {
          label: 'Rental',
          value: 'rental',
        },
      ],
      admin: {
        description: 'Type of transaction',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Confirmed',
          value: 'confirmed',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Disputed',
          value: 'disputed',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      admin: {
        description:
          'Transaction status: pending → confirmed → completed. Both parties must confirm.',
      },
    },
    {
      name: 'amount',
      type: 'number',
      admin: {
        description: 'Agreed price in XAF',
      },
    },
    {
      name: 'buyerConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Buyer confirms the deal is completed',
      },
      access: {
        update: ({ req, doc }) => {
          if (req.user?.role === 'admin') return true
          if (!doc || !req.user) return false
          const buyerId = typeof doc.buyer === 'object' ? doc.buyer.id : doc.buyer
          return buyerId === req.user.id
        },
      },
    },
    {
      name: 'sellerConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Seller confirms the deal is completed',
      },
      access: {
        update: ({ req, doc }) => {
          if (req.user?.role === 'admin') return true
          if (!doc || !req.user) return false
          const sellerId = typeof doc.seller === 'object' ? doc.seller.id : doc.seller
          return sellerId === req.user.id
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Auto-set when both parties confirm',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this transaction',
      },
    },
  ],
  timestamps: true,
}
