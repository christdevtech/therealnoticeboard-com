import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getPayload({ config })
  const { id } = await params
  
  try {
    const result = await payload.findByID({
      collection: 'verification-requests',
      id,
    })
    
    return Response.json(result)
  } catch (error) {
    console.error('Error fetching verification request:', error)
    return Response.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getPayload({ config })
  const { id } = await params
  
  try {
    const data = await request.json()
    
    // Add review timestamp and reviewer if status is being changed from pending
    if (data.status && data.status !== 'pending') {
      data.reviewedAt = new Date().toISOString()
      // You might want to get the current admin user here
      // data.reviewedBy = currentAdminUserId
    }
    
    const result = await payload.update({
      collection: 'verification-requests',
      id,
      data,
    })
    
    return Response.json(result)
  } catch (error) {
    console.error('Error updating verification request:', error)
    return Response.json(
      { error: 'Failed to update verification request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getPayload({ config })
  const { id } = await params
  
  try {
    await payload.delete({
      collection: 'verification-requests',
      id,
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting verification request:', error)
    return Response.json(
      { error: 'Failed to delete verification request' },
      { status: 500 }
    )
  }
}