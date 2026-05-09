import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()

  // Get the user from cookie-based auth
  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const type = searchParams.get('type') || 'received' // 'received' or 'given'

  try {
    const where: import('payload').Where = {
      and: [
        type === 'received'
          ? { vendor: { equals: user.id } }
          : { reviewer: { equals: user.id } },
        { status: { equals: 'published' } },
      ],
    }

    const reviews = await payload.find({
      collection: 'reviews',
      where,
      page,
      limit,
      sort: '-createdAt',
      depth: 1,
    })

    return NextResponse.json({
      reviews: reviews.docs,
      totalDocs: reviews.totalDocs,
      totalPages: reviews.totalPages,
      page: reviews.page,
    })
  } catch (error) {
    console.error('Error fetching dashboard reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
