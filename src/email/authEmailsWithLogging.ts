import { getPayload, type PayloadRequest } from 'payload'
import { generateEmailHTML, generateEmailSubject } from './generateEmailHTML'
import config from '@payload-config'
import { User } from '@/payload-types'

type VerificationEmailArgs =
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

type ForgotPasswordEmailArgs =
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

type EmailSubjectArgs =
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

// Helper function to log email to database
const logEmailToDatabase = async (emailData: {
  recipient: string
  subject: string
  type: 'verification' | 'password-reset'
  status: 'sent' | 'failed'
  htmlContent: string
  userId?: string | User | null | undefined
  errorMessage?: string
  req?: PayloadRequest
}) => {
  try {
    // This would save to your EmailLogs collection
    // You'll need to import payload and use it to create the record
    // console.log('Email logged to database:', emailData)

    // Example implementation:
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'email-logs',
      data: {
        to: emailData.recipient,
        subject: emailData.subject,
        type: emailData.type,
        status: emailData.status,
        sentAt: new Date().toISOString(),
        userId: emailData.userId,
        htmlContent: emailData.htmlContent,
        errorMessage: emailData.errorMessage,
        metadata: {
          userAgent: emailData.req?.headers?.get('user-agent'),
          ip: emailData.req?.headers.get('ip'),
        },
      },
    })
  } catch (error) {
    console.error('Failed to log email to database:', error)
  }
}

// Email verification handler with logging
export const generateVerificationEmailHTML = async (
  args: VerificationEmailArgs,
): Promise<string> => {
  const url = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify-email?token=${args?.token}`
  const user = args?.user || { email: '', name: '' }

  try {
    const htmlContent = generateEmailHTML({
      user,
      url,
      type: 'verification',
    })

    // Log successful email generation
    await logEmailToDatabase({
      recipient: user.email,
      subject: 'Verify Your Email Address',
      type: 'verification',
      status: 'sent',
      htmlContent,
      userId: user.id,
      req: args?.req,
    })

    console.log(
      `Verification email generated and logged for ${user.email} at ${new Date().toISOString()}`,
    )

    return htmlContent
  } catch (error) {
    // Log failed email generation
    // await logEmailToDatabase({
    //   recipient: user.email,
    //   subject: 'Verify Your Email Address',
    //   type: 'verification',
    //   status: 'failed',
    //   htmlContent: '',
    //   userId: user.id,
    //   errorMessage: error instanceof Error ? error.message : 'Unknown error',
    // })

    console.error(`Failed to generate verification email for ${user.email}:`, error)
    throw error
  }
}

export const generateVerificationEmailSubject = async (args: EmailSubjectArgs): Promise<string> => {
  return generateEmailSubject('verification')
}

// Password reset handler with logging
export const generatePasswordResetEmailHTML = async (
  args: ForgotPasswordEmailArgs,
): Promise<string> => {
  const resetPasswordURL = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/reset-password?token=${args?.token}`
  const user = args?.user || { email: '', name: '' }

  try {
    const htmlContent = generateEmailHTML({
      user,
      url: resetPasswordURL,
      type: 'password-reset',
    })

    // Log successful email generation
    await logEmailToDatabase({
      recipient: user.email,
      subject: 'Reset Your Password',
      type: 'password-reset',
      status: 'sent',
      htmlContent,
      userId: user.id,
    })

    console.log(
      `Password reset email generated and logged for ${user.email} at ${new Date().toISOString()}`,
    )

    return htmlContent
  } catch (error) {
    // Log failed email generation
    await logEmailToDatabase({
      recipient: user.email,
      subject: 'Reset Your Password',
      type: 'password-reset',
      status: 'failed',
      htmlContent: '',
      userId: user.id,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    console.error(`Failed to generate password reset email for ${user.email}:`, error)
    throw error
  }
}

export const generatePasswordResetEmailSubject = async (
  args: EmailSubjectArgs,
): Promise<string> => {
  return generateEmailSubject('password-reset')
}
