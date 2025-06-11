import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

// Hook to update user verification status when request is approved
const updateUserVerificationStatus: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // Only proceed if status has changed
  if (operation === 'update' && previousDoc && doc.status !== previousDoc.status) {
    try {
      const payload = req.payload

      if (doc.status === 'approved') {
        // Update the user's verification status to 'verified'
        const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            verificationStatus: 'verified',
          },
        })

        const subject = 'Identity Verification Approved'
        const htmlContent = `<p>Congratulations! Your identity verification has been approved. You can now list properties on The Real Notice Board.</p>`
        
        // Send actual email to user about approval
        try {
          await payload.sendEmail({
            to: doc.userEmail,
            subject,
            html: htmlContent,
          })
          
          // Log successful email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: doc.userEmail,
              subject,
              type: 'notification',
              status: 'sent',
              htmlContent,
              userId: doc.user,
              sentAt: new Date().toISOString(),
            },
          })
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError)
          // Log failed email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: doc.userEmail,
              subject,
              type: 'notification',
              status: 'failed',
              htmlContent,
              userId: doc.user,
              sentAt: new Date().toISOString(),
              errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
            },
          })
        }
      }

      if (doc.status === 'rejected') {
        // Update the user's verification status to 'rejected'
        await payload.update({
          collection: 'users',
          id: doc.user,
          data: {
            verificationStatus: 'rejected',
          },
        })

        const subject = 'Identity Verification Rejected'
        const htmlContent = `<p>Unfortunately, your identity verification has been rejected. Please review the feedback and submit new documents if needed.</p><p>Reason: ${doc.adminNotes || 'No specific reason provided'}</p>`
        
        // Send actual email to user about rejection
        try {
          await payload.sendEmail({
            to: doc.userEmail,
            subject,
            html: htmlContent,
          })
          
          // Log successful email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: doc.userEmail,
              subject,
              type: 'notification',
              status: 'sent',
              htmlContent,
              userId: doc.user,
              sentAt: new Date().toISOString(),
            },
          })
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError)
          // Log failed email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: doc.userEmail,
              subject,
              type: 'notification',
              status: 'failed',
              htmlContent,
              userId: doc.user,
              sentAt: new Date().toISOString(),
              errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
            },
          })
        }
      }
    } catch (error) {
      console.error('Error updating user verification status:', error)
    }
  }

  return doc
}

// Hook to notify admin when a new verification request is submitted
const notifyAdminOnSubmission: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // Notify on create or when status changes to pending (resubmission)
  const shouldNotify =
    operation === 'create' ||
    (operation === 'update' &&
      previousDoc &&
      doc.status === 'pending' &&
      previousDoc.status !== 'pending')

  if (shouldNotify) {
    try {
      const payload = req.payload

      // Get admin users
      const admins = await payload.find({
        collection: 'users',
        where: {
          role: {
            equals: 'admin',
          },
        },
      })

      const isResubmission = operation === 'update'
      const subject = isResubmission
        ? 'Identity Verification Resubmitted'
        : 'New Identity Verification Request'
      const message = isResubmission
        ? `${doc.userName} (${doc.userEmail}) has resubmitted their identity verification documents.`
        : `A new identity verification request has been submitted by ${doc.userName} (${doc.userEmail}).`
      const htmlContent = `<p>${message}</p><p>Please review the documents in the admin panel.</p>`

      // Send notification to all admins
      for (const admin of admins.docs) {
        try {
          // Send actual email to admin
          await payload.sendEmail({
            to: admin.email,
            subject,
            html: htmlContent,
          })
          
          // Log successful email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: admin.email,
              subject,
              type: 'verification-request',
              status: 'sent',
              htmlContent,
              sentAt: new Date().toISOString(),
            },
          })
        } catch (emailError) {
          console.error(`Failed to send admin notification email to ${admin.email}:`, emailError)
          // Log failed email to database
          await payload.create({
            collection: 'email-logs',
            data: {
              to: admin.email,
              subject,
              type: 'verification-request',
              status: 'failed',
              htmlContent,
              sentAt: new Date().toISOString(),
              errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
            },
          })
        }
      }
    } catch (error) {
      console.error('Error notifying admin:', error)
    }
  }

  return doc
}

export const VerificationRequests: CollectionConfig = {
  slug: 'verification-requests',
  access: {
    create: authenticated,
    read: authenticated,
    update: ({ req: { user } }) => {
      // Only admins can update verification requests
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete verification requests
      return user?.role === 'admin'
    },
  },
  admin: {
    useAsTitle: 'userName',
    defaultColumns: ['userName', 'userEmail', 'status', 'submittedAt', 'reviewedAt'],
    group: 'User Management',
  },
  hooks: {
    afterChange: [updateUserVerificationStatus, notifyAdminOnSubmission],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      label: 'User',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userName',
      type: 'text',
      required: true,
      label: 'User Name',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userEmail',
      type: 'email',
      required: true,
      label: 'User Email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'identificationDocument',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Identification Document',
      admin: {
        description: "User's ID card, passport, or driver's license",
        readOnly: true,
      },
    },
    {
      name: 'selfieWithId',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Selfie with ID',
      admin: {
        description: 'Selfie holding the identification document',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Pending Review',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Admin can change this to approve or reject the verification',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Notes about the verification decision (visible to user if rejected)',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Reviewed At',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.status !== 'pending',
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Reviewed By',
      admin: {
        readOnly: true,
        condition: (data) => data?.status !== 'pending',
      },
    },
  ],
  timestamps: true,
}
