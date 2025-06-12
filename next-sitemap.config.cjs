const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/properties-sitemap.xml', '/categories-sitemap.xml', '/knowledge-base-sitemap.xml', '/faqs-sitemap.xml', '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`, 
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/properties-sitemap.xml`,
      `${SITE_URL}/categories-sitemap.xml`,
      `${SITE_URL}/knowledge-base-sitemap.xml`,
      `${SITE_URL}/faqs-sitemap.xml`
    ],
  },
}
