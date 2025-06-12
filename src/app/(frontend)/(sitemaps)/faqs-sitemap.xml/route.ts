import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getFAQsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'faqs',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        published: {
          equals: true,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((faq) => Boolean(faq?.slug))
          .map((faq) => ({
            loc: `${SITE_URL}/faqs/${faq?.slug}`,
            lastmod: faq.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['faqs-sitemap'],
  {
    tags: ['faqs-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getFAQsSitemap()

  return getServerSideSitemap(sitemap)
}