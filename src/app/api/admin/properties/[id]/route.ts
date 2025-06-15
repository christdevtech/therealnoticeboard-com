import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Property } from '@/payload-types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Fetch the property with full details including owner and amenities
    const property = await payload.findByID({
      collection: 'properties',
      id,
      depth: 3, // Deep fetch to get all related data
    }) as Property

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        property,
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin property detail fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const { status, adminNotes, featured } = await request.json()

    if (!id) {
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
      id,
      data: updateData,
      depth: 3,
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