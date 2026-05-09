import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'
import { usersUpdate } from '../../access/users'
import {
  generateVerificationEmailHTML,
  generateVerificationEmailSubject,
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailSubject,
} from '../../email/authEmailsWithLogging'
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: anyone, // Allow user registration
    delete: authenticated,
    read: authenticated,
    update: usersUpdate,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'verificationStatus'],
    useAsTitle: 'name',
    group: 'User Management',
  },
  auth: {
    verify: {
      generateEmailHTML: generateVerificationEmailHTML,
      generateEmailSubject: generateVerificationEmailSubject,
    },
    forgotPassword: {
      generateEmailHTML: generatePasswordResetEmailHTML,
      generateEmailSubject: generatePasswordResetEmailSubject,
    },
  },
  hooks: {
    beforeChange: [ensureFirstUserIsAdmin],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'User',
          value: 'user',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'verificationStatus',
      type: 'select',
      options: [
        {
          label: 'Unverified',
          value: 'unverified',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Verified',
          value: 'verified',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      defaultValue: 'unverified',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
    },
    // Vendor Profile — visible after verification
    {
      name: 'vendorProfile',
      type: 'group',
      label: 'Vendor Profile',
      admin: {
        condition: (data) => data?.verificationStatus === 'verified',
        description: 'Public vendor profile (visible after verification)',
      },
      fields: [
        {
          name: 'shopName',
          type: 'text',
          admin: {
            description: 'Business or shop display name',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          admin: {
            description: 'Tell buyers about yourself or your business',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Profile photo or business logo',
          },
        },
        {
          name: 'specialties',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Land Sales', value: 'land' },
            { label: 'Residential', value: 'residential' },
            { label: 'Commercial', value: 'commercial' },
            { label: 'Industrial', value: 'industrial' },
            { label: 'Rentals', value: 'rentals' },
          ],
          admin: {
            description: 'Areas of specialization',
          },
        },
        {
          name: 'responseTime',
          type: 'select',
          options: [
            { label: 'Within an hour', value: 'hour' },
            { label: 'Within a day', value: 'day' },
            { label: 'Within a week', value: 'week' },
          ],
          admin: {
            description: 'Typical response time to inquiries',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
