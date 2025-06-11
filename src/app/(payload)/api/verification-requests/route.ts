import { NextRequest } from 'next/server'
import { getPayload, PaginatedDocs } from 'payload'
import config from '@payload-config'
import { VerificationRequest } from '@/payload-types'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = { equals: status }
    }

    const result = await payload.find({
      collection: 'verification-requests',
      page: parseInt(page),
      limit: parseInt(limit),
      where,
      sort: '-createdAt',
    })

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching verification requests:', error)
    return Response.json({ error: 'Failed to fetch verification requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const data = await request.json()

    // Check if user already has a verification request
    const existingRequest: PaginatedDocs<VerificationRequest> = await payload.find({
      collection: 'verification-requests',
      where: {
        user: {
          equals: data.user,
        },
      },
      limit: 1,
    })

    if (existingRequest.docs.length > 0 && existingRequest.docs[0]?.user) {
      const userId =
        typeof existingRequest.docs[0]?.user === 'object'
          ? existingRequest.docs[0]?.user.id
          : existingRequest.docs[0]?.user

      // Update existing request instead of creating new one
      const updated = await payload.update({
        collection: 'verification-requests',
        id: userId,
        data: {
          ...data,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        },
      })

      return Response.json(updated)
    } else {
      // Create new verification request
      const result = await payload.create({
        collection: 'verification-requests',
        data: {
          ...data,
          submittedAt: new Date().toISOString(),
        },
      })

      return Response.json(result)
    }
  } catch (error) {
    console.error('Error creating verification request:', error)
    return Response.json({ error: 'Failed to create verification request' }, { status: 500 })
  }
}
