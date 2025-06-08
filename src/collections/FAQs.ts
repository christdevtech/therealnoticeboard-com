import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import {
  BlocksFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'published', 'priority'],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      admin: {
        description: 'The frequently asked question',
      },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: {
        description: 'Detailed answer to the question',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
            OrderedListFeature(),
            UnorderedListFeature(),
            ChecklistFeature(),
          ]
        },
      }),
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Property Listings',
          value: 'property-listings',
        },
        {
          label: 'User Verification',
          value: 'user-verification',
        },
        {
          label: 'Buying Process',
          value: 'buying-process',
        },
        {
          label: 'Renting Process',
          value: 'renting-process',
        },
        {
          label: 'Property Types',
          value: 'property-types',
        },
        {
          label: 'Payments & Fees',
          value: 'payments-fees',
        },
        {
          label: 'Legal & Documentation',
          value: 'legal-documentation',
        },
        {
          label: 'Platform Usage',
          value: 'platform-usage',
        },
        {
          label: 'Contact & Support',
          value: 'contact-support',
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
        description: 'Tags for better searchability and AI context',
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
        description: 'Priority for AI chat responses',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this FAQ is published and available for AI chat',
      },
    },
    {
      name: 'relatedQuestions',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'text',
        },
      ],
      admin: {
        description: 'Related questions that might be asked',
      },
    },
    {
      name: 'aiContext',
      type: 'textarea',
      admin: {
        description: 'Additional context for AI to understand when to use this FAQ',
      },
    },
  ],
  timestamps: true,
}
