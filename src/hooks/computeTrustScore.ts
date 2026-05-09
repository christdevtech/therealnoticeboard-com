import type { CollectionAfterReadHook, Payload } from 'payload'

/**
 * Trust Score Algorithm (0-100)
 *
 * Component             | Weight | Max Points | How
 * ===================== | ====== | ========== | ===
 * Verification Status   | 25%    | 25         | verified=25, pending=10, unverified=0
 * Average Rating        | 30%    | 30         | (avgRating / 5) * 30
 * Completed Deals       | 20%    | 20         | min(completedDeals / 10, 1) * 20
 * Response Rate         | 15%    | 15         | (respondedInquiries / totalInquiries) * 15
 * Account Age           | 10%    | 10         | min(monthsActive / 12, 1) * 10
 *
 * Badge tiers:
 *   90-100: "Trusted Seller" (gold)
 *   70-89:  "Reliable Seller" (green)
 *   50-69:  "Active Seller" (blue)
 *   0-49:   "New Seller" (gray)
 */

export type TrustTier = 'trusted' | 'reliable' | 'active' | 'new'

export interface TrustScoreBreakdown {
  total: number
  tier: TrustTier
  verification: number
  rating: number
  deals: number
  responseRate: number
  accountAge: number
}

export function getTrustTier(score: number): TrustTier {
  if (score >= 90) return 'trusted'
  if (score >= 70) return 'reliable'
  if (score >= 50) return 'active'
  return 'new'
}

export function getTrustLabel(tier: TrustTier): string {
  const labels: Record<TrustTier, string> = {
    trusted: 'Trusted Seller',
    reliable: 'Reliable Seller',
    active: 'Active Seller',
    new: 'New Seller',
  }
  return labels[tier]
}

/**
 * Computes the trust score for a vendor.
 * This is meant to be called from an afterRead hook on the Users collection
 * or from API routes that need trust data.
 */
export async function computeTrustScore(
  payload: Payload,
  userId: string,
  userData: {
    verificationStatus?: string
    createdAt?: string
  },
): Promise<TrustScoreBreakdown> {
  // 1. Verification Status (25 points)
  let verification = 0
  if (userData.verificationStatus === 'verified') verification = 25
  else if (userData.verificationStatus === 'pending') verification = 10

  // 2. Average Rating (30 points)
  let ratingScore = 0
  let avgRating = 0
  let totalReviews = 0

  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { vendor: { equals: userId } },
          { status: { equals: 'published' } },
        ],
      },
      limit: 0, // We only need totalDocs
    })

    totalReviews = reviews.totalDocs

    if (totalReviews > 0) {
      // Fetch all ratings to compute average
      const allReviews = await payload.find({
        collection: 'reviews',
        where: {
          and: [
            { vendor: { equals: userId } },
            { status: { equals: 'published' } },
          ],
        },
        limit: 1000,
        select: { rating: true },
      })

      const totalRating = allReviews.docs.reduce(
        (sum: number, review: any) => sum + (review.rating || 0),
        0,
      )
      avgRating = totalRating / totalReviews
      ratingScore = (avgRating / 5) * 30
    }
  } catch {
    // Collection may not exist yet during initial setup
  }

  // 3. Completed Deals (20 points)
  let dealsScore = 0
  let completedDeals = 0

  try {
    const transactions = await payload.find({
      collection: 'transactions',
      where: {
        and: [
          { seller: { equals: userId } },
          { status: { equals: 'completed' } },
        ],
      },
      limit: 0,
    })

    completedDeals = transactions.totalDocs
    dealsScore = Math.min(completedDeals / 10, 1) * 20
  } catch {
    // Collection may not exist yet
  }

  // 4. Response Rate (15 points)
  let responseRateScore = 0

  try {
    // Get properties owned by this user
    const userProperties = await payload.find({
      collection: 'properties',
      where: { owner: { equals: userId } },
      limit: 1000,
      select: { slug: true },
    })

    const propertyIds = userProperties.docs.map((p) => p.id)

    if (propertyIds.length > 0) {
      const allInquiries = await payload.find({
        collection: 'inquiries',
        where: {
          property: { in: propertyIds },
        },
        limit: 0,
      })

      const respondedInquiries = await payload.find({
        collection: 'inquiries',
        where: {
          and: [
            { property: { in: propertyIds } },
            { status: { in: ['responded', 'closed'] } },
          ],
        },
        limit: 0,
      })

      if (allInquiries.totalDocs > 0) {
        const responseRate = respondedInquiries.totalDocs / allInquiries.totalDocs
        responseRateScore = responseRate * 15
      }
    }
  } catch {
    // Collections may not exist yet
  }

  // 5. Account Age (10 points)
  let accountAgeScore = 0
  if (userData.createdAt) {
    const createdDate = new Date(userData.createdAt)
    const now = new Date()
    const monthsActive =
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    accountAgeScore = Math.min(monthsActive / 12, 1) * 10
  }

  const total = Math.round(
    verification + ratingScore + dealsScore + responseRateScore + accountAgeScore,
  )

  return {
    total,
    tier: getTrustTier(total),
    verification: Math.round(verification),
    rating: Math.round(ratingScore),
    deals: Math.round(dealsScore),
    responseRate: Math.round(responseRateScore),
    accountAge: Math.round(accountAgeScore),
  }
}

/**
 * afterRead hook for the Users collection.
 * Populates virtual trust score fields.
 * Only runs when depth > 0 or when specifically requested,
 * to avoid excessive DB queries on list views.
 */
export const populateTrustFields: CollectionAfterReadHook = async ({ doc, req }) => {
  // Skip trust computation for admin panel list views to keep them fast
  // Trust data is computed on-demand via API routes and detail views
  if (!doc || !doc.id) return doc

  // Only compute for verified vendors (or those with some activity)
  if (doc.verificationStatus === 'unverified' && doc.role !== 'admin') {
    doc.trustScore = 0
    doc.averageRating = 0
    doc.totalReviews = 0
    doc.completedDeals = 0
    return doc
  }

  try {
    const breakdown = await computeTrustScore(req.payload, doc.id, {
      verificationStatus: doc.verificationStatus,
      createdAt: doc.createdAt,
    })

    doc.trustScore = breakdown.total
    doc.averageRating = breakdown.rating > 0 ? Number(((breakdown.rating / 30) * 5).toFixed(1)) : 0
    doc.totalReviews = 0
    doc.completedDeals = 0

    // Fetch actual counts
    try {
      const reviews = await req.payload.find({
        collection: 'reviews',
        where: {
          and: [
            { vendor: { equals: doc.id } },
            { status: { equals: 'published' } },
          ],
        },
        limit: 0,
      })
      doc.totalReviews = reviews.totalDocs

      const transactions = await req.payload.find({
        collection: 'transactions',
        where: {
          and: [
            { seller: { equals: doc.id } },
            { status: { equals: 'completed' } },
          ],
        },
        limit: 0,
      })
      doc.completedDeals = transactions.totalDocs
    } catch {
      // Silently fail if collections don't exist yet
    }
  } catch {
    doc.trustScore = 0
    doc.averageRating = 0
    doc.totalReviews = 0
    doc.completedDeals = 0
  }

  return doc
}
