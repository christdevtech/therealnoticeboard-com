import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const KnowledgeBase: CollectionConfig = {
  slug: 'knowledge-base',
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'published', 'priority'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of the knowledge base article',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the knowledge base article',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief summary for AI context and search results',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Property Management',
          value: 'property-management',
        },
        {
          label: 'User Guide',
          value: 'user-guide',
        },
        {
          label: 'Legal Information',
          value: 'legal-information',
        },
        {
          label: 'Market Insights',
          value: 'market-insights',
        },
        {
          label: 'Investment Tips',
          value: 'investment-tips',
        },
        {
          label: 'Property Types',
          value: 'property-types',
        },
        {
          label: 'Location Guides',
          value: 'location-guides',
        },
        {
          label: 'Financing',
          value: 'financing',
        },
        {
          label: 'Technical Support',
          value: 'technical-support',
        },
        {
          label: 'General',
          value: 'general',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for better searchability and AI context matching',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
        },
      ],
      admin: {
        description: 'Keywords that trigger this article in AI responses',
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: 'High',
          value: 'high',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'Low',
          value: 'low',
        },
      ],
      admin: {
        description: 'Priority for AI chat responses and search results',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this article is published and available for AI chat',
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'knowledge-base',
      hasMany: true,
      admin: {
        description: 'Related knowledge base articles',
      },
    },
    {
      name: 'relatedFAQs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: {
        description: 'Related FAQ entries',
      },
    },
    {
      name: 'aiContext',
      type: 'textarea',
      admin: {
        description: 'Additional context for AI to understand when and how to use this article',
      },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'Last update date for content freshness tracking',
      },
      hooks: {
        beforeChange: [
          () => {
            return new Date()
          },
        ],
      },
    },
  ],
  timestamps: true,
}
