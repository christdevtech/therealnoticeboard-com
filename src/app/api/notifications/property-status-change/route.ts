import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Property, User } from '@/payload-types'

export async function POST(request: NextRequest) {
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

    const { propertyId, newStatus } = await request.json()

    if (!propertyId || !newStatus) {
      return NextResponse.json(
        { error: 'Property ID and new status are required' },
        { status: 400 }
      )
    }

    // Fetch the property with owner details
    const property = await payload.findByID({
      collection: 'properties',
      id: propertyId,
      depth: 2,
    }) as Property

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const owner = property.owner as User
    if (!owner || !owner.email) {
      return NextResponse.json(
        { error: 'Property owner not found or has no email' },
        { status: 400 }
      )
    }

    // Prepare email content based on status
    const statusMessages = {
      approved: {
        subject: `✅ Your property "${property.title}" has been approved!`,
        message: `Great news! Your property listing "${property.title}" has been approved and is now live on The Real Notice Board.\n\nYour property is now visible to potential buyers/renters. You can view it at: ${process.env.NEXT_PUBLIC_SERVER_URL}/properties/${property.slug}\n\nThank you for using The Real Notice Board!`,
      },
      rejected: {
        subject: `❌ Your property "${property.title}" requires attention`,
        message: `We've reviewed your property listing "${property.title}" and it requires some updates before it can be approved.\n\n${property.adminNotes ? `Admin feedback: ${property.adminNotes}` : 'Please review your listing and make necessary corrections.'}\n\nYou can edit your property in your dashboard and resubmit it for review.\n\nIf you have any questions, please contact our support team.`,
      },
      sold: {
        subject: `🏠 Your property "${property.title}" has been marked as sold/rented`,
        message: `Congratulations! Your property "${property.title}" has been marked as sold/rented.\n\nThe listing has been updated to reflect this status. Thank you for using The Real Notice Board for your property listing needs.\n\nWe hope you had a successful transaction!`,
      },
    }

    const emailContent = statusMessages[newStatus as keyof typeof statusMessages]
    
    if (!emailContent) {
      return NextResponse.json(
        { error: 'Invalid status for notification' },
        { status: 400 }
      )
    }

    // Send email using Payload's email functionality
    try {
      await payload.sendEmail({
        to: owner.email,
        subject: emailContent.subject,
        text: emailContent.message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #333; margin: 0 0 10px 0;">The Real Notice Board</h1>
              <p style="color: #666; margin: 0;">Property Status Update</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin: 0 0 15px 0;">${emailContent.subject}</h2>
              
              <div style="margin-bottom: 20px;">
                <strong>Property:</strong> ${property.title}<br>
                <strong>Type:</strong> ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}<br>
                <strong>Listing:</strong> ${property.listingType === 'sale' ? 'For Sale' : 'For Rent'}<br>
                <strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
              </div>
              
              <div style="white-space: pre-line; line-height: 1.6; color: #333;">
                ${emailContent.message.replace(/\n/g, '<br>')}
              </div>
              
              ${newStatus === 'approved' ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
                  <strong>Next Steps:</strong><br>
                  • Your property is now live and searchable<br>
                  • Monitor inquiries in your dashboard<br>
                  • Keep your contact information updated
                </div>
              ` : ''}
              
              ${newStatus === 'rejected' ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
                  <strong>What to do next:</strong><br>
                  • Review the feedback provided<br>
                  • Edit your property listing<br>
                  • Resubmit for review
                </div>
              ` : ''}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard" style="color: #007bff; text-decoration: none;">Visit Your Dashboard</a> |
                <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/contact" style="color: #007bff; text-decoration: none;">Contact Support</a>
              </p>
            </div>
          </div>
        `,
      })

      payload.logger.info(`Property status change notification sent to ${owner.email} for property ${property.id} (${property.title}) - Status: ${newStatus}`)

      return NextResponse.json(
        { 
          success: true, 
          message: 'Notification sent successfully',
          recipient: owner.email,
          propertyTitle: property.title,
          newStatus
        },
        { status: 200 }
      )
    } catch (emailError) {
      payload.logger.error('Failed to send property status change notification:', emailError)
      
      return NextResponse.json(
        { 
          error: 'Failed to send email notification',
          details: emailError instanceof Error ? emailError.message : 'Unknown email error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Property status change notification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}