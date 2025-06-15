import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Property } from '@/payload-types'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Authenticate the request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const propertyType = searchParams.get('propertyType')
    const listingType = searchParams.get('listingType')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build the where clause
    const where: any = {}

    if (status) {
      where.status = { equals: status }
    }

    if (propertyType) {
      where.propertyType = { equals: propertyType }
    }

    if (listingType) {
      where.listingType = { equals: listingType }
    }

    if (search) {
      where.or = [
        {
          title: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
        {
          'location.neighborhood': {
            contains: search,
          },
        },
        {
          'location.address': {
            contains: search,
          },
        },
      ]
    }

    // Fetch properties with pagination
    const result = await payload.find({
      collection: 'properties',
      where,
      page,
      limit,
      sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
      depth: 2, // Include owner details
    })

    // Get status counts for overview
    const statusCounts = await Promise.all([
      payload.count({
        collection: 'properties',
        where: { status: { equals: 'pending' } },
      }),
      payload.count({
        collection: 'properties',
        where: { status: { equals: 'approved' } },
      }),
      payload.count({
        collection: 'properties',
        where: { status: { equals: 'rejected' } },
      }),
      payload.count({
        collection: 'properties',
        where: { status: { equals: 'sold' } },
      }),
      payload.count({
        collection: 'properties',
      }),
    ])

    const overview = {
      pending: statusCounts[0].totalDocs,
      approved: statusCounts[1].totalDocs,
      rejected: statusCounts[2].totalDocs,
      sold: statusCounts[3].totalDocs,
      total: statusCounts[4].totalDocs,
    }

    return NextResponse.json(
      {
        properties: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
        overview,
        filters: {
          status,
          search,
          propertyType,
          listingType,
          sortBy,
          sortOrder,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin properties fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Authenticate the request
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { propertyId, status, adminNotes, featured } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status = status
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }
    
    if (featured !== undefined) {
      updateData.featured = featured
    }

    // Update the property
    const updatedProperty = await payload.update({
      collection: 'properties',
      id: propertyId,
      data: updateData,
      depth: 2,
    })

    return NextResponse.json(
      {
        success: true,
        property: updatedProperty,
        message: 'Property updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin property update error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}