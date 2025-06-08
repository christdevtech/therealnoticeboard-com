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
    {
      name: 'identificationDocument',
      type: 'upload',
      relationTo: 'media',
      label: 'Identification Document',
      admin: {
        description: "Upload a clear photo of your ID card, passport, or driver's license",
      },
    },
    {
      name: 'selfieWithId',
      type: 'upload',
      relationTo: 'media',
      label: 'Selfie with ID',
      admin: {
        description: 'Upload a selfie holding your identification document',
      },
    },
    {
      name: 'verificationNotes',
      type: 'textarea',
      label: 'Verification Notes',
      admin: {
        description: 'Admin notes about verification status',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
  ],
  timestamps: true,
}
