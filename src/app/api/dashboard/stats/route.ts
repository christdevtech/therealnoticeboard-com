import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Authenticate the request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let stats

    if (user.role === 'admin') {
      // Admin can see all stats
      const [propertiesResult, inquiriesResult, pendingInquiriesResult] = await Promise.all([
        payload.find({
          collection: 'properties',
          limit: 0, // Only get count
        }),
        payload.find({
          collection: 'inquiries',
          limit: 0, // Only get count
        }),
        payload.find({
          collection: 'inquiries',
          where: {
            status: {
              equals: 'pending',
            },
          },
          limit: 0, // Only get count
        }),
      ])

      stats = {
        totalProperties: propertiesResult.totalDocs,
        totalInquiries: inquiriesResult.totalDocs,
        pendingInquiries: pendingInquiriesResult.totalDocs,
      }
    } else {
      // Regular users see only their own property stats
      const [userPropertiesResult, userInquiriesResult, userPendingInquiriesResult] = await Promise.all([
        payload.find({
          collection: 'properties',
          where: {
            owner: {
              equals: user.id,
            },
          },
          limit: 0, // Only get count
        }),
        payload.find({
          collection: 'inquiries',
          where: {
            'property.owner': {
              equals: user.id,
            },
          },
          limit: 0, // Only get count
        }),
        payload.find({
          collection: 'inquiries',
          where: {
            and: [
              {
                status: {
                  equals: 'pending',
                },
              },
              {
                'property.owner': {
                  equals: user.id,
                },
              },
            ],
          },
          limit: 0, // Only get count
        }),
      ])

      stats = {
        totalProperties: userPropertiesResult.totalDocs,
        totalInquiries: userInquiriesResult.totalDocs,
        pendingInquiries: userPendingInquiriesResult.totalDocs,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}