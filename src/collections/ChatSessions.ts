import type { CollectionConfig } from 'payload'

import { admin } from '../access/admin'

export const ChatSessions: CollectionConfig = {
  slug: 'chat-sessions',
  access: {
    create: () => true, // Anyone can start a chat (including anonymous)
    read: admin,
    update: admin,
    delete: admin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['sessionId', 'userId', 'status', 'createdAt'],
    group: 'AI Assistant',
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'UUID generated client-side to identify the chat session',
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Linked user (if logged in)',
      },
    },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
          ],
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'userAgent',
          type: 'text',
        },
        {
          name: 'pageUrl',
          type: 'text',
          admin: {
            description: 'Page the user was on when they started the chat',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'summary',
      type: 'text',
      admin: {
        description: 'AI-generated summary of the conversation (for admin review)',
      },
    },
  ],
  timestamps: true,
}
