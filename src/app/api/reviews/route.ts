import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const { searchParams } = new URL(req.url)

  const vendorId = searchParams.get('vendorId')
  const propertyId = searchParams.get('propertyId')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const sort = searchParams.get('sort') || '-createdAt'

  const whereConditions: any = {
    status: { equals: 'published' },
  }

  if (vendorId) {
    whereConditions.vendor = { equals: vendorId }
  }

  if (propertyId) {
    whereConditions.property = { equals: propertyId }
  }

  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: whereConditions,
      page,
      limit,
      sort,
      depth: 1,
    })

    // Compute aggregate stats
    let averageRating = 0
    let aspectAverages = { communication: 0, accuracy: 0, value: 0 }

    if (reviews.totalDocs > 0) {
      const allReviews = await payload.find({
        collection: 'reviews',
        where: whereConditions,
        limit: 1000,
        select: {
          rating: true,
          aspects: true,
        },
      })

      const totalRating = allReviews.docs.reduce(
        (sum: number, r: any) => sum + (r.rating || 0),
        0,
      )
      averageRating = Number((totalRating / allReviews.totalDocs).toFixed(1))

      const commTotal = allReviews.docs.reduce(
        (sum: number, r: any) => sum + (r.aspects?.communication || 0),
        0,
      )
      const accTotal = allReviews.docs.reduce(
        (sum: number, r: any) => sum + (r.aspects?.accuracy || 0),
        0,
      )
      const valTotal = allReviews.docs.reduce(
        (sum: number, r: any) => sum + (r.aspects?.value || 0),
        0,
      )

      const commCount = allReviews.docs.filter((r: any) => r.aspects?.communication).length
      const accCount = allReviews.docs.filter((r: any) => r.aspects?.accuracy).length
      const valCount = allReviews.docs.filter((r: any) => r.aspects?.value).length

      aspectAverages = {
        communication: commCount > 0 ? Number((commTotal / commCount).toFixed(1)) : 0,
        accuracy: accCount > 0 ? Number((accTotal / accCount).toFixed(1)) : 0,
        value: valCount > 0 ? Number((valTotal / valCount).toFixed(1)) : 0,
      }
    }

    return NextResponse.json({
      reviews: reviews.docs,
      totalDocs: reviews.totalDocs,
      totalPages: reviews.totalPages,
      page: reviews.page,
      averageRating,
      aspectAverages,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  try {
    const body = await req.json()

    // The beforeChange hook on the Reviews collection handles:
    // - Transaction validation
    // - Duplicate check
    // - Auto-setting reviewer
    const review = await payload.create({
      collection: 'reviews',
      data: body,
      // Pass the request through for auth context
      overrideAccess: false,
      user: (req as any).user,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 400 },
    )
  }
}
