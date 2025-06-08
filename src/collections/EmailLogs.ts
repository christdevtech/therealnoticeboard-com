import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'type', 'status', 'sentAt'],
    group: 'System',
  },
  fields: [
    {
      name: 'to',
      type: 'email',
      required: true,
      label: 'Recipient Email',
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Email Subject',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Email Verification',
          value: 'verification',
        },
        {
          label: 'Password Reset',
          value: 'password-reset',
        },
        {
          label: 'Newsletter',
          value: 'newsletter',
        },
        {
          label: 'Notification',
          value: 'notification',
        },
        {
          label: 'Other',
          value: 'other',
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
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Sent',
          value: 'sent',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
        {
          label: 'Bounced',
          value: 'bounced',
        },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Sent At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      label: 'Related User',
      admin: {
        description: 'The user this email was sent to (if applicable)',
      },
    },
    {
      name: 'htmlContent',
      type: 'textarea',
      label: 'HTML Content',
      admin: {
        description: 'The HTML content of the email',
        rows: 10,
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Error Message',
      admin: {
        description: 'Error message if email failed to send',
        condition: (data) => data.status === 'failed',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Metadata',
      admin: {
        description: 'Additional metadata about the email',
      },
    },
  ],
  timestamps: true,
}