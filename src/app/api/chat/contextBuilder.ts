import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Where } from 'payload'

/**
 * Builds RAG context by querying relevant Payload collections based on the user's message.
 * Returns a formatted string to inject into the system prompt.
 */
export async function buildContext(message: string): Promise<string> {
  const payload = await getPayload({ config: configPromise })
  const lowerMessage = message.toLowerCase()
  const contextParts: string[] = []

  // Detect intent
  const isPropertySearch =
    /(?:find|search|show|looking|want|need|any|list|available)\b.*(?:property|properties|land|house|apartment|office|room|plot|building|warehouse|rent|buy|sale)/i.test(message)
  const isFAQQuery =
    /(?:how|what|why|can i|do i|is it|does|where)\b/i.test(message) && !isPropertySearch
  const isVendorQuery =
    /(?:seller|vendor|trust|score|reliable|review|rating)/i.test(message)
  const isLocationQuery =
    /(?:neighborhood|area|region|city|buea|douala|yaoundé|yaounde|bamenda|limbe|kribi)/i.test(message)

  // 1. Property Search
  if (isPropertySearch) {
    const where: Where = { status: { equals: 'approved' } }

    // Parse property type
    if (/land|plot/i.test(message)) where.propertyType = { equals: 'land' }
    else if (/residential|house|apartment|home/i.test(message)) where.propertyType = { equals: 'residential' }
    else if (/commercial|office|shop|retail/i.test(message)) where.propertyType = { equals: 'commercial' }
    else if (/industrial|warehouse|factory/i.test(message)) where.propertyType = { equals: 'industrial' }

    // Parse listing type
    if (/rent|rental|lease/i.test(message)) where.listingType = { equals: 'rent' }
    else if (/buy|sale|purchase/i.test(message)) where.listingType = { equals: 'sale' }

    // Parse price constraints
    const priceMatch = message.match(/(?:under|below|less than|max|maximum)\s*(\d[\d,.\s]*)/i)
    if (priceMatch && priceMatch[1]) {
      const maxPrice = parseInt(priceMatch[1].replace(/[,.\s]/g, ''), 10)
      if (maxPrice) where.price = { less_than_equal: maxPrice }
    }

    // Parse bedroom count
    const bedroomMatch = message.match(/(\d+)\s*(?:bed|bedroom)/i)
    if (bedroomMatch && bedroomMatch[1]) {
      where['residentialFeatures.bedrooms'] = { greater_than_equal: parseInt(bedroomMatch[1], 10) }
    }

    try {
      const properties = await payload.find({
        collection: 'properties',
        where,
        limit: 5,
        depth: 1,
        sort: '-createdAt',
        select: {
          title: true, slug: true, propertyType: true, listingType: true,
          price: true, area: true, neighborhood: true, description: true,
          owner: true, residentialFeatures: true,
        },
      })

      if (properties.docs.length > 0) {
        contextParts.push('MATCHING PROPERTIES:')
        for (const p of properties.docs) {
          const neighborhood = typeof p.neighborhood === 'object' ? p.neighborhood?.name : ''
          const ownerName = typeof p.owner === 'object' ? p.owner?.name : ''
          const verified = typeof p.owner === 'object' && p.owner?.verificationStatus === 'verified' ? '✓ Verified' : ''
          const bedrooms = p.propertyType === 'residential' && p.residentialFeatures?.bedrooms
            ? `${p.residentialFeatures.bedrooms} bed` : ''

          contextParts.push(
            `- **${p.title}** | ${p.propertyType} | ${p.listingType === 'sale' ? 'For Sale' : 'For Rent'} | ${new Intl.NumberFormat('fr-FR').format(p.price)} XAF | ${p.area} m² | ${neighborhood} | ${bedrooms} | Seller: ${ownerName} ${verified} | Link: /properties/${p.slug}`
          )
        }
        contextParts.push(`Total matching: ${properties.totalDocs} properties found.`)
      } else {
        contextParts.push('No properties matched the search criteria.')
      }
    } catch (e) {
      console.error('Property search error:', e)
    }
  }

  // 2. FAQ Search
  if (isFAQQuery || (!isPropertySearch && !isVendorQuery)) {
    try {
      const faqs = await payload.find({
        collection: 'faqs',
        where: {
          and: [
            { published: { equals: true } },
            {
              or: [
                { question: { contains: lowerMessage.split(' ').slice(0, 4).join(' ') } },
                { 'tags.tag': { contains: lowerMessage.split(' ').slice(0, 3).join(' ') } },
              ],
            },
          ],
        },
        limit: 3,
        select: { question: true, answer: true, category: true },
      })

      if (faqs.docs.length > 0) {
        contextParts.push('\nRELEVANT FAQs:')
        for (const faq of faqs.docs) {
          contextParts.push(`Q: ${faq.question}\nA: (see FAQ on the platform, category: ${faq.category})`)
        }
      }
    } catch { /* FAQs might not have matching content */ }
  }

  // 3. Knowledge Base
  if (isFAQQuery || isLocationQuery) {
    try {
      const keywords = lowerMessage.split(/\s+/).filter(w => w.length > 3).slice(0, 5)
      if (keywords.length > 0) {
        const articles = await payload.find({
          collection: 'knowledge-base',
          where: {
            and: [
              { published: { equals: true } },
              {
                or: [
                  { title: { contains: keywords[0] } },
                  { summary: { contains: keywords[0] } },
                  ...(keywords[1] ? [{ 'keywords.keyword': { contains: keywords[1] } }] : []),
                ],
              },
            ],
          },
          limit: 2,
          select: { title: true, summary: true, category: true },
        })

        if (articles.docs.length > 0) {
          contextParts.push('\nKNOWLEDGE BASE ARTICLES:')
          for (const a of articles.docs) {
            contextParts.push(`- **${a.title}** (${a.category}): ${a.summary}`)
          }
        }
      }
    } catch { /* Silently fail */ }
  }

  // 4. Neighborhood Info
  if (isLocationQuery) {
    try {
      const cityNames = ['buea', 'douala', 'yaoundé', 'yaounde', 'bamenda', 'limbe', 'kribi', 'bafoussam']
      const matchedCity = cityNames.find(c => lowerMessage.includes(c))

      if (matchedCity) {
        const neighborhoods = await payload.find({
          collection: 'neighborhoods',
          where: { city: { contains: matchedCity } },
          limit: 10,
        })

        if (neighborhoods.docs.length > 0) {
          contextParts.push(`\nNEIGHBORHOODS IN ${matchedCity.toUpperCase()}:`)
          for (const n of neighborhoods.docs) {
            contextParts.push(`- ${n.name} (${n.region})${n.description ? ': ' + n.description : ''}`)
          }
        }
      }
    } catch { /* Silently fail */ }
  }

  return contextParts.join('\n')
}
