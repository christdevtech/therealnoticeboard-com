// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { EmailLogs } from './collections/EmailLogs'
import { FAQs } from './collections/FAQs'
import { Inquiries } from './collections/Inquiries'
import { KnowledgeBase } from './collections/KnowledgeBase'
import { Media } from './collections/Media'
import { Neighborhoods } from './collections/Neighborhoods'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Properties } from './collections/Properties/Properties'
import { Users } from './collections/Users'
import { VerificationRequests } from './collections/VerificationRequests'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Amenities } from './collections/Amenities'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Icon: '@/components/Icon',
        Logo: '@/components/Logo',
      },
    },
    meta: {
      title: 'The Notice Board',
      description: 'The Notice Board; safe property deals, every time',
      icons: [
        {
          sizes: '64x64',
          url: '/favicon.svg',
          type: 'image/svg+xml',
        },
      ],
    },

    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Amenities,
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Properties,
    Neighborhoods,
    Inquiries,
    FAQs,
    KnowledgeBase,
    EmailLogs,
    VerificationRequests,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  email: nodemailerAdapter({
    defaultFromAddress: `${process.env.SMTP_FROM}`,
    defaultFromName: `${process.env.SMTP_FROM_NAME}`,
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  }),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
